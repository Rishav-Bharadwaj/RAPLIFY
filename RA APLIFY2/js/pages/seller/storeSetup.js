// ========================== //
// Seller - Store Setup        //
// ========================== //

function renderSellerStoreSetup(container, params = {}) {
    const user = DataStore.getCurrentUser();
    const stores = DataStore.getStoresByOwner(user?.id || '');
    const store = stores[0];
    const isNew = params.isNew || !store;
    const categories = DataStore.getCategories();

    const s = store || {
        name: '', category: 'Kirana', location: '', emoji: '🏪',
        home_delivery_enabled: false, delivery_radius_km: 3,
        open_time: '9:00 AM', close_time: '9:00 PM',
        description: '', image_color: '#6C3CE1', lat: 0, lng: 0
    };

    container.innerHTML = `
        ${UI.renderHeader(isNew ? 'Setup Your Store' : 'Store Settings', {
            showBack: !isNew
        })}

        <div class="page-content">
            ${isNew ? `
                <div style="text-align:center;padding:var(--space-6) var(--space-4) var(--space-2)">
                    <div style="font-size:48px;margin-bottom:var(--space-3)">🏪</div>
                    <h2 style="font-size:var(--font-xl);font-weight:800;color:var(--neutral-800);margin-bottom:var(--space-1)">Welcome to RAPLIFY!</h2>
                    <p class="text-sm text-muted">Let's set up your store in just a few steps</p>
                </div>
            ` : ''}

            <!-- Unique Code Display (for existing stores) -->
            ${!isNew && user?.uniqueCode ? `
                <div style="margin:var(--space-4);padding:var(--space-4);background:var(--primary-50);border-radius:var(--radius-lg);border:1px solid var(--primary-100);text-align:center">
                    <div style="font-size:10px;color:var(--primary-400);text-transform:uppercase;font-weight:600;letter-spacing:1px;margin-bottom:4px">Your Seller Code</div>
                    <div style="font-size:22px;font-weight:900;letter-spacing:3px;color:var(--primary-600);font-family:monospace">${user.uniqueCode}</div>
                    <div style="font-size:11px;color:var(--neutral-400);margin-top:4px">Use this code to login to your account</div>
                </div>
            ` : ''}

            <div style="padding:var(--space-4)">
                <!-- Store Name -->
                <div class="input-group mb-4">
                    <label class="input-label">Store Name *</label>
                    <input type="text" class="input-field" id="store-name" value="${Utils.escapeHtml(s.name)}" placeholder="e.g., Amit General Store">
                </div>

                <!-- Category -->
                <div class="input-group mb-4">
                    <label class="input-label">Store Category *</label>
                    <select class="input-field" id="store-category" style="appearance:auto" onchange="handleCategoryChange(this.value)">
                        ${categories.map(c => `<option value="${c.name}" ${s.category === c.name ? 'selected' : ''}>${c.emoji} ${c.name}</option>`).join('')}
                    </select>
                </div>

                <!-- Custom Category (shown when "More" is selected) -->
                <div class="input-group mb-4" id="custom-category-group" style="display:${s.category === 'More' ? 'block' : 'none'}">
                    <label class="input-label">Your Shop Type *</label>
                    <input type="text" class="input-field" id="store-custom-category" value="${!categories.find(c=>c.name===s.category) ? s.category : ''}" placeholder="e.g., Book Store, Flower Shop, Toy Store...">
                </div>

                <!-- Store Emoji -->
                <div class="input-group mb-4">
                    <label class="input-label">Store Icon (Emoji)</label>
                    <input type="text" class="input-field" id="store-emoji" value="${s.emoji}" placeholder="🏪">
                </div>

                <!-- Store Location -->
                <div class="input-group mb-4">
                    <label class="input-label">Store Address *</label>
                    <input type="text" class="input-field" id="store-location" value="${Utils.escapeHtml(s.location || '')}" placeholder="Full store address...">
                </div>
                <div style="display:flex;gap:8px;margin-bottom:var(--space-4)">
                    <button class="btn btn-ghost btn-sm" onclick="autoDetectStoreLocation()" id="btn-store-detect" style="flex:1;color:var(--primary-600);border:1px dashed var(--primary-200);border-radius:var(--radius-lg);padding:12px">
                        📍 Auto-detect
                    </button>
                    <button class="btn btn-ghost btn-sm" onclick="openMapPickerStoreSetup()" id="btn-store-map-picker" style="flex:1;color:var(--primary-500);border:1px solid var(--primary-200);border-radius:var(--radius-lg);padding:12px">
                        🗺️ Select on Map
                    </button>
                </div>
                <input type="hidden" id="store-lat" value="${s.lat || user?.lat || ''}">
                <input type="hidden" id="store-lng" value="${s.lng || user?.lng || ''}">

                <!-- Description -->
                <div class="input-group mb-4">
                    <label class="input-label">Description</label>
                    <textarea class="input-field" id="store-description" rows="3" placeholder="Tell customers about your store...">${Utils.escapeHtml(s.description || '')}</textarea>
                </div>

                <!-- Timings -->
                <div class="flex gap-3 mb-4">
                    <div class="input-group flex-1">
                        <label class="input-label">Open Time</label>
                        <input type="text" class="input-field" id="store-open" value="${s.open_time}" placeholder="9:00 AM">
                    </div>
                    <div class="input-group flex-1">
                        <label class="input-label">Close Time</label>
                        <input type="text" class="input-field" id="store-close" value="${s.close_time}" placeholder="9:00 PM">
                    </div>
                </div>

                <div class="divider"></div>

                <!-- DELIVERY CONFIGURATION -->
                <h3 style="font-size:var(--font-md);font-weight:700;color:var(--neutral-800);margin-bottom:var(--space-4)">
                    🚚 Delivery Configuration
                </h3>

                <div style="background:var(--primary-50);padding:var(--space-4);border-radius:var(--radius-lg);margin-bottom:var(--space-4)">
                    <div class="flex items-center justify-between mb-3">
                        <div>
                            <h4 class="font-semibold">Home Delivery Available</h4>
                            <p class="text-xs text-muted">Allow customers to order home delivery</p>
                        </div>
                        <label class="toggle-switch">
                            <input type="checkbox" id="store-delivery-toggle" ${s.home_delivery_enabled ? 'checked' : ''} onchange="toggleDeliverySection(this.checked)">
                            <span class="toggle-slider"></span>
                        </label>
                    </div>

                    <div id="delivery-radius-section" style="display:${s.home_delivery_enabled ? 'block' : 'none'}">
                        <label class="input-label mb-2">Delivery Radius (km) *</label>
                        <div class="flex gap-2 mb-3">
                            <button class="chip ${s.delivery_radius_km === 3 ? 'active' : ''}" onclick="setRadius(3, this)" id="radius-3">3 km</button>
                            <button class="chip ${s.delivery_radius_km === 5 ? 'active' : ''}" onclick="setRadius(5, this)" id="radius-5">5 km</button>
                            <button class="chip ${s.delivery_radius_km === 7 ? 'active' : ''}" onclick="setRadius(7, this)" id="radius-7">7 km</button>
                            <button class="chip ${![3,5,7].includes(s.delivery_radius_km) ? 'active' : ''}" onclick="setRadius(0, this)" id="radius-custom">Custom</button>
                        </div>
                        <div id="custom-radius-input" style="display:${![3,5,7].includes(s.delivery_radius_km) && s.delivery_radius_km > 0 ? 'block' : 'none'}">
                            <input type="number" class="input-field" id="store-radius-custom" value="${s.delivery_radius_km}" placeholder="Enter radius in km">
                        </div>
                        <input type="hidden" id="store-delivery-radius" value="${s.delivery_radius_km}">
                    </div>

                    <div id="delivery-off-message" style="display:${s.home_delivery_enabled ? 'none' : 'block'}">
                        <p class="text-sm text-muted" style="padding:var(--space-2) 0">
                            ℹ️ Your store will be marked as <strong>"Pickup Only"</strong>.
                        </p>
                    </div>
                </div>

                <!-- Theme Color -->
                <div class="input-group mb-6">
                    <label class="input-label">Store Theme Color</label>
                    <div class="flex gap-2 mt-2">
                        ${['#6C3CE1', '#E14BC3', '#10B981', '#F59E0B', '#EF4444', '#3B82F6', '#059669', '#DC2626'].map(color => `
                            <button style="width:36px;height:36px;border-radius:50%;background:${color};border:3px solid ${s.image_color === color ? 'var(--neutral-800)' : 'transparent'};cursor:pointer;transition:var(--transition-fast)"
                                onclick="selectStoreColor('${color}', this)" class="color-btn" data-color="${color}"></button>
                        `).join('')}
                    </div>
                    <input type="hidden" id="store-color" value="${s.image_color}">
                </div>

                <!-- Save Button -->
                <button class="btn btn-primary btn-block btn-lg" onclick="saveStore(${isNew}, '${store?.id || ''}')" id="btn-save-store">
                    ${isNew ? 'Create Store' : 'Save Changes'}
                </button>

                ${!isNew ? `
                    <!-- Account Info Section -->
                    <div style="margin-top:var(--space-6);background:var(--neutral-50);border-radius:var(--radius-xl);padding:var(--space-4);border:1px solid var(--neutral-100)">
                        <h3 style="font-size:var(--font-sm);font-weight:700;color:var(--neutral-800);margin-bottom:var(--space-4);display:flex;align-items:center;gap:8px">🔐 Account Information</h3>
                        <div style="display:flex;flex-direction:column;gap:var(--space-3)">
                            ${user?.uniqueCode ? `
                            <div style="display:flex;justify-content:space-between;align-items:center;padding:10px 0;border-bottom:1px solid var(--neutral-200)">
                                <div><div style="font-size:11px;color:var(--neutral-400);margin-bottom:2px">Unique Seller Code</div>
                                <div style="font-size:var(--font-sm);font-weight:900;color:var(--primary-600);font-family:monospace;letter-spacing:2px">${user.uniqueCode}</div></div>
                                <span style="font-size:10px;color:var(--primary-500);background:var(--primary-50);padding:2px 8px;border-radius:20px">Share this!</span>
                            </div>` : ''}
                            <div style="display:flex;justify-content:space-between;align-items:center;padding:10px 0;border-bottom:1px solid var(--neutral-200)">
                                <div><div style="font-size:11px;color:var(--neutral-400);margin-bottom:2px">Phone</div>
                                <div style="font-size:var(--font-sm);font-weight:600">${user?.phone || 'Not set'}</div></div>
                                <span style="color:var(--success-500);font-size:11px;background:var(--success-50);padding:2px 8px;border-radius:20px">Verified</span>
                            </div>
                            <div style="display:flex;justify-content:space-between;align-items:center;padding:10px 0;border-bottom:1px solid var(--neutral-200)">
                                <div><div style="font-size:11px;color:var(--neutral-400);margin-bottom:2px">Email</div>
                                <div style="font-size:var(--font-sm);font-weight:600">${user?.email || 'Not set'}</div></div>
                            </div>
                            <div style="display:flex;justify-content:space-between;align-items:center;padding:10px 0">
                                <div><div style="font-size:11px;color:var(--neutral-400);margin-bottom:2px">Password</div>
                                <div style="font-size:var(--font-sm);font-weight:600">••••••••</div></div>
                                <button onclick="showSellerChangePassword()" style="font-size:11px;color:var(--primary-500);background:var(--primary-50);padding:4px 10px;border-radius:20px;border:none;cursor:pointer;font-weight:600">Change</button>
                            </div>
                        </div>
                        <button class="btn btn-ghost btn-sm mt-4" onclick="showSellerEditProfile()" style="width:100%;border:1px dashed var(--primary-200);color:var(--primary-600);border-radius:var(--radius-md);padding:10px">
                            ✏️ Edit Name & Email
                        </button>
                    </div>

                    <div class="divider" style="margin:var(--space-6) 0 var(--space-4)"></div>
                    <div class="profile-menu-item danger" onclick="handleSellerLogout()" id="seller-logout">
                        <div class="menu-icon">${Icons.logout}</div>
                        <span class="menu-label">Logout</span>
                        <span class="menu-arrow">${Icons.chevronRight}</span>
                    </div>
                ` : ''}
            </div>
        </div>

        ${isNew ? '' : UI.renderSellerNav('settings')}
    `;
}

