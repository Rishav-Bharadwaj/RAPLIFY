// ========================== //
// Customer - Checkout Page    //
// ========================== //

let _selectedDeliveryType = '';
let _checkoutLat = 0;
let _checkoutLng = 0;

function renderCheckout(container) {
    const cart = DataStore.getCart();
    const user = DataStore.getCurrentUser();
    const cartTotal = DataStore.getCartTotal();

    if (cart.length === 0) {
        Router.navigate('cart');
        return;
    }

    const store = DataStore.getStore(cart[0].store_id);
    const canHomeDeliver = store?.home_delivery_enabled || false;
    _selectedDeliveryType = '';
    _checkoutLat = user?.lat || 0;
    _checkoutLng = user?.lng || 0;

    // Check if store can actually deliver to user's current location
    const inDeliveryRange = canHomeDeliver && user?.lat
        ? DataStore.canDeliverTo(store.id, user.lat, user.lng)
        : false;

    container.innerHTML = `
        ${UI.renderHeader('Checkout', { showBack: true })}

        <div class="page-content" style="padding-bottom:180px">
            <!-- Delivery Type Selection -->
            <div class="checkout-section">
                <h3 class="checkout-section-title">Select Delivery Type *</h3>

                <div class="delivery-option ${canHomeDeliver && inDeliveryRange ? '' : 'disabled'}" id="delivery-home" onclick="${canHomeDeliver && inDeliveryRange ? "selectDeliveryType('home')" : ''}">
                    <div class="delivery-radio"></div>
                    <div class="delivery-option-info">
                        <h4>${Icons.truck} Home Delivery</h4>
                        ${canHomeDeliver
                            ? (inDeliveryRange
                                ? `<p>Available • Store delivers within ${store.delivery_radius_km} km</p>`
                                : `<p style="color:var(--error-500)">You are outside the delivery range (${store.delivery_radius_km} km). Change your location below.</p>`)
                            : `<p style="color:var(--error-500)">Home delivery not available for this shop</p>`
                        }
                    </div>
                </div>

                <div class="delivery-option" id="delivery-pickup" onclick="selectDeliveryType('pickup')">
                    <div class="delivery-radio"></div>
                    <div class="delivery-option-info">
                        <h4>${Icons.store} Shop Pickup</h4>
                        <p>Pick up from ${store?.name}</p>
                    </div>
                </div>
            </div>

            <!-- Delivery Address (shown if home delivery selected) -->
            <div class="checkout-section" id="address-section" style="display:none">
                <h3 class="checkout-section-title">Delivery Address</h3>
                <div class="input-group mb-3">
                    <textarea class="input-field" id="delivery-address" rows="2" placeholder="Enter your full delivery address...">${user?.address || ''}</textarea>
                </div>
                <div style="display:flex;gap:var(--space-2)">
                    <button class="btn btn-ghost btn-sm" onclick="autoDetectCheckoutLocation()" id="btn-checkout-detect" style="flex:1;border:1px dashed var(--primary-200);color:var(--primary-600);border-radius:var(--radius-md);padding:10px;font-size:12px">
                        📍 Auto-detect location
                    </button>
                    <button class="btn btn-ghost btn-sm" onclick="changeCheckoutLocation()" id="btn-checkout-change" style="flex:1;border:1px dashed var(--neutral-200);color:var(--neutral-600);border-radius:var(--radius-md);padding:10px;font-size:12px">
                        ✏️ Enter different address
                    </button>
                </div>
                <input type="hidden" id="checkout-lat" value="${user?.lat || ''}">
                <input type="hidden" id="checkout-lng" value="${user?.lng || ''}">
            </div>

            <!-- Order Summary -->
            <div class="checkout-section">
                <h3 class="checkout-section-title">Order Summary</h3>
                <div style="display:flex;align-items:center;gap:var(--space-3);margin-bottom:var(--space-3)">
                    <span style="font-size:24px">${store?.emoji || '🏪'}</span>
                    <div>
                        <div class="font-semibold text-dark">${store?.name}</div>
                        <div class="text-xs text-muted">${cart.length} item${cart.length !== 1 ? 's' : ''}</div>
                    </div>
                </div>
                ${cart.map(item => `
                    <div style="display:flex;justify-content:space-between;align-items:center;padding:8px 0;border-bottom:1px solid var(--neutral-50)">
                        <div style="display:flex;align-items:center;gap:8px">
                            <span>${item.emoji}</span>
                            <span style="font-size:var(--font-sm)">${item.name} × ${item.quantity}</span>
                        </div>
                        <span style="font-size:var(--font-sm);font-weight:600">${Utils.formatPrice(item.price * item.quantity)}</span>
                    </div>
                `).join('')}
            </div>

            <!-- Payment Method -->
            <div class="checkout-section">
                <h3 class="checkout-section-title">Payment Method</h3>
                <div class="delivery-option selected" style="cursor:default">
                    <div class="delivery-radio"></div>
                    <div class="delivery-option-info">
                        <h4>💵 Cash on Delivery (COD)</h4>
                        <p>Pay when order is delivered or picked up</p>
                    </div>
                </div>
            </div>
        </div>

        <!-- Place Order -->
        <div style="position:fixed;bottom:0;left:0;right:0;max-width:480px;margin:0 auto;background:white;border-top:1px solid var(--neutral-100);padding:var(--space-4);z-index:90;box-shadow:0 -4px 12px rgba(0,0,0,0.05)">
            <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:var(--space-3)">
                <span style="font-weight:700;font-size:var(--font-md)">Total</span>
                <span style="font-weight:800;font-size:var(--font-lg);color:var(--primary-600)">${Utils.formatPrice(cartTotal)}</span>
            </div>
            <button class="btn btn-primary btn-block btn-lg" onclick="placeOrder()" id="place-order-btn" style="border-radius:var(--radius-lg)">
                Place Order • ${Utils.formatPrice(cartTotal)}
            </button>
        </div>
    `;
}

