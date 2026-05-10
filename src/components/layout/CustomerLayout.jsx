import React, { useState } from 'react';
import { NavLink, Outlet, useNavigate, Navigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import {
  LayoutDashboard, Briefcase, FileText, UserCircle,
  LogOut, Zap, Sun, Moon, Menu, X,
} from 'lucide-react';

// ── Customer Route Guard ───────────────────────────────────────────────────
export function CustomerRoute() {
  const { user, loading } = useAuth();
  if (loading) return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#f8f9ff' }}>
      <div style={{ textAlign: 'center' }}>
        <div style={{ width: 44, height: 44, borderRadius: '50%', border: '3px solid #e8ecf8', borderTopColor: '#6366f1', animation: 'spin 0.8s linear infinite', margin: '0 auto 16px' }} />
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    </div>
  );
  if (!user) return <Navigate to="/login" replace />;
  if (user.role !== 'customer') return <Navigate to="/app/dashboard" replace />;
  return <Outlet />;
}

// ── Customer Layout ────────────────────────────────────────────────────────
export default function CustomerLayout() {
  const { user, logout }  = useAuth();
  const { isDark, toggleTheme } = useTheme();
  const navigate          = useNavigate();
  const [mobileOpen, setMobileOpen] = useState(false);

  const NAV = [
    { to: '/app/portal/dashboard', icon: <LayoutDashboard size={18} />, label: 'Dashboard'   },
    { to: '/app/portal/jobs',      icon: <Briefcase size={18} />,       label: 'My Jobs'     },
    { to: '/app/portal/invoices',  icon: <FileText size={18} />,        label: 'My Invoices' },
    { to: '/app/portal/profile',   icon: <UserCircle size={18} />,      label: 'My Profile'  },
  ];

  const handleLogout = () => { logout(); navigate('/login'); };

  const bg       = isDark ? '#0a0d12'     : '#f4f7fe';
  const sidebar  = isDark ? '#111128'     : '#ffffff';
  const border   = isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.08)';
  const text     = isDark ? '#e8edf5'     : '#1b254b';
  const muted    = isDark ? '#8a9bb5'     : '#707eae';
  const headerBg = isDark ? 'rgba(13,13,26,0.88)' : 'rgba(244,247,254,0.95)';

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Syne:wght@700;800&family=Outfit:wght@400;600;700&display=swap');
        * { box-sizing: border-box; }
        .portal-nav-link { text-decoration: none; margin-bottom: 2px; display: block; }
        .portal-nav-inner { transition: background 0.18s ease, color 0.18s ease; }
        .portal-nav-inner:hover {
          background: ${isDark ? 'rgba(99,102,241,0.12)' : 'rgba(99,102,241,0.08)'};
          color: #818cf8;
        }
        .portal-nav-active .portal-nav-inner {
          background: linear-gradient(135deg,#6366f1,#a855f7) !important;
          color: #ffffff !important;
          box-shadow: 0 6px 18px rgba(99,102,241,0.28);
        }
        .portal-logout:hover { background: rgba(239,68,68,0.12) !important; border-color: rgba(239,68,68,0.3) !important; }
        .portal-mobile-overlay { display: none; }
        @media (max-width: 768px) {
          .portal-sidebar { transform: translateX(-100%); transition: transform 0.28s ease !important; }
          .portal-sidebar.open { transform: translateX(0) !important; }
          .portal-mobile-overlay { display: block; position: fixed; inset: 0; background: rgba(0,0,0,0.5); z-index: 49; }
          .portal-main { margin-left: 0 !important; }
        }
      `}</style>

      <div style={{ display: 'flex', height: '100vh', overflow: 'hidden', background: bg }}>

        {/* Mobile overlay */}
        {mobileOpen && <div className="portal-mobile-overlay" onClick={() => setMobileOpen(false)} />}

        {/* ── Sidebar ── */}
        <aside
          className={`portal-sidebar${mobileOpen ? ' open' : ''}`}
          style={{
            width: 240, height: '100vh', position: 'fixed', top: 0, left: 0,
            background: sidebar, borderRight: `1px solid ${border}`,
            display: 'flex', flexDirection: 'column',
            zIndex: 50, transition: 'width 0.3s ease',
          }}
        >
          {/* Brand */}
          <div style={{
            padding: '20px 18px', display: 'flex', alignItems: 'center',
            justifyContent: 'space-between', borderBottom: `1px solid ${border}`, minHeight: 72,
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <div style={{
                width: 32, height: 32, borderRadius: 9,
                background: 'linear-gradient(135deg,#6366f1,#a855f7)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}>
                <Zap size={15} color="#fff" strokeWidth={2.5} />
              </div>
              <span style={{ fontSize: 17, fontWeight: 800, color: text, fontFamily: 'Syne, sans-serif', letterSpacing: '-0.4px' }}>
                Flow<span style={{ color: '#a855f7' }}>POS</span>
              </span>
            </div>
          </div>

          {/* Customer badge */}
          <div style={{ padding: '12px 18px', borderBottom: `1px solid ${border}` }}>
            <div style={{
              fontSize: 10, fontWeight: 700, letterSpacing: '1.5px',
              textTransform: 'uppercase', color: '#a855f7',
              background: 'rgba(168,85,247,0.1)', border: '1px solid rgba(168,85,247,0.2)',
              borderRadius: 100, padding: '4px 12px', display: 'inline-block',
            }}>
              Customer Portal
            </div>
          </div>

          {/* Nav */}
          <nav style={{ flex: 1, padding: '12px 10px', overflowY: 'auto' }}>
            {NAV.map(({ to, icon, label }) => (
              <NavLink
                key={to}
                to={to}
                onClick={() => setMobileOpen(false)}
                className={({ isActive }) => isActive ? 'portal-nav-link portal-nav-active' : 'portal-nav-link'}
              >
                <div className="portal-nav-inner" style={{
                  display: 'flex', alignItems: 'center', gap: 12,
                  padding: '11px 14px', borderRadius: 12, color: muted,
                }}>
                  {icon}
                  <span style={{ fontSize: 13.5, fontWeight: 600, fontFamily: 'Outfit, sans-serif' }}>{label}</span>
                </div>
              </NavLink>
            ))}
          </nav>

          {/* Footer */}
          <div style={{ padding: '12px 10px', borderTop: `1px solid ${border}` }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '6px 8px', marginBottom: 8 }}>
              <div style={{
                width: 32, height: 32, borderRadius: '50%', flexShrink: 0,
                background: 'linear-gradient(135deg,#6366f1,#a855f7)',
                color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: 13, fontWeight: 800,
              }}>
                {user?.name?.[0]?.toUpperCase() ?? '?'}
              </div>
              <div style={{ minWidth: 0 }}>
                <p style={{ margin: 0, fontSize: 13, fontWeight: 700, color: text, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', fontFamily: 'Outfit, sans-serif' }}>
                  {user?.name}
                </p>
                <p style={{ margin: 0, fontSize: 10, color: muted, fontFamily: 'Outfit, sans-serif' }}>Customer</p>
              </div>
            </div>
            <button
              className="portal-logout"
              onClick={handleLogout}
              style={{
                display: 'flex', alignItems: 'center', gap: 10,
                width: '100%', padding: '10px 14px', borderRadius: 12,
                background: 'rgba(239,68,68,0.05)', border: '1px solid rgba(239,68,68,0.14)',
                color: '#ef4444', cursor: 'pointer', fontSize: 13.5, fontWeight: 700,
                fontFamily: 'Outfit, sans-serif', transition: 'background 0.18s',
              }}
            >
              <LogOut size={17} strokeWidth={2.2} />
              <span>Logout</span>
            </button>
          </div>
        </aside>

        {/* ── Main ── */}
        <div className="portal-main" style={{
          marginLeft: 240, flex: 1,
          display: 'flex', flexDirection: 'column',
          height: '100vh', overflow: 'hidden',
        }}>
          {/* Header */}
          <header style={{
            height: 64, flexShrink: 0,
            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            padding: '0 28px', gap: 8,
            background: headerBg, backdropFilter: 'blur(14px)',
            borderBottom: `1px solid ${border}`,
            position: 'sticky', top: 0, zIndex: 20,
          }}>
            <button
              onClick={() => setMobileOpen(true)}
              style={{
                display: 'none', background: 'none', border: 'none',
                color: text, cursor: 'pointer', padding: 4,
              }}
              className="portal-hamburger"
            >
              <Menu size={22} />
            </button>

            <div style={{ flex: 1 }} />

            <button
              onClick={toggleTheme}
              style={{
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                padding: 8, borderRadius: 10, cursor: 'pointer',
                background: isDark ? 'rgba(255,255,255,0.04)' : '#f4f7fe',
                border: `1px solid ${border}`, color: text,
              }}
            >
              {isDark ? <Sun size={16} color="#f59e0b" /> : <Moon size={16} color="#6366f1" />}
            </button>

            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <div style={{ textAlign: 'right' }}>
                <p style={{ margin: 0, fontSize: 13, fontWeight: 700, color: text, fontFamily: 'Outfit, sans-serif' }}>
                  {user?.name?.split(' ')[0]}
                </p>
                <p style={{ margin: 0, fontSize: 10, color: muted, textTransform: 'uppercase', letterSpacing: '0.5px', fontFamily: 'Outfit, sans-serif' }}>
                  Customer
                </p>
              </div>
              <div style={{
                width: 34, height: 34, borderRadius: 10,
                background: 'linear-gradient(135deg,#6366f1,#a855f7)',
                color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: 14, fontWeight: 800, fontFamily: 'Syne, sans-serif',
              }}>
                {user?.name?.[0]?.toUpperCase() ?? '?'}
              </div>
            </div>
          </header>

          <main style={{ flex: 1, overflowY: 'auto', padding: '28px 32px 48px' }}>
            <Outlet />
          </main>
        </div>
      </div>
    </>
  );
}