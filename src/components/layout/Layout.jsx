import React, { useState, useEffect, useRef } from 'react';
import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import { useTranslation } from 'react-i18next';
import FloatingChat from '../FloatingChat';
import {
  LayoutDashboard, Briefcase, FileText, Users,
  Wrench, BarChart2, ShieldAlert, LogOut,
  ChevronLeft, ChevronRight, Sun, Moon, Languages,
  Zap, Bot, Settings
} from 'lucide-react';

function NavTooltip({ label, collapsed, children }) {
  const [visible, setVisible] = useState(false);
  if (!collapsed) return children;
  return (
    <div
      style={{ position: 'relative' }}
      onMouseEnter={() => setVisible(true)}
      onMouseLeave={() => setVisible(false)}
    >
      {children}
      {visible && (
        <div style={{
          position: 'absolute',
          left: 'calc(100% + 14px)',
          top: '50%',
          transform: 'translateY(-50%)',
          background: 'linear-gradient(135deg,#6366f1,#a855f7)',
          color: '#fff',
          padding: '6px 12px',
          borderRadius: 8,
          fontSize: 12,
          fontWeight: 700,
          fontFamily: 'Outfit, sans-serif',
          whiteSpace: 'nowrap',
          pointerEvents: 'none',
          zIndex: 999,
          boxShadow: '0 6px 16px rgba(99,102,241,0.35)',
          letterSpacing: '0.2px',
        }}>
          {label}
          <div style={{
            position: 'absolute',
            right: '100%',
            top: '50%',
            transform: 'translateY(-50%)',
            borderWidth: '5px 6px 5px 0',
            borderStyle: 'solid',
            borderColor: 'transparent #6366f1 transparent transparent',
          }} />
        </div>
      )}
    </div>
  );
}

