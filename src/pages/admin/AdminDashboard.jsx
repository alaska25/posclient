import React, { useEffect, useState, useCallback } from 'react';
import { adminApi } from '../../utils/api';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import { formatCurrency } from '../../utils/format';
import {
  Users, ShieldCheck, TrendingUp, Briefcase,
  FileText, UserCheck, DollarSign, RefreshCw,
  Activity, ArrowUpRight, AlertTriangle, CheckCircle,
  BarChart2, Zap, Globe, Crown, Shield,
  UserX, Bell, Clock, ChevronRight, Wifi, WifiOff,
} from 'lucide-react';

/* ─────────────────────────────────────────────────────────────────────────────
   POLLING INTERVALS
───────────────────────────────────────────────────────────────────────────── */
const INTERVAL_DASHBOARD  = 60_000;  // base dashboard  — every 60s
const INTERVAL_SUPERADMIN = 15_000;  // superadmin data — every 15s
const INTERVAL_HEALTH     = 30_000;  // system health   — every 30s

/* ─────────────────────────────────────────────────────────────────────────────
   HELPERS
───────────────────────────────────────────────────────────────────────────── */
const fmt = (n) =>
  n >= 1_000_000 ? `${(n / 1_000_000).toFixed(1)}M`
  : n >= 1_000   ? `${(n / 1_000).toFixed(1)}K`
  : String(n ?? 0);

const timeAgo = (date) => {
  if (!date) return '—';
  const s = Math.floor((Date.now() - new Date(date)) / 1000);
  if (s < 60)    return `${s}s ago`;
  if (s < 3600)  return `${Math.floor(s / 60)}m ago`;
  if (s < 86400) return `${Math.floor(s / 3600)}h ago`;
  return `${Math.floor(s / 86400)}d ago`;
};

/* ─────────────────────────────────────────────────────────────────────────────
   DESIGN TOKENS
───────────────────────────────────────────────────────────────────────────── */
const tok = (isDark) => ({
  bg:           isDark ? '#0f1117'                   : '#f4f5f7',
  surface:      isDark ? '#181b24'                   : '#ffffff',
  surfaceHover: isDark ? '#1e2230'                   : '#f0f1f4',
  border:       isDark ? 'rgba(255,255,255,0.07)'    : 'rgba(0,0,0,0.08)',
  borderHover:  isDark ? 'rgba(255,255,255,0.15)'    : 'rgba(0,0,0,0.18)',
  text:         isDark ? '#f0f2f8'                   : '#111827',
  textSub:      isDark ? 'rgba(240,242,248,0.5)'     : 'rgba(17,24,39,0.5)',
  textMuted:    isDark ? 'rgba(240,242,248,0.28)'    : 'rgba(17,24,39,0.35)',
  accent:       '#6366f1',
  green:        '#10b981',
  greenBg:      'rgba(16,185,129,0.10)',
  greenBorder:  'rgba(16,185,129,0.20)',
  red:          '#ef4444',
  redBg:        'rgba(239,68,68,0.10)',
  redBorder:    'rgba(239,68,68,0.20)',
  amber:        '#f59e0b',
  amberBg:      'rgba(245,158,11,0.10)',
  amberBorder:  'rgba(245,158,11,0.20)',
  shadow:       isDark ? '0 2px 16px rgba(0,0,0,0.45)' : '0 2px 16px rgba(0,0,0,0.07)',
  shadowHover:  isDark ? '0 6px 28px rgba(0,0,0,0.6)'  : '0 6px 28px rgba(0,0,0,0.13)',
});

/* ─────────────────────────────────────────────────────────────────────────────
   ROLE META
───────────────────────────────────────────────────────────────────────────── */
const roleMeta = {
  superadmin: { label: 'Super Admin', color: '#f59e0b', bg: 'rgba(245,158,11,.13)', border: 'rgba(245,158,11,.28)', Icon: Crown   },
  admin:      { label: 'Admin',       color: '#a855f7', bg: 'rgba(168,85,247,.13)', border: 'rgba(168,85,247,.28)', Icon: Shield  },
  supervisor: { label: 'Supervisor',  color: '#06b6d4', bg: 'rgba(6,182,212,.13)',  border: 'rgba(6,182,212,.28)',  Icon: Zap     },
  cashier:    { label: 'Cashier',     color: '#6366f1', bg: 'rgba(99,102,241,.13)', border: 'rgba(99,102,241,.28)', Icon: Users   },
};

const AVATAR_COLORS = ['#6366f1','#a855f7','#ec4899','#06b6d4','#10b981','#f59e0b','#ef4444','#3b82f6'];
const avatarColor = (name) => AVATAR_COLORS[(name?.charCodeAt(0) || 0) % AVATAR_COLORS.length];
const initials    = (name) => name?.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2) || '?';

/* ─────────────────────────────────────────────────────────────────────────────
   COUNTDOWN RING
───────────────────────────────────────────────────────────────────────────── */
const CountdownRing = ({ seconds, total, color }) => {
  const r    = 10;
  const circ = 2 * Math.PI * r;
  const pct  = seconds / total;
  return (
    <svg width={26} height={26} style={{ transform: 'rotate(-90deg)', flexShrink: 0 }}>
      <circle cx={13} cy={13} r={r} fill="none" stroke="rgba(128,128,128,0.12)" strokeWidth={2.5} />
      <circle cx={13} cy={13} r={r} fill="none" stroke={color} strokeWidth={2.5}
        strokeDasharray={circ}
        strokeDashoffset={circ * (1 - pct)}
        strokeLinecap="round"
        style={{ transition: 'stroke-dashoffset 1s linear' }}
      />
    </svg>
  );
};

/* ─────────────────────────────────────────────────────────────────────────────
   SKELETON LOADER
───────────────────────────────────────────────────────────────────────────── */
const Skeleton = ({ tk, rows = 4 }) => (
  <div style={{ padding: '12px 22px', display: 'flex', flexDirection: 'column', gap: 10 }}>
    {Array.from({ length: rows }).map((_, i) => (
      <div key={i} style={{
        height: 38, borderRadius: 8,
        background: `linear-gradient(90deg, ${tk.border} 25%, ${tk.surfaceHover} 50%, ${tk.border} 75%)`,
        backgroundSize: '200% 100%',
        animation: 'shimmer 1.4s ease infinite',
        animationDelay: `${i * 80}ms`,
      }} />
    ))}
  </div>
);

