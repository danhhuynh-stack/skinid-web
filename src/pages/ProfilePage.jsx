import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import {
  ProfileHero,
  ProfileHistoryOverview,
  ProfileHistoryTimeline,
  ProfileIdentityForm,
  ProfileOrders,
  ProfileScanDetailModal,
  useProfile
} from '../features/profile/index.js';
import Footer from '../components/layout/Footer.jsx';
import Header from '../components/layout/Header.jsx';
import MobileNav from '../components/layout/MobileNav.jsx';
import OfferBar from '../components/layout/OfferBar.jsx';
import StorefrontModals from '../components/dialogs/StorefrontModals.jsx';
import usePageMetadata from '../hooks/usePageMetadata.js';
import '../styles/profile.css';

export default function ProfilePage() {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const [pageMessage, setPageMessage] = useState(null);
  const [passwords, setPasswords] = useState({ current: '', next: '', confirmation: '' });
  const [passwordMessage, setPasswordMessage] = useState(null);
  const {
    changeAvatar,
    cancelOrder,
    clearHistory,
    downloadPdf,
    history,
    isAuthenticated,
    isLoading,
    isSaving,
    logout,
    orders,
    saveProfile,
    user,
    updatePassword
  } = useProfile();

  usePageMetadata({
    title: 'Hồ Sơ Cá Nhân & Lịch Sử Soi Da | SkinID.vn',
    description: 'Quản lý hồ sơ cá nhân và lịch sử soi da tại SkinID.vn.'
  });
  const validTabs = ['profile', 'history', 'orders', 'settings'];
  const requestedTab = searchParams.get('tab');
  const activeTab = validTabs.includes(requestedTab) ? requestedTab : 'profile';

  useEffect(() => {
    if (!isLoading && !isAuthenticated) navigate('/?auth=1', { replace: true });
  }, [isAuthenticated, isLoading, navigate]);

  const selectTab = (tab) => {
    const next = new URLSearchParams(searchParams);
    if (tab === 'profile') next.delete('tab');
    else next.set('tab', tab);
    setSearchParams(next, { replace: true });
  };

  const handleLogout = async () => {
    try {
      await logout();
    } finally {
      navigate('/', { replace: true });
    }
  };

  const handleAvatarChange = async (event) => {
    const file = event.target.files?.[0];
    event.target.value = '';
    if (!file) return;
    try {
      await changeAvatar(file);
      setPageMessage({ type: 'success', text: 'Ảnh đại diện đã được cập nhật.' });
    } catch (error) {
      setPageMessage({ type: 'error', text: error.message || 'Không thể cập nhật ảnh đại diện.' });
    }
  };

  const handlePasswordChange = async (event) => {
    event.preventDefault();
    setPasswordMessage(null);
    if (passwords.next !== passwords.confirmation) {
      setPasswordMessage({ type: 'error', text: 'Mật khẩu mới và xác nhận mật khẩu không trùng khớp.' });
      return;
    }
    try {
      await updatePassword(passwords.current, passwords.next);
      setPasswords({ current: '', next: '', confirmation: '' });
      setPasswordMessage({ type: 'success', text: 'Mật khẩu đã được thay đổi thành công.' });
    } catch (error) {
      setPasswordMessage({ type: 'error', text: error.message || 'Không thể đổi mật khẩu.' });
    }
  };

  const handleClearHistory = async () => {
    try {
      if (await clearHistory()) setPageMessage({ type: 'success', text: 'Lịch sử soi da đã được xóa.' });
    } catch (error) {
      setPageMessage({ type: 'error', text: error.message || 'Không thể xóa lịch sử soi da.' });
    }
  };

  return (
    <>
    <OfferBar />
    <Header />
    <div className="profile-page min-h-screen flex flex-col">
    <main className="profile-main container">

        <header className="profile-page-heading">
            <span>KHÔNG GIAN CỦA BẠN</span>
            <div>
                <h1>Chăm da có nhịp.<br /><em>Lưu giữ từng thay đổi.</em></h1>
                <p>Hồ sơ, kết quả soi da và đơn hàng được sắp xếp trong một hành trình nhẹ nhàng, rõ ràng và riêng tư.</p>
            </div>
        </header>

        <ProfileHero user={user} historyCount={history.length} isLoading={isLoading} onAvatarChange={handleAvatarChange} />
        {pageMessage && <div role={pageMessage.type === 'error' ? 'alert' : 'status'} className={`mb-6 rounded-2xl px-4 py-3 text-xs font-semibold ${pageMessage.type === 'error' ? 'bg-rose-50 text-rose-700' : 'bg-emerald-50 text-emerald-700'}`}>{pageMessage.text}</div>}
        {/* DASHBOARD NAVIGATION TABS */}
        <div className="profile-tabs flex overflow-x-auto no-scrollbar mb-8" role="tablist" aria-label="Khu vực hồ sơ">
            {[['profile', 'Hồ sơ cá nhân'], ['history', 'Lịch sử soi da'], ['orders', 'Đơn hàng'], ['settings', 'Cài đặt']].map(([tab, label]) => (
                <button key={tab} id={`profile-tab-${tab}`} type="button" role="tab" aria-controls={`profile-panel-${tab}`} onClick={() => selectTab(tab)} aria-selected={activeTab === tab} className={`tab-btn ${activeTab === tab ? 'active' : ''} flex-1 min-w-[140px] py-4 px-4 text-xs sm:text-sm font-bold text-gray-600 flex items-center justify-center gap-2`}>{label}</button>
            ))}
        </div>

        {/* =================================================================== */}
        {/* TAB 1: HỒ SƠ CÁ NHÂN & THỂ TRẠNG DA */}
        {/* =================================================================== */}
        {activeTab === 'profile' && (
            <div id="profile-panel-profile" role="tabpanel" aria-labelledby="profile-tab-profile" className="profile-tab-panel space-y-8"><ProfileIdentityForm user={user} isSaving={isSaving} onSave={saveProfile} /></div>
        )}
        {/* =================================================================== */}
        {/* TAB 2: LỊCH SỬ SOI DA & TIẾN TRÌNH BIỂU ĐỒ */}
        {/* =================================================================== */}
        {activeTab === 'history' && <div id="profile-panel-history" role="tabpanel" aria-labelledby="profile-tab-history" className="profile-tab-panel space-y-8">

            <ProfileHistoryOverview history={history} />

            {/* Detailed Scan Timeline List */}
            <div className="profile-surface p-6 sm:p-8">
                <div className="flex items-center justify-between mb-6 pb-4 border-b border-gray-100">
                    <div>
                        <h2 className="text-lg font-black text-gray-900">Nhật Ký Các Phiên Soi Da Chi Tiết</h2>
                        <p className="text-xs text-gray-500">Toàn bộ hồ sơ báo cáo và chu trình chăm sóc da đã được AI phân tích tham khảo</p>
                    </div>
                    <a href="/skin-analysis" className="text-xs font-bold text-brand-primary hover:underline flex items-center gap-1">
                        + Soi da mới
                    </a>
                </div>

                <ProfileHistoryTimeline history={history} />
            </div>
        </div>}

        {activeTab === 'orders' && <div id="profile-panel-orders" role="tabpanel" aria-labelledby="profile-tab-orders" className="profile-tab-panel space-y-5">
            <div className="profile-surface p-6 sm:p-8">
                <div className="pb-4 mb-5 border-b border-gray-100">
                    <h2 className="text-lg font-black text-gray-900">Đơn Hàng Của Tôi</h2>
                    <p className="text-xs text-gray-500">Theo dõi trạng thái xác nhận, giao hàng và thanh toán của mọi đơn mua.</p>
                </div>
                <ProfileOrders orders={orders} isLoading={isLoading} onCancel={cancelOrder} />
            </div>
        </div>}

        {/* =================================================================== */}
        {/* TAB 4: CÀI ĐẶT & BẢO MẬT & QUYỀN RIÊNG TƯ */}
        {/* =================================================================== */}
        {activeTab === 'settings' && <div id="profile-panel-settings" role="tabpanel" aria-labelledby="profile-tab-settings" className="profile-tab-panel space-y-8">

            {/* 3.1 Đổi Mật Khẩu */}
            <div className="profile-surface p-6 sm:p-8">
                <div className="pb-4 mb-6 border-b border-gray-100">
                    <h2 className="text-lg font-black text-gray-900">Bảo Mật & Mật Khẩu</h2>
                    <p className="text-xs text-gray-500">Thay đổi mật khẩu đăng nhập tài khoản Email cá nhân</p>
                </div>

                {user?.provider !== 'google' ? <form id="form-change-password" onSubmit={handlePasswordChange} className="space-y-4 max-w-lg">
                    <div>
                        <label className="block text-xs font-bold text-gray-700 mb-1.5">Mật khẩu hiện tại</label>
                        <input type="password" value={passwords.current} onChange={(event) => setPasswords((current) => ({ ...current, current: event.target.value }))} required placeholder="••••••••" className="w-full bg-gray-50 border border-gray-200 rounded-2xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-brand-primary focus:bg-white transition-all" />
                    </div>
                    <div>
                        <label className="block text-xs font-bold text-gray-700 mb-1.5">Mật khẩu mới (Tối thiểu 6 ký tự)</label>
                        <input type="password" value={passwords.next} onChange={(event) => setPasswords((current) => ({ ...current, next: event.target.value }))} required minLength={6} placeholder="Tối thiểu 6 ký tự" className="w-full bg-gray-50 border border-gray-200 rounded-2xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-brand-primary focus:bg-white transition-all" />
                    </div>
                    <div>
                        <label className="block text-xs font-bold text-gray-700 mb-1.5">Xác nhận mật khẩu mới</label>
                        <input type="password" value={passwords.confirmation} onChange={(event) => setPasswords((current) => ({ ...current, confirmation: event.target.value }))} required minLength={6} placeholder="Nhập lại mật khẩu mới" className="w-full bg-gray-50 border border-gray-200 rounded-2xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-brand-primary focus:bg-white transition-all" />
                    </div>
                    <button type="submit" disabled={isSaving} className="profile-btn profile-btn--secondary disabled:opacity-50">
                        {isSaving ? 'Đang cập nhật…' : 'Cập nhật Mật Khẩu'}
                    </button>
                    {passwordMessage && <div role={passwordMessage.type === 'error' ? 'alert' : 'status'} className={`rounded-xl px-4 py-3 text-xs font-semibold ${passwordMessage.type === 'error' ? 'bg-rose-50 text-rose-700' : 'bg-emerald-50 text-emerald-700'}`}>{passwordMessage.text}</div>}
                </form> : <div className="profile-google-notice">
                    <div><strong>Mật khẩu do Google quản lý</strong><p>Tài khoản này đăng nhập qua Google nên không sử dụng mật khẩu riêng của SkinID.</p></div>
                </div>}
            </div>

            {/* 3.2 Quyền Riêng Tư & Dữ Liệu Cá Nhân (NĐ 13/2023) */}
            <div className="profile-surface p-6 sm:p-8">
                <div className="pb-4 mb-6 border-b border-gray-100">
                    <h2 className="text-lg font-black text-gray-900">Quyền riêng tư & dữ liệu</h2>
                    <p className="text-xs text-gray-500">Bạn có thể tải báo cáo PDF hoặc xóa lịch sử soi da khỏi tài khoản.</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    <div className="profile-data-card flex flex-col justify-between bg-gradient-to-br from-[#FFF0F4] via-[#FFFFFF] to-[#FFF5F7] shadow-[0_12px_32px_rgba(224,109,129,0.08)]">
                        <div>
                            <div className="flex items-center gap-2 text-[#282326] font-extrabold text-sm mb-2">
                                <span className="w-7 h-7 rounded-full bg-[#FFF0F4] text-[#E06D81] flex items-center justify-center flex-shrink-0">
                                    <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                                        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
                                        <polyline points="14 2 14 8 20 8"></polyline>
                                        <line x1="16" y1="13" x2="8" y2="13"></line>
                                        <line x1="16" y1="17" x2="8" y2="17"></line>
                                        <polyline points="10 9 9 9 8 9"></polyline>
                                    </svg>
                                </span>
                                Xuất Báo Cáo PDF
                            </div>
                            <p className="text-xs text-[#6F686B] mb-5 leading-relaxed">Tải về báo cáo hồ sơ cá nhân, 12 chỉ số cấu trúc da và phác đồ dược mỹ phẩm đề xuất định dạng PDF sắc nét.</p>
                        </div>
                        <button type="button" onClick={downloadPdf} className="profile-btn profile-btn--primary self-start flex items-center gap-2">
                            <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
                                <polyline points="7 10 12 15 17 10"></polyline>
                                <line x1="12" y1="15" x2="12" y2="3"></line>
                            </svg>
                            Tải Xuống Báo Cáo PDF
                        </button>
                    </div>

                    <div className="profile-data-card flex flex-col justify-between bg-gradient-to-br from-[#FFF0F0] via-[#FFFFFF] to-[#FFF5F5] shadow-[0_12px_32px_rgba(180,35,24,0.06)]">
                        <div>
                            <div className="flex items-center gap-2 text-[#B42318] font-extrabold text-sm mb-2">
                                <span className="w-7 h-7 rounded-full bg-[#FEE4E2] text-[#B42318] flex items-center justify-center flex-shrink-0">
                                    <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                                        <polyline points="3 6 5 6 21 6"></polyline>
                                        <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                                    </svg>
                                </span>
                                Xóa Lịch Sử Soi Da
                            </div>
                            <p className="text-xs text-[#6F686B] mb-5 leading-relaxed">Xóa vĩnh viễn các báo cáo soi da đã lưu. Hồ sơ, giỏ hàng và đơn mua vẫn được bảo toàn nguyên vẹn.</p>
                        </div>
                        <button type="button" onClick={handleClearHistory} className="profile-btn profile-btn--danger self-start">
                            Xóa lịch sử soi da
                        </button>
                    </div>
                </div>
            </div>

            {/* 3.3 Quản lý phiên đăng nhập */}
            <div className="profile-surface p-6 sm:p-8">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div>
                        <h2 className="text-lg font-black text-gray-900">Phiên Đăng Nhập</h2>
                        <p className="text-xs text-gray-500">Đăng xuất tài khoản khỏi trình duyệt này để bảo mật thông tin cá nhân.</p>
                    </div>
                    <button 
                        type="button" 
                        onClick={handleLogout}
                        className="profile-btn profile-btn--secondary self-start sm:self-auto"
                    >
                        <span>Đăng xuất tài khoản</span>
                    </button>
                </div>
            </div>

        </div>}

    </main>

    <ProfileScanDetailModal history={history} />
    </div>
    <Footer />
    <MobileNav />
    <StorefrontModals />
    </>
  );
}
