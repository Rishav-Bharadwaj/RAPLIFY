// ========================== //
// RAPLIFY - Auth Page         //
// ========================== //

let _authRole = '';
let _authPhone = '';
let _authPwd = '';

function renderAuth(container, params = {}) {
    _authRole = params.role || 'customer';
    if (_authRole === 'seller') { renderSellerAuth(container); return; }
    renderCustomerAuth(container);
}

// ============ CUSTOMER AUTH ============
function renderCustomerAuth(container) {
    container.innerHTML = `
        <div class="auth-page">
            <div class="auth-top">
                <button class="back-btn" onclick="Router.navigate('role-select')" style="position:absolute;top:16px;left:16px;color:white;width:36px;height:36px;display:flex;align-items:center;justify-content:center;border-radius:10px" id="auth-back">${Icons.back}</button>
                <h1>Welcome, Customer!</h1>
                <p>Login or create your account</p>
            </div>
            <div class="auth-form-container">
                <div class="auth-form-card" id="auth-form-card">
                    <!-- Tab -->
                    <div style="display:flex;gap:0;margin-bottom:var(--space-6);border-radius:var(--radius-lg);overflow:hidden;border:2px solid var(--primary-100)">
                        <button class="cust-auth-tab" id="ctab-login" onclick="switchCustTab('login')" style="flex:1;padding:12px;font-weight:600;font-size:var(--font-sm);border:none;cursor:pointer;transition:all 0.3s;background:var(--primary-500);color:white">Login</button>
                        <button class="cust-auth-tab" id="ctab-signup" onclick="switchCustTab('signup')" style="flex:1;padding:12px;font-weight:600;font-size:var(--font-sm);border:none;cursor:pointer;transition:all 0.3s;background:transparent;color:var(--primary-500)">Sign Up</button>
                    </div>

                    <!-- LOGIN -->
                    <form id="cust-login-form" onsubmit="event.preventDefault(); custLoginAction();">
                        <div class="input-group mb-4">
                            <label class="input-label">Phone Number</label>
                            <div class="input-icon-wrapper">
                                <span class="input-icon">${Icons.phone}</span>
                                <input type="tel" class="input-field" id="cust-login-phone" placeholder="10-digit phone" maxlength="10" style="padding-left:44px">
                            </div>
                        </div>
                        <div class="input-group mb-6">
                            <label class="input-label">Password</label>
                            <div class="input-icon-wrapper">
                                <span class="input-icon">${Icons.lock}</span>
                                <input type="password" class="input-field" id="cust-login-pwd" placeholder="Enter your password" style="padding-left:44px" autocomplete="current-password">
                            </div>
                        </div>
                        <button type="submit" class="btn btn-primary btn-block btn-lg" id="btn-cust-login">Login</button>
                        <button style="display:block;margin:var(--space-4) auto 0;color:var(--primary-500);font-weight:600;font-size:var(--font-sm);background:none;border:none;cursor:pointer" onclick="showCustForgotPassword()">Forgot Password?</button>
                    </form>

                    <!-- SIGNUP -->
                    <form id="cust-signup-form" style="display:none" onsubmit="event.preventDefault(); custSignupAction();">
                        <div class="input-group mb-4">
                            <label class="input-label">Phone Number *</label>
                            <div class="input-icon-wrapper">
                                <span class="input-icon">${Icons.phone}</span>
                                <input type="tel" class="input-field" id="cust-signup-phone" placeholder="10-digit phone" maxlength="10" style="padding-left:44px">
                            </div>
                        </div>
                        <div class="input-group mb-4">
                            <label class="input-label">Create Password *</label>
                            <div class="input-icon-wrapper">
                                <span class="input-icon">${Icons.lock}</span>
                                <input type="password" class="input-field" id="cust-signup-pwd" placeholder="Min 6 characters" style="padding-left:44px">
                            </div>
                        </div>
                        <div class="input-group mb-6">
                            <label class="input-label">Confirm Password *</label>
                            <div class="input-icon-wrapper">
                                <span class="input-icon">${Icons.lock}</span>
                                <input type="password" class="input-field" id="cust-signup-pwd2" placeholder="Re-enter password" style="padding-left:44px">
                            </div>
                        </div>
                        <button type="submit" class="btn btn-primary btn-block btn-lg" id="btn-cust-signup">Verify Phone & Sign Up</button>
                    </form>

                    <!-- SIGNUP OTP -->
                    <div id="cust-signup-otp" style="display:none">
                        <p style="text-align:center;color:var(--neutral-500);font-size:var(--font-sm);margin-bottom:var(--space-2)">Enter the 6-digit code sent to</p>
                        <p style="text-align:center;font-weight:700;color:var(--neutral-800);margin-bottom:var(--space-4)" id="cust-otp-phone-display"></p>
                        <div class="otp-inputs" style="display:flex;gap:8px;justify-content:center;margin-bottom:var(--space-4)">
                            ${[1,2,3,4,5,6].map(i => `<input type="text" class="otp-input" maxlength="1" id="cotp-${i}" onkeyup="handleOTPInput(event,this,${i},'cotp-')">`).join('')}
                        </div>
                        <button class="btn btn-primary btn-block btn-lg" onclick="verifyCustSignupOTP()" id="btn-verify-cust-otp">Verify & Create Account</button>
                        <p style="text-align:center;margin-top:var(--space-4);font-size:var(--font-sm);color:var(--neutral-400)">Didn't receive? <button style="color:var(--primary-500);font-weight:600;background:none;border:none;cursor:pointer" onclick="resendCustOTP()">Resend OTP</button></p>
                    </div>

                    <!-- FORGOT PASSWORD -->
                    <div id="cust-forgot-form" style="display:none">
                        <p style="text-align:center;color:var(--neutral-500);font-size:var(--font-sm);margin-bottom:var(--space-4)">Enter your registered phone to receive a code</p>
                        <div class="input-group mb-4">
                            <label class="input-label">Phone Number</label>
                            <div class="input-icon-wrapper">
                                <span class="input-icon">${Icons.phone}</span>
                                <input type="tel" class="input-field" id="cust-forgot-phone" placeholder="10-digit phone" maxlength="10" style="padding-left:44px">
                            </div>
                        </div>
                        <button class="btn btn-primary btn-block btn-lg" onclick="sendCustForgotOTP()" id="btn-cust-forgot-send">Send Verification Code</button>
                        <button style="display:block;margin:var(--space-4) auto 0;color:var(--primary-500);font-weight:600;font-size:var(--font-sm);background:none;border:none;cursor:pointer" onclick="switchCustTab('login')">← Back to Login</button>
                    </div>

                    <!-- RESET PASSWORD -->
                    <div id="cust-reset-form" style="display:none">
                        <p style="text-align:center;color:var(--neutral-500);font-size:var(--font-sm);margin-bottom:var(--space-4)">Enter OTP and set new password</p>
                        <div class="otp-inputs" style="display:flex;gap:8px;justify-content:center;margin-bottom:var(--space-4)">
                            ${[1,2,3,4,5,6].map(i => `<input type="text" class="otp-input" maxlength="1" id="creset-${i}" onkeyup="handleOTPInput(event,this,${i},'creset-')">`).join('')}
                        </div>
                        <div class="input-group mb-4">
                            <label class="input-label">New Password</label>
                            <div class="input-icon-wrapper">
                                <span class="input-icon">${Icons.lock}</span>
                                <input type="password" class="input-field" id="cust-reset-pwd" placeholder="Min 6 characters" style="padding-left:44px">
                            </div>
                        </div>
                        <button class="btn btn-primary btn-block btn-lg" onclick="resetCustPasswordAction()" id="btn-cust-reset">Reset Password & Login</button>
                    </div>
                </div>
                <p style="text-align:center;margin-top:var(--space-6);font-size:var(--font-xs);color:var(--neutral-400);padding-bottom:var(--space-6)">By continuing, you agree to our Terms of Service</p>
            </div>
        </div>
    `;
}

