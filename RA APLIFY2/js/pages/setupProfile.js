// ========================== //
// RAPLIFY - Profile Setup     //
// ========================== //

function renderSetupProfile(container) {
    const user = DataStore.getCurrentUser();
    if (!user) { Router.navigate('role-select'); return; }

    const role = user.role;
    const isSeller = role === 'seller';

    container.innerHTML = `
        <div class="auth-page">
            <div class="auth-top" style="padding-bottom:120px">
                <h1>Complete Your Profile</h1>
                <p>We need a few details to get you started</p>
            </div>

            <div class="auth-form-container" style="margin-top:-90px">
                <div class="auth-form-card">
                    <div style="text-align:center;margin-bottom:var(--space-6)">
                        <div style="width:80px;height:80px;border-radius:50%;background:var(--gradient-primary);color:white;display:flex;align-items:center;justify-content:center;font-size:32px;margin:0 auto var(--space-4)">
                            ${isSeller ? Icons.store : Icons.user}
                        </div>
                        <h2 style="font-size:var(--font-lg);font-weight:700">Account Details</h2>
                        <p class="text-sm text-muted">For +91 ${user.phone}</p>
                    </div>

                    <!-- Full Name -->
                    <div class="input-group mb-4">
                        <label class="input-label">Full Name *</label>
                        <div class="input-icon-wrapper">
                            <span class="input-icon">${Icons.user}</span>
                            <input type="text" class="input-field" id="setup-name" placeholder="${isSeller ? 'e.g., Rahul Sharma' : 'e.g., Anjali Iyer'}" style="padding-left:44px" value="${user.name || ''}">
                        </div>
                    </div>

                    <!-- Email -->
                    <div class="input-group mb-4">
                        <label class="input-label">Email Address *</label>
                        <div class="input-icon-wrapper">
                            <span class="input-icon">✉️</span>
                            <input type="email" class="input-field" id="setup-email" placeholder="your@email.com" style="padding-left:44px" value="${user.email || ''}">
                        </div>
                    </div>

                    <!-- Address -->
                    <div class="input-group mb-4">
                        <label class="input-label">Full Address *</label>
                        <div class="input-icon-wrapper" style="align-items:flex-start">
                            <span class="input-icon" style="top:12px">${Icons.mapPin}</span>
                            <textarea class="input-field" id="setup-address" rows="2" placeholder="${isSeller ? 'Your store address...' : 'Your residential address...'}" style="padding-left:44px;resize:none">${user.address || ''}</textarea>
                        </div>
                    </div>

                    <!-- Location picker buttons -->
                    <div style="display:flex;gap:8px;margin-bottom:var(--space-6)">
                        <button class="btn btn-ghost btn-sm" onclick="autoDetectSetupLocation()" id="btn-detect-location" style="flex:1;color:var(--primary-600);border:1px dashed var(--primary-200);border-radius:var(--radius-lg);padding:12px">
                            📍 Auto-detect
                        </button>
                        <button class="btn btn-ghost btn-sm" onclick="openMapPickerSetup()" id="btn-map-picker" style="flex:1;color:var(--primary-500);border:1px solid var(--primary-200);border-radius:var(--radius-lg);padding:12px">
                            🗺️ Select on Map
                        </button>
                    </div>

                    <input type="hidden" id="setup-lat" value="${user.lat || ''}">
                    <input type="hidden" id="setup-lng" value="${user.lng || ''}">

                    <button class="btn btn-primary btn-block btn-lg" onclick="saveInitialProfile()" id="btn-complete-setup">
                        Complete Setup
                    </button>
                </div>
            </div>
        </div>
    `;
}

async function autoDetectSetupLocation() {
    const btn = document.getElementById('btn-detect-location');
    btn.innerHTML = `<span class="spinner" style="width:14px;height:14px;border-width:2px;display:inline-block"></span> Detecting location...`;
    btn.disabled = true;

    try {
        const pos = await GeoUtils.getCurrentPosition();
        document.getElementById('setup-lat').value = pos.lat;
        document.getElementById('setup-lng').value = pos.lng;

        // Reverse geocode for address
        const address = await GeoUtils.reverseGeocode(pos.lat, pos.lng);
        document.getElementById('setup-address').value = address;

        btn.innerHTML = `✅ Location Detected`;
        btn.style.color = 'var(--success-600)';
        btn.style.borderColor = 'var(--success-200)';
        UI.showToast('Location detected successfully!', 'success');
    } catch (err) {
        btn.innerHTML = `❌ ${err.message}`;
        btn.style.color = 'var(--error-600)';
        btn.disabled = false;
        setTimeout(() => {
            btn.innerHTML = '📍 Auto-detect my location';
            btn.style.color = 'var(--primary-600)';
            btn.style.borderColor = 'var(--primary-200)';
        }, 3000);
        UI.showToast(err.message, 'error');
    }
}

function openMapPickerSetup() {
    const clat = parseFloat(document.getElementById('setup-lat').value) || 28.6139;
    const clng = parseFloat(document.getElementById('setup-lng').value) || 77.2090;
    
    GeoUtils.openLocationPicker(clat, clng, async (lat, lng) => {
        document.getElementById('setup-lat').value = lat;
        document.getElementById('setup-lng').value = lng;
        UI.showToast('Fetching address...', 'success');
        const address = await GeoUtils.reverseGeocode(lat, lng);
        document.getElementById('setup-address').value = address;
    });
}

async function saveInitialProfile() {
    const user = DataStore.getCurrentUser();
    const name = document.getElementById('setup-name')?.value?.trim();
    const email = document.getElementById('setup-email')?.value?.trim();
    const address = document.getElementById('setup-address')?.value?.trim();
    const lat = document.getElementById('setup-lat')?.value;
    const lng = document.getElementById('setup-lng')?.value;

    if (!name || name.length < 2) {
        UI.showToast('Please enter your full name', 'error'); return;
    }
    if (!email || !email.includes('@') || !email.includes('.')) {
        UI.showToast('Please enter a valid email address', 'error'); return;
    }
    if (!address || address.length < 5) {
        UI.showToast('Please enter your complete address', 'error'); return;
    }
    if (!lat || !lng || lat === '0' || lng === '0') {
        UI.showToast('Please detect your location using the button above', 'error'); return;
    }

    const btn = document.getElementById('btn-complete-setup');
    btn.innerHTML = `<span class="spinner" style="width:20px;height:20px;border-width:2px;display:inline-block"></span> Saving...`;
    btn.disabled = true;

    try {
        await DataStore.updateUser({
            ...user,
            name,
            email,
            address,
            lat: parseFloat(lat),
            lng: parseFloat(lng),
            isNew: false
        });

        UI.showToast('Profile created successfully!', 'success');

        if (user.role === 'customer') {
            Router.navigate('customer-home');
        } else {
            const stores = DataStore.getStoresByOwner(user.id);
            if (stores.length === 0) {
                Router.navigate('seller-store-setup', { isNew: true });
            } else {
                Router.navigate('seller-dashboard');
            }
        }
    } catch (e) {
        btn.innerHTML = 'Complete Setup';
        btn.disabled = false;
        UI.showToast(e.message || 'Verification failed. Please try again', 'error');
    }
}
