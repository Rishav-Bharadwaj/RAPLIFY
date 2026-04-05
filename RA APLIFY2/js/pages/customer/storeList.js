// ========================== //
// Customer - Store List       //
// ========================== //

let _storeListFilters = { delivery: 'none', sort: 'distance', category: '' };

function renderStoreList(container, params = {}) {
    if (params.category) _storeListFilters.category = params.category;
    if (params.query !== undefined) _storeListFilters.query = params.query;

    const user = DataStore.getCurrentUser();
    const query = params.query || _storeListFilters.query || '';
    const filters = { ..._storeListFilters };

    // 'none' means no delivery filter at all
    if (filters.delivery === 'none' || filters.delivery === 'all') {
        delete filters.delivery;
    }

    const { stores, matchedProducts } = DataStore.searchAll(query, user?.lat, user?.lng, filters);

    // Group matched products by store
    const productsByStore = {};
    matchedProducts.forEach(p => {
        if (!productsByStore[p.store_id]) productsByStore[p.store_id] = [];
        productsByStore[p.store_id].push(p);
    });

    const title = query ? `"${query}"` : (params.category || 'All Stores');

    container.innerHTML = `
        ${UI.renderHeader(title, {
            showBack: true,
            actions: `<button class="header-icon-btn" onclick="Router.navigate('cart')">${Icons.cart}${DataStore.getCartCount() > 0 ? `<span class="badge">${DataStore.getCartCount()}</span>` : ''}</button>`
        })}

        <div class="page-content">
            <!-- Search -->
            <div style="padding:var(--space-3) var(--space-4)">
                <div class="search-bar">
                    <span class="search-icon">${Icons.search}</span>
                    <input type="text" placeholder="Search stores, products, or shop code..." id="store-search-input" value="${query}" onkeydown="if(event.key==='Enter')searchStoresAction()">
                </div>
            </div>

            <!-- Delivery Filter -->
            <div class="filter-bar">
                <button class="chip ${_storeListFilters.delivery === 'none' ? 'active' : ''}" onclick="setDeliveryFilter('none')" id="filter-none">🔓 No Filter</button>
                <button class="chip ${_storeListFilters.delivery === 'all' ? 'active' : ''}" onclick="setDeliveryFilter('all')" id="filter-all">All Stores</button>
                <button class="chip ${_storeListFilters.delivery === 'home' ? 'active' : ''}" onclick="setDeliveryFilter('home')" id="filter-delivery">${Icons.truck} Delivers to Me</button>
                <button class="chip ${_storeListFilters.delivery === 'pickup' ? 'active' : ''}" onclick="setDeliveryFilter('pickup')" id="filter-pickup">${Icons.store} Pickup Only</button>
            </div>

            <!-- Sort + Count -->
            <div class="sort-bar">
                <span>${stores.length} store${stores.length !== 1 ? 's' : ''} found</span>
                <div class="sort-select" onclick="showSortOptions()" id="sort-trigger">
                    ${Icons.filter}
                    <span>${_storeListFilters.sort === 'rating' ? 'Rating' : _storeListFilters.sort === 'popularity' ? 'Popularity' : 'Distance'}</span>
                </div>
            </div>

            <!-- Category clear badge -->
            ${params.category ? `
                <div style="padding:0 var(--space-4);margin-bottom:var(--space-2)">
                    <div style="display:inline-flex;align-items:center;gap:6px;background:var(--primary-50);padding:6px 12px;border-radius:20px;font-size:12px;color:var(--primary-600)">
                        📂 ${params.category}
                        <button onclick="clearCategoryFilter()" style="background:var(--primary-200);border:none;border-radius:50%;width:18px;height:18px;display:flex;align-items:center;justify-content:center;cursor:pointer;font-size:10px;color:var(--primary-700)">✕</button>
                    </div>
                </div>
            ` : ''}

            <!-- Product matches hint -->
            ${query && matchedProducts.length > 0 ? `
                <div style="padding:0 var(--space-4);margin-bottom:var(--space-3)">
                    <div style="background:var(--primary-50);border-radius:var(--radius-md);padding:var(--space-3);font-size:var(--font-xs);color:var(--primary-600)">
                        🔍 Found "${query}" in ${matchedProducts.length} product${matchedProducts.length !== 1 ? 's' : ''} across ${Object.keys(productsByStore).length} store${Object.keys(productsByStore).length !== 1 ? 's' : ''}
                    </div>
                </div>
            ` : ''}

            <!-- Store List -->
            <div style="padding:0 var(--space-4) var(--space-4)">
                ${stores.length === 0 ? UI.renderEmpty(Icons.search, 'No stores found', 'Try different search terms or clear filters') : ''}
                ${stores.map((store, i) => renderStoreListItem(store, i, productsByStore[store.id])).join('')}
            </div>
        </div>

        ${UI.renderCustomerNav('search')}
    `;
}