export default function Layout() {
  const { user, logout, isAdmin } = useAuth();
  const { isDark, toggleTheme }   = useTheme();
  const { i18n, t }               = useTranslation();
  const navigate                  = useNavigate();
  const [collapsed, setCollapsed] = useState(false);
  const [, forceUpdate]           = useState(0);

  useEffect(() => {
    const handler = () => forceUpdate(n => n + 1);
    i18n.on('languageChanged', handler);
    return () => i18n.off('languageChanged', handler);
  }, [i18n]);

  const NAV = [
    { to: '/app/dashboard', icon: <LayoutDashboard size={20} />, label: t('nav_dashboard',  'Dashboard')    },
    { to: '/app/ai',        icon: <Bot size={20} />,             label: t('nav_ai',         'AI Assistant') },
    { to: '/app/jobs',      icon: <Briefcase size={20} />,       label: t('nav_jobs',       'Work Orders')  },
    { to: '/app/invoices',  icon: <FileText size={20} />,        label: t('nav_invoices',   'Invoices')     },
    { to: '/app/customers', icon: <Users size={20} />,           label: t('nav_customers',  'Customers')    },
    { to: '/app/services',  icon: <Wrench size={20} />,          label: t('nav_services',   'Services')     },
    { to: '/app/reports',   icon: <BarChart2 size={20} />,       label: t('nav_reports',    'Reports')      },
  ];

  // ✅ Single BOTTOM_NAV — correct admin path
const BOTTOM_NAV = [
  { to: '/app/settings', icon: <Settings size={20} />, label: t('nav_settings', 'Settings') },
  ...(isAdmin ? [{ to: '/app/admin', icon: <ShieldAlert size={20} />, label: t('nav_admin', 'Admin Panel') }] : []),
];

  const handleLogout = () => { logout(); navigate('/login'); };
  const toggleLang   = () => {
    const next = i18n.language === 'en' ? 'ja' : 'en';
    i18n.changeLanguage(next);
    localStorage.setItem('lang', next);
  };

  const sidebarW      = collapsed ? 72 : 260;
  const sidebarBg     = isDark ? 'linear-gradient(180deg,#111128 0%,#0d0d1a 100%)' : '#ffffff';
  const sidebarBorder = isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.08)';
  const headerBg      = isDark ? 'rgba(13,13,26,0.88)'    : 'rgba(244,247,254,0.95)';
  const layoutBg      = isDark ? '#0a0d12'                 : '#f4f7fe';
  const textPrimary   = isDark ? '#e8edf5'                 : '#1b254b';
  const textMuted     = isDark ? '#8a9bb5'                 : '#707eae';

  const controlBtn = {
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    padding: '8px', borderRadius: 10, cursor: 'pointer',
    transition: 'background 0.2s, border-color 0.2s',
    background: isDark ? 'rgba(255,255,255,0.04)' : '#f4f7fe',
    border: `1px solid ${isDark ? 'rgba(255,255,255,0.07)' : 'rgba(0,0,0,0.08)'}`,
    color: textPrimary,
  };

  const navItemBase = {
    display: 'flex', alignItems: 'center',
    gap: 14, padding: '11px 14px', borderRadius: 12,
    color: textMuted,
    justifyContent: collapsed ? 'center' : 'flex-start',
    transition: 'background 0.18s, color 0.18s',
    cursor: 'pointer',
  };

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Syne:wght@700;800&family=Outfit:wght@400;600;700&display=swap');
        * { box-sizing: border-box; }
        .app-nav-link { text-decoration: none; margin-bottom: 2px; display: block; }
        .app-nav-inner { transition: background 0.18s ease, color 0.18s ease; }
        .app-nav-inner:hover {
          background: ${isDark ? 'rgba(99,102,241,0.12)' : 'rgba(99,102,241,0.08)'};
          color: #818cf8;
        }
        .app-nav-active .app-nav-inner {
          background: linear-gradient(135deg,#6366f1,#a855f7) !important;
          color: #ffffff !important;
          box-shadow: 0 6px 18px rgba(99,102,241,0.28);
        }
        .app-nav-active .app-nav-inner svg { color: #ffffff !important; }
        .logout-btn:hover { background: rgba(239,68,68,0.12) !important; border-color: rgba(239,68,68,0.3) !important; }
        .collapse-btn:hover { background: ${isDark ? 'rgba(255,255,255,0.08)' : 'rgba(99,102,241,0.08)'} !important; }
        .ctrl-btn:hover { background: ${isDark ? 'rgba(255,255,255,0.09)' : 'rgba(99,102,241,0.08)'} !important; }
        ::-webkit-scrollbar { width: 4px; }
        ::-webkit-scrollbar-track { background: transparent; }
        ::-webkit-scrollbar-thumb { background: ${isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.12)'}; border-radius: 4px; }
      `}</style>

      <div style={{ display: 'flex', height: '100vh', overflow: 'hidden', background: layoutBg }}>

        {/* ── Sidebar ── */}
        <aside style={{
          width: sidebarW,
          height: '100vh',
          position: 'fixed',
          top: 0, left: 0,
          background: sidebarBg,
          borderRight: `1px solid ${sidebarBorder}`,
          display: 'flex', flexDirection: 'column',
          transition: 'width 0.32s cubic-bezier(0.4,0,0.2,1)',
          zIndex: 50, flexShrink: 0, overflow: 'hidden',
        }}>

          {/* Brand */}
          <div style={{
            padding: collapsed ? '22px 0' : '22px 18px',
            display: 'flex', alignItems: 'center',
            justifyContent: collapsed ? 'center' : 'space-between',
            borderBottom: `1px solid ${sidebarBorder}`,
            minHeight: 72, flexShrink: 0,
          }}>
            {!collapsed && (
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, overflow: 'hidden' }}>
                <div style={{
                  width: 34, height: 34, borderRadius: 9, flexShrink: 0,
                  background: 'linear-gradient(135deg,#6366f1,#a855f7)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  boxShadow: '0 4px 12px rgba(99,102,241,0.32)',
                }}>
                  <Zap size={17} color="#fff" strokeWidth={2.5} />
                </div>
                <span style={{
                  fontSize: 18, fontWeight: 800, color: textPrimary,
                  fontFamily: 'Syne, sans-serif', letterSpacing: '-0.4px',
                  whiteSpace: 'nowrap',
                }}>
                  Flow<span style={{ color: '#a855f7' }}>POS</span>
                </span>
              </div>
            )}

            {collapsed && (
              <div style={{
                width: 34, height: 34, borderRadius: 9,
                background: 'linear-gradient(135deg,#6366f1,#a855f7)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                boxShadow: '0 4px 12px rgba(99,102,241,0.32)',
              }}>
                <Zap size={17} color="#fff" strokeWidth={2.5} />
              </div>
            )}

            {!collapsed && (
              <button
                className="collapse-btn"
                onClick={() => setCollapsed(true)}
                aria-label="Collapse sidebar"
                style={{ ...controlBtn, padding: '6px', flexShrink: 0 }}
              >
                <ChevronLeft size={16} />
              </button>
            )}
          </div>

          {/* Expand tab when collapsed */}
          {collapsed && (
            <button
              className="collapse-btn"
              onClick={() => setCollapsed(false)}
              aria-label="Expand sidebar"
              style={{
                position: 'absolute', top: 84, right: -12,
                width: 24, height: 24, borderRadius: '50%',
                background: isDark ? '#1e1e3a' : '#fff',
                border: `1px solid ${sidebarBorder}`,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                cursor: 'pointer', zIndex: 60,
                boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
                color: textMuted,
                transition: 'background 0.2s',
              }}
            >
              <ChevronRight size={13} />
            </button>
          )}

          {/* Nav */}
          <nav style={{ flex: 1, padding: '12px 10px', overflowY: 'auto', overflowX: 'hidden' }}>
            {!collapsed && (
              <p style={{
                margin: '4px 4px 8px',
                fontSize: 10, fontWeight: 700, letterSpacing: '0.8px',
                textTransform: 'uppercase', color: textMuted, opacity: 0.6,
                fontFamily: 'Outfit, sans-serif',
              }}>
                {t('nav_section_main', 'Main Menu')}
              </p>
            )}

            {NAV.map(({ to, icon, label }) => (
              <NavTooltip key={to} label={label} collapsed={collapsed}>
                <NavLink
                  to={to}
                  end={to === '/app/dashboard'}
                  className={({ isActive }) => isActive ? 'app-nav-link app-nav-active' : 'app-nav-link'}
                >
                  <div className="app-nav-inner" style={navItemBase}>
                    {icon}
                    {!collapsed && (
                      <span style={{ fontSize: 13.5, fontWeight: 600, fontFamily: 'Outfit, sans-serif', whiteSpace: 'nowrap' }}>
                        {label}
                      </span>
                    )}
                  </div>
                </NavLink>
              </NavTooltip>
            ))}

            <div style={{ height: 1, background: sidebarBorder, margin: '12px 4px' }} />

            {!collapsed && (
              <p style={{
                margin: '4px 4px 8px',
                fontSize: 10, fontWeight: 700, letterSpacing: '0.8px',
                textTransform: 'uppercase', color: textMuted, opacity: 0.6,
                fontFamily: 'Outfit, sans-serif',
              }}>
                {t('nav_section_system', 'System')}
              </p>
            )}

            {BOTTOM_NAV.map(({ to, icon, label }) => (
              <NavTooltip key={to} label={label} collapsed={collapsed}>
                <NavLink
                  to={to}
                  className={({ isActive }) => isActive ? 'app-nav-link app-nav-active' : 'app-nav-link'}
                >
                  <div className="app-nav-inner" style={navItemBase}>
                    {icon}
                    {!collapsed && (
                      <span style={{ fontSize: 13.5, fontWeight: 600, fontFamily: 'Outfit, sans-serif', whiteSpace: 'nowrap' }}>
                        {label}
                      </span>
                    )}
                  </div>
                </NavLink>
              </NavTooltip>
            ))}
          </nav>

          {/* Footer */}
          <div style={{
            padding: '12px 10px',
            borderTop: `1px solid ${sidebarBorder}`,
            display: 'flex', flexDirection: 'column', gap: 8, flexShrink: 0,
          }}>
            <div style={{
              display: 'flex', alignItems: 'center',
              gap: collapsed ? 0 : 10,
              padding: collapsed ? '6px 0' : '6px 8px',
              justifyContent: collapsed ? 'center' : 'flex-start',
              borderRadius: 10,
            }}>
              <div style={{
                width: 32, height: 32, borderRadius: '50%', flexShrink: 0,
                background: 'linear-gradient(135deg,#6366f1,#a855f7)',
                color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: 13, fontWeight: 800,
              }}>
                {user?.name?.[0]?.toUpperCase() ?? '?'}
              </div>
              {!collapsed && (
                <div style={{ overflow: 'hidden', minWidth: 0 }}>
                  <p style={{
                    margin: 0, fontSize: 13, fontWeight: 700,
                    color: textPrimary, whiteSpace: 'nowrap',
                    overflow: 'hidden', textOverflow: 'ellipsis',
                    fontFamily: 'Outfit, sans-serif',
                  }}>
                    {user?.name}
                  </p>
                  <p style={{
                    margin: 0, fontSize: 10, color: textMuted,
                    textTransform: 'capitalize', letterSpacing: '0.3px',
                    fontFamily: 'Outfit, sans-serif',
                  }}>
                    {user?.role}
                  </p>
                </div>
              )}
            </div>

            <NavTooltip label={t('logout', 'Logout')} collapsed={collapsed}>
              <button
                className="logout-btn"
                onClick={handleLogout}
                aria-label={t('logout', 'Logout')}
                style={{
                  display: 'flex', alignItems: 'center',
                  justifyContent: collapsed ? 'center' : 'flex-start',
                  gap: 10, width: '100%', padding: '10px 14px', borderRadius: 12,
                  background: 'rgba(239,68,68,0.05)',
                  border: '1px solid rgba(239,68,68,0.14)',
                  color: '#ef4444', cursor: 'pointer',
                  transition: 'background 0.18s, border-color 0.18s',
                  fontSize: 13.5, fontWeight: 700, fontFamily: 'Outfit, sans-serif',
                }}
              >
                <LogOut size={17} strokeWidth={2.2} />
                {!collapsed && <span>{t('logout', 'Logout')}</span>}
              </button>
            </NavTooltip>
          </div>
        </aside>

        {/* ── Right Side ── */}
        <div style={{
          marginLeft: sidebarW,
          flex: 1,
          display: 'flex', flexDirection: 'column',
          height: '100vh', overflow: 'hidden',
          transition: 'margin-left 0.32s cubic-bezier(0.4,0,0.2,1)',
        }}>
          <header style={{
            height: 64, flexShrink: 0,
            display: 'flex', alignItems: 'center', justifyContent: 'flex-end',
            padding: '0 28px', gap: 8,
            background: headerBg,
            backdropFilter: 'blur(14px)',
            WebkitBackdropFilter: 'blur(14px)',
            borderBottom: `1px solid ${sidebarBorder}`,
            position: 'sticky', top: 0, zIndex: 20,
          }}>
            <button className="ctrl-btn" onClick={toggleLang} aria-label="Toggle language"
              style={{ ...controlBtn, gap: 6, padding: '7px 12px' }}>
              <Languages size={15} color="#6366f1" />
              <span style={{ fontSize: 11.5, fontWeight: 800, color: textPrimary, fontFamily: 'Outfit, sans-serif' }}>
                {i18n.language === 'en' ? '日本語' : 'English'}
              </span>
            </button>

            <button className="ctrl-btn" onClick={toggleTheme} aria-label="Toggle theme" style={controlBtn}>
              {isDark
                ? <Sun size={16} color="#f59e0b" strokeWidth={2.2} />
                : <Moon size={16} color="#6366f1" strokeWidth={2.2} />}
            </button>

            <div style={{ width: 1, height: 20, background: sidebarBorder, margin: '0 4px' }} />

            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <div style={{ textAlign: 'right' }}>
                <p style={{ margin: 0, fontSize: 13, fontWeight: 700, color: textPrimary, lineHeight: 1.25, fontFamily: 'Outfit, sans-serif' }}>
                  {user?.name?.split(' ')[0]}
                </p>
                <p style={{ margin: 0, fontSize: 10, color: textMuted, textTransform: 'uppercase', letterSpacing: '0.5px', fontFamily: 'Outfit, sans-serif' }}>
                  {user?.role}
                </p>
              </div>
              <div style={{
                width: 34, height: 34, borderRadius: 10,
                background: 'linear-gradient(135deg,#6366f1,#a855f7)',
                color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: 14, fontWeight: 800, flexShrink: 0,
                fontFamily: 'Syne, sans-serif',
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

      <FloatingChat />
    </>
  );
}