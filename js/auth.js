/**
 * SkinID Authentication & Scan History Manager (auth.js)
 * Handles User Accounts, Sessions, Scan History, and Header UI integration.
 */

class AuthManager {
    constructor() {
        this.STORAGE_USERS_KEY = 'SKINID_USERS_DB';
        this.STORAGE_CURRENT_USER_KEY = 'SKINID_CURRENT_USER_SESSION';
        this.STORAGE_HISTORY_KEY = 'SKINID_SCAN_HISTORY_DB';
        this.init();
    }

    init() {
        if (!localStorage.getItem(this.STORAGE_USERS_KEY)) {
            // Seed a demo user for testing
            const demoUsers = [
                {
                    id: 'usr_demo_1',
                    name: 'Khách Hàng Demo',
                    email: 'demo@skinid.vn',
                    phone: '0901234567',
                    password: '123',
                    createdAt: new Date().toISOString()
                }
            ];
            localStorage.setItem(this.STORAGE_USERS_KEY, JSON.stringify(demoUsers));
        }

        if (!localStorage.getItem(this.STORAGE_HISTORY_KEY)) {
            localStorage.setItem(this.STORAGE_HISTORY_KEY, JSON.stringify({}));
        }

        // Listen for DOM load to bind UI
        document.addEventListener('DOMContentLoaded', () => {
            this.updateHeaderUI();
        });
    }

    getUsers() {
        try {
            return JSON.parse(localStorage.getItem(this.STORAGE_USERS_KEY)) || [];
        } catch (e) {
            return [];
        }
    }

    getCurrentUser() {
        try {
            return JSON.parse(localStorage.getItem(this.STORAGE_CURRENT_USER_KEY)) || null;
        } catch (e) {
            return null;
        }
    }

    register(name, email, phone, password) {
        const users = this.getUsers();
        const existing = users.find(u => u.email.toLowerCase() === email.toLowerCase().trim());
        if (existing) {
            return { success: false, message: 'Email này đã được đăng ký tài khoản!' };
        }

        const newUser = {
            id: 'usr_' + Date.now() + '_' + Math.random().toString(36).substring(2, 7),
            name: name.trim(),
            email: email.toLowerCase().trim(),
            phone: phone ? phone.trim() : '',
            password: password,
            createdAt: new Date().toISOString()
        };

        users.push(newUser);
        localStorage.setItem(this.STORAGE_USERS_KEY, JSON.stringify(users));
        
        // Auto login
        this.setCurrentSession(newUser);
        return { success: true, user: newUser };
    }

    login(email, password) {
        const users = this.getUsers();
        const user = users.find(u => 
            u.email.toLowerCase() === email.toLowerCase().trim() && 
            u.password === password
        );

        if (!user) {
            return { success: false, message: 'Email hoặc mật khẩu không chính xác!' };
        }

        this.setCurrentSession(user);
        return { success: true, user: user };
    }

    loginOrRegisterGoogle(googleUser) {
        const users = this.getUsers();
        let user = users.find(u => u.email.toLowerCase() === googleUser.email.toLowerCase().trim());
        if (!user) {
            user = {
                id: 'usr_gg_' + Date.now(),
                name: googleUser.name || 'Khách Hàng Google',
                email: googleUser.email.toLowerCase().trim(),
                phone: googleUser.phone || '',
                password: 'google_auth_sso',
                createdAt: new Date().toISOString()
            };
            users.push(user);
            localStorage.setItem(this.STORAGE_USERS_KEY, JSON.stringify(users));
        }
        this.setCurrentSession(user);
        return { success: true, user: user };
    }

