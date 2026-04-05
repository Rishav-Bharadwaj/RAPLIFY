// ========================== //
// Customer - Profile Page     //
// ========================== //

function renderCustomerProfile(container) {
    const user = DataStore.getCurrentUser();
    const orders = DataStore.getOrdersByCustomer(user?.id || '');

    container.innerHTML = `
        <div class="page-content" style="padding-bottom:var(--bottom-nav-height)">
            <!-- Profile Header -->
            <div class="profile-header">
                <div class="profile-avatar">${Utils.getInitials(user?.name || 'U')}</div>
                <div class="profile-name">${user?.name || 'User'}</div>
                <div class="profile-phone">${user?.phone || ''}</div>
            </div>

            <!-- Quick Stats -->
            <div style="display:flex;justify-content:space-around;padding:var(--space-4);background:white;margin-top:-20px;border-radius:var(--radius-2xl) var(--radius-2xl) 0 0;position:relative;z-index:1;box-shadow:var(--shadow-sm)">
                <div class="text-center">
                    <div class="font-bold text-lg">${orders.length}</div>
                    <div class="text-xs text-muted">Orders</div>
                </div>
                <div style="width:1px;background:var(--neutral-200)"></div>
                <div class="text-center">
                    <div class="font-bold text-lg">${orders.filter(o => o.status === 'delivered' || o.status === 'completed').length}</div>
                    <div class="text-xs text-muted">Completed</div>
                </div>
                <div style="width:1px;background:var(--neutral-200)"></div>
                <div class="text-center">
                    <div class="font-bold text-lg">${Utils.formatPrice(orders.reduce((s, o) => s + o.total_price, 0))}</div>
                    <div class="text-xs text-muted">Spent</div>
                </div>
            </div>

            <!-- Account Info Card -->
            <div style="margin:var(--space-4);background:white;border-radius:var(--radius-xl);padding:var(--space-4);box-shadow:var(--shadow-sm);border:1px solid var(--neutral-100)">
                <h3 style="font-size:var(--font-sm);font-weight:700;color:var(--neutral-800);margin-bottom:var(--space-4);display:flex;align-items:center;gap:8px">
                    🔐 Account Information
                </h3>
                <div style="display:flex;flex-direction:column;gap:var(--space-3)">
                    <div style="display:flex;justify-content:space-between;align-items:center;padding:10px 0;border-bottom:1px solid var(--neutral-50)">
                        <div>
                            <div style="font-size:11px;color:var(--neutral-400);margin-bottom:2px">Phone Number</div>
                            <div style="font-size:var(--font-sm);font-weight:600;color:var(--neutral-800)">${user?.phone || 'Not set'}</div>
                        </div>
                        <span style="color:var(--success-500);font-size:11px;background:var(--success-50);padding:2px 8px;border-radius:20px">Verified</span>
                    </div>
                    <div style="display:flex;justify-content:space-between;align-items:center;padding:10px 0;border-bottom:1px solid var(--neutral-50)">
                        <div>
                            <div style="font-size:11px;color:var(--neutral-400);margin-bottom:2px">Email Address</div>
                            <div style="font-size:var(--font-sm);font-weight:600;color:var(--neutral-800)">${user?.email || 'Not set'}</div>
                        </div>
                    </div>
                    <div style="display:flex;justify-content:space-between;align-items:center;padding:10px 0;border-bottom:1px solid var(--neutral-50)">
                        <div>
                            <div style="font-size:11px;color:var(--neutral-400);margin-bottom:2px">Password</div>
                            <div style="font-size:var(--font-sm);font-weight:600;color:var(--neutral-800)">••••••••</div>
                        </div>
                        <button onclick="showChangePassword()" style="font-size:11px;color:var(--primary-500);background:var(--primary-50);padding:4px 10px;border-radius:20px;border:none;cursor:pointer;font-weight:600">Change</button>
                    </div>
                    <div style="padding:10px 0">
                        <div style="font-size:11px;color:var(--neutral-400);margin-bottom:2px">Address</div>
                        <div style="font-size:var(--font-sm);color:var(--neutral-600);line-height:1.4">${user?.address || 'Not set'}</div>
                    </div>
                </div>
            </div>

            <!-- Menu -->
            <div class="profile-menu">
                <div class="profile-menu-item" onclick="showEditProfile()" id="menu-edit-profile">
                    <div class="menu-icon">${Icons.user}</div>
                    <span class="menu-label">Edit Profile</span>
                    <span class="menu-arrow">${Icons.chevronRight}</span>
                </div>
                <div class="profile-menu-item" onclick="Router.navigate('customer-orders')" id="menu-orders">
                    <div class="menu-icon">${Icons.orders}</div>
                    <span class="menu-label">My Orders</span>
                    <span class="menu-arrow">${Icons.chevronRight}</span>
                </div>
                <div class="profile-menu-item" onclick="updateProfileLocation()" id="menu-update-location">
                    <div class="menu-icon">${Icons.mapPin}</div>
                    <span class="menu-label">Update My Location</span>
                    <span class="menu-arrow">${Icons.chevronRight}</span>
                </div>
                <div class="divider"></div>
                <div class="profile-menu-item danger" onclick="handleLogout()" id="menu-logout">
                    <div class="menu-icon">${Icons.logout}</div>
                    <span class="menu-label">Logout</span>
                    <span class="menu-arrow">${Icons.chevronRight}</span>
                </div>
            </div>
        </div>

        ${UI.renderCustomerNav('profile')}
    `;
}

