// ========================== //
// Customer - Store Page       //
// ========================== //

function renderStorePage(container, params = {}) {
    const store = DataStore.getStore(params.storeId);
    if (!store) {
        container.innerHTML = UI.renderEmpty(Icons.store, 'Store not found', 'This store may no longer be available');
        return;
    }

    const user = DataStore.getCurrentUser();
    const products = DataStore.getProductsByStore(store.id);
    const reviews = DataStore.getReviewsByStore(store.id);
    const cart = DataStore.getCart();

    // Group products by category
    const productCategories = {};
    products.forEach(p => {
        if (!productCategories[p.category]) productCategories[p.category] = [];
        productCategories[p.category].push(p);
    });

    // Distance and delivery info
    const dist = (user?.lat && store.lat) ? GeoUtils.distance(user.lat, user.lng, store.lat, store.lng) : null;
    const canDeliver = user?.lat ? DataStore.canDeliverTo(store.id, user.lat, user.lng) : false;

    let deliveryInfo = '';
    if (store.home_delivery_enabled) {
        deliveryInfo = canDeliver
            ? `<span class="badge badge-delivery">${Icons.truck} Can Deliver to You (within ${store.delivery_radius_km} km)</span>`
            : `<span class="badge badge-pickup">${Icons.truck} Delivery available (you are outside ${store.delivery_radius_km} km range)</span>`;
    } else {
        deliveryInfo = `<span class="badge badge-pickup">${Icons.store} Pickup Only</span>`;
    }

    container.innerHTML = `
        ${UI.renderHeader(store.name, {
            showBack: true,
            actions: `
                <button class="header-icon-btn" onclick="Router.navigate('cart')" id="store-cart-btn">
                    ${Icons.cart}
                    ${DataStore.getCartCount() > 0 ? `<span class="badge">${DataStore.getCartCount()}</span>` : ''}
                </button>
            `
        })}

        <div class="page-content" style="padding-bottom:${DataStore.getCartCount() > 0 ? '140px' : '80px'}">
            <!-- Store Header -->
            <div class="store-detail-header">
                <div style="font-size:48px;margin-bottom:var(--space-3)">${store.emoji || '🏪'}</div>
                <h1 class="store-detail-name">${store.name}</h1>
                <p class="store-detail-category">${store.category}${dist !== null ? ' • ' + Utils.formatDistance(dist) + ' away' : ''}</p>
                <div class="store-detail-meta">
                    <div class="store-meta-item">
                        ${Icons.star} <strong>${store.rating || 'New'}</strong> (${store.review_count || 0})
                    </div>
                    <div class="store-meta-item">
                        ${Icons.clock} ${store.open_time || '9AM'} - ${store.close_time || '9PM'}
                    </div>
                </div>
                <div style="margin-top:var(--space-3)">
                    ${deliveryInfo}
                </div>
            </div>

            <!-- Description -->
            <div style="padding:var(--space-4)">
                <p class="text-sm text-secondary">${store.description || 'Welcome to our store!'}</p>
            </div>

            <div class="divider-thick"></div>

            <!-- Product Categories tabs -->
            <div style="padding:var(--space-3) var(--space-4) 0">
                <div class="chip-group">
                    <button class="chip active" onclick="filterStoreProducts('all', this)" id="prod-cat-all">All</button>
                    ${Object.keys(productCategories).map(cat => `
                        <button class="chip" onclick="filterStoreProducts('${cat}', this)" id="prod-cat-${cat.replace(/\s/g, '-')}">${cat}</button>
                    `).join('')}
                </div>
            </div>

            <!-- Products -->
            <div id="products-list" style="padding-top:var(--space-2)">
                ${Object.entries(productCategories).map(([cat, prods]) => `
                    <div class="product-category-group" data-category="${cat}">
                        <div class="section-title" style="font-size:var(--font-base)">${cat}</div>
                        ${prods.map(p => renderProductItem(p, store.id, cart)).join('')}
                    </div>
                `).join('')}
            </div>

            <div class="divider-thick"></div>

            <!-- Reviews Section -->
            <div class="section-title">Reviews & Ratings</div>
            <div style="padding:0 var(--space-4)">
                <div class="flex items-center gap-3 mb-4">
                    <div style="font-size:var(--font-3xl);font-weight:900;color:var(--neutral-800)">${store.rating}</div>
                    <div>
                        <div>${Utils.generateStarsSVG(store.rating, 18)}</div>
                        <div class="text-xs text-muted mt-1">${store.review_count} reviews</div>
                    </div>
                </div>

                <button class="btn btn-secondary btn-sm mb-4" onclick="showWriteReview('${store.id}')" id="btn-write-review">
                    ✍️ Write a Review
                </button>

                ${reviews.slice(0, 5).map(review => {
                    const reviewer = DataStore.getUser(review.customer_id);
                    return `
                        <div class="review-card">
                            <div class="review-header">
                                <div class="avatar avatar-sm">${Utils.getInitials(reviewer?.name || 'User')}</div>
                                <div>
                                    <div class="review-author">${reviewer?.name || 'Customer'}</div>
                                    <div class="flex items-center gap-2">
                                        <div>${Utils.generateStarsSVG(review.rating, 12)}</div>
                                        <span class="review-date">${Utils.timeAgo(review.created_at)}</span>
                                    </div>
                                </div>
                            </div>
                            <p class="review-text">${review.comment}</p>
                        </div>
                    `;
                }).join('')}
                ${reviews.length === 0 ? '<p class="text-sm text-muted p-4 text-center">No reviews yet</p>' : ''}
            </div>
        </div>

        ${DataStore.getCartCount() > 0 ? renderFloatingCartBar() : ''}
        ${UI.renderCustomerNav('search')}
    `;
}

