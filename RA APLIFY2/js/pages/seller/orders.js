// ========================== //
// Seller - Orders             //
// ========================== //

function renderSellerOrders(container) {
    const user = DataStore.getCurrentUser();
    const stores = DataStore.getStoresByOwner(user?.id || '');
    const store = stores[0];
    if (!store) return;

    const allOrders = DataStore.getOrdersByStore(store.id);
    let _sellerOrderTab = 'all';

    container.innerHTML = `
        ${UI.renderHeader('Orders', { showBack: false })}

        <div class="page-content">
            <!-- Tabs -->
            <div style="padding:var(--space-3) var(--space-4)">
                <div class="tabs" id="seller-order-tabs">
                    <button class="tab active" onclick="filterSellerOrders('all', this)" id="tab-all">All (${allOrders.length})</button>
                    <button class="tab" onclick="filterSellerOrders('pending', this)" id="tab-pending">Pending (${allOrders.filter(o => o.status === 'pending').length})</button>
                    <button class="tab" onclick="filterSellerOrders('active', this)" id="tab-active">Active</button>
                    <button class="tab" onclick="filterSellerOrders('completed', this)" id="tab-completed">Done</button>
                </div>
            </div>

            <!-- Orders List -->
            <div style="padding:var(--space-2) var(--space-4)" id="seller-orders-list">
                ${allOrders.length === 0
                    ? UI.renderEmpty(Icons.orders, 'No orders yet', 'Orders from customers will appear here')
                    : allOrders.map((order, i) => renderSellerOrderCard(order, i)).join('')
                }
            </div>
        </div>

        ${UI.renderSellerNav('orders')}
    `;
}

function renderSellerOrderCard(order, index) {
    const customer = DataStore.getUser(order.customer_id);
    const statusColor = Utils.getStatusColor(order.status);

    // Determine available actions based on status
    let actionsHtml = '';
    switch (order.status) {
        case 'pending':
            actionsHtml = `
                <button class="btn btn-success btn-sm flex-1" onclick="changeOrderStatus('${order.id}', 'accepted')">
                    ${Icons.check} Accept
                </button>
                <button class="btn btn-danger btn-sm flex-1" onclick="changeOrderStatus('${order.id}', 'rejected')">
                    ${Icons.x} Reject
                </button>
            `;
            break;
        case 'accepted':
            actionsHtml = `
                <button class="btn btn-primary btn-sm flex-1" onclick="changeOrderStatus('${order.id}', 'preparing')">
                    🍳 Start Preparing
                </button>
            `;
            break;
        case 'preparing':
            actionsHtml = `
                <button class="btn btn-success btn-sm flex-1" onclick="changeOrderStatus('${order.id}', 'ready')">
                    ✅ Mark Ready
                </button>
            `;
            break;
        case 'ready':
            if (order.delivery_type === 'home') {
                actionsHtml = `
                    <button class="btn btn-success btn-sm flex-1" onclick="changeOrderStatus('${order.id}', 'delivered')">
                        🚚 Mark Delivered
                    </button>
                `;
            } else {
                actionsHtml = `
                    <button class="btn btn-success btn-sm flex-1" onclick="changeOrderStatus('${order.id}', 'completed')">
                        ✅ Mark Completed
                    </button>
                `;
            }
            break;
    }

    return `
        <div class="seller-order-card animate-fadeInUp stagger-${Math.min(index + 1, 8)}" id="so-${order.id}">
            <div class="seller-order-header">
                <div>
                    <div class="seller-order-id">#${order.id.slice(-6)}</div>
                    <div class="text-xs text-muted">${Utils.formatDateTime(order.created_at)}</div>
                </div>
                <span class="badge badge-${statusColor}">${Utils.getStatusLabel(order.status)}</span>
            </div>
            <div class="seller-order-body">
                <div class="seller-order-customer">
                    <div class="avatar avatar-sm">${Utils.getInitials(customer?.name || 'C')}</div>
                    <div>
                        <span class="seller-order-customer-name">${customer?.name || 'Customer'}</span>
                        <div class="text-xs text-muted">${customer?.phone || ''}</div>
                    </div>
                </div>
                <div class="seller-order-items">
                    ${order.items.map(i => `<div class="text-sm">• ${i.name} × ${i.quantity} — ${Utils.formatPrice(i.price * i.quantity)}</div>`).join('')}
                </div>
                <div class="flex justify-between items-center mt-2">
                    <span class="font-bold text-lg">${Utils.formatPrice(order.total_price)}</span>
                    <span class="badge ${order.delivery_type === 'home' ? 'badge-delivery' : 'badge-pickup'}" style="font-size:10px">
                        ${order.delivery_type === 'home' ? `${Icons.truck} Home Delivery` : `${Icons.store} Shop Pickup`}
                    </span>
                </div>
                ${order.delivery_type === 'home' && order.address ? `
                    <div style="margin-top:var(--space-2);padding:var(--space-2) var(--space-3);background:var(--neutral-50);border-radius:var(--radius-md)">
                        <div class="text-xs text-muted">Delivery Address:</div>
                        <div class="text-sm">${order.address}</div>
                    </div>
                ` : ''}
            </div>
            ${actionsHtml ? `
                <div class="seller-order-actions">
                    ${actionsHtml}
                    <button class="btn btn-ghost btn-sm" onclick="showOrderChat('${order.id}')" title="Chat">
                        ${Icons.messageCircle}
                    </button>
                    <button class="btn btn-ghost btn-sm" onclick="showInvoice('${order.id}')" title="Invoice">
                        ${Icons.receipt}
                    </button>
                </div>
            ` : `
                <div class="seller-order-actions">
                    <button class="btn btn-ghost btn-sm flex-1" onclick="showOrderChat('${order.id}')">
                        ${Icons.messageCircle} Chat
                    </button>
                    <button class="btn btn-ghost btn-sm flex-1" onclick="showInvoice('${order.id}')">
                        ${Icons.receipt} Invoice
                    </button>
                </div>
            `}
        </div>
    `;
}