function showEditProfile() {
    const user = DataStore.getCurrentUser();
    const content = `
        <div class="input-group mb-4">
            <label class="input-label">Full Name</label>
            <input type="text" class="input-field" id="edit-name" value="${user?.name || ''}">
        </div>
        <div class="input-group mb-4">
            <label class="input-label">Email</label>
            <input type="email" class="input-field" id="edit-email" value="${user?.email || ''}" placeholder="your@email.com">
        </div>
        <div class="input-group mb-4">
            <label class="input-label">Phone Number</label>
            <input type="tel" class="input-field" id="edit-phone" value="${user?.phone || ''}" disabled style="background:var(--neutral-50);color:var(--neutral-400)">
            <span style="font-size:10px;color:var(--neutral-400);margin-top:4px;display:block">Phone cannot be changed</span>
        </div>
        <div class="input-group mb-4">
            <label class="input-label">Address</label>
            <textarea class="input-field" id="edit-address" rows="2" placeholder="Enter your address">${user?.address || ''}</textarea>
        </div>
        <button class="btn btn-ghost btn-sm mb-4" onclick="autoDetectEditLocation()" id="btn-edit-detect" style="width:100%;color:var(--primary-600);border:1px dashed var(--primary-200);border-radius:var(--radius-md);padding:10px">
            📍 Auto-detect my location
        </button>
        <input type="hidden" id="edit-lat" value="${user?.lat || ''}">
        <input type="hidden" id="edit-lng" value="${user?.lng || ''}">
        <button class="btn btn-primary btn-block" onclick="saveProfile()" id="save-profile-btn">Save Changes</button>
    `;
    UI.showModal(content, { title: 'Edit Profile' });
}

function showChangePassword() {
    const content = `
        <div class="input-group mb-4">
            <label class="input-label">Current Password</label>
            <input type="password" class="input-field" id="change-old-pwd" placeholder="Enter current password">
        </div>
        <div class="input-group mb-4">
            <label class="input-label">New Password</label>
            <input type="password" class="input-field" id="change-new-pwd" placeholder="Min 6 characters">
        </div>
        <div class="input-group mb-6">
            <label class="input-label">Confirm New Password</label>
            <input type="password" class="input-field" id="change-new-pwd2" placeholder="Re-enter new password">
        </div>
        <button class="btn btn-primary btn-block" onclick="changePasswordAction()" id="btn-change-pwd">Change Password</button>
    `;
    UI.showModal(content, { title: 'Change Password' });
}

