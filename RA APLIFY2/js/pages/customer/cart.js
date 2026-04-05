// ========================== //
// Customer - Cart Page        //
// ========================== //

function renderCart(container) {
    const cart = DataStore.getCart();
    const cartTotal = DataStore.getCartTotal();

    if (cart.length === 0) {
        container.innerHTML = `
            ${UI.renderHeader('My Cart', { showBack: true })}
            <div class="page-content">
                ${UI.renderEmpty(
                    Icons.cart,
                    'Your cart is empty',
                    'Browse stores and add items to your cart',
                    `<button class="btn btn-primary" onclick="Router.navigate('store-list')" id="browse-stores-btn">Browse Stores</button>`
                )}
            </div>
            ${UI.renderCustomerNav('cart')}
        `;
        return;
    }

    const store = DataStore.getStore(cart[0].store_id);

    container.innerHTML = `
        ${UI.renderHeader('My Cart', {
            showBack: true,
            actions: `<button class="header-icon-btn" onclick="clearCartConfirm()" style="color:var(--error-500)" id="clear-cart-btn">${Icons.trash}</button>`
        })}

        <div class="page-content" style="padding-bottom:220px">
            <!-- Store Info -->
            <div style="padding:var(--space-4);display:flex;align-items:center;gap:var(--space-3);border-bottom:1px solid var(--neutral-100)">
                <div style="width:44px;height:44px;border-radius:var(--radius-md);background:var(--gradient-primary-soft);display:flex;align-items:center;justify-content:center;font-size:22px">
                    ${store?.emoji || '🏪'}
                </div>
                <div style="flex:1">
                    <div class="font-semibold text-dark">${store?.name || 'Store'}</div>
                    <div class="text-xs text-muted">${cart.length} item${cart.length !== 1 ? 's' : ''}</div>
                </div>
            </div>

            <!-- Cart Items -->
            ${cart.map(item => `
                <div class="cart-item" id="cart-item-${item.product_id}" style="padding:var(--space-4);border-bottom:1px solid var(--neutral-50);display:flex;align-items:center;gap:var(--space-3)">
                    <div style="width:48px;height:48px;border-radius:var(--radius-md);background:var(--gradient-primary-soft);display:flex;align-items:center;justify-content:center;font-size:22px;flex-shrink:0">
                        ${item.emoji}
                    </div>
                    <div style="flex:1;min-width:0">
                        <div style="font-weight:600;color:var(--neutral-800);font-size:var(--font-sm)">${item.name}</div>
                        <div style="color:var(--primary-500);font-weight:700;font-size:var(--font-sm);margin-top:2px">${Utils.formatPrice(item.price * item.quantity)}</div>
                        <div style="color:var(--neutral-400);font-size:11px">${Utils.formatPrice(item.price)} each</div>
                    </div>
                    <div class="qty-control" style="display:flex;align-items:center;gap:8px;background:var(--neutral-50);border-radius:var(--radius-lg);padding:4px">
                        <button class="qty-btn" onclick="updateCartItem('${item.product_id}', ${item.quantity - 1})" style="width:32px;height:32px;border-radius:50%;border:none;background:white;display:flex;align-items:center;justify-content:center;cursor:pointer;box-shadow:var(--shadow-sm);font-size:16px;font-weight:700;color:var(--error-500)">−</button>
                        <span style="font-weight:700;font-size:var(--font-sm);min-width:20px;text-align:center">${item.quantity}</span>
                        <button class="qty-btn" onclick="updateCartItem('${item.product_id}', ${item.quantity + 1})" style="width:32px;height:32px;border-radius:50%;border:none;background:var(--primary-500);color:white;display:flex;align-items:center;justify-content:center;cursor:pointer;box-shadow:var(--shadow-sm);font-size:16px;font-weight:700">+</button>
                    </div>
                </div>
            `).join('')}

            <!-- Add more items -->
            <div style="padding:var(--space-3) var(--space-4)">
                <button class="btn btn-ghost btn-sm w-full" onclick="Router.navigate('store-page', {storeId:'${cart[0].store_id}'})" id="add-more-btn" style="border:1px dashed var(--neutral-200);border-radius:var(--radius-lg);color:var(--primary-500)">
                    ${Icons.plus} Add more items from this store
                </button>
            </div>
        </div>

        <!-- Cart Summary -->
        <div class="cart-summary" style="position:fixed;bottom:64px;left:0;right:0;max-width:480px;margin:0 auto;background:white;border-top:1px solid var(--neutral-100);padding:var(--space-4);z-index:90;box-shadow:0 -4px 12px rgba(0,0,0,0.05)">
            <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:var(--space-2)">
                <span style="color:var(--neutral-500);font-size:var(--font-sm)">Subtotal</span>
                <span style="font-size:var(--font-sm)">${Utils.formatPrice(cartTotal)}</span>
            </div>
            <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:var(--space-3)">
                <span style="font-weight:700;font-size:var(--font-md)">Total</span>
                <span style="font-weight:800;font-size:var(--font-lg);color:var(--primary-600)">${Utils.formatPrice(cartTotal)}</span>
            </div>
            <button class="btn btn-primary btn-block btn-lg" onclick="Router.navigate('checkout')" id="proceed-checkout-btn" style="border-radius:var(--radius-lg)">
                Proceed to Checkout • ${Utils.formatPrice(cartTotal)}
            </button>
        </div>

        ${UI.renderCustomerNav('cart')}
    `;
}

function updateCartItem(productId, qty) {
    DataStore.updateCartItemQty(productId, qty);
    renderCart(document.getElementById('app-content'));
}

function clearCartConfirm() {
    UI.confirm('Clear Cart?', 'Are you sure you want to remove all items from your cart?', () => {
        DataStore.clearCart();
        renderCart(document.getElementById('app-content'));
        UI.showToast('Cart cleared', 'success');
    });
}
