import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
import { Navigate, Outlet, useLocation } from 'react-router-dom';
import api from '../utils/api';

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

// ── Role constants ────────────────────────────────────────────────────────────
const STAFF_ROLES    = ['superadmin', 'admin', 'supervisor', 'cashier'];
const CUSTOMER_ROLES = ['customer'];

// ── Role-based redirect helper ────────────────────────────────────────────────
export function getHomeForRole(role) {
  if (role === 'customer')    return '/app/portal/dashboard';
  if (role === 'superadmin')  return '/superadmin';
  if (role === 'admin')       return '/admin';
  return '/app/dashboard'; // supervisor, cashier
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

  // ── Single 401 interceptor ────────────────────────────────────────────────
  useEffect(() => {
    const id = api.interceptors.response.use(
      res => res,
      err => {
        const url         = err.config?.url || '';
        const is401       = err.response?.status === 401;
        const isAuthRoute = url.includes('/auth/');
        if (is401 && !isAuthRoute) logoutRef.current?.();
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

  // ── Restore session on reload ─────────────────────────────────────────────
  useEffect(() => {
    const loadUser = async () => {
      const token = localStorage.getItem('token');
      if (isTokenExpired(token)) { clearToken(); setLoading(false); return; }
      try {
        api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
        const res = await api.get('/auth/me');
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

  // ── Role helpers ──────────────────────────────────────────────────────────
  const isCustomer   = user?.role === 'customer';
  const isSuperAdmin = user?.role === 'superadmin';
  const isAdmin      = user?.role === 'admin' || user?.role === 'superadmin';
  const isSupervisor = user?.role === 'supervisor';
  const isCashier    = user?.role === 'cashier';
  const isStaff      = STAFF_ROLES.includes(user?.role);

  return (
    <AuthContext.Provider value={{
      user, loading,
      login, googleLogin, register, logout,
      isCustomer, isSuperAdmin, isAdmin, isSupervisor, isCashier, isStaff,
      getHomeForRole,
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);

// ── Route guards ──────────────────────────────────────────────────────────────

/** Any authenticated user */
export function ProtectedRoute({ children }) {
  const { user, loading } = useAuth();
  const location = useLocation();
  if (loading) return <AuthLoadingScreen />;
  if (!user)   return <Navigate to="/login" state={{ from: location }} replace />;
  return children ?? <Outlet />;
}

/** superadmin only */
export function SuperAdminRoute({ children }) {
  const { user, loading } = useAuth();
  const location = useLocation();
  if (loading)                    return <AuthLoadingScreen />;
  if (!user)                      return <Navigate to="/login" state={{ from: location }} replace />;
  if (user.role !== 'superadmin') return <Navigate to="/unauthorized" replace />;
  return children ?? <Outlet />;
}

/** admin or superadmin */
export function AdminRoute({ children }) {
  const { user, loading, isAdmin } = useAuth();
  const location = useLocation();
  if (loading)  return <AuthLoadingScreen />;
  if (!user)    return <Navigate to="/login" state={{ from: location }} replace />;
  if (!isAdmin) return <Navigate to="/unauthorized" replace />;
  return children ?? <Outlet />;
}

/** Staff roles only — blocks customers */
export function StaffRoute({ children }) {
  const { user, loading } = useAuth();
  const location = useLocation();
  if (loading) return <AuthLoadingScreen />;
  if (!user)   return <Navigate to="/login" state={{ from: location }} replace />;
  if (!STAFF_ROLES.includes(user.role)) {
    // Customer trying to hit a staff route → redirect to their portal
    if (user.role === 'customer') return <Navigate to="/app/portal/dashboard" replace />;
    return <Navigate to="/unauthorized" replace />;
  }
  return children ?? <Outlet />;
}

/** Customer role only — blocks staff */
export function CustomerRoute({ children }) {
  const { user, loading } = useAuth();
  const location = useLocation();
  if (loading) return <AuthLoadingScreen />;
  if (!user)   return <Navigate to="/login" state={{ from: location }} replace />;
  if (!CUSTOMER_ROLES.includes(user.role)) {
    // Staff trying to hit a customer route → redirect to staff dashboard
    if (STAFF_ROLES.includes(user.role)) return <Navigate to="/app/dashboard" replace />;
    return <Navigate to="/unauthorized" replace />;
  }
  return children ?? <Outlet />;
}

// ── Loading screen ────────────────────────────────────────────────────────────
function AuthLoadingScreen() {
  return (
    <div style={{ minHeight:'100vh', display:'flex', alignItems:'center', justifyContent:'center', background:'#f8f9ff' }}>
      <div style={{ textAlign:'center' }}>
        <div style={{ width:44, height:44, borderRadius:'50%', border:'3px solid #e8ecf8', borderTopColor:'#6366f1', animation:'spin 0.8s linear infinite', margin:'0 auto 16px' }}/>
        <p style={{ fontFamily:'DM Sans, sans-serif', fontSize:14, color:'#94a3b8', margin:0 }}>Checking session…</p>
      </div>
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}