import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import { formatCurrency, formatDate, badgeClass, statusLabel } from '../../utils/format';
import { useCurrency } from '../../context/CurrencyContext';
import api from '../../utils/api';
import { Briefcase, FileText, CircleDollarSign, Clock } from 'lucide-react';

function StatCard({ icon, label, value, sub, color, bg }) {
  const { isDark } = useTheme();
  return (
    <div style={{
      background: isDark ? 'rgba(255,255,255,0.03)' : '#fff',
      border: `1px solid ${isDark ? 'rgba(255,255,255,0.07)' : '#e8edf5'}`,
      borderRadius: 16, padding: '20px 24px',
      display: 'flex', alignItems: 'center', gap: 16, flex: 1, minWidth: 180,
    }}>
      <div style={{
        width: 48, height: 48, borderRadius: 14, flexShrink: 0,
        background: bg, display: 'flex', alignItems: 'center', justifyContent: 'center',
      }}>
        {React.cloneElement(icon, { size: 22, color })}
      </div>
      <div>
        <p style={{ margin: 0, fontSize: 12, color: '#94a3b8', fontWeight: 600, letterSpacing: '0.3px', fontFamily: 'Outfit, sans-serif' }}>{label}</p>
        <p style={{ margin: '4px 0 2px', fontSize: 24, fontWeight: 800, color: color || 'inherit', fontFamily: 'Syne, sans-serif' }}>{value}</p>
        {sub && <p style={{ margin: 0, fontSize: 11, color: '#94a3b8', fontFamily: 'Outfit, sans-serif' }}>{sub}</p>}
      </div>
    </div>
  );
}

export default function PortalDashboard() {
  const { user }     = useAuth();
  const { isDark }   = useTheme();
  const { currency } = useCurrency();

  const { data: jobsRes }  = useQuery({
    queryKey: ['my-jobs'],
    queryFn:  () => api.get('/jobs/my').then(r => r.data),
  });

  const { data: invRes } = useQuery({
    queryKey: ['my-invoices'],
    queryFn:  () => api.get('/invoices/my').then(r => r.data),
  });

  const jobs     = jobsRes?.data     ?? [];
  const invoices = invRes?.data      ?? [];

  const activeJobs     = jobs.filter(j => !['completed','cancelled'].includes(j.status)).length;
  const totalInvoiced  = invoices.reduce((s, i) => s + (i.grandTotal || 0), 0);
  const totalOutstanding = invoices.filter(i => i.status !== 'paid').reduce((s, i) => s + (i.grandTotal || 0), 0);
  const recentJobs     = jobs.slice(0, 5);
  const recentInvoices = invoices.slice(0, 5);

  const text  = isDark ? '#e8edf5' : '#1b254b';
  const muted = isDark ? '#8a9bb5' : '#707eae';
  const card  = isDark ? 'rgba(255,255,255,0.03)' : '#fff';
  const bord  = isDark ? 'rgba(255,255,255,0.07)' : '#e8edf5';

  return (
    <div style={{ fontFamily: 'Outfit, sans-serif' }}>

      {/* Header */}
      <div style={{ marginBottom: 28 }}>
        <h1 style={{ margin: 0, fontSize: 26, fontWeight: 800, color: text, fontFamily: 'Syne, sans-serif' }}>
          Welcome back, {user?.name?.split(' ')[0]} 👋
        </h1>
        <p style={{ margin: '6px 0 0', fontSize: 14, color: muted }}>
          Here's an overview of your services and invoices.
        </p>
      </div>

      {/* Stat Cards */}
      <div style={{ display: 'flex', gap: 16, marginBottom: 28, flexWrap: 'wrap' }}>
        <StatCard
          icon={<Briefcase />} label="ACTIVE JOBS" value={activeJobs}
          sub={`${jobs.length} total`}
          color="#6366f1" bg="rgba(99,102,241,0.12)"
        />
        <StatCard
          icon={<FileText />} label="INVOICES" value={invoices.length}
          sub="all time"
          color="#a855f7" bg="rgba(168,85,247,0.12)"
        />
        <StatCard
          icon={<CircleDollarSign />} label="TOTAL INVOICED" value={formatCurrency(totalInvoiced, currency)}
          color="#16a34a" bg="rgba(22,163,74,0.1)"
        />
        <StatCard
          icon={<Clock />} label="OUTSTANDING" value={formatCurrency(totalOutstanding, currency)}
          color={totalOutstanding > 0 ? '#ef4444' : '#16a34a'}
          bg={totalOutstanding > 0 ? 'rgba(239,68,68,0.1)' : 'rgba(22,163,74,0.1)'}
        />
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>

        {/* Recent Jobs */}
        <div style={{ background: card, border: `1px solid ${bord}`, borderRadius: 16, padding: 24 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
            <h3 style={{ margin: 0, fontSize: 15, fontWeight: 700, color: text }}>Recent Jobs</h3>
            <Link to="/app/portal/jobs" style={{ fontSize: 12, color: '#6366f1', textDecoration: 'none', fontWeight: 600 }}>View all →</Link>
          </div>
          {recentJobs.length === 0 ? (
            <p style={{ color: muted, fontSize: 13, textAlign: 'center', padding: '24px 0' }}>No jobs yet</p>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {recentJobs.map(job => (
                <Link key={job._id} to="/app/portal/jobs" style={{ textDecoration: 'none' }}>
                  <div style={{
                    display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                    padding: '10px 14px', borderRadius: 10,
                    background: isDark ? 'rgba(255,255,255,0.03)' : '#f8fafc',
                    border: `1px solid ${bord}`,
                    transition: 'border-color 0.2s',
                  }}>
                    <div>
                      <p style={{ margin: 0, fontSize: 13, fontWeight: 600, color: text }}>{job.jobNumber}</p>
                      <p style={{ margin: '2px 0 0', fontSize: 11, color: muted }}>{job.description || 'No description'}</p>
                    </div>
                    <span className={badgeClass(job.status)} style={{ fontSize: 11 }}>{statusLabel(job.status)}</span>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>

        {/* Recent Invoices */}
        <div style={{ background: card, border: `1px solid ${bord}`, borderRadius: 16, padding: 24 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
            <h3 style={{ margin: 0, fontSize: 15, fontWeight: 700, color: text }}>Recent Invoices</h3>
            <Link to="/app/portal/invoices" style={{ fontSize: 12, color: '#6366f1', textDecoration: 'none', fontWeight: 600 }}>View all →</Link>
          </div>
          {recentInvoices.length === 0 ? (
            <p style={{ color: muted, fontSize: 13, textAlign: 'center', padding: '24px 0' }}>No invoices yet</p>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {recentInvoices.map(inv => (
                <Link key={inv._id} to="/app/portal/invoices" style={{ textDecoration: 'none' }}>
                  <div style={{
                    display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                    padding: '10px 14px', borderRadius: 10,
                    background: isDark ? 'rgba(255,255,255,0.03)' : '#f8fafc',
                    border: `1px solid ${bord}`,
                  }}>
                    <div>
                      <p style={{ margin: 0, fontSize: 13, fontWeight: 600, color: text }}>{inv.invoiceNumber}</p>
                      <p style={{ margin: '2px 0 0', fontSize: 11, color: muted }}>Due {formatDate(inv.dueDate)}</p>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      <p style={{ margin: 0, fontSize: 13, fontWeight: 700, color: text }}>{formatCurrency(inv.grandTotal, currency)}</p>
                      <span className={badgeClass(inv.status)} style={{ fontSize: 11 }}>{statusLabel(inv.status)}</span>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}