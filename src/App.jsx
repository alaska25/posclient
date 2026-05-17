import React, { useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import Settings from './pages/Settings';

// ── Auth & route guards — ALL from AuthContext ────────────────────────────────
import {
  AuthProvider,
  ProtectedRoute,
  AdminRoute,
  SuperAdminRoute,
  StaffRoute,
  CustomerRoute,        // ✅ now lives in AuthContext, not CustomerLayout
} from './context/AuthContext';

import { ThemeProvider }    from './context/ThemeContext';
import { CurrencyProvider } from './context/CurrencyContext';
import { UserProvider }     from './UserContext';

// ── Layouts ───────────────────────────────────────────────────────────────────
import Layout         from './components/layout/Layout';
import AdminLayout    from './components/layout/AdminLayout';
import CustomerLayout from './components/layout/CustomerLayout';  // layout only

// ── Customer portal pages ─────────────────────────────────────────────────────
import PortalDashboard from './pages/portal/PortalDashboard';
import PortalJobs      from './pages/portal/PortalJobs';
import PortalInvoices  from './pages/portal/PortalInvoices';
import PortalProfile   from './pages/portal/PortalProfile';

// ── Public pages ──────────────────────────────────────────────────────────────
import LandingPage    from './pages/LandingPage';
import Login          from './pages/Login';
import Register       from './pages/Register';
import ForgotPassword from './pages/ForgotPassword';
import ResetPassword  from './pages/ResetPassword';
import Unauthorized   from './pages/Unauthorized';

// ── Staff pages ───────────────────────────────────────────────────────────────
import Dashboard      from './pages/Dashboard';
import Customers      from './pages/Customers';
import CustomerDetail from './pages/CustomerDetail';
import Services       from './pages/Services';
import Jobs           from './pages/Jobs';
import JobDetail      from './pages/JobDetail';
import NewJob         from './pages/NewJob';
import Invoices       from './pages/Invoices';
import InvoiceDetail  from './pages/InvoiceDetail';
import Reports        from './pages/Reports';
import Users          from './pages/Users';
import AiChat         from './pages/AiChat';

// ── Admin pages ───────────────────────────────────────────────────────────────
import AdminDashboard from './pages/admin/AdminDashboard';
import UserManagement from './pages/admin/UserManagement';

import './i18n';

const queryClient = new QueryClient({
  defaultOptions: { queries: { retry: 1, staleTime: 30_000 } },
});

function ScrollToTop() {
  const { pathname } = useLocation();
  useEffect(() => { window.scrollTo(0, 0); }, [pathname]);
  return null;
}

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter future={{ v7_relativeSplatPath: true, v7_startTransition: true }}>
        <AuthProvider>
          <ThemeProvider>
            <CurrencyProvider>
              <UserProvider>
                <ScrollToTop />
                <Routes>

                  {/* ── Public ─────────────────────────────────────────── */}
                  <Route path="/"                           element={<LandingPage />} />
                  <Route path="/login"                      element={<Login />} />
                  <Route path="/register"                   element={<Register />} />
                  <Route path="/forgot-password"            element={<ForgotPassword />} />
                  <Route path="/password-reset/:resetToken" element={<ResetPassword />} />
                  <Route path="/unauthorized"               element={<Unauthorized />} />

                  {/* ── Superadmin ──────────────────────────────────────── */}
                  <Route element={<SuperAdminRoute />}>
                    <Route path="/superadmin" element={<AdminLayout />}>
                      <Route index        element={<AdminDashboard />} />
                      <Route path="users" element={<UserManagement />} />
                    </Route>
                  </Route>

                  {/* ── Admin ───────────────────────────────────────────── */}
                  <Route element={<AdminRoute />}>
                    <Route path="/admin" element={<AdminLayout />}>
                      <Route index        element={<AdminDashboard />} />
                      <Route path="users" element={<UserManagement />} />
                    </Route>
                  </Route>

                  {/* ── Customer Portal ─────────────────────────────────── */}
                  <Route element={<CustomerRoute />}>
                    <Route path="/app/portal" element={<CustomerLayout />}>
                      <Route index            element={<Navigate to="/app/portal/dashboard" replace />} />
                      <Route path="dashboard" element={<PortalDashboard />} />
                      <Route path="jobs"      element={<PortalJobs />} />
                      <Route path="invoices"  element={<PortalInvoices />} />
                      <Route path="profile"   element={<PortalProfile />} />
                    </Route>
                  </Route>

                  {/* ── Staff app ───────────────────────────────────────── */}
                  <Route element={<StaffRoute />}>
                    <Route path="/app" element={<Layout />}>
                      <Route index                element={<Navigate to="/app/dashboard" replace />} />
                      <Route path="dashboard"     element={<Dashboard />} />
                      <Route path="customers"     element={<Customers />} />
                      <Route path="customers/:id" element={<CustomerDetail />} />
                      <Route path="services"      element={<Services />} />
                      <Route path="jobs"          element={<Jobs />} />
                      <Route path="jobs/new"      element={<NewJob />} />
                      <Route path="jobs/:id"      element={<JobDetail />} />
                      <Route path="invoices"      element={<Invoices />} />
                      <Route path="invoices/:id"  element={<InvoiceDetail />} />
                      <Route path="reports"       element={<Reports />} />
                      <Route path="ai"            element={<AiChat />} />
                      <Route path="users"         element={<Users />} />
                      <Route path="settings"      element={<Settings />} />

                      {/* Admin panel inside /app */}
                      <Route element={<AdminRoute />}>
                        <Route path="admin"       element={<AdminDashboard />} />
                        <Route path="admin/users" element={<UserManagement />} />
                      </Route>
                    </Route>
                  </Route>

                  {/* ── Fallback ────────────────────────────────────────── */}
                  <Route path="*" element={<Navigate to="/" replace />} />

                </Routes>
              </UserProvider>
            </CurrencyProvider>
          </ThemeProvider>
        </AuthProvider>
      </BrowserRouter>
    </QueryClientProvider>
  );
}