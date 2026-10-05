import { Link } from 'react-router-dom';

export default function NotFoundRoute() {
  return (
    <main className="route-status">
      <p className="route-status__eyebrow">404</p>
      <h1>Không tìm thấy trang</h1>
      <p>Đường dẫn này không tồn tại hoặc đã được thay đổi.</p>
      <Link className="route-status__action" to="/">Về trang chủ</Link>
    </main>
  );
}
