import { useEffect, useRef } from 'react';
import { useAuth } from '../auth/index.js';
import { analyzeSkin, saveSkinReport } from './services/skinAnalysisService.js';
import { sendSkinReportEmail } from './services/skinReportEmailService.js';

export default function SkinAnalysisBridge() {
  const { user, isAuthenticated, history, openAuthModal, refreshSession } = useAuth();
  const latestReportRef = useRef(null);

  useEffect(() => {
    if (isAuthenticated && typeof window !== 'undefined' && window.pendingAnalysisAfterAuth) {
      window.pendingAnalysisAfterAuth = false;
      if (typeof window.startAnalysis === 'function') {
        setTimeout(() => window.startAnalysis(), 300);
      }
    }
  }, [isAuthenticated]);

  useEffect(() => {
    const checkAuth = (event) => {
      event.detail.isAuthenticated = isAuthenticated;
      event.detail.user = user ? { name: user.name, email: user.email } : null;
      if (!isAuthenticated && event.detail.message) openAuthModal(event.detail.message);
    };
    const analyze = (event) => {
      analyzeSkin(event.detail.payload).then(event.detail.resolve, event.detail.reject);
    };
    const save = (event) => {
      saveSkinReport(event.detail.report)
        .then(async (record) => {
          latestReportRef.current = event.detail.emailReport || record;
          await refreshSession().catch(() => undefined);
          event.detail.resolve(record);
        }, event.detail.reject);
    };
    const email = async () => {
      if (!user?.email) {
        openAuthModal('Đăng nhập để gửi báo cáo về email của bạn.');
        return;
      }
      const report = latestReportRef.current || history[0] || {};
      document.dispatchEvent(new CustomEvent('skinid:scan-toast', {
        detail: { message: 'Đang gửi báo cáo đến email của bạn…', tone: 'info' }
      }));
      await sendSkinReportEmail(user.email, { ...report, userName: user.name }).then(() => {
        document.dispatchEvent(new CustomEvent('skinid:scan-toast', {
          detail: { message: 'Đã gửi báo cáo qua email.', tone: 'success' }
        }));
      }).catch((error) => {
        console.error('[SkinID Email]', error);
        document.dispatchEvent(new CustomEvent('skinid:scan-toast', {
          detail: { message: error.message, tone: 'error' }
        }));
      });
    };
    document.addEventListener('skinid:analysis-auth-check', checkAuth);
    document.addEventListener('skinid:analysis-request', analyze);
    document.addEventListener('skinid:analysis-save-report', save);
    document.addEventListener('skinid:skin-report-email-request', email);
    return () => {
      document.removeEventListener('skinid:analysis-auth-check', checkAuth);
      document.removeEventListener('skinid:analysis-request', analyze);
      document.removeEventListener('skinid:analysis-save-report', save);
      document.removeEventListener('skinid:skin-report-email-request', email);
    };
  }, [history, isAuthenticated, openAuthModal, refreshSession, user]);

  return null;
}
