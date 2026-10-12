import { useId, useMemo, useState } from 'react';
import {
  assignAdminByEmail,
  deleteAdminOrder,
  deleteAdminProduct,
  deleteUserAccount,
  resyncAdminOrderToS3,
  saveAdminProduct,
  saveAdminUser,
  syncAllPendingOrdersToS3,
  updateAdminOrder,
  updateUserRole,
  useAdmin
} from '../features/admin/index.js';
import usePageMetadata from '../hooks/usePageMetadata.js';

const money = (value) => new Intl.NumberFormat('vi-VN', {
  style: 'currency', currency: 'VND', maximumFractionDigits: 0
}).format(Number(value) || 0);

const emptyProduct = {
  id: '', name: '', brand: '', price: '', originalPrice: '', volume: '',
  stepType: 'cleanser', line: '', image: '', uses: ''
};

const ORDER_STATUSES = [
  { value: 'pending', label: 'Chờ xử lý', color: 'bg-amber-50 text-amber-800 border-amber-200' },
  { value: 'confirmed', label: 'Đã xác nhận', color: 'bg-blue-50 text-blue-800 border-blue-200' },
  { value: 'shipping', label: 'Đang giao hàng', color: 'bg-indigo-50 text-indigo-800 border-indigo-200' },
  { value: 'completed', label: 'Hoàn thành', color: 'bg-emerald-50 text-emerald-800 border-emerald-200' },
  { value: 'cancelled', label: 'Đã hủy', color: 'bg-rose-50 text-rose-800 border-rose-200' }
];

const ROLE_DEFINITIONS = {
  super_admin: { label: 'Super Admin', badge: 'bg-amber-100 text-amber-900 border-amber-300 font-bold', icon: '👑' },
  admin: { label: 'Quản lý Vận hành', badge: 'bg-indigo-100 text-indigo-900 border-indigo-300 font-semibold', icon: '🛡️' },
  staff: { label: 'Nhân viên CSKH', badge: 'bg-emerald-100 text-emerald-900 border-emerald-300 font-semibold', icon: '🎧' },
  customer: { label: 'Khách hàng', badge: 'bg-slate-100 text-slate-700 border-slate-200 font-medium', icon: '👤' }
};

// Modal Chỉnh sửa Dữ liệu (Sản phẩm & Khách hàng)
function EditorModal({ editor, onClose, onSaved }) {
  const [form, setForm] = useState(emptyProduct);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const titleId = useId();

  useState(() => {
    if (!editor) return;
    setError('');
    setForm(editor.kind === 'product' ? { ...emptyProduct, ...editor.item } : {
      name: editor.item.name || '', phone: editor.item.phone || '', address: editor.item.address || ''
    });
  });

  if (!editor) return null;
  const update = (field) => (event) => setForm((curr) => ({ ...curr, [field]: event.target.value }));

  const submit = async (event) => {
    event.preventDefault();
    setBusy(true);
    setError('');
    try {
      if (editor.kind === 'product') await saveAdminProduct(editor.item.id, form);
      else await saveAdminUser(editor.item.id, form);
      await onSaved('Đã cập nhật dữ liệu thành công.');
      onClose();
    } catch (err) {
      setError(err.message || 'Không thể lưu dữ liệu.');
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm p-4 flex items-center justify-center overflow-y-auto" role="dialog" aria-modal="true" aria-labelledby={titleId}>
      <form onSubmit={submit} className="w-full max-w-2xl bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden my-8 animate-in fade-in zoom-in-95 duration-200">
        <div className="px-6 py-5 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
          <div>
            <span className="text-[10px] font-extrabold uppercase tracking-widest text-brand-primary">SkinID Data Studio</span>
            <h2 id={titleId} className="text-lg font-bold text-slate-900">
              {editor.item.id ? 'Chỉnh sửa' : 'Thêm mới'} {editor.kind === 'product' ? 'Sản phẩm' : 'Khách hàng'}
            </h2>
          </div>
          <button type="button" onClick={onClose} disabled={busy} className="w-8 h-8 rounded-full flex items-center justify-center text-slate-400 hover:text-slate-700 hover:bg-slate-200 transition-colors" aria-label="Đóng">✕</button>
        </div>

        <div className="p-6 space-y-4 max-h-[75vh] overflow-y-auto">
          {error && <div className="p-3 bg-rose-50 border border-rose-200 text-rose-700 text-xs rounded-xl font-medium">{error}</div>}

          {editor.kind === 'user' ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <label className="block text-xs font-semibold text-slate-700">Email (Cố định)
                <input value={editor.item.email || ''} type="email" disabled className="mt-1 w-full px-3 py-2 bg-slate-100 border border-slate-200 rounded-xl text-slate-500 text-sm cursor-not-allowed" />
              </label>
              <label className="block text-xs font-semibold text-slate-700">Họ và tên
                <input value={form.name} onChange={update('name')} className="mt-1 w-full px-3 py-2 bg-white border border-slate-300 rounded-xl text-slate-800 text-sm focus:ring-2 focus:ring-brand-primary/20 focus:border-brand-primary outline-none transition" />
              </label>
              <label className="block text-xs font-semibold text-slate-700">Số điện thoại
                <input value={form.phone} onChange={update('phone')} type="tel" className="mt-1 w-full px-3 py-2 bg-white border border-slate-300 rounded-xl text-slate-800 text-sm focus:ring-2 focus:ring-brand-primary/20 focus:border-brand-primary outline-none transition" />
              </label>
              <label className="block text-xs font-semibold text-slate-700 sm:col-span-2">Địa chỉ giao hàng
                <textarea value={form.address} onChange={update('address')} rows="3" className="mt-1 w-full px-3 py-2 bg-white border border-slate-300 rounded-xl text-slate-800 text-sm focus:ring-2 focus:ring-brand-primary/20 focus:border-brand-primary outline-none transition" />
              </label>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <label className="block text-xs font-semibold text-slate-700">Mã sản phẩm (ID)
                <input value={form.id} onChange={update('id')} disabled={Boolean(editor.item.id)} required className={`mt-1 w-full px-3 py-2 border rounded-xl text-sm outline-none transition ${editor.item.id ? 'bg-slate-100 text-slate-500 border-slate-200 cursor-not-allowed' : 'bg-white border-slate-300 focus:ring-2 focus:ring-brand-primary/20 focus:border-brand-primary'}`} />
              </label>
              <label className="block text-xs font-semibold text-slate-700">Tên thương hiệu
                <input value={form.brand} onChange={update('brand')} required className="mt-1 w-full px-3 py-2 bg-white border border-slate-300 rounded-xl text-slate-800 text-sm focus:ring-2 focus:ring-brand-primary/20 focus:border-brand-primary outline-none transition" />
              </label>
              <label className="block text-xs font-semibold text-slate-700 sm:col-span-2">Tên sản phẩm
                <input value={form.name} onChange={update('name')} required className="mt-1 w-full px-3 py-2 bg-white border border-slate-300 rounded-xl text-slate-800 text-sm focus:ring-2 focus:ring-brand-primary/20 focus:border-brand-primary outline-none transition" />
              </label>
              <label className="block text-xs font-semibold text-slate-700">Giá bán (VND)
                <input value={form.price} onChange={update('price')} type="number" min="0" required className="mt-1 w-full px-3 py-2 bg-white border border-slate-300 rounded-xl text-slate-800 text-sm focus:ring-2 focus:ring-brand-primary/20 focus:border-brand-primary outline-none transition font-bold text-rose-600" />
              </label>
              <label className="block text-xs font-semibold text-slate-700">Giá gốc niêm yết (VND)
                <input value={form.originalPrice} onChange={update('originalPrice')} type="number" min="0" className="mt-1 w-full px-3 py-2 bg-white border border-slate-300 rounded-xl text-slate-800 text-sm focus:ring-2 focus:ring-brand-primary/20 focus:border-brand-primary outline-none transition" />
              </label>
              <label className="block text-xs font-semibold text-slate-700">Dung tích / Quy cách
                <input value={form.volume} onChange={update('volume')} placeholder="VD: 50ml, 200ml" className="mt-1 w-full px-3 py-2 bg-white border border-slate-300 rounded-xl text-slate-800 text-sm focus:ring-2 focus:ring-brand-primary/20 focus:border-brand-primary outline-none transition" />
              </label>
              <label className="block text-xs font-semibold text-slate-700">Danh mục sản phẩm
                <select value={form.stepType} onChange={update('stepType')} className="mt-1 w-full px-3 py-2 bg-white border border-slate-300 rounded-xl text-slate-800 text-sm focus:ring-2 focus:ring-brand-primary/20 focus:border-brand-primary outline-none transition">
                  <option value="cleanser">Làm sạch (Cleanser)</option>
                  <option value="toner">Cân bằng (Toner)</option>
                  <option value="treatment">Đặc trị (Serum / Treatment)</option>
                  <option value="moisturizer">Dưỡng ẩm (Moisturizer)</option>
                  <option value="sunscreen">Chống nắng (Sunscreen)</option>
                  <option value="special">Cơ thể & Nước hoa (Body / Perfume)</option>
                </select>
              </label>
              <label className="block text-xs font-semibold text-slate-700 sm:col-span-2">Đường dẫn hình ảnh
                <input value={form.image} onChange={update('image')} placeholder="/images/products/..." className="mt-1 w-full px-3 py-2 bg-white border border-slate-300 rounded-xl text-slate-800 text-sm focus:ring-2 focus:ring-brand-primary/20 focus:border-brand-primary outline-none transition" />
              </label>
              <label className="block text-xs font-semibold text-slate-700 sm:col-span-2">Công dụng & Mô tả ngắn
                <textarea value={form.uses} onChange={update('uses')} rows="3" className="mt-1 w-full px-3 py-2 bg-white border border-slate-300 rounded-xl text-slate-800 text-sm focus:ring-2 focus:ring-brand-primary/20 focus:border-brand-primary outline-none transition" />
              </label>
            </div>
          )}
        </div>

        <div className="px-6 py-4 bg-slate-50 border-t border-slate-100 flex justify-end gap-3">
          <button type="button" onClick={onClose} disabled={busy} className="px-4 py-2 border border-slate-300 hover:bg-slate-100 text-slate-700 rounded-xl text-xs font-semibold transition">Hủy</button>
          <button type="submit" disabled={busy} className="px-5 py-2 bg-brand-primary hover:bg-brand-primary/90 text-white rounded-xl text-xs font-bold transition shadow-sm flex items-center gap-2">
            {busy && <span className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>}
            {busy ? 'Đang lưu…' : 'Lưu dữ liệu'}
          </button>
        </div>
      </form>
    </div>
  );
}