function handleCategoryChange(value) {
    const customGroup = document.getElementById('custom-category-group');
    if (customGroup) {
        customGroup.style.display = value === 'More' ? 'block' : 'none';
    }
}

async function autoDetectStoreLocation() {
    const btn = document.getElementById('btn-store-detect');
    btn.innerHTML = `<span class="spinner" style="width:14px;height:14px;border-width:2px;display:inline-block"></span> Detecting location...`;
    btn.disabled = true;

    try {
        const pos = await GeoUtils.getCurrentPosition();
        document.getElementById('store-lat').value = pos.lat;
        document.getElementById('store-lng').value = pos.lng;

        const address = await GeoUtils.reverseGeocode(pos.lat, pos.lng);
        document.getElementById('store-location').value = address;

        btn.innerHTML = '✅ Location Detected';
        btn.style.color = 'var(--success-600)';
        btn.style.borderColor = 'var(--success-200)';
        UI.showToast('Store location detected!', 'success');
    } catch (err) {
        btn.innerHTML = '📍 Auto-detect store location';
        btn.disabled = false;
        UI.showToast(err.message, 'error');
    }
}

function openMapPickerStoreSetup() {
    const clat = parseFloat(document.getElementById('store-lat').value) || parseFloat(DataStore.getCurrentUser().lat) || 28.6139;
    const clng = parseFloat(document.getElementById('store-lng').value) || parseFloat(DataStore.getCurrentUser().lng) || 77.2090;
    
    GeoUtils.openLocationPicker(clat, clng, async (lat, lng) => {
        document.getElementById('store-lat').value = lat;
        document.getElementById('store-lng').value = lng;
        UI.showToast('Fetching address...', 'success');
        const address = await GeoUtils.reverseGeocode(lat, lng);
        document.getElementById('store-location').value = address;
    });
}