function switchCustTab(tab) {
    document.getElementById('cust-login-form').style.display = tab === 'login' ? 'block' : 'none';
    document.getElementById('cust-signup-form').style.display = tab === 'signup' ? 'block' : 'none';
    document.getElementById('cust-signup-otp').style.display = 'none';
    document.getElementById('cust-forgot-form').style.display = 'none';
    document.getElementById('cust-reset-form').style.display = 'none';
    const lt = document.getElementById('ctab-login'), st = document.getElementById('ctab-signup');
    if (tab === 'login') { lt.style.background = 'var(--primary-500)'; lt.style.color = 'white'; st.style.background = 'transparent'; st.style.color = 'var(--primary-500)'; }
    else { st.style.background = 'var(--primary-500)'; st.style.color = 'white'; lt.style.background = 'transparent'; lt.style.color = 'var(--primary-500)'; }
}

async function custLoginAction() {
    const phone = document.getElementById('cust-login-phone')?.value?.trim();
    const pwd = document.getElementById('cust-login-pwd')?.value;
    if (!phone || phone.length !== 10 || !/^\d{10}$/.test(phone)) { UI.showToast('Enter valid 10-digit phone', 'error'); return; }
    if (!pwd) { UI.showToast('Enter your password', 'error'); return; }
    const btn = document.getElementById('btn-cust-login');
    btn.innerHTML = `<span class="spinner" style="width:20px;height:20px;border-width:2px;display:inline-block"></span> Logging in...`;
    btn.disabled = true;
    
    try {
        const result = await DataStore.customerLogin(phone, pwd);
        if (result.error) { btn.innerHTML = 'Login'; btn.disabled = false; UI.showToast(result.error, 'error'); return; }
        handleLoginRouting(result.user, 'customer');
    } catch(e) {
        btn.innerHTML = 'Login'; btn.disabled = false; UI.showToast(e.message || 'Login failed', 'error');
    }
}

