import { useEffect, useState } from 'react';
import {
  deleteAdminOrder,
  deleteAdminProduct,
  deleteUserAccount,
  saveAdminProduct,
  saveAdminUser,
  updateAdminOrder,
  useAdmin
} from '../features/admin/index.js';
import usePageMetadata from '../hooks/usePageMetadata.js';

const money = (value) => new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(Number(value) || 0);
const emptyProduct = { id: '', name: '', brand: '', price: '', originalPrice: '', volume: '', stepType: 'cleanser', line: '', image: '', uses: '' };

function Editor({ editor, onClose, onSaved }) {
  const [form, setForm] = useState(emptyProduct);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!editor) return;
    setError('');
    setForm(editor.kind === 'product' ? { ...emptyProduct, ...editor.item } : {
      name: editor.item.name || '', phone: editor.item.phone || '', address: editor.item.address || ''
    });
  }, [editor]);

  if (!editor) return null;
  const update = (field) => (event) => setForm((current) => ({ ...current, [field]: event.target.value }));
  const submit = async (event) => {
    event.preventDefault();
    setBusy(true);
    setError('');
    try {
      if (editor.kind === 'product') await saveAdminProduct(editor.item.id, form);
      else await saveAdminUser(editor.item.id, form);
      await onSaved('Đã lưu dữ liệu vào Firestore.');
      onClose();
    } catch (requestError) {
      setError(requestError.message || 'Không thể lưu dữ liệu.');
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[10030] bg-gray-950/60 backdrop-blur-sm p-4 overflow-y-auto" role="dialog" aria-modal="true" aria-labelledby="admin-editor-title" onMouseDown={(event) => { if (event.target === event.currentTarget && !busy) onClose(); }}>
      <form onSubmit={submit} className="admin-dialog admin-react-editor block mx-auto my-8 bg-white">
        <div className="admin-dialog__heading"><div><span className="section-kicker">FIRESTORE</span><h2 id="admin-editor-title">{editor.item.id ? 'Chỉnh sửa' : 'Thêm'} {editor.kind === 'product' ? 'sản phẩm' : 'người dùng'}</h2></div><button type="button" className="admin-icon-button" disabled={busy} onClick={onClose} aria-label="Đóng">×</button></div>
        {editor.kind === 'user' ? (
          <div className="admin-form-grid">
            <label>Email<input value={editor.item.email || ''} type="email" disabled /></label>
            <label>Họ tên<input value={form.name} onChange={update('name')} /></label>
            <label>Số điện thoại<input value={form.phone} onChange={update('phone')} type="tel" /></label>
            <label className="admin-form-grid__wide">Địa chỉ<textarea value={form.address} onChange={update('address')} rows="3" /></label>
          </div>
        ) : (
          <div className="admin-form-grid">
            <label>Mã sản phẩm<input value={form.id} onChange={update('id')} disabled={Boolean(editor.item.id)} required /></label>
            <label>Tên sản phẩm<input value={form.name} onChange={update('name')} required /></label>
            <label>Thương hiệu<input value={form.brand} onChange={update('brand')} required /></label>
            <label>Giá bán<input value={form.price} onChange={update('price')} type="number" min="0" required /></label>
            <label>Giá gốc<input value={form.originalPrice} onChange={update('originalPrice')} type="number" min="0" /></label>
            <label>Dung tích<input value={form.volume} onChange={update('volume')} /></label>
            <label>Danh mục<select value={form.stepType} onChange={update('stepType')}><option value="cleanser">Làm sạch</option><option value="toner">Cân bằng</option><option value="treatment">Đặc trị</option><option value="moisturizer">Dưỡng ẩm</option><option value="sunscreen">Chống nắng</option><option value="special">Cơ thể & nước hoa</option></select></label>
            <label>Dòng sản phẩm<input value={form.line} onChange={update('line')} /></label>
            <label className="admin-form-grid__wide">Đường dẫn ảnh<input value={form.image} onChange={update('image')} placeholder="/images/products/..." /></label>
            <label className="admin-form-grid__wide">Công dụng<textarea value={form.uses} onChange={update('uses')} rows="3" /></label>
          </div>
        )}
        {error && <div className="admin-flash admin-flash--error" role="alert">{error}</div>}
        <div className="admin-dialog__actions"><button type="button" className="btn btn--outline" disabled={busy} onClick={onClose}>Hủy</button><button type="submit" className="btn btn--primary" disabled={busy}>{busy ? 'Đang lưu…' : 'Lưu thay đổi'}</button></div>
      </form>
    </div>
  );
}