/* ─────────────────────────────────────────────────────────────────────────────
   STAT CARD
───────────────────────────────────────────────────────────────────────────── */
const StatCard = ({ label, value, sub, icon, gradient, prefix = '', suffix = '', delay = 0, tk, highlight, pulse }) => {
  const [hov, setHov] = useState(false);
  return (
    <div
      onMouseEnter={() => setHov(true)}
      onMouseLeave={() => setHov(false)}
      style={{
        background: highlight
          ? (hov ? 'rgba(245,158,11,0.10)' : 'rgba(245,158,11,0.06)')
          : tk.surface,
        border: `1px solid ${highlight ? 'rgba(245,158,11,0.30)' : hov ? tk.borderHover : tk.border}`,
        borderRadius: 14, padding: '20px 22px',
        display: 'flex', flexDirection: 'column', gap: 14,
        transition: 'all .2s',
        boxShadow: hov ? tk.shadowHover : tk.shadow,
        transform: hov ? 'translateY(-2px)' : 'translateY(0)',
        animation: 'fadeUp .4s ease both',
        animationDelay: `${delay}ms`,
        cursor: 'default', position: 'relative', overflow: 'hidden',
      }}
    >
      {highlight && (
        <div style={{ position: 'absolute', top: 8, right: 10, fontSize: 9, fontWeight: 800, color: '#f59e0b', background: 'rgba(245,158,11,0.15)', border: '1px solid rgba(245,158,11,0.3)', borderRadius: 5, padding: '2px 6px', letterSpacing: '.5px', textTransform: 'uppercase' }}>
          Superadmin
        </div>
      )}
      {pulse && (
        <div style={{ position: 'absolute', top: highlight ? 32 : 10, right: 10, width: 7, height: 7, borderRadius: '50%', background: '#10b981', animation: 'pulse 2s infinite' }} />
      )}
      <div style={{ position: 'absolute', top: -20, right: -20, width: 70, height: 70, borderRadius: '50%', background: gradient, opacity: .07, filter: 'blur(16px)', pointerEvents: 'none' }} />
      <div style={{ width: 38, height: 38, borderRadius: 10, background: gradient, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', flexShrink: 0 }}>
        {icon}
      </div>
      <div>
        <p style={{ fontSize: 11, color: tk.textMuted, margin: '0 0 4px', letterSpacing: '.6px', textTransform: 'uppercase', fontWeight: 700 }}>{label}</p>
        <p style={{ fontSize: 26, fontWeight: 800, color: tk.text, margin: '0 0 2px', fontFamily: 'Syne,sans-serif', letterSpacing: '-1px', lineHeight: 1 }}>
          {prefix}{value}{suffix}
        </p>
        {sub && <p style={{ fontSize: 11, color: tk.textSub, margin: 0 }}>{sub}</p>}
      </div>
    </div>
  );
};

/* ─────────────────────────────────────────────────────────────────────────────
   SECTION HEADER
───────────────────────────────────────────────────────────────────────────── */
const SectionHeader = ({ title, sub, icon, tk, badge, lastSync, spinning }) => (
  <div style={{ padding: '14px 22px', borderBottom: `1px solid ${tk.border}`, display: 'flex', alignItems: 'center', gap: 8 }}>
    <span style={{ color: tk.textMuted }}>{icon}</span>
    <div style={{ flex: 1 }}>
      <h2 style={{ fontSize: 14, fontWeight: 700, color: tk.text, margin: 0, fontFamily: 'Syne,sans-serif' }}>{title}</h2>
      {sub && <p style={{ fontSize: 11, color: tk.textMuted, margin: '1px 0 0' }}>{sub}</p>}
    </div>
    {lastSync && (
      <span style={{ fontSize: 10, color: tk.textMuted, display: 'flex', alignItems: 'center', gap: 4 }}>
        <RefreshCw size={9} style={{ animation: spinning ? 'spin .7s linear infinite' : 'none' }} />
        {timeAgo(lastSync)}
      </span>
    )}
    {badge && (
      <span style={{ fontSize: 9, fontWeight: 800, color: '#f59e0b', background: 'rgba(245,158,11,0.13)', border: '1px solid rgba(245,158,11,0.28)', borderRadius: 5, padding: '2px 7px', letterSpacing: '.5px', textTransform: 'uppercase', flexShrink: 0 }}>
        Superadmin
      </span>
    )}
  </div>
);

/* ─────────────────────────────────────────────────────────────────────────────
   ROLE BADGE
───────────────────────────────────────────────────────────────────────────── */
const RoleBadge = ({ role }) => {
  const m = roleMeta[role] || roleMeta.cashier;
  const { Icon } = m;
  return (
    <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4, padding: '3px 8px', borderRadius: 6, background: m.bg, border: `1px solid ${m.border}`, fontSize: 10, fontWeight: 700, color: m.color, whiteSpace: 'nowrap' }}>
      <Icon size={9}/> {m.label}
    </span>
  );
};

/* ─────────────────────────────────────────────────────────────────────────────
   MAIN COMPONENT
───────────────────────────────────────────────────────────────────────────── */
export default function AdminDashboard() {
  const { user }  = useAuth();
  const { theme } = useTheme();
  const isDark    = theme === 'dark';
  const tk        = tok(isDark);

  const isSuperAdmin = user?.role === 'superadmin';

  /* ── Base dashboard state ── */
  const [data,          setData]          = useState(null);
  const [loading,       setLoading]       = useState(true);
  const [error,         setError]         = useState(null);
  const [lastDashSync,  setLastDashSync]  = useState(null);
  const [dashSpinning,  setDashSpinning]  = useState(false);
  const [dashCountdown, setDashCountdown] = useState(INTERVAL_DASHBOARD / 1000);

  /* ── System health state ── */
  const [health,          setHealth]          = useState(null);
  const [healthLoading,   setHealthLoading]   = useState(true);
  const [healthCountdown, setHealthCountdown] = useState(INTERVAL_HEALTH / 1000);

  /* ── Superadmin real-time state ── */
  const [saUsers,     setSaUsers]     = useState([]);
  const [saActivity,  setSaActivity]  = useState([]);
  const [saAlerts,    setSaAlerts]    = useState([]);
  const [saRoleDist,  setSaRoleDist]  = useState({});
  const [saLoading,   setSaLoading]   = useState(false);
  const [saError,     setSaError]     = useState(null);
  const [lastSaSync,  setLastSaSync]  = useState(null);
  const [saSpinning,  setSaSpinning]  = useState(false);
  const [saCountdown, setSaCountdown] = useState(INTERVAL_SUPERADMIN / 1000);

  /* ── Network state ── */
  const [online, setOnline] = useState(navigator.onLine);

  useEffect(() => {
    const on  = () => setOnline(true);
    const off = () => setOnline(false);
    window.addEventListener('online',  on);
    window.addEventListener('offline', off);
    return () => { window.removeEventListener('online', on); window.removeEventListener('offline', off); };
  }, []);

  /* ────────────────────────────────────────────────────────────────────────
     FETCH SYSTEM HEALTH
  ─────────────────────────────────────────────────────────────────────── */
  const fetchHealth = useCallback(async () => {
    try {
      const res = await adminApi.getHealth();
      setHealth(res.data.data);
      setHealthCountdown(INTERVAL_HEALTH / 1000);
    } catch {
      setHealth(null);
    } finally {
      setHealthLoading(false);
    }
  }, []);

  /* ────────────────────────────────────────────────────────────────────────
     FETCH BASE DASHBOARD
  ─────────────────────────────────────────────────────────────────────── */
  const fetchDashboard = useCallback(async (silent = false) => {
    if (!silent) setDashSpinning(true);
    setError(null);
    if (!data) setLoading(true);
    try {
      const res = await adminApi.getDashboard();
      setData(res.data.data);
      setLastDashSync(new Date());
      setDashCountdown(INTERVAL_DASHBOARD / 1000);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load dashboard');
    } finally {
      setLoading(false);
      if (!silent) setTimeout(() => setDashSpinning(false), 700);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  /* ────────────────────────────────────────────────────────────────────────
     FETCH SUPERADMIN REAL-TIME DATA
  ─────────────────────────────────────────────────────────────────────── */
  const fetchSuperadminData = useCallback(async (silent = false) => {
    if (!isSuperAdmin) return;
    if (!silent) setSaSpinning(true);
    setSaError(null);
    if (!saUsers.length) setSaLoading(true);
    try {
      const [usersRes, dashRes] = await Promise.all([
        adminApi.getUsers(),
        adminApi.getDashboard(),
      ]);

      const users = usersRes.data.data || [];
      setSaUsers(users);

      const dist = users.reduce((acc, u) => {
        acc[u.role] = (acc[u.role] || 0) + 1;
        return acc;
      }, {});
      setSaRoleDist(dist);

      const dash = dashRes.data.data || {};

      if (dash.adminActivityLog?.length) {
        setSaActivity(dash.adminActivityLog);
      } else {
        const derived = users
          .filter(u => ['superadmin', 'admin', 'supervisor'].includes(u.role) && u.lastLogin)
          .sort((a, b) => new Date(b.lastLogin) - new Date(a.lastLogin))
          .slice(0, 8)
          .map(u => ({
            _id:       u._id,
            userName:  u.name,
            userRole:  u.role,
            action:    u.isActive ? 'Last session recorded' : 'Account currently inactive',
            createdAt: u.lastLogin,
          }));
        setSaActivity(derived);
      }

      setSaAlerts(dash.alerts || []);
      setData(dash);
      setLastSaSync(new Date());
      setSaCountdown(INTERVAL_SUPERADMIN / 1000);
    } catch (err) {
      setSaError(err.response?.data?.message || 'Failed to load live data');
    } finally {
      setSaLoading(false);
      if (!silent) setTimeout(() => setSaSpinning(false), 700);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isSuperAdmin]);

  /* ── Initial fetches ── */
  useEffect(() => { fetchDashboard(); }, []);
  useEffect(() => { fetchHealth(); },    []);
  useEffect(() => { if (isSuperAdmin) fetchSuperadminData(); }, [isSuperAdmin]);

  /* ── Dashboard auto-refresh (60s) ── */
  useEffect(() => {
    const id = setInterval(() => fetchDashboard(true), INTERVAL_DASHBOARD);
    return () => clearInterval(id);
  }, [fetchDashboard]);

  /* ── Health auto-refresh (30s) ── */
  useEffect(() => {
    const id = setInterval(() => fetchHealth(), INTERVAL_HEALTH);
    return () => clearInterval(id);
  }, [fetchHealth]);

  /* ── Superadmin auto-refresh (15s) ── */
  useEffect(() => {
    if (!isSuperAdmin) return;
    const id = setInterval(() => fetchSuperadminData(true), INTERVAL_SUPERADMIN);
    return () => clearInterval(id);
  }, [isSuperAdmin, fetchSuperadminData]);

  /* ── Dashboard countdown ticker ── */
  useEffect(() => {
    const id = setInterval(() => setDashCountdown(c => Math.max(0, c - 1)), 1000);
    return () => clearInterval(id);
  }, []);

  /* ── Health countdown ticker ── */
  useEffect(() => {
    const id = setInterval(() => setHealthCountdown(c => Math.max(0, c - 1)), 1000);
    return () => clearInterval(id);
  }, []);

  /* ── Superadmin countdown ticker ── */
  useEffect(() => {
    if (!isSuperAdmin) return;
    const id = setInterval(() => setSaCountdown(c => Math.max(0, c - 1)), 1000);
    return () => clearInterval(id);
  }, [isSuperAdmin]);

  /* ── Manual refresh all ── */
  const handleRefreshAll = () => {
    fetchDashboard();
    fetchHealth();
    if (isSuperAdmin) fetchSuperadminData();
  };

  /* ── Instant refresh when UserManagement makes a change ── */
  useEffect(() => {
    const handler = () => fetchSuperadminData(true);
    window.addEventListener('flowpos:users-updated', handler);
    return () => window.removeEventListener('flowpos:users-updated', handler);
  }, [fetchSuperadminData]);

  /* ── CSS ── */
  const globalCss = `
    @import url('https://fonts.googleapis.com/css2?family=Syne:wght@600;700;800&family=Figtree:wght@300;400;500;600&display=swap');
    * { box-sizing: border-box; }
    @keyframes fadeUp  { from { opacity:0; transform:translateY(10px) } to { opacity:1; transform:translateY(0) } }
    @keyframes spin    { to { transform:rotate(360deg) } }
    @keyframes pulse   { 0%,100% { opacity:1 } 50% { opacity:.35 } }
    @keyframes shimmer { 0% { background-position:-200% center } 100% { background-position:200% center } }
    @keyframes wave    {
      0%,100% { transform:rotate(0deg) }
      15%     { transform:rotate(18deg) }
      30%     { transform:rotate(-8deg) }
      45%     { transform:rotate(16deg) }
      60%     { transform:rotate(-4deg) }
      75%     { transform:rotate(12deg) }
    }
  `;

  /* ── Loading ── */
  if (loading) return (
    <div style={{ display:'flex', alignItems:'center', justifyContent:'center', height:'60vh', flexDirection:'column', gap:14, background:tk.bg }}>
      <style>{globalCss}</style>
      <div style={{ width:34, height:34, border:`3px solid ${tk.border}`, borderTopColor:tk.accent, borderRadius:'50%', animation:'spin .8s linear infinite' }} />
      <p style={{ color:tk.textMuted, fontSize:13, fontFamily:'Figtree,sans-serif' }}>Loading dashboard…</p>
    </div>
  );

  /* ── Fatal error (no data at all) ── */
  if (error && !data) return (
    <div style={{ padding:32, background:tk.bg, minHeight:'100vh' }}>
      <style>{globalCss}</style>
      <div style={{ padding:'14px 18px', background:tk.redBg, border:`1px solid rgba(239,68,68,.3)`, borderRadius:12, color:tk.red, fontSize:13, display:'flex', alignItems:'center', gap:10 }}>
        <AlertTriangle size={15} /> {error}
        <button onClick={handleRefreshAll} style={{ marginLeft:'auto', fontSize:12, color:tk.red, background:'none', border:`1px solid ${tk.red}50`, borderRadius:8, padding:'4px 12px', cursor:'pointer', fontFamily:'inherit' }}>
          Retry
        </button>
      </div>
    </div>
  );

  const stats = data || {};

  /* ── Health-derived values ── */
  const healthScore     = health?.score ?? null;
  const healthScoreColor =
    healthScore === null ? tk.textMuted
    : healthScore >= 90  ? tk.green
    : healthScore >= 60  ? tk.amber
    : tk.red;

  const healthSub = healthLoading
    ? 'Checking…'
    : health
      ? `${health.db.connected ? '🟢 DB' : '🔴 DB'} · Mem ${health.memory.memPercent}% · Up ${health.uptime}`
      : '⚠️ Health check failed';

  /* ── Derived superadmin values ── */
  const totalAdmins   = saUsers.filter(u => u.role === 'admin').length;
  const inactiveUsers = saUsers.filter(u => !u.isActive).length;
  const activeAdmins  = saUsers.filter(u => u.role === 'admin' && u.isActive).length;

  const roleDistRows = [
    { role: 'superadmin', count: saRoleDist.superadmin ?? 0 },
    { role: 'admin',      count: saRoleDist.admin      ?? 0 },
    { role: 'supervisor', count: saRoleDist.supervisor ?? 0 },
    { role: 'cashier',    count: saRoleDist.cashier    ?? 0 },
  ];
  const maxRoleDist = Math.max(...roleDistRows.map(r => r.count), 1);

  /* ── Stat cards ── */
  const baseCards = [
    { label:'Total Users',     value:fmt(stats.totalUsers),              icon:<Users size={17}/>,      gradient:'linear-gradient(135deg,#6366f1,#a78bfa)', sub:`${stats.activeUsers ?? 0} active`,  pulse:true },
    { label:'Active Users',    value:fmt(stats.activeUsers),             icon:<UserCheck size={17}/>,  gradient:'linear-gradient(135deg,#10b981,#34d399)', sub:'Currently enabled'                             },
    { label:'Total Customers', value:fmt(stats.totalCustomers),          icon:<Globe size={17}/>,      gradient:'linear-gradient(135deg,#06b6d4,#38bdf8)', sub:'Registered clients'                            },
    { label:'Total Jobs',      value:fmt(stats.totalJobs),               icon:<Briefcase size={17}/>,  gradient:'linear-gradient(135deg,#f59e0b,#fbbf24)', sub:'All work orders'                               },
    { label:'Total Invoices',  value:fmt(stats.totalInvoices),           icon:<FileText size={17}/>,   gradient:'linear-gradient(135deg,#f97316,#fb923c)', sub:'Issued invoices'                               },
    { label:'Total Services',  value:fmt(stats.totalServices),           icon:<Zap size={17}/>,        gradient:'linear-gradient(135deg,#a855f7,#c084fc)', sub:'Service catalogue'                             },
    { label:'Total Revenue',   value:formatCurrency(stats.totalRevenue), icon:<DollarSign size={17}/>, gradient:'linear-gradient(135deg,#059669,#10b981)', sub:'All-time collected'                            },
    {
      label:    'System Health',
      value:    healthScore !== null ? healthScore : '—',
      icon:     <Activity size={17}/>,
      gradient: `linear-gradient(135deg,${healthScoreColor === tk.green ? '#10b981,#34d399' : healthScoreColor === tk.amber ? '#f59e0b,#fbbf24' : healthScoreColor === tk.red ? '#ef4444,#f87171' : '#3b82f6,#60a5fa'})`,
      suffix:   healthScore !== null ? '%' : '',
      sub:      healthSub,
      pulse:    true,
    },
  ];

  const superadminCards = isSuperAdmin ? [
    { label:'Total Admins',   value:fmt(totalAdmins),    icon:<Shield size={17}/>, gradient:'linear-gradient(135deg,#a855f7,#d946ef)', sub:`${activeAdmins} active`,   highlight:true, pulse:true },
    { label:'Pending Alerts', value:fmt(saAlerts.length),icon:<Bell size={17}/>,   gradient:'linear-gradient(135deg,#f59e0b,#f97316)', sub:'Require attention',          highlight:true, pulse:saAlerts.length > 0 },
    { label:'Inactive Users', value:fmt(inactiveUsers),  icon:<UserX size={17}/>,  gradient:'linear-gradient(135deg,#ef4444,#f87171)', sub:'Disabled accounts',          highlight:true },
  ] : [];

  const cards = [...baseCards, ...superadminCards];

  /* ── Shared panel data ── */
  const recentPayments = stats.recentPayments || [];

  const metricRows = [
    { label:'Total Users',     value:stats.totalUsers     ?? 0, icon:<Users size={13}/>,     color:'#6366f1' },
    { label:'Active Users',    value:stats.activeUsers    ?? 0, icon:<UserCheck size={13}/>, color:'#10b981' },
    { label:'Total Customers', value:stats.totalCustomers ?? 0, icon:<Globe size={13}/>,     color:'#06b6d4' },
    { label:'Total Jobs',      value:stats.totalJobs      ?? 0, icon:<Briefcase size={13}/>, color:'#f59e0b' },
    { label:'Total Invoices',  value:stats.totalInvoices  ?? 0, icon:<FileText size={13}/>,  color:'#f97316' },
    { label:'Total Services',  value:stats.totalServices  ?? 0, icon:<Zap size={13}/>,       color:'#a855f7' },
  ];
  const maxMetric = Math.max(...metricRows.map(r => r.value), 1);

  const revenueRows = [
    { label:'Total Revenue',    value:formatCurrency(stats.totalRevenue),      color:tk.green,  icon:<TrendingUp size={14}/> },
    { label:'Monthly Revenue',  value:formatCurrency(stats.monthRevenue || 0), color:tk.accent, icon:<BarChart2 size={14}/>  },
    { label:'Overdue Invoices', value:stats.overdueInvoices ?? 0,              color:tk.red,    icon:<AlertTriangle size={14}/>, isBadge:true },
  ];

  /* ── Real-time status rows from health data ── */
  const statusRows = [
    {
      label: 'API Server',
      ok:    !!health,
      note:  health ? `${health.uptime} uptime` : healthLoading ? 'Checking…' : 'Unreachable',
    },
    {
      label: 'Database',
      ok:    health?.db?.connected ?? false,
      note:  health
        ? (health.db.connected ? 'Connected' : 'Disconnected')
        : healthLoading ? 'Checking…' : '—',
    },
    {
      label: 'Authentication',
      ok:    !!health,
      note:  null,
    },
    {
      label: 'Memory Usage',
      ok:    health ? health.memory.memPercent < 90 : false,
      note:  health
        ? `${health.memory.heapUsedMB}MB / ${health.memory.heapTotalMB}MB (${health.memory.memPercent}%)`
        : healthLoading ? 'Checking…' : '—',
    },
    {
      label: 'Payment Module',
      ok:    true,
      note:  null,
    },
    {
      label: 'Scheduled Jobs',
      ok:    !!health,
      note:  null,
    },
  ];

  return (
    <div style={{ padding:28, fontFamily:'Figtree,sans-serif', minHeight:'100vh', background:tk.bg, color:tk.text }}>
      <style>{globalCss}</style>

      <div style={{ maxWidth:1280, margin:'0 auto' }}>

        {/* ── Offline banner ── */}
        {!online && (
          <div style={{ display:'flex', alignItems:'center', gap:8, padding:'10px 16px', background:tk.amberBg, border:`1px solid ${tk.amberBorder}`, borderRadius:10, marginBottom:14, fontSize:12, color:tk.amber, fontWeight:600, animation:'fadeUp .3s ease both' }}>
            <WifiOff size={13}/> You are offline — data may be stale. Reconnect to resume live updates.
          </div>
        )}

        {/* ── Non-fatal error banner ── */}
        {error && data && (
          <div style={{ display:'flex', alignItems:'center', gap:8, padding:'10px 16px', background:tk.redBg, border:`1px solid ${tk.redBorder}`, borderRadius:10, marginBottom:14, fontSize:12, color:tk.red, fontWeight:600, animation:'fadeUp .3s ease both' }}>
            <AlertTriangle size={13}/> Dashboard refresh failed: {error}
          </div>
        )}

        {/* ── Header ── */}
        <div style={{ display:'flex', alignItems:'flex-start', justifyContent:'space-between', marginBottom:28, animation:'fadeUp .35s ease both' }}>
          <div>
            <div style={{ display:'flex', alignItems:'center', gap:8, marginBottom:6 }}>
              <div style={{ width:28, height:28, borderRadius:7, background:isSuperAdmin ? 'linear-gradient(135deg,#f59e0b,#d97706)' : 'linear-gradient(135deg,#6366f1,#a855f7)', display:'flex', alignItems:'center', justifyContent:'center' }}>
                {isSuperAdmin ? <Crown size={14} color="#fff"/> : <ShieldCheck size={14} color="#fff"/>}
              </div>
              <span style={{ fontSize:11, fontWeight:700, color:isSuperAdmin ? '#f59e0b' : tk.accent, letterSpacing:'.8px', textTransform:'uppercase' }}>
                {isSuperAdmin ? 'Superadmin Control Panel' : 'Admin Control Panel'}
              </span>
            </div>
            <h1 style={{ fontSize:26, fontWeight:800, color:tk.text, fontFamily:'Syne,sans-serif', letterSpacing:'-.5px', lineHeight:1.1 }}>
              Welcome back, {user?.name?.split(' ')[0] || 'Admin'}{' '}
              <span style={{ display:'inline-block', animation:'wave 1.8s ease-in-out infinite', transformOrigin:'70% 70%' }}>👋</span>
            </h1>
            <p style={{ fontSize:12, color:tk.textMuted, marginTop:4 }}>
              {lastDashSync ? `Dashboard synced ${timeAgo(lastDashSync)}` : 'Connecting…'}
              {isSuperAdmin && lastSaSync ? ` · Live data ${timeAgo(lastSaSync)}` : ''}
              {health ? ` · Health ${healthScore}%` : ''}
            </p>
          </div>

          <div style={{ display:'flex', alignItems:'center', gap:8, flexShrink:0 }}>
            {/* Online / offline pill */}
            <div style={{ display:'flex', alignItems:'center', gap:5, padding:'5px 10px', background:online ? tk.greenBg : tk.amberBg, border:`1px solid ${online ? tk.greenBorder : tk.amberBorder}`, borderRadius:20 }}>
              {online ? <Wifi size={11} color={tk.green}/> : <WifiOff size={11} color={tk.amber}/>}
              <span style={{ fontSize:11, fontWeight:600, color:online ? tk.green : tk.amber }}>{online ? 'Online' : 'Offline'}</span>
            </div>

            {/* Dashboard countdown */}
            <div title={`Dashboard refreshes in ${dashCountdown}s`} style={{ display:'flex', alignItems:'center', gap:5, padding:'4px 10px', background:tk.surface, border:`1px solid ${tk.border}`, borderRadius:20 }}>
              <CountdownRing seconds={dashCountdown} total={INTERVAL_DASHBOARD / 1000} color={tk.accent}/>
              <span style={{ fontSize:10, color:tk.textMuted, fontWeight:600 }}>{dashCountdown}s</span>
            </div>

            {/* Health countdown */}
            <div title={`Health check in ${healthCountdown}s`} style={{ display:'flex', alignItems:'center', gap:5, padding:'4px 10px', background:tk.surface, border:`1px solid ${tk.border}`, borderRadius:20 }}>
              <CountdownRing seconds={healthCountdown} total={INTERVAL_HEALTH / 1000} color={healthScoreColor}/>
              <span style={{ fontSize:10, color:tk.textMuted, fontWeight:600 }}>
                <Activity size={9} style={{ display:'inline', marginRight:2 }}/>{healthCountdown}s
              </span>
            </div>

            {/* Superadmin live countdown */}
            {isSuperAdmin && (
              <div title={`Live data refreshes in ${saCountdown}s`} style={{ display:'flex', alignItems:'center', gap:5, padding:'4px 10px', background:'rgba(245,158,11,0.08)', border:'1px solid rgba(245,158,11,0.22)', borderRadius:20 }}>
                <CountdownRing seconds={saCountdown} total={INTERVAL_SUPERADMIN / 1000} color="#f59e0b"/>
                <span style={{ fontSize:10, color:'#f59e0b', fontWeight:600 }}>{saCountdown}s</span>
              </div>
            )}

            <button
              onClick={handleRefreshAll}
              title="Refresh all data now"
              style={{ display:'flex', alignItems:'center', gap:6, padding:'7px 14px', borderRadius:10, background:tk.surface, border:`1px solid ${tk.border}`, color:tk.textSub, fontSize:12, fontWeight:600, cursor:'pointer', transition:'all .2s', fontFamily:'inherit' }}
              onMouseEnter={e => { e.currentTarget.style.borderColor = tk.borderHover; e.currentTarget.style.color = tk.text; }}
              onMouseLeave={e => { e.currentTarget.style.borderColor = tk.border;      e.currentTarget.style.color = tk.textSub; }}
            >
              <RefreshCw size={13} style={{ animation:(dashSpinning || saSpinning) ? 'spin .7s linear infinite' : 'none' }}/>
              Refresh
            </button>
          </div>
        </div>

        {/* ── Stat Cards ── */}
        <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit,minmax(210px,1fr))', gap:12, marginBottom:20 }}>
          {cards.map((c, i) => <StatCard key={i} {...c} delay={i * 40} tk={tk}/>)}
        </div>

        {/* ── Base 2×2 Grid ── */}
        <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:14, marginBottom: isSuperAdmin ? 14 : 0 }}>

          {/* Recent Payments */}
          <div style={{ background:tk.surface, border:`1px solid ${tk.border}`, borderRadius:14, overflow:'hidden', boxShadow:tk.shadow, animation:'fadeUp .4s ease both', animationDelay:'320ms' }}>
            <SectionHeader title="Recent Payments" sub="Latest transactions" icon={<TrendingUp size={14}/>} tk={tk} lastSync={lastDashSync} spinning={dashSpinning}/>
            {recentPayments.length === 0 ? (
              <div style={{ padding:32, textAlign:'center', color:tk.textMuted, fontSize:13 }}>No payments yet.</div>
            ) : recentPayments.slice(0, 5).map((p, i) => (
              <div key={p._id}
                style={{ padding:'11px 22px', display:'flex', alignItems:'center', justifyContent:'space-between', borderBottom: i < Math.min(recentPayments.length, 5) - 1 ? `1px solid ${tk.border}` : 'none', transition:'background .15s' }}
                onMouseEnter={e => e.currentTarget.style.background = tk.surfaceHover}
                onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
              >
                <div style={{ display:'flex', alignItems:'center', gap:11 }}>
                  <div style={{ width:33, height:33, borderRadius:9, background:tk.greenBg, border:`1px solid ${tk.greenBorder}`, display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0 }}>
                    <DollarSign size={14} color={tk.green}/>
                  </div>
                  <div>
                    <p style={{ fontSize:13, fontWeight:600, color:tk.text, margin:0 }}>{p.customer?.name || `TXN-${p._id?.slice(-6).toUpperCase()}`}</p>
                    <p style={{ fontSize:11, color:tk.textMuted, margin:'1px 0 0' }}>{p.invoice?.invoiceNumber || `#${p._id?.slice(-6).toUpperCase()}`} · {timeAgo(p.createdAt)}</p>
                  </div>
                </div>
                <div style={{ display:'flex', alignItems:'center', gap:6 }}>
                  <span style={{ fontSize:14, fontWeight:700, color:tk.green, fontFamily:'Syne,sans-serif' }}>{formatCurrency(p.amount)}</span>
                  <ArrowUpRight size={13} color={tk.greenBorder}/>
                </div>
              </div>
            ))}
          </div>

          {/* Platform Metrics */}
          <div style={{ background:tk.surface, border:`1px solid ${tk.border}`, borderRadius:14, overflow:'hidden', boxShadow:tk.shadow, animation:'fadeUp .4s ease both', animationDelay:'360ms' }}>
            <SectionHeader title="Platform Metrics" sub="Relative usage breakdown" icon={<BarChart2 size={14}/>} tk={tk} lastSync={lastDashSync} spinning={dashSpinning}/>
            <div style={{ padding:'8px 0' }}>
              {metricRows.map((row, i, arr) => {
                const pct = Math.round((row.value / maxMetric) * 100);
                return (
                  <div key={row.label}
                    style={{ padding:'9px 22px', borderBottom: i < arr.length - 1 ? `1px solid ${tk.border}` : 'none', transition:'background .15s' }}
                    onMouseEnter={e => e.currentTarget.style.background = tk.surfaceHover}
                    onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                  >
                    <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:5 }}>
                      <div style={{ display:'flex', alignItems:'center', gap:6, color:row.color }}>
                        {row.icon}
                        <span style={{ fontSize:12, color:tk.textSub, fontWeight:500 }}>{row.label}</span>
                      </div>
                      <span style={{ fontSize:12, fontWeight:700, color:tk.text, fontFamily:'Syne,sans-serif' }}>{row.value}</span>
                    </div>
                    <div style={{ height:4, background:tk.border, borderRadius:4, overflow:'hidden' }}>
                      <div style={{ height:'100%', width:`${pct}%`, background:row.color, borderRadius:4, opacity:.75, transition:'width .6s ease' }}/>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Revenue Summary */}
          <div style={{ background:tk.surface, border:`1px solid ${tk.border}`, borderRadius:14, overflow:'hidden', boxShadow:tk.shadow, animation:'fadeUp .4s ease both', animationDelay:'400ms' }}>
            <SectionHeader title="Revenue Summary" sub="Financial snapshot" icon={<DollarSign size={14}/>} tk={tk} lastSync={lastDashSync} spinning={dashSpinning}/>
            <div style={{ padding:'18px 22px', display:'flex', flexDirection:'column', gap:10 }}>
              {revenueRows.map(row => (
                <div key={row.label} style={{ display:'flex', alignItems:'center', justifyContent:'space-between', padding:'12px 16px', background: isDark ? 'rgba(255,255,255,0.025)' : 'rgba(0,0,0,0.025)', border:`1px solid ${tk.border}`, borderRadius:10 }}>
                  <div style={{ display:'flex', alignItems:'center', gap:7, color:row.color }}>
                    {row.icon}
                    <span style={{ fontSize:12, color:tk.textSub, fontWeight:500 }}>{row.label}</span>
                  </div>
                  <span style={{ fontSize:row.isBadge ? 13 : 15, fontWeight:800, color:row.color, fontFamily:'Syne,sans-serif' }}>{row.value}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Platform Status — now powered by real health data */}
          <div style={{ background:tk.surface, border:`1px solid ${tk.border}`, borderRadius:14, overflow:'hidden', boxShadow:tk.shadow, animation:'fadeUp .4s ease both', animationDelay:'440ms' }}>
            <SectionHeader
              title="Platform Status"
              sub={health ? `Last checked ${timeAgo(health.timestamp)} · ${healthScore}% healthy` : healthLoading ? 'Running health check…' : 'Health check unavailable'}
              icon={<Activity size={14}/>}
              tk={tk}
              lastSync={lastDashSync}
              spinning={dashSpinning}
            />
            {healthLoading ? (
              <Skeleton tk={tk} rows={6}/>
            ) : (
              <div style={{ padding:'16px 22px', display:'flex', flexDirection:'column', gap:8 }}>
                {statusRows.map(item => (
                  <div key={item.label} style={{ display:'flex', alignItems:'center', justifyContent:'space-between', padding:'8px 14px', borderRadius:9, background: isDark ? 'rgba(255,255,255,0.025)' : 'rgba(0,0,0,0.02)', border:`1px solid ${tk.border}` }}>
                    <span style={{ fontSize:12, color:tk.textSub, fontWeight:500 }}>{item.label}</span>
                    <div style={{ display:'flex', alignItems:'center', gap:8 }}>
                      {item.note && (
                        <span style={{ fontSize:10, color:tk.textMuted }}>{item.note}</span>
                      )}
                      <div style={{ display:'flex', alignItems:'center', gap:5, color: item.ok ? tk.green : tk.red }}>
                        {item.ok ? <CheckCircle size={13}/> : <AlertTriangle size={13}/>}
                        <span style={{ fontSize:11, fontWeight:600 }}>{item.ok ? 'Operational' : 'Degraded'}</span>
                      </div>
                    </div>
                  </div>
                ))}
                {/* Health score bar */}
                {health && (
                  <div style={{ marginTop:4, padding:'10px 14px', borderRadius:9, background: isDark ? 'rgba(255,255,255,0.025)' : 'rgba(0,0,0,0.02)', border:`1px solid ${tk.border}` }}>
                    <div style={{ display:'flex', justifyContent:'space-between', marginBottom:6 }}>
                      <span style={{ fontSize:11, color:tk.textSub, fontWeight:600 }}>Overall Health Score</span>
                      <span style={{ fontSize:12, fontWeight:800, color:healthScoreColor, fontFamily:'Syne,sans-serif' }}>{healthScore}%</span>
                    </div>
                    <div style={{ height:5, background:tk.border, borderRadius:5, overflow:'hidden' }}>
                      <div style={{ height:'100%', width:`${healthScore}%`, background:healthScoreColor, borderRadius:5, transition:'width .8s ease' }}/>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>

        </div>

        {/* ══════════════════════════════════════════════════════════════════
            SUPERADMIN REAL-TIME PANELS
        ══════════════════════════════════════════════════════════════════ */}
        {isSuperAdmin && (
          <>
            {/* ── Divider ── */}
            <div style={{ display:'flex', alignItems:'center', gap:10, margin:'8px 0 14px', animation:'fadeUp .4s ease both', animationDelay:'460ms' }}>
              <Crown size={13} color="#f59e0b"/>
              <span style={{ fontSize:11, fontWeight:800, color:'#f59e0b', letterSpacing:'.8px', textTransform:'uppercase' }}>
                Superadmin · Live Data
              </span>
              <div style={{ flex:1, height:1, background:'rgba(245,158,11,0.2)' }}/>
              <span style={{ fontSize:10, color:'#f59e0b', opacity:.65 }}>Refreshes every {INTERVAL_SUPERADMIN / 1000}s</span>
            </div>

            {/* ── Superadmin error banner ── */}
            {saError && (
              <div style={{ display:'flex', alignItems:'center', gap:8, padding:'10px 16px', background:tk.redBg, border:`1px solid ${tk.redBorder}`, borderRadius:10, marginBottom:14, fontSize:12, color:tk.red, fontWeight:600 }}>
                <AlertTriangle size={13}/> Live data error: {saError}
                <button onClick={() => fetchSuperadminData()} style={{ marginLeft:'auto', fontSize:11, color:tk.red, background:'none', border:`1px solid ${tk.red}50`, borderRadius:6, padding:'3px 10px', cursor:'pointer', fontFamily:'inherit' }}>
                  Retry
                </button>
              </div>
            )}

            <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:14 }}>

              {/* Admin Activity Log */}
              <div style={{ background:tk.surface, border:'1px solid rgba(245,158,11,0.22)', borderRadius:14, overflow:'hidden', boxShadow:tk.shadow, animation:'fadeUp .4s ease both', animationDelay:'480ms' }}>
                <SectionHeader title="Admin Activity Log" sub="Recent actions by elevated users" icon={<Clock size={14}/>} tk={tk} badge lastSync={lastSaSync} spinning={saSpinning}/>
                {saLoading ? <Skeleton tk={tk} rows={5}/> :
                 saActivity.length === 0 ? (
                  <div style={{ padding:32, textAlign:'center', color:tk.textMuted, fontSize:13 }}>No recent admin activity.</div>
                ) : saActivity.slice(0, 7).map((log, i, arr) => {
                  const color = avatarColor(log.userName);
                  return (
                    <div key={log._id || i}
                      style={{ padding:'10px 22px', display:'flex', alignItems:'center', gap:12, borderBottom: i < arr.length - 1 ? `1px solid ${tk.border}` : 'none', transition:'background .15s' }}
                      onMouseEnter={e => e.currentTarget.style.background = tk.surfaceHover}
                      onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                    >
                      <div style={{ width:32, height:32, borderRadius:9, background:`${color}18`, border:`1.5px solid ${color}40`, display:'flex', alignItems:'center', justifyContent:'center', fontSize:11, fontWeight:800, color, flexShrink:0, fontFamily:'Syne,sans-serif' }}>
                        {initials(log.userName)}
                      </div>
                      <div style={{ flex:1, minWidth:0 }}>
                        <div style={{ display:'flex', alignItems:'center', gap:6, marginBottom:2 }}>
                          <p style={{ fontSize:12, fontWeight:600, color:tk.text, margin:0, whiteSpace:'nowrap', overflow:'hidden', textOverflow:'ellipsis' }}>{log.userName}</p>
                          <RoleBadge role={log.userRole}/>
                        </div>
                        <p style={{ fontSize:11, color:tk.textMuted, margin:0, whiteSpace:'nowrap', overflow:'hidden', textOverflow:'ellipsis' }}>{log.action}</p>
                      </div>
                      <span style={{ fontSize:10, color:tk.textMuted, whiteSpace:'nowrap', flexShrink:0 }}>{timeAgo(log.createdAt)}</span>
                    </div>
                  );
                })}
              </div>

              {/* Role Distribution */}
              <div style={{ background:tk.surface, border:'1px solid rgba(245,158,11,0.22)', borderRadius:14, overflow:'hidden', boxShadow:tk.shadow, animation:'fadeUp .4s ease both', animationDelay:'520ms' }}>
                <SectionHeader title="Role Distribution" sub="Live breakdown of all user roles" icon={<Shield size={14}/>} tk={tk} badge lastSync={lastSaSync} spinning={saSpinning}/>
                {saLoading ? <Skeleton tk={tk} rows={4}/> : (
                  <>
                    <div style={{ padding:'16px 22px', display:'flex', flexDirection:'column', gap:12 }}>
                      {roleDistRows.map(row => {
                        const m   = roleMeta[row.role];
                        const pct = Math.round((row.count / maxRoleDist) * 100);
                        const { Icon } = m;
                        return (
                          <div key={row.role}>
                            <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:6 }}>
                              <div style={{ display:'flex', alignItems:'center', gap:7 }}>
                                <span style={{ display:'flex', alignItems:'center', justifyContent:'center', width:24, height:24, borderRadius:7, background:m.bg, border:`1px solid ${m.border}`, color:m.color }}>
                                  <Icon size={11}/>
                                </span>
                                <span style={{ fontSize:12, color:tk.textSub, fontWeight:500 }}>{m.label}</span>
                              </div>
                              <span style={{ fontSize:13, fontWeight:800, color:m.color, fontFamily:'Syne,sans-serif' }}>{row.count}</span>
                            </div>
                            <div style={{ height:5, background:tk.border, borderRadius:5, overflow:'hidden' }}>
                              <div style={{ height:'100%', width:`${pct}%`, background:m.color, borderRadius:5, opacity:.8, transition:'width .7s ease' }}/>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                    <div style={{ padding:'12px 22px', borderTop:`1px solid ${tk.border}`, display:'flex', alignItems:'center', justifyContent:'space-between', background: isDark ? 'rgba(255,255,255,0.015)' : 'rgba(0,0,0,0.018)' }}>
                      <span style={{ fontSize:11, color:tk.textMuted }}>Total accounts</span>
                      <span style={{ fontSize:14, fontWeight:800, color:tk.text, fontFamily:'Syne,sans-serif' }}>
                        {roleDistRows.reduce((s, r) => s + r.count, 0)}
                      </span>
                    </div>
                  </>
                )}
              </div>

              {/* All Staff — live list */}
              <div style={{ background:tk.surface, border:'1px solid rgba(245,158,11,0.22)', borderRadius:14, overflow:'hidden', boxShadow:tk.shadow, animation:'fadeUp .4s ease both', animationDelay:'560ms' }}>
                <SectionHeader title="All Staff" sub={`${saUsers.length} accounts · live`} icon={<Users size={14}/>} tk={tk} badge lastSync={lastSaSync} spinning={saSpinning}/>
                {saLoading ? <Skeleton tk={tk} rows={5}/> :
                 saUsers.length === 0 ? (
                  <div style={{ padding:32, textAlign:'center', color:tk.textMuted, fontSize:13 }}>No staff found.</div>
                ) : saUsers.slice(0, 8).map((u, i, arr) => {
                  const color = avatarColor(u.name);
                  return (
                    <div key={u._id}
                      style={{ padding:'9px 22px', display:'flex', alignItems:'center', gap:11, borderBottom: i < arr.length - 1 ? `1px solid ${tk.border}` : 'none', transition:'background .15s' }}
                      onMouseEnter={e => e.currentTarget.style.background = tk.surfaceHover}
                      onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                    >
                      <div style={{ position:'relative', flexShrink:0 }}>
                        <div style={{ width:32, height:32, borderRadius:9, background:`${color}18`, border:`1.5px solid ${color}40`, display:'flex', alignItems:'center', justifyContent:'center', fontSize:11, fontWeight:800, color, fontFamily:'Syne,sans-serif' }}>
                          {initials(u.name)}
                        </div>
                        <span style={{ position:'absolute', bottom:-1, right:-1, width:8, height:8, borderRadius:'50%', background: u.isActive ? tk.green : tk.red, border:`1.5px solid ${tk.surface}` }}/>
                      </div>
                      <div style={{ flex:1, minWidth:0 }}>
                        <p style={{ fontSize:12, fontWeight:600, color:tk.text, margin:'0 0 2px', whiteSpace:'nowrap', overflow:'hidden', textOverflow:'ellipsis' }}>{u.name}</p>
                        <p style={{ fontSize:10, color:tk.textMuted, margin:0, whiteSpace:'nowrap', overflow:'hidden', textOverflow:'ellipsis' }}>{u.email}</p>
                      </div>
                      <div style={{ display:'flex', flexDirection:'column', alignItems:'flex-end', gap:3, flexShrink:0 }}>
                        <RoleBadge role={u.role}/>
                        <span style={{ fontSize:9, color:tk.textMuted }}>{timeAgo(u.lastLogin)}</span>
                      </div>
                    </div>
                  );
                })}
                {saUsers.length > 8 && (
                  <div style={{ padding:'10px 22px', borderTop:`1px solid ${tk.border}`, textAlign:'center' }}>
                    <span style={{ fontSize:11, color:tk.textMuted }}>+{saUsers.length - 8} more — manage in User Management</span>
                  </div>
                )}
              </div>

              {/* Pending Alerts */}
              <div style={{ background:tk.surface, border:'1px solid rgba(245,158,11,0.22)', borderRadius:14, overflow:'hidden', boxShadow:tk.shadow, animation:'fadeUp .4s ease both', animationDelay:'600ms' }}>
                <SectionHeader
                  title="Pending Alerts"
                  sub={saAlerts.length > 0 ? `${saAlerts.length} alert${saAlerts.length !== 1 ? 's' : ''} require attention` : 'No active alerts'}
                  icon={<Bell size={14}/>} tk={tk} badge lastSync={lastSaSync} spinning={saSpinning}
                />
                {saLoading ? <Skeleton tk={tk} rows={3}/> :
                 saAlerts.length === 0 ? (
                  <div style={{ padding:'24px 22px', display:'flex', alignItems:'center', gap:10, color:tk.green }}>
                    <CheckCircle size={16}/>
                    <span style={{ fontSize:13, fontWeight:500 }}>All clear — no pending alerts.</span>
                  </div>
                ) : saAlerts.map((alert, i, arr) => (
                  <div key={alert._id || i}
                    style={{ padding:'12px 22px', display:'flex', alignItems:'center', gap:14, borderBottom: i < arr.length - 1 ? `1px solid ${tk.border}` : 'none', transition:'background .15s' }}
                    onMouseEnter={e => e.currentTarget.style.background = tk.surfaceHover}
                    onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                  >
                    <div style={{ width:34, height:34, borderRadius:9, flexShrink:0, display:'flex', alignItems:'center', justifyContent:'center', ...(alert.severity === 'critical' ? { background:tk.redBg, border:`1px solid ${tk.redBorder}`, color:tk.red } : { background:tk.amberBg, border:`1px solid ${tk.amberBorder}`, color:tk.amber }) }}>
                      <AlertTriangle size={15}/>
                    </div>
                    <div style={{ flex:1, minWidth:0 }}>
                      <p style={{ fontSize:13, fontWeight:600, color:tk.text, margin:'0 0 2px' }}>{alert.title}</p>
                      <p style={{ fontSize:11, color:tk.textMuted, margin:0, whiteSpace:'nowrap', overflow:'hidden', textOverflow:'ellipsis' }}>{alert.message}</p>
                    </div>
                    <div style={{ display:'flex', alignItems:'center', gap:8, flexShrink:0 }}>
                      <span style={{ fontSize:10, color:tk.textMuted }}>{timeAgo(alert.createdAt)}</span>
                      <span style={{ fontSize:10, fontWeight:700, padding:'2px 7px', borderRadius:5, textTransform:'uppercase', letterSpacing:'.4px', ...(alert.severity === 'critical' ? { background:tk.redBg, color:tk.red, border:`1px solid ${tk.redBorder}` } : { background:tk.amberBg, color:tk.amber, border:`1px solid ${tk.amberBorder}` }) }}>
                        {alert.severity || 'warn'}
                      </span>
                      <ChevronRight size={13} color={tk.textMuted}/>
                    </div>
                  </div>
                ))}
              </div>

            </div>
          </>
        )}

        {/* ── Footer ── */}
        <p style={{ marginTop:20, textAlign:'center', color:tk.textMuted, fontSize:11, animation:'fadeUp .4s ease both', animationDelay:'500ms' }}>
          FlowPOS {isSuperAdmin ? 'Superadmin' : 'Admin'}
          {' · '}Dashboard syncs every {INTERVAL_DASHBOARD / 1000}s
          {' · '}Health checks every {INTERVAL_HEALTH / 1000}s
          {isSuperAdmin && ` · Live panels every ${INTERVAL_SUPERADMIN / 1000}s`}
          {lastDashSync ? ` · Last sync ${lastDashSync.toLocaleTimeString()}` : ''}
        </p>

      </div>
    </div>
  );
}