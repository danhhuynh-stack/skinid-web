import { createBrowserRouter, Navigate, Outlet, ScrollRestoration } from 'react-router-dom';
import AppErrorBoundary from './AppErrorBoundary.jsx';
import NotFoundRoute from '../routes/not-found/NotFoundRoute.jsx';
import PageLoader from '../shared/ui/PageLoader.jsx';

function lazyPage(importPage) {
  return async () => {
    const module = await importPage();
    return { Component: module.default };
  };
}

function RootLayout() {
  return (
    <>
      <ScrollRestoration />
      <Outlet />
    </>
  );
}

export const router = createBrowserRouter([
  {
    path: '/',
    ErrorBoundary: AppErrorBoundary,
    HydrateFallback: PageLoader,
    element: <RootLayout />,
    children: [
      { index: true, lazy: lazyPage(() => import('../pages/HomePage.jsx')) },
      { path: 'products', lazy: lazyPage(() => import('../pages/ProductsPage.jsx')) },
      { path: 'products/:productSlug', lazy: lazyPage(() => import('../pages/ProductDetailPage.jsx')) },
      { path: 'khuyen-mai', lazy: lazyPage(() => import('../pages/PromotionsPage.jsx')) },
      { path: 'blog', lazy: lazyPage(() => import('../pages/BlogPage.jsx')) },
      { path: 'blog/:postSlug', lazy: lazyPage(() => import('../pages/BlogDetailPage.jsx')) },
      { path: 'goc-cham-da', lazy: lazyPage(() => import('../pages/BlogPage.jsx')) },
      { path: 'tin-tuc', element: <Navigate to="/blog" replace /> },
      { path: 'profile', lazy: lazyPage(() => import('../pages/ProfilePage.jsx')) },
      { path: 'skin-analysis', lazy: lazyPage(() => import('../pages/SkinAnalysisPage.jsx')) },
      { path: 'admin', lazy: lazyPage(() => import('../pages/AdminPage.jsx')) },
      { path: 'acie', lazy: lazyPage(() => import('../pages/AciePage.jsx')) },
      { path: 'tra-cuu-cong-bo', lazy: lazyPage(() => import('../pages/CompliancePage.jsx')) },
      { path: 'profile.html', element: <Navigate to="/profile" replace /> },
      { path: 'skin-analysis.html', element: <Navigate to="/skin-analysis" replace /> },
      { path: 'acie.html', element: <Navigate to="/acie" replace /> },
      { path: 'acie-vision', element: <Navigate to="/acie" replace /> },
      { path: 'chinh-sach-bao-mat', lazy: lazyPage(() => import('../pages/PolicyPage.jsx')) },
      { path: 'chinh-sach-van-chuyen', lazy: lazyPage(() => import('../pages/PolicyPage.jsx')) },
      { path: 'chinh-sach-doi-tra', lazy: lazyPage(() => import('../pages/PolicyPage.jsx')) },
      { path: 'chinh-sach-thanh-toan', lazy: lazyPage(() => import('../pages/PolicyPage.jsx')) },
      { path: 'dieu-khoan-giao-dich', lazy: lazyPage(() => import('../pages/PolicyPage.jsx')) },
      { path: 'quy-trinh-khieu-nai', lazy: lazyPage(() => import('../pages/PolicyPage.jsx')) },
      { path: 'chinh-sach/:policySlug', lazy: lazyPage(() => import('../pages/PolicyPage.jsx')) },
      { path: 'privacy', element: <Navigate to="/chinh-sach-bao-mat" replace /> },
      { path: 'shipping', element: <Navigate to="/chinh-sach-van-chuyen" replace /> },
      { path: 'returns', element: <Navigate to="/chinh-sach-doi-tra" replace /> },
      { path: 'terms', element: <Navigate to="/dieu-khoan-giao-dich" replace /> },
      { path: 'compliance', element: <Navigate to="/tra-cuu-cong-bo" replace /> },
      { path: 'kiem-chung', element: <Navigate to="/tra-cuu-cong-bo" replace /> },
      { path: '*', Component: NotFoundRoute }
    ]
  }
]);
