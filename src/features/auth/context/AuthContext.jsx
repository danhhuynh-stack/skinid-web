import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { firebaseServices } from '../../../infrastructure/firebase/index.js';
import {
  authErrorMessage,
  clearUserHistory,
  fetchHistory,
  loadAuthSession,
  loginWithEmail as loginWithEmailService,
  loginWithGoogle as loginWithGoogleService,
  logout as logoutService,
  registerWithEmail as registerWithEmailService,
  resetPassword as resetPasswordService,
  subscribeToAuthSession,
  updateUserProfile
} from '../services/authService.js';

const AuthContext = createContext(null);
const emptySession = { user: null, history: [], orders: [] };

export function AuthProvider({ children }) {
  const [session, setSession] = useState(emptySession);
  const [isLoading, setIsLoading] = useState(true);

  const applySession = useCallback((nextSession) => {
    setSession(nextSession);
    setIsLoading(false);
  }, []);

  const refreshSession = useCallback(async () => {
    const firebaseUser = firebaseServices.auth.currentUser;
    if (!firebaseUser) {
      applySession(emptySession);
      return emptySession;
    }
    const nextSession = await loadAuthSession(firebaseUser);
    applySession(nextSession);
    return nextSession;
  }, [applySession]);

  useEffect(() => {
    const unsubscribe = subscribeToAuthSession(applySession, (error) => {
      console.error('[SkinID Auth] Không thể tải phiên người dùng:', error);
      applySession(emptySession);
    });
    const refreshHistory = async () => {
      const userId = firebaseServices.auth.currentUser?.uid;
      if (!userId) return;
      const history = await fetchHistory(userId).catch(() => []);
      setSession((current) => ({ ...current, history }));
    };
    document.addEventListener('skinid:history-changed', refreshHistory);
    return () => {
      unsubscribe();
      document.removeEventListener('skinid:history-changed', refreshHistory);
    };
  }, [applySession]);

  const loginWithEmail = useCallback(async (email, password, remember = true) => {
    try {
      const user = await loginWithEmailService(email, password, remember);
      return { success: true, user };
    } catch (error) {
      return { success: false, message: authErrorMessage(error) };
    }
  }, []);

  const registerWithEmail = useCallback(async (form) => {
    try {
      const user = await registerWithEmailService(form);
      return { success: true, user };
    } catch (error) {
      return { success: false, message: authErrorMessage(error) };
    }
  }, []);

  const loginWithGoogle = useCallback(async () => {
    try {
      const user = await loginWithGoogleService();
      return { success: true, user };
    } catch (error) {
      return { success: false, message: authErrorMessage(error) };
    }
  }, []);

  const logout = useCallback(async () => {
    await logoutService();
    applySession(emptySession);
  }, [applySession]);

  const openAuthModal = useCallback((message = '') => {
    document.dispatchEvent(new CustomEvent('skinid:auth-dialog-open', { detail: { message } }));
  }, []);

  const closeAuthModal = useCallback(() => {
    document.dispatchEvent(new CustomEvent('skinid:auth-dialog-close'));
  }, []);

  const updateProfile = useCallback(async (data) => {
    if (!session.user?.uid) return { success: false, message: 'Chưa đăng nhập.' };
    try {
      const user = await updateUserProfile(session.user.uid, data);
      setSession((current) => ({ ...current, user }));
      return { success: true, user };
    } catch (error) {
      return { success: false, message: authErrorMessage(error) };
    }
  }, [session.user?.uid]);

  const resetPassword = useCallback(async (email) => {
    try {
      await resetPasswordService(email);
      return { success: true, message: 'Đã gửi email đặt lại mật khẩu.' };
    } catch (error) {
      return { success: false, message: authErrorMessage(error) };
    }
  }, []);

  const clearHistory = useCallback(async () => {
    if (!session.user?.uid) return false;
    if (!window.confirm('Bạn có chắc muốn xóa toàn bộ lịch sử soi da?')) return false;
    await clearUserHistory(session.user.uid);
    setSession((current) => ({ ...current, history: [] }));
    document.dispatchEvent(new CustomEvent('skinid:history-changed'));
    return true;
  }, [session.user?.uid]);

  const isAuthenticated = Boolean(session.user?.uid);
  const isAdmin = Boolean(session.user?.isAdmin || session.user?.customClaims?.admin);
  const value = useMemo(() => ({
    ...session,
    isAuthenticated,
    isAdmin,
    isLoading,
    loginWithEmail,
    registerWithEmail,
    loginWithGoogle,
    logout,
    openAuthModal,
    closeAuthModal,
    updateProfile,
    resetPassword,
    clearHistory,
    refreshSession
  }), [session, isAuthenticated, isAdmin, isLoading, loginWithEmail, registerWithEmail, loginWithGoogle, logout, openAuthModal, closeAuthModal, updateProfile, resetPassword, clearHistory, refreshSession]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context) return context;
  return {
    ...emptySession,
    isAuthenticated: false,
    isAdmin: false,
    isLoading: false,
    loginWithEmail: async () => ({ success: false }),
    registerWithEmail: async () => ({ success: false }),
    loginWithGoogle: async () => ({ success: false }),
    logout: async () => {},
    openAuthModal: () => {},
    closeAuthModal: () => {},
    updateProfile: async () => ({ success: false }),
    resetPassword: async () => ({ success: false }),
    clearHistory: async () => false,
    refreshSession: async () => emptySession
  };
}