export default function AdminPage() {
  usePageMetadata({ title: 'Quản trị thương mại điện tử | SkinID.vn', description: 'Quản lý dữ liệu SkinID.' });
  const { user, isAdmin, authLoading, users, orders, products, loading, error, refresh } = useAdmin();
  const [editor, setEditor] = useState(null);
  const [flash, setFlash] = useState('');
  const [actionError, setActionError] = useState('');

  const finish = async (message) => {
    await refresh();
    setFlash(message);
    setActionError('');
  };
  const run = async (action, message) => {
    setFlash(''); setActionError('');
    try { await action(); await finish(message); }
    catch (requestError) { setActionError(requestError.message || 'Thao tác thất bại.'); }
  };
  const remove = (label, action, message) => {
    if (globalThis.confirm(`Xóa ${label}? Thao tác này không thể hoàn tác.`)) run(action, message);
  };

  if (authLoading || loading) return <div className="admin-page min-h-screen bg-gray-50"><main className="container py-12"><div className="rounded-2xl bg-white border p-6 text-sm text-gray-500">Đang xác thực và tải dữ liệu quản trị…</div></main></div>;
  if (!user) return <div className="admin-page min-h-screen bg-gray-50"><main className="container py-12"><div className="rounded-2xl bg-white border p-6">Bạn chưa đăng nhập. <a className="text-brand-primary font-bold" href="/?auth=1">Đăng nhập tại cửa hàng</a>.</div></main></div>;
  if (!isAdmin) return <div className="admin-page min-h-screen bg-gray-50"><main className="container py-12"><div className="rounded-2xl bg-white border p-6">Tài khoản này chưa có quyền quản trị.</div></main></div>;

  const statuses = ['pending', 'confirmed', 'shipping', 'completed', 'cancelled'];
  return (
    <div className="admin-page min-h-screen bg-gray-50">
      <header className="bg-white border-b sticky top-0 z-20"><div className="container py-4 flex items-center justify-between"><div><span className="section-kicker">SKINID ADMIN</span><h1 className="text-xl font-black">Quản trị thương mại điện tử</h1></div><a href="/" className="btn btn--outline">Về cửa hàng</a></div></header>
      <main className="container py-8 space-y-7">
        {(error || actionError) && <div className="admin-flash admin-flash--error" role="alert">{error || actionError}</div>}
        {flash && <div className="admin-flash" role="status">{flash}</div>}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4"><div className="admin-kpi"><span>Người dùng</span><strong>{users.length}</strong></div><div className="admin-kpi"><span>Đơn hàng</span><strong>{orders.length}</strong></div><div className="admin-kpi"><span>Sản phẩm</span><strong>{products.length}</strong></div></div>

        <section className="admin-panel"><h2>Đơn hàng</h2><div className="admin-table-wrap"><table><thead><tr><th>Mã đơn</th><th>Khách hàng</th><th>Giao tới</th><th>Sản phẩm</th><th>Tổng tiền</th><th>Thanh toán</th><th>Trạng thái</th><th>Thao tác</th></tr></thead><tbody>{orders.map((order) => <tr key={order.id}><td>#{order.id.slice(0, 8).toUpperCase()}</td><td>{order.customer?.name}<br /><small>{order.customer?.phone}</small></td><td className="admin-cell-wrap">{order.customer?.address}</td><td className="admin-cell-wrap">{(order.items || []).map((item, index) => <span className="block" key={`${item.productId}-${index}`}>{item.quantity} × {item.name}</span>)}</td><td>{money(order.total)}</td><td><select value={order.paymentStatus || 'unpaid'} onChange={(event) => run(() => updateAdminOrder(order.id, { paymentStatus: event.target.value }), 'Đã cập nhật thanh toán.')}><option value="unpaid">Chưa thanh toán</option><option value="paid">Đã thanh toán</option><option value="refunded">Đã hoàn tiền</option></select></td><td><select value={order.status || 'pending'} onChange={(event) => run(() => updateAdminOrder(order.id, { status: event.target.value }), 'Đã cập nhật trạng thái.')}>{statuses.map((status) => <option key={status} value={status}>{status}</option>)}</select></td><td><div className="admin-actions"><button type="button" className="is-danger" onClick={() => remove(`đơn hàng #${order.id.slice(0, 8)}`, () => deleteAdminOrder(order.id), 'Đã xóa đơn hàng.')}>Xóa</button></div></td></tr>)}</tbody></table></div></section>

        <section className="admin-panel"><h2>Người dùng</h2><p className="admin-panel__hint">Chỉnh sửa hồ sơ hoặc xóa toàn bộ tài khoản và dữ liệu liên quan.</p><div className="admin-table-wrap"><table><thead><tr><th>Email</th><th>Họ tên</th><th>Số điện thoại</th><th>Nhà cung cấp</th><th>Thao tác</th></tr></thead><tbody>{users.map((item) => <tr key={item.id}><td>{item.email}</td><td>{item.name}</td><td>{item.phone}</td><td>{item.provider}</td><td><div className="admin-actions"><button type="button" onClick={() => setEditor({ kind: 'user', item })}>Sửa</button><button type="button" className="is-danger" disabled={item.id === user.uid} onClick={() => remove(`tài khoản ${item.email}`, () => deleteUserAccount(item.id), 'Đã xóa tài khoản.')}>Xóa</button></div></td></tr>)}</tbody></table></div></section>

        <section className="admin-panel"><div className="admin-panel__heading"><div><h2>Sản phẩm Firestore</h2><p className="admin-panel__hint">Thêm, sửa và xóa trực tiếp collection products.</p></div><button type="button" className="btn btn--primary" onClick={() => setEditor({ kind: 'product', item: {} })}>Thêm sản phẩm</button></div><div className="admin-table-wrap"><table><thead><tr><th>Sản phẩm</th><th>Thương hiệu</th><th>Giá</th><th>Danh mục</th><th>Thao tác</th></tr></thead><tbody>{products.map((item) => <tr key={item.id}><td>{item.name || item.id}</td><td>{item.brand}</td><td>{money(item.price)}</td><td>{item.stepType || item.category}</td><td><div className="admin-actions"><button type="button" onClick={() => setEditor({ kind: 'product', item })}>Sửa</button><button type="button" className="is-danger" onClick={() => remove(`sản phẩm ${item.name || item.id}`, () => deleteAdminProduct(item.id), 'Đã xóa sản phẩm.')}>Xóa</button></div></td></tr>)}</tbody></table></div></section>
      </main>
      <Editor editor={editor} onClose={() => setEditor(null)} onSaved={finish} />
    </div>
  );
}