function custSignupAction() {
    const phone = document.getElementById('cust-signup-phone')?.value?.trim();
    const pwd = document.getElementById('cust-signup-pwd')?.value;
    const pwd2 = document.getElementById('cust-signup-pwd2')?.value;
    if (!phone || phone.length !== 10 || !/^\d{10}$/.test(phone)) { UI.showToast('Enter valid 10-digit phone', 'error'); return; }
    if (!pwd || pwd.length < 6) { UI.showToast('Password must be at least 6 characters', 'error'); return; }
    if (pwd !== pwd2) { UI.showToast('Passwords do not match', 'error'); return; }
    if (DataStore.findCustomerByPhone(phone)) { UI.showToast('Phone already registered. Please login.', 'error'); return; }
    _authPhone = phone;
    _authPwd = pwd;
    const btn = document.getElementById('btn-cust-signup');
    btn.innerHTML = `<span class="spinner" style="width:20px;height:20px;border-width:2px;display:inline-block"></span> Sending OTP...`;
    btn.disabled = true;
    OTPUtils.sendOTP(phone);
    setTimeout(() => {
        document.getElementById('cust-signup-form').style.display = 'none';
        document.getElementById('cust-signup-otp').style.display = 'block';
        document.getElementById('cust-otp-phone-display').textContent = '+91 ' + phone;
        document.getElementById('cotp-1')?.focus();
    }, 1800);
}

function resendCustOTP() {
    if (_authPhone) { OTPUtils.sendOTP(_authPhone); UI.showToast('OTP resent!', 'success'); }
}

async function verifyCustSignupOTP() {
    const otp = [1,2,3,4,5,6].map(i => document.getElementById('cotp-' + i)?.value || '').join('');
    if (otp.length !== 6 || !/^\d{6}$/.test(otp)) { UI.showToast('Enter complete 6-digit OTP', 'error'); return; }
    const result = await OTPUtils.verify(otp);
    if (result.error) { UI.showToast(result.error, 'error'); return; }
    const btn = document.getElementById('btn-verify-cust-otp');
    btn.innerHTML = `<span class="spinner" style="width:20px;height:20px;border-width:2px;display:inline-block"></span> Creating...`;
    btn.disabled = true;
    
    try {
        const r = await DataStore.customerSignup(_authPhone, _authPwd);
        if (r.error) { btn.innerHTML = 'Verify & Create Account'; btn.disabled = false; UI.showToast(r.error, 'error'); return; }
        UI.showToast('Account created!', 'success');
        handleLoginRouting(r.user, 'customer');
    } catch(e) {
        btn.innerHTML = 'Verify & Create Account'; btn.disabled = false; UI.showToast(e.message || 'Signup failed', 'error');
    }
}

function showCustForgotPassword() {
    document.getElementById('cust-login-form').style.display = 'none';
    document.getElementById('cust-forgot-form').style.display = 'block';
}

