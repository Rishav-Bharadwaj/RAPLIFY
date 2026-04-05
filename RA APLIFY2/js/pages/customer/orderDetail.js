// ========================== //
// Customer - Order Detail     //
// ========================== //

function renderOrderDetail(container, params = {}) {
    const order = DataStore.getOrder(params.orderId);
    if (!order) {
        container.innerHTML = UI.renderEmpty(Icons.orders, 'Order not found', 'This order may no longer exist');
        return;
    }

    const store = DataStore.getStore(order.store_id);
    const user = DataStore.getCurrentUser();
    const isCustomer = DataStore.getCurrentRole() === 'customer';
    const statusColor = Utils.getStatusColor(order.status);

    const stages = ['pending', 'accepted', 'preparing', 'ready', order.delivery_type === 'home' ? 'delivered' : 'completed'];
    const currentStageIndex = stages.indexOf(order.status);

    // Show map button for pickup orders that are ready
    const showMapBtn = order.delivery_type === 'pickup' && ['ready', 'completed'].includes(order.status) && store && user;

    container.innerHTML = `
        ${UI.renderHeader('Order #' + order.id.slice(-6), {
            showBack: true,
            actions: `
                <button class="header-icon-btn" onclick="showOrderChat('${order.id}')" id="btn-order-chat">
                    ${Icons.messageCircle}
                </button>
            `
        })}

        <div class="page-content">
            <!-- Status -->
            <div style="padding:var(--space-5);text-align:center;background:var(--gradient-primary-soft)">
                <span class="badge badge-${statusColor}" style="font-size:var(--font-sm);padding:6px 16px">
                    ${Utils.getStatusLabel(order.status)}
                </span>
                <p class="text-xs text-muted mt-2">${Utils.formatDateTime(order.updated_at)}</p>
            </div>

            <!-- Status Timeline -->
            <div style="padding:var(--space-5) var(--space-6)">
                ${stages.map((stage, i) => {
                    const isActive = i <= currentStageIndex;
                    const isCurrent = i === currentStageIndex;
                    return `
                        <div style="display:flex;gap:var(--space-3);align-items:flex-start;${i < stages.length - 1 ? 'padding-bottom:var(--space-4)' : ''}">
                            <div style="display:flex;flex-direction:column;align-items:center">
                                <div style="width:24px;height:24px;border-radius:50%;background:${isActive ? 'var(--gradient-primary)' : 'var(--neutral-200)'};display:flex;align-items:center;justify-content:center;color:white;font-size:12px;flex-shrink:0">
                                    ${isActive ? Icons.check : ''}
                                </div>
                                ${i < stages.length - 1 ? `<div style="width:2px;height:24px;background:${isActive ? 'var(--primary-300)' : 'var(--neutral-200)'}"></div>` : ''}
                            </div>
                            <div>
                                <div style="font-weight:${isCurrent ? '700' : '500'};color:${isActive ? 'var(--neutral-800)' : 'var(--neutral-400)'};font-size:var(--font-sm)">
                                    ${Utils.getStatusLabel(stage)}
                                </div>
                            </div>
                        </div>
                    `;
                }).join('')}
            </div>

            <div class="divider-thick"></div>

            <!-- Map for Shop Pickup (when ready) -->
            ${showMapBtn ? `
                <div class="checkout-section">
                    <h3 class="checkout-section-title">📍 Navigate to Store</h3>
                    <div id="order-map" style="height:300px;border-radius:var(--radius-lg);overflow:hidden;margin-bottom:var(--space-3);border:1px solid var(--neutral-100)"></div>
                    <div style="display:flex;gap:var(--space-2)">
                        <button class="btn btn-outline btn-sm" onclick="refreshOrderMap()" style="flex:1;border-radius:var(--radius-md)">
                            🔄 Refresh Location & Route
                        </button>
                    </div>
                </div>
                <div class="divider-thick"></div>
            ` : ''}

            <!-- Delivery Info -->
            <div class="checkout-section">
                <h3 class="checkout-section-title">Delivery Details</h3>
                <div class="flex items-center gap-3 mb-3">
                    <div style="width:40px;height:40px;border-radius:var(--radius-md);background:${order.delivery_type === 'home' ? 'var(--success-50)' : 'var(--warning-50)'};display:flex;align-items:center;justify-content:center">
                        ${order.delivery_type === 'home' ? Icons.truck : Icons.store}
                    </div>
                    <div>
                        <div class="font-semibold">${order.delivery_type === 'home' ? 'Home Delivery' : 'Shop Pickup'}</div>
                        <div class="text-xs text-muted">${order.delivery_type === 'home' ? order.address : (store?.location || '')}</div>
                    </div>
                </div>
            </div>

            <div class="divider-thick"></div>

            <!-- Store Info -->
            <div class="checkout-section">
                <h3 class="checkout-section-title">Ordered From</h3>
                <div class="flex items-center gap-3" onclick="${isCustomer ? `Router.navigate('store-page', {storeId:'${store?.id}'})` : ''}" style="cursor:pointer">
                    <div style="width:48px;height:48px;border-radius:var(--radius-md);background:var(--gradient-primary-soft);display:flex;align-items:center;justify-content:center;font-size:24px">
                        ${store?.emoji || '🏪'}
                    </div>
                    <div class="flex-1">
                        <div class="font-semibold">${store?.name || 'Store'}</div>
                        <div class="text-xs text-muted">${store?.location || ''}</div>
                    </div>
                    ${isCustomer ? `<span style="color:var(--neutral-300)">${Icons.chevronRight}</span>` : ''}
                </div>
            </div>

            <div class="divider-thick"></div>

            <!-- Order Items -->
            <div class="checkout-section">
                <h3 class="checkout-section-title">Order Items</h3>
                ${(order.items || []).map(item => `
                    <div style="display:flex;justify-content:space-between;align-items:center;padding:8px 0;border-bottom:1px solid var(--neutral-50)">
                        <span style="font-size:var(--font-sm)">${item.name} × ${item.quantity}</span>
                        <span style="font-size:var(--font-sm);font-weight:600">${Utils.formatPrice(item.price * item.quantity)}</span>
                    </div>
                `).join('')}
                <div style="display:flex;justify-content:space-between;align-items:center;padding:12px 0;border-top:2px solid var(--neutral-200);margin-top:var(--space-2)">
                    <span style="font-weight:700">Total</span>
                    <span style="font-weight:800;font-size:var(--font-lg);color:var(--primary-600)">${Utils.formatPrice(order.total_price)}</span>
                </div>
            </div>

            <!-- Payment -->
            <div class="checkout-section" style="padding-bottom:var(--space-8)">
                <h3 class="checkout-section-title">Payment</h3>
                <div class="flex items-center gap-2">
                    <span>💵</span>
                    <span class="text-sm">Cash on Delivery</span>
                </div>
            </div>
        </div>
    `;

    // Initialize map if needed
    if (showMapBtn) {
        setTimeout(() => {
            if (user.lat && user.lng && store.lat && store.lng) {
                GeoUtils.showMap('order-map', user.lat, user.lng, store.lat, store.lng, store.name);
            }
        }, 300);
    }
}

