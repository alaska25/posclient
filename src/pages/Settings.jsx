import React, { useState, useRef, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { useTranslation } from 'react-i18next';
import {
  User, Palette, Bell, Shield,
  Camera, Check, X, Eye, EyeOff,
  AlertCircle, Loader2, Upload
} from 'lucide-react';
import api from '../utils/api';

// ── Toast ─────────────────────────────────────────────────────────────────────
function Toast({ message, type, onClose }) {
  useEffect(() => {
    const t = setTimeout(onClose, 3500);
    return () => clearTimeout(t);
  }, [onClose]);
  const isError = type === 'error';
  return (
    <div style={{
      position: 'fixed', bottom: 28, right: 28, zIndex: 9999,
      display: 'flex', alignItems: 'center', gap: 10,
      padding: '12px 18px', borderRadius: 14,
      background: isError
        ? 'linear-gradient(135deg,#ef4444,#dc2626)'
        : 'linear-gradient(135deg,#6366f1,#a855f7)',
      color: '#fff', boxShadow: '0 8px 24px rgba(0,0,0,0.2)',
      fontSize: 13, fontWeight: 600, fontFamily: 'Outfit, sans-serif',
      animation: 'slideUp 0.3s ease',
    }}>
      {isError ? <AlertCircle size={16} /> : <Check size={16} />}
      {message}
      <button onClick={onClose} style={{ background: 'none', border: 'none', color: '#fff', cursor: 'pointer', padding: 0, marginLeft: 4 }}>
        <X size={14} />
      </button>
      <style>{`@keyframes slideUp { from { transform: translateY(16px); opacity: 0; } to { transform: translateY(0); opacity: 1; } }`}</style>
    </div>
  );
}

function Card({ children, isDark }) {
  return (
    <div style={{
      background: isDark ? 'rgba(255,255,255,0.03)' : '#fff',
      border: `1px solid ${isDark ? 'rgba(255,255,255,0.07)' : 'rgba(0,0,0,0.08)'}`,
      borderRadius: 18, padding: '28px 32px',
      boxShadow: isDark ? 'none' : '0 2px 12px rgba(0,0,0,0.05)',
    }}>
      {children}
    </div>
  );
}

function Field({ label, children, hint, isDark }) {
  const textMuted = isDark ? '#8a9bb5' : '#707eae';
  return (
    <div style={{ marginBottom: 20 }}>
      <label style={{
        display: 'block', marginBottom: 7, fontSize: 12, fontWeight: 700,
        letterSpacing: '0.4px', textTransform: 'uppercase', color: textMuted,
        fontFamily: 'Outfit, sans-serif',
      }}>{label}</label>
      {children}
      {hint && <p style={{ margin: '5px 0 0', fontSize: 11.5, color: textMuted, fontFamily: 'Outfit, sans-serif' }}>{hint}</p>}
    </div>
  );
}

function Input({ isDark, type = 'text', value, onChange, placeholder, rightEl, disabled }) {
  const textPrimary   = isDark ? '#e8edf5' : '#1b254b';
  const borderDefault = isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.12)';
  return (
    <div style={{ position: 'relative' }}>
      <input
        type={type} value={value} onChange={onChange}
        placeholder={placeholder} disabled={disabled}
        style={{
          width: '100%', padding: '11px 14px', paddingRight: rightEl ? 44 : 14,
          borderRadius: 10, border: `1px solid ${borderDefault}`,
          background: isDark ? 'rgba(255,255,255,0.05)' : '#f8f9fe',
          color: textPrimary, fontSize: 14, fontFamily: 'Outfit, sans-serif',
          outline: 'none', transition: 'border-color 0.2s',
          opacity: disabled ? 0.5 : 1, boxSizing: 'border-box',
        }}
        onFocus={e => e.target.style.borderColor = '#6366f1'}
        onBlur={e => e.target.style.borderColor = borderDefault}
      />
      {rightEl && (
        <div style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)' }}>
          {rightEl}
        </div>
      )}
    </div>
  );
}

