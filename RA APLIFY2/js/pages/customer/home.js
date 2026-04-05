// ========================== //
// Customer - Home Page        //
// ========================== //

function renderCustomerHome(container) {
    const user = DataStore.getCurrentUser();
    const categories = DataStore.getCategories();
    const userLat = user?.lat || 0;
    const userLng = user?.lng || 0;

    // Get ALL stores sorted by distance
    let allStores = DataStore.getStores().map(s => {
        s._distance = (userLat && userLng && s.lat && s.lng)
            ? GeoUtils.distance(userLat, userLng, s.lat, s.lng) : 999;
        return s;
    }).sort((a, b) => a._distance - b._distance);

    // Nearby (within 5km)
    const nearbyStores = allStores.filter(s => s._distance <= 5);
    // Can deliver to user
    const deliverableStores = allStores.filter(s =>
        s.home_delivery_enabled && userLat && DataStore.canDeliverTo(s.id, userLat, userLng)
    );
    // Top rated
    const topStores = [...allStores].sort((a, b) => (b.rating || 0) - (a.rating || 0)).slice(0, 6);

    const hasStores = allStores.length > 0;

    container.innerHTML = `
        ${UI.renderHeader('RAPLIFY', {
            brand: true,
            actions: `
                <button class="header-icon-btn" onclick="Router.navigate('cart')" id="home-cart-btn">
                    ${Icons.cart}
                    ${DataStore.getCartCount() > 0 ? `<span class="badge">${DataStore.getCartCount()}</span>` : ''}
                </button>
            `
        })}

        <div class="page-content">
            <!-- Hero -->
            <div class="home-hero">
                <p class="home-greeting">Hello, <strong>${user?.name || 'Guest'}</strong> 👋</p>
                <div class="home-location" onclick="updateHomeLocation()" style="cursor:pointer">
                    ${Icons.mapPin}
                    <span>${user?.address ? user.address.substring(0, 50) + (user.address.length > 50 ? '...' : '') : 'Tap to set location'}</span>
                    <span style="font-size:10px;color:var(--primary-400);margin-left:4px">📍</span>
                </div>
                <div class="home-search">
                    <span class="search-icon">${Icons.search}</span>
                    <input type="text" placeholder="Search stores, products, or shop code..." id="home-search-input" onkeydown="if(event.key==='Enter')homeSearch()">
                </div>
            </div>

            <!-- Categories -->
            <div class="section-title">Browse Categories</div>
            <div class="categories-grid">
                ${categories.map((cat, i) => `
                    <div class="category-item animate-fadeInUp stagger-${Math.min(i + 1, 8)}" onclick="Router.navigate('store-list', {category:'${cat.name}'})" id="cat-${cat.id}">
                        <div class="category-icon" style="background:linear-gradient(135deg, ${cat.color}15, ${cat.color}25)">
                            ${cat.emoji}
                        </div>
                        <span class="category-name">${cat.name}</span>
                    </div>
                `).join('')}
            </div>

            <div class="divider-thick"></div>

            ${!hasStores ? `
                <div class="empty-state" style="padding:var(--space-8) var(--space-4)">
                    <div class="empty-icon">🏪</div>
                    <h3>No Stores Yet</h3>
                    <p>Be the first seller to register on RAPLIFY!</p>
                </div>
            ` : `
                <!-- Delivers to You -->
                ${deliverableStores.length > 0 ? `
                    <div class="section-title">🚚 Delivers to You</div>
                    <div style="padding:0 var(--space-4);display:flex;gap:var(--space-3);overflow-x:auto;scrollbar-width:none;padding-bottom:var(--space-4)">
                        ${deliverableStores.slice(0, 6).map((store, i) => renderStoreCardHorizontal(store, i)).join('')}
                    </div>
                    <div class="divider-thick"></div>
                ` : ''}

                <!-- Top Rated -->
                ${topStores.length > 0 ? `
                    <div class="section-title">Top Rated ⭐</div>
                    <div style="padding:0 var(--space-4);display:flex;gap:var(--space-3);overflow-x:auto;scrollbar-width:none;padding-bottom:var(--space-4)">
                        ${topStores.map((store, i) => renderStoreCardHorizontal(store, i)).join('')}
                    </div>
                    <div class="divider-thick"></div>
                ` : ''}

                <!-- All Stores -->
                <div class="flex items-center justify-between px-4">
                    <h3 class="section-title" style="padding-left:0">All Stores 📍</h3>
                    <button class="btn btn-ghost btn-sm" onclick="Router.navigate('store-list')" id="see-all-btn">See All</button>
                </div>
                <div style="padding:0 var(--space-4) var(--space-4)">
                    ${allStores.slice(0, 10).map((store, i) => renderStoreCardVertical(store, i)).join('')}
                    ${allStores.length > 10 ? `
                        <button class="btn btn-outline btn-block mt-2" onclick="Router.navigate('store-list')">View all ${allStores.length} stores</button>
                    ` : ''}
                </div>
            `}
        </div>

        ${UI.renderCustomerNav('home')}
    `;
}