function toggleDeliverySection(enabled) {
    const section = document.getElementById('delivery-radius-section');
    const offMsg = document.getElementById('delivery-off-message');
    if (section) section.style.display = enabled ? 'block' : 'none';
    if (offMsg) offMsg.style.display = enabled ? 'none' : 'block';
}

let _selectedRadius = 3;
function setRadius(km, btn) {
    document.querySelectorAll('#delivery-radius-section .chip').forEach(c => c.classList.remove('active'));
    btn.classList.add('active');

    const customInput = document.getElementById('custom-radius-input');
    const hiddenInput = document.getElementById('store-delivery-radius');

    if (km === 0) {
        if (customInput) customInput.style.display = 'block';
    } else {
        if (customInput) customInput.style.display = 'none';
        if (hiddenInput) hiddenInput.value = km;
        _selectedRadius = km;
    }
}

function selectStoreColor(color, btn) {
    document.querySelectorAll('.color-btn').forEach(b => b.style.borderColor = 'transparent');
    btn.style.borderColor = 'var(--neutral-800)';
    document.getElementById('store-color').value = color;
}

function saveStore(isNew, storeId) {
    const name = document.getElementById('store-name')?.value?.trim();
    let category = document.getElementById('store-category')?.value;
    const emoji = document.getElementById('store-emoji')?.value?.trim() || '🏪';
    const location = document.getElementById('store-location')?.value?.trim();
    const description = document.getElementById('store-description')?.value?.trim();
    const open_time = document.getElementById('store-open')?.value?.trim();
    const close_time = document.getElementById('store-close')?.value?.trim();
    const home_delivery_enabled = document.getElementById('store-delivery-toggle')?.checked;
    const lat = parseFloat(document.getElementById('store-lat')?.value) || 0;
    const lng = parseFloat(document.getElementById('store-lng')?.value) || 0;

    // Handle "More" custom category
    if (category === 'More') {
        const customCat = document.getElementById('store-custom-category')?.value?.trim();
        if (!customCat) {
            UI.showToast('Please enter your shop type', 'error');
            return;
        }
        category = customCat;
        // Add to categories list if new
        const existing = DataStore.getCategories().find(c => c.name.toLowerCase() === customCat.toLowerCase());
        if (!existing) {
            DataStore.addCategory(customCat, '🏷️', '#6B7280');
        }
    }

    let delivery_radius_km = parseInt(document.getElementById('store-delivery-radius')?.value) || 0;
    const customRadius = document.getElementById('store-radius-custom')?.value;
    if (customRadius && document.getElementById('custom-radius-input')?.style.display !== 'none') {
        delivery_radius_km = parseInt(customRadius) || 3;
    }

    const image_color = document.getElementById('store-color')?.value || '#6C3CE1';

    if (!name) { UI.showToast('Store name is required', 'error'); return; }
    if (!location) { UI.showToast('Store location is required', 'error'); return; }
    if (!lat || !lng) { UI.showToast('Please detect your store location', 'error'); return; }
    if (home_delivery_enabled && !delivery_radius_km) { UI.showToast('Please set a delivery radius', 'error'); return; }

    const user = DataStore.getCurrentUser();
    const storeData = {
        owner_id: user.id,
        name, category, emoji, location, description,
        open_time, close_time,
        home_delivery_enabled,
        delivery_radius_km: home_delivery_enabled ? delivery_radius_km : 0,
        image_color,
        lat, lng
    };

    const btn = document.getElementById('btn-save-store');
    btn.innerHTML = `<span class="spinner" style="width:20px;height:20px;border-width:2px;display:inline-block"></span> Saving...`;
    btn.disabled = true;

    setTimeout(() => {
        if (isNew) {
            DataStore.createStore(storeData);
            UI.showToast('Store created successfully! 🎉', 'success');
            Router.navigate('seller-dashboard');
        } else {
            DataStore.updateStore(storeId, storeData);
            UI.showToast('Store settings updated!', 'success');
            btn.innerHTML = 'Save Changes';
            btn.disabled = false;
        }
    }, 800);
}