function SaveButton({ loading, onClick, label = 'Save Changes' }) {
  return (
    <button onClick={onClick} disabled={loading} style={{
      display: 'flex', alignItems: 'center', gap: 8, padding: '11px 24px',
      borderRadius: 11,
      background: loading ? '#9ca3af' : 'linear-gradient(135deg,#6366f1,#a855f7)',
      color: '#fff', border: 'none', cursor: loading ? 'not-allowed' : 'pointer',
      fontSize: 13.5, fontWeight: 700, fontFamily: 'Outfit, sans-serif',
      boxShadow: loading ? 'none' : '0 6px 16px rgba(99,102,241,0.3)',
      transition: 'all 0.2s', marginTop: 8,
    }}>
      {loading ? <Loader2 size={15} style={{ animation: 'spin 1s linear infinite' }} /> : <Check size={15} />}
      {label}
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </button>
  );
}

const TABS = [
  { id: 'profile',       label: 'Profile',       icon: <User size={16} /> },
  { id: 'appearance',    label: 'Appearance',    icon: <Palette size={16} /> },
  { id: 'notifications', label: 'Notifications', icon: <Bell size={16} /> },
  { id: 'security',      label: 'Security',      icon: <Shield size={16} /> },
];

const errMsg = (err) => err?.response?.data?.message || err?.message || 'Something went wrong';

// ── Per-user localStorage helpers ─────────────────────────────────────────────
const uid        = (user) => user?._id || user?.id || null;
const avatarKey  = (user) => uid(user) ? `flowpos_avatar_${uid(user)}`  : null;
const nameKey    = (user) => uid(user) ? `flowpos_name_${uid(user)}`    : null;
const notifKey   = (user) => uid(user) ? `flowpos_notifs_${uid(user)}`  : 'flowpos_notifs';
const loadAvatar = (user) => { const k = avatarKey(user); return k ? localStorage.getItem(k) || null : null; };
const loadName   = (user) => { const k = nameKey(user);   return k ? localStorage.getItem(k) || null : null; };
const saveAvatar = (user, v) => { const k = avatarKey(user); if (k) localStorage.setItem(k, v); };
const saveName   = (user, v) => { const k = nameKey(user);   if (k) localStorage.setItem(k, v); };

