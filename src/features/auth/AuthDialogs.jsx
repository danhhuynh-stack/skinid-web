import { useEffect, useState } from 'react';
import { useAuth } from './context/AuthContext.jsx';
import { useBodyScrollLock } from '../../shared/hooks/useBodyScrollLock.js';

const googleIcon = (
  <svg className="w-4.5 h-4.5 flex-shrink-0" viewBox="0 0 48 48" aria-hidden="true">
    <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z" />
    <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z" />
    <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.28-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z" />
    <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z" />
  </svg>
);

function PasswordField({ id, name, label, autoComplete, onChange }) {
  const [visible, setVisible] = useState(false);
  return (
    <div>
      <label className="auth-field-label" htmlFor={id}>{label}</label>
      <div className="relative">
        <input id={id} name={name} type={visible ? 'text' : 'password'} required minLength={6} className="auth-field-input pr-14" autoComplete={autoComplete} placeholder="••••••••" onChange={onChange} />
        <button type="button" onClick={() => setVisible((value) => !value)} className="auth-pwd-toggle">{visible ? 'ẨN' : 'HIỆN'}</button>
      </div>
    </div>
  );
}

function AuthDialog() {
  const { loginWithEmail, registerWithEmail, loginWithGoogle, resetPassword } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [mode, setMode] = useState('login');
  const [forgotPassword, setForgotPassword] = useState(false);
  const [message, setMessage] = useState('');
  const [busy, setBusy] = useState(false);
  const [password, setPassword] = useState('');
  useBodyScrollLock(isOpen, 'auth');

  useEffect(() => {
    const open = (event) => {
      setMode('login');
      setForgotPassword(false);
      setMessage(event.detail?.message || '');
      setIsOpen(true);
    };
    const close = () => {
      setIsOpen(false);
    };
    document.addEventListener('skinid:auth-dialog-open', open);
    document.addEventListener('skinid:auth-dialog-close', close);
    return () => {
      document.removeEventListener('skinid:auth-dialog-open', open);
      document.removeEventListener('skinid:auth-dialog-close', close);
    };
  }, []);

  const close = () => document.dispatchEvent(new CustomEvent('skinid:auth-dialog-close'));
  const showError = (error) => setMessage(error?.message || 'Không thể hoàn tất yêu cầu.');

  const submitLogin = async (event) => {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    setBusy(true);
    setMessage('');
    try {
      const result = await loginWithEmail(data.get('email'), data.get('password'), data.get('remember') === 'on');
      if (!result?.success) return setMessage(result?.message || 'Đăng nhập không thành công.');
      close();
    } catch (error) {
      showError(error);
    } finally {
      setBusy(false);
    }
  };

  const submitRegister = async (event) => {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    setBusy(true);
    setMessage('');
    try {
      const result = await registerWithEmail({
        name: data.get('name'), email: data.get('email'), phone: data.get('phone'),
        password: data.get('password'), confirmPassword: data.get('confirmPassword'), remember: true
      });
      if (!result?.success) return setMessage(result?.message || 'Đăng ký không thành công.');
      close();
    } catch (error) {
      showError(error);
    } finally {
      setBusy(false);
    }
  };

  const submitForgotPassword = async (event) => {
    event.preventDefault();
    setBusy(true);
    setMessage('');
    try {
      const result = await resetPassword(new FormData(event.currentTarget).get('email'));
      setMessage(result?.message || 'Vui lòng kiểm tra email của bạn.');
      if (result?.success) setForgotPassword(false);
    } catch (error) {
      showError(error);
    } finally {
      setBusy(false);
    }
  };

  const submitGoogle = async () => {
    setBusy(true);
    setMessage('');
    try {
      const result = await loginWithGoogle();
      if (result?.success === false) setMessage(result.message);
      else close();
    } catch (error) {
      showError(error);
    } finally {
      setBusy(false);
    }
  };

  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 z-[999] flex items-center justify-center p-3 sm:p-4" style={{ background: 'rgba(45, 31, 35, 0.65)', backdropFilter: 'blur(12px)' }} role="dialog" aria-modal="true" aria-label={mode === 'register' ? 'Tạo tài khoản' : (forgotPassword ? 'Khôi phục mật khẩu' : 'Đăng nhập')} onMouseDown={(event) => event.target === event.currentTarget && close()}>
      <div className={`auth-shell auth-mode-${mode}`}>
        <section className="auth-panel auth-panel--login">
          <button type="button" onClick={close} className="absolute top-4 right-4 w-8 h-8 flex items-center justify-center rounded-full text-gray-400 hover:text-gray-700 hover:bg-rose-50 z-10" aria-label="Đóng">×</button>
          <div className="auth-panel__inner">
            <div className="text-center mb-5"><h3 className="auth-title-clean">{forgotPassword ? 'Khôi phục mật khẩu' : 'Đăng nhập'}</h3><p className="auth-subtitle-clean">Chào mừng bạn trở lại với SkinID</p></div>
            {message && <div className="auth-inline-notice" role="status"><span>{message}</span></div>}
            {!forgotPassword && <><button type="button" disabled={busy} onClick={submitGoogle} className="auth-google-btn group">{googleIcon}<span>Tiếp tục với Google</span></button><div className="auth-divider"><span>hoặc với email</span></div></>}
            {forgotPassword ? (
              <form onSubmit={submitForgotPassword} className="space-y-3">
                <p className="text-xs text-[#6F686B] leading-relaxed">Nhập email đăng ký. SkinID sẽ gửi liên kết đặt lại mật khẩu an toàn.</p>
                <div><label className="auth-field-label" htmlFor="forgot-email">Email tài khoản</label><input name="email" type="email" id="forgot-email" required className="auth-field-input" autoComplete="email" /></div>
                <button disabled={busy} type="submit" className="auth-cta-btn">Gửi yêu cầu khôi phục</button>
                <button type="button" onClick={() => setForgotPassword(false)} className="w-full text-center text-xs font-semibold py-1">← Quay lại đăng nhập</button>
              </form>
            ) : (
              <form onSubmit={submitLogin} className="space-y-3">
                <div><label className="auth-field-label" htmlFor="login-email">Email</label><input name="email" type="email" id="login-email" required className="auth-field-input" autoComplete="email" /></div>
                <div><div className="flex justify-between items-center mb-1"><span className="auth-field-label mb-0">Mật khẩu</span><button type="button" onClick={() => setForgotPassword(true)} className="auth-forgot-link">Quên mật khẩu?</button></div><PasswordField id="login-password" name="password" label="" autoComplete="current-password" /></div>
                <label className="flex items-center gap-2"><input name="remember" type="checkbox" defaultChecked className="w-4 h-4 accent-[#e45f7a]" /><span className="text-xs text-[#6F686B] font-medium">Ghi nhớ đăng nhập</span></label>
                <button disabled={busy} type="submit" className="auth-cta-btn">{busy ? 'Đang xử lý…' : 'Đăng nhập'}</button>
              </form>
            )}
            <div className="md:hidden text-center mt-4 pt-3 border-t border-rose-100"><span className="text-xs text-[#6F686B]">Chưa có tài khoản? </span><button type="button" onClick={() => { setMode('register'); setMessage(''); }} className="text-xs font-bold text-[#e45f7a]">Tạo tài khoản ngay</button></div>
          </div>
        </section>

        <section className="auth-panel auth-panel--register">
          <button type="button" onClick={close} className="absolute top-4 right-4 w-8 h-8 flex items-center justify-center rounded-full text-gray-400 hover:text-gray-700 hover:bg-rose-50 z-10" aria-label="Đóng">×</button>
          <div className="auth-panel__inner">
            <div className="text-center mb-4"><h3 className="auth-title-clean">Tạo tài khoản</h3><p className="auth-subtitle-clean">Đăng ký nhanh chóng chỉ trong 1 phút</p></div>
            {message && <div className="auth-inline-notice" role="status"><span>{message}</span></div>}
            <form onSubmit={submitRegister} className="mt-2">
              <div className="auth-grid-2"><div><label className="auth-field-label" htmlFor="reg-name">Họ và tên *</label><input name="name" id="reg-name" required minLength={2} className="auth-field-input" autoComplete="name" /></div><div><label className="auth-field-label" htmlFor="reg-phone">Số điện thoại</label><input name="phone" id="reg-phone" type="tel" className="auth-field-input" autoComplete="tel" /></div></div>
              <div className="mt-2"><label className="auth-field-label" htmlFor="reg-email">Email *</label><input name="email" id="reg-email" type="email" required className="auth-field-input" autoComplete="email" /></div>
              <div className="auth-grid-2 mt-2"><PasswordField id="register-password" name="password" label="Mật khẩu *" autoComplete="new-password" onChange={(event) => setPassword(event.target.value)} /><div><PasswordField id="register-confirm-password" name="confirmPassword" label="Xác nhận *" autoComplete="new-password" /><p className="text-[9px] font-bold mt-1 text-gray-500">Tối thiểu 6 ký tự{password.length >= 6 ? ' ✓' : ''}</p></div></div>
              <label className="flex items-start gap-2 mt-2"><input type="checkbox" required defaultChecked className="w-3.5 h-3.5 mt-0.5 accent-[#e45f7a]" /><span className="text-[11px] text-[#6F686B]">Tôi đồng ý với Điều khoản và Chính sách bảo mật SkinID.</span></label>
              <button disabled={busy} type="submit" className="auth-cta-btn mt-2.5">{busy ? 'Đang xử lý…' : 'Tạo tài khoản & Bắt đầu'}</button>
            </form>
            <div className="auth-divider mt-2"><span>hoặc</span></div><button type="button" disabled={busy} onClick={submitGoogle} className="auth-google-btn auth-google-btn--compact group">{googleIcon}<span>Đăng ký nhanh bằng Google</span></button>
            <div className="md:hidden text-center mt-3 pt-2 border-t border-rose-100"><span className="text-xs text-[#6F686B]">Đã có tài khoản? </span><button type="button" onClick={() => { setMode('login'); setMessage(''); }} className="text-xs font-bold text-[#e45f7a]">Đăng nhập ngay</button></div>
          </div>
        </section>

        <aside className="auth-overlay-panel" aria-hidden="true"><video className="auth-overlay-panel__video" autoPlay muted loop playsInline preload="metadata"><source src="/videos/auth_video.mp4" type="video/mp4" /></video><div className="auth-overlay-panel__gradient" /><div className="auth-overlay-content auth-overlay-content--login"><h2 className="auth-overlay__headline-clean">Trọn hành trình làn da cùng SkinID.</h2><div className="auth-overlay__cta-clean"><p className="text-xs text-white/90 mb-2.5">Chưa có tài khoản?</p><button type="button" className="auth-ghost-btn" onClick={() => { setMode('register'); setMessage(''); }}>Tạo tài khoản ngay →</button></div></div><div className="auth-overlay-content auth-overlay-content--register"><h2 className="auth-overlay__headline-clean">Chào mừng bạn trở lại với SkinID.</h2><div className="auth-overlay__cta-clean"><p className="text-xs text-white/90 mb-2.5">Đã có tài khoản?</p><button type="button" className="auth-ghost-btn" onClick={() => { setMode('login'); setMessage(''); }}>← Đăng nhập ngay</button></div></div></aside>
      </div>
    </div>
  );
}