// Modal Thêm Quản trị viên / Nhân sự mới (Phân quyền RBAC)
function AddMemberModal({ isOpen, onClose, onCreated }) {
  const [email, setEmail] = useState('');
  const [role, setRole] = useState('staff');
  const [name, setName] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setBusy(true);
    setError('');
    try {
      await assignAdminByEmail(email, role, name);
      await onCreated(`Đã cấp quyền ${ROLE_DEFINITIONS[role].label} cho email ${email}.`);
      onClose();
    } catch (err) {
      setError(err.message || 'Không thể cấp quyền cho email này.');
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm p-4 flex items-center justify-center overflow-y-auto" role="dialog" aria-modal="true">
      <form onSubmit={handleSubmit} className="w-full max-w-md bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        <div className="px-6 py-5 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
          <div>
            <span className="text-[10px] font-extrabold uppercase tracking-widest text-brand-primary">Team Management</span>
            <h2 className="text-lg font-bold text-slate-900">Thêm Thành viên Quản trị</h2>
          </div>
          <button type="button" onClick={onClose} disabled={busy} className="w-8 h-8 rounded-full flex items-center justify-center text-slate-400 hover:text-slate-700 hover:bg-slate-200 transition-colors">✕</button>
        </div>

        <div className="p-6 space-y-4">
          {error && <div className="p-3 bg-rose-50 border border-rose-200 text-rose-700 text-xs rounded-xl font-medium">{error}</div>}
          <label className="block text-xs font-semibold text-slate-700">Địa chỉ Email nhân sự
            <input value={email} onChange={(e) => setEmail(e.target.value)} type="email" placeholder="nhanvien@skinid.vn" required className="mt-1 w-full px-3 py-2 bg-white border border-slate-300 rounded-xl text-slate-800 text-sm focus:ring-2 focus:ring-brand-primary/20 focus:border-brand-primary outline-none transition" />
          </label>
          <label className="block text-xs font-semibold text-slate-700">Họ và tên (Tùy chọn)
            <input value={name} onChange={(e) => setName(e.target.value)} placeholder="Nguyễn Văn A" className="mt-1 w-full px-3 py-2 bg-white border border-slate-300 rounded-xl text-slate-800 text-sm focus:ring-2 focus:ring-brand-primary/20 focus:border-brand-primary outline-none transition" />
          </label>
          <label className="block text-xs font-semibold text-slate-700">Vai trò & Quyền hạn
            <select value={role} onChange={(e) => setRole(e.target.value)} className="mt-1 w-full px-3 py-2 bg-white border border-slate-300 rounded-xl text-slate-800 text-sm focus:ring-2 focus:ring-brand-primary/20 focus:border-brand-primary outline-none transition font-medium">
              <option value="admin">🛡️ Quản lý Vận hành (Admin) — Xử lý đơn, sync S3, sửa sản phẩm</option>
              <option value="staff">🎧 Nhân viên CSKH (Staff) — Xem đơn chốt sale, xem soi da</option>
              <option value="super_admin">👑 Super Admin (Đồng sở hữu) — Toàn quyền tối cao</option>
            </select>
          </label>
          <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl text-[11px] text-amber-900 leading-relaxed">
            💡 Sau khi cấp quyền, nhân sự này chỉ cần mở <strong>skinid.vn</strong> đăng nhập bằng đúng Email trên là tự động được cấp quyền tương ứng.
          </div>
        </div>

        <div className="px-6 py-4 bg-slate-50 border-t border-slate-100 flex justify-end gap-3">
          <button type="button" onClick={onClose} disabled={busy} className="px-4 py-2 border border-slate-300 hover:bg-slate-100 text-slate-700 rounded-xl text-xs font-semibold transition">Hủy</button>
          <button type="submit" disabled={busy} className="px-5 py-2 bg-brand-primary hover:bg-brand-primary/90 text-white rounded-xl text-xs font-bold transition shadow-sm flex items-center gap-2">
            {busy && <span className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>}
            {busy ? 'Đang cấp quyền…' : 'Cấp quyền ngay'}
          </button>
        </div>
      </form>
    </div>
  );
}