function renderStoreListItem(store, index, matchedProducts) {
    const user = DataStore.getCurrentUser();
    const dist = store._distance !== undefined && store._distance < 900
        ? store._distance : null;

    const canDeliver = user?.lat ? DataStore.canDeliverTo(store.id, user.lat, user.lng) : false;

    const deliveryBadge = store.home_delivery_enabled
        ? (canDeliver
            ? `<span class="badge badge-delivery" style="font-size:10px">${Icons.truck} Can Deliver</span>`
            : `<span class="badge badge-pickup" style="font-size:10px">${Icons.truck} Delivery (out of range)</span>`)
        : `<span class="badge badge-pickup" style="font-size:10px">${Icons.store} Pickup Only</span>`;

    return `
        <div class="card mb-3 animate-fadeInUp stagger-${Math.min(index + 1, 8)}" onclick="Router.navigate('store-page', {storeId:'${store.id}'})" style="cursor:pointer" id="slist-${store.id}">
            <div class="store-card-image" style="height:100px;background:linear-gradient(135deg, ${store.image_color || '#6C3CE1'}15, ${store.image_color || '#6C3CE1'}35)">
                <span class="store-emoji" style="font-size:36px">${store.emoji || '🏪'}</span>
            </div>
            <div class="card-body">
                <div class="flex justify-between items-start mb-1">
                    <div>
                        <div class="font-bold text-dark">${store.name}</div>
                        <div class="text-xs text-muted">${store.category}${dist !== null ? ' • ' + Utils.formatDistance(dist) + ' away' : ''}</div>
                    </div>
                    <div class="store-card-rating">${Icons.star} ${store.rating || 'New'}</div>
                </div>
                <p class="text-xs text-secondary mb-2" style="line-height:1.4">${store.description || ''}</p>
                <div class="flex items-center gap-2 flex-wrap">
                    ${deliveryBadge}
                    <span class="text-xs text-muted">• ${store.review_count || 0} reviews</span>
                </div>
                ${matchedProducts && matchedProducts.length > 0 ? `
                    <div style="margin-top:var(--space-2);padding-top:var(--space-2);border-top:1px solid var(--neutral-100)">
                        <div style="font-size:10px;color:var(--primary-500);font-weight:600;margin-bottom:4px">Matching products:</div>
                        <div style="display:flex;gap:4px;flex-wrap:wrap">
                            ${matchedProducts.slice(0, 3).map(p => `<span style="font-size:10px;background:var(--primary-50);padding:2px 8px;border-radius:20px;color:var(--primary-600)">${p.emoji || '📦'} ${p.name}</span>`).join('')}
                            ${matchedProducts.length > 3 ? `<span style="font-size:10px;color:var(--neutral-400)">+${matchedProducts.length - 3} more</span>` : ''}
                        </div>
                    </div>
                ` : ''}
            </div>
        </div>
    `;
}

function setDeliveryFilter(filter) {
    _storeListFilters.delivery = filter;
    const route = Router.getCurrentRoute();
    Router.navigate('store-list', route?.params || {});
}

function clearCategoryFilter() {
    _storeListFilters.category = '';
    Router.navigate('store-list', {});
}

function searchStoresAction() {
    const query = document.getElementById('store-search-input')?.value?.trim();
    _storeListFilters.category = '';
    Router.navigate('store-list', { query });
}

function showSortOptions() {
    const content = `
        <div style="display:flex;flex-direction:column;gap:var(--space-2)">
            <button class="btn ${_storeListFilters.sort === 'distance' ? 'btn-primary' : 'btn-outline'} btn-block" onclick="setSortOption('distance')" id="sort-distance">📍 Distance (Nearest)</button>
            <button class="btn ${_storeListFilters.sort === 'rating' ? 'btn-primary' : 'btn-outline'} btn-block" onclick="setSortOption('rating')" id="sort-rating">⭐ Rating (Highest)</button>
            <button class="btn ${_storeListFilters.sort === 'popularity' ? 'btn-primary' : 'btn-outline'} btn-block" onclick="setSortOption('popularity')" id="sort-popularity">🔥 Popularity</button>
        </div>
    `;
    UI.showModal(content, { title: 'Sort By' });
}

function setSortOption(sort) {
    _storeListFilters.sort = sort;
    UI.closeModal();
    const route = Router.getCurrentRoute();
    Router.navigate('store-list', route?.params || {});
}
