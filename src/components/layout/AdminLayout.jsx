import React, { useState } from 'react';
import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import {
  LayoutDashboard, Users, ShieldCheck, LogOut,
  ChevronLeft, ChevronRight, Sun, Moon, Languages,
  ArrowLeftCircle, Search
} from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useTheme } from '../../context/ThemeContext';

const NAV = [
  { to: '/admin',       icon: <LayoutDashboard size={20} />, label: 'Dashboard',      exact: true },
  { to: '/admin/users', icon: <Users size={20} />,           label: 'User Management'             },
];

export default function AdminLayout() {
  const { user, logout }        = useAuth();
  const { isDark, toggleTheme } = useTheme();
  const { i18n }                = useTranslation();
  const navigate                = useNavigate();
  const [collapsed, setCollapsed]       = useState(false);
  const [searchFocused, setSearchFocused] = useState(false);
  const [searchQuery, setSearchQuery]   = useState('');

  const handleLogout = () => { logout(); navigate('/login'); };
  const toggleLang   = () => i18n.changeLanguage(i18n.language === 'en' ? 'ja' : 'en');

  const sidebarW = collapsed ? 88 : 280;

  const controlBtn = {
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    padding: '10px', borderRadius: '12px', cursor: 'pointer',
    transition: 'all 0.3s cubic-bezier(0.4,0,0.2,1)',
    background: isDark ? 'rgba(255,255,255,0.03)' : '#f4f7fe',
    border: `1px solid ${isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.08)'}`,
    color: isDark ? '#e8edf5' : '#1b254b',
    boxShadow: isDark ? 'none' : '0 2px 4px rgba(0,0,0,0.04)',
  };

  const sidebarBg   = isDark ? 'linear-gradient(180deg,#111128 0%,#0d0d1a 100%)' : '#ffffff';
  const sidebarBorder = isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.08)';
  const headerBg    = isDark ? 'rgba(13,13,26,0.85)' : 'rgba(244,247,254,0.85)';
  const pillBg      = isDark ? 'rgba(255,255,255,0.03)' : '#ffffff';
  const pillBorder  = isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.08)';
  const searchBg    = isDark ? 'rgba(255,255,255,0.05)' : '#f4f7fe';
  const textPrimary = isDark ? '#e8edf5' : '#1b254b';
  const textMuted   = isDark ? '#8a9bb5' : '#707eae';
  const dividerClr  = isDark ? 'rgba(255,255,255,0.07)' : 'rgba(0,0,0,0.08)';
  const layoutBg    = isDark ? '#0a0d12' : '#f4f7fe';

  return (
    <>
      <style>{`
        * { box-sizing: border-box; }
        .admin-nav-link { text-decoration: none; margin-bottom: 8px; display: block; }
        .nav-item-inner { transition: all 0.25s ease; }
        .nav-item-inner:hover { background: rgba(99,102,241,0.12); color: #818cf8; }
        .active-nav .nav-item-inner {
          background: linear-gradient(135deg,#6366f1,#a855f7) !important;
          color: #ffffff !important;
          box-shadow: 0 8px 20px rgba(99,102,241,0.35);
        }
      `}</style>

      {/* ── Root shell — locked viewport ── */}
      <div style={{ display: 'flex', height: '100vh', overflow: 'hidden', background: layoutBg }}>

        {/* ── Sidebar — fixed ── */}
        <aside style={{
          width: sidebarW,
          height: '100vh',
          position: 'fixed',
          top: 0, left: 0,
          background: sidebarBg,
          borderRight: `1px solid ${sidebarBorder}`,
          display: 'flex', flexDirection: 'column',
          transition: 'width 0.35s cubic-bezier(0.4,0,0.2,1)',
          zIndex: 50, flexShrink: 0, overflow: 'hidden',
        }}>

          {/* Brand */}
          <div style={{
            padding: '32px 24px', display: 'flex', alignItems: 'center',
            justifyContent: collapsed ? 'center' : 'space-between',
            borderBottom: `1px solid ${sidebarBorder}`,
          }}>
            {!collapsed && (
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <div style={{
                  width: 38, height: 38, borderRadius: 12,
                  background: 'linear-gradient(135deg,#6366f1,#a855f7)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  boxShadow: '0 6px 14px rgba(99,102,241,0.3)',
                }}>
                  <ShieldCheck size={20} color="#fff" />
                </div>
                <span style={{ fontSize: 20, fontWeight: 800, color: textPrimary, fontFamily: 'Syne,sans-serif', letterSpacing: '-0.5px' }}>
                  FlowPOS
                </span>
              </div>
            )}
            <button onClick={() => setCollapsed(!collapsed)} style={{ ...controlBtn, padding: '7px' }}>
              {collapsed ? <ChevronRight size={17} /> : <ChevronLeft size={17} />}
            </button>
          </div>

          {/* Nav */}
          <nav style={{ flex: 1, padding: '16px 16px', overflowY: 'auto' }}>
            {NAV.map(({ to, icon, label, exact }) => (
              <NavLink key={to} to={to} end={exact}
                className={({ isActive }) => isActive ? 'admin-nav-link active-nav' : 'admin-nav-link'}>
                <div className="nav-item-inner" style={{
                  display: 'flex', alignItems: 'center', gap: 14,
                  padding: '13px 16px', borderRadius: 12,
                  color: textMuted,
                  justifyContent: collapsed ? 'center' : 'flex-start',
                }}>
                  {icon}
                  {!collapsed && <span style={{ fontSize: 14, fontWeight: 600 }}>{label}</span>}
                </div>
              </NavLink>
            ))}

            <div style={{ height: 1, background: dividerClr, margin: '12px 4px' }} />

            <NavLink to="/app/dashboard" className="admin-nav-link">
              <div className="nav-item-inner" style={{
                display: 'flex', alignItems: 'center', gap: 14,
                padding: '13px 16px', borderRadius: 12,
                color: textMuted,
                justifyContent: collapsed ? 'center' : 'flex-start',
              }}>
                <ArrowLeftCircle size={20} />
                {!collapsed && <span style={{ fontSize: 14, fontWeight: 500 }}>Back to App</span>}
              </div>
            </NavLink>
          </nav>

          {/* Footer / Logout */}
          <div style={{ padding: '20px 16px', borderTop: `1px solid ${sidebarBorder}` }}>
            <button onClick={handleLogout} style={{
              ...controlBtn,
              width: '100%', gap: 10,
              color: '#ef4444',
              background: 'rgba(239,68,68,0.06)',
              border: '1px solid rgba(239,68,68,0.15)',
            }}>
              <LogOut size={18} />
              {!collapsed && <span style={{ fontSize: 14, fontWeight: 700 }}>Logout</span>}
            </button>
          </div>
        </aside>

        {/* ── Right side — offset by sidebar width ── */}
        <div style={{
          marginLeft: sidebarW,
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          height: '100vh',
          overflow: 'hidden',
          transition: 'margin-left 0.35s cubic-bezier(0.4,0,0.2,1)',
        }}>

          {/* Topbar */}
          <header style={{
            height: 80, flexShrink: 0,
            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            padding: '0 40px',
            position: 'sticky', top: 0, zIndex: 20,
            background: headerBg,
            backdropFilter: 'blur(12px)',
            borderBottom: `1px solid ${sidebarBorder}`,
          }}>
            <div>
              <p style={{ margin: 0, fontSize: 11, color: textMuted, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '1px' }}>
                Pages / Admin
              </p>
              <h1 style={{ margin: 0, fontSize: 22, fontWeight: 800, color: textPrimary, fontFamily: 'Syne,sans-serif' }}>
                Main Dashboard
              </h1>
            </div>

            {/* Controls pill */}
            <div style={{
              display: 'flex', alignItems: 'center', gap: 8,
              background: pillBg, padding: '6px 12px',
              borderRadius: 20, border: `1px solid ${pillBorder}`,
            }}>
              {/* Search */}
              <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
                <Search size={15} style={{ position: 'absolute', left: 10, color: textMuted, pointerEvents: 'none' }} />
                <input
                  type="text"
                  placeholder="Search..."
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  onFocus={() => setSearchFocused(true)}
                  onBlur={() => setSearchFocused(false)}
                  style={{
                    background: searchBg, border: 'none', borderRadius: 12,
                    padding: '7px 12px 7px 34px', fontSize: 13,
                    color: textPrimary, outline: 'none',
                    width: searchFocused ? 220 : 160,
                    transition: 'width 0.3s ease',
                  }}
                />
              </div>

              <div style={{ width: 1, height: 22, background: dividerClr }} />

              {/* Language */}
              <button onClick={toggleLang} style={{ ...controlBtn, border: 'none', background: 'none', gap: 5, padding: '6px 10px' }}>
                <Languages size={18} color="#6366f1" />
                <span style={{ fontSize: 12, fontWeight: 800, color: textPrimary }}>{i18n.language.toUpperCase()}</span>
              </button>

              {/* Theme */}
              <button onClick={toggleTheme} style={{ ...controlBtn, border: 'none', background: 'none', padding: '6px 8px' }}>
                {isDark ? <Sun size={18} color="#f59e0b" /> : <Moon size={18} color="#6366f1" />}
              </button>

              <div style={{ width: 1, height: 22, background: dividerClr }} />

              {/* User */}
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, paddingLeft: 4 }}>
                <div style={{ textAlign: 'right' }}>
                  <p style={{ margin: 0, fontSize: 13, fontWeight: 700, color: textPrimary }}>{user?.name || 'Admin'}</p>
                  <p style={{ margin: 0, fontSize: 10, color: textMuted, fontWeight: 600 }}>Super Admin</p>
                </div>
                <div style={{
                  width: 36, height: 36, borderRadius: 10,
                  background: 'linear-gradient(135deg,#6366f1,#a855f7)',
                  color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: 14, fontWeight: 800,
                }}>
                  {user?.name?.slice(0, 1) || 'A'}
                </div>
              </div>
            </div>
          </header>

          {/* Page content — this div scrolls */}
          <div style={{ flex: 1, overflowY: 'auto', padding: '24px 40px 48px' }}>
            <Outlet context={{ searchQuery }} />
          </div>
        </div>
      </div>
    </>
  );
}