function handleSellerLogout() {
    UI.confirm('Logout', 'Are you sure you want to logout?', () => {
        DataStore.logout();
        Router.clearHistory();
        Router.navigate('role-select');
        UI.showToast('Logged out successfully', 'success');
    });
}

function showSellerChangePassword() {
    const content = `
        <div class="input-group mb-4">
            <label class="input-label">Current Password</label>
            <input type="password" class="input-field" id="seller-old-pwd" placeholder="Enter current password">
        </div>
        <div class="input-group mb-4">
            <label class="input-label">New Password</label>
            <input type="password" class="input-field" id="seller-new-pwd" placeholder="Min 6 characters">
        </div>
        <div class="input-group mb-6">
            <label class="input-label">Confirm New Password</label>
            <input type="password" class="input-field" id="seller-new-pwd2" placeholder="Re-enter new password">
        </div>
        <button class="btn btn-primary btn-block" onclick="sellerChangePasswordAction()" id="btn-seller-change-pwd">Change Password</button>
    `;
    UI.showModal(content, { title: 'Change Password' });
}

function sellerChangePasswordAction() {
    const user = DataStore.getCurrentUser();
    const oldPwd = document.getElementById('seller-old-pwd')?.value;
    const newPwd = document.getElementById('seller-new-pwd')?.value;
    const newPwd2 = document.getElementById('seller-new-pwd2')?.value;
    if (!oldPwd) { UI.showToast('Enter current password', 'error'); return; }
    if (!DataStore.verifyPassword(user.id, oldPwd)) { UI.showToast('Current password is wrong', 'error'); return; }
    if (!newPwd || newPwd.length < 6) { UI.showToast('New password min 6 characters', 'error'); return; }
    if (newPwd !== newPwd2) { UI.showToast('Passwords do not match', 'error'); return; }
    DataStore.updateUserPassword(user.id, newPwd);
    UI.closeModal();
    UI.showToast('Password changed!', 'success');
}