    resetPassword(email) {
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

    logout() {
        localStorage.removeItem(this.STORAGE_CURRENT_USER_KEY);
        this.updateHeaderUI();
        if (typeof showToast === 'function') {
            showToast('Đã đăng xuất tài khoản thành công');
        }
    }

    setCurrentSession(user) {
        const sessionData = {
            id: user.id,
            name: user.name,
            email: user.email,
            phone: user.phone,
            loginAt: new Date().toISOString()
        };
        localStorage.setItem(this.STORAGE_CURRENT_USER_KEY, JSON.stringify(sessionData));
        this.updateHeaderUI();
    }

    // SCAN HISTORY LOGIC
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

    // UI UPDATES
    updateHeaderUI() {
        const user = this.getCurrentUser();
        const authSection = document.getElementById('header-auth-section');
        if (!authSection) return;

        if (user) {
            authSection.innerHTML = `
                <div class="flex items-center gap-2">
                    <button onclick="window.authManager.openHistoryModal()" class="flex items-center gap-2 bg-brand-blush text-brand-dark px-3.5 py-2 rounded-full text-xs font-bold border border-brand-petal hover:bg-brand-primary hover:text-white transition-all shadow-sm">
                        <i data-feather="clock" class="w-3.5 h-3.5"></i>
                        Lịch sử soi da (${this.getScanHistory().length})
                    </button>
                    <div class="relative group">
                        <button class="flex items-center gap-2 bg-gray-900 text-white px-3.5 py-2 rounded-full text-xs font-bold shadow-sm hover:bg-brand-dark transition-colors">
                            <i data-feather="user" class="w-3.5 h-3.5 text-brand-primary"></i>
                            <span class="max-w-[100px] truncate">${user.name}</span>
                            <i data-feather="chevron-down" class="w-3 h-3 text-gray-400"></i>
                        </button>
                        <div class="absolute right-0 top-full mt-1 w-48 bg-white rounded-2xl shadow-xl border border-gray-100 p-2 hidden group-hover:block z-50">
                            <div class="px-3 py-2 border-b border-gray-100">
                                <p class="text-xs font-bold text-gray-900 truncate">${user.name}</p>
                                <p class="text-[10px] text-gray-500 truncate">${user.email}</p>
                            </div>
                            <button onclick="window.authManager.openHistoryModal()" class="w-full text-left px-3 py-2 text-xs text-gray-700 hover:bg-brand-blush hover:text-brand-primary rounded-xl font-medium flex items-center gap-2 mt-1">
                                <i data-feather="file-text" class="w-3.5 h-3.5"></i> Hồ sơ & Lịch sử
                            </button>
                            <button onclick="window.authManager.logout()" class="w-full text-left px-3 py-2 text-xs text-rose-600 hover:bg-rose-50 rounded-xl font-bold flex items-center gap-2">
                                <i data-feather="log-out" class="w-3.5 h-3.5"></i> Đăng xuất
                            </button>
                        </div>
                    </div>
                </div>
            `;
        } else {
            authSection.innerHTML = `
                <button onclick="window.authManager.openAuthModal()" class="flex items-center gap-1.5 bg-white text-brand-dark border border-brand-petal px-4 py-2 rounded-full text-xs font-bold hover:bg-brand-blush transition-colors shadow-sm">
                    <i data-feather="log-in" class="w-3.5 h-3.5 text-brand-primary"></i>
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
            document.getElementById('auth-modal-content').classList.remove('scale-95');
        }, 10);
    }

    closeAuthModal() {
        let modal = document.getElementById('auth-modal');
        if (!modal) return;

        document.getElementById('auth-modal-content').classList.add('scale-95');
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
            document.getElementById('history-modal-content').classList.remove('scale-95');
        }, 10);
    }

    closeHistoryModal() {
        let modal = document.getElementById('history-modal');
        if (!modal) return;

        document.getElementById('history-modal-content').classList.add('scale-95');
        modal.classList.add('opacity-0');
        setTimeout(() => {
            modal.classList.add('hidden');
        }, 300);
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
                <div class="bg-white border border-gray-100 rounded-2xl p-4 shadow-sm hover:shadow-md transition-shadow relative overflow-hidden">
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
                        <div class="text-xs text-gray-600 mb-2">
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
}

// Global instance
window.authManager = new AuthManager();