let _custForgotPhone = '';
function sendCustForgotOTP() {
    const phone = document.getElementById('cust-forgot-phone')?.value?.trim();
    if (!phone || phone.length !== 10) { UI.showToast('Enter valid phone', 'error'); return; }
    if (!DataStore.findCustomerByPhone(phone)) { UI.showToast('No account found with this phone', 'error'); return; }
    _custForgotPhone = phone;
    const btn = document.getElementById('btn-cust-forgot-send');
    btn.innerHTML = `<span class="spinner" style="width:20px;height:20px;border-width:2px;display:inline-block"></span> Sending...`;
    btn.disabled = true;
    OTPUtils.sendOTP(phone);
    setTimeout(() => {
        document.getElementById('cust-forgot-form').style.display = 'none';
        document.getElementById('cust-reset-form').style.display = 'block';
        document.getElementById('creset-1')?.focus();
    }, 1800);
}

async function resetCustPasswordAction() {
    const otp = [1,2,3,4,5,6].map(i => document.getElementById('creset-' + i)?.value || '').join('');
    const pwd = document.getElementById('cust-reset-pwd')?.value;
    if (otp.length !== 6 || !/^\d{6}$/.test(otp)) { UI.showToast('Enter complete OTP', 'error'); return; }
    if (!pwd || pwd.length < 6) { UI.showToast('Password min 6 characters', 'error'); return; }
    const r = await OTPUtils.verify(otp);
    if (r.error) { UI.showToast(r.error, 'error'); return; }
    DataStore.resetCustomerPassword(_custForgotPhone, pwd);
    UI.showToast('Password reset! Please login.', 'success');
    switchCustTab('login');
}

