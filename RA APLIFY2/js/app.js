// ========================== //
// RAPLIFY - Main App          //
// ========================== //

(function () {
    'use strict';

    // Clear old localStorage data from previous prefix
    const oldKeys = Object.keys(localStorage).filter(k => k.startsWith('ra_aplify_'));
    oldKeys.forEach(k => localStorage.removeItem(k));

    // Initialize data store
    DataStore.init();

    // Register all routes
    Router.register('role-select', renderRoleSelect);
    Router.register('auth', (c, p) => renderAuth(c, p));
    Router.register('setup-profile', (c, p) => renderSetupProfile(c, p));
    Router.register('customer-home', renderCustomerHome);
    Router.register('store-list', (c, p) => renderStoreList(c, p));
    Router.register('store-page', (c, p) => renderStorePage(c, p));
    Router.register('cart', renderCart);
    Router.register('checkout', renderCheckout);
    Router.register('customer-orders', renderCustomerOrders);
    Router.register('order-detail', (c, p) => renderOrderDetail(c, p));
    Router.register('customer-profile', renderCustomerProfile);
    Router.register('seller-dashboard', renderSellerDashboard);
    Router.register('seller-products', renderSellerProducts);
    Router.register('seller-orders', renderSellerOrders);
    Router.register('seller-store-setup', (c, p) => renderSellerStoreSetup(c, p));
    Router.register('seller-customers', renderSellerCustomers);
    Router.register('seller-analytics', renderSellerAnalytics);

    // Splash screen → then route
    function startApp() {
        const splash = document.getElementById('splash-screen');
        const appContent = document.getElementById('app-content');

        setTimeout(() => {
            if (splash) splash.classList.add('fade-out');

            setTimeout(() => {
                if (splash) splash.style.display = 'none';
                if (appContent) appContent.style.display = 'block';

                const user = DataStore.getCurrentUser();
                const role = DataStore.getCurrentRole();

                if (user && role) {
                    if (user.isNew || !user.name || !user.address) {
                        Router.navigate('setup-profile', { userId: user.id });
                    } else if (role === 'customer') {
                        Router.navigate('customer-home');
                    } else if (role === 'seller') {
                        Router.navigate('seller-dashboard');
                    }
                } else {
                    Router.navigate('role-select');
                }
            }, 600);
        }, 2200);
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', startApp);
    } else {
        startApp();
    }
})();