async function updateHomeLocation() {
    UI.showToast('Detecting your location...', 'default');
    try {
        const pos = await GeoUtils.getCurrentPosition();
        const address = await GeoUtils.reverseGeocode(pos.lat, pos.lng);
        const user = DataStore.getCurrentUser();
        DataStore.updateUser({ ...user, lat: pos.lat, lng: pos.lng, address });
        UI.showToast('Location updated!', 'success');
        renderCustomerHome(document.getElementById('app-content'));
    } catch (err) { UI.showToast(err.message, 'error'); }
}

function homeSearch() {
    const query = document.getElementById('home-search-input')?.value?.trim();
    if (query) Router.navigate('store-list', { query });
}

function renderStoreCardHorizontal(store, index) {
    const dist = store._distance !== undefined && store._distance < 900
        ? Utils.formatDistance(store._distance) : '';

    const deliveryBadge = store.home_delivery_enabled
        ? `<span class="badge badge-delivery">${Icons.truck} Delivery</span>`
        : `<span class="badge badge-pickup">${Icons.store} Pickup</span>`;

    return `
        <div class="store-card animate-fadeInUp stagger-${Math.min(index + 1, 8)}" onclick="Router.navigate('store-page', {storeId:'${store.id}'})" style="min-width:220px;flex-shrink:0" id="store-card-${store.id}">
            <div class="store-card-image" style="background:linear-gradient(135deg, ${store.image_color || '#6C3CE1'}20, ${store.image_color || '#6C3CE1'}40)">
                <span class="store-emoji">${store.emoji || '🏪'}</span>
                <div class="delivery-badge">${deliveryBadge}</div>
            </div>
            <div class="store-card-body">
                <div class="store-card-name truncate">${store.name}</div>
                <div class="store-card-category">${store.category}${dist ? ' • ' + dist : ''}</div>
                <div class="store-card-meta">
                    <div class="store-card-rating">${Icons.star} ${store.rating || 'New'}</div>
                    ${dist ? `<span class="store-card-distance">${dist}</span>` : ''}
                </div>
            </div>
        </div>
    `;
}

function renderStoreCardVertical(store, index) {
    const dist = store._distance !== undefined && store._distance < 900
        ? Utils.formatDistance(store._distance) : '';

    const user = DataStore.getCurrentUser();
    const canDeliver = user?.lat ? DataStore.canDeliverTo(store.id, user.lat, user.lng) : false;

    const deliveryInfo = store.home_delivery_enabled
        ? (canDeliver
            ? `<span class="badge badge-delivery" style="font-size:10px">${Icons.truck} Can Deliver</span>`
            : `<span class="badge badge-pickup" style="font-size:10px">${Icons.truck} Pick up</span>`)
        : `<span class="badge badge-pickup" style="font-size:10px">${Icons.store} Pickup Only</span>`;

    return `
        <div class="card mb-3 animate-fadeInUp stagger-${Math.min(index + 1, 8)}" onclick="Router.navigate('store-page', {storeId:'${store.id}'})" style="cursor:pointer" id="popular-${store.id}">
            <div class="card-body flex items-center gap-3">
                <div style="width:60px;height:60px;border-radius:var(--radius-lg);background:linear-gradient(135deg, ${store.image_color || '#6C3CE1'}20, ${store.image_color || '#6C3CE1'}40);display:flex;align-items:center;justify-content:center;font-size:28px;flex-shrink:0">
                    ${store.emoji || '🏪'}
                </div>
                <div style="flex:1;min-width:0">
                    <div class="font-semibold text-dark truncate">${store.name}</div>
                    <div class="text-xs text-muted mb-1">${store.category}${dist ? ' • ' + dist : ''}</div>
                    <div class="flex items-center gap-2">
                        <span class="store-card-rating" style="font-size:12px">${Icons.star} ${store.rating || 'New'}</span>
                        ${deliveryInfo}
                    </div>
                </div>
                <span style="color:var(--neutral-300)">${Icons.chevronRight}</span>
            </div>
        </div>
    `;
}
