// ========================== //
// RAPLIFY - Role Selection  //
// ========================== //

function renderRoleSelect(container) {
    container.innerHTML = `
        <div class="role-select-page">
            <div class="role-header">
                <div class="logo-mark">
                    <svg width="36" height="36" viewBox="0 0 64 64" fill="none">
                        <path d="M20 28L32 18L44 28V42C44 43.1 43.1 44 42 44H22C20.9 44 20 43.1 20 42V28Z" fill="white" fill-opacity="0.9"/>
                        <path d="M28 44V34H36V44" stroke="rgba(255,255,255,0.4)" stroke-width="2"/>
                    </svg>
                </div>
                <h1>RAPLIFY</h1>
                <p>Your Local Commerce Ecosystem</p>
            </div>

            <div class="role-cards">
                <div class="role-card animate-fadeInUp stagger-1" onclick="selectRole('customer')" id="role-customer">
                    <div class="role-card-icon customer">
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                            <circle cx="9" cy="21" r="1"/><circle cx="20" cy="21" r="1"/>
                            <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"/>
                        </svg>
                    </div>
                    <div class="role-card-info">
                        <h3>Continue as Customer</h3>
                        <p>Browse & order from local stores</p>
                    </div>
                    <div class="arrow">${Icons.chevronRight}</div>
                </div>

                <div class="role-card animate-fadeInUp stagger-2" onclick="selectRole('seller')" id="role-seller">
                    <div class="role-card-icon seller">
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                            <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>
                            <polyline points="9 22 9 12 15 12 15 22"/>
                        </svg>
                    </div>
                    <div class="role-card-info">
                        <h3>Continue as Seller</h3>
                        <p>Manage your store & products</p>
                    </div>
                    <div class="arrow">${Icons.chevronRight}</div>
                </div>

                <div class="role-card disabled animate-fadeInUp stagger-3" id="role-rider">
                    <span class="coming-soon-label">Coming Soon</span>
                    <div class="role-card-icon rider">
                        ${Icons.bike}
                    </div>
                    <div class="role-card-info">
                        <h3>Continue as Rider</h3>
                        <p>Deliver orders & earn money</p>
                    </div>
                    <div class="arrow">${Icons.chevronRight}</div>
                </div>
            </div>

            <div class="role-footer">
                <p>Powered by RAPLIFY • v2.0</p>
                <p style="margin-top:4px">Connecting Local Businesses with Customers</p>
            </div>
        </div>
    `;
}

function selectRole(role) {
    if (role === 'rider') {
        UI.showToast('Rider feature coming soon!', 'warning');
        return;
    }
    // Check if already logged in for this role
    const user = DataStore.getCurrentUser();
    const currentRole = DataStore.getCurrentRole();
    if (user && currentRole === role) {
        if (role === 'customer') {
            Router.navigate('customer-home');
        } else {
            Router.navigate('seller-dashboard');
        }
        return;
    }
    Router.navigate('auth', { role });
}
