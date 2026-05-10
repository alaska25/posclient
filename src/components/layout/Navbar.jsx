import React from 'react';
import { useTranslation } from 'react-i18next';
import { useTheme } from '../../context/ThemeContext';
import { useAuth } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { LogOut, Globe, Sun, Moon, User, Bell } from 'lucide-react';

const Navbar = () => {
  const { i18n, t } = useTranslation();
  const { isDark, toggleTheme } = useTheme();
  const { logout, user } = useAuth();
  const navigate = useNavigate();

  const toggleLang = () => {
    i18n.changeLanguage(i18n.language === 'en' ? 'ja' : 'en');
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const initials = (name) =>
    name?.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2) || '??';

  const avatarColors = ['#6366f1', '#a855f7', '#ec4899', '#06b6d4', '#10b981', '#f59e0b'];
  const avatarColor = (name) => avatarColors[(name?.charCodeAt(0) || 0) % avatarColors.length];

  const css = `
    @import url('https://googleapis.com');
    
    :root, [data-theme="light"] {
      --nb-bg: #ffffff;
      --nb-border: rgba(0,0,0,0.06);
      --nb-text: #1b254b;
      --nb-text-muted: #707eae;
      --nb-pill: #f4f7fe;
      --nb-accent: #6366f1;
    }
    
    [data-theme="dark"] {
      --nb-bg: #0d0d1a;
      --nb-border: rgba(255,255,255,0.07);
      --nb-text: #f9fafb;
      --nb-text-muted: rgba(255,255,255,0.4);
      --nb-pill: rgba(255,255,255,0.04);
      --nb-accent: #818cf8;
    }

    .nb-root {
      font-family: 'Plus Jakarta Sans', sans-serif;
      box-sizing: border-box;
    }

    .nb-pill-btn {
      display: flex; align-items: center; gap: 8px;
      padding: 8px 16px; border-radius: 12px;
      background: var(--nb-pill); border: 1px solid var(--nb-border);
      color: var(--nb-text); font-size: 13px; font-weight: 700;
      cursor: pointer; transition: all 0.2s ease;
    }

    .nb-pill-btn:hover { border-color: var(--nb-accent); color: var(--nb-accent); }

    .nb-theme-toggle {
      display: flex; padding: 4px; border-radius: 14px;
      background: var(--nb-pill); border: 1px solid var(--nb-border); cursor: pointer;
    }

    .nb-icon-box {
      width: 32px; height: 32px; border-radius: 10px;
      display: flex; align-items: center; justify-content: center;
      color: var(--nb-text-muted); transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1);
    }

    .nb-icon-box.active {
      background: var(--nb-accent); color: #fff;
      box-shadow: 0 4px 12px rgba(99,102,241,0.3);
    }

    .nb-avatar {
      width: 40px; height: 40px; border-radius: 12px;
      display: flex; align-items: center; justify-content: center;
      color: #fff; font-weight: 800; font-size: 14px;
      font-family: 'Syne', sans-serif; transition: transform 0.2s;
    }

    .nb-logout-btn {
      width: 40px; height: 40px; border-radius: 12px;
      display: flex; align-items: center; justify-content: center;
      background: var(--nb-pill); border: 1px solid var(--nb-border);
      color: var(--nb-text-muted); cursor: pointer; transition: all 0.2s;
    }

    .nb-logout-btn:hover {
      background: rgba(244, 63, 94, 0.1); border-color: #f43f5e; color: #f43f5e;
    }

    .nb-brand {
      font-family: 'Syne', sans-serif; font-size: 22px; font-weight: 800;
      background: linear-gradient(135deg, #6366f1, #a855f7);
      -webkit-background-clip: text; -webkit-text-fill-color: transparent;
      letter-spacing: -0.5px;
    }
  `;

  return (
    <div className="nb-root">
      <style>{css}</style>
      <nav style={{
        height: 72, display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '0 32px', background: 'var(--nb-bg)', borderBottom: '1px solid var(--nb-border)',
        position: 'sticky', top: 0, zIndex: 100, transition: 'background 0.3s ease'
      }}>
        {/* ── Brand ── */}
        <div className="nb-brand">FlowPOS</div>

        {/* ── Actions ── */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
          
          {/* Notification (Placeholder for production feel) */}
          <div className="nb-logout-btn" style={{ border: 'none' }}>
            <Bell size={20} />
          </div>

          {/* Language Switch */}
          <button className="nb-pill-btn" onClick={toggleLang}>
            <Globe size={16} color="var(--nb-accent)" />
            {i18n.language === 'en' ? '日本語' : 'English'}
          </button>

          {/* Theme Segmented Control */}
          <div className="nb-theme-toggle" onClick={toggleTheme}>
            <div className={`nb-icon-box ${!isDark ? 'active' : ''}`}>
              <Sun size={18} />
            </div>
            <div className={`nb-icon-box ${isDark ? 'active' : ''}`}>
              <Moon size={18} />
            </div>
          </div>

          <div style={{ width: 1, height: 32, background: 'var(--nb-border)', margin: '0 8px' }} />

          {/* User Profile Section */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
            <div style={{ textAlign: 'right', display: 'flex', flexDirection: 'column' }}>
              <span style={{ fontSize: 14, fontWeight: 800, color: 'var(--nb-text)' }}>{user?.name || 'Admin User'}</span>
              <span style={{ fontSize: 11, fontWeight: 600, color: 'var(--nb-text-muted)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                {user?.role || 'System Manager'}
              </span>
            </div>
            
            <div className="nb-avatar" style={{ background: avatarColor(user?.name) }}>
              {initials(user?.name)}
            </div>

            <button className="nb-logout-btn" onClick={handleLogout} title="Sign Out">
              <LogOut size={18} />
            </button>
          </div>
        </div>
      </nav>
    </div>
  );
};

export default Navbar;