// ─────────────────────────────────────────────────────────────────────────────
export default function Settings() {
  const { user }                = useAuth();
  const { isDark, toggleTheme } = useTheme();
  const { i18n }                = useTranslation();

  const textPrimary = isDark ? '#e8edf5' : '#1b254b';
  const textMuted   = isDark ? '#8a9bb5' : '#707eae';

  const [activeTab, setActiveTab] = useState('profile');
  const [toast, setToast]         = useState(null);
  const showToast = (message, type = 'success') => setToast({ message, type });

  // ── Profile state ──────────────────────────────────────────────────────────
  const [displayName, setDisplayName]       = useState(() => loadName(user) || user?.name || '');
  const [email, setEmail]                   = useState(user?.email || '');
  // DB avatarUrl takes priority; localStorage is a display cache only
  const [avatarPreview, setAvatarPreview]   = useState(() => user?.avatarUrl || loadAvatar(user));
  const [avatarLoading, setAvatarLoading]   = useState(false);
  const [profileLoading, setProfileLoading] = useState(false);
  const fileRef = useRef();

  // Re-sync all fields when the logged-in user changes (login / logout / switch)
  useEffect(() => {
    setDisplayName(loadName(user) || user?.name || '');
    setEmail(user?.email || '');
    // Prefer the URL stored in the DB (returned by /auth/me) over the local cache
    setAvatarPreview(user?.avatarUrl || loadAvatar(user));
  }, [uid(user)]); // eslint-disable-line

  // ── Avatar upload — saves to backend, caches URL locally ──────────────────
  const handleAvatarChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    if (file.size > 2 * 1024 * 1024) { showToast('Image must be under 2MB', 'error'); return; }

    const reader = new FileReader();
    reader.onload = async (ev) => {
      const base64 = ev.target.result; // "data:image/png;base64,..."
      setAvatarPreview(base64);        // instant optimistic preview
      setAvatarLoading(true);

      try {
        const { data } = await api.post('/auth/avatar', { avatar: base64 });
        // Backend returns the permanent CDN/S3 URL
        const url = data.avatarUrl || base64;
        setAvatarPreview(url);
        saveAvatar(user, url); // cache the final URL for instant display on next load
        showToast('Photo saved!');
      } catch (err) {
        // Roll back preview on failure
        setAvatarPreview(user?.avatarUrl || loadAvatar(user) || null);
        showToast(errMsg(err), 'error');
      } finally {
        setAvatarLoading(false);
      }
    };
    reader.readAsDataURL(file);
  };

  // ── Save display name ──────────────────────────────────────────────────────
  const handleSaveProfile = async () => {
    if (!displayName.trim()) return showToast('Display name cannot be empty', 'error');
    setProfileLoading(true);
    try {
      try {
        await api.put('/auth/profile', { name: displayName.trim(), email: email.trim() });
      } catch (apiErr) {
        const status = apiErr?.response?.status;
        if (status === 404 || status === 405) {
          saveName(user, displayName.trim());
        } else {
          throw apiErr;
        }
      }
      showToast('Profile updated successfully!');
    } catch (err) {
      showToast(errMsg(err), 'error');
    } finally {
      setProfileLoading(false);
    }
  };

  // ── Notifications (per-user) ───────────────────────────────────────────────
  const [notifs, setNotifs] = useState(() => {
    try { return JSON.parse(localStorage.getItem(notifKey(user)) || '{}'); }
    catch { return {}; }
  });
  const toggleNotif = (key) => {
    const next = { ...notifs, [key]: !notifs[key] };
    setNotifs(next);
    localStorage.setItem(notifKey(user), JSON.stringify(next));
    showToast(`${next[key] ? 'Enabled' : 'Disabled'} notification`);
  };
  const NOTIF_OPTIONS = [
    { key: 'new_job',      label: 'New work order assigned', desc: 'Get notified when a job is assigned to you' },
    { key: 'invoice_paid', label: 'Invoice paid',            desc: 'When a customer pays an invoice' },
    { key: 'low_stock',    label: 'Low stock alerts',        desc: 'When service parts run low' },
    { key: 'daily_report', label: 'Daily summary email',     desc: 'Receive a daily digest each morning' },
  ];

  // ── Security ───────────────────────────────────────────────────────────────
  const [currentPw, setCurrentPw]     = useState('');
  const [newPw, setNewPw]             = useState('');
  const [confirmPw, setConfirmPw]     = useState('');
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew]         = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [secLoading, setSecLoading]   = useState(false);

  const pwStrength = (pw) => {
    let s = 0;
    if (pw.length >= 8) s++;
    if (/[A-Z]/.test(pw)) s++;
    if (/[0-9]/.test(pw)) s++;
    if (/[^A-Za-z0-9]/.test(pw)) s++;
    return s;
  };
  const strength      = pwStrength(newPw);
  const strengthLabel = ['', 'Weak', 'Fair', 'Good', 'Strong'][strength];
  const strengthColor = ['', '#ef4444', '#f59e0b', '#3b82f6', '#22c55e'][strength];

  const handleChangePassword = async () => {
    if (!currentPw || !newPw || !confirmPw) return showToast('Please fill all fields', 'error');
    if (newPw !== confirmPw)               return showToast('Passwords do not match', 'error');
    if (strength < 2)                      return showToast('Password too weak — add uppercase, numbers or symbols', 'error');
    if (newPw === currentPw)               return showToast('New password must differ from current', 'error');
    setSecLoading(true);
    try {
      await api.put('/auth/change-password', { currentPassword: currentPw, newPassword: newPw });
      setCurrentPw(''); setNewPw(''); setConfirmPw('');
      showToast('Password changed successfully!');
    } catch (err) {
      showToast(errMsg(err), 'error');
    } finally {
      setSecLoading(false);
    }
  };

  // ── Appearance ─────────────────────────────────────────────────────────────
  const handleLangChange = (lang) => {
    i18n.changeLanguage(lang);
    localStorage.setItem('lang', lang);
    showToast(`Language changed to ${lang === 'en' ? 'English' : '日本語'}`);
  };

  // ── Derived display values ─────────────────────────────────────────────────
  const currentUserName  = displayName || user?.name || user?.email || 'Your Name';
  const currentUserEmail = user?.email || '';
  const currentUserRole  = user?.role  || '';
  const avatarInitial    = currentUserName[0]?.toUpperCase() || '?';

  const eyeBtn = (show, setShow) => (
    <button type="button" onClick={() => setShow(v => !v)}
      style={{ background: 'none', border: 'none', cursor: 'pointer', color: textMuted, padding: 0, display: 'flex' }}>
      {show ? <EyeOff size={15} /> : <Eye size={15} />}
    </button>
  );

  // ── Render ─────────────────────────────────────────────────────────────────
  return (
    <div style={{ maxWidth: 800, margin: '0 auto', fontFamily: 'Outfit, sans-serif' }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Syne:wght@700;800&family=Outfit:wght@400;600;700&display=swap');
        .settings-tab { transition: all 0.18s ease; cursor: pointer; }
        .settings-tab:hover { background: ${isDark ? 'rgba(255,255,255,0.05)' : 'rgba(99,102,241,0.06)'} !important; }
        .toggle-track { transition: background 0.25s ease; }
        .notif-row:hover { background: ${isDark ? 'rgba(255,255,255,0.03)' : 'rgba(99,102,241,0.04)'} !important; }
        .theme-card:hover { border-color: #6366f1 !important; }
      `}</style>

      {/* Header */}
      <div style={{ marginBottom: 28 }}>
        <h1 style={{ margin: 0, fontSize: 26, fontWeight: 800, color: textPrimary, fontFamily: 'Syne, sans-serif', letterSpacing: '-0.5px' }}>
          Settings
        </h1>
        <p style={{ margin: '4px 0 0', fontSize: 14, color: textMuted }}>
          Manage your account, appearance, and preferences
        </p>
      </div>

      <div style={{ display: 'flex', gap: 24, alignItems: 'flex-start' }}>

        {/* Tab Rail */}
        <div style={{
          width: 200, flexShrink: 0,
          background: isDark ? 'rgba(255,255,255,0.03)' : '#fff',
          border: `1px solid ${isDark ? 'rgba(255,255,255,0.07)' : 'rgba(0,0,0,0.08)'}`,
          borderRadius: 18, padding: '10px 8px',
          boxShadow: isDark ? 'none' : '0 2px 12px rgba(0,0,0,0.05)',
          position: 'sticky', top: 80,
        }}>
          {TABS.map(tab => (
            <button key={tab.id} className="settings-tab" onClick={() => setActiveTab(tab.id)} style={{
              display: 'flex', alignItems: 'center', gap: 10, width: '100%',
              padding: '11px 14px', borderRadius: 11, border: 'none', cursor: 'pointer', textAlign: 'left',
              background: activeTab === tab.id ? 'linear-gradient(135deg,#6366f1,#a855f7)' : 'transparent',
              color: activeTab === tab.id ? '#fff' : textMuted,
              fontSize: 13.5, fontWeight: 600, fontFamily: 'Outfit, sans-serif', marginBottom: 2,
              boxShadow: activeTab === tab.id ? '0 4px 14px rgba(99,102,241,0.28)' : 'none',
            }}>
              {tab.icon}{tab.label}
            </button>
          ))}
        </div>

        {/* Content */}
        <div style={{ flex: 1, minWidth: 0 }}>

          {/* ── PROFILE ── */}
          {activeTab === 'profile' && (
            <Card isDark={isDark}>
              <h2 style={{ margin: '0 0 24px', fontSize: 18, fontWeight: 700, color: textPrimary, fontFamily: 'Syne, sans-serif' }}>
                Profile Information
              </h2>

              {/* Avatar row */}
              <div style={{ display: 'flex', alignItems: 'center', gap: 20, marginBottom: 28 }}>
                <div style={{ position: 'relative', flexShrink: 0 }}>
                  <div style={{
                    width: 72, height: 72, borderRadius: '50%',
                    background: 'linear-gradient(135deg,#6366f1,#a855f7)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    overflow: 'hidden', fontSize: 26, fontWeight: 800, color: '#fff',
                    fontFamily: 'Syne, sans-serif', boxShadow: '0 6px 18px rgba(99,102,241,0.3)',
                    opacity: avatarLoading ? 0.6 : 1, transition: 'opacity 0.2s',
                  }}>
                    {avatarPreview
                      ? <img src={avatarPreview} alt="avatar" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                      : avatarInitial}
                  </div>
                  <button type="button" onClick={() => fileRef.current?.click()} disabled={avatarLoading} style={{
                    position: 'absolute', bottom: 0, right: 0, width: 26, height: 26, borderRadius: '50%',
                    background: 'linear-gradient(135deg,#6366f1,#a855f7)',
                    border: `2px solid ${isDark ? '#0d0d1a' : '#fff'}`,
                    display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: avatarLoading ? 'not-allowed' : 'pointer', color: '#fff',
                  }}>
                    {avatarLoading ? <Loader2 size={11} style={{ animation: 'spin 1s linear infinite' }} /> : <Camera size={12} />}
                  </button>
                  <input ref={fileRef} type="file" accept="image/*" style={{ display: 'none' }} onChange={handleAvatarChange} />
                </div>

                <div>
                  <p style={{ margin: 0, fontSize: 15, fontWeight: 700, color: textPrimary }}>{currentUserName}</p>
                  <p style={{ margin: '2px 0 4px', fontSize: 12, color: textMuted }}>{currentUserEmail}</p>
                  {currentUserRole && (
                    <p style={{ margin: '0 0 8px', fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.5px', color: '#6366f1' }}>
                      {currentUserRole}
                    </p>
                  )}
                  <button type="button" onClick={() => fileRef.current?.click()} disabled={avatarLoading} style={{
                    display: 'flex', alignItems: 'center', gap: 6, padding: '6px 14px', borderRadius: 8,
                    border: `1px solid ${isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)'}`,
                    background: 'transparent', color: textMuted, cursor: avatarLoading ? 'not-allowed' : 'pointer',
                    fontSize: 12, fontWeight: 600, fontFamily: 'Outfit, sans-serif',
                    opacity: avatarLoading ? 0.5 : 1,
                  }}>
                    {avatarLoading ? <Loader2 size={12} style={{ animation: 'spin 1s linear infinite' }} /> : <Upload size={12} />}
                    {avatarLoading ? 'Uploading…' : 'Upload Photo'}
                  </button>
                </div>
              </div>

              <Field label="Display Name" isDark={isDark}>
                <Input isDark={isDark} value={displayName} onChange={e => setDisplayName(e.target.value)} placeholder="Your full name" />
              </Field>

              <Field label="Email Address" isDark={isDark} hint="Contact your administrator to change your email address.">
                <Input isDark={isDark} type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="you@example.com" disabled />
              </Field>

              <SaveButton loading={profileLoading} onClick={handleSaveProfile} />
            </Card>
          )}

          {/* ── APPEARANCE ── */}
          {activeTab === 'appearance' && (
            <Card isDark={isDark}>
              <h2 style={{ margin: '0 0 24px', fontSize: 18, fontWeight: 700, color: textPrimary, fontFamily: 'Syne, sans-serif' }}>
                Appearance
              </h2>
              <Field label="Theme" isDark={isDark}>
                <div style={{ display: 'flex', gap: 14, marginTop: 4 }}>
                  {[
                    { val: false, label: 'Light', bg: '#f4f7fe', icon: '☀️' },
                    { val: true,  label: 'Dark',  bg: '#0a0d12', icon: '🌙' },
                  ].map(opt => (
                    <button key={String(opt.val)} type="button" className="theme-card"
                      onClick={() => { if (isDark !== opt.val) toggleTheme(); }}
                      style={{
                        flex: 1, padding: '18px 16px', borderRadius: 14, background: opt.bg, cursor: 'pointer',
                        border: `2px solid ${isDark === opt.val ? '#6366f1' : (isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.1)')}`,
                        display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8,
                        transition: 'border-color 0.2s',
                        boxShadow: isDark === opt.val ? '0 0 0 3px rgba(99,102,241,0.2)' : 'none',
                      }}>
                      <span style={{ fontSize: 24 }}>{opt.icon}</span>
                      <span style={{ fontSize: 13, fontWeight: 700, fontFamily: 'Outfit, sans-serif', color: opt.val ? '#e8edf5' : '#1b254b' }}>
                        {opt.label}
                      </span>
                      {isDark === opt.val && (
                        <span style={{ fontSize: 10, fontWeight: 700, letterSpacing: '0.4px', textTransform: 'uppercase', color: '#6366f1', fontFamily: 'Outfit, sans-serif' }}>
                          Active
                        </span>
                      )}
                    </button>
                  ))}
                </div>
              </Field>
              <Field label="Language" isDark={isDark}>
                <div style={{ display: 'flex', gap: 12, marginTop: 4 }}>
                  {[
                    { val: 'en', label: 'English', flag: '🇬🇧' },
                    { val: 'ja', label: '日本語',  flag: '🇯🇵' },
                  ].map(opt => (
                    <button key={opt.val} type="button" onClick={() => handleLangChange(opt.val)} style={{
                      flex: 1, padding: '14px 16px', borderRadius: 12,
                      background: i18n.language === opt.val
                        ? 'linear-gradient(135deg,rgba(99,102,241,0.15),rgba(168,85,247,0.1))'
                        : (isDark ? 'rgba(255,255,255,0.03)' : '#f8f9fe'),
                      border: `2px solid ${i18n.language === opt.val ? '#6366f1' : (isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.1)')}`,
                      cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 10, transition: 'all 0.2s',
                      boxShadow: i18n.language === opt.val ? '0 0 0 3px rgba(99,102,241,0.15)' : 'none',
                    }}>
                      <span style={{ fontSize: 20 }}>{opt.flag}</span>
                      <span style={{ fontSize: 13.5, fontWeight: 700, color: textPrimary, fontFamily: 'Outfit, sans-serif' }}>{opt.label}</span>
                      {i18n.language === opt.val && <Check size={14} color="#6366f1" style={{ marginLeft: 'auto' }} />}
                    </button>
                  ))}
                </div>
              </Field>
            </Card>
          )}

          {/* ── NOTIFICATIONS ── */}
          {activeTab === 'notifications' && (
            <Card isDark={isDark}>
              <h2 style={{ margin: '0 0 6px', fontSize: 18, fontWeight: 700, color: textPrimary, fontFamily: 'Syne, sans-serif' }}>
                Notifications
              </h2>
              <p style={{ margin: '0 0 24px', fontSize: 13.5, color: textMuted }}>Choose what alerts you receive from FlowPOS.</p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                {NOTIF_OPTIONS.map(opt => (
                  <div key={opt.key} className="notif-row" onClick={() => toggleNotif(opt.key)} style={{
                    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                    padding: '16px 14px', borderRadius: 12, cursor: 'pointer', transition: 'background 0.15s',
                  }}>
                    <div style={{ paddingRight: 16 }}>
                      <p style={{ margin: 0, fontSize: 14, fontWeight: 700, color: textPrimary }}>{opt.label}</p>
                      <p style={{ margin: '2px 0 0', fontSize: 12, color: textMuted }}>{opt.desc}</p>
                    </div>
                    <div className="toggle-track" style={{
                      width: 44, height: 24, borderRadius: 12, flexShrink: 0, position: 'relative',
                      background: notifs[opt.key] ? 'linear-gradient(135deg,#6366f1,#a855f7)' : (isDark ? 'rgba(255,255,255,0.1)' : '#e2e8f0'),
                    }}>
                      <div style={{
                        position: 'absolute', top: 3, left: notifs[opt.key] ? 23 : 3,
                        width: 18, height: 18, borderRadius: '50%', background: '#fff',
                        boxShadow: '0 1px 4px rgba(0,0,0,0.2)', transition: 'left 0.22s cubic-bezier(0.4,0,0.2,1)',
                      }} />
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          )}

          {/* ── SECURITY ── */}
          {activeTab === 'security' && (
            <Card isDark={isDark}>
              <h2 style={{ margin: '0 0 6px', fontSize: 18, fontWeight: 700, color: textPrimary, fontFamily: 'Syne, sans-serif' }}>
                Change Password
              </h2>
              <p style={{ margin: '0 0 24px', fontSize: 13.5, color: textMuted }}>Use a strong password you don't use elsewhere.</p>

              <Field label="Current Password" isDark={isDark}>
                <Input isDark={isDark} type={showCurrent ? 'text' : 'password'} value={currentPw}
                  onChange={e => setCurrentPw(e.target.value)} placeholder="Enter current password"
                  rightEl={eyeBtn(showCurrent, setShowCurrent)} />
              </Field>

              <Field label="New Password" isDark={isDark}>
                <Input isDark={isDark} type={showNew ? 'text' : 'password'} value={newPw}
                  onChange={e => setNewPw(e.target.value)} placeholder="Min. 8 characters"
                  rightEl={eyeBtn(showNew, setShowNew)} />
                {newPw && (
                  <div style={{ marginTop: 8 }}>
                    <div style={{ display: 'flex', gap: 4, marginBottom: 4 }}>
                      {[1,2,3,4].map(i => (
                        <div key={i} style={{
                          flex: 1, height: 3, borderRadius: 4, transition: 'background 0.25s',
                          background: i <= strength ? strengthColor : (isDark ? 'rgba(255,255,255,0.1)' : '#e2e8f0'),
                        }} />
                      ))}
                    </div>
                    <p style={{ margin: 0, fontSize: 11.5, color: strengthColor, fontWeight: 700 }}>{strengthLabel}</p>
                  </div>
                )}
              </Field>

              <Field label="Confirm New Password" isDark={isDark}>
                <Input isDark={isDark} type={showConfirm ? 'text' : 'password'} value={confirmPw}
                  onChange={e => setConfirmPw(e.target.value)} placeholder="Re-enter new password"
                  rightEl={eyeBtn(showConfirm, setShowConfirm)} />
                {confirmPw && newPw !== confirmPw && (
                  <p style={{ margin: '5px 0 0', fontSize: 12, color: '#ef4444', fontFamily: 'Outfit, sans-serif', display: 'flex', alignItems: 'center', gap: 4 }}>
                    <AlertCircle size={12} /> Passwords don't match
                  </p>
                )}
              </Field>

              <SaveButton loading={secLoading} onClick={handleChangePassword} label="Update Password" />

              <div style={{
                marginTop: 28, padding: '16px 18px', borderRadius: 12,
                background: isDark ? 'rgba(255,255,255,0.03)' : '#f8f9fe',
                border: `1px solid ${isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.07)'}`,
              }}>
                <p style={{ margin: 0, fontSize: 12.5, fontWeight: 700, color: textPrimary }}>Current Session</p>
                <p style={{ margin: '4px 0 0', fontSize: 12, color: textMuted }}>
                  Signed in as <strong style={{ color: textPrimary }}>{currentUserEmail}</strong>
                </p>
                {currentUserRole && (
                  <p style={{ margin: '2px 0 0', fontSize: 11, color: textMuted }}>
                    Role: <strong style={{ color: textPrimary, textTransform: 'capitalize' }}>{currentUserRole}</strong>
                  </p>
                )}
              </div>
            </Card>
          )}

        </div>
      </div>

      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
    </div>
  );
}