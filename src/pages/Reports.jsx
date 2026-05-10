import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer,
  CartesianGrid, LineChart, Line, Area, AreaChart, PieChart, Pie, Cell, Legend
} from 'recharts';
import api from '../utils/api';
import { formatCurrency } from '../utils/format';
import { useTheme } from '../context/ThemeContext';
import {
  TrendingUp, TrendingDown, DollarSign, Briefcase,
  FileText, Users, AlertTriangle, CheckCircle,
  Clock, XCircle, Download, RefreshCw
} from 'lucide-react';

const MONTHS = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];

const fmt = (v) =>
  v >= 1_000_000 ? `${(v/1_000_000).toFixed(1)}M`
  : v >= 1_000   ? `${(v/1_000).toFixed(0)}K`
  : String(v ?? 0);

const STATUS_COLORS = {
  paid:       '#10b981',
  sent:       '#3b82f6',
  overdue:    '#ef4444',
  partial:    '#f59e0b',
  draft:      '#8a9bb5',
  cancelled:  '#4a5e7a',
  completed:  '#10b981',
  in_progress:'#3b82f6',
  pending:    '#f59e0b',
};

const PIE_COLORS = ['#6366f1','#10b981','#f59e0b','#ef4444','#3b82f6','#a855f7'];

function KpiCard({ label, value, sub, icon, color, trend, tk }) {
  const [hov, setHov] = useState(false);
  return (
    <div
      onMouseEnter={() => setHov(true)}
      onMouseLeave={() => setHov(false)}
      style={{
        background: tk.surface,
        border: `1px solid ${hov ? tk.borderHover : tk.border}`,
        borderRadius: 14,
        padding: '20px 22px',
        position: 'relative', overflow: 'hidden',
        transition: 'all .2s',
        boxShadow: hov ? tk.shadowHover : tk.shadow,
        transform: hov ? 'translateY(-2px)' : 'none',
        cursor: 'default',
      }}
    >
      <div style={{
        position: 'absolute', top: 0, left: 0, right: 0, height: 3,
        background: color, borderRadius: '14px 14px 0 0',
      }} />
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 14 }}>
        <div style={{
          width: 38, height: 38, borderRadius: 10,
          background: color + '20',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          color: color,
        }}>
          {icon}
        </div>
        {trend !== undefined && (
          <div style={{
            display: 'flex', alignItems: 'center', gap: 4,
            fontSize: 11, fontWeight: 700,
            color: trend >= 0 ? '#10b981' : '#ef4444',
            background: trend >= 0 ? 'rgba(16,185,129,0.1)' : 'rgba(239,68,68,0.1)',
            padding: '3px 8px', borderRadius: 20,
          }}>
            {trend >= 0 ? <TrendingUp size={11} /> : <TrendingDown size={11} />}
            {Math.abs(trend)}%
          </div>
        )}
      </div>
      <div style={{ fontSize: 26, fontWeight: 800, color: tk.text, fontFamily: 'Syne,sans-serif', letterSpacing: '-1px', lineHeight: 1, marginBottom: 4 }}>
        {value}
      </div>
      <div style={{ fontSize: 11, color: tk.textMuted, textTransform: 'uppercase', letterSpacing: '0.7px', fontWeight: 700 }}>
        {label}
      </div>
      {sub && <div style={{ fontSize: 11, color: tk.textSub, marginTop: 4 }}>{sub}</div>}
    </div>
  );
}

function SectionTitle({ title, sub, icon, tk }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16 }}>
      <div style={{ color: '#6366f1' }}>{icon}</div>
      <div>
        <h2 style={{ margin: 0, fontSize: 15, fontWeight: 700, color: tk.text, fontFamily: 'Syne,sans-serif' }}>{title}</h2>
        {sub && <p style={{ margin: 0, fontSize: 11, color: tk.textMuted }}>{sub}</p>}
      </div>
    </div>
  );
}

const customTooltip = (tk) => ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div style={{ background: tk.surface, border: `1px solid ${tk.border}`, borderRadius: 10, padding: '10px 14px', fontSize: 12 }}>
      <p style={{ margin: '0 0 6px', color: tk.textSub, fontWeight: 600 }}>{label}</p>
      {payload.map((p, i) => (
        <p key={i} style={{ margin: '2px 0', color: p.color, fontWeight: 700 }}>
          {p.name === 'revenue' ? formatCurrency(p.value) : p.value} {p.name === 'revenue' ? '' : p.name}
        </p>
      ))}
    </div>
  );
};