function changeOrderStatus(orderId, status) {
    DataStore.updateOrderStatus(orderId, status);
    UI.showToast(`Order ${Utils.getStatusLabel(status).toLowerCase()}!`, 'success');
    renderSellerOrders(document.getElementById('app-content'));
}

function filterSellerOrders(filter, btn) {
    const user = DataStore.getCurrentUser();
    const stores = DataStore.getStoresByOwner(user?.id || '');
    const store = stores[0];
    if (!store) return;

    let orders = DataStore.getOrdersByStore(store.id);

    if (filter === 'pending') {
        orders = orders.filter(o => o.status === 'pending');
    } else if (filter === 'active') {
        orders = orders.filter(o => ['accepted', 'preparing', 'ready'].includes(o.status));
    } else if (filter === 'completed') {
        orders = orders.filter(o => ['delivered', 'completed', 'rejected', 'cancelled'].includes(o.status));
    }

    // Update tabs
    document.querySelectorAll('#seller-order-tabs .tab').forEach(t => t.classList.remove('active'));
    btn.classList.add('active');

    // Update list
    const list = document.getElementById('seller-orders-list');
    if (list) {
        list.innerHTML = orders.length === 0
            ? UI.renderEmpty(Icons.orders, 'No orders', 'No orders in this category')
            : orders.map((o, i) => renderSellerOrderCard(o, i)).join('');
    }
}

function showInvoice(orderId) {
    const order = DataStore.getOrder(orderId);
    if (!order) return;

    const store = DataStore.getStore(order.store_id);
    const customer = DataStore.getUser(order.customer_id);

    const content = `
        <div class="invoice-container">
            <div class="invoice-header">
                <h2>RAPLIFY</h2>
                <p class="text-sm text-muted">${store?.name || 'Store'}</p>
                <p class="text-xs text-muted">${store?.location || ''}</p>
            </div>

            <div class="flex justify-between mb-4">
                <div>
                    <div class="text-xs text-muted">Invoice To</div>
                    <div class="text-sm font-semibold">${customer?.name || 'Customer'}</div>
                    <div class="text-xs text-muted">${customer?.phone || ''}</div>
                </div>
                <div style="text-align:right">
                    <div class="text-xs text-muted">Order #${order.id.slice(-6)}</div>
                    <div class="text-xs text-muted">${Utils.formatDate(order.created_at)}</div>
                    <div class="badge ${order.delivery_type === 'home' ? 'badge-delivery' : 'badge-pickup'}" style="font-size:9px;margin-top:4px">
                        ${order.delivery_type === 'home' ? 'Home Delivery' : 'Pickup'}
                    </div>
                </div>
            </div>

            <table class="invoice-table">
                <thead>
                    <tr>
                        <th>Item</th>
                        <th style="text-align:center">Qty</th>
                        <th style="text-align:right">Price</th>
                        <th style="text-align:right">Total</th>
                    </tr>
                </thead>
                <tbody>
                    ${order.items.map(item => `
                        <tr>
                            <td>${item.name}</td>
                            <td style="text-align:center">${item.quantity}</td>
                            <td style="text-align:right">${Utils.formatPrice(item.price)}</td>
                            <td style="text-align:right">${Utils.formatPrice(item.price * item.quantity)}</td>
                        </tr>
                    `).join('')}
                </tbody>
            </table>

            <div class="invoice-total">
                <span>Grand Total</span>
                <span>${Utils.formatPrice(order.total_price)}</span>
            </div>

            <p class="text-xs text-muted text-center mt-4">Payment: Cash on Delivery</p>
            <p class="text-xs text-muted text-center mt-1">Thank you for shopping with us!</p>
        </div>
    `;

    UI.showModal(content, { title: 'Invoice' });
}