// ============ SELLER AUTH ============
function renderSellerAuth(container) {
    container.innerHTML = `
        <div class="auth-page">
            <div class="auth-top">
                <button class="back-btn" onclick="Router.navigate('role-select')" style="position:absolute;top:16px;left:16px;color:white;width:36px;height:36px;display:flex;align-items:center;justify-content:center;border-radius:10px" id="auth-back">${Icons.back}</button>
                <h1>Seller Portal</h1>
                <p>Login or create your seller account</p>
            </div>
            <div class="auth-form-container">
                <div class="auth-form-card" id="auth-form-card">
                    <div style="display:flex;gap:0;margin-bottom:var(--space-6);border-radius:var(--radius-lg);overflow:hidden;border:2px solid var(--primary-100)">
                        <button id="stab-login" onclick="switchSellerTab('login')" style="flex:1;padding:12px;font-weight:600;font-size:var(--font-sm);border:none;cursor:pointer;transition:all 0.3s;background:var(--primary-500);color:white">Login</button>
                        <button id="stab-signup" onclick="switchSellerTab('signup')" style="flex:1;padding:12px;font-weight:600;font-size:var(--font-sm);border:none;cursor:pointer;transition:all 0.3s;background:transparent;color:var(--primary-500)">Sign Up</button>
                    </div>

                    <!-- LOGIN -->
                    <form id="seller-login-form" onsubmit="event.preventDefault(); sellerLoginAction();">
                        <div class="input-group mb-4">
                            <label class="input-label">Unique Code or Phone</label>
                            <div class="input-icon-wrapper"><span class="input-icon">${Icons.key}</span>
                            <input type="text" class="input-field" id="seller-login-id" placeholder="RAP1A2B3C or 9876543210" style="padding-left:44px"></div>
                        </div>
                        <div class="input-group mb-6">
                            <label class="input-label">Password</label>
                            <div class="input-icon-wrapper"><span class="input-icon">${Icons.lock}</span>
                            <input type="password" class="input-field" id="seller-login-pwd" placeholder="Enter password" style="padding-left:44px" autocomplete="current-password"></div>
                        </div>
                        <button type="submit" class="btn btn-primary btn-block btn-lg" id="btn-seller-login">Login</button>
                        <button type="button" style="display:block;margin:var(--space-4) auto 0;color:var(--primary-500);font-weight:600;font-size:var(--font-sm);background:none;border:none;cursor:pointer" onclick="showSellerForgotPassword()">Forgot Password?</button>
                    </form>

                    <!-- SIGNUP -->
                    <form id="seller-signup-form" style="display:none" onsubmit="event.preventDefault(); sellerSignupAction();">
                        <div class="input-group mb-4">
                            <label class="input-label">Phone *</label>
                            <div class="input-icon-wrapper"><span class="input-icon">${Icons.phone}</span>
                            <input type="tel" class="input-field" id="seller-signup-phone" placeholder="10-digit" maxlength="10" style="padding-left:44px"></div>
                        </div>
                        <div class="input-group mb-4">
                            <label class="input-label">Create Password *</label>
                            <div class="input-icon-wrapper"><span class="input-icon">${Icons.lock}</span>
                            <input type="password" class="input-field" id="seller-signup-pwd" placeholder="Min 6 characters" style="padding-left:44px"></div>
                        </div>
                        <div class="input-group mb-6">
                            <label class="input-label">Confirm Password *</label>
                            <div class="input-icon-wrapper"><span class="input-icon">${Icons.lock}</span>
                            <input type="password" class="input-field" id="seller-signup-pwd2" placeholder="Re-enter" style="padding-left:44px"></div>
                        </div>
                        <button type="submit" class="btn btn-primary btn-block btn-lg" id="btn-seller-signup">Verify Phone & Sign Up</button>
                    </form>

                    <!-- SIGNUP OTP -->
                    <div id="seller-signup-otp-form" style="display:none">
                        <p style="text-align:center;color:var(--neutral-500);font-size:var(--font-sm);margin-bottom:var(--space-2)">Enter OTP sent to</p>
                        <p style="text-align:center;font-weight:700;color:var(--neutral-800);margin-bottom:var(--space-4)" id="signup-otp-phone-display"></p>
                        <div class="otp-inputs" style="display:flex;gap:8px;justify-content:center;margin-bottom:var(--space-4)">
                            ${[1,2,3,4,5,6].map(i => `<input type="text" class="otp-input" maxlength="1" id="sotp-${i}" onkeyup="handleOTPInput(event,this,${i},'sotp-')">`).join('')}
                        </div>
                        <button class="btn btn-primary btn-block btn-lg" onclick="verifySellerSignupOTP()" id="btn-verify-signup-otp">Verify & Create Account</button>
                    </div>

                    <!-- FORGOT -->
                    <div id="seller-forgot-form" style="display:none">
                        <p style="text-align:center;color:var(--neutral-500);font-size:var(--font-sm);margin-bottom:var(--space-4)">Enter registered phone to receive code</p>
                        <div class="input-group mb-4">
                            <label class="input-label">Phone</label>
                            <div class="input-icon-wrapper"><span class="input-icon">${Icons.phone}</span>
                            <input type="tel" class="input-field" id="seller-forgot-phone" placeholder="Phone" maxlength="10" style="padding-left:44px"></div>
                        </div>
                        <button class="btn btn-primary btn-block btn-lg" onclick="sendSellerForgotOTP()" id="btn-seller-forgot-send">Send Code</button>
                        <button style="display:block;margin:var(--space-4) auto 0;color:var(--primary-500);font-weight:600;font-size:var(--font-sm);background:none;border:none;cursor:pointer" onclick="switchSellerTab('login')">← Back to Login</button>
                    </div>

                    <!-- RESET -->
                    <div id="seller-reset-form" style="display:none">
                        <div class="otp-inputs" style="display:flex;gap:8px;justify-content:center;margin-bottom:var(--space-4)">
                            ${[1,2,3,4,5,6].map(i => `<input type="text" class="otp-input" maxlength="1" id="sreset-${i}" onkeyup="handleOTPInput(event,this,${i},'sreset-')">`).join('')}
                        </div>
                        <div class="input-group mb-4">
                            <label class="input-label">New Password</label>
                            <div class="input-icon-wrapper"><span class="input-icon">${Icons.lock}</span>
                            <input type="password" class="input-field" id="seller-reset-pwd" placeholder="Min 6 chars" style="padding-left:44px"></div>
                        </div>
                        <button class="btn btn-primary btn-block btn-lg" onclick="resetSellerPasswordAction()" id="btn-seller-reset">Reset Password</button>
                    </div>
                </div>
            </div>
        </div>
    `;
}

