import { createBrowserRouter, Navigate } from 'react-router-dom';
import AppErrorBoundary from './AppErrorBoundary.jsx';
import NotFoundRoute from '../routes/not-found/NotFoundRoute.jsx';
import PageLoader from '../shared/ui/PageLoader.jsx';

function lazyPage(importPage) {
  return async () => {
    const module = await importPage();
    return { Component: module.default };
  };
}

export const router = createBrowserRouter([
  {
    path: '/',
    ErrorBoundary: AppErrorBoundary,
    HydrateFallback: PageLoader,
    children: [
      { index: true, lazy: lazyPage(() => import('../pages/HomePage.jsx')) },
      { path: 'products', lazy: lazyPage(() => import('../pages/ProductsPage.jsx')) },
      { path: 'profile', lazy: lazyPage(() => import('../pages/ProfilePage.jsx')) },
      { path: 'skin-analysis', lazy: lazyPage(() => import('../pages/SkinAnalysisPage.jsx')) },
      { path: 'admin', lazy: lazyPage(() => import('../pages/AdminPage.jsx')) },
      { path: 'acie', lazy: lazyPage(() => import('../pages/AciePage.jsx')) },
      { path: 'tra-cuu-cong-bo', lazy: lazyPage(() => import('../pages/CompliancePage.jsx')) },
      { path: 'profile.html', element: <Navigate to="/profile" replace /> },
      { path: 'skin-analysis.html', element: <Navigate to="/skin-analysis" replace /> },
      { path: 'acie.html', element: <Navigate to="/acie" replace /> },
      { path: 'acie-vision', element: <Navigate to="/acie" replace /> },
      { path: 'compliance', element: <Navigate to="/tra-cuu-cong-bo" replace /> },
      { path: 'kiem-chung', element: <Navigate to="/tra-cuu-cong-bo" replace /> },
      { path: '*', Component: NotFoundRoute }
    ]
  }
]);
