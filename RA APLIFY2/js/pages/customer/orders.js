// ========================== //
// Customer - Orders Page      //
// ========================== //

function renderCustomerOrders(container) {
    const user = DataStore.getCurrentUser();
    const orders = DataStore.getOrdersByCustomer(user?.id || '');

    container.innerHTML = `
        ${UI.renderHeader('My Orders', { showBack: false })}

        <div class="page-content">
            ${orders.length === 0
                ? UI.renderEmpty(Icons.orders, 'No orders yet', 'Place your first order from a nearby store!', `<button class="btn btn-primary" onclick="Router.navigate('store-list')">Browse Stores</button>`)
                : `<div style="padding:var(--space-4)">${orders.map((order, i) => renderOrderCard(order, i)).join('')}</div>`
            }
        </div>

        ${UI.renderCustomerNav('orders')}
    `;
}

function renderOrderCard(order, index) {
    const store = DataStore.getStore(order.store_id);
    const statusColor = Utils.getStatusColor(order.status);
    const itemsPreview = order.items.map(i => i.name).join(', ');

    return `
        <div class="order-card animate-fadeInUp stagger-${Math.min(index + 1, 8)}" onclick="Router.navigate('order-detail', {orderId:'${order.id}'})" id="order-card-${order.id}">
            <div class="order-card-header">
                <div>
                    <div class="order-store-name">${store?.name || 'Store'}</div>
                    <div class="order-date">${Utils.formatDate(order.created_at)}</div>
                </div>
                <span class="badge badge-${statusColor}">${Utils.getStatusLabel(order.status)}</span>
            </div>
            <div class="order-items-preview truncate">${itemsPreview}</div>
            <div class="order-card-footer">
                <div class="order-total">${Utils.formatPrice(order.total_price)}</div>
                <div class="flex items-center gap-2">
                    <span class="badge ${order.delivery_type === 'home' ? 'badge-delivery' : 'badge-pickup'}" style="font-size:10px">
                        ${order.delivery_type === 'home' ? `${Icons.truck} Home Delivery` : `${Icons.store} Pickup`}
                    </span>
                </div>
            </div>
        </div>
    `;
}