// Bảng Điều Khiển Quản Trị Cấp Cao (Executive Dashboard)
export default function AdminPage() {
  usePageMetadata({ title: 'Quản trị thương mại điện tử | SkinID.vn', description: 'Bảng điều khiển quản trị SkinID.' });

  const {
    user, role, isSuperAdmin, isAdmin, isStaff, authLoading,
    users, orders, products, loading, error, refresh
  } = useAdmin();

  const [activeTab, setActiveTab] = useState('orders'); // 'orders' | 'members' | 'products' | 'system'
  const [editor, setEditor] = useState(null);
  const [isMemberModalOpen, setIsMemberModalOpen] = useState(false);
  const [flash, setFlash] = useState('');
  const [actionError, setActionError] = useState('');
  const [isBatchSyncing, setIsBatchSyncing] = useState(false);

  // Bộ lọc
  const [orderSearch, setOrderSearch] = useState('');
  const [orderStatusFilter, setOrderStatusFilter] = useState('all');
  const [userSearch, setUserSearch] = useState('');
  const [productSearch, setProductSearch] = useState('');

  const finish = async (message) => {
    await refresh();
    setFlash(message);
    setActionError('');
  };

  const run = async (action, message) => {
    setFlash('');
    setActionError('');
    try {
      await action();
      await finish(message);
    } catch (err) {
      setActionError(err.message || 'Thao tác thất bại.');
    }
  };

  const remove = (label, action, message) => {
    if (globalThis.confirm(`Bạn có chắc muốn xóa ${label}? Thao tác này không thể hoàn tác.`)) {
      run(action, message);
    }
  };

  // Tính toán chỉ số KPI
  const kpi = useMemo(() => {
    const validOrders = orders.filter((o) => o.status !== 'cancelled');
    const totalRevenue = validOrders.reduce((sum, o) => sum + (Number(o.total) || 0), 0);
    const paidRevenue = orders.filter((o) => o.paymentStatus === 'paid').reduce((sum, o) => sum + (Number(o.total) || 0), 0);
    const s3Synced = orders.filter((o) => o.s3SyncStatus === 'synced').length;
    const s3Pending = orders.length - s3Synced;
    const teamCount = users.filter((u) => ['super_admin', 'admin', 'staff'].includes(u.role) || u.email?.toLowerCase() === 'danh.huynh@fieldman.vn').length;
    return { totalRevenue, paidRevenue, s3Synced, s3Pending, teamCount };
  }, [orders, users]);

  // Lọc Đơn hàng
  const filteredOrders = useMemo(() => {
    return orders.filter((order) => {
      const matchSearch = !orderSearch.trim() || [
        order.id,
        order.customer?.name,
        order.customer?.phone,
        order.s3OrderId
      ].some((val) => String(val || '').toLowerCase().includes(orderSearch.trim().toLowerCase()));

      let matchStatus = true;
      if (orderStatusFilter === 'pending') matchStatus = order.status === 'pending';
      else if (orderStatusFilter === 'confirmed') matchStatus = order.status === 'confirmed';
      else if (orderStatusFilter === 'shipping') matchStatus = order.status === 'shipping';
      else if (orderStatusFilter === 'completed') matchStatus = order.status === 'completed';
      else if (orderStatusFilter === 'cancelled') matchStatus = order.status === 'cancelled';
      else if (orderStatusFilter === 'unpaid') matchStatus = order.paymentStatus === 'unpaid' || !order.paymentStatus;
      else if (orderStatusFilter === 'paid') matchStatus = order.paymentStatus === 'paid';
      else if (orderStatusFilter === 's3_pending') matchStatus = order.s3SyncStatus !== 'synced';
      else if (orderStatusFilter === 's3_synced') matchStatus = order.s3SyncStatus === 'synced';

      return matchSearch && matchStatus;
    });
  }, [orders, orderSearch, orderStatusFilter]);

  // Phân loại Thành viên Đội ngũ vs Khách hàng
  const { teamMembers, customersList } = useMemo(() => {
    const team = [];
    const customers = [];
    users.forEach((u) => {
      const isRoot = u.email?.toLowerCase() === 'danh.huynh@fieldman.vn';
      const isTeam = isRoot || ['super_admin', 'admin', 'staff'].includes(u.role);
      if (isTeam) team.push({ ...u, role: isRoot ? 'super_admin' : (u.role || 'admin') });
      else customers.push(u);
    });
    return { teamMembers: team, customersList: customers };
  }, [users]);

  // Lọc Khách hàng
  const filteredCustomers = useMemo(() => {
    if (!userSearch.trim()) return customersList;
    const q = userSearch.toLowerCase();
    return customersList.filter((u) => (u.name || '').toLowerCase().includes(q) || (u.email || '').toLowerCase().includes(q) || (u.phone || '').includes(q));
  }, [customersList, userSearch]);

  // Lọc Sản phẩm
  const filteredProducts = useMemo(() => {
    if (!productSearch.trim()) return products;
    const q = productSearch.toLowerCase();
    return products.filter((p) => (p.name || '').toLowerCase().includes(q) || (p.brand || '').toLowerCase().includes(q) || (p.id || '').toLowerCase().includes(q));
  }, [products, productSearch]);

  // Xử lý Batch Sync S3
  const handleBatchSyncS3 = async () => {
    setIsBatchSyncing(true);
    setFlash('');
    setActionError('');
    try {
      const res = await syncAllPendingOrdersToS3(orders);
      await finish(`Đã quét đồng bộ S3 POS: ${res.successCount} đơn thành công, ${res.failCount} đơn lỗi/chờ.`);
    } catch (err) {
      setActionError(`Lỗi đồng bộ S3: ${err.message}`);
    } finally {
      setIsBatchSyncing(false);
    }
  };

  // Màn hình Loading
  if (authLoading || loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6">
        <div className="bg-white p-8 rounded-3xl shadow-xl border border-slate-200/80 flex flex-col items-center gap-4 max-w-sm w-full text-center">
          <div className="w-12 h-12 border-4 border-brand-primary/20 border-t-brand-primary rounded-full animate-spin"></div>
          <div>
            <h3 className="font-bold text-slate-800 text-base">Đang tải dữ liệu Quản trị</h3>
            <p className="text-xs text-slate-400 mt-1">Đang xác thực hạ tầng và kết nối CSDL Firestore…</p>
          </div>
        </div>
      </div>
    );
  }

  // Màn hình Chưa đăng nhập
  if (!user) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6">
        <div className="bg-white p-8 rounded-3xl shadow-xl border border-slate-200/80 max-w-md w-full text-center space-y-4">
          <div className="w-14 h-14 bg-rose-50 text-brand-primary rounded-2xl flex items-center justify-center mx-auto text-2xl font-black">🔒</div>
          <h2 className="text-xl font-bold text-slate-900">Yêu cầu Đăng nhập</h2>
          <p className="text-xs text-slate-500 leading-relaxed">Bạn cần đăng nhập bằng tài khoản quản trị để truy cập vào hệ thống SkinID Admin.</p>
          <a href="/?auth=1" className="block w-full py-3 bg-brand-primary text-white rounded-xl font-bold text-xs shadow-md hover:bg-brand-primary/90 transition">Đăng nhập tài khoản</a>
        </div>
      </div>
    );
  }

  // Màn hình Không có quyền Quản trị
  if (!isAdmin && !isStaff) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6">
        <div className="bg-white p-8 rounded-3xl shadow-xl border border-slate-200/80 max-w-lg w-full space-y-5">
          <div className="flex items-center gap-3">
            <span className="w-12 h-12 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center font-bold text-2xl border border-amber-200">⚠️</span>
            <div>
              <h2 className="font-bold text-base text-slate-900">Tài khoản chưa có quyền quản trị</h2>
              <p className="text-xs text-slate-500">Đang đăng nhập bằng: <span className="font-semibold text-slate-800">{user.email || user.uid}</span></p>
            </div>
          </div>
          <p className="text-xs text-slate-600 leading-relaxed bg-slate-50 p-4 rounded-xl border border-slate-100">
            Hệ thống Firebase Security Rules yêu cầu vai trò <code>Super Admin</code>, <code>Admin</code> hoặc <code>Staff</code> để truy cập bảng điều khiển nội bộ.
          </p>
          <div className="flex gap-3 pt-2">
            <a href="/" className="flex-1 py-2.5 text-center bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-semibold text-xs transition">Về trang chủ</a>
            <a href="/profile?tab=orders" className="flex-1 py-2.5 text-center bg-brand-primary text-white rounded-xl font-bold text-xs transition shadow-sm">Xem đơn của tôi</a>
          </div>
        </div>
      </div>
    );
  }

  const roleMeta = ROLE_DEFINITIONS[role] || ROLE_DEFINITIONS.admin;

  return (
    <div className="min-h-screen bg-[#f8fafc] text-slate-800 font-sans antialiased pb-16">
      {/* 1. TOPBAR & EXECUTIVE HEADER */}
      <header className="sticky top-0 z-30 bg-white/90 backdrop-blur-md border-b border-slate-200/80 shadow-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3.5 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3.5">
            <a href="/" className="flex items-center gap-2 group">
              <span className="w-9 h-9 rounded-xl bg-brand-primary text-white flex items-center justify-center font-black text-sm shadow-sm group-hover:scale-105 transition">S</span>
              <div>
                <span className="font-black text-base tracking-tight text-slate-900 flex items-center gap-1.5">
                  SkinID <span className="text-[10px] font-extrabold uppercase px-1.5 py-0.5 rounded bg-slate-900 text-white">Admin Suite</span>
                </span>
                <span className="text-[10px] font-semibold text-slate-400 block -mt-0.5">Hạ tầng chính thức: skinid-official</span>
              </div>
            </a>
          </div>

          <div className="flex items-center gap-3">
            {/* Live Indicator */}
            <div className="hidden md:flex items-center gap-2 px-3 py-1.5 rounded-full bg-slate-100 border border-slate-200/60 text-[11px] text-slate-600 font-medium">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
              <span>S3 POS & Firestore Connected</span>
            </div>

            {/* Profile Pill */}
            <div className="flex items-center gap-2.5 pl-3 border-l border-slate-200">
              <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-brand-primary to-rose-400 text-white font-bold text-xs flex items-center justify-center shadow-xs">
                {(user.email || 'A')[0].toUpperCase()}
              </div>
              <div className="hidden sm:block text-left">
                <span className="text-xs font-bold text-slate-800 block leading-tight">{user.name || user.email?.split('@')[0]}</span>
                <span className={`inline-block text-[10px] px-1.5 py-0.2 rounded border ${roleMeta.badge}`}>
                  {roleMeta.icon} {roleMeta.label}
                </span>
              </div>
            </div>

            {/* Buttons */}
            <button type="button" onClick={() => run(refresh, 'Đã cập nhật dữ liệu mới nhất.')} className="p-2 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-xl transition" title="Làm mới dữ liệu">
              ↻
            </button>
            <a href="/" className="px-3 py-1.5 text-xs font-bold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-xl transition flex items-center gap-1">
              <span>Cửa hàng</span> ↗
            </a>
          </div>
        </div>
      </header>

      {/* 2. MAIN CONTAINER */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 space-y-6">
        {/* Flash Notifications */}
        {flash && (
          <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold flex items-center justify-between shadow-xs animate-in fade-in">
            <span>✅ {flash}</span>
            <button type="button" onClick={() => setFlash('')} className="text-emerald-600 hover:text-emerald-900">✕</button>
          </div>
        )}
        {(error || actionError) && (
          <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-800 text-xs font-semibold flex items-center justify-between shadow-xs animate-in fade-in">
            <span>⚠️ {error || actionError}</span>
            <button type="button" onClick={() => setActionError('')} className="text-rose-600 hover:text-rose-900">✕</button>
          </div>
        )}

        {/* 3. EXECUTIVE KPI METRICS CARDS */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Card 1: Doanh thu */}
          <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs flex flex-col justify-between">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Doanh thu tạm tính</span>
              <span className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center text-sm">💵</span>
            </div>
            <div className="mt-3">
              <span className="text-2xl font-black text-slate-900 tracking-tight block">
                {isStaff && !isAdmin ? '••••••••' : money(kpi.totalRevenue)}
              </span>
              <span className="text-[11px] text-slate-400 mt-1 block">
                Đã thanh toán: <strong className="text-emerald-600 font-bold">{isStaff && !isAdmin ? '••••' : money(kpi.paidRevenue)}</strong>
              </span>
            </div>
          </div>

          {/* Card 2: Đơn hàng */}
          <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs flex flex-col justify-between">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Tổng Đơn Hàng</span>
              <span className="w-8 h-8 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center text-sm">📦</span>
            </div>
            <div className="mt-3">
              <span className="text-2xl font-black text-slate-900 tracking-tight block">{orders.length} đơn</span>
              <span className="text-[11px] text-slate-400 mt-1 block">
                Chờ xử lý: <strong className="text-amber-600 font-bold">{orders.filter((o) => o.status === 'pending').length}</strong> · Đang giao: <strong className="text-blue-600 font-bold">{orders.filter((o) => o.status === 'shipping').length}</strong>
              </span>
            </div>
          </div>

          {/* Card 3: Đồng bộ S3 POS */}
          <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs flex flex-col justify-between">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">S3 POS Sync</span>
              <span className="w-8 h-8 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center text-sm">⚡</span>
            </div>
            <div className="mt-3">
              <div className="flex items-baseline gap-2">
                <span className="text-2xl font-black text-emerald-600 tracking-tight">{kpi.s3Synced}</span>
                <span className="text-xs text-slate-400 font-semibold">/ {orders.length} đã sync</span>
              </div>
              <span className="text-[11px] text-slate-400 mt-1 block">
                {kpi.s3Pending > 0 ? (
                  <span className="text-amber-600 font-bold">⚠️ Có {kpi.s3Pending} đơn chưa đẩy sang S3</span>
                ) : (
                  <span className="text-emerald-600 font-bold">✓ 100% đơn đã vào phần mềm S3</span>
                )}
              </span>
            </div>
          </div>

          {/* Card 4: Thành viên & Đội ngũ */}
          <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs flex flex-col justify-between">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Đội ngũ & Khách</span>
              <span className="w-8 h-8 rounded-xl bg-rose-50 text-brand-primary flex items-center justify-center text-sm">👥</span>
            </div>
            <div className="mt-3">
              <span className="text-2xl font-black text-slate-900 tracking-tight block">{users.length} người</span>
              <span className="text-[11px] text-slate-400 mt-1 block">
                Quản trị & CSKH: <strong className="text-brand-primary font-bold">{kpi.teamCount}</strong> · Khách hàng: <strong className="font-semibold text-slate-700">{customersList.length}</strong>
              </span>
            </div>
          </div>
        </div>

        {/* 4. TAB NAVIGATION BAR */}
        <div className="flex items-center gap-2 border-b border-slate-200 overflow-x-auto pb-px">
          {[
            { id: 'orders', label: 'Đơn hàng & S3 POS', icon: '📦', count: orders.length },
            { id: 'members', label: 'Đội ngũ & Khách hàng', icon: '👥', count: users.length },
            { id: 'products', label: 'Sản phẩm Firestore', icon: '💄', count: products.length },
            { id: 'system', label: 'Trạng thái Hạ tầng', icon: '🛡️' }
          ].map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveTab(tab.id)}
              className={`px-4 py-3 font-bold text-xs rounded-t-xl transition flex items-center gap-2 whitespace-nowrap border-b-2 ${
                activeTab === tab.id
                  ? 'border-brand-primary text-brand-primary bg-white shadow-xs'
                  : 'border-transparent text-slate-500 hover:text-slate-800 hover:bg-slate-100/60'
              }`}
            >
              <span>{tab.icon}</span>
              <span>{tab.label}</span>
              {typeof tab.count === 'number' && (
                <span className={`px-1.5 py-0.5 rounded-full text-[10px] ${activeTab === tab.id ? 'bg-brand-primary/10 text-brand-primary' : 'bg-slate-200/70 text-slate-600'}`}>
                  {tab.count}
                </span>
              )}
            </button>
          ))}
        </div>

        {/* 5. TAB 1: ĐƠN HÀNG & S3 POS */}
        {activeTab === 'orders' && (
          <div className="space-y-4">
            {/* Toolbar */}
            <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
              <div className="flex flex-1 items-center gap-3">
                <div className="relative flex-1 max-w-md">
                  <input
                    value={orderSearch}
                    onChange={(e) => setOrderSearch(e.target.value)}
                    placeholder="Tìm theo mã đơn, tên khách, số điện thoại…"
                    className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs outline-none focus:bg-white focus:ring-2 focus:ring-brand-primary/20 focus:border-brand-primary transition"
                  />
                  <span className="absolute left-3 top-2.5 text-slate-400 text-xs">🔍</span>
                </div>

                <select
                  value={orderStatusFilter}
                  onChange={(e) => setOrderStatusFilter(e.target.value)}
                  className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-700 outline-none focus:bg-white focus:ring-2 focus:ring-brand-primary/20 focus:border-brand-primary transition"
                >
                  <option value="all">Tất cả đơn ({orders.length})</option>
                  <option value="pending">Chờ xử lý</option>
                  <option value="confirmed">Đã xác nhận</option>
                  <option value="shipping">Đang giao</option>
                  <option value="completed">Hoàn thành</option>
                  <option value="cancelled">Đã hủy</option>
                  <option value="unpaid">Chưa thanh toán</option>
                  <option value="paid">Đã thanh toán</option>
                  <option value="s3_pending">Chưa đồng bộ S3 POS</option>
                  <option value="s3_synced">Đã đồng bộ S3 POS</option>
                </select>
              </div>

              {isAdmin && (
                <button
                  type="button"
                  disabled={isBatchSyncing}
                  onClick={handleBatchSyncS3}
                  className="px-4 py-2 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white rounded-xl text-xs font-bold shadow-xs transition flex items-center justify-center gap-2"
                >
                  {isBatchSyncing ? (
                    <span className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
                  ) : (
                    <span>⚡</span>
                  )}
                  <span>Đồng bộ tất cả sang S3 POS</span>
                </button>
              )}
            </div>

            {/* Table */}
            <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr className="bg-slate-50/75 border-b border-slate-200 text-slate-500 font-bold uppercase text-[10px] tracking-wider">
                      <th className="py-3 px-4">Mã đơn</th>
                      <th className="py-3 px-4">Khách hàng</th>
                      <th className="py-3 px-4">Sản phẩm</th>
                      <th className="py-3 px-4">Tổng tiền</th>
                      <th className="py-3 px-4">Thanh toán</th>
                      <th className="py-3 px-4">Trạng thái</th>
                      <th className="py-3 px-4">Đồng bộ S3 POS</th>
                      {isSuperAdmin && <th className="py-3 px-4 text-right">Thao tác</th>}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {filteredOrders.length === 0 ? (
                      <tr>
                        <td colSpan={8} className="py-12 text-center text-slate-400">
                          Không tìm thấy đơn hàng nào phù hợp với bộ lọc.
                        </td>
                      </tr>
                    ) : (
                      filteredOrders.map((order) => (
                        <tr key={order.id} className="hover:bg-slate-50/60 transition-colors">
                          <td className="py-3.5 px-4 font-mono font-bold text-slate-900">
                            #{order.id.slice(0, 8).toUpperCase()}
                            <span className="block font-sans text-[10px] text-slate-400 font-normal">
                              {order.createdAt ? new Date(order.createdAt?.seconds ? order.createdAt.seconds * 1000 : order.createdAt).toLocaleDateString('vi-VN') : ''}
                            </span>
                          </td>
                          <td className="py-3.5 px-4 max-w-[200px]">
                            <strong className="text-slate-900 block font-semibold">{order.customer?.name || 'Khách vãng lai'}</strong>
                            <a href={`tel:${order.customer?.phone}`} className="text-brand-primary text-[11px] hover:underline block font-mono">{order.customer?.phone}</a>
                            <span className="text-[11px] text-slate-400 truncate block mt-0.5" title={order.customer?.address}>{order.customer?.address}</span>
                          </td>
                          <td className="py-3.5 px-4 max-w-[220px]">
                            <div className="space-y-1">
                              {(order.items || []).map((item, idx) => (
                                <div key={idx} className="text-[11px] text-slate-700 flex items-center justify-between gap-2">
                                  <span className="truncate" title={item.name}>{item.quantity}× {item.name}</span>
                                </div>
                              ))}
                            </div>
                          </td>
                          <td className="py-3.5 px-4 font-bold text-slate-900 whitespace-nowrap">
                            {money(order.total)}
                          </td>
                          <td className="py-3.5 px-4">
                            <select
                              value={order.paymentStatus || 'unpaid'}
                              disabled={!isAdmin}
                              onChange={(e) => run(() => updateAdminOrder(order.id, { paymentStatus: e.target.value }), 'Đã cập nhật trạng thái thanh toán.')}
                              className={`px-2 py-1 rounded-lg text-[11px] font-bold border outline-none cursor-pointer ${
                                order.paymentStatus === 'paid'
                                  ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                                  : order.paymentStatus === 'refunded'
                                  ? 'bg-purple-50 text-purple-800 border-purple-200'
                                  : 'bg-amber-50 text-amber-800 border-amber-200'
                              }`}
                            >
                              <option value="unpaid">Chưa thanh toán</option>
                              <option value="paid">Đã thanh toán</option>
                              <option value="refunded">Đã hoàn tiền</option>
                            </select>
                          </td>
                          <td className="py-3.5 px-4">
                            <select
                              value={order.status || 'pending'}
                              disabled={!isAdmin && !isStaff}
                              onChange={(e) => run(() => updateAdminOrder(order.id, { status: e.target.value }), 'Đã cập nhật trạng thái đơn hàng.')}
                              className={`px-2.5 py-1 rounded-lg text-[11px] font-bold border outline-none cursor-pointer ${
                                (ORDER_STATUSES.find((s) => s.value === order.status) || ORDER_STATUSES[0]).color
                              }`}
                            >
                              {ORDER_STATUSES.map((st) => (
                                <option key={st.value} value={st.value}>{st.label}</option>
                              ))}
                            </select>
                          </td>
                          <td className="py-3.5 px-4">
                            <div className="flex flex-col gap-1 items-start">
                              {order.s3SyncStatus === 'synced' ? (
                                <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 font-bold text-[10px]">
                                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                                  S3: #{String(order.s3OrderId || 'OK').slice(-8)}
                                </span>
                              ) : order.s3SyncStatus === 'failed' ? (
                                <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-rose-50 text-rose-700 border border-rose-200 font-bold text-[10px]" title={order.s3SyncError}>
                                  <span className="w-1.5 h-1.5 rounded-full bg-rose-500"></span>
                                  Lỗi S3
                                </span>
                              ) : (
                                <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-amber-50 text-amber-700 border border-amber-200 font-bold text-[10px]">
                                  <span className="w-1.5 h-1.5 rounded-full bg-amber-500"></span>
                                  Chờ đồng bộ
                                </span>
                              )}
                              {isAdmin && (
                                <button
                                  type="button"
                                  onClick={() => run(() => resyncAdminOrderToS3(order), `Đã đồng bộ đơn #${order.id.slice(0, 8)} sang S3 POS.`)}
                                  className="text-[10px] text-slate-500 hover:text-brand-primary underline transition"
                                >
                                  ↻ Đồng bộ lại
                                </button>
                              )}
                            </div>
                          </td>
                          {isSuperAdmin && (
                            <td className="py-3.5 px-4 text-right">
                              <button
                                type="button"
                                onClick={() => remove(`đơn hàng #${order.id.slice(0, 8)}`, () => deleteAdminOrder(order.id), 'Đã xóa đơn hàng.')}
                                className="px-2.5 py-1 text-rose-600 hover:bg-rose-50 rounded-lg font-bold text-[11px] transition"
                              >
                                Xóa
                              </button>
                            </td>
                          )}
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* 6. TAB 2: ĐỘI NGŨ & KHÁCH HÀNG (RBAC MANAGEMENT) */}
        {activeTab === 'members' && (
          <div className="space-y-6">
            {/* 6.1. ĐỘI NGŨ NỘI BỘ (TEAM) */}
            <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
              <div className="p-5 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
                <div>
                  <h3 className="font-bold text-sm text-slate-900 flex items-center gap-2">
                    <span>👑</span> Đội ngũ Quản trị & Nhân sự Nội bộ ({teamMembers.length})
                  </h3>
                  <p className="text-xs text-slate-500 mt-0.5">Danh sách các tài khoản có quyền truy cập trang quản trị SkinID Admin.</p>
                </div>
                {isSuperAdmin && (
                  <button
                    type="button"
                    onClick={() => setIsMemberModalOpen(true)}
                    className="px-4 py-2 bg-brand-primary hover:bg-brand-primary/90 text-white rounded-xl text-xs font-bold transition shadow-xs flex items-center gap-1.5"
                  >
                    <span>+</span> Thêm Quản trị viên mới
                  </button>
                )}
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr className="bg-slate-50/75 border-b border-slate-200 text-slate-500 font-bold uppercase text-[10px] tracking-wider">
                      <th className="py-3 px-4">Thành viên</th>
                      <th className="py-3 px-4">Email</th>
                      <th className="py-3 px-4">Vai trò (Role)</th>
                      <th className="py-3 px-4">Đăng nhập qua</th>
                      {isSuperAdmin && <th className="py-3 px-4 text-right">Quyền hạn</th>}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {teamMembers.map((member) => {
                      const isRoot = member.email?.toLowerCase() === 'danh.huynh@fieldman.vn';
                      const mRole = isRoot ? 'super_admin' : (member.role || 'admin');
                      const rMeta = ROLE_DEFINITIONS[mRole] || ROLE_DEFINITIONS.admin;

                      return (
                        <tr key={member.id} className="hover:bg-slate-50/60 transition-colors">
                          <td className="py-3.5 px-4">
                            <div className="flex items-center gap-2.5">
                              <span className="w-8 h-8 rounded-full bg-slate-100 border border-slate-200 flex items-center justify-center font-bold text-slate-700 text-xs">
                                {(member.name || member.email || 'U')[0].toUpperCase()}
                              </span>
                              <div>
                                <strong className="text-slate-900 block font-semibold">{member.name || 'Thành viên'}</strong>
                                {isRoot && <span className="text-[10px] text-amber-600 font-extrabold uppercase">Root Owner</span>}
                              </div>
                            </div>
                          </td>
                          <td className="py-3.5 px-4 font-mono font-medium text-slate-700">{member.email}</td>
                          <td className="py-3.5 px-4">
                            {isRoot || !isSuperAdmin ? (
                              <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-lg border text-[11px] ${rMeta.badge}`}>
                                <span>{rMeta.icon}</span> {rMeta.label}
                              </span>
                            ) : (
                              <select
                                value={mRole}
                                onChange={(e) => run(() => updateUserRole(member.id, e.target.value), `Đã cập nhật quyền của ${member.email} thành ${ROLE_DEFINITIONS[e.target.value].label}.`)}
                                className={`px-2 py-1 rounded-lg text-[11px] font-bold border outline-none cursor-pointer ${rMeta.badge}`}
                              >
                                <option value="super_admin">👑 Super Admin</option>
                                <option value="admin">🛡️ Quản lý Vận hành</option>
                                <option value="staff">🎧 Nhân viên CSKH</option>
                                <option value="customer">👤 Hạ xuống Khách hàng</option>
                              </select>
                            )}
                          </td>
                          <td className="py-3.5 px-4 capitalize text-slate-500 font-medium">{member.provider || 'Google'}</td>
                          {isSuperAdmin && (
                            <td className="py-3.5 px-4 text-right">
                              {!isRoot && (
                                <button
                                  type="button"
                                  onClick={() => remove(`tài khoản ${member.email}`, () => deleteUserAccount(member.id), 'Đã xóa tài khoản.')}
                                  className="px-2.5 py-1 text-rose-600 hover:bg-rose-50 rounded-lg font-bold text-[11px] transition"
                                >
                                  Xóa
                                </button>
                              )}
                            </td>
                          )}
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>

            {/* 6.2. KHÁCH HÀNG THÀNH VIÊN */}
            <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
              <div className="p-5 border-b border-slate-100 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-slate-50/50">
                <div>
                  <h3 className="font-bold text-sm text-slate-900 flex items-center gap-2">
                    <span>👤</span> Danh sách Khách hàng ({customersList.length})
                  </h3>
                  <p className="text-xs text-slate-500 mt-0.5">Khách hàng đã đăng ký tài khoản trên hệ thống SkinID.</p>
                </div>
                <div className="relative max-w-xs">
                  <input
                    value={userSearch}
                    onChange={(e) => setUserSearch(e.target.value)}
                    placeholder="Tìm theo tên, email, SĐT…"
                    className="w-full pl-8 pr-3 py-1.5 bg-white border border-slate-200 rounded-xl text-xs outline-none focus:ring-2 focus:ring-brand-primary/20 focus:border-brand-primary transition"
                  />
                  <span className="absolute left-2.5 top-2 text-slate-400 text-xs">🔍</span>
                </div>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr className="bg-slate-50/75 border-b border-slate-200 text-slate-500 font-bold uppercase text-[10px] tracking-wider">
                      <th className="py-3 px-4">Họ và tên</th>
                      <th className="py-3 px-4">Email</th>
                      <th className="py-3 px-4">Số điện thoại</th>
                      <th className="py-3 px-4">Địa chỉ giao hàng</th>
                      {isSuperAdmin && <th className="py-3 px-4 text-right">Phân quyền</th>}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {filteredCustomers.length === 0 ? (
                      <tr>
                        <td colSpan={5} className="py-8 text-center text-slate-400">Không có khách hàng nào phù hợp.</td>
                      </tr>
                    ) : (
                      filteredCustomers.map((c) => (
                        <tr key={c.id} className="hover:bg-slate-50/60 transition-colors">
                          <td className="py-3 px-4 font-semibold text-slate-900">{c.name || 'Khách hàng'}</td>
                          <td className="py-3 px-4 font-mono text-slate-600">{c.email}</td>
                          <td className="py-3 px-4 text-slate-700">{c.phone || '—'}</td>
                          <td className="py-3 px-4 text-slate-500 max-w-[200px] truncate" title={c.address}>{c.address || '—'}</td>
                          {isSuperAdmin && (
                            <td className="py-3 px-4 text-right">
                              <button
                                type="button"
                                onClick={() => run(() => updateUserRole(c.id, 'staff'), `Đã thăng cấp ${c.name || c.email} thành Nhân viên CSKH.`)}
                                className="px-2.5 py-1 text-emerald-700 hover:bg-emerald-50 rounded-lg font-bold text-[11px] transition mr-2"
                              >
                                + Thăng quyền CSKH
                              </button>
                              <button
                                type="button"
                                onClick={() => setEditor({ kind: 'user', item: c })}
                                className="px-2 py-1 text-slate-600 hover:bg-slate-100 rounded-lg font-semibold text-[11px] transition"
                              >
                                Sửa
                              </button>
                            </td>
                          )}
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* 7. TAB 3: SẢN PHẨM FIRESTORE */}
        {activeTab === 'products' && (
          <div className="space-y-4">
            <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
              <div className="relative flex-1 max-w-md">
                <input
                  value={productSearch}
                  onChange={(e) => setProductSearch(e.target.value)}
                  placeholder="Tìm sản phẩm theo tên, thương hiệu, ID…"
                  className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs outline-none focus:bg-white focus:ring-2 focus:ring-brand-primary/20 focus:border-brand-primary transition"
                />
                <span className="absolute left-3 top-2.5 text-slate-400 text-xs">🔍</span>
              </div>

              {isAdmin && (
                <button
                  type="button"
                  onClick={() => setEditor({ kind: 'product', item: {} })}
                  className="px-4 py-2 bg-brand-primary hover:bg-brand-primary/90 text-white rounded-xl text-xs font-bold shadow-xs transition flex items-center justify-center gap-1.5"
                >
                  <span>+</span> Thêm sản phẩm mới
                </button>
              )}
            </div>

            <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr className="bg-slate-50/75 border-b border-slate-200 text-slate-500 font-bold uppercase text-[10px] tracking-wider">
                      <th className="py-3 px-4">Sản phẩm</th>
                      <th className="py-3 px-4">Thương hiệu</th>
                      <th className="py-3 px-4">Giá bán</th>
                      <th className="py-3 px-4">Danh mục</th>
                      {isAdmin && <th className="py-3 px-4 text-right">Thao tác</th>}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {filteredProducts.length === 0 ? (
                      <tr>
                        <td colSpan={5} className="py-12 text-center text-slate-400">
                          {products.length === 0 ? 'Chưa có sản phẩm nào trong Firestore collection products.' : 'Không tìm thấy sản phẩm phù hợp.'}
                        </td>
                      </tr>
                    ) : (
                      filteredProducts.map((item) => (
                        <tr key={item.id} className="hover:bg-slate-50/60 transition-colors">
                          <td className="py-3.5 px-4 max-w-[280px]">
                            <strong className="text-slate-900 block font-semibold">{item.name || item.id}</strong>
                            <span className="text-[10px] font-mono text-slate-400 block mt-0.5">{item.id}</span>
                          </td>
                          <td className="py-3.5 px-4 font-bold text-slate-700">{item.brand}</td>
                          <td className="py-3.5 px-4 font-bold text-rose-600">{money(item.price)}</td>
                          <td className="py-3.5 px-4 capitalize text-slate-500">{item.stepType || item.category || 'special'}</td>
                          {isAdmin && (
                            <td className="py-3.5 px-4 text-right whitespace-nowrap">
                              <button
                                type="button"
                                onClick={() => setEditor({ kind: 'product', item })}
                                className="px-2.5 py-1 text-slate-700 hover:bg-slate-100 rounded-lg font-semibold text-[11px] transition mr-2"
                              >
                                Sửa
                              </button>
                              <button
                                type="button"
                                onClick={() => remove(`sản phẩm ${item.name || item.id}`, () => deleteAdminProduct(item.id), 'Đã xóa sản phẩm.')}
                                className="px-2.5 py-1 text-rose-600 hover:bg-rose-50 rounded-lg font-bold text-[11px] transition"
                              >
                                Xóa
                              </button>
                            </td>
                          )}
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* 8. TAB 4: TRẠNG THÁI HẠ TẦNG */}
        {activeTab === 'system' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs space-y-4">
              <div className="flex items-center gap-3">
                <span className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center font-bold text-lg">🔥</span>
                <div>
                  <h3 className="font-bold text-sm text-slate-900">Firebase Cloud Infrastructure</h3>
                  <p className="text-xs text-slate-500">Cơ sở dữ liệu NoSQL & Xác thực bảo mật</p>
                </div>
              </div>
              <div className="space-y-2 text-xs divide-y divide-slate-100">
                <div className="flex justify-between py-2"><span className="text-slate-500">Project ID</span><strong className="font-mono text-slate-800">skinid-official</strong></div>
                <div className="flex justify-between py-2"><span className="text-slate-500">Khu vực (Region)</span><strong className="font-mono text-slate-800">asia-southeast1 (Singapore)</strong></div>
                <div className="flex justify-between py-2"><span className="text-slate-500">Security Rules</span><strong className="text-emerald-600 font-bold">Production Active (RBAC)</strong></div>
                <div className="flex justify-between py-2"><span className="text-slate-500">Tên miền cấp phép</span><strong className="font-mono text-slate-800">skinid.vn, localhost</strong></div>
              </div>
            </div>

            <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs space-y-4">
              <div className="flex items-center gap-3">
                <span className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center font-bold text-lg">🏪</span>
                <div>
                  <h3 className="font-bold text-sm text-slate-900">Phần mềm Bán lẻ S3 POS</h3>
                  <p className="text-xs text-slate-500">Hệ thống kho vận và xuất hóa đơn POS</p>
                </div>
              </div>
              <div className="space-y-2 text-xs divide-y divide-slate-100">
                <div className="flex justify-between py-2"><span className="text-slate-500">Cổng API POS</span><strong className="font-mono text-slate-800">https://m.present.es3.vn</strong></div>
                <div className="flex justify-between py-2"><span className="text-slate-500">Tài khoản POS</span><strong className="font-mono text-slate-800">fieldman@sb.es3.vn</strong></div>
                <div className="flex justify-between py-2"><span className="text-slate-500">Chi nhánh / Thu ngân</span><strong className="font-mono text-slate-800">Branch: 9147 | Cashier: 16668</strong></div>
                <div className="flex justify-between py-2"><span className="text-slate-500">Cơ chế đồng bộ</span><strong className="text-emerald-600 font-bold">Tự động tức thì + Fail-Safe</strong></div>
              </div>
            </div>

            <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs space-y-4">
              <div className="flex items-center gap-3">
                <span className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold text-lg">💳</span>
                <div>
                  <h3 className="font-bold text-sm text-slate-900">Cổng Thanh toán Vietcombank QR</h3>
                  <p className="text-xs text-slate-500">Thanh toán 1 chạm VietQR Deep Link</p>
                </div>
              </div>
              <div className="space-y-2 text-xs divide-y divide-slate-100">
                <div className="flex justify-between py-2"><span className="text-slate-500">Ngân hàng</span><strong className="font-mono text-slate-800">Vietcombank (VCB - 970436)</strong></div>
                <div className="flex justify-between py-2"><span className="text-slate-500">Số tài khoản</span><strong className="font-mono text-slate-800">1063583549</strong></div>
                <div className="flex justify-between py-2"><span className="text-slate-500">Chủ tài khoản</span><strong className="font-mono text-slate-800">DANG DUC MANH</strong></div>
                <div className="flex justify-between py-2"><span className="text-slate-500">Cú pháp chuyển khoản</span><strong className="font-mono text-slate-800">SKINID [Mã đơn]</strong></div>
              </div>
            </div>

            <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs space-y-4">
              <div className="flex items-center gap-3">
                <span className="w-10 h-10 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center font-bold text-lg">🔒</span>
                <div>
                  <h3 className="font-bold text-sm text-slate-900">Chính sách Phân quyền & Bảo mật</h3>
                  <p className="text-xs text-slate-500">Khóa bảo vệ chống giả mạo quyền hạn</p>
                </div>
              </div>
              <p className="text-xs text-slate-600 leading-relaxed">
                Tài khoản <strong>danh.huynh@fieldman.vn</strong> được gán quyền <strong>Root Super Admin</strong> bất biến. Các quyền hạn Admin và Staff được phân tách rõ ràng để ngăn chặn việc nhân viên vô tình xóa đơn hàng hoặc thay đổi cấu hình doanh nghiệp.
              </p>
            </div>
          </div>
        )}
      </main>

      {/* 9. MODALS */}
      <EditorModal editor={editor} onClose={() => setEditor(null)} onSaved={finish} />
      <AddMemberModal isOpen={isMemberModalOpen} onClose={() => setIsMemberModalOpen(false)} onCreated={finish} />
    </div>
  );
}
