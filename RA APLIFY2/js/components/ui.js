// ========================== //
// RAPLIFY - UI Components   //
// ========================== //

const UI = {
    // Toast notification
    showToast(message, type = 'default') {
        let container = document.querySelector('.toast-container');
        if (!container) {
            container = document.createElement('div');
            container.className = 'toast-container';
            document.body.appendChild(container);
        }
        const toast = document.createElement('div');
        toast.className = `toast toast-${type}`;
        const iconMap = { success: Icons.check, error: Icons.x, warning: '⚠️' };
        toast.innerHTML = `${iconMap[type] || ''}<span>${message}</span>`;
        container.appendChild(toast);
        setTimeout(() => toast.remove(), 3000);
    },

    // Show modal
    showModal(content, options = {}) {
        const backdrop = document.createElement('div');
        backdrop.className = 'modal-backdrop';
        backdrop.id = 'active-modal';

        const modal = document.createElement('div');
        modal.className = `modal-content ${options.center ? 'modal-center' : ''}`;

        if (!options.center) {
            modal.innerHTML = `<div class="modal-handle"></div>`;
        }

        if (options.title) {
            modal.innerHTML += `
                <div class="modal-header">
                    <h3 class="modal-title">${options.title}</h3>
                    <button class="modal-close" onclick="UI.closeModal()">${Icons.x}</button>
                </div>
            `;
        }

        const body = document.createElement('div');
        body.className = 'modal-body';
        if (typeof content === 'string') {
            body.innerHTML = content;
        } else {
            body.appendChild(content);
        }
        modal.appendChild(body);

        backdrop.appendChild(modal);
        backdrop.addEventListener('click', (e) => {
            if (e.target === backdrop) UI.closeModal();
        });

        document.body.appendChild(backdrop);
        return backdrop;
    },

    closeModal() {
        const modal = document.getElementById('active-modal');
        if (modal) modal.remove();
    },

    // Customer bottom navigation
    renderCustomerNav(activePage = 'home') {
        const user = DataStore.getCurrentUser();
        const cartCount = DataStore.getCartCount();
        const items = [
            { id: 'home', icon: Icons.home, label: 'Home', route: 'customer-home' },
            { id: 'search', icon: Icons.search, label: 'Search', route: 'store-list' },
            { id: 'cart', icon: Icons.cart, label: 'Cart', route: 'cart', badge: cartCount },
            { id: 'orders', icon: Icons.orders, label: 'Orders', route: 'customer-orders' },
            { id: 'profile', icon: Icons.user, label: 'Profile', route: 'customer-profile' }
        ];

        return `
            <nav class="bottom-nav" id="customer-nav">
                ${items.map(item => `
                    <button class="nav-item ${activePage === item.id ? 'active' : ''}" onclick="Router.navigate('${item.route}')" id="nav-${item.id}">
                        ${item.icon}
                        ${item.badge ? `<span class="nav-badge">${item.badge}</span>` : ''}
                        <span>${item.label}</span>
                    </button>
                `).join('')}
            </nav>
        `;
    },

    // Seller bottom navigation
    renderSellerNav(activePage = 'dashboard') {
        const items = [
            { id: 'dashboard', icon: Icons.home, label: 'Home', route: 'seller-dashboard' },
            { id: 'products', icon: Icons.package, label: 'Products', route: 'seller-products' },
            { id: 'orders', icon: Icons.orders, label: 'Orders', route: 'seller-orders' },
            { id: 'analytics', icon: Icons.barChart, label: 'Analytics', route: 'seller-analytics' },
            { id: 'settings', icon: Icons.settings, label: 'Settings', route: 'seller-store-setup' }
        ];

        return `
            <nav class="bottom-nav" id="seller-nav">
                ${items.map(item => `
                    <button class="nav-item ${activePage === item.id ? 'active' : ''}" onclick="Router.navigate('${item.route}')" id="nav-seller-${item.id}">
                        ${item.icon}
                        <span>${item.label}</span>
                    </button>
                `).join('')}
            </nav>
        `;
    },

    // Header with back button
    renderHeader(title, options = {}) {
        return `
            <header class="app-header">
                <div class="header-left">
                    ${options.showBack ? `<button class="back-btn" onclick="Router.back()" id="btn-back">${Icons.back}</button>` : ''}
                    ${options.brand ? `<span class="header-brand">${title}</span>` : `<h1 class="header-title">${title}</h1>`}
                </div>
                <div class="header-actions">
                    ${options.actions || ''}
                </div>
            </header>
        `;
    },

    // Empty state
    renderEmpty(icon, title, subtitle, actionBtn = '') {
        return `
            <div class="empty-state">
                <div class="empty-icon">${icon}</div>
                <h3>${title}</h3>
                <p>${subtitle}</p>
                ${actionBtn ? `<div class="mt-4">${actionBtn}</div>` : ''}
            </div>
        `;
    },

    // Confirm dialog
    confirm(title, message, onConfirm) {
        const content = `
            <p style="color:var(--neutral-500);font-size:var(--font-sm);margin-bottom:var(--space-6)">${message}</p>
            <div class="flex gap-3">
                <button class="btn btn-outline flex-1" onclick="UI.closeModal()">Cancel</button>
                <button class="btn btn-primary flex-1" id="confirm-btn">Confirm</button>
            </div>
        `;
        UI.showModal(content, { title, center: true });
        setTimeout(() => {
            document.getElementById('confirm-btn')?.addEventListener('click', () => {
                UI.closeModal();
                onConfirm();
            });
        }, 100);
    }
};