function switchSellerTab(tab) {
    document.getElementById('seller-login-form').style.display = tab === 'login' ? 'block' : 'none';
    document.getElementById('seller-signup-form').style.display = tab === 'signup' ? 'block' : 'none';
    document.getElementById('seller-signup-otp-form').style.display = 'none';
    document.getElementById('seller-forgot-form').style.display = 'none';
    document.getElementById('seller-reset-form').style.display = 'none';
    const lt = document.getElementById('stab-login'), st = document.getElementById('stab-signup');
    if (tab === 'login') { lt.style.background = 'var(--primary-500)'; lt.style.color = 'white'; st.style.background = 'transparent'; st.style.color = 'var(--primary-500)'; }
    else { st.style.background = 'var(--primary-500)'; st.style.color = 'white'; lt.style.background = 'transparent'; lt.style.color = 'var(--primary-500)'; }
}

function showSellerForgotPassword() {
    document.getElementById('seller-login-form').style.display = 'none';
    document.getElementById('seller-forgot-form').style.display = 'block';
}

async function sellerLoginAction() {
    const id = document.getElementById('seller-login-id')?.value?.trim();
    const pwd = document.getElementById('seller-login-pwd')?.value;
    if (!id) { UI.showToast('Enter your unique code or phone', 'error'); return; }
    if (!pwd) { UI.showToast('Enter your password', 'error'); return; }
    const btn = document.getElementById('btn-seller-login');
    btn.innerHTML = `<span class="spinner" style="width:20px;height:20px;border-width:2px;display:inline-block"></span> Logging in...`;
    btn.disabled = true;
    
    try {
        const r = await DataStore.sellerLogin(id, pwd);
        if (r.error) { btn.innerHTML = 'Login'; btn.disabled = false; UI.showToast(r.error, 'error'); return; }
        handleLoginRouting(r.user, 'seller');
    } catch(e) {
        btn.innerHTML = 'Login'; btn.disabled = false; UI.showToast(e.message || 'Login failed', 'error');
    }
}

let _sellerSignupPwd = '';
function sellerSignupAction() {
    const phone = document.getElementById('seller-signup-phone')?.value?.trim();
    const pwd = document.getElementById('seller-signup-pwd')?.value;
    const pwd2 = document.getElementById('seller-signup-pwd2')?.value;
    if (!phone || phone.length !== 10 || !/^\d{10}$/.test(phone)) { UI.showToast('Enter valid 10-digit phone', 'error'); return; }
    if (!pwd || pwd.length < 6) { UI.showToast('Password min 6 characters', 'error'); return; }
    if (pwd !== pwd2) { UI.showToast('Passwords do not match', 'error'); return; }
    if (DataStore.findSellerByPhone(phone)) { UI.showToast('Phone already registered. Please login.', 'error'); return; }
    _authPhone = phone;
    _sellerSignupPwd = pwd;
    const btn = document.getElementById('btn-seller-signup');
    btn.innerHTML = `<span class="spinner" style="width:20px;height:20px;border-width:2px;display:inline-block"></span> Sending OTP...`;
    btn.disabled = true;
    OTPUtils.sendOTP(phone);
    setTimeout(() => {
        document.getElementById('seller-signup-form').style.display = 'none';
        document.getElementById('seller-signup-otp-form').style.display = 'block';
        document.getElementById('signup-otp-phone-display').textContent = '+91 ' + phone;
        document.getElementById('sotp-1')?.focus();
    }, 1800);
}

async function verifySellerSignupOTP() {
    const otp = [1,2,3,4,5,6].map(i => document.getElementById('sotp-' + i)?.value || '').join('');
    if (otp.length !== 6) { UI.showToast('Enter complete OTP', 'error'); return; }
    const r = await OTPUtils.verify(otp);
    if (r.error) { UI.showToast(r.error, 'error'); return; }
    const btn = document.getElementById('btn-verify-signup-otp');
    btn.innerHTML = `<span class="spinner" style="width:20px;height:20px;border-width:2px;display:inline-block"></span> Creating...`;
    btn.disabled = true;

    try {
        const sr = await DataStore.sellerSignup(_authPhone, _sellerSignupPwd);
        if (sr.error) { btn.innerHTML = 'Verify & Create Account'; btn.disabled = false; UI.showToast(sr.error, 'error'); return; }
        showUniqueCodeModal(sr.uniqueCode, sr.user);
    } catch(e) {
        btn.innerHTML = 'Verify & Create Account'; btn.disabled = false; UI.showToast(e.message || 'Signup failed', 'error');
    }
}

