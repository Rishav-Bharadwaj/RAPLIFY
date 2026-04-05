// ========================== //
// Seller - Dashboard          //
// ========================== //

function renderSellerDashboard(container) {
    const user = DataStore.getCurrentUser();
    const stores = DataStore.getStoresByOwner(user?.id || '');
    const store = stores[0]; // Primary store

    if (!store) {
        Router.navigate('seller-store-setup', { isNew: true });
        return;
    }

    const analytics = DataStore.getStoreAnalytics(store.id);
    const recentOrders = DataStore.getOrdersByStore(store.id).slice(0, 3);
    const pendingCount = recentOrders.filter(o => o.status === 'pending').length;

    container.innerHTML = `
        ${UI.renderHeader(store.name, {
            brand: false,
            actions: `
                <button class="header-icon-btn" onclick="Router.navigate('seller-customers')" id="btn-seller-customers">
                    ${Icons.users}
                </button>
            `
        })}

        <div class="page-content">
            <!-- Welcome Banner -->
            <div style="background:var(--gradient-primary);padding:var(--space-5);margin:var(--space-4);border-radius:var(--radius-xl);color:white;position:relative;overflow:hidden">
                <div style="position:absolute;top:-20px;right:-20px;width:100px;height:100px;border-radius:50%;background:rgba(255,255,255,0.1)"></div>
                <p style="font-size:var(--font-sm);opacity:0.8;margin-bottom:var(--space-1)">Welcome back,</p>
                <h2 style="font-size:var(--font-xl);font-weight:800;margin-bottom:var(--space-3)">${user?.name || 'Seller'} 👋</h2>
                <div style="display:flex;gap:var(--space-3)">
                    <div style="background:rgba(255,255,255,0.15);padding:var(--space-2) var(--space-3);border-radius:var(--radius-md)">
                        <span style="font-size:var(--font-xs);opacity:0.7">Today's Revenue</span>
                        <div style="font-weight:800">${Utils.formatPrice(analytics.dailySales[6]?.revenue || 0)}</div>
                    </div>
                    <div style="background:rgba(255,255,255,0.15);padding:var(--space-2) var(--space-3);border-radius:var(--radius-md)">
                        <span style="font-size:var(--font-xs);opacity:0.7">Pending</span>
                        <div style="font-weight:800">${pendingCount} orders</div>
                    </div>
                </div>
            </div>

            <!-- Stats Grid -->
            <div class="dashboard-stats">
                <div class="stat-card stat-revenue animate-fadeInUp stagger-1">
                    <div class="stat-value">${Utils.formatPrice(analytics.totalRevenue)}</div>
                    <div class="stat-label">Total Revenue</div>
                    <span class="stat-change positive">↑ 12%</span>
                </div>
                <div class="stat-card stat-orders animate-fadeInUp stagger-2">
                    <div class="stat-value">${analytics.totalOrders}</div>
                    <div class="stat-label">Total Orders</div>
                    <span class="stat-change positive">↑ 8%</span>
                </div>
                <div class="stat-card stat-products animate-fadeInUp stagger-3">
                    <div class="stat-value">${analytics.totalProducts}</div>
                    <div class="stat-label">Products</div>
                </div>
                <div class="stat-card stat-reviews animate-fadeInUp stagger-4">
                    <div class="stat-value">${analytics.avgRating} ⭐</div>
                    <div class="stat-label">${analytics.totalReviews} Reviews</div>
                </div>
            </div>

            <div class="divider-thick"></div>

            <!-- Recent Orders -->
            <div class="flex items-center justify-between px-4 mt-2">
                <h3 class="section-title" style="padding:0">Recent Orders</h3>
                <button class="btn btn-ghost btn-sm" onclick="Router.navigate('seller-orders')" id="see-all-orders">View All</button>
            </div>

            <div style="padding:var(--space-2) var(--space-4)">
                ${recentOrders.length === 0 ? '<p class="text-sm text-muted text-center p-4">No orders yet</p>' : ''}
                ${recentOrders.map((order, i) => {
                    const customer = DataStore.getUser(order.customer_id);
                    return `
                        <div class="seller-order-card animate-fadeInUp stagger-${i + 1}" id="dash-order-${order.id}">
                            <div class="seller-order-header">
                                <div class="seller-order-id">#${order.id.slice(-6)}</div>
                                <span class="badge badge-${Utils.getStatusColor(order.status)}">${Utils.getStatusLabel(order.status)}</span>
                            </div>
                            <div class="seller-order-body">
                                <div class="seller-order-customer">
                                    <div class="avatar avatar-sm">${Utils.getInitials(customer?.name || 'C')}</div>
                                    <span class="seller-order-customer-name">${customer?.name || 'Customer'}</span>
                                </div>
                                <div class="seller-order-items">${order.items.map(i => `${i.name} ×${i.quantity}`).join(', ')}</div>
                                <div class="flex justify-between items-center">
                                    <span class="font-bold">${Utils.formatPrice(order.total_price)}</span>
                                    <span class="badge ${order.delivery_type === 'home' ? 'badge-delivery' : 'badge-pickup'}" style="font-size:10px">
                                        ${order.delivery_type === 'home' ? 'Home Delivery' : 'Shop Pickup'}
                                    </span>
                                </div>
                            </div>
                            ${order.status === 'pending' ? `
                                <div class="seller-order-actions">
                                    <button class="btn btn-success btn-sm flex-1" onclick="updateSellerOrderStatus('${order.id}', 'accepted')" id="accept-${order.id}">
                                        ${Icons.check} Accept
                                    </button>
                                    <button class="btn btn-danger btn-sm flex-1" onclick="updateSellerOrderStatus('${order.id}', 'rejected')" id="reject-${order.id}">
                                        ${Icons.x} Reject
                                    </button>
                                </div>
                            ` : ''}
                        </div>
                    `;
                }).join('')}
            </div>

            <!-- Quick Actions -->
            <div class="divider-thick"></div>
            <div class="section-title">Quick Actions</div>
            <div style="padding:0 var(--space-4) var(--space-4);display:grid;grid-template-columns:1fr 1fr;gap:var(--space-3)">
                <button class="card card-body text-center" onclick="Router.navigate('seller-products')" id="qa-products" style="cursor:pointer">
                    <div style="font-size:28px;margin-bottom:var(--space-2)">📦</div>
                    <span class="text-sm font-semibold">Manage Products</span>
                </button>
                <button class="card card-body text-center" onclick="Router.navigate('seller-analytics')" id="qa-analytics" style="cursor:pointer">
                    <div style="font-size:28px;margin-bottom:var(--space-2)">📊</div>
                    <span class="text-sm font-semibold">View Analytics</span>
                </button>
                <button class="card card-body text-center" onclick="Router.navigate('seller-store-setup')" id="qa-store" style="cursor:pointer">
                    <div style="font-size:28px;margin-bottom:var(--space-2)">⚙️</div>
                    <span class="text-sm font-semibold">Store Settings</span>
                </button>
                <button class="card card-body text-center" onclick="Router.navigate('seller-customers')" id="qa-customers" style="cursor:pointer">
                    <div style="font-size:28px;margin-bottom:var(--space-2)">👥</div>
                    <span class="text-sm font-semibold">Customers</span>
                </button>
            </div>
        </div>

        ${UI.renderSellerNav('dashboard')}
    `;
}

function updateSellerOrderStatus(orderId, status) {
    DataStore.updateOrderStatus(orderId, status);
    UI.showToast(`Order ${Utils.getStatusLabel(status).toLowerCase()}!`, status === 'rejected' ? 'error' : 'success');
    renderSellerDashboard(document.getElementById('app-content'));
}
