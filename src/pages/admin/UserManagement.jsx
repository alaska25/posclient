/**
 * FlowPOS — UserManagement (Production-ready)
 */

import React, { useState, useEffect, useCallback, useRef, createContext, useContext } from 'react';
import { useTranslation } from 'react-i18next';
import { adminApi } from '../../utils/api';
import api from '../../utils/api';
import { useTheme } from '../../context/ThemeContext';
import { useAuth } from '../../context/AuthContext';
import {
  UserPlus, Trash2, ToggleLeft, ToggleRight,
  KeyRound, RefreshCw, Check, X, Shield,
  Search, ChevronDown, Users, UserCheck, UserX,
  AlertTriangle, Mail, Calendar, Activity, Lock,
  Crown, Zap,
} from 'lucide-react';

/* ─────────────────────────────────────────────────────────────────────────────
   ROLE HIERARCHY
───────────────────────────────────────────────────────────────────────────── */
const ROLE_RANK = { superadmin: 4, admin: 3, supervisor: 2, cashier: 1 };
const ROLES_BY_RANK = ['cashier', 'supervisor', 'admin', 'superadmin'];

const canManage = (actorRole, targetRole) =>
  (ROLE_RANK[actorRole] ?? 0) > (ROLE_RANK[targetRole] ?? 0);

const assignableRoles = (actorRole) =>
  ROLES_BY_RANK.filter(r => (ROLE_RANK[r] ?? 0) < (ROLE_RANK[actorRole] ?? 0));

/* ─────────────────────────────────────────────────────────────────────────────
   CONSTANTS
───────────────────────────────────────────────────────────────────────────── */
const roleMeta = {
  superadmin: {
    label: 'Super Admin',
    color: '#f59e0b',
    bg: 'rgba(245,158,11,.13)',
    border: 'rgba(245,158,11,.28)',
    Icon: Crown,
  },
  admin: {
    label: 'Admin',
    color: '#a855f7',
    bg: 'rgba(168,85,247,.13)',
    border: 'rgba(168,85,247,.28)',
    Icon: Shield,
  },
  supervisor: {
    label: 'Supervisor',
    color: '#06b6d4',
    bg: 'rgba(6,182,212,.13)',
    border: 'rgba(6,182,212,.28)',
    Icon: Zap,
  },
  cashier: {
    label: 'Cashier',
    color: '#6366f1',
    bg: 'rgba(99,102,241,.13)',
    border: 'rgba(99,102,241,.28)',
    Icon: Users,
  },
};

const ALL_ROLES = ['superadmin', 'admin', 'supervisor', 'cashier'];

const AVATAR_COLORS = ['#6366f1','#a855f7','#ec4899','#06b6d4','#10b981','#f59e0b','#ef4444','#3b82f6'];
const avatarColor = name => AVATAR_COLORS[(name?.charCodeAt(0) || 0) % AVATAR_COLORS.length];
const initials = name => name?.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2) || '?';

