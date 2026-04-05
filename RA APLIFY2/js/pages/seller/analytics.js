// ========================== //
// Seller - Analytics          //
// ========================== //

function renderSellerAnalytics(container) {
    const user = DataStore.getCurrentUser();
    const stores = DataStore.getStoresByOwner(user?.id || '');
    const store = stores[0];
    if (!store) return;

    const analytics = DataStore.getStoreAnalytics(store.id);
    const maxDailyRevenue = Math.max(...analytics.dailySales.map(d => d.revenue), 1);

    container.innerHTML = `
        ${UI.renderHeader('Analytics', { showBack: false })}

        <div class="page-content">
            <!-- Period Selector -->
            <div style="padding:var(--space-3) var(--space-4)">
                <div class="tabs">
                    <button class="tab active">This Week</button>
                    <button class="tab">This Month</button>
                    <button class="tab">All Time</button>
                </div>
            </div>

            <!-- Key Metrics -->
            <div class="dashboard-stats">
                <div class="stat-card stat-revenue animate-fadeInUp stagger-1">
                    <div class="stat-value">${Utils.formatPrice(analytics.totalRevenue)}</div>
                    <div class="stat-label">Total Revenue</div>
                    <span class="stat-change positive">↑ 12%</span>
                </div>
                <div class="stat-card stat-orders animate-fadeInUp stagger-2">
                    <div class="stat-value">${analytics.totalOrders}</div>
                    <div class="stat-label">Orders</div>
                    <span class="stat-change positive">↑ 8%</span>
                </div>
                <div class="stat-card stat-products animate-fadeInUp stagger-3">
                    <div class="stat-value">${analytics.completedOrders}</div>
                    <div class="stat-label">Completed</div>
                </div>
                <div class="stat-card stat-reviews animate-fadeInUp stagger-4">
                    <div class="stat-value">${analytics.avgRating} ⭐</div>
                    <div class="stat-label">Avg Rating</div>
                </div>
            </div>

            <!-- Daily Sales Chart -->
            <div style="padding:var(--space-4)">
                <div class="chart-container animate-fadeInUp stagger-5">
                    <div class="chart-title">Daily Sales (Last 7 Days)</div>
                    <div class="bar-chart" style="padding-bottom:30px">
                        ${analytics.dailySales.map((day, i) => {
                            const height = maxDailyRevenue > 0 ? Math.max((day.revenue / maxDailyRevenue) * 130, 8) : 8;
                            return `
                                <div class="bar" style="height:${height}px;animation-delay:${i * 0.1}s;opacity:${day.revenue > 0 ? 1 : 0.3}">
                                    <span class="bar-value">${day.revenue > 0 ? '₹' + day.revenue : ''}</span>
                                    <span class="bar-label">${day.day}</span>
                                </div>
                            `;
                        }).join('')}
                    </div>
                </div>
            </div>

            <!-- Popular Products -->
            <div style="padding:0 var(--space-4) var(--space-4)">
                <div class="chart-container animate-fadeInUp stagger-6">
                    <div class="chart-title">🔥 Popular Products</div>
                    ${analytics.popularProducts.length === 0
                        ? '<p class="text-sm text-muted text-center p-3">No data yet</p>'
                        : analytics.popularProducts.map((prod, i) => {
                            const maxCount = analytics.popularProducts[0]?.count || 1;
                            const width = (prod.count / maxCount) * 100;
                            return `
                                <div style="margin-bottom:var(--space-3)">
                                    <div class="flex justify-between items-center mb-1">
                                        <span class="text-sm font-medium truncate" style="max-width:70%">${prod.name}</span>
                                        <span class="text-xs font-bold text-primary">${prod.count} sold</span>
                                    </div>
                                    <div class="progress-bar">
                                        <div class="progress-fill" style="width:${width}%"></div>
                                    </div>
                                </div>
                            `;
                        }).join('')
                    }
                </div>
            </div>

            <!-- Order Split -->
            <div style="padding:0 var(--space-4) var(--space-4)">
                <div class="chart-container animate-fadeInUp stagger-7">
                    <div class="chart-title">📊 Order Breakdown</div>
                    ${(() => {
                        const orders = DataStore.getOrdersByStore(store.id);
                        const homeOrders = orders.filter(o => o.delivery_type === 'home').length;
                        const pickupOrders = orders.filter(o => o.delivery_type === 'pickup').length;
                        const total = orders.length || 1;
                        return `
                            <div class="flex gap-4 items-center">
                                <div style="flex:1">
                                    <div class="flex justify-between mb-1">
                                        <span class="text-sm">🚚 Home Delivery</span>
                                        <span class="text-sm font-bold">${homeOrders}</span>
                                    </div>
                                    <div class="progress-bar mb-3">
                                        <div class="progress-fill" style="width:${(homeOrders / total) * 100}%;background:var(--success-400)"></div>
                                    </div>
                                    <div class="flex justify-between mb-1">
                                        <span class="text-sm">🏪 Shop Pickup</span>
                                        <span class="text-sm font-bold">${pickupOrders}</span>
                                    </div>
                                    <div class="progress-bar">
                                        <div class="progress-fill" style="width:${(pickupOrders / total) * 100}%;background:var(--warning-400)"></div>
                                    </div>
                                </div>
                            </div>
                        `;
                    })()}
                </div>
            </div>

            <!-- Order Status Distribution -->
            <div style="padding:0 var(--space-4) var(--space-4)">
                <div class="chart-container animate-fadeInUp stagger-8">
                    <div class="chart-title">📋 Order Status</div>
                    ${(() => {
                        const orders = DataStore.getOrdersByStore(store.id);
                        const statuses = ['pending', 'accepted', 'preparing', 'ready', 'delivered', 'completed', 'rejected'];
                        return statuses.map(status => {
                            const count = orders.filter(o => o.status === status).length;
                            if (count === 0) return '';
                            return `
                                <div class="flex items-center justify-between py-2" style="border-bottom:1px solid var(--neutral-50)">
                                    <div class="flex items-center gap-2">
                                        <span class="badge badge-${Utils.getStatusColor(status)}">${Utils.getStatusLabel(status)}</span>
                                    </div>
                                    <span class="font-bold text-sm">${count}</span>
                                </div>
                            `;
                        }).join('');
                    })()}
                </div>
            </div>
        </div>

        ${UI.renderSellerNav('analytics')}
    `;
}