function showSellerEditProfile() {
    const user = DataStore.getCurrentUser();
    const content = `
        <div class="input-group mb-4">
            <label class="input-label">Full Name</label>
            <input type="text" class="input-field" id="seller-edit-name" value="${user?.name || ''}">
        </div>
        <div class="input-group mb-4">
            <label class="input-label">Email</label>
            <input type="email" class="input-field" id="seller-edit-email" value="${user?.email || ''}" placeholder="your@email.com">
        </div>
        <div class="input-group mb-4">
            <label class="input-label">Phone</label>
            <input type="tel" class="input-field" value="${user?.phone || ''}" disabled style="background:var(--neutral-50);color:var(--neutral-400)">
            <span style="font-size:10px;color:var(--neutral-400);margin-top:4px;display:block">Phone cannot be changed</span>
        </div>
        <button class="btn btn-primary btn-block" onclick="saveSellerProfile()" id="btn-save-seller-profile">Save Changes</button>
    `;
    UI.showModal(content, { title: 'Edit Profile' });
}

async function saveSellerProfile() {
    const user = DataStore.getCurrentUser();
    const name = document.getElementById('seller-edit-name')?.value?.trim();
    const email = document.getElementById('seller-edit-email')?.value?.trim();
    if (!name) { UI.showToast('Name is required', 'error'); return; }
    
    const btn = document.getElementById('btn-save-seller-profile');
    const oldText = btn.innerHTML;
    btn.innerHTML = `<span class="spinner" style="width:14px;height:14px;border-width:2px;display:inline-block"></span>`;
    btn.disabled = true;

    try {
        await DataStore.updateUser({ ...user, name, email });
        UI.closeModal();
        UI.showToast('Profile updated!', 'success');
        renderSellerStoreSetup(document.getElementById('app-content'));
    } catch(e) {
        btn.innerHTML = oldText;
        btn.disabled = false;
        UI.showToast(e.message || 'Update failed', 'error');
    }
}

