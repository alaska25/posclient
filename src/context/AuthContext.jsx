import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
import { Navigate, Outlet, useLocation } from 'react-router-dom';
import api from '../utils/api'; // ← use shared instance, not raw axios

export const AuthContext = createContext();

function decodeToken(token) {
  try {
    const payload = token.split('.')[1];
    return JSON.parse(atob(payload.replace(/-/g, '+').replace(/_/g, '/')));
  } catch {
    return null;
  }
}

function isTokenExpired(token) {
  if (!token) return true;
  const decoded = decodeToken(token);
  if (!decoded?.exp) return true;
  return decoded.exp * 1000 < Date.now() + 30_000;
}

export const AuthProvider = ({ children }) => {
  const [user, setUser]       = useState(null);
  const [loading, setLoading] = useState(true);
  const logoutRef             = useRef(null);

  const logout = useCallback(() => {
    localStorage.removeItem('token');
    delete api.defaults.headers.common['Authorization'];
    setUser(null);
  }, []);

  logoutRef.current = logout;

  // ── Single 401 interceptor — on the shared api instance ─────────────────
  useEffect(() => {
    const id = api.interceptors.response.use(
      res => res,
      err => {
        const url        = err.config?.url || '';
        const is401      = err.response?.status === 401;
        const isAuthRoute = url.includes('/auth/');

        // Only auto-logout on 401s from protected routes,
        // NOT from login/register/google (those return their own errors).
        if (is401 && !isAuthRoute) {
          logoutRef.current?.();
        }
        return Promise.reject(err);
      },
    );
    return () => api.interceptors.response.eject(id);
  }, []);

  const applyToken = token => {
    localStorage.setItem('token', token);
    api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
  };

  const clearToken = () => {
    localStorage.removeItem('token');
    delete api.defaults.headers.common['Authorization'];
  };

  // ── Restore session on reload ────────────────────────────────────────────
  useEffect(() => {
    const loadUser = async () => {
      const token = localStorage.getItem('token');
      if (isTokenExpired(token)) {
        clearToken();
        setLoading(false);
        return;
      }
      try {
        api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
        const res = await api.get('/auth/me'); // ← no more hardcoded localhost
        setUser(res.data.data);
      } catch {
        clearToken();
      } finally {
        setLoading(false);
      }
    };
    loadUser();
  }, []);

  const login = async formData => {
    const res = await api.post('/auth/login', formData);
    applyToken(res.data.token);
    setUser(res.data.user);
    return res.data;
  };

  const googleLogin = async idToken => {
    if (!idToken) throw new Error('Google idToken is required');
    const res = await api.post('/auth/google', { idToken });
    applyToken(res.data.token);
    setUser(res.data.user);
    return res.data;
  };

  const register = async formData => {
    const res = await api.post('/auth/register', formData);
    applyToken(res.data.token);
    setUser(res.data.user);
    return res.data;
  };

  const isSuperAdmin = user?.role === 'superadmin';
  const isAdmin      = user?.role === 'admin' || user?.role === 'superadmin';
  const isSupervisor = user?.role === 'supervisor';
  const isCashier    = user?.role === 'cashier';

  return (
    <AuthContext.Provider value={{
      user, loading, login, googleLogin, register, logout,
      isSuperAdmin, isAdmin, isSupervisor, isCashier,
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);

export function ProtectedRoute({ children }) {
  const { user, loading } = useAuth();
  const location = useLocation();
  if (loading) return <AuthLoadingScreen />;
  if (!user)   return <Navigate to="/login" state={{ from: location }} replace />;
  return children ?? <Outlet />;
}

export function SuperAdminRoute({ children }) {
  const { user, loading, isSuperAdmin } = useAuth();
  const location = useLocation();
  if (loading)       return <AuthLoadingScreen />;
  if (!user)         return <Navigate to="/login" state={{ from: location }} replace />;
  if (!isSuperAdmin) return <Navigate to="/unauthorized" replace />;
  return children ?? <Outlet />;
}

export function AdminRoute({ children }) {
  const { user, loading, isAdmin } = useAuth();
  const location = useLocation();
  if (loading)  return <AuthLoadingScreen />;
  if (!user)    return <Navigate to="/login" state={{ from: location }} replace />;
  if (!isAdmin) return <Navigate to="/unauthorized" replace />;
  return children ?? <Outlet />;
}

export function StaffRoute({ children }) {
  const { user, loading } = useAuth();
  const location = useLocation();
  const STAFF_ROLES = ['superadmin', 'admin', 'supervisor', 'cashier'];
  if (loading) return <AuthLoadingScreen />;
  if (!user)   return <Navigate to="/login" state={{ from: location }} replace />;
  if (!STAFF_ROLES.includes(user?.role)) return <Navigate to="/unauthorized" replace />;
  return children ?? <Outlet />;
}

function AuthLoadingScreen() {
  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#f8f9ff' }}>
      <div style={{ textAlign: 'center' }}>
        <div style={{ width: 44, height: 44, borderRadius: '50%', border: '3px solid #e8ecf8', borderTopColor: '#6366f1', animation: 'spin 0.8s linear infinite', margin: '0 auto 16px' }} />
        <p style={{ fontFamily: 'DM Sans, sans-serif', fontSize: 14, color: '#94a3b8', margin: 0 }}>Checking session…</p>
      </div>
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}