import { isRouteErrorResponse, Link, useRouteError } from 'react-router-dom';

export default function AppErrorBoundary() {
  const error = useRouteError();
  const title = isRouteErrorResponse(error)
    ? `${error.status} ${error.statusText}`
    : 'Không thể tải trang';

  return (
    <main className="route-status" role="alert">
      <p className="route-status__eyebrow">SkinID</p>
      <h1>{title}</h1>
      <p>Đã xảy ra lỗi ngoài dự kiến. Bạn có thể quay về trang chủ và thử lại.</p>
      <Link className="route-status__action" to="/">Về trang chủ</Link>
    </main>
  );
}