function selectDeliveryType(type) {
    _selectedDeliveryType = type;
    document.querySelectorAll('.delivery-option').forEach(el => el.classList.remove('selected'));
    const selected = document.getElementById(`delivery-${type}`);
    if (selected) selected.classList.add('selected');

    const addressSection = document.getElementById('address-section');
    if (addressSection) {
        addressSection.style.display = type === 'home' ? 'block' : 'none';
    }
}

async function autoDetectCheckoutLocation() {
    const btn = document.getElementById('btn-checkout-detect');
    btn.innerHTML = `<span class="spinner" style="width:12px;height:12px;border-width:2px;display:inline-block"></span> Detecting...`;
    btn.disabled = true;

    try {
        const pos = await GeoUtils.getCurrentPosition();
        _checkoutLat = pos.lat;
        _checkoutLng = pos.lng;
        document.getElementById('checkout-lat').value = pos.lat;
        document.getElementById('checkout-lng').value = pos.lng;

        const address = await GeoUtils.reverseGeocode(pos.lat, pos.lng);
        document.getElementById('delivery-address').value = address;

        btn.innerHTML = '✅ Location detected';
        btn.style.color = 'var(--success-600)';

        // Re-check if store can deliver to this new location
        const cart = DataStore.getCart();
        const store = DataStore.getStore(cart[0]?.store_id);
        if (store && store.home_delivery_enabled) {
            const canDeliver = DataStore.canDeliverTo(store.id, pos.lat, pos.lng);
            if (!canDeliver) {
                UI.showToast(`This location is outside ${store.name}'s delivery range (${store.delivery_radius_km} km)`, 'warning');
            }
        }
    } catch (err) {
        btn.innerHTML = '📍 Auto-detect location';
        btn.disabled = false;
        UI.showToast(err.message, 'error');
    }
}

function changeCheckoutLocation() {
    const addressField = document.getElementById('delivery-address');
    addressField.value = '';
    addressField.focus();
    UI.showToast('Enter your new delivery address and detect location', 'default');
}

function placeOrder() {
    const user = DataStore.getCurrentUser();
    const cart = DataStore.getCart();

    if (!_selectedDeliveryType) {
        UI.showToast('Please select a delivery type', 'error');
        return;
    }

    let address = '';
    if (_selectedDeliveryType === 'home') {
        address = document.getElementById('delivery-address')?.value?.trim();
        if (!address) {
            UI.showToast('Please enter your delivery address', 'error');
            return;
        }

        // Check delivery range
        const lat = parseFloat(document.getElementById('checkout-lat')?.value) || _checkoutLat;
        const lng = parseFloat(document.getElementById('checkout-lng')?.value) || _checkoutLng;
        const store = DataStore.getStore(cart[0].store_id);
        if (store && lat && lng) {
            const dist = GeoUtils.distance(store.lat, store.lng, lat, lng);
            if (dist > store.delivery_radius_km) {
                UI.showToast(`Delivery not available. You are ${Utils.formatDistance(dist)} away (max ${store.delivery_radius_km} km)`, 'error');
                return;
            }
        }
    }

    const btn = document.getElementById('place-order-btn');
    btn.innerHTML = `<span class="spinner" style="width:20px;height:20px;border-width:2px;display:inline-block"></span> Placing order...`;
    btn.disabled = true;

    setTimeout(() => {
        const order = DataStore.createOrder({
            customer_id: user.id,
            store_id: cart[0].store_id,
            total_price: DataStore.getCartTotal(),
            delivery_type: _selectedDeliveryType,
            address,
            delivery_lat: _checkoutLat,
            delivery_lng: _checkoutLng,
            items: cart.map(c => ({
                product_id: c.product_id,
                name: c.name,
                price: c.price,
                quantity: c.quantity
            }))
        });

        // Show success
        const container = document.getElementById('app-content');
        container.innerHTML = `
            <div style="min-height:100vh;display:flex;flex-direction:column;align-items:center;justify-content:center;padding:var(--space-8);text-align:center;background:white">
                <div style="width:100px;height:100px;border-radius:50%;background:var(--success-50);display:flex;align-items:center;justify-content:center;margin-bottom:var(--space-6);animation:scaleIn 0.5s ease">
                    <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="var(--success-500)" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
                        <polyline points="20 6 9 17 4 12"/>
                    </svg>
                </div>
                <h2 style="font-size:var(--font-2xl);font-weight:800;color:var(--neutral-800);margin-bottom:var(--space-2)">Order Placed! 🎉</h2>
                <p style="color:var(--neutral-400);margin-bottom:var(--space-2)">Order #${order.id.slice(-8)}</p>
                <p style="color:var(--neutral-500);font-size:var(--font-sm);margin-bottom:var(--space-8)">
                    ${_selectedDeliveryType === 'home' ? 'Your order will be delivered to your address' : 'Pick up your order from the store'}
                </p>
                <button class="btn btn-primary btn-lg" onclick="Router.navigate('order-detail', {orderId:'${order.id}'})" id="view-order-btn" style="min-width:200px">
                    View Order
                </button>
                <button class="btn btn-ghost mt-3" onclick="Router.navigate('customer-home')" id="go-home-btn">
                    Continue Shopping
                </button>
            </div>
        `;
    }, 1200);
}
