// ========================== //
// Seller - Customers          //
// ========================== //

function renderSellerCustomers(container) {
    const user = DataStore.getCurrentUser();
    const stores = DataStore.getStoresByOwner(user?.id || '');
    const store = stores[0];
    if (!store) return;

    const orders = DataStore.getOrdersByStore(store.id);

    // Build unique customer records with aggregated data
    const customerMap = {};
    orders.forEach(order => {
        const cid = order.customer_id;
        if (!customerMap[cid]) {
            const customer = DataStore.getUser(cid);
            customerMap[cid] = {
                user: customer,
                orderCount: 0,
                totalSpent: 0,
                lastOrder: null,
                orders: []
            };
        }
        customerMap[cid].orderCount += 1;
        customerMap[cid].totalSpent += order.total_price;
        customerMap[cid].orders.push(order);
        if (!customerMap[cid].lastOrder || new Date(order.created_at) > new Date(customerMap[cid].lastOrder.created_at)) {
            customerMap[cid].lastOrder = order;
        }
    });

    const customers = Object.values(customerMap).sort((a, b) => b.totalSpent - a.totalSpent);

    container.innerHTML = `
        ${UI.renderHeader('Customer Records', { showBack: true })}

        <div class="page-content">
            <!-- Summary -->
            <div style="display:flex;gap:var(--space-3);padding:var(--space-4);overflow-x:auto">
                <div style="background:var(--primary-50);padding:var(--space-3) var(--space-4);border-radius:var(--radius-lg);min-width:100px;text-align:center;flex-shrink:0">
                    <div class="font-bold text-primary">${customers.length}</div>
                    <div class="text-xs text-muted">Customers</div>
                </div>
                <div style="background:var(--success-50);padding:var(--space-3) var(--space-4);border-radius:var(--radius-lg);min-width:100px;text-align:center;flex-shrink:0">
                    <div class="font-bold text-success">${orders.length}</div>
                    <div class="text-xs text-muted">Total Orders</div>
                </div>
                <div style="background:var(--accent-50);padding:var(--space-3) var(--space-4);border-radius:var(--radius-lg);min-width:120px;text-align:center;flex-shrink:0">
                    <div class="font-bold" style="color:var(--accent-500)">${Utils.formatPrice(orders.reduce((s, o) => s + o.total_price, 0))}</div>
                    <div class="text-xs text-muted">Revenue</div>
                </div>
            </div>

            <!-- Customer List -->
            <div style="padding:0 var(--space-4)">
                ${customers.length === 0
                    ? UI.renderEmpty(Icons.users, 'No customers yet', 'Customer records will appear when orders come in')
                    : customers.map((c, i) => `
                        <div class="card mb-3 animate-fadeInUp stagger-${Math.min(i + 1, 8)}" id="customer-${c.user?.id}">
                            <div class="card-body">
                                <div class="flex items-center gap-3 mb-3">
                                    <div class="avatar">${Utils.getInitials(c.user?.name || 'C')}</div>
                                    <div class="flex-1">
                                        <div class="font-semibold">${c.user?.name || 'Customer'}</div>
                                        <div class="text-xs text-muted">${c.user?.phone || ''}</div>
                                    </div>
                                    <div style="text-align:right">
                                        <div class="font-bold text-primary">${Utils.formatPrice(c.totalSpent)}</div>
                                        <div class="text-xs text-muted">${c.orderCount} order${c.orderCount !== 1 ? 's' : ''}</div>
                                    </div>
                                </div>

                                <div class="text-xs text-muted mb-2">Last order: ${Utils.timeAgo(c.lastOrder?.created_at)}</div>

                                <button class="btn btn-outline btn-sm w-full" onclick="showCustomerOrderHistory('${c.user?.id}', '${store.id}')" id="view-history-${c.user?.id}">
                                    View Order History
                                </button>
                            </div>
                        </div>
                    `).join('')
                }
            </div>
        </div>

        ${UI.renderSellerNav('dashboard')}
    `;
}

function showCustomerOrderHistory(customerId, storeId) {
    const orders = DataStore.getOrdersByStore(storeId).filter(o => o.customer_id === customerId);
    const customer = DataStore.getUser(customerId);

    const content = `
        <div style="max-height:400px;overflow-y:auto">
            ${orders.map(order => `
                <div style="padding:var(--space-3);border-bottom:1px solid var(--neutral-100)">
                    <div class="flex justify-between items-center mb-2">
                        <div>
                            <span class="text-sm font-semibold">#${order.id.slice(-6)}</span>
                            <span class="text-xs text-muted" style="margin-left:8px">${Utils.formatDate(order.created_at)}</span>
                        </div>
                        <span class="badge badge-${Utils.getStatusColor(order.status)}">${Utils.getStatusLabel(order.status)}</span>
                    </div>
                    <div class="text-sm text-secondary mb-1">
                        ${order.items.map(i => `${i.name} ×${i.quantity}`).join(', ')}
                    </div>
                    <div class="flex justify-between items-center">
                        <span class="font-semibold">${Utils.formatPrice(order.total_price)}</span>
                        <span class="badge ${order.delivery_type === 'home' ? 'badge-delivery' : 'badge-pickup'}" style="font-size:9px">
                            ${order.delivery_type === 'home' ? 'Delivery' : 'Pickup'}
                        </span>
                    </div>
                </div>
            `).join('')}
        </div>
    `;

    UI.showModal(content, { title: `${customer?.name || 'Customer'} — Orders` });
}
