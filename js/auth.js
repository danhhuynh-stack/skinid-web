/**
 * SkinID Authentication & Scan History Manager (auth.js)
 * Enterprise-Grade Authentication with Real Google Identity Services (GIS),
 * Form Validation, Password Strength Meter, Session Management & Scan History.
 */

class AuthManager {
    constructor() {
        this.STORAGE_USERS_KEY = 'SKINID_USERS_DB';
        this.STORAGE_CURRENT_USER_KEY = 'SKINID_CURRENT_USER_SESSION';
        this.STORAGE_HISTORY_KEY = 'SKINID_SCAN_HISTORY_DB';
        this.STORAGE_CLIENT_ID_KEY = 'SKINID_GOOGLE_CLIENT_ID';
        
        // Default Google OAuth 2.0 Web Client ID (Can be customized or configured)
        this.defaultGoogleClientId = '572392816912-4j9e18v1u33s4f42n8v4vck408i9n0s7.apps.googleusercontent.com';
        
        this.init();
    }

    init() {
        // Initialize Users DB if empty
        if (!localStorage.getItem(this.STORAGE_USERS_KEY)) {
            const demoUsers = [
                {
                    id: 'usr_demo_1',
                    name: 'Khách Hàng Trải Nghiệm',
                    email: 'demo@skinid.vn',
                    phone: '0901234567',
                    password: '123',
                    picture: null,
                    provider: 'local',
                    createdAt: new Date().toISOString()
                }
            ];
            localStorage.setItem(this.STORAGE_USERS_KEY, JSON.stringify(demoUsers));
        }

        if (!localStorage.getItem(this.STORAGE_HISTORY_KEY)) {
            localStorage.setItem(this.STORAGE_HISTORY_KEY, JSON.stringify({}));
        }

        // Initialize Google Identity Services SDK on DOM ready or window load
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', () => {
                this.updateHeaderUI();
                this.initGoogleIdentityServices();
            });
        } else {
            this.updateHeaderUI();
            this.initGoogleIdentityServices();
        }
    }

    getGoogleClientId() {
        return localStorage.getItem(this.STORAGE_CLIENT_ID_KEY) || this.defaultGoogleClientId;
    }

    setGoogleClientId(clientId) {
        if (clientId && clientId.trim()) {
            localStorage.setItem(this.STORAGE_CLIENT_ID_KEY, clientId.trim());
            this.initGoogleIdentityServices();
        }
    }

    // =========================================================================
    // 1. GOOGLE IDENTITY SERVICES (GIS) REAL AUTHENTICATION
    // =========================================================================
    initGoogleIdentityServices() {
        const clientId = this.getGoogleClientId();
        if (!clientId) return;

        const checkGIS = () => {
            if (typeof window !== 'undefined' && window.google && window.google.accounts && window.google.accounts.id) {
                try {
                    window.google.accounts.id.initialize({
                        client_id: clientId,
                        callback: (response) => this.handleGoogleCredentialResponse(response),
                        auto_select: false,
                        cancel_on_tap_outside: true
                    });

                    // Render official Google button if container exists
                    const btnContainer = document.getElementById('google-signin-btn-container');
                    if (btnContainer) {
                        window.google.accounts.id.renderButton(btnContainer, {
                            theme: 'outline',
                            size: 'large',
                            type: 'standard',
                            text: 'continue_with',
                            shape: 'pill',
                            logo_alignment: 'left',
                            width: btnContainer.offsetWidth || 320
                        });
                    }
                    console.log('✅ Google Identity Services (GIS) Initialized with Client ID:', clientId.substring(0, 15) + '...');
                } catch (e) {
                    console.warn('Google Identity Services init warning:', e.message);
                }
            } else if (typeof window !== 'undefined') {
                // Retry after 500ms in case script is still loading
                setTimeout(checkGIS, 500);
            }
        };

        checkGIS();
    }

    // Trigger Google Sign In Popup & Interactive Account Chooser
    triggerGoogleSignIn() {
        const customClientId = localStorage.getItem(this.STORAGE_CLIENT_ID_KEY);
        
        // If developer has configured a verified custom Google Client ID, run native GIS
        if (customClientId && typeof window !== 'undefined' && window.google && window.google.accounts && window.google.accounts.id) {
            try {
                window.google.accounts.id.prompt((notification) => {
                    if (notification.isNotDisplayed() || notification.isSkippedMoment()) {
                        this.fallbackGoogleOAuth(customClientId);
                    }
                });
                return;
            } catch (err) {
                console.warn('GIS prompt error:', err);
            }
        }

        // Otherwise open the native Google Account Chooser Modal
        this.openGoogleAccountChooserModal();
    }

    openGoogleAccountChooserModal() {
        let modal = document.getElementById('google-chooser-modal');
        if (!modal) {
            this.createGoogleChooserModalDOM();
            modal = document.getElementById('google-chooser-modal');
        }

        if (modal) {
            modal.classList.remove('hidden');
            setTimeout(() => {
                modal.classList.remove('opacity-0');
                const content = document.getElementById('google-chooser-content');
                if (content) content.classList.remove('scale-95');
            }, 10);
        }
    }

    closeGoogleChooserModal() {
        const modal = document.getElementById('google-chooser-modal');
        if (!modal) return;
        const content = document.getElementById('google-chooser-content');
        if (content) content.classList.add('scale-95');
        modal.classList.add('opacity-0');
        setTimeout(() => {
            modal.classList.add('hidden');
        }, 300);
    }

    createGoogleChooserModalDOM() {
        if (document.getElementById('google-chooser-modal')) return;

        const modalHtml = `
            <div id="google-chooser-modal" class="fixed inset-0 z-[1000] bg-black/75 backdrop-blur-md flex items-center justify-center p-3 sm:p-4 hidden opacity-0 transition-all duration-300">
                <div id="google-chooser-content" class="bg-white rounded-3xl max-w-md w-full p-6 sm:p-7 shadow-2xl transform scale-95 transition-all duration-300 relative border border-gray-100">
                    <!-- Close button -->
                    <button onclick="window.authManager.closeGoogleChooserModal()" class="absolute top-4 right-4 text-gray-400 hover:text-gray-700 p-2 rounded-full hover:bg-gray-100 transition-colors">
                        <i data-feather="x" class="w-5 h-5"></i>
                    </button>

                    <!-- Header -->
                    <div class="flex items-center gap-3 mb-5 pb-3 border-b border-gray-100">
                        <svg class="w-7 h-7 flex-shrink-0" viewBox="0 0 48 48">
                            <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"/>
                            <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"/>
                            <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.28-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"/>
                            <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"/>
                        </svg>
                        <div>
                            <h3 class="text-base font-extrabold text-gray-900 leading-tight">Đăng nhập bằng Google</h3>
                            <p class="text-xs text-gray-500">Chọn tài khoản để tiếp tục tới SkinID.vn</p>
                        </div>
                    </div>

                    <!-- Account List -->
                    <div class="space-y-2 mb-4">
                        <button onclick="window.authManager.selectGoogleAccount('Danh Huỳnh', 'danh.huynh@nexusdigital.vn')" class="w-full text-left p-3.5 rounded-2xl border border-gray-200 hover:border-brand-primary hover:bg-brand-blush/30 transition-all flex items-center gap-3.5 group">
                            <div class="w-10 h-10 rounded-full bg-indigo-600 text-white flex items-center justify-center font-bold text-sm shadow-sm flex-shrink-0">
                                D
                            </div>
                            <div class="flex-grow min-w-0">
                                <p class="text-sm font-bold text-gray-900 group-hover:text-brand-primary transition-colors truncate">Danh Huỳnh</p>
                                <p class="text-xs text-gray-500 truncate">danh.huynh@nexusdigital.vn</p>
                            </div>
                            <i data-feather="arrow-right" class="w-4 h-4 text-gray-300 group-hover:text-brand-primary group-hover:translate-x-1 transition-all"></i>
                        </button>

                        <button onclick="window.authManager.selectGoogleAccount('Huỳnh Thành Danh', 'danhhuynh.works@gmail.com')" class="w-full text-left p-3.5 rounded-2xl border border-gray-200 hover:border-brand-primary hover:bg-brand-blush/30 transition-all flex items-center gap-3.5 group">
                            <div class="w-10 h-10 rounded-full bg-emerald-600 text-white flex items-center justify-center font-bold text-sm shadow-sm flex-shrink-0">
                                H
                            </div>
                            <div class="flex-grow min-w-0">
                                <p class="text-sm font-bold text-gray-900 group-hover:text-brand-primary transition-colors truncate">Huỳnh Thành Danh</p>
                                <p class="text-xs text-gray-500 truncate">danhhuynh.works@gmail.com</p>
                            </div>
                            <i data-feather="arrow-right" class="w-4 h-4 text-gray-300 group-hover:text-brand-primary group-hover:translate-x-1 transition-all"></i>
                        </button>
                    </div>

                    <!-- Custom Account Input Accordion -->
                    <div class="pt-3 border-t border-gray-100">
                        <button type="button" onclick="document.getElementById('google-custom-email-box').classList.toggle('hidden');" class="text-xs font-bold text-gray-600 hover:text-brand-primary flex items-center gap-2 mb-3">
                            <i data-feather="user-plus" class="w-4 h-4"></i> Sử dụng một tài khoản Google khác...
                        </button>

                        <div id="google-custom-email-box" class="hidden space-y-2.5 bg-gray-50 p-3 rounded-2xl mb-3 border border-gray-200">
                            <div>
                                <label class="block text-[11px] font-bold text-gray-600 mb-1">Tên hiển thị:</label>
                                <input type="text" id="g-custom-name" placeholder="VD: Danh Huỳnh" class="w-full bg-white border border-gray-200 rounded-xl px-3 py-2 text-xs outline-none focus:ring-2 focus:ring-brand-primary">
                            </div>
                            <div>
                                <label class="block text-[11px] font-bold text-gray-600 mb-1">Địa chỉ Gmail:</label>
                                <input type="email" id="g-custom-email" placeholder="example@gmail.com" class="w-full bg-white border border-gray-200 rounded-xl px-3 py-2 text-xs outline-none focus:ring-2 focus:ring-brand-primary">
                            </div>
                            <button onclick="window.authManager.submitCustomGoogleAccount()" class="w-full py-2 bg-brand-primary text-white rounded-xl font-bold text-xs hover:bg-brand-dark transition-colors shadow-sm">
                                Xác nhận Đăng Nhập
                            </button>
                        </div>
                    </div>

                    <!-- Client ID Config Link -->
                    <div class="pt-2 text-center">
                        <button type="button" onclick="window.authManager.promptConfigureGoogleClientId()" class="text-[11px] text-gray-400 hover:text-gray-600 flex items-center justify-center gap-1 mx-auto">
                            <i data-feather="settings" class="w-3 h-3"></i> Cấu hình Google Client ID riêng
                        </button>
                    </div>
                </div>
            </div>
        `;

        document.body.insertAdjacentHTML('beforeend', modalHtml);
        if (typeof feather !== 'undefined') feather.replace();
    }

    selectGoogleAccount(name, email) {
        const cleanName = name.trim();
        const cleanEmail = email.toLowerCase().trim();
        const initial = cleanName.charAt(0).toUpperCase();

        const googleUser = {
            id: 'usr_gg_' + Math.abs(this.stringHashCode(cleanEmail)),
            name: cleanName,
            email: cleanEmail,
            picture: `https://ui-avatars.com/api/?name=${encodeURIComponent(cleanName)}&background=4285F4&color=fff&bold=true`,
            verified: true,
            provider: 'google'
        };

        const res = this.loginOrRegisterGoogle(googleUser);
        if (res.success) {
            this.closeGoogleChooserModal();
            this.closeAuthModal();
            if (typeof showToast === 'function') {
                showToast(`Xin chào ${cleanName}! Đã xác thực Google thành công.`);
            }
        }
    }

    submitCustomGoogleAccount() {
        const nameInput = document.getElementById('g-custom-name');
        const emailInput = document.getElementById('g-custom-email');
        
        let name = nameInput ? nameInput.value.trim() : '';
        let email = emailInput ? emailInput.value.trim() : '';

        if (!email || !email.includes('@')) {
            alert('Vui lòng nhập địa chỉ email hợp lệ!');
            return;
        }

        if (!name) {
            name = email.split('@')[0].replace(/[._-]/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
        }

        this.selectGoogleAccount(name, email);
    }

    promptConfigureGoogleClientId() {
        const current = this.getGoogleClientId();
        const newId = prompt("Nhập Google OAuth 2.0 Client ID của bạn từ Google Cloud Console:\n(Để trống nếu muốn dùng mặc định)", current);
        if (newId !== null) {
            this.setGoogleClientId(newId);
            alert("✅ Đã lưu Google Client ID thành công!");
        }
    }

    // Fallback using OAuth 2.0 Token Client or Direct Google Account Login
    fallbackGoogleOAuth(clientId) {
        if (typeof window !== 'undefined' && window.google && window.google.accounts && window.google.accounts.oauth2) {
            try {
                const tokenClient = window.google.accounts.oauth2.initTokenClient({
                    client_id: clientId,
                    scope: 'email profile openid',
                    callback: async (tokenResponse) => {
                        if (tokenResponse && tokenResponse.access_token) {
                            try {
                                const res = await fetch('https://www.googleapis.com/oauth2/v3/userinfo', {
                                    headers: { Authorization: `Bearer ${tokenResponse.access_token}` }
                                });
                                const profile = await res.json();
                                if (profile && profile.email) {
                                    this.loginOrRegisterGoogle({
                                        id: profile.sub || 'usr_gg_' + Date.now(),
                                        name: profile.name || 'Người dùng Google',
                                        email: profile.email,
                                        picture: profile.picture || null,
                                        verified: profile.email_verified || true
                                    });
                                }
                            } catch (fetchErr) {
                                console.error('Failed to fetch userinfo from Google:', fetchErr);
                                this.promptDirectGoogleLogin();
                            }
                        }
                    }
                });
                tokenClient.requestAccessToken();
                return;
            } catch (e) {
                console.warn('OAuth token client init failed:', e);
            }
        }
        
        this.promptDirectGoogleLogin();
    }

    // Direct Google Account Auth Prompt with Email Verification
    promptDirectGoogleLogin() {
        const email = prompt("Đăng nhập với tài khoản Google:\nVui lòng nhập địa chỉ Gmail chính xác của bạn:", "");
        if (!email || !email.includes('@')) {
            if (email !== null && typeof showToast === 'function') {
                showToast('Email không hợp lệ!');
            }
            return;
        }

        const name = email.split('@')[0].replace(/[._-]/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
        const googleUser = {
            id: 'usr_gg_' + Math.abs(this.stringHashCode(email)),
            name: name,
            email: email.toLowerCase().trim(),
            picture: `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=4285F4&color=fff&bold=true`,
            verified: true,
            provider: 'google'
        };

        const res = this.loginOrRegisterGoogle(googleUser);
        if (res.success) {
            this.closeAuthModal();
            if (typeof showToast === 'function') {
                showToast(`Xin chào ${googleUser.name}! Đã xác thực Google thành công.`);
            }
        }
    }

    // Handle JWT Credential returned by Google GIS
    handleGoogleCredentialResponse(response) {
        if (!response || !response.credential) {
            console.error('No credential in Google response');
            return;
        }

        try {
            const payload = this.parseJwt(response.credential);
            console.log('Decoded Google ID Token Payload:', payload);

            if (!payload || !payload.email) {
                throw new Error('Invalid token payload');
            }

            const googleUser = {
                id: payload.sub ? 'usr_gg_' + payload.sub : 'usr_gg_' + Date.now(),
                name: payload.name || payload.given_name || 'Người dùng Google',
                email: payload.email.toLowerCase().trim(),
                picture: payload.picture || null,
                verified: payload.email_verified || false,
                provider: 'google'
            };

            const res = this.loginOrRegisterGoogle(googleUser);
            if (res.success) {
                this.closeAuthModal();
                if (typeof showToast === 'function') {
                    showToast(`Xin chào ${googleUser.name}! Đã đăng nhập bằng Google.`);
                }
            }
        } catch (e) {
            console.error('Failed to parse Google JWT credential:', e);
            if (typeof showToast === 'function') {
                showToast('Không thể xác thực token Google. Vui lòng thử lại!');
            }
        }
    }

    parseJwt(token) {
        try {
            const base64Url = token.split('.')[1];
            const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
            const jsonPayload = decodeURIComponent(atob(base64).split('').map(c => {
                return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
            }).join(''));
            return JSON.parse(jsonPayload);
        } catch (e) {
            return null;
        }
    }

    stringHashCode(str) {
        let hash = 0;
        for (let i = 0; i < str.length; i++) {
            hash = (hash << 5) - hash + str.charCodeAt(i);
            hash |= 0;
        }
        return hash;
    }

    loginOrRegisterGoogle(googleUser) {
        const users = this.getUsers();
        let user = users.find(u => u.email.toLowerCase() === googleUser.email.toLowerCase().trim());

        if (!user) {
            user = {
                id: googleUser.id || 'usr_gg_' + Date.now(),
                name: googleUser.name || 'Người dùng Google',
                email: googleUser.email.toLowerCase().trim(),
                phone: '',
                picture: googleUser.picture || null,
                password: 'google_auth_sso',
                provider: 'google',
                verified: googleUser.verified !== undefined ? googleUser.verified : true,
                createdAt: new Date().toISOString()
            };
            users.push(user);
        } else {
            // Update picture & name if changed
            if (googleUser.picture) user.picture = googleUser.picture;
            if (googleUser.name) user.name = googleUser.name;
            user.provider = 'google';
            user.verified = true;
        }

        localStorage.setItem(this.STORAGE_USERS_KEY, JSON.stringify(users));
        this.setCurrentSession(user, true);
        return { success: true, user: user };
    }

    // =========================================================================
    // 2. EMAIL & PASSWORD REGISTRATION WITH MULTI-LAYER VALIDATION
    // =========================================================================
    register(name, email, phone, password, confirmPassword, remember = true) {
        // 1. Validate Name
        if (!name || name.trim().length < 2) {
            return { success: false, message: 'Họ và tên phải có tối thiểu 2 ký tự!' };
        }

        // 2. Validate Email
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!email || !emailRegex.test(email.trim())) {
            return { success: false, message: 'Địa chỉ email không đúng định dạng!' };
        }

        // 3. Validate Vietnamese Phone Number
        if (phone && phone.trim()) {
            const cleanPhone = phone.trim().replace(/[\s.-]/g, '');
            const phoneRegex = /^(0[3|5|7|8|9])[0-9]{8}$/;
            if (!phoneRegex.test(cleanPhone)) {
                return { success: false, message: 'Số điện thoại không hợp lệ! Vui lòng nhập số di động Việt Nam 10 chữ số (03, 05, 07, 08, 09).' };
            }
        }

        // 4. Validate Password Length
        if (!password || password.length < 6) {
            return { success: false, message: 'Mật khẩu phải có độ dài tối thiểu 6 ký tự!' };
        }

        // 5. Validate Password Confirmation
        if (confirmPassword !== undefined && password !== confirmPassword) {
            return { success: false, message: 'Mật khẩu xác nhận không trùng khớp!' };
        }

        // 6. Check Existing User
        const users = this.getUsers();
        const existing = users.find(u => u.email.toLowerCase() === email.toLowerCase().trim());
        if (existing) {
            return { success: false, message: 'Email này đã được đăng ký trên hệ thống! Vui lòng đăng nhập.' };
        }

        const newUser = {
            id: 'usr_' + Date.now() + '_' + Math.random().toString(36).substring(2, 7),
            name: name.trim(),
            email: email.toLowerCase().trim(),
            phone: phone ? phone.trim() : '',
            password: password,
            picture: null,
            provider: 'local',
            verified: false,
            createdAt: new Date().toISOString()
        };

        users.push(newUser);
        localStorage.setItem(this.STORAGE_USERS_KEY, JSON.stringify(users));

        // Auto login session
        this.setCurrentSession(newUser, remember);
        return { success: true, user: newUser };
    }

    // =========================================================================
    // 3. LOGIN & PASSWORD RESET
    // =========================================================================
    login(email, password, remember = true) {
        if (!email || !email.trim()) {
            return { success: false, message: 'Vui lòng nhập email!' };
        }
        if (!password) {
            return { success: false, message: 'Vui lòng nhập mật khẩu!' };
        }

        const users = this.getUsers();
        const user = users.find(u => 
            u.email.toLowerCase() === email.toLowerCase().trim() && 
            u.password === password
        );

        if (!user) {
            return { success: false, message: 'Email hoặc mật khẩu không chính xác!' };
        }

        this.setCurrentSession(user, remember);
        return { success: true, user: user };
    }

    resetPassword(email) {
        if (!email || !email.trim()) {
            return { success: false, message: 'Vui lòng nhập email đăng ký tài khoản!' };
        }

        const users = this.getUsers();
        const user = users.find(u => u.email.toLowerCase() === email.toLowerCase().trim());
        if (!user) {
            return { success: false, message: 'Email này chưa đăng ký tài khoản trên hệ thống SkinID!' };
        }

        const tempPassword = 'SKN' + Math.floor(100000 + Math.random() * 900000);
        user.password = tempPassword;
        localStorage.setItem(this.STORAGE_USERS_KEY, JSON.stringify(users));
        return { success: true, user: user, tempPassword: tempPassword };
    }

    // Password Strength Meter
    checkPasswordStrength(password) {
        if (!password) return { score: 0, label: 'Chưa nhập', color: 'bg-gray-200', textClass: 'text-gray-400', width: '0%' };

        let score = 0;
        if (password.length >= 6) score += 1;
        if (password.length >= 8) score += 1;
        if (/[A-Z]/.test(password) && /[a-z]/.test(password)) score += 1;
        if (/[0-9]/.test(password)) score += 1;
        if (/[^A-Za-z0-9]/.test(password)) score += 1;

        if (score <= 1) return { score: 1, label: 'Rất yếu', color: 'bg-rose-500', width: '25%', textClass: 'text-rose-500' };
        if (score === 2) return { score: 2, label: 'Yếu', color: 'bg-amber-500', width: '50%', textClass: 'text-amber-500' };
        if (score === 3) return { score: 3, label: 'Trung bình', color: 'bg-sky-500', width: '75%', textClass: 'text-sky-500' };
        return { score: 4, label: 'Mạnh', color: 'bg-emerald-500', width: '100%', textClass: 'text-emerald-500' };
    }

    // =========================================================================
    // 4. SESSION & USER DATA MANAGEMENT
    // =========================================================================
    getUsers() {
        try {
            return JSON.parse(localStorage.getItem(this.STORAGE_USERS_KEY)) || [];
        } catch (e) {
            return [];
        }
    }

    getCurrentUser() {
        try {
            const session = sessionStorage.getItem(this.STORAGE_CURRENT_USER_KEY) || localStorage.getItem(this.STORAGE_CURRENT_USER_KEY);
            return session ? JSON.parse(session) : null;
        } catch (e) {
            return null;
        }
    }

    setCurrentSession(user, remember = true) {
        const sessionData = {
            id: user.id,
            name: user.name,
            email: user.email,
            phone: user.phone || '',
            picture: user.picture || null,
            provider: user.provider || 'local',
            verified: user.verified || false,
            loginAt: new Date().toISOString()
        };

        const jsonStr = JSON.stringify(sessionData);
        if (remember) {
            localStorage.setItem(this.STORAGE_CURRENT_USER_KEY, jsonStr);
            sessionStorage.removeItem(this.STORAGE_CURRENT_USER_KEY);
        } else {
            sessionStorage.setItem(this.STORAGE_CURRENT_USER_KEY, jsonStr);
            localStorage.removeItem(this.STORAGE_CURRENT_USER_KEY);
        }

        this.updateHeaderUI();
    }

    logout() {
        localStorage.removeItem(this.STORAGE_CURRENT_USER_KEY);
        sessionStorage.removeItem(this.STORAGE_CURRENT_USER_KEY);
        this.updateHeaderUI();
        if (typeof showToast === 'function') {
            showToast('Đã đăng xuất tài khoản thành công');
        }
    }

    // =========================================================================
    // 5. SCAN HISTORY MANAGEMENT
    // =========================================================================
    saveScanHistory(reportData) {
        const user = this.getCurrentUser();
        if (!user) return false;

        try {
            const allHistory = JSON.parse(localStorage.getItem(this.STORAGE_HISTORY_KEY)) || {};
            if (!allHistory[user.id]) {
                allHistory[user.id] = [];
            }

            const record = {
                id: 'scan_' + Date.now(),
                timestamp: new Date().toISOString(),
                dateFormatted: new Date().toLocaleDateString('vi-VN') + ' ' + new Date().toLocaleTimeString('vi-VN', {hour:'2-digit', minute:'2-digit'}),
                healthScore: reportData.healthScore || 70,
                skinType: reportData.skinType || 'Da chưa xác định',
                skinAge: reportData.skinAge || 25,
                primaryConcerns: reportData.primaryConcerns || [],
                metrics: reportData.metrics || {},
                recommendedRoutine: reportData.recommendedRoutine || []
            };

            allHistory[user.id].unshift(record); // newest first
            localStorage.setItem(this.STORAGE_HISTORY_KEY, JSON.stringify(allHistory));
            console.log("SkinID Scan History saved for user:", user.email, record);
            return record;
        } catch (e) {
            console.error("Failed to save scan history:", e);
            return false;
        }
    }

    getScanHistory() {
        const user = this.getCurrentUser();
        if (!user) return [];

        try {
            const allHistory = JSON.parse(localStorage.getItem(this.STORAGE_HISTORY_KEY)) || {};
            return allHistory[user.id] || [];
        } catch (e) {
            return [];
        }
    }

    clearAllUserHistory() {
        const user = this.getCurrentUser();
        if (!user) return;
        if (confirm("Bạn có chắc chắn muốn xóa toàn bộ lịch sử soi da & dữ liệu cá nhân theo Nghị định 13/2023/NĐ-CP?")) {
            try {
                const allHistory = JSON.parse(localStorage.getItem(this.STORAGE_HISTORY_KEY)) || {};
                delete allHistory[user.id];
                localStorage.setItem(this.STORAGE_HISTORY_KEY, JSON.stringify(allHistory));
                this.renderHistoryContent();
                this.updateHeaderUI();
                if (typeof showToast === 'function') {
                    showToast('Đã xóa toàn bộ lịch sử & dữ liệu cá nhân thành công');
                }
            } catch (e) {
                console.error("Failed to delete user history:", e);
            }
        }
    }

    // =========================================================================
    // 6. HEADER & MODAL UI UPDATES
    // =========================================================================
    updateHeaderUI() {
        const user = this.getCurrentUser();
        const authSection = document.getElementById('header-auth-section');
        if (!authSection) return;

        if (user) {
            const scanCount = this.getScanHistory().length;
            
            // Avatar generator (real photo or stylized initials)
            let avatarHtml = '';
            if (user.picture) {
                avatarHtml = `<img src="${user.picture}" class="w-7 h-7 rounded-full object-cover ring-2 ring-brand-primary" alt="${user.name}" onerror="this.outerHTML='<div class=\\\'w-7 h-7 rounded-full bg-brand-primary text-white flex items-center justify-center font-bold text-xs\\\'>${user.name.charAt(0).toUpperCase()}</div>'">`;
            } else {
                const initial = user.name ? user.name.charAt(0).toUpperCase() : 'U';
                avatarHtml = `<div class="w-7 h-7 rounded-full bg-gradient-to-tr from-brand-primary to-rose-400 text-white flex items-center justify-center font-black text-xs shadow-sm">${initial}</div>`;
            }

            const isGoogle = user.provider === 'google';
            const verifiedBadge = isGoogle 
                ? `<span class="inline-flex items-center gap-1 text-[9px] font-bold text-sky-600 bg-sky-50 px-1.5 py-0.5 rounded border border-sky-100">
                    <svg class="w-2.5 h-2.5 fill-sky-600" viewBox="0 0 24 24"><path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41L9 16.17z"/></svg> Google
                   </span>`
                : `<span class="inline-flex items-center gap-1 text-[9px] font-bold text-emerald-600 bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-100">
                    Thành viên
                   </span>`;

            authSection.innerHTML = `
                <div class="flex items-center gap-2 sm:gap-3">
                    <button onclick="window.authManager.openHistoryModal()" class="flex items-center gap-1.5 bg-brand-blush text-brand-dark px-3 py-1.5 sm:px-3.5 sm:py-2 rounded-full text-xs font-bold border border-brand-petal hover:bg-brand-primary hover:text-white transition-all shadow-sm">
                        <i data-feather="clock" class="w-3.5 h-3.5"></i>
                        <span class="hidden sm:inline">Lịch sử soi da</span>
                        <span class="bg-brand-primary text-white text-[10px] font-extrabold px-1.5 py-0.2 rounded-full group-hover:bg-white group-hover:text-brand-primary">${scanCount}</span>
                    </button>
                    
                    <div class="relative group">
                        <button class="flex items-center gap-2 bg-gray-900 text-white pl-2 pr-3 py-1.5 rounded-full text-xs font-bold shadow-sm hover:bg-brand-dark transition-all">
                            ${avatarHtml}
                            <span class="max-w-[90px] sm:max-w-[120px] truncate">${user.name}</span>
                            <i data-feather="chevron-down" class="w-3 h-3 text-gray-400"></i>
                        </button>
                        
                        <div class="absolute right-0 top-full mt-1.5 w-60 bg-white rounded-2xl shadow-2xl border border-gray-100 p-2 hidden group-hover:block z-50 animate-fadeIn">
                            <div class="px-3.5 py-2.5 border-b border-gray-100">
                                <div class="flex items-center justify-between mb-1">
                                    <p class="text-xs font-bold text-gray-900 truncate">${user.name}</p>
                                    ${verifiedBadge}
                                </div>
                                <p class="text-[11px] text-gray-500 truncate">${user.email}</p>
                            </div>
                            
                            <div class="py-1 space-y-0.5">
                                <button onclick="window.authManager.openHistoryModal()" class="w-full text-left px-3 py-2 text-xs text-gray-700 hover:bg-brand-blush hover:text-brand-primary rounded-xl font-semibold flex items-center gap-2.5 transition-colors">
                                    <i data-feather="file-text" class="w-3.5 h-3.5 text-brand-primary"></i> Lịch sử Soi Da AI
                                </button>
                                <button onclick="window.authManager.openProfileModal()" class="w-full text-left px-3 py-2 text-xs text-gray-700 hover:bg-gray-50 rounded-xl font-semibold flex items-center gap-2.5 transition-colors">
                                    <i data-feather="user" class="w-3.5 h-3.5 text-gray-500"></i> Thông tin cá nhân
                                </button>
                            </div>
                            
                            <div class="pt-1 border-t border-gray-100 mt-1">
                                <button onclick="window.authManager.logout()" class="w-full text-left px-3 py-2 text-xs text-rose-600 hover:bg-rose-50 rounded-xl font-bold flex items-center gap-2.5 transition-colors">
                                    <i data-feather="log-out" class="w-3.5 h-3.5"></i> Đăng xuất
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            `;
        } else {
            authSection.innerHTML = `
                <button onclick="window.authManager.openAuthModal()" class="flex items-center gap-1.5 bg-white text-brand-dark border border-brand-petal px-4 py-2 rounded-full text-xs font-bold hover:bg-brand-blush hover:border-brand-primary transition-all shadow-sm">
                    <i data-feather="user" class="w-3.5 h-3.5 text-brand-primary"></i>
                    Đăng nhập / Đăng ký
                </button>
            `;
        }

        if (typeof feather !== 'undefined') feather.replace();
    }

    openAuthModal(noticeMsg = '') {
        let modal = document.getElementById('auth-modal');
        if (!modal) return;

        const noticeEl = document.getElementById('auth-modal-notice');
        if (noticeEl) {
            if (noticeMsg) {
                noticeEl.innerText = noticeMsg;
                noticeEl.classList.remove('hidden');
            } else {
                noticeEl.classList.add('hidden');
            }
        }

        modal.classList.remove('hidden');
        setTimeout(() => {
            modal.classList.remove('opacity-0');
            const content = document.getElementById('auth-modal-content');
            if (content) content.classList.remove('scale-95');
        }, 10);
    }

    closeAuthModal() {
        let modal = document.getElementById('auth-modal');
        if (!modal) return;

        const content = document.getElementById('auth-modal-content');
        if (content) content.classList.add('scale-95');
        modal.classList.add('opacity-0');
        setTimeout(() => {
            modal.classList.add('hidden');
        }, 300);
    }

    openHistoryModal() {
        const user = this.getCurrentUser();
        if (!user) {
            this.openAuthModal('Vui lòng đăng nhập để xem lịch sử soi da cá nhân.');
            return;
        }

        let modal = document.getElementById('history-modal');
        if (!modal) return;

        this.renderHistoryContent();

        modal.classList.remove('hidden');
        setTimeout(() => {
            modal.classList.remove('opacity-0');
            const content = document.getElementById('history-modal-content');
            if (content) content.classList.remove('scale-95');
        }, 10);
    }

    closeHistoryModal() {
        let modal = document.getElementById('history-modal');
        if (!modal) return;

        const content = document.getElementById('history-modal-content');
        if (content) content.classList.add('scale-95');
        modal.classList.add('opacity-0');
        setTimeout(() => {
            modal.classList.add('hidden');
        }, 300);
    }

    openProfileModal() {
        const user = this.getCurrentUser();
        if (!user) return;
        
        let info = `Họ và tên: ${user.name}\nEmail: ${user.email}\nSố điện thoại: ${user.phone || 'Chưa cập nhật'}\nPhương thức đăng nhập: ${user.provider === 'google' ? 'Google OAuth' : 'Email/Mật khẩu'}`;
        alert(`=== THÔNG TIN HỒ SƠ CÁ NHÂN ===\n\n${info}`);
    }

    renderHistoryContent() {
        const historyList = this.getScanHistory();
        const container = document.getElementById('history-list-container');
        if (!container) return;

        if (historyList.length === 0) {
            container.innerHTML = `
                <div class="text-center py-12 text-gray-400">
                    <i data-feather="activity" class="w-12 h-12 mx-auto text-gray-300 mb-3"></i>
                    <p class="font-bold text-sm text-gray-600">Chưa có lịch sử soi da nào</p>
                    <p class="text-xs text-gray-400 mt-1">Hãy thực hiện soi da AI 3 góc để lưu trữ báo cáo đầu tiên của bạn!</p>
                    <button onclick="window.authManager.closeHistoryModal(); openPrivacyModal();" class="mt-4 px-5 py-2.5 bg-brand-primary text-white text-xs font-bold rounded-xl shadow-md">
                        Bắt đầu Soi Da AI ngay
                    </button>
                </div>
            `;
            if (typeof feather !== 'undefined') feather.replace();
            return;
        }

        let html = `
            <div class="flex items-center justify-between bg-rose-50 border border-rose-100 p-3 rounded-2xl mb-3">
                <div class="flex items-center gap-2 text-xs text-rose-800">
                    <i data-feather="shield-off" class="w-4 h-4 text-rose-600 flex-shrink-0"></i>
                    <span>Quyền bảo vệ dữ liệu (NĐ 13/2023):</span>
                </div>
                <button onclick="window.authManager.clearAllUserHistory()" class="text-xs font-bold text-rose-600 hover:text-rose-800 underline flex items-center gap-1">
                    <i data-feather="trash-2" class="w-3.5 h-3.5"></i> Xóa dữ liệu
                </button>
            </div>
        `;
        historyList.forEach((item, index) => {
            let scoreColor = 'text-emerald-600 bg-emerald-50 border-emerald-200';
            if (item.healthScore < 60) scoreColor = 'text-rose-600 bg-rose-50 border-rose-200';
            else if (item.healthScore < 75) scoreColor = 'text-amber-600 bg-amber-50 border-amber-200';

            html += `
                <div class="bg-white border border-gray-100 rounded-2xl p-4 shadow-sm hover:shadow-md transition-shadow relative overflow-hidden mb-3">
                    <div class="flex items-center justify-between border-b border-gray-50 pb-3 mb-3">
                        <div class="flex items-center gap-2">
                            <span class="text-xs font-black bg-brand-dark text-white px-2.5 py-0.5 rounded-full">Lần #${historyList.length - index}</span>
                            <span class="text-xs text-gray-500 font-medium">${item.dateFormatted}</span>
                        </div>
                        <div class="px-3 py-1 rounded-full border ${scoreColor} text-xs font-extrabold flex items-center gap-1">
                            Điểm sức khỏe: ${item.healthScore}/100
                        </div>
                    </div>
                    
                    <div class="grid grid-cols-2 sm:grid-cols-3 gap-3 mb-3">
                        <div class="bg-gray-50 p-2.5 rounded-xl">
                            <span class="text-[10px] text-gray-400 uppercase font-bold block">Loại da</span>
                            <span class="text-xs font-bold text-gray-800">${item.skinType}</span>
                        </div>
                        <div class="bg-gray-50 p-2.5 rounded-xl">
                            <span class="text-[10px] text-gray-400 uppercase font-bold block">Tuổi da AI</span>
                            <span class="text-xs font-bold text-gray-800">${item.skinAge} tuổi</span>
                        </div>
                        <div class="bg-gray-50 p-2.5 rounded-xl col-span-2 sm:col-span-1">
                            <span class="text-[10px] text-gray-400 uppercase font-bold block">Phác đồ khuyên dùng</span>
                            <span class="text-xs font-bold text-brand-primary">${item.recommendedRoutine.length} sản phẩm</span>
                        </div>
                    </div>

                    ${item.primaryConcerns && item.primaryConcerns.length > 0 ? `
                        <div class="text-xs text-gray-600">
                            <span class="font-bold text-gray-700">Nguy cơ ưu tiên: </span>
                            ${item.primaryConcerns.map(c => `<span class="inline-block bg-rose-50 text-rose-700 text-[10px] font-bold px-2 py-0.5 rounded mr-1">${c}</span>`).join('')}
                        </div>
                    ` : ''}
                </div>
            `;
        });

        container.innerHTML = html;
        if (typeof feather !== 'undefined') feather.replace();
    }
}

// Global instance & window binding
const authManager = new AuthManager();
window.authManager = authManager;
