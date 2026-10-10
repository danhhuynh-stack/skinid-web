import { useEffect, useMemo, useState } from 'react';
import {
  createShippingAddress,
  fetchVietnamWards,
  vietnamProvinces
} from '../../../shared/services/vietnamAddressService.js';

function formFromUser(user) {
  const shipping = user?.shippingAddress || {};
  return {
    name: user?.name || '',
    email: user?.email || '',
    phone: user?.phone || '',
    birthday: user?.birthday || '',
    gender: user?.gender || 'Nữ',
    provinceCode: String(shipping.provinceCode || ''),
    wardCode: String(shipping.wardCode || ''),
    line1: shipping.line1 || (!user?.shippingAddress ? user?.address || '' : ''),
    skinTypeBaseline: user?.skinTypeBaseline || 'Chưa xác định',
    mainConcern: user?.mainConcern || 'Lỗ chân lông to & Sợi bã nhờn'
  };
}

export default function ProfileIdentityForm({ user, isSaving, onSave, onDirtyChange }) {
  const [form, setForm] = useState(() => formFromUser(user));
  const [baseline, setBaseline] = useState(() => JSON.stringify(formFromUser(user)));
  const [wards, setWards] = useState([]);
  const [isLoadingWards, setIsLoadingWards] = useState(false);
  const [message, setMessage] = useState(null);

  useEffect(() => {
    const next = formFromUser(user);
    setForm(next);
    setBaseline(JSON.stringify(next));
  }, [user]);

  useEffect(() => {
    let active = true;
    if (!form.provinceCode) {
      setWards([]);
      return undefined;
    }
    setIsLoadingWards(true);
    fetchVietnamWards(form.provinceCode)
      .then((items) => { if (active) setWards(items); })
      .catch(() => {
        if (!active) return;
        const saved = user?.shippingAddress;
        setWards(saved?.wardCode ? [{ code: saved.wardCode, name: saved.wardName || 'Phường/xã đã lưu' }] : []);
      })
      .finally(() => { if (active) setIsLoadingWards(false); });
    return () => { active = false; };
  }, [form.provinceCode, user?.shippingAddress]);

  const isDirty = useMemo(() => JSON.stringify(form) !== baseline, [form, baseline]);
  useEffect(() => { onDirtyChange?.(isDirty); }, [isDirty, onDirtyChange]);
  const update = (field) => (event) => {
    setMessage(null);
    setForm((current) => ({ ...current, [field]: event.target.value }));
  };

  const submit = async (event) => {
    event.preventDefault();
    setMessage(null);
    try {
      const shippingAddress = createShippingAddress({
        line1: form.line1,
        provinceCode: form.provinceCode,
        wardCode: form.wardCode,
        wards
      });
      await onSave({
        name: form.name.trim(),
        phone: form.phone.trim(),
        birthday: form.birthday,
        gender: form.gender,
        address: shippingAddress.fullAddress,
        shippingAddress,
        skinTypeBaseline: form.skinTypeBaseline,
        mainConcern: form.mainConcern
      });
      setBaseline(JSON.stringify(form));
      setMessage({ type: 'success', text: 'Hồ sơ cá nhân đã được lưu thành công.' });
    } catch (error) {
      setMessage({ type: 'error', text: error.message || 'Không thể lưu hồ sơ.' });
    }
  };

  return (
    <div className="profile-surface profile-identity-surface p-6 sm:p-8">
      <div className="pb-5 mb-8 border-b border-[#F0ECEE]">
        <h2 className="text-xl font-extrabold text-[#282326] tracking-tight">Thông Tin Định Danh</h2>
        <p className="text-xs text-[#797074] mt-1">Cập nhật thông tin để SkinID cá nhân hóa gợi ý chu trình chăm sóc da khoa học</p>
      </div>

      <form id="form-edit-profile" onSubmit={submit} className="space-y-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-5">
          <div>
            <label htmlFor="prof-name">Họ và tên *</label>
            <input
              type="text"
              id="prof-name"
              required
              value={form.name}
              onChange={update('name')}
              placeholder="Nguyễn Văn A"
            />
          </div>

          <div>
            <label htmlFor="prof-email">Địa chỉ Email</label>
            <div className="profile-readonly-field">
              <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect>
                <path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
              </svg>
              <input
                type="email"
                id="prof-email"
                value={form.email}
                readOnly
                aria-readonly="true"
                title="Email đăng nhập không thể thay đổi tại đây"
              />
            </div>
            <p className="profile-field-note">Đã xác thực qua tài khoản · Không thể chỉnh sửa tại trang hồ sơ</p>
          </div>

          <div>
            <label htmlFor="prof-phone">Số điện thoại liên hệ</label>
            <input
              type="tel"
              id="prof-phone"
              value={form.phone}
              onChange={update('phone')}
              placeholder="0901234567"
            />
          </div>

          <div>
            <label htmlFor="prof-birthday">Ngày sinh</label>
            <input
              type="date"
              id="prof-birthday"
              value={form.birthday}
              onChange={update('birthday')}
            />
          </div>

          <div>
            <label htmlFor="prof-gender">Giới tính</label>
            <select
              id="prof-gender"
              value={form.gender}
              onChange={update('gender')}
            >
              <option value="Nữ">Nữ</option>
              <option value="Nam">Nam</option>
              <option value="Khác">Khác</option>
            </select>
          </div>

          <div className="sm:col-span-2">
            <label>Địa chỉ nhận hàng mặc định</label>
            <div className="profile-address-grid">
              <select
                id="prof-province"
                value={form.provinceCode}
                onChange={(event) => {
                  setMessage(null);
                  setForm((current) => ({ ...current, provinceCode: event.target.value, wardCode: '' }));
                }}
                aria-label="Tỉnh hoặc thành phố"
              >
                <option value="">Chọn tỉnh/thành</option>
                {vietnamProvinces.map((province) => (
                  <option key={province.code} value={province.code}>{province.name}</option>
                ))}
              </select>

              <select
                id="prof-ward"
                value={form.wardCode}
                onChange={update('wardCode')}
                aria-label="Phường hoặc xã"
                disabled={!form.provinceCode || isLoadingWards}
              >
                <option value="">
                  {isLoadingWards ? 'Đang tải phường/xã…' : form.provinceCode ? 'Chọn phường/xã' : 'Chọn tỉnh/thành trước'}
                </option>
                {wards.map((ward) => (
                  <option key={ward.code} value={ward.code}>{ward.name}</option>
                ))}
              </select>

              <input
                type="text"
                id="prof-address"
                value={form.line1}
                onChange={update('line1')}
                placeholder="Số nhà, tên tòa nhà, tên đường…"
                autoComplete="street-address"
              />
            </div>
            <p className="profile-field-note">Được đồng bộ hai chiều với địa chỉ tại bước thanh toán.</p>
          </div>
        </div>

        <div className="pt-8 mt-4 border-t border-[#F0ECEE]">
          <h3 className="text-base font-extrabold text-[#282326] tracking-tight mb-1">Hồ Sơ Thể Trạng Làn Da</h3>
          <p className="text-xs text-[#797074] mb-5">Giúp AI đối chiếu giữa kết quả soi da và cảm nhận thực tế của bạn</p>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-5">
            <div>
              <label htmlFor="prof-skintype">Loại da bạn tự nhận định:</label>
              <select
                id="prof-skintype"
                value={form.skinTypeBaseline}
                onChange={update('skinTypeBaseline')}
              >
                <option value="Chưa xác định">Chưa xác định (Chờ AI phân tích)</option>
                <option value="Da dầu">Da dầu</option>
                <option value="Da hỗn hợp thiên dầu">Da hỗn hợp thiên dầu</option>
                <option value="Da khô">Da khô / Thiếu ẩm</option>
                <option value="Da nhạy cảm">Da nhạy cảm</option>
                <option value="Da thường">Da thường</option>
              </select>
            </div>

            <div>
              <label htmlFor="prof-main-concern">Vấn đề da cần ưu tiên:</label>
              <select
                id="prof-main-concern"
                value={form.mainConcern}
                onChange={update('mainConcern')}
              >
                <option value="Mụn bọc & Mụn viêm">Mụn bọc & Mụn viêm</option>
                <option value="Thâm mụn & Sắc tố không đều">Thâm mụn & Sắc tố không đều</option>
                <option value="Lỗ chân lông to & Sợi bã nhờn">Lỗ chân lông to & Sợi bã nhờn</option>
                <option value="Lão hóa & Nếp nhăn">Lão hóa & Nếp nhăn</option>
                <option value="Khô ráp & Bong tróc">Khô ráp & Bong tróc</option>
                <option value="Mẩn đỏ & Giãn mao mạch">Mẩn đỏ & Giãn mao mạch</option>
              </select>
            </div>
          </div>
        </div>

        {message && (
          <div
            role={message.type === 'error' ? 'alert' : 'status'}
            className={`rounded-2xl px-5 py-3.5 text-xs font-semibold ${
              message.type === 'error' ? 'bg-rose-50 text-rose-700 border border-rose-100' : 'bg-emerald-50 text-emerald-700 border border-emerald-100'
            }`}
          >
            {message.text}
          </div>
        )}

        <div
          id="profile-save-bar"
          className={`profile-save-bar ${isDirty ? '' : 'hidden'}`}
          aria-live="polite"
        >
          <p>
            <strong>Bạn có thay đổi chưa lưu</strong>
            <span>Kiểm tra lại thông tin trước khi cập nhật.</span>
          </p>
          <button
            id="profile-save-button"
            type="submit"
            disabled={isSaving}
            className="profile-btn profile-btn--primary disabled:opacity-50"
          >
            {isSaving ? 'Đang lưu…' : 'Lưu thay đổi'}
          </button>
        </div>
      </form>
    </div>
  );
}