// Native mapping handled in GeoUtils.showMap

async function refreshOrderMap() {
    try {
        const pos = await GeoUtils.getCurrentPosition();
        const user = DataStore.getCurrentUser();
        DataStore.updateUser({ ...user, lat: pos.lat, lng: pos.lng });
        // Re-render the page
        const route = Router.getCurrentRoute();
        Router.navigate('order-detail', route?.params || {});
        UI.showToast('Location refreshed', 'success');
    } catch (err) {
        UI.showToast(err.message, 'error');
    }
}

function showOrderChat(orderId) {
    const order = DataStore.getOrder(orderId);
    const chat = DataStore.getChat(orderId);
    const user = DataStore.getCurrentUser();
    const store = DataStore.getStore(order?.store_id);
    const isCustomer = DataStore.getCurrentRole() === 'customer';

    const messagesHtml = (chat?.messages || []).map(msg => {
        const isMine = msg.sender === user?.id;
        return `
            <div class="chat-bubble ${isMine ? 'sent' : 'received'}">
                ${msg.text}
                <div class="time">${Utils.formatTime(msg.time)}</div>
            </div>
        `;
    }).join('');

    const content = `
        <div style="max-height:300px;overflow-y:auto;display:flex;flex-direction:column;gap:var(--space-2);margin-bottom:var(--space-4);padding:var(--space-2)">
            ${messagesHtml || '<p class="text-sm text-muted text-center p-4">No messages yet. Start the conversation!</p>'}
        </div>
        <div style="display:flex;gap:var(--space-2)">
            <input type="text" class="input-field" id="chat-input" placeholder="Type a message..." style="flex:1" onkeydown="if(event.key==='Enter')sendChatMessage('${orderId}')">
            <button class="chat-send-btn" onclick="sendChatMessage('${orderId}')" id="btn-send-chat">
                ${Icons.send}
            </button>
        </div>
    `;

    UI.showModal(content, { title: `Chat - ${isCustomer ? (store?.name || 'Store') : 'Customer'}` });
}

function sendChatMessage(orderId) {
    const input = document.getElementById('chat-input');
    const text = input?.value?.trim();
    if (!text) return;

    const user = DataStore.getCurrentUser();
    DataStore.sendMessage(orderId, user.id, text);

    input.value = '';
    UI.closeModal();
    showOrderChat(orderId);
    UI.showToast('Message sent!', 'success');
}
