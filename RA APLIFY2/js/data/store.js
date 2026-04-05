// ========================== //
// RAPLIFY - Data Store        //
// ========================== //

const DataStore = {
    _prefix: 'raplify_',

    init() {
        if (!localStorage.getItem(this._prefix + 'initialized')) {
            this._seedAll();
            localStorage.setItem(this._prefix + 'initialized', 'true');
        }
    },

    reset() {
        const keys = Object.keys(localStorage).filter(k => k.startsWith(this._prefix));
        keys.forEach(k => localStorage.removeItem(k));
        this._seedAll();
        localStorage.setItem(this._prefix + 'initialized', 'true');
    },

    _seedAll() {
        this._set('users', SEED_DATA.users || []);
        this._set('stores', SEED_DATA.stores || []);
        this._set('products', SEED_DATA.products || []);
        this._set('orders', SEED_DATA.orders || []);
        this._set('reviews', SEED_DATA.reviews || []);
        this._set('chats', SEED_DATA.chats || []);
        this._set('categories', SEED_DATA.categories || []);
        this._set('cart', []);
        this._set('current_user', null);
        this._set('current_role', null);
    },

    _get(key) {
        try { return JSON.parse(localStorage.getItem(this._prefix + key)); }
        catch { return null; }
    },

    _set(key, value) {
        localStorage.setItem(this._prefix + key, JSON.stringify(value));
    },

    // Simple hash for password
    _hashPassword(pwd) {
        let hash = 0;
        for (let i = 0; i < pwd.length; i++) {
            const ch = pwd.charCodeAt(i);
            hash = ((hash << 5) - hash) + ch;
            hash = hash & hash;
        }
        return 'h' + Math.abs(hash).toString(36);
    },

    // ========== AUTH ==========
    getCurrentUser() { return this._get('current_user'); },
    getCurrentRole() { return this._get('current_role'); },
    setCurrentUser(user) { this._set('current_user', user); },
    setCurrentRole(role) { this._set('current_role', role); },

    // --- CUSTOMER AUTH ---
    async customerSignup(phone, password) {
        try {
            const res = await fetch(`${API_URL}/api/auth/register`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ phone, password, role: 'customer' })
            });
            const data = await res.json();
            if (!data.success) return { error: data.message || 'Signup failed' };
            
            // Map isNewProfile (from backend) to isNew (used by frontend)
            const user = { ...data.user, isNew: data.user.isNewProfile };
            
            this.setCurrentUser(user);
            this.setCurrentRole('customer');
            this._set('auth_token', data.token); // Store token for future requests
            return { user };
        } catch (error) {
            return { error: 'Network error during signup. Please try again.' };
        }
    },

    async customerLogin(phone, password) {
        try {
            const res = await fetch(`${API_URL}/api/auth/login`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ phone, password, role: 'customer' })
            });
            
            const data = await res.json();
            if (!data.success) return { error: data.message || 'Login failed' };
            
            const user = { ...data.user, isNew: data.user.isNewProfile };
            
            this.setCurrentUser(user);
            this.setCurrentRole('customer');
            this._set('auth_token', data.token); // Store the JWT
            return { user };
        } catch (error) {
            return { error: 'Network error during login. Please try again.' };
        }
    },

    findCustomerByPhone(phone) {
        return (this._get('users') || []).find(u => u.phone === phone && u.role === 'customer');
    },

    resetCustomerPassword(phone, newPassword) {
        const users = this._get('users') || [];
        const idx = users.findIndex(u => u.phone === phone && u.role === 'customer');
        if (idx !== -1) {
            users[idx].password = this._hashPassword(newPassword);
            this._set('users', users);
            return true;
        }
        return false;
    },

    // --- SELLER AUTH ---
    async sellerSignup(phone, password) {
        try {
            const uniqueCode = 'RAP' + Date.now().toString(36).toUpperCase().slice(-6);
            const res = await fetch(`${API_URL}/api/auth/register`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ phone, password, role: 'seller', uniqueCode })
            });
            
            const data = await res.json();
            if (!data.success) return { error: data.message || 'Signup failed' };
            
            const user = { ...data.user, isNew: data.user.isNewProfile, uniqueCode };
            
            this.setCurrentUser(user);
            this.setCurrentRole('seller');
            this._set('auth_token', data.token);
            return { user, uniqueCode };
        } catch (error) {
            return { error: 'Network error during signup. Please try again.' };
        }
    },

    async sellerLogin(identifier, password) {
        try {
            const res = await fetch(`${API_URL}/api/auth/seller-login`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ identifier, password })
            });
            
            const data = await res.json();
            if (!data.success) return { error: data.message || 'Login failed' };
            
            const user = { ...data.user, isNew: data.user.isNewProfile };
            
            this.setCurrentUser(user);
            this.setCurrentRole('seller');
            this._set('auth_token', data.token);
            return { user };
        } catch (error) {
            return { error: 'Network error during login. Please try again.' };
        }
    },

    findSellerByPhone(phone) {
        return (this._get('users') || []).find(u => u.phone === phone && u.role === 'seller');
    },

    resetSellerPassword(phone, newPassword) {
        const users = this._get('users') || [];
        const idx = users.findIndex(u => u.phone === phone && u.role === 'seller');
        if (idx !== -1) {
            users[idx].password = this._hashPassword(newPassword);
            this._set('users', users);
            return true;
        }
        return false;
    },

    // Update password for any user
    updateUserPassword(userId, newPassword) {
        const users = this._get('users') || [];
        const idx = users.findIndex(u => u.id === userId);
        if (idx !== -1) {
            users[idx].password = this._hashPassword(newPassword);
            this._set('users', users);
            if (this.getCurrentUser()?.id === userId) {
                this.setCurrentUser(users[idx]);
            }
            return true;
        }
        return false;
    },

    verifyPassword(userId, password) {
        const users = this._get('users') || [];
        const user = users.find(u => u.id === userId);
        if (!user) return false;
        return user.password === this._hashPassword(password);
    },

    logout() {
        this.setCurrentUser(null);
        this.setCurrentRole(null);
        this._set('auth_token', null);
        this._set('cart', []);
    },

    async updateUser(updatedUser) {
        try {
            const token = this._get('auth_token');
            if (token) {
                const res = await fetch(`${API_URL}/api/auth/profile`, {
                    method: 'POST',
                    headers: { 
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${token}` 
                    },
                    body: JSON.stringify(updatedUser)
                });
                
                const data = await res.json();
                if (data.success) {
                    updatedUser = data.user;
                    updatedUser.isNew = data.user.isNewProfile;
                }
            }
        } catch (e) {
            console.error("Failed to sync profile with server:", e);
        }
        
        // Always update local storage for immediate UI reflect
        const users = this._get('users') || [];
        const idx = users.findIndex(u => u.id === updatedUser.id);
        if (idx !== -1) {
            users[idx] = { ...users[idx], ...updatedUser };
            this._set('users', users);
            this.setCurrentUser(users[idx]);
        }
    },

    // ========== STORES ==========
    getStores() { return this._get('stores') || []; },
    getStore(id) { return this.getStores().find(s => s.id === id); },
    getStoresByOwner(ownerId) { return this.getStores().filter(s => s.owner_id === ownerId); },

    // Find store by unique code of its owner
    findStoreByOwnerCode(code) {
        const users = this._get('users') || [];
        const seller = users.find(u => u.uniqueCode === code && u.role === 'seller');
        if (!seller) return null;
        const stores = this.getStores();
        return stores.find(s => s.owner_id === seller.id) || null;
    },

    getNearbyStores(lat, lng, radiusKm = 5) {
        return this.getStores().filter(s => {
            if (!s.lat || !s.lng) return false;
            s._distance = GeoUtils.distance(lat, lng, s.lat, s.lng);
            return s._distance <= radiusKm;
        }).sort((a, b) => a._distance - b._distance);
    },

    canDeliverTo(storeId, lat, lng) {
        const store = this.getStore(storeId);
        if (!store || !store.home_delivery_enabled) return false;
        return GeoUtils.distance(store.lat, store.lng, lat, lng) <= store.delivery_radius_km;
    },

    createStore(store) {
        const stores = this.getStores();
        store.id = 's' + Date.now();
        store.rating = 0;
        store.review_count = 0;
        store.order_count = 0;
        store.is_open = true;
        stores.push(store);
        this._set('stores', stores);
        return store;
    },

    updateStore(id, updates) {
        const stores = this.getStores();
        const idx = stores.findIndex(s => s.id === id);
        if (idx !== -1) {
            stores[idx] = { ...stores[idx], ...updates };
            this._set('stores', stores);
            return stores[idx];
        }
        return null;
    },

    // ========== PRODUCTS ==========
    getProducts() { return this._get('products') || []; },
    getProduct(id) { return this.getProducts().find(p => p.id === id); },
    getProductsByStore(storeId) { return this.getProducts().filter(p => p.store_id === storeId); },

    createProduct(product) {
        const products = this.getProducts();
        product.id = 'p' + Date.now();
        products.push(product);
        this._set('products', products);
        return product;
    },

    updateProduct(id, updates) {
        const products = this.getProducts();
        const idx = products.findIndex(p => p.id === id);
        if (idx !== -1) {
            products[idx] = { ...products[idx], ...updates };
            this._set('products', products);
            return products[idx];
        }
        return null;
    },

    deleteProduct(id) {
        this._set('products', this.getProducts().filter(p => p.id !== id));
    },

    // ========== SEARCH (stores + products) ==========
    // Shows ALL stores sorted by distance. No 5km limit.
    searchAll(query, userLat, userLng, filters = {}) {
        const q = (query || '').toLowerCase().trim();
        let stores = this.getStores();
        let matchedProducts = [];

        // Add distance to each store
        stores = stores.map(s => {
            s._distance = (userLat && userLng && s.lat && s.lng)
                ? GeoUtils.distance(userLat, userLng, s.lat, s.lng)
                : 999;
            return s;
        });

        // *** Check if query is a unique seller code ***
        if (q) {
            const codeStore = this.findStoreByOwnerCode(q.toUpperCase());
            if (codeStore) {
                codeStore._distance = (userLat && userLng && codeStore.lat && codeStore.lng)
                    ? GeoUtils.distance(userLat, userLng, codeStore.lat, codeStore.lng) : 999;
                return { stores: [codeStore], matchedProducts: [] };
            }
        }

        // Search by query
        if (q) {
            const allProducts = this.getProducts();
            matchedProducts = allProducts.filter(p =>
                p.name.toLowerCase().includes(q) ||
                p.category.toLowerCase().includes(q)
            );
            const productStoreIds = [...new Set(matchedProducts.map(p => p.store_id))];
            const storeMatches = stores.filter(s =>
                s.name.toLowerCase().includes(q) ||
                s.category.toLowerCase().includes(q) ||
                (s.location || '').toLowerCase().includes(q)
            );
            const matchedStoreIds = new Set([
                ...storeMatches.map(s => s.id),
                ...productStoreIds
            ]);
            stores = stores.filter(s => matchedStoreIds.has(s.id));
        }

        // Delivery filter (only if not 'none' / 'all')
        if (filters.delivery === 'home') {
            stores = stores.filter(s => {
                if (!s.home_delivery_enabled) return false;
                if (userLat && userLng) {
                    return GeoUtils.distance(s.lat, s.lng, userLat, userLng) <= s.delivery_radius_km;
                }
                return true;
            });
        } else if (filters.delivery === 'pickup') {
            stores = stores.filter(s => !s.home_delivery_enabled);
        }
        // 'all' and 'none' = no delivery filter

        // Category filter
        if (filters.category) {
            stores = stores.filter(s => s.category === filters.category);
        }

        // Sorting - always include distance sort
        if (filters.sort === 'rating') {
            stores.sort((a, b) => b.rating - a.rating);
        } else if (filters.sort === 'popularity') {
            stores.sort((a, b) => b.order_count - a.order_count);
        } else {
            // Default: distance
            stores.sort((a, b) => a._distance - b._distance);
        }

        return { stores, matchedProducts };
    },

    // ========== CART ==========
    getCart() { return this._get('cart') || []; },

    addToCart(product, storeId) {
        const cart = this.getCart();
        if (cart.length > 0 && cart[0].store_id !== storeId) {
            return { error: 'Cart contains items from a different store. Clear cart first.' };
        }
        const existing = cart.find(c => c.product_id === product.id);
        if (existing) { existing.quantity += 1; }
        else {
            cart.push({
                product_id: product.id, store_id: storeId,
                name: product.name, price: product.price,
                emoji: product.emoji, quantity: 1
            });
        }
        this._set('cart', cart);
        return { success: true };
    },

    updateCartItemQty(productId, qty) {
        let cart = this.getCart();
        if (qty <= 0) { cart = cart.filter(c => c.product_id !== productId); }
        else { const item = cart.find(c => c.product_id === productId); if (item) item.quantity = qty; }
        this._set('cart', cart);
    },

    clearCart() { this._set('cart', []); },
    getCartTotal() { return this.getCart().reduce((s, i) => s + i.price * i.quantity, 0); },
    getCartCount() { return this.getCart().reduce((s, i) => s + i.quantity, 0); },

    // ========== ORDERS ==========
    getOrders() { return this._get('orders') || []; },
    getOrder(id) { return this.getOrders().find(o => o.id === id); },
    getOrdersByCustomer(cid) { return this.getOrders().filter(o => o.customer_id === cid).sort((a, b) => new Date(b.created_at) - new Date(a.created_at)); },
    getOrdersByStore(sid) { return this.getOrders().filter(o => o.store_id === sid).sort((a, b) => new Date(b.created_at) - new Date(a.created_at)); },

    createOrder(orderData) {
        const orders = this.getOrders();
        const order = { id: 'o' + Date.now(), ...orderData, status: 'pending', created_at: new Date().toISOString(), updated_at: new Date().toISOString() };
        orders.push(order);
        this._set('orders', orders);
        const store = this.getStore(order.store_id);
        if (store) this.updateStore(store.id, { order_count: (store.order_count || 0) + 1 });
        const chats = this._get('chats') || [];
        chats.push({ id: 'c' + Date.now(), order_id: order.id, messages: [] });
        this._set('chats', chats);
        this.clearCart();
        return order;
    },

    updateOrderStatus(orderId, status) {
        const orders = this.getOrders();
        const idx = orders.findIndex(o => o.id === orderId);
        if (idx !== -1) { orders[idx].status = status; orders[idx].updated_at = new Date().toISOString(); this._set('orders', orders); return orders[idx]; }
        return null;
    },

    // ========== REVIEWS ==========
    getReviews() { return this._get('reviews') || []; },
    getReviewsByStore(sid) { return this.getReviews().filter(r => r.store_id === sid).sort((a, b) => new Date(b.created_at) - new Date(a.created_at)); },

    addReview(review) {
        const reviews = this.getReviews();
        review.id = 'r' + Date.now();
        review.created_at = new Date().toISOString();
        reviews.push(review);
        this._set('reviews', reviews);
        const sr = reviews.filter(r => r.store_id === review.store_id);
        const avg = sr.reduce((s, r) => s + r.rating, 0) / sr.length;
        this.updateStore(review.store_id, { rating: Math.round(avg * 10) / 10, review_count: sr.length });
        return review;
    },

    // ========== CHAT ==========
    getChat(orderId) { return (this._get('chats') || []).find(c => c.order_id === orderId); },
    sendMessage(orderId, senderId, text) {
        const chats = this._get('chats') || [];
        const chat = chats.find(c => c.order_id === orderId);
        if (chat) { chat.messages.push({ sender: senderId, text, time: new Date().toISOString() }); this._set('chats', chats); return chat; }
        return null;
    },

    // ========== CATEGORIES ==========
    getCategories() { return this._get('categories') || []; },
    addCategory(name, emoji, color) {
        const cats = this.getCategories();
        const nc = { id: 'cat' + Date.now(), name, emoji, color };
        cats.push(nc);
        this._set('categories', cats);
        return nc;
    },

    // ========== USERS ==========
    getUsers() { return this._get('users') || []; },
    getUser(id) { return this.getUsers().find(u => u.id === id); },

    // ========== ANALYTICS ==========
    getStoreAnalytics(storeId) {
        const orders = this.getOrdersByStore(storeId);
        const products = this.getProductsByStore(storeId);
        const reviews = this.getReviewsByStore(storeId);
        const totalRevenue = orders.reduce((s, o) => s + o.total_price, 0);
        const completedOrders = orders.filter(o => ['delivered', 'completed'].includes(o.status));
        const dailySales = [];
        const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
        for (let i = 6; i >= 0; i--) {
            const d = new Date(); d.setDate(d.getDate() - i);
            const dayOrders = orders.filter(o => new Date(o.created_at).toDateString() === d.toDateString());
            dailySales.push({ day: days[d.getDay()], revenue: dayOrders.reduce((s, o) => s + o.total_price, 0), orders: dayOrders.length });
        }
        const pc = {};
        orders.forEach(o => (o.items || []).forEach(i => { pc[i.name] = (pc[i.name] || 0) + i.quantity; }));
        const popularProducts = Object.entries(pc).map(([n, c]) => ({ name: n, count: c })).sort((a, b) => b.count - a.count).slice(0, 5);
        return {
            totalRevenue, totalOrders: orders.length,
            completedOrders: completedOrders.length,
            pendingOrders: orders.filter(o => o.status === 'pending').length,
            totalProducts: products.length,
            avgRating: reviews.length ? (reviews.reduce((s, r) => s + r.rating, 0) / reviews.length).toFixed(1) : '0',
            dailySales, popularProducts, totalReviews: reviews.length
        };
    }
};