export default function Reports() {
  const { isDark } = useTheme();
  const [year, setYear] = useState(new Date().getFullYear());

  const tk = {
    bg:          isDark ? '#0a0d12'                   : '#f4f7fe',
    surface:     isDark ? '#111620'                   : '#ffffff',
    border:      isDark ? 'rgba(255,255,255,0.07)'    : 'rgba(0,0,0,0.08)',
    borderHover: isDark ? 'rgba(255,255,255,0.15)'    : 'rgba(0,0,0,0.18)',
    text:        isDark ? '#e8edf5'                   : '#1b254b',
    textSub:     isDark ? 'rgba(232,237,245,0.55)'    : 'rgba(27,37,75,0.55)',
    textMuted:   isDark ? 'rgba(232,237,245,0.3)'     : 'rgba(27,37,75,0.35)',
    shadow:      isDark ? '0 2px 12px rgba(0,0,0,0.4)' : '0 2px 12px rgba(0,0,0,0.06)',
    shadowHover: isDark ? '0 6px 24px rgba(0,0,0,0.55)' : '0 6px 24px rgba(0,0,0,0.12)',
    gridLine:    isDark ? 'rgba(255,255,255,0.05)'    : 'rgba(0,0,0,0.06)',
    tooltip:     isDark ? '#1e2738'                   : '#ffffff',
  };

  const { data: revenue, isLoading: revLoading, refetch: refetchRev } = useQuery({
    queryKey: ['revenue', year],
    queryFn: () => api.get(`/reports/revenue?year=${year}`).then(r => r.data.data),
  });

  const { data: dash } = useQuery({
    queryKey: ['dashboard'],
    queryFn: () => api.get('/reports/dashboard').then(r => r.data.data),
  });

  const { data: invoiceReport } = useQuery({
    queryKey: ['invoiceReport'],
    queryFn: () => api.get('/reports/invoices').then(r => r.data.data),
  });

  const { data: jobReport } = useQuery({
    queryKey: ['jobReport'],
    queryFn: () => api.get('/reports/jobs').then(r => r.data.data),
  });

  const chartData = MONTHS.map((m, i) => ({
    month: m,
    revenue: revenue?.find(r => r._id === i + 1)?.revenue || 0,
    txns:    revenue?.find(r => r._id === i + 1)?.count   || 0,
  }));

  const totalYear   = chartData.reduce((s, d) => s + d.revenue, 0);
  const totalTxns   = chartData.reduce((s, d) => s + d.txns,    0);
  const peakMonth   = chartData.reduce((a, b) => b.revenue > a.revenue ? b : a, chartData[0]);

  const invoicePie  = (invoiceReport?.summary || []).map((s, i) => ({
    name:  s._id, value: s.count, amount: s.total, fill: PIE_COLORS[i % PIE_COLORS.length],
  }));

  const jobPie = (jobReport?.summary || []).map((s, i) => ({
    name: s._id.replace('_', ' '), value: s.count, fill: PIE_COLORS[i % PIE_COLORS.length],
  }));

  const card = (children, extra = {}) => (
    <div style={{
      background: tk.surface, border: `1px solid ${tk.border}`,
      borderRadius: 14, padding: '22px 24px',
      boxShadow: tk.shadow, ...extra,
    }}>
      {children}
    </div>
  );

  return (
    <div style={{ fontFamily: 'Figtree,Outfit,sans-serif', color: tk.text }}>

      {/* ── Page header ── */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 28 }}>
        <div>
          <h1 style={{ margin: 0, fontSize: 26, fontWeight: 800, fontFamily: 'Syne,sans-serif', letterSpacing: '-0.5px', color: tk.text }}>
            Reports & Analytics
          </h1>
          <p style={{ margin: '4px 0 0', fontSize: 13, color: tk.textSub }}>
            Financial overview and operational audit for {year}
          </p>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <button
            onClick={() => { refetchRev(); }}
            style={{
              display: 'flex', alignItems: 'center', gap: 6,
              padding: '8px 14px', borderRadius: 10, cursor: 'pointer',
              background: tk.surface, border: `1px solid ${tk.border}`,
              color: tk.textSub, fontSize: 13, fontWeight: 600,
              transition: 'all .2s',
            }}
          >
            <RefreshCw size={14} style={{ animation: revLoading ? 'spin .7s linear infinite' : 'none' }} />
            Refresh
          </button>
          <select
            value={year}
            onChange={e => setYear(Number(e.target.value))}
            style={{
              padding: '8px 14px', borderRadius: 10, fontSize: 13, fontWeight: 600,
              background: tk.surface, border: `1px solid ${tk.border}`,
              color: tk.text, cursor: 'pointer', outline: 'none',
            }}
          >
            {[2023, 2024, 2025, 2026].map(y => <option key={y}>{y}</option>)}
          </select>
        </div>
      </div>

      {/* ── KPI row ── */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 14, marginBottom: 20 }}>
        <KpiCard label={`${year} Revenue`}     value={formatCurrency(totalYear)}           icon={<DollarSign size={18}/>}  color="#f59e0b" sub={`${totalTxns} transactions`} tk={tk} />
        <KpiCard label="All-time Revenue"      value={formatCurrency(dash?.totalRevenue)}   icon={<TrendingUp size={18}/>}  color="#10b981" sub="Total collected" tk={tk} />
        <KpiCard label="Total Jobs"            value={dash?.totalJobs ?? '—'}              icon={<Briefcase size={18}/>}   color="#6366f1" sub={`${dash?.activeJobs ?? 0} active`} tk={tk} />
        <KpiCard label="Overdue Invoices"      value={dash?.overdueInvoices ?? '—'}        icon={<AlertTriangle size={18}/>} color="#ef4444" sub="Requires attention" tk={tk} />
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 14, marginBottom: 20 }}>
        <KpiCard label="Monthly Revenue"       value={formatCurrency(dash?.monthRevenue)}  icon={<DollarSign size={18}/>}  color="#3b82f6" sub="This month" tk={tk} />
        <KpiCard label="Completed This Month"  value={dash?.completedThisMonth ?? '—'}     icon={<CheckCircle size={18}/>} color="#10b981" sub="Work orders" tk={tk} />
        <KpiCard label="Peak Month"            value={peakMonth?.month ?? '—'}             icon={<TrendingUp size={18}/>}  color="#a855f7" sub={peakMonth ? formatCurrency(peakMonth.revenue) : ''} tk={tk} />
      </div>

      {/* ── Revenue bar chart ── */}
      <div style={{ marginBottom: 20 }}>
        {card(<>
          <SectionTitle title={`Monthly Revenue — ${year}`} sub="Bars show revenue · line shows transaction count" icon={<BarChart size={16}/>} tk={tk} />
          <ResponsiveContainer width="100%" height={280}>
            <BarChart data={chartData} barSize={24} barGap={4}>
              <CartesianGrid strokeDasharray="3 3" stroke={tk.gridLine} vertical={false} />
              <XAxis dataKey="month" tick={{ fill: tk.textSub, fontSize: 12 }} axisLine={false} tickLine={false} />
              <YAxis yAxisId="left" tick={{ fill: tk.textSub, fontSize: 11 }} axisLine={false} tickLine={false}
                tickFormatter={v => `¥${fmt(v)}`} />
              <YAxis yAxisId="right" orientation="right" tick={{ fill: tk.textSub, fontSize: 11 }} axisLine={false} tickLine={false} />
              <Tooltip content={customTooltip(tk)} />
              <Bar yAxisId="left"  dataKey="revenue" fill="#f59e0b" radius={[5,5,0,0]} name="revenue" />
              <Bar yAxisId="right" dataKey="txns"    fill="#6366f1" radius={[5,5,0,0]} name="txns" opacity={0.7} />
            </BarChart>
          </ResponsiveContainer>
        </>)}
      </div>

      {/* ── Area chart ── */}
      <div style={{ marginBottom: 20 }}>
        {card(<>
          <SectionTitle title="Revenue Trend" sub="Cumulative revenue flow across months" icon={<TrendingUp size={16}/>} tk={tk} />
          <ResponsiveContainer width="100%" height={200}>
            <AreaChart data={chartData}>
              <defs>
                <linearGradient id="revGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%"  stopColor="#f59e0b" stopOpacity={0.25} />
                  <stop offset="95%" stopColor="#f59e0b" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke={tk.gridLine} vertical={false} />
              <XAxis dataKey="month" tick={{ fill: tk.textSub, fontSize: 11 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: tk.textSub, fontSize: 10 }} axisLine={false} tickLine={false} tickFormatter={v => `¥${fmt(v)}`} />
              <Tooltip content={customTooltip(tk)} />
              <Area type="monotone" dataKey="revenue" stroke="#f59e0b" strokeWidth={2} fill="url(#revGrad)" name="revenue" />
            </AreaChart>
          </ResponsiveContainer>
        </>)}
      </div>

      {/* ── Pie charts row ── */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14, marginBottom: 20 }}>
        {card(<>
          <SectionTitle title="Invoice Status Breakdown" sub="By count across all time" icon={<FileText size={16}/>} tk={tk} />
          <ResponsiveContainer width="100%" height={220}>
            <PieChart>
              <Pie data={invoicePie} cx="50%" cy="50%" innerRadius={55} outerRadius={85}
                dataKey="value" paddingAngle={3} label={({ name, percent }) => `${name} ${(percent*100).toFixed(0)}%`}
                labelLine={false}
              >
                {invoicePie.map((e, i) => <Cell key={i} fill={e.fill} />)}
              </Pie>
              <Tooltip formatter={(v, n, p) => [v + ' invoices', p.payload.name]} contentStyle={{ background: tk.surface, border: `1px solid ${tk.border}`, borderRadius: 8, fontSize: 12 }} />
            </PieChart>
          </ResponsiveContainer>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px 16px', marginTop: 8 }}>
            {invoicePie.map(e => (
              <div key={e.name} style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, color: tk.textSub }}>
                <div style={{ width: 8, height: 8, borderRadius: '50%', background: e.fill }} />
                <span style={{ textTransform: 'capitalize' }}>{e.name}</span>
                <span style={{ fontWeight: 700, color: tk.text }}>{e.value}</span>
              </div>
            ))}
          </div>
        </>)}

        {card(<>
          <SectionTitle title="Job Status Breakdown" sub="All work orders by status" icon={<Briefcase size={16}/>} tk={tk} />
          <ResponsiveContainer width="100%" height={220}>
            <PieChart>
              <Pie data={jobPie} cx="50%" cy="50%" innerRadius={55} outerRadius={85}
                dataKey="value" paddingAngle={3}
                label={({ name, percent }) => `${name} ${(percent*100).toFixed(0)}%`}
                labelLine={false}
              >
                {jobPie.map((e, i) => <Cell key={i} fill={e.fill} />)}
              </Pie>
              <Tooltip formatter={(v, n, p) => [v + ' jobs', p.payload.name]} contentStyle={{ background: tk.surface, border: `1px solid ${tk.border}`, borderRadius: 8, fontSize: 12 }} />
            </PieChart>
          </ResponsiveContainer>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px 16px', marginTop: 8 }}>
            {jobPie.map(e => (
              <div key={e.name} style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, color: tk.textSub }}>
                <div style={{ width: 8, height: 8, borderRadius: '50%', background: e.fill }} />
                <span style={{ textTransform: 'capitalize' }}>{e.name}</span>
                <span style={{ fontWeight: 700, color: tk.text }}>{e.value}</span>
              </div>
            ))}
          </div>
        </>)}
      </div>

      {/* ── Tables row ── */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14, marginBottom: 20 }}>

        {/* Top customers */}
        {card(<>
          <SectionTitle title="Top Customers by Revenue" sub="All-time highest billing" icon={<Users size={16}/>} tk={tk} />
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
            <thead>
              <tr>
                {['#','Customer','Billed'].map(h => (
                  <th key={h} style={{ textAlign: h === 'Billed' ? 'right' : 'left', padding: '8px 10px', fontSize: 11, fontWeight: 700, color: tk.textMuted, textTransform: 'uppercase', letterSpacing: '0.07em', borderBottom: `1px solid ${tk.border}` }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {dash?.topCustomers?.map((c, i) => (
                <tr key={c._id}
                  style={{ borderBottom: `1px solid ${tk.border}`, transition: 'background .15s', cursor: 'default' }}
                  onMouseEnter={e => e.currentTarget.style.background = isDark ? 'rgba(255,255,255,0.03)' : 'rgba(0,0,0,0.02)'}
                  onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                >
                  <td style={{ padding: '11px 10px', color: tk.textMuted, fontFamily: 'monospace' }}>#{i+1}</td>
                  <td style={{ padding: '11px 10px', color: tk.text, fontWeight: 500 }}>{c.name}</td>
                  <td style={{ padding: '11px 10px', textAlign: 'right', color: '#10b981', fontWeight: 700, fontFamily: 'monospace' }}>{formatCurrency(c.totalBilled)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </>)}

        {/* Overdue invoices */}
        {card(<>
          <SectionTitle title="Overdue Invoices" sub="Requires immediate attention" icon={<AlertTriangle size={16}/>} tk={tk} />
          {!invoiceReport?.overdue?.length ? (
            <div style={{ padding: '32px 0', textAlign: 'center', color: tk.textMuted, fontSize: 13 }}>
              <CheckCircle size={28} style={{ marginBottom: 8, color: '#10b981', display: 'block', margin: '0 auto 8px' }} />
              No overdue invoices
            </div>
          ) : (
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
              <thead>
                <tr>
                  {['Invoice','Customer','Due','Amount'].map(h => (
                    <th key={h} style={{ textAlign: h === 'Amount' ? 'right' : 'left', padding: '8px 10px', fontSize: 11, fontWeight: 700, color: tk.textMuted, textTransform: 'uppercase', letterSpacing: '0.07em', borderBottom: `1px solid ${tk.border}` }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {invoiceReport.overdue.map(inv => (
                  <tr key={inv._id}
                    style={{ borderBottom: `1px solid ${tk.border}`, transition: 'background .15s' }}
                    onMouseEnter={e => e.currentTarget.style.background = 'rgba(239,68,68,0.05)'}
                    onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                  >
                    <td style={{ padding: '11px 10px', color: '#ef4444', fontFamily: 'monospace', fontSize: 12 }}>{inv.invoiceNumber}</td>
                    <td style={{ padding: '11px 10px', color: tk.text, fontWeight: 500 }}>{inv.customer?.name}</td>
                    <td style={{ padding: '11px 10px', color: tk.textMuted, fontSize: 12 }}>
                      {new Date(inv.dueDate).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })}
                    </td>
                    <td style={{ padding: '11px 10px', textAlign: 'right', color: '#ef4444', fontWeight: 700, fontFamily: 'monospace' }}>{formatCurrency(inv.grandTotal)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </>)}
      </div>

      {/* ── Recent jobs audit ── */}
      {card(<>
        <SectionTitle title="Recent Jobs Audit" sub="Latest work orders with status" icon={<Briefcase size={16}/>} tk={tk} />
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
          <thead>
            <tr>
              {['Job Title','Customer','Status','Priority','Created','Completed'].map(h => (
                <th key={h} style={{ textAlign: 'left', padding: '8px 12px', fontSize: 11, fontWeight: 700, color: tk.textMuted, textTransform: 'uppercase', letterSpacing: '0.07em', borderBottom: `1px solid ${tk.border}` }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {jobReport?.recent?.map(job => (
              <tr key={job._id}
                style={{ borderBottom: `1px solid ${tk.border}`, transition: 'background .15s' }}
                onMouseEnter={e => e.currentTarget.style.background = isDark ? 'rgba(255,255,255,0.02)' : 'rgba(0,0,0,0.015)'}
                onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
              >
                <td style={{ padding: '12px', color: tk.text, fontWeight: 600 }}>{job.title}</td>
                <td style={{ padding: '12px', color: tk.textSub }}>{job.customer?.name ?? '—'}</td>
                <td style={{ padding: '12px' }}>
                  <span style={{
                    display: 'inline-flex', alignItems: 'center', gap: 5,
                    padding: '3px 10px', borderRadius: 20, fontSize: 11, fontWeight: 700,
                    textTransform: 'capitalize',
                    background: (STATUS_COLORS[job.status] || '#8a9bb5') + '20',
                    color: STATUS_COLORS[job.status] || '#8a9bb5',
                  }}>
                    {job.status?.replace('_', ' ')}
                  </span>
                </td>
                <td style={{ padding: '12px' }}>
                  <span style={{
                    display: 'inline-flex', padding: '3px 10px', borderRadius: 20, fontSize: 11, fontWeight: 700,
                    textTransform: 'capitalize',
                    background: (STATUS_COLORS[job.priority] || '#8a9bb5') + '20',
                    color: STATUS_COLORS[job.priority] || '#8a9bb5',
                  }}>
                    {job.priority ?? 'normal'}
                  </span>
                </td>
                <td style={{ padding: '12px', color: tk.textMuted, fontSize: 12 }}>
                  {new Date(job.createdAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: '2-digit' })}
                </td>
                <td style={{ padding: '12px', color: job.completedAt ? '#10b981' : tk.textMuted, fontSize: 12 }}>
                  {job.completedAt ? new Date(job.completedAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: '2-digit' }) : '—'}
                </td>
              </tr>
            ))}
            {!jobReport?.recent?.length && (
              <tr><td colSpan={6} style={{ padding: 24, textAlign: 'center', color: tk.textMuted }}>No jobs found</td></tr>
            )}
          </tbody>
        </table>
      </>, { marginBottom: 0 })}

      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
        select option { background: ${tk.surface}; }
      `}</style>
    </div>
  );
}