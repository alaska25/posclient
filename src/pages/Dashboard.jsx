import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';
import api from '../utils/api';
import { formatCurrency } from '../utils/format';
import './Dashboard.css';

const MONTHS = {
  en: ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'],
  es: ['Ene','Feb','Mar','Abr','May','Jun','Jul','Ago','Sep','Oct','Nov','Dic'],
  ja: ['1月','2月','3月','4月','5月','6月','7月','8月','9月','10月','11月','12月'],
  tl: ['Ene','Peb','Mar','Abr','May','Hun','Hul','Ago','Set','Okt','Nob','Dis'],
};

const DATE_LOCALE = {
  en: 'en-GB',
  es: 'es-ES',
  ja: 'ja-JP',
  tl: 'fil-PH',
};

export default function Dashboard() {
  const { t, i18n } = useTranslation();

  const lang    = i18n.language?.slice(0, 2) || 'en';
  const months  = MONTHS[lang]  || MONTHS.en;
  const locale  = DATE_LOCALE[lang] || 'en-GB';

  const { data: dash } = useQuery({
    queryKey: ['dashboard'],
    queryFn: () => api.get('/reports/dashboard').then(r => r.data.data),
  });

  const { data: revenue } = useQuery({
    queryKey: ['revenue', new Date().getFullYear()],
    queryFn: () => api.get(`/reports/revenue?year=${new Date().getFullYear()}`).then(r => r.data.data),
  });

  const chartData = months.map((m, i) => ({
    month: m,
    revenue: revenue?.find(r => r._id === i + 1)?.revenue || 0,
  }));

  const stats = [
    { label: t('active_jobs'),          value: dash?.activeJobs          ?? '—', color: 'blue',   icon: '⚙' },
    { label: t('completed_this_month'), value: dash?.completedThisMonth  ?? '—', color: 'green',  icon: '✓' },
    { label: t('monthly_revenue'),      value: formatCurrency(dash?.monthRevenue), color: 'accent', icon: '₱' },
    { label: t('overdue_invoices'),     value: dash?.overdueInvoices     ?? '—', color: 'red',    icon: '⚠' },
  ];

  return (
    <div>
      <div className="page-header">
        <h1 className="page-title">{t('dashboard')}</h1>
        <span className="text-muted" style={{ fontSize: 13 }}>
          {new Date().toLocaleDateString(locale, {
            weekday: 'long', day: 'numeric', month: 'long', year: 'numeric',
          })}
        </span>
      </div>

      <div className="stats-grid">
        {stats.map(s => (
          <div key={s.label} className={`stat-card stat-${s.color}`}>
            <div className="stat-icon">{s.icon}</div>
            <div className="stat-value">{s.value}</div>
            <div className="stat-label">{s.label}</div>
          </div>
        ))}
      </div>

      <div className="dash-grid">
        <div className="card">
          <h3 style={{ marginBottom: 20, fontSize: 16 }}>
            {t('revenue')} — {new Date().getFullYear()}
          </h3>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={chartData} barSize={28}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
              <XAxis
                dataKey="month"
                tick={{ fill: 'var(--text-muted)', fontSize: 12 }}
                axisLine={false}
                tickLine={false}
              />
              <YAxis
                tick={{ fill: 'var(--text-muted)', fontSize: 11 }}
                axisLine={false}
                tickLine={false}
                tickFormatter={v =>
                  v >= 1000000 ? `${(v / 1000000).toFixed(1)}M`
                  : v >= 1000  ? `${(v / 1000).toFixed(0)}K`
                  : v
                }
              />
              <Tooltip
                contentStyle={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 8 }}
                labelStyle={{ color: 'var(--text-secondary)' }}
                formatter={v => [formatCurrency(v), t('revenue')]}
              />
              <Bar dataKey="revenue" fill="var(--accent)" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="card">
          <h3 style={{ marginBottom: 20, fontSize: 16 }}>
            {t('top_customers')}
          </h3>
          <div className="top-list">
            {dash?.topCustomers?.map((c, i) => (
              <div key={c._id} className="top-item">
                <span className="top-rank">#{i + 1}</span>
                <span className="top-name">{c.name}</span>
                <span className="amount text-accent">{formatCurrency(c.totalBilled)}</span>
              </div>
            ))}
            {!dash?.topCustomers?.length && (
              <p className="text-muted" style={{ fontSize: 13 }}>{t('no_data')}</p>
            )}
          </div>
        </div>

        <div className="card">
          <h3 style={{ marginBottom: 20, fontSize: 16 }}>
            {t('recent_payments')}
          </h3>
          <div className="top-list">
            {dash?.recentPayments?.map(p => (
              <div key={p._id} className="top-item">
                <span className="mono" style={{ fontSize: 12, color: 'var(--text-muted)' }}>
                  {p.invoice?.invoiceNumber}
                </span>
                <span style={{ fontSize: 13 }}>{p.customer?.name}</span>
                <span className="amount text-green">{formatCurrency(p.amount)}</span>
              </div>
            ))}
            {!dash?.recentPayments?.length && (
              <p className="text-muted" style={{ fontSize: 13 }}>{t('no_payments')}</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}