const timeAgo = date => {
  if (!date) return '—';
  const s = Math.floor((Date.now() - new Date(date)) / 1000);
  if (s < 60)    return `${s}s ago`;
  if (s < 3600)  return `${Math.floor(s / 60)}m ago`;
  if (s < 86400) return `${Math.floor(s / 3600)}h ago`;
  return new Date(date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
};

const isRecentlyActive = date =>
  date && (Date.now() - new Date(date)) < 5 * 60 * 1000;

/* ─────────────────────────────────────────────────────────────────────────────
   DESIGN TOKENS
───────────────────────────────────────────────────────────────────────────── */
const tok = isDark => ({
  bg:           isDark ? '#0d0f18'                  : '#f0f2f7',
  surface:      isDark ? '#13161f'                  : '#ffffff',
  surfaceHover: isDark ? '#1a1d2a'                  : '#f7f8fb',
  surfaceModal: isDark ? '#13161f'                  : '#ffffff',
  surfaceRaised:isDark ? '#1e2132'                  : '#ffffff',
  border:       isDark ? 'rgba(255,255,255,0.07)'   : 'rgba(0,0,0,0.08)',
  borderHover:  isDark ? 'rgba(255,255,255,0.14)'   : 'rgba(0,0,0,0.16)',
  borderFocus:  '#6366f1',
  text:         isDark ? '#eef0f8'                  : '#0f1117',
  textSub:      isDark ? 'rgba(238,240,248,0.55)'   : 'rgba(15,17,23,0.55)',
  textMuted:    isDark ? 'rgba(238,240,248,0.3)'    : 'rgba(15,17,23,0.32)',
  inputBg:      isDark ? 'rgba(255,255,255,0.05)'   : 'rgba(0,0,0,0.035)',
  inputBorder:  isDark ? 'rgba(255,255,255,0.09)'   : 'rgba(0,0,0,0.09)',
  accent:       '#6366f1',
  green:        '#10b981',
  greenBg:      'rgba(16,185,129,0.10)',
  greenBorder:  'rgba(16,185,129,0.25)',
  red:          '#ef4444',
  redBg:        'rgba(239,68,68,0.10)',
  redBorder:    'rgba(239,68,68,0.25)',
  amber:        '#f59e0b',
  amberBg:      'rgba(245,158,11,0.10)',
  amberBorder:  'rgba(245,158,11,0.25)',
  shadow:       isDark ? '0 4px 24px rgba(0,0,0,0.5)' : '0 4px 24px rgba(0,0,0,0.06)',
  shadowSm:     isDark ? '0 2px 8px rgba(0,0,0,0.35)'  : '0 2px 8px rgba(0,0,0,0.05)',
  overlay:      isDark ? 'rgba(0,0,0,0.78)'             : 'rgba(0,0,0,0.48)',
  popoverBg:    isDark ? '#1e2132'                      : '#ffffff',
});

/* ─────────────────────────────────────────────────────────────────────────────
   TOAST SYSTEM
───────────────────────────────────────────────────────────────────────────── */
const ToastContext = createContext(null);

const ToastProvider = ({ children, tk }) => {
  const [toasts, setToasts] = useState([]);

  const notify = useCallback((msg, type = 'success') => {
    const id = Date.now() + Math.random();
    setToasts(p => [...p.slice(-2), { id, msg, type }]);
    setTimeout(() => setToasts(p => p.filter(t => t.id !== id)), 3800);
  }, []);

  const dismiss = id => setToasts(p => p.filter(t => t.id !== id));

  return (
    <ToastContext.Provider value={notify}>
      {children}
      <div style={{ position: 'fixed', bottom: 24, right: 24, zIndex: 200, display: 'flex', flexDirection: 'column', gap: 8, pointerEvents: 'none' }}>
        {toasts.map(t => (
          <div key={t.id} style={{
            display: 'flex', alignItems: 'center', gap: 10,
            padding: '11px 14px', borderRadius: 12, fontSize: 13, fontWeight: 500,
            pointerEvents: 'all', cursor: 'pointer',
            animation: 'slideInRight .25s ease both',
            backdropFilter: 'blur(12px)',
            ...(t.type === 'error'
              ? { background: tk.redBg,   border: `1px solid ${tk.redBorder}`,   color: tk.red,   boxShadow: tk.shadowSm }
              : t.type === 'warn'
              ? { background: tk.amberBg, border: `1px solid ${tk.amberBorder}`, color: tk.amber, boxShadow: tk.shadowSm }
              : { background: tk.greenBg, border: `1px solid ${tk.greenBorder}`, color: tk.green, boxShadow: tk.shadowSm }),
          }} onClick={() => dismiss(t.id)}>
            {t.type === 'error' ? <X size={14}/> : t.type === 'warn' ? <AlertTriangle size={14}/> : <Check size={14}/>}
            {t.msg}
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
};

const useNotify = () => useContext(ToastContext);

/* ─────────────────────────────────────────────────────────────────────────────
   MODAL
───────────────────────────────────────────────────────────────────────────── */
const Modal = ({ children, onClose, tk }) => {
  const ref = useRef();

  useEffect(() => {
    const prev = document.activeElement;
    ref.current?.focus();
    const onKey = e => { if (e.key === 'Escape') onClose(); };
    document.addEventListener('keydown', onKey);
    return () => { document.removeEventListener('keydown', onKey); prev?.focus(); };
  }, [onClose]);

  return (
    <div
      role="dialog" aria-modal="true"
      onClick={e => e.target === e.currentTarget && onClose()}
      style={{ position: 'fixed', inset: 0, zIndex: 100, background: tk.overlay, backdropFilter: 'blur(8px)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16 }}
    >
      <div ref={ref} tabIndex={-1} style={{ background: tk.surfaceModal, border: `1px solid ${tk.border}`, borderRadius: 20, padding: '28px 28px 24px', width: '100%', maxWidth: 440, boxShadow: tk.shadow, outline: 'none', animation: 'popIn .2s ease both' }}>
        {children}
      </div>
    </div>
  );
};

/* ─────────────────────────────────────────────────────────────────────────────
   SHARED SUB-COMPONENTS
───────────────────────────────────────────────────────────────────────────── */
const InputField = ({ label, tk, error, ...props }) => (
  <div style={{ marginBottom: 14 }}>
    {label && <label style={{ display: 'block', fontSize: 11, fontWeight: 700, color: tk.textMuted, letterSpacing: '.5px', textTransform: 'uppercase', marginBottom: 6 }}>{label}</label>}
    <input
      style={{ width: '100%', height: 42, padding: '0 14px', background: tk.inputBg, border: `1px solid ${error ? tk.red : tk.inputBorder}`, borderRadius: 10, fontSize: 13, color: tk.text, outline: 'none', transition: 'border-color .15s', fontFamily: 'inherit' }}
      onFocus={e => e.target.style.borderColor = tk.borderFocus}
      onBlur={e => e.target.style.borderColor = error ? tk.red : tk.inputBorder}
      {...props}
    />
    {error && <p style={{ fontSize: 11, color: tk.red, margin: '4px 0 0' }}>{error}</p>}
  </div>
);

const Btn = ({ variant = 'ghost', tk, style = {}, loading, children, ...props }) => (
  <button
    style={{
      display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: 6,
      padding: '9px 18px', borderRadius: 10, fontSize: 13, fontWeight: 600,
      cursor: props.disabled ? 'not-allowed' : 'pointer', transition: 'all .2s', border: '1px solid',
      opacity: props.disabled ? .5 : 1, fontFamily: 'inherit',
      ...(variant === 'primary'
        ? { background: 'linear-gradient(135deg,#6366f1,#818cf8)', borderColor: 'transparent', color: '#fff', boxShadow: '0 4px 14px rgba(99,102,241,.35)' }
        : variant === 'danger'
        ? { background: tk.redBg, borderColor: tk.redBorder, color: tk.red }
        : { background: 'transparent', borderColor: tk.border, color: tk.textSub }),
      ...style,
    }}
    onMouseEnter={e => { if (!props.disabled) e.currentTarget.style.opacity = '.82'; }}
    onMouseLeave={e => { e.currentTarget.style.opacity = props.disabled ? '.5' : '1'; }}
    {...props}
  >
    {loading ? <span style={{ width: 14, height: 14, border: '2px solid currentColor', borderTopColor: 'transparent', borderRadius: '50%', animation: 'spin .7s linear infinite', display: 'inline-block' }}/> : null}
    {children}
  </button>
);

const RoleBadge = ({ role }) => {
  const m = roleMeta[role] || roleMeta.cashier;
  const { Icon } = m;
  return (
    <span style={{ display: 'inline-flex', alignItems: 'center', gap: 5, padding: '4px 10px', borderRadius: 7, background: m.bg, border: `1px solid ${m.border}`, fontSize: 11, fontWeight: 700, color: m.color, whiteSpace: 'nowrap' }}>
      <Icon size={10}/> {m.label}
    </span>
  );
};

/* ─────────────────────────────────────────────────────────────────────────────
   ROLE POPOVER
───────────────────────────────────────────────────────────────────────────── */
const RolePopover = ({ user, currentUserRole, onChange, tk }) => {
  const [open, setOpen] = useState(false);
  const ref = useRef();
  const allowed = assignableRoles(currentUserRole);
  const canChange = canManage(currentUserRole, user.role) && allowed.length > 0;

  useEffect(() => {
    if (!open) return;
    const close = e => { if (!ref.current?.contains(e.target)) setOpen(false); };
    document.addEventListener('mousedown', close);
    return () => document.removeEventListener('mousedown', close);
  }, [open]);

  const meta = roleMeta[user.role] || roleMeta.cashier;

  if (!canChange) return <RoleBadge role={user.role}/>;

  return (
    <div ref={ref} style={{ position: 'relative', display: 'inline-block' }}>
      <button
        onClick={() => setOpen(o => !o)}
        style={{ display: 'inline-flex', alignItems: 'center', gap: 5, padding: '4px 8px 4px 10px', borderRadius: 7, background: meta.bg, border: `1px solid ${meta.border}`, fontSize: 11, fontWeight: 700, color: meta.color, cursor: 'pointer', transition: 'all .15s' }}
      >
        <meta.Icon size={10}/>
        {meta.label}
        <ChevronDown size={10} style={{ transform: open ? 'rotate(180deg)' : 'none', transition: 'transform .15s' }}/>
      </button>

      {open && (
        <div style={{ position: 'absolute', top: 'calc(100% + 6px)', left: 0, zIndex: 50, background: tk.popoverBg, border: `1px solid ${tk.border}`, borderRadius: 12, padding: 6, boxShadow: tk.shadow, minWidth: 150, animation: 'popIn .15s ease both' }}>
          {allowed.map(r => {
            const m = roleMeta[r];
            const active = user.role === r;
            return (
              <button key={r} onClick={() => { onChange(user._id, r); setOpen(false); }} style={{ display: 'flex', alignItems: 'center', gap: 8, width: '100%', padding: '8px 10px', borderRadius: 8, border: 'none', background: active ? m.bg : 'transparent', color: active ? m.color : tk.textSub, fontSize: 12, fontWeight: active ? 700 : 500, cursor: 'pointer', transition: 'background .1s', textAlign: 'left', fontFamily: 'inherit' }}
                onMouseEnter={e => { if (!active) e.currentTarget.style.background = tk.surfaceHover; }}
                onMouseLeave={e => { if (!active) e.currentTarget.style.background = 'transparent'; }}
              >
                <m.Icon size={12}/> {m.label}
                {active && <Check size={11} style={{ marginLeft: 'auto' }}/>}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
};

/* ─────────────────────────────────────────────────────────────────────────────
   ADD USER MODAL
───────────────────────────────────────────────────────────────────────────── */
const AddUserModal = ({ onClose, onSuccess, currentUserRole, tk }) => {
  const { t } = useTranslation();
  const notify = useNotify();
  const allowed = assignableRoles(currentUserRole);

  const [form, setForm] = useState({ name: '', email: '', password: '', role: allowed[0] || 'cashier' });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const set = f => e => setForm(p => ({ ...p, [f]: e.target.value }));

  const validate = () => {
    const e = {};
    if (!form.name.trim())               e.name     = 'Name is required';
    if (!/\S+@\S+\.\S+/.test(form.email)) e.email   = 'Valid email required';
    if (form.password.length < 6)         e.password = 'Minimum 6 characters';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = async () => {
    if (!validate()) return;
    setLoading(true);
    try {
      const [firstName, ...rest] = form.name.trim().split(' ');
      const lastName = rest.join(' ') || firstName;
      await adminApi.createUser({ firstName, lastName, email: form.email, password: form.password, role: form.role });
      onSuccess();
      notify('Staff member created successfully');
      window.dispatchEvent(new CustomEvent('flowpos:users-updated')); // ✅ dispatch
    } catch (err) {
      notify(err.response?.data?.message || 'Failed to create user', 'error');
    } finally { setLoading(false); }
  };

  return (
    <Modal onClose={onClose} tk={tk}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 22 }}>
        <div style={{ width: 42, height: 42, borderRadius: 12, background: 'rgba(99,102,241,.12)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
          <UserPlus size={18} color="#6366f1"/>
        </div>
        <div>
          <h3 style={{ fontSize: 15, fontWeight: 800, color: tk.text, margin: 0, fontFamily: 'Syne,sans-serif' }}>{t('add_staff', 'Add Staff Member')}</h3>
          <p style={{ fontSize: 12, color: tk.textMuted, margin: '2px 0 0' }}>Create a new account</p>
        </div>
      </div>

      <InputField label="Full Name"  type="text"     placeholder="John Smith"         value={form.name}     onChange={set('name')}     error={errors.name}     tk={tk}/>
      <InputField label="Email"      type="email"    placeholder="john@company.com"   value={form.email}    onChange={set('email')}    error={errors.email}    tk={tk}/>
      <InputField label="Password"   type="password" placeholder="Min. 6 characters" value={form.password} onChange={set('password')} error={errors.password} tk={tk}/>

      <div style={{ marginBottom: 22 }}>
        <label style={{ display: 'block', fontSize: 11, fontWeight: 700, color: tk.textMuted, letterSpacing: '.5px', textTransform: 'uppercase', marginBottom: 6 }}>Role</label>
        <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
          {allowed.map(r => {
            const m = roleMeta[r];
            const active = form.role === r;
            return (
              <button key={r} type="button" onClick={() => setForm(p => ({ ...p, role: r }))} style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '6px 12px', borderRadius: 8, border: `1px solid ${active ? m.border : tk.border}`, background: active ? m.bg : 'transparent', color: active ? m.color : tk.textSub, fontSize: 12, fontWeight: active ? 700 : 500, cursor: 'pointer', transition: 'all .15s', fontFamily: 'inherit' }}>
                <m.Icon size={11}/> {m.label}
              </button>
            );
          })}
        </div>
      </div>

      <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
        <Btn onClick={onClose} tk={tk}>Cancel</Btn>
        <Btn variant="primary" tk={tk} onClick={handleSubmit} loading={loading} disabled={loading}>
          {loading ? 'Creating…' : 'Create Staff'}
        </Btn>
      </div>
    </Modal>
  );
};

/* ─────────────────────────────────────────────────────────────────────────────
   RESET PASSWORD MODAL
───────────────────────────────────────────────────────────────────────────── */
const ResetModal = ({ user, onClose, onConfirm, tk }) => {
  const { t } = useTranslation();
  const [pw, setPw] = useState('');
  const [show, setShow] = useState(false);
  const [loading, setLoading] = useState(false);

  const handle = async () => {
    if (pw.length < 6) return;
    setLoading(true);
    await onConfirm(pw);
    setLoading(false);
  };

  return (
    <Modal onClose={onClose} tk={tk}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 22 }}>
        <div style={{ width: 42, height: 42, borderRadius: 12, background: 'rgba(99,102,241,.12)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
          <KeyRound size={18} color="#6366f1"/>
        </div>
        <div>
          <h3 style={{ fontSize: 15, fontWeight: 800, color: tk.text, margin: 0, fontFamily: 'Syne,sans-serif' }}>{t('reset_password', 'Reset Password')}</h3>
          <p style={{ fontSize: 12, color: tk.textMuted, margin: '2px 0 0' }}>
            for <strong style={{ color: tk.textSub }}>{user.name}</strong>
          </p>
        </div>
      </div>

      <div style={{ position: 'relative', marginBottom: 22 }}>
        <InputField label={t('new_password', 'New Password')} type={show ? 'text' : 'password'} placeholder="Minimum 6 characters" value={pw} onChange={e => setPw(e.target.value)} tk={tk}/>
        <button onClick={() => setShow(s => !s)} style={{ position: 'absolute', right: 12, top: 33, background: 'none', border: 'none', color: tk.textMuted, cursor: 'pointer', fontSize: 11, fontWeight: 600 }}>
          {show ? 'Hide' : 'Show'}
        </button>
      </div>

      <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
        <Btn onClick={onClose} tk={tk}>Cancel</Btn>
        <Btn variant="primary" tk={tk} onClick={handle} loading={loading} disabled={pw.length < 6 || loading}>
          {loading ? 'Resetting…' : t('reset_password', 'Reset Password')}
        </Btn>
      </div>
    </Modal>
  );
};

/* ─────────────────────────────────────────────────────────────────────────────
   DELETE CONFIRM MODAL
───────────────────────────────────────────────────────────────────────────── */
const DeleteModal = ({ user, onClose, onConfirm, tk }) => {
  const { t } = useTranslation();
  const [loading, setLoading] = useState(false);

  const handle = async () => {
    setLoading(true);
    await onConfirm();
    setLoading(false);
  };

  return (
    <Modal onClose={onClose} tk={tk}>
      <div style={{ textAlign: 'center', padding: '4px 0 20px' }}>
        <div style={{ width: 52, height: 52, borderRadius: 16, background: tk.redBg, border: `1px solid ${tk.redBorder}`, display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 14px' }}>
          <AlertTriangle size={22} color={tk.red}/>
        </div>
        <h3 style={{ fontSize: 16, fontWeight: 800, color: tk.text, margin: '0 0 8px', fontFamily: 'Syne,sans-serif' }}>Delete Staff Member?</h3>
        <p style={{ fontSize: 13, color: tk.textSub, margin: '0 0 6px' }}>
          You're about to permanently delete <strong style={{ color: tk.text }}>{user.name}</strong>.
        </p>
        <p style={{ fontSize: 12, color: tk.textMuted, margin: 0 }}>This will remove all their login access. This action cannot be undone.</p>
      </div>
      <div style={{ display: 'flex', gap: 8 }}>
        <Btn onClick={onClose} tk={tk} style={{ flex: 1 }}>{t('cancel', 'Cancel')}</Btn>
        <Btn variant="danger" tk={tk} onClick={handle} loading={loading} disabled={loading} style={{ flex: 1 }}>
          {loading ? 'Deleting…' : `Delete ${user.name.split(' ')[0]}`}
        </Btn>
      </div>
    </Modal>
  );
};

/* ─────────────────────────────────────────────────────────────────────────────
   STAT CARD
───────────────────────────────────────────────────────────────────────────── */
const StatCard = ({ icon, label, value, color, bg, border }) => (
  <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '14px 18px', background: bg, border: `1px solid ${border}`, borderRadius: 14, flexShrink: 0, transition: 'transform .15s' }}
    onMouseEnter={e => e.currentTarget.style.transform = 'translateY(-1px)'}
    onMouseLeave={e => e.currentTarget.style.transform = 'none'}
  >
    <span style={{ color }}>{icon}</span>
    <div>
      <p style={{ fontSize: 22, fontWeight: 800, color, margin: 0, fontFamily: 'Syne,sans-serif', lineHeight: 1 }}>{value}</p>
      <p style={{ fontSize: 10, fontWeight: 700, color, opacity: .65, margin: '3px 0 0', textTransform: 'uppercase', letterSpacing: '.5px' }}>{label}</p>
    </div>
  </div>
);

/* ─────────────────────────────────────────────────────────────────────────────
   FILTER PILL
───────────────────────────────────────────────────────────────────────────── */
const FilterPill = ({ active, onClick, children, tk }) => (
  <button onClick={onClick} style={{ padding: '6px 14px', borderRadius: 20, fontSize: 12, fontWeight: 600, cursor: 'pointer', transition: 'all .2s', border: `1px solid ${active ? '#6366f1' : tk.border}`, background: active ? '#6366f1' : 'transparent', color: active ? '#fff' : tk.textSub, fontFamily: 'inherit' }}>
    {children}
  </button>
);

/* ─────────────────────────────────────────────────────────────────────────────
   USER ROW
───────────────────────────────────────────────────────────────────────────── */
const UserRow = ({ user, currentUser, tk, onRoleChange, onToggle, onResetPassword, onDelete, isLast }) => {
  const isSelf     = user._id === currentUser?._id;
  const canAct     = !isSelf && canManage(currentUser?.role, user.role);
  const recentlyOn = isRecentlyActive(user.lastLogin);
  const color      = avatarColor(user.name);

  return (
    <div
      style={{ display: 'grid', gridTemplateColumns: '2.4fr 1.1fr 1fr 1fr 1fr 96px', padding: '14px 20px', alignItems: 'center', borderBottom: isLast ? 'none' : `1px solid ${tk.border}`, transition: 'background .12s' }}
      onMouseEnter={e => e.currentTarget.style.background = tk.surfaceHover}
      onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
    >
      {/* Avatar + info */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, minWidth: 0 }}>
        <div style={{ position: 'relative', flexShrink: 0 }}>
          <div style={{ width: 38, height: 38, borderRadius: 11, background: `${color}18`, border: `1.5px solid ${color}40`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, fontWeight: 800, color, fontFamily: 'Syne,sans-serif' }}>
            {initials(user.name)}
          </div>
          {recentlyOn && (
            <span style={{ position: 'absolute', bottom: -1, right: -1, width: 10, height: 10, borderRadius: '50%', background: '#10b981', border: `2px solid ${tk.surface}` }}>
              <span style={{ position: 'absolute', inset: 0, borderRadius: '50%', background: '#10b981', animation: 'ping 1.5s ease-out infinite' }}/>
            </span>
          )}
        </div>
        <div style={{ minWidth: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <p style={{ fontSize: 13, fontWeight: 600, color: tk.text, margin: 0, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{user.name}</p>
            {isSelf && <span style={{ fontSize: 9, fontWeight: 700, color: '#6366f1', background: 'rgba(99,102,241,.12)', border: '1px solid rgba(99,102,241,.25)', borderRadius: 5, padding: '1px 5px', letterSpacing: '.3px' }}>YOU</span>}
          </div>
          <p style={{ fontSize: 11, color: tk.textMuted, margin: '2px 0 0', display: 'flex', alignItems: 'center', gap: 4, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
            <Mail size={10}/> {user.email}
          </p>
        </div>
      </div>

      {/* Role popover */}
      <RolePopover user={user} currentUserRole={currentUser?.role} onChange={onRoleChange} tk={tk}/>

      {/* Status toggle */}
      {canAct ? (
        <button
          onClick={() => onToggle(user._id)}
          title={user.isActive ? 'Click to deactivate' : 'Click to activate'}
          style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '5px 11px', borderRadius: 8, border: 'none', fontSize: 11, fontWeight: 700, cursor: 'pointer', transition: 'all .2s', ...(user.isActive ? { background: 'rgba(16,185,129,.1)', color: '#10b981' } : { background: 'rgba(239,68,68,.1)', color: '#ef4444' }) }}
        >
          {user.isActive ? <ToggleRight size={14}/> : <ToggleLeft size={14}/>}
          {user.isActive ? 'Active' : 'Inactive'}
        </button>
      ) : (
        <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '5px 11px', borderRadius: 8, fontSize: 11, fontWeight: 700, ...(user.isActive ? { color: '#10b981' } : { color: '#ef4444' }) }}>
          {user.isActive ? <ToggleRight size={14}/> : <ToggleLeft size={14}/>}
          {user.isActive ? 'Active' : 'Inactive'}
        </span>
      )}

      {/* Last login */}
      <p style={{ fontSize: 12, color: recentlyOn ? '#10b981' : tk.textSub, margin: 0, display: 'flex', alignItems: 'center', gap: 5, fontWeight: recentlyOn ? 600 : 400 }}>
        <Activity size={11} color={recentlyOn ? '#10b981' : tk.textMuted}/>
        {timeAgo(user.lastLogin)}
      </p>

      {/* Joined */}
      <p style={{ fontSize: 12, color: tk.textSub, margin: 0, display: 'flex', alignItems: 'center', gap: 5 }}>
        <Calendar size={11} color={tk.textMuted}/>
        {user.createdAt ? new Date(user.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : '—'}
      </p>

      {/* Actions */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 4, justifyContent: 'flex-end' }}>
        {canAct ? (
          <>
            <ActionBtn icon={<KeyRound size={14}/>} title="Reset password" hoverColor="#6366f1" onClick={() => onResetPassword(user)} tk={tk}/>
            <ActionBtn icon={<Trash2 size={14}/>}   title="Delete user"    hoverColor="#ef4444" onClick={() => onDelete(user)}        tk={tk}/>
          </>
        ) : (
          <span title={isSelf ? "Can't modify your own account" : "Insufficient permissions"} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: 32, height: 32, borderRadius: 8, color: tk.textMuted, cursor: 'default' }}>
            <Lock size={13}/>
          </span>
        )}
      </div>
    </div>
  );
};

const ActionBtn = ({ icon, title, hoverColor, onClick, tk }) => (
  <button onClick={onClick} title={title} aria-label={title} style={{ width: 32, height: 32, borderRadius: 8, border: `1px solid ${tk.border}`, background: 'transparent', display: 'flex', alignItems: 'center', justifyContent: 'center', color: tk.textMuted, cursor: 'pointer', transition: 'all .15s' }}
    onMouseEnter={e => { e.currentTarget.style.borderColor = `${hoverColor}55`; e.currentTarget.style.color = hoverColor; e.currentTarget.style.background = `${hoverColor}12`; }}
    onMouseLeave={e => { e.currentTarget.style.borderColor = tk.border; e.currentTarget.style.color = tk.textMuted; e.currentTarget.style.background = 'transparent'; }}
  >
    {icon}
  </button>
);

/* ─────────────────────────────────────────────────────────────────────────────
   MAIN COMPONENT
───────────────────────────────────────────────────────────────────────────── */
function UserManagementInner() {
  const { t, i18n }      = useTranslation();
  const { theme }        = useTheme();
  const isDark           = theme === 'dark';
  const tk               = tok(isDark);
  const notify           = useNotify();

  const { user: currentUser } = useAuth();

  const [users,        setUsers]        = useState([]);
  const [loading,      setLoading]      = useState(true);
  const [error,        setError]        = useState(null);
  const [spinning,     setSpinning]     = useState(false);
  const [search,       setSearch]       = useState('');
  const [filterRole,   setFilterRole]   = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');
  const [resetTarget,  setResetTarget]  = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [showAdd,      setShowAdd]      = useState(false);
  const [, forceUpdate]                 = useState(0);

  useEffect(() => {
    const h = () => forceUpdate(n => n + 1);
    i18n.on('languageChanged', h);
    return () => i18n.off('languageChanged', h);
  }, [i18n]);

  /* ── Fetch ── */
  const fetchUsers = useCallback(async () => {
    setSpinning(true);
    if (!users.length) setLoading(true);
    setError(null);
    try {
      const res = await adminApi.getUsers();
      setUsers(res.data.data);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load users');
    } finally {
      setLoading(false);
      setTimeout(() => setSpinning(false), 600);
    }
  }, [users.length]);

  useEffect(() => { fetchUsers(); }, []);

  /* ── Handlers ── */
  const handleRoleChange = async (id, role) => {
    const target = users.find(u => u._id === id);
    if (!target || !canManage(currentUser?.role, target.role)) {
      notify(`You cannot change this user's role.`, 'error'); return;
    }
    try {
      await adminApi.changeRole(id, role);
      setUsers(u => u.map(x => x._id === id ? { ...x, role } : x));
      notify(`Role updated to ${roleMeta[role]?.label || role}`);
      window.dispatchEvent(new CustomEvent('flowpos:users-updated')); // ✅ dispatch
    } catch (err) { notify(err.response?.data?.message || 'Failed to update role', 'error'); }
  };

  const handleToggle = async (id) => {
    const target = users.find(u => u._id === id);
    if (!target || !canManage(currentUser?.role, target.role)) {
      notify(`You cannot change this user's status.`, 'error'); return;
    }
    try {
      const res = await adminApi.toggleStatus(id);
      setUsers(u => u.map(x => x._id === id ? { ...x, isActive: res.data.data.isActive } : x));
      notify(res.data.message || 'Status updated');
      window.dispatchEvent(new CustomEvent('flowpos:users-updated')); // ✅ dispatch
    } catch (err) { notify(err.response?.data?.message || 'Failed', 'error'); }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    try {
      await adminApi.hardDelete(deleteTarget._id);
      setUsers(u => u.filter(x => x._id !== deleteTarget._id));
      setDeleteTarget(null);
      notify('Staff member permanently deleted');
      window.dispatchEvent(new CustomEvent('flowpos:users-updated')); // ✅ dispatch
    } catch (err) { notify(err.response?.data?.message || 'Failed', 'error'); }
  };

  const handleResetPassword = async (password) => {
    try {
      await adminApi.resetPassword(resetTarget._id, password);
      setResetTarget(null);
      notify('Password reset successfully');
    } catch (err) { notify(err.response?.data?.message || 'Failed', 'error'); }
  };

  /* ── Derived ── */
  const filtered = users.filter(u => {
    const q = search.toLowerCase();
    const matchSearch = u.name?.toLowerCase().includes(q) || u.email?.toLowerCase().includes(q);
    const matchRole   = filterRole   === 'all' || u.role === filterRole;
    const matchStatus = filterStatus === 'all' || (filterStatus === 'active' ? u.isActive : !u.isActive);
    return matchSearch && matchRole && matchStatus;
  });

  const total    = users.length;
  const active   = users.filter(u => u.isActive).length;
  const inactive = users.filter(u => !u.isActive).length;

  const canAddStaff = assignableRoles(currentUser?.role).length > 0;

  /* ── CSS ── */
  const globalCss = `
    @import url('https://fonts.googleapis.com/css2?family=Syne:wght@600;700;800&family=Figtree:wght@300;400;500;600&display=swap');
    * { box-sizing: border-box; }
    @keyframes fadeUp      { from { opacity:0; transform:translateY(10px) } to { opacity:1; transform:translateY(0) } }
    @keyframes spin        { to   { transform:rotate(360deg) } }
    @keyframes popIn       { from { opacity:0; transform:scale(.96) } to { opacity:1; transform:scale(1) } }
    @keyframes slideInRight{ from { opacity:0; transform:translateX(16px) } to { opacity:1; transform:translateX(0) } }
    @keyframes ping        { 0%   { opacity:.9; transform:scale(1) } 75%,100% { opacity:0; transform:scale(2) } }
    select option { background: ${isDark ? '#13161f' : '#ffffff'}; color: ${tk.text}; }
    ::-webkit-scrollbar { width:5px; height:5px; }
    ::-webkit-scrollbar-track { background:transparent; }
    ::-webkit-scrollbar-thumb { background:${tk.border}; border-radius:10px; }
  `;

  return (
    <div style={{ padding: '28px 28px 60px', fontFamily: 'Figtree,sans-serif', minHeight: '100vh', background: tk.bg, color: tk.text }}>
      <style>{globalCss}</style>

      <div style={{ maxWidth: 1200, margin: '0 auto' }}>

        {/* ── Header ── */}
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 24, animation: 'fadeUp .3s ease both' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 7, marginBottom: 6 }}>
              <Shield size={12} color={tk.accent}/>
              <span style={{ fontSize: 10, fontWeight: 700, color: tk.accent, letterSpacing: '.9px', textTransform: 'uppercase' }}>Admin · User Management</span>
            </div>
            <h1 style={{ fontSize: 26, fontWeight: 800, color: tk.text, margin: 0, fontFamily: 'Syne,sans-serif', letterSpacing: '-.5px' }}>
              Staff Members
            </h1>
            <p style={{ fontSize: 12, color: tk.textMuted, margin: '4px 0 0' }}>
              {total} account{total !== 1 ? 's' : ''} registered
            </p>
          </div>
          <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
            <button onClick={fetchUsers} title="Refresh" aria-label="Refresh user list" style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '8px 14px', borderRadius: 10, border: `1px solid ${tk.border}`, background: tk.surface, color: tk.textSub, fontSize: 12, fontWeight: 600, cursor: 'pointer', transition: 'all .2s', fontFamily: 'inherit' }}
              onMouseEnter={e => { e.currentTarget.style.borderColor = tk.borderHover; e.currentTarget.style.color = tk.text; }}
              onMouseLeave={e => { e.currentTarget.style.borderColor = tk.border; e.currentTarget.style.color = tk.textSub; }}
            >
              <RefreshCw size={13} style={{ animation: spinning ? 'spin .7s linear infinite' : 'none' }}/> Refresh
            </button>
            {canAddStaff && (
              <button onClick={() => setShowAdd(true)} style={{ display: 'flex', alignItems: 'center', gap: 7, padding: '8px 18px', borderRadius: 10, border: 'none', background: 'linear-gradient(135deg,#6366f1,#818cf8)', color: '#fff', fontSize: 12, fontWeight: 700, cursor: 'pointer', boxShadow: '0 4px 14px rgba(99,102,241,.35)', transition: 'opacity .2s, box-shadow .2s', fontFamily: 'inherit' }}
                onMouseEnter={e => { e.currentTarget.style.opacity = '.88'; e.currentTarget.style.boxShadow = '0 6px 20px rgba(99,102,241,.45)'; }}
                onMouseLeave={e => { e.currentTarget.style.opacity = '1'; e.currentTarget.style.boxShadow = '0 4px 14px rgba(99,102,241,.35)'; }}
              >
                <UserPlus size={14}/> Add Staff
              </button>
            )}
          </div>
        </div>

        {/* ── Stat Cards ── */}
        <div style={{ display: 'flex', gap: 12, marginBottom: 22, flexWrap: 'wrap', animation: 'fadeUp .35s ease both', animationDelay: '40ms' }}>
          <StatCard icon={<Users size={20}/>}     label="Total"    value={total}    color="#6366f1" bg="rgba(99,102,241,.08)"  border="rgba(99,102,241,.16)"/>
          <StatCard icon={<UserCheck size={20}/>} label="Active"   value={active}   color="#10b981" bg="rgba(16,185,129,.08)"  border="rgba(16,185,129,.16)"/>
          <StatCard icon={<UserX size={20}/>}     label="Inactive" value={inactive} color="#ef4444" bg="rgba(239,68,68,.08)"   border="rgba(239,68,68,.16)"/>
        </div>

        {/* ── Search + Filters ── */}
        <div style={{ display: 'flex', gap: 10, marginBottom: 14, flexWrap: 'wrap', animation: 'fadeUp .38s ease both', animationDelay: '60ms' }}>
          <div style={{ position: 'relative', flex: 1, minWidth: 220 }}>
            <Search size={14} color={tk.textMuted} style={{ position: 'absolute', left: 13, top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none' }}/>
            <input
              type="text" placeholder="Search by name or email…"
              value={search} onChange={e => setSearch(e.target.value)}
              aria-label="Search staff"
              style={{ width: '100%', height: 40, padding: '0 14px 0 38px', background: tk.surface, border: `1px solid ${tk.border}`, borderRadius: 10, fontSize: 13, color: tk.text, outline: 'none', transition: 'border-color .15s', fontFamily: 'inherit' }}
              onFocus={e => e.target.style.borderColor = tk.borderFocus}
              onBlur={e => e.target.style.borderColor = tk.border}
            />
          </div>
          <div style={{ display: 'flex', gap: 6, alignItems: 'center', flexWrap: 'wrap' }}>
            <FilterPill active={filterRole === 'all'} onClick={() => setFilterRole('all')} tk={tk}>All Roles</FilterPill>
            {ALL_ROLES.map(r => <FilterPill key={r} active={filterRole === r} onClick={() => setFilterRole(r)} tk={tk}>{roleMeta[r]?.label || r}</FilterPill>)}
            <div style={{ width: 1, height: 20, background: tk.border, margin: '0 2px' }}/>
            <FilterPill active={filterStatus === 'all'}      onClick={() => setFilterStatus('all')}      tk={tk}>All</FilterPill>
            <FilterPill active={filterStatus === 'active'}   onClick={() => setFilterStatus('active')}   tk={tk}>Active</FilterPill>
            <FilterPill active={filterStatus === 'inactive'} onClick={() => setFilterStatus('inactive')} tk={tk}>Inactive</FilterPill>
          </div>
        </div>

        {/* ── Table ── */}
        <div style={{ background: tk.surface, border: `1px solid ${tk.border}`, borderRadius: 16, overflow: 'hidden', boxShadow: tk.shadow, animation: 'fadeUp .4s ease both', animationDelay: '90ms' }}>

          {/* Head */}
          <div style={{ display: 'grid', gridTemplateColumns: '2.4fr 1.1fr 1fr 1fr 1fr 96px', padding: '11px 20px', borderBottom: `1px solid ${tk.border}`, background: isDark ? 'rgba(255,255,255,.022)' : 'rgba(0,0,0,.022)' }}>
            {['Staff Member', 'Role', 'Status', 'Last Login', 'Joined', 'Actions'].map((h, i) => (
              <span key={h} style={{ fontSize: 10, fontWeight: 700, color: tk.textMuted, letterSpacing: '.7px', textTransform: 'uppercase', textAlign: i === 5 ? 'right' : 'left' }}>{h}</span>
            ))}
          </div>

          {/* Body */}
          {loading ? (
            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', padding: 56, gap: 14 }}>
              <div style={{ width: 28, height: 28, border: `3px solid ${tk.border}`, borderTopColor: tk.accent, borderRadius: '50%', animation: 'spin .8s linear infinite' }}/>
              <span style={{ color: tk.textMuted, fontSize: 13 }}>Loading staff…</span>
            </div>
          ) : error ? (
            <div style={{ padding: 40, textAlign: 'center' }}>
              <div style={{ width: 48, height: 48, borderRadius: 14, background: tk.redBg, border: `1px solid ${tk.redBorder}`, display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 12px' }}>
                <AlertTriangle size={20} color={tk.red}/>
              </div>
              <p style={{ color: tk.red, fontSize: 13, margin: '0 0 12px', fontWeight: 600 }}>{error}</p>
              <Btn variant="primary" tk={tk} onClick={fetchUsers}>Try Again</Btn>
            </div>
          ) : filtered.length === 0 ? (
            <div style={{ padding: 56, textAlign: 'center' }}>
              <Users size={36} color={tk.textMuted} style={{ marginBottom: 12, opacity: .5 }}/>
              <p style={{ color: tk.textMuted, fontSize: 14, margin: '0 0 4px', fontWeight: 600 }}>
                {search ? 'No results found' : 'No staff members yet'}
              </p>
              <p style={{ color: tk.textMuted, fontSize: 12, margin: 0, opacity: .7 }}>
                {search ? `Nothing matched "${search}"` : 'Click "Add Staff" to create the first account.'}
              </p>
            </div>
          ) : (
            filtered.map((u, i) => (
              <UserRow
                key={u._id}
                user={u}
                currentUser={currentUser}
                tk={tk}
                onRoleChange={handleRoleChange}
                onToggle={handleToggle}
                onResetPassword={u => setResetTarget(u)}
                onDelete={u => setDeleteTarget(u)}
                isLast={i === filtered.length - 1}
              />
            ))
          )}

          {/* Footer */}
          {filtered.length > 0 && (
            <div style={{ padding: '10px 20px', borderTop: `1px solid ${tk.border}`, background: isDark ? 'rgba(255,255,255,.012)' : 'rgba(0,0,0,.018)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <span style={{ fontSize: 11, color: tk.textMuted }}>
                Showing <strong style={{ color: tk.textSub }}>{filtered.length}</strong> of <strong style={{ color: tk.textSub }}>{total}</strong> staff members
              </span>
              {(search || filterRole !== 'all' || filterStatus !== 'all') && (
                <button onClick={() => { setSearch(''); setFilterRole('all'); setFilterStatus('all'); }} style={{ fontSize: 11, color: tk.accent, background: 'none', border: 'none', cursor: 'pointer', fontWeight: 700, fontFamily: 'inherit' }}>
                  Clear filters
                </button>
              )}
            </div>
          )}
        </div>

        {/* ── Permissions hint ── */}
        {currentUser && (
          <span style={{ fontSize: 11, color: tk.textMuted, margin: '12px 0 0', textAlign: 'right', display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: 6 }}>
            Logged in as <strong style={{ color: tk.textSub }}>{currentUser.name}</strong> · <RoleBadge role={currentUser.role}/>
          </span>
        )}
      </div>

      {/* ── Modals ── */}
      {resetTarget  && <ResetModal  user={resetTarget}  onClose={() => setResetTarget(null)}  onConfirm={handleResetPassword} tk={tk}/>}
      {deleteTarget && <DeleteModal user={deleteTarget} onClose={() => setDeleteTarget(null)} onConfirm={handleDelete}         tk={tk}/>}
      {showAdd      && <AddUserModal onClose={() => setShowAdd(false)} onSuccess={() => { setShowAdd(false); fetchUsers(); }} currentUserRole={currentUser?.role} tk={tk}/>}
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────────────────────
   ROOT EXPORT
───────────────────────────────────────────────────────────────────────────── */
export default function UserManagement() {
  const { theme } = useTheme();
  const tk = tok(theme === 'dark');
  return (
    <ToastProvider tk={tk}>
      <UserManagementInner/>
    </ToastProvider>
  );
}