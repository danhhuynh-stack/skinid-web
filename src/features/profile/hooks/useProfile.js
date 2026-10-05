import { useState, useCallback } from 'react';
import { useAuth } from '../../auth/index.js';
import {
  cancelUserOrder,
  changeUserPassword,
  exportUserPdfReport,
  fetchUserOrders,
  fetchUserSkinReports,
  updateUserProfile,
  uploadAvatar
} from '../services/profileService.js';

/**
 * Hook to manage profile editing state and history tabs.
 */
export function useProfile() {
  const {
    user,
    history,
    orders,
    isAuthenticated,
    isLoading,
    logout,
    clearHistory,
    refreshSession
  } = useAuth();
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState(null);

  const saveProfile = useCallback(async (data) => {
    setIsSaving(true);
    setError(null);
    try {
      const result = await updateUserProfile(data);
      await refreshSession();
      return { success: true, user: result };
    } catch (err) {
      setError(err.message || 'Không thể lưu hồ sơ.');
      throw err;
    } finally {
      setIsSaving(false);
    }
  }, [refreshSession]);

  const changeAvatar = useCallback(async (file) => {
    setIsSaving(true);
    setError(null);
    try {
      const result = await uploadAvatar(file);
      await refreshSession();
      return { success: true, user: result };
    } catch (err) {
      setError(err.message || 'Không thể cập nhật ảnh.');
      throw err;
    } finally {
      setIsSaving(false);
    }
  }, [refreshSession]);

  const updatePassword = useCallback(async (currentPassword, newPassword) => {
    setIsSaving(true);
    setError(null);
    try {
      await changeUserPassword(currentPassword, newPassword);
      return { success: true };
    } catch (err) {
      setError(err.message || 'Không thể đổi mật khẩu.');
      throw err;
    } finally {
      setIsSaving(false);
    }
  }, []);

  const downloadPdf = useCallback(() => exportUserPdfReport({ user, history, orders }), [user, history, orders]);

  const cancelOrder = useCallback(async (orderId) => {
    setIsSaving(true);
    setError(null);
    try {
      await cancelUserOrder(orderId);
      await refreshSession();
      return { success: true };
    } catch (err) {
      setError(err.message || 'Không thể hủy đơn hàng.');
      throw err;
    } finally {
      setIsSaving(false);
    }
  }, [refreshSession]);

  return {
    user,
    history,
    orders,
    isAuthenticated,
    isLoading,
    isSaving,
    error,
    saveProfile,
    changeAvatar,
    updatePassword,
    downloadPdf,
    cancelOrder,
    clearHistory,
    logout,
    fetchUserOrders,
    fetchUserSkinReports
  };
}