function renderProductItem(product, storeId, cart) {
    const cartItem = cart.find(c => c.product_id === product.id);
    const isAvailable = product.available;

    // NOTE: Do NOT show product.inventory to customers!
    return `
        <div class="product-item ${!isAvailable ? 'opacity-50' : ''}" id="product-${product.id}">
            <div class="product-image">
                ${product.emoji}
            </div>
            <div class="product-info">
                <div class="product-name">${product.name}</div>
                ${isAvailable
                    ? `<div class="product-price">${Utils.formatPrice(product.price)}</div>`
                    : `<div class="product-unavailable">Currently Unavailable</div>`
                }
            </div>
            <div class="product-action">
                ${!isAvailable ? '' : cartItem
                    ? `<div class="qty-control">
                        <button class="qty-btn" onclick="event.stopPropagation();updateProductQty('${product.id}', ${cartItem.quantity - 1}, '${storeId}')">−</button>
                        <span class="qty-value">${cartItem.quantity}</span>
                        <button class="qty-btn" onclick="event.stopPropagation();updateProductQty('${product.id}', ${cartItem.quantity + 1}, '${storeId}')">+</button>
                    </div>`
                    : `<button class="btn btn-primary btn-sm" onclick="event.stopPropagation();addProductToCart('${product.id}', '${storeId}')" id="add-${product.id}">Add</button>`
                }
            </div>
        </div>
    `;
}

function addProductToCart(productId, storeId) {
    const product = DataStore.getProduct(productId);
    if (!product) return;

    const result = DataStore.addToCart(product, storeId);
    if (result.error) {
        UI.confirm('Replace Cart?', result.error + ' Would you like to clear the cart and add this item?', () => {
            DataStore.clearCart();
            DataStore.addToCart(product, storeId);
            UI.showToast('Added to cart!', 'success');
            refreshStorePage(storeId);
        });
        return;
    }

    UI.showToast(`${product.name} added to cart!`, 'success');
    refreshStorePage(storeId);
}

function updateProductQty(productId, qty, storeId) {
    DataStore.updateCartItemQty(productId, qty);
    refreshStorePage(storeId);
}

function refreshStorePage(storeId) {
    const container = document.getElementById('app-content');
    renderStorePage(container, { storeId });
}

function renderFloatingCartBar() {
    const count = DataStore.getCartCount();
    const total = DataStore.getCartTotal();
    return `
        <div style="position:fixed;bottom:76px;left:50%;transform:translateX(-50%);width:calc(100% - 32px);max-width:calc(var(--max-width) - 32px);z-index:var(--z-sticky)">
            <button class="btn btn-primary btn-block btn-lg" onclick="Router.navigate('cart')" id="floating-cart-btn" style="justify-content:space-between;padding:var(--space-4) var(--space-5)">
                <span>${count} item${count !== 1 ? 's' : ''} in cart</span>
                <span>${Utils.formatPrice(total)} →</span>
            </button>
        </div>
    `;
}

function filterStoreProducts(category, btn) {
    // Update active chip
    document.querySelectorAll('.chip-group .chip').forEach(c => c.classList.remove('active'));
    btn.classList.add('active');

    // Filter
    const groups = document.querySelectorAll('.product-category-group');
    groups.forEach(g => {
        if (category === 'all' || g.dataset.category === category) {
            g.style.display = 'block';
        } else {
            g.style.display = 'none';
        }
    });
}

function showWriteReview(storeId) {
    const user = DataStore.getCurrentUser();
    let selectedRating = 0;

    const content = document.createElement('div');
    content.innerHTML = `
        <div style="text-align:center;margin-bottom:var(--space-4)">
            <div id="review-stars" style="display:flex;gap:8px;justify-content:center;margin-bottom:var(--space-4)">
                ${[1,2,3,4,5].map(i => `
                    <button onclick="selectReviewStar(${i})" id="review-star-${i}" style="background:none;border:none;cursor:pointer;padding:4px">
                        <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#D1D5DB" stroke-width="2">
                            <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
                        </svg>
                    </button>
                `).join('')}
            </div>
        </div>
        <div class="input-group mb-4">
            <label class="input-label">Your Review</label>
            <textarea class="input-field" id="review-text" rows="4" placeholder="Tell others about your experience..." style="resize:none"></textarea>
        </div>
        <button class="btn btn-primary btn-block" onclick="submitReview('${storeId}')" id="btn-submit-review">Submit Review</button>
    `;

    UI.showModal(content, { title: 'Write a Review' });

    // Make selectReviewStar available
    window.selectReviewStar = (rating) => {
        selectedRating = rating;
        window._selectedReviewRating = rating;
        for (let i = 1; i <= 5; i++) {
            const starBtn = document.getElementById(`review-star-${i}`);
            if (starBtn) {
                starBtn.innerHTML = `<svg width="32" height="32" viewBox="0 0 24 24" fill="${i <= rating ? '#FBBF24' : 'none'}" stroke="${i <= rating ? '#FBBF24' : '#D1D5DB'}" stroke-width="2">
                    <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
                </svg>`;
            }
        }
    };

    window._selectedReviewRating = 0;
}

function submitReview(storeId) {
    const rating = window._selectedReviewRating || 0;
    const comment = document.getElementById('review-text')?.value?.trim();
    const user = DataStore.getCurrentUser();

    if (!rating) {
        UI.showToast('Please select a rating', 'error');
        return;
    }
    if (!comment) {
        UI.showToast('Please write a review', 'error');
        return;
    }

    DataStore.addReview({
        store_id: storeId,
        customer_id: user.id,
        rating,
        comment
    });

    UI.closeModal();
    UI.showToast('Review submitted! Thank you!', 'success');
    refreshStorePage(storeId);
}