function changePasswordAction() {
    const user = DataStore.getCurrentUser();
    const oldPwd = document.getElementById('change-old-pwd')?.value;
    const newPwd = document.getElementById('change-new-pwd')?.value;
    const newPwd2 = document.getElementById('change-new-pwd2')?.value;

    if (!oldPwd) { UI.showToast('Enter current password', 'error'); return; }
    if (!DataStore.verifyPassword(user.id, oldPwd)) { UI.showToast('Current password is wrong', 'error'); return; }
    if (!newPwd || newPwd.length < 6) { UI.showToast('New password min 6 characters', 'error'); return; }
    if (newPwd !== newPwd2) { UI.showToast('Passwords do not match', 'error'); return; }

    DataStore.updateUserPassword(user.id, newPwd);
    UI.closeModal();
    UI.showToast('Password changed successfully!', 'success');
}

async function autoDetectEditLocation() {
    const btn = document.getElementById('btn-edit-detect');
    btn.innerHTML = `<span class="spinner" style="width:12px;height:12px;border-width:2px;display:inline-block"></span> Detecting...`;
    btn.disabled = true;
    try {
        const pos = await GeoUtils.getCurrentPosition();
        document.getElementById('edit-lat').value = pos.lat;
        document.getElementById('edit-lng').value = pos.lng;
        const address = await GeoUtils.reverseGeocode(pos.lat, pos.lng);
        document.getElementById('edit-address').value = address;
        btn.innerHTML = '✅ Location detected';
        btn.style.color = 'var(--success-600)';
    } catch (err) {
        btn.innerHTML = '📍 Auto-detect my location';
        btn.disabled = false;
        UI.showToast(err.message, 'error');
    }
}

async function updateProfileLocation() {
    UI.showToast('Detecting your location...', 'default');
    try {
        const pos = await GeoUtils.getCurrentPosition();
        const address = await GeoUtils.reverseGeocode(pos.lat, pos.lng);
        const user = DataStore.getCurrentUser();
        await DataStore.updateUser({ ...user, lat: pos.lat, lng: pos.lng, address });
        UI.showToast('Location updated!', 'success');
        renderCustomerProfile(document.getElementById('app-content'));
    } catch (err) { UI.showToast(err.message, 'error'); }
}

async function saveProfile() {
    const user = DataStore.getCurrentUser();
    const name = document.getElementById('edit-name')?.value?.trim();
    const email = document.getElementById('edit-email')?.value?.trim();
    const address = document.getElementById('edit-address')?.value?.trim();
    const lat = parseFloat(document.getElementById('edit-lat')?.value) || user?.lat || 0;
    const lng = parseFloat(document.getElementById('edit-lng')?.value) || user?.lng || 0;
    if (!name) { UI.showToast('Name is required', 'error'); return; }
    
    const btn = document.getElementById('save-profile-btn');
    const oldText = btn.innerHTML;
    btn.innerHTML = `<span class="spinner" style="width:14px;height:14px;border-width:2px;display:inline-block"></span>`;
    btn.disabled = true;

    try {
        await DataStore.updateUser({ ...user, name, email, address, lat, lng });
        UI.closeModal();
        UI.showToast('Profile updated!', 'success');
        renderCustomerProfile(document.getElementById('app-content'));
    } catch (e) {
        btn.innerHTML = oldText;
        btn.disabled = false;
        UI.showToast(e.message || 'Update failed', 'error');
    }
}

function handleLogout() {
    UI.confirm('Logout', 'Are you sure you want to logout?', () => {
        DataStore.logout();
        Router.clearHistory();
        Router.navigate('role-select');
        UI.showToast('Logged out successfully', 'success');
    });
}
