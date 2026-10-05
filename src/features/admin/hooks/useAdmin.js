import { useCallback, useEffect, useState } from 'react';
import { useAuth } from '../../auth/index.js';
import { fetchAdminDashboard } from '../services/adminService.js';

const emptyDashboard = { users: [], orders: [], products: [] };

export function useAdmin() {
  const { user, isAdmin, isLoading: authLoading } = useAuth();
  const [dashboard, setDashboard] = useState(emptyDashboard);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const refresh = useCallback(async () => {
    if (!isAdmin) return emptyDashboard;
    setLoading(true);
    setError('');
    try {
      const result = await fetchAdminDashboard();
      setDashboard(result);
      return result;
    } catch (requestError) {
      setError(requestError.message || 'Không thể tải dữ liệu quản trị.');
      throw requestError;
    } finally {
      setLoading(false);
    }
  }, [isAdmin]);

  useEffect(() => {
    if (authLoading) return;
    if (!isAdmin) {
      setLoading(false);
      setDashboard(emptyDashboard);
      return;
    }
    refresh().catch(() => undefined);
  }, [authLoading, isAdmin, refresh]);

  return { user, isAdmin, authLoading, ...dashboard, loading, error, refresh };
}