function HistoryDialog() {
  const { history, clearHistory } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  useBodyScrollLock(isOpen, 'history');
  useEffect(() => {
    const open = () => setIsOpen(true);
    const close = () => setIsOpen(false);
    document.addEventListener('skinid:history-dialog-open', open);
    document.addEventListener('skinid:history-dialog-close', close);
    return () => { document.removeEventListener('skinid:history-dialog-open', open); document.removeEventListener('skinid:history-dialog-close', close); };
  }, []);
  if (!isOpen) return null;
  const close = () => document.dispatchEvent(new CustomEvent('skinid:history-dialog-close'));
  return (
    <div className="fixed inset-0 z-[999] bg-black/60 backdrop-blur-sm flex items-center justify-center p-4" role="dialog" aria-modal="true" aria-labelledby="history-heading" onMouseDown={(event) => event.target === event.currentTarget && close()}>
      <div className="bg-white rounded-3xl max-w-2xl w-full p-6 sm:p-8 shadow-2xl relative border border-gray-100 max-h-[85vh] flex flex-col">
        <button type="button" onClick={close} className="absolute top-5 right-5 text-gray-400 p-2" aria-label="Đóng">×</button>
        <div className="mb-6 pb-4 border-b"><h3 id="history-heading" className="text-lg font-black text-brand-dark">Lịch sử phân tích da cá nhân</h3><p className="text-xs text-gray-500">Theo dõi tiến trình làn da qua từng lần quét</p></div>
        <div className="overflow-y-auto space-y-3 pr-1 flex-grow">
          {!history.length && <div className="text-center py-12 text-gray-400"><p className="font-bold text-sm text-gray-600">Chưa có lịch sử soi da nào</p><p className="text-xs mt-1">Hãy thực hiện soi da để lưu báo cáo đầu tiên.</p></div>}
          {!!history.length && <button type="button" onClick={clearHistory} className="block ml-auto text-xs font-bold text-rose-600 underline">Xóa toàn bộ dữ liệu</button>}
          {history.map((item, index) => <article key={item.id || index} className="bg-white border rounded-2xl p-4"><div className="flex justify-between mb-2"><strong className="text-xs">Lần #{history.length - index}</strong><span className="text-xs text-gray-500">{item.dateFormatted}</span></div><div className="grid grid-cols-3 gap-2 text-xs"><span>Điểm: <b>{Number(item.healthScore)}</b></span><span>{item.skinType}</span><span>{Number(item.skinAge)} tuổi</span></div></article>)}
        </div>
      </div>
    </div>
  );
}

export default function AuthDialogs() {
  return <><AuthDialog /><HistoryDialog /></>;
}
