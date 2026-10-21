import { useCallback, useEffect, useRef, useState } from 'react';
import { useAuth } from '../../auth/index.js';
import { fetchAdminDashboard } from '../services/adminService.js';

const emptyDashboard = { users: [], orders: [], products: [] };

export function useAdmin() {
  const { user, role, isSuperAdmin, isAdmin, isStaff, isLoading: authLoading } = useAuth();
  const [dashboard, setDashboard] = useState(emptyDashboard);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const hasLoadedOnce = useRef(false);

  const refresh = useCallback(async () => {
    if (!isAdmin && !isStaff) return emptyDashboard;
    if (!hasLoadedOnce.current) {
      setLoading(true);
    }
    setError('');
    try {
      const result = await fetchAdminDashboard();
      setDashboard(result);
      hasLoadedOnce.current = true;
      return result;
    } catch (requestError) {
      setError(requestError.message || 'Không thể tải dữ liệu quản trị.');
      throw requestError;
    } finally {
      setLoading(false);
    }
  }, [isAdmin, isStaff]);

  useEffect(() => {
    if (authLoading) return;
    if (!isAdmin && !isStaff) {
      setLoading(false);
      setDashboard(emptyDashboard);
      return;
    }
    refresh().catch(() => undefined);
  }, [authLoading, isAdmin, isStaff, refresh]);

  return { user, role, isSuperAdmin, isAdmin, isStaff, authLoading, ...dashboard, loading, error, refresh };
}