function showUniqueCodeModal(code, user) {
    const content = `
        <div style="text-align:center;padding:var(--space-2)">
            <div style="width:80px;height:80px;border-radius:50%;background:var(--success-50);display:flex;align-items:center;justify-content:center;margin:0 auto var(--space-4);font-size:36px">🎉</div>
            <h2 style="font-size:var(--font-xl);font-weight:800;margin-bottom:var(--space-2)">Account Created!</h2>
            <p style="color:var(--neutral-500);font-size:var(--font-sm);margin-bottom:var(--space-6)">Save your unique seller code!</p>
            <div style="background:var(--primary-50);border:2px dashed var(--primary-300);border-radius:var(--radius-lg);padding:var(--space-4);margin-bottom:var(--space-4)">
                <div style="font-size:10px;color:var(--primary-400);margin-bottom:4px;text-transform:uppercase;font-weight:600;letter-spacing:1px">Your Unique Code</div>
                <div style="font-size:28px;font-weight:900;letter-spacing:4px;color:var(--primary-600);font-family:monospace">${code}</div>
            </div>
            <p style="font-size:var(--font-xs);color:var(--neutral-400);margin-bottom:var(--space-6)">Login with this code + password<br>or phone + password</p>
            <button class="btn btn-primary btn-block btn-lg" onclick="UI.closeModal();handleLoginRouting(DataStore.getCurrentUser(),'seller')" id="btn-continue-setup">Continue to Setup →</button>
        </div>
    `;
    UI.showModal(content, { title: '' });
}

let _sellerForgotPhone = '';
function sendSellerForgotOTP() {
    const phone = document.getElementById('seller-forgot-phone')?.value?.trim();
    if (!phone || phone.length !== 10) { UI.showToast('Enter valid phone', 'error'); return; }
    if (!DataStore.findSellerByPhone(phone)) { UI.showToast('No seller account with this phone', 'error'); return; }
    _sellerForgotPhone = phone;
    const btn = document.getElementById('btn-seller-forgot-send');
    btn.innerHTML = `<span class="spinner" style="width:20px;height:20px;border-width:2px;display:inline-block"></span> Sending...`;
    btn.disabled = true;
    OTPUtils.sendOTP(phone);
    setTimeout(() => {
        document.getElementById('seller-forgot-form').style.display = 'none';
        document.getElementById('seller-reset-form').style.display = 'block';
        document.getElementById('sreset-1')?.focus();
    }, 1800);
}

async function resetSellerPasswordAction() {
    const otp = [1,2,3,4,5,6].map(i => document.getElementById('sreset-' + i)?.value || '').join('');
    const pwd = document.getElementById('seller-reset-pwd')?.value;
    if (otp.length !== 6) { UI.showToast('Enter complete OTP', 'error'); return; }
    if (!pwd || pwd.length < 6) { UI.showToast('Password min 6 chars', 'error'); return; }
    const r = await OTPUtils.verify(otp);
    if (r.error) { UI.showToast(r.error, 'error'); return; }
    DataStore.resetSellerPassword(_sellerForgotPhone, pwd);
    UI.showToast('Password reset! Please login.', 'success');
    switchSellerTab('login');
}

// ============ OTP INPUT ============
function handleOTPInput(event, input, index, prefix) {
    if (event.key === 'Backspace') {
        if (input.value === '' && index > 1) document.getElementById(prefix + (index - 1))?.focus();
    } else if (input.value && index < 6) {
        document.getElementById(prefix + (index + 1))?.focus();
    }
}

// ============ ROUTING ============
function handleLoginRouting(user, role) {
    if (user.isNew || !user.name || !user.address) {
        UI.showToast('Please complete your profile', 'success');
        Router.navigate('setup-profile', { userId: user.id });
        return;
    }
    UI.showToast(`Welcome back, ${user.name}!`, 'success');
    if (role === 'customer') { Router.navigate('customer-home'); }
    else {
        const stores = DataStore.getStoresByOwner(user.id);
        Router.navigate(stores.length === 0 ? 'seller-store-setup' : 'seller-dashboard', stores.length === 0 ? { isNew: true } : {});
    }
}
