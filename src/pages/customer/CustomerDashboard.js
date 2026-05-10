import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '../../context/AuthContext';
import api from '../../utils/api';
import {
  Briefcase, FileText, PlusCircle, User,
  Clock, CheckCircle, AlertCircle, XCircle,
  ChevronRight, Star, Download, Send, LayoutDashboard,
  CreditCard, X, Loader, RefreshCw,
} from 'lucide-react';

// ── Status config ─────────────────────────────────────────────────────────────
const STATUS_CONFIG = {
  completed:   { color: '#10b981', bg: 'rgba(16,185,129,0.1)',  icon: CheckCircle, label: 'Completed'   },
  in_progress: { color: '#6366f1', bg: 'rgba(99,102,241,0.1)',  icon: Clock,       label: 'In Progress' },
  draft:       { color: '#64748b', bg: 'rgba(100,116,139,0.1)', icon: Clock,       label: 'Draft'       },
  upcoming:    { color: '#6366f1', bg: 'rgba(99,102,241,0.1)',  icon: Clock,       label: 'Upcoming'    },
  pending:     { color: '#f59e0b', bg: 'rgba(245,158,11,0.1)',  icon: AlertCircle, label: 'Pending'     },
  cancelled:   { color: '#ef4444', bg: 'rgba(239,68,68,0.1)',   icon: XCircle,     label: 'Cancelled'   },
  paid:        { color: '#10b981', bg: 'rgba(16,185,129,0.1)',  icon: CheckCircle, label: 'Paid'        },
  sent:        { color: '#6366f1', bg: 'rgba(99,102,241,0.1)',  icon: Send,        label: 'Sent'        },
  overdue:     { color: '#ef4444', bg: 'rgba(239,68,68,0.1)',   icon: AlertCircle, label: 'Overdue'     },
};

const SERVICES = [
  'Electrical Repairs', 'Plumbing Services', 'HVAC & Aircon',
  'Appliance Repair', 'Home Renovation', 'Security Systems',
];

// ── Helpers ───────────────────────────────────────────────────────────────────
function StatusBadge({ status }) {
  const cfg = STATUS_CONFIG[status] || STATUS_CONFIG.pending;
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center', gap: 5,
      padding: '4px 10px', borderRadius: 100,
      background: cfg.bg, color: cfg.color,
      fontSize: 12, fontWeight: 600,
    }}>
      <cfg.icon size={12} />
      {cfg.label}
    </span>
  );
}

function StarRating({ rating, interactive = false, onRate }) {
  const [hovered, setHovered] = useState(null);
  const display = hovered ?? rating ?? 0;
  return (
    <div style={{ display: 'flex', gap: 2 }}>
      {[1, 2, 3, 4, 5].map(i => (
        <Star
          key={i} size={interactive ? 20 : 14}
          fill={i <= display ? '#f59e0b' : 'none'}
          color={i <= display ? '#f59e0b' : '#d1d5db'}
          style={{ cursor: interactive ? 'pointer' : 'default', transition: 'transform 0.1s', transform: interactive && i <= display ? 'scale(1.15)' : 'scale(1)' }}
          onMouseEnter={() => interactive && setHovered(i)}
          onMouseLeave={() => interactive && setHovered(null)}
          onClick={() => interactive && onRate?.(i)}
        />
      ))}
    </div>
  );
}

// ── Loading skeleton ──────────────────────────────────────────────────────────
function LoadingSkeleton() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      {[1, 2, 3].map(i => (
        <div key={i} style={{ background: '#f1f5f9', borderRadius: 16, height: 80, animation: 'pulse 1.5s ease-in-out infinite' }} />
      ))}
      <style>{`@keyframes pulse { 0%,100%{opacity:1} 50%{opacity:.5} }`}</style>
    </div>
  );
}

// ── Error box ─────────────────────────────────────────────────────────────────
function ErrorBox({ message, onRetry }) {
  return (
    <div style={{ padding: '24px', background: 'rgba(239,68,68,0.06)', border: '1px solid rgba(239,68,68,0.2)', borderRadius: 16, textAlign: 'center' }}>
      <p style={{ color: '#ef4444', fontSize: 14, marginBottom: 12 }}>{message}</p>
      {onRetry && (
        <button onClick={onRetry} style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '8px 16px', borderRadius: 8, border: '1px solid rgba(239,68,68,0.3)', background: '#fff', color: '#ef4444', fontSize: 13, fontWeight: 600, cursor: 'pointer' }}>
          <RefreshCw size={13} /> Retry
        </button>
      )}
    </div>
  );
}

// ── Overview Tab ──────────────────────────────────────────────────────────────
function Overview({ user, setTab, jobs, invoices, jobsLoading, invoicesLoading }) {
  const stats = [
    { label: 'Total Bookings',   value: jobs.length,                                              icon: Briefcase,     color: '#6366f1', bg: 'rgba(99,102,241,0.1)'  },
    { label: 'Completed Jobs',   value: jobs.filter(j => j.status === 'completed').length,        icon: CheckCircle,   color: '#10b981', bg: 'rgba(16,185,129,0.1)'  },
    { label: 'Pending Invoices', value: invoices.filter(i => i.status !== 'paid').length,         icon: FileText,      color: '#f59e0b', bg: 'rgba(245,158,11,0.1)'  },
    { label: 'Active Jobs',      value: jobs.filter(j => j.status === 'in_progress').length,      icon: Clock,         color: '#a855f7', bg: 'rgba(168,85,247,0.1)'  },
  ];

  const recentJobs = jobs.slice(0, 3);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 28 }}>
      {/* Welcome banner */}
      <div style={{
        background: 'linear-gradient(135deg, #6366f1, #a855f7)',
        borderRadius: 20, padding: '28px 32px',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        boxShadow: '0 8px 32px rgba(99,102,241,0.25)',
        position: 'relative', overflow: 'hidden', flexWrap: 'wrap', gap: 16,
      }}>
        <div style={{ position: 'absolute', top: -30, right: -30, width: 180, height: 180, borderRadius: '50%', background: 'rgba(255,255,255,0.08)', pointerEvents: 'none' }} />
        <div style={{ position: 'relative' }}>
          <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.75)', marginBottom: 4, fontWeight: 500 }}>Welcome back 👋</p>
          <h2 style={{ fontFamily: 'Syne, sans-serif', fontSize: 26, fontWeight: 800, color: '#fff', margin: 0, letterSpacing: '-0.5px' }}>
            {user?.name || 'Customer'}
          </h2>
          <p style={{ fontSize: 14, color: 'rgba(255,255,255,0.65)', marginTop: 6, marginBottom: 0 }}>
            You have <strong style={{ color: '#fff' }}>{jobs.filter(j => j.status === 'in_progress').length}</strong> active service{jobs.filter(j => j.status === 'in_progress').length !== 1 ? 's' : ''} in progress.
          </p>
        </div>
        <button onClick={() => setTab('request')} style={{ position: 'relative', display: 'flex', alignItems: 'center', gap: 8, padding: '12px 22px', borderRadius: 12, border: 'none', cursor: 'pointer', background: '#fff', color: '#6366f1', fontWeight: 700, fontSize: 14, fontFamily: 'DM Sans, sans-serif', whiteSpace: 'nowrap', boxShadow: '0 4px 14px rgba(0,0,0,0.15)' }}>
          <PlusCircle size={16} /> Book a Service
        </button>
      </div>

      {/* Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: 16 }}>
        {stats.map((s, i) => (
          <div key={i} style={{ background: '#fff', borderRadius: 16, padding: '20px 22px', border: '1px solid #e8ecf8', boxShadow: '0 2px 12px rgba(99,102,241,0.06)' }}>
            <div style={{ width: 38, height: 38, borderRadius: 10, background: s.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 14 }}>
              <s.icon size={18} color={s.color} />
            </div>
            <div style={{ fontFamily: 'Syne, sans-serif', fontSize: 28, fontWeight: 800, color: '#1e1b4b', lineHeight: 1 }}>
              {jobsLoading || invoicesLoading ? '—' : s.value}
            </div>
            <div style={{ fontSize: 12, color: '#94a3b8', marginTop: 4, fontWeight: 500 }}>{s.label}</div>
          </div>
        ))}
      </div>

      {/* Recent jobs */}
      <div style={{ background: '#fff', borderRadius: 20, border: '1px solid #e8ecf8', overflow: 'hidden', boxShadow: '0 2px 12px rgba(99,102,241,0.06)' }}>
        <div style={{ padding: '20px 24px', borderBottom: '1px solid #f0f4ff', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <h3 style={{ fontFamily: 'Syne, sans-serif', fontSize: 16, fontWeight: 700, color: '#1e1b4b', margin: 0 }}>Recent Jobs</h3>
          <button onClick={() => setTab('bookings')} style={{ background: 'none', border: 'none', color: '#6366f1', fontSize: 13, fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 4 }}>
            View all <ChevronRight size={14} />
          </button>
        </div>
        {jobsLoading ? <div style={{ padding: 24 }}><LoadingSkeleton /></div> : recentJobs.length === 0 ? (
          <div style={{ padding: '40px 24px', textAlign: 'center', color: '#94a3b8', fontSize: 14 }}>No jobs yet.</div>
        ) : recentJobs.map((j, i) => (
          <div key={j._id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '16px 24px', borderBottom: i < recentJobs.length - 1 ? '1px solid #f8f9ff' : 'none' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
              <div style={{ width: 40, height: 40, borderRadius: 12, background: 'linear-gradient(135deg,rgba(99,102,241,0.1),rgba(168,85,247,0.1))', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Briefcase size={18} color="#6366f1" />
              </div>
              <div>
                <p style={{ fontSize: 14, fontWeight: 600, color: '#1e1b4b', margin: 0 }}>{j.description || j.jobNumber}</p>
                <p style={{ fontSize: 12, color: '#94a3b8', margin: 0 }}>{j.jobNumber} · {j.assignedTo?.name || 'Pending Assignment'}</p>
              </div>
            </div>
            <StatusBadge status={j.status} />
          </div>
        ))}
      </div>
    </div>
  );
}

// ── Bookings Tab ──────────────────────────────────────────────────────────────
function Bookings({ jobs, loading, error, refetch }) {
  const [filter, setFilter] = useState('all');
  const filters = ['all', 'in_progress', 'completed', 'pending', 'cancelled'];
  const filtered = filter === 'all' ? jobs : jobs.filter(j => j.status === filter);

  if (error) return <ErrorBox message="Failed to load jobs." onRetry={refetch} />;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      <div>
        <h2 style={{ fontFamily: 'Syne, sans-serif', fontSize: 22, fontWeight: 800, color: '#1e1b4b', margin: '0 0 4px' }}>My Jobs</h2>
        <p style={{ fontSize: 14, color: '#94a3b8', margin: 0 }}>Track all your service jobs</p>
      </div>

      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
        {filters.map(f => (
          <button key={f} onClick={() => setFilter(f)} style={{ padding: '7px 16px', borderRadius: 100, border: filter === f ? 'none' : '1px solid #e8ecf8', cursor: 'pointer', fontFamily: 'DM Sans, sans-serif', fontSize: 13, fontWeight: 600, background: filter === f ? 'linear-gradient(135deg,#6366f1,#a855f7)' : '#fff', color: filter === f ? '#fff' : '#64748b', boxShadow: filter === f ? '0 4px 12px rgba(99,102,241,0.3)' : 'none', textTransform: 'capitalize', transition: 'all 0.2s' }}>
            {f === 'in_progress' ? 'In Progress' : f.charAt(0).toUpperCase() + f.slice(1)}
          </button>
        ))}
      </div>

      {loading ? <LoadingSkeleton /> : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {filtered.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '48px 24px', color: '#94a3b8', fontSize: 14 }}>No jobs found.</div>
          ) : filtered.map((j, i) => (
            <div key={j._id} style={{ background: '#fff', borderRadius: 16, padding: '20px 24px', border: '1px solid #e8ecf8', boxShadow: '0 2px 8px rgba(99,102,241,0.05)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                <div style={{ width: 46, height: 46, borderRadius: 14, background: 'linear-gradient(135deg,rgba(99,102,241,0.1),rgba(168,85,247,0.1))', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Briefcase size={20} color="#6366f1" />
                </div>
                <div>
                  <p style={{ fontSize: 15, fontWeight: 700, color: '#1e1b4b', margin: 0 }}>{j.description || j.jobNumber}</p>
                  <p style={{ fontSize: 12, color: '#94a3b8', margin: '2px 0 0' }}>{j.jobNumber} · {j.assignedTo?.name || 'Pending Assignment'}</p>
                </div>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 16, flexWrap: 'wrap' }}>
                <div style={{ textAlign: 'right' }}>
                  <p style={{ fontSize: 13, fontWeight: 600, color: '#1e1b4b', margin: 0 }}>
                    {j.dueDate ? new Date(j.dueDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : '—'}
                  </p>
                </div>
                <StatusBadge status={j.status} />
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ── Invoices Tab ──────────────────────────────────────────────────────────────
function InvoicesTab({ invoices, loading, error, refetch }) {
  const totalPaid    = invoices.filter(i => i.status === 'paid').reduce((s, i) => s + (i.grandTotal || 0), 0);
  const totalPending = invoices.filter(i => i.status !== 'paid').reduce((s, i) => s + (i.grandTotal || 0), 0);

  const handleDownload = async (invoice) => {
    try {
      const res = await api.get(`/invoices/${invoice._id}/pdf`, { responseType: 'blob' });
      const url = URL.createObjectURL(new Blob([res.data], { type: 'application/pdf' }));
      const a   = document.createElement('a');
      a.href    = url;
      a.download = `${invoice.invoiceNumber}.pdf`;
      a.click();
      URL.revokeObjectURL(url);
    } catch {
      alert('Failed to download PDF.');
    }
  };

  if (error) return <ErrorBox message="Failed to load invoices." onRetry={refetch} />;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      <div>
        <h2 style={{ fontFamily: 'Syne, sans-serif', fontSize: 22, fontWeight: 800, color: '#1e1b4b', margin: '0 0 4px' }}>Invoices</h2>
        <p style={{ fontSize: 14, color: '#94a3b8', margin: 0 }}>Your payment history and outstanding invoices</p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: 16 }}>
        {[
          { label: 'Total Paid',     value: `₱${totalPaid.toLocaleString()}`,    color: '#10b981', bg: 'rgba(16,185,129,0.08)'  },
          { label: 'Outstanding',    value: `₱${totalPending.toLocaleString()}`, color: '#f59e0b', bg: 'rgba(245,158,11,0.08)'  },
          { label: 'Total Invoices', value: invoices.length,                     color: '#6366f1', bg: 'rgba(99,102,241,0.08)'  },
        ].map((s, i) => (
          <div key={i} style={{ background: s.bg, borderRadius: 14, padding: '18px 22px', border: `1px solid ${s.color}33` }}>
            <p style={{ fontSize: 12, color: s.color, fontWeight: 600, margin: '0 0 6px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>{s.label}</p>
            <p style={{ fontFamily: 'Syne, sans-serif', fontSize: 24, fontWeight: 800, color: '#1e1b4b', margin: 0 }}>
              {loading ? '—' : s.value}
            </p>
          </div>
        ))}
      </div>

      {loading ? <LoadingSkeleton /> : (
        <div style={{ background: '#fff', borderRadius: 20, border: '1px solid #e8ecf8', overflow: 'hidden', boxShadow: '0 2px 12px rgba(99,102,241,0.06)' }}>
          <div style={{ padding: '18px 24px', borderBottom: '1px solid #f0f4ff' }}>
            <h3 style={{ fontFamily: 'Syne, sans-serif', fontSize: 15, fontWeight: 700, color: '#1e1b4b', margin: 0 }}>All Invoices</h3>
          </div>
          {invoices.length === 0 ? (
            <div style={{ padding: '40px 24px', textAlign: 'center', color: '#94a3b8', fontSize: 14 }}>No invoices yet.</div>
          ) : invoices.map((inv, i) => (
            <div key={inv._id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '16px 24px', borderBottom: i < invoices.length - 1 ? '1px solid #f8f9ff' : 'none', flexWrap: 'wrap', gap: 12 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                <div style={{ width: 40, height: 40, borderRadius: 12, background: 'rgba(99,102,241,0.08)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <FileText size={18} color="#6366f1" />
                </div>
                <div>
                  <p style={{ fontSize: 14, fontWeight: 600, color: '#1e1b4b', margin: 0 }}>{inv.job?.vesselName || inv.invoiceNumber}</p>
                  <p style={{ fontSize: 12, color: '#94a3b8', margin: 0 }}>
                    {inv.invoiceNumber} · {inv.createdAt ? new Date(inv.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : '—'}
                  </p>
                </div>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                <span style={{ fontFamily: 'Syne, sans-serif', fontSize: 16, fontWeight: 800, color: '#1e1b4b' }}>
                  ₱{(inv.grandTotal || 0).toLocaleString()}
                </span>
                <StatusBadge status={inv.status} />
                <button
                  onClick={() => handleDownload(inv)}
                  style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '7px 14px', borderRadius: 8, border: '1px solid #e8ecf8', background: '#fff', color: '#64748b', fontSize: 12, fontWeight: 600, cursor: 'pointer' }}
                >
                  <Download size={13} /> PDF
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ── Service Request Tab ───────────────────────────────────────────────────────
function ServiceRequest() {
  const [form, setForm]         = useState({ service: '', date: '', time: '', address: '', notes: '' });
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = () => {
    if (!form.service || !form.date || !form.time || !form.address) return;
    // TODO: connect to POST /api/bookings or a customer request endpoint
    setSubmitted(true);
    setTimeout(() => { setSubmitted(false); setForm({ service: '', date: '', time: '', address: '', notes: '' }); }, 4000);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20, maxWidth: 640 }}>
      <div>
        <h2 style={{ fontFamily: 'Syne, sans-serif', fontSize: 22, fontWeight: 800, color: '#1e1b4b', margin: '0 0 4px' }}>Book a Service</h2>
        <p style={{ fontSize: 14, color: '#94a3b8', margin: 0 }}>Submit a new service request and we'll assign a technician</p>
      </div>

      {submitted ? (
        <div style={{ background: 'rgba(16,185,129,0.08)', border: '1px solid rgba(16,185,129,0.25)', borderRadius: 20, padding: '48px 32px', textAlign: 'center' }}>
          <div style={{ fontSize: 52, marginBottom: 14 }}>✅</div>
          <h3 style={{ fontFamily: 'Syne, sans-serif', fontSize: 20, fontWeight: 800, color: '#1e1b4b', marginBottom: 8 }}>Request Submitted!</h3>
          <p style={{ color: '#64748b', fontSize: 14 }}>We'll assign a technician and confirm within 2 hours.</p>
        </div>
      ) : (
        <div style={{ background: '#fff', borderRadius: 20, border: '1px solid #e8ecf8', padding: '28px', display: 'flex', flexDirection: 'column', gap: 20, boxShadow: '0 2px 12px rgba(99,102,241,0.06)' }}>
          {[
            { label: 'Service Type',      key: 'service', type: 'select'   },
            { label: 'Preferred Date',    key: 'date',    type: 'date'     },
            { label: 'Preferred Time',    key: 'time',    type: 'time'     },
            { label: 'Address',           key: 'address', type: 'text',     placeholder: 'Your full address'      },
            { label: 'Additional Notes',  key: 'notes',   type: 'textarea', placeholder: 'Describe your issue...' },
          ].map(({ label, key, type, placeholder }) => (
            <div key={key}>
              <label style={{ display: 'block', fontSize: 12, fontWeight: 700, color: '#374151', marginBottom: 8, textTransform: 'uppercase', letterSpacing: '0.5px', fontFamily: 'Syne, sans-serif' }}>{label}</label>
              {type === 'select' ? (
                <select value={form[key]} onChange={e => setForm({ ...form, [key]: e.target.value })} style={{ width: '100%', padding: '12px 14px', borderRadius: 10, border: '1.5px solid #e5e7eb', fontSize: 14, color: '#111827', background: '#fff', outline: 'none', fontFamily: 'DM Sans, sans-serif' }}>
                  <option value="" disabled>Select a service</option>
                  {SERVICES.map(s => <option key={s} value={s}>{s}</option>)}
                </select>
              ) : type === 'textarea' ? (
                <textarea rows={4} placeholder={placeholder} value={form[key]} onChange={e => setForm({ ...form, [key]: e.target.value })} style={{ width: '100%', padding: '12px 14px', borderRadius: 10, border: '1.5px solid #e5e7eb', fontSize: 14, color: '#111827', resize: 'vertical', outline: 'none', fontFamily: 'DM Sans, sans-serif' }} />
              ) : (
                <input type={type} placeholder={placeholder} value={form[key]} onChange={e => setForm({ ...form, [key]: e.target.value })} style={{ width: '100%', padding: '12px 14px', borderRadius: 10, border: '1.5px solid #e5e7eb', fontSize: 14, color: '#111827', outline: 'none', fontFamily: 'DM Sans, sans-serif' }} />
              )}
            </div>
          ))}
          <button onClick={handleSubmit} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, padding: '14px', borderRadius: 12, border: 'none', cursor: 'pointer', background: 'linear-gradient(135deg,#6366f1,#a855f7)', color: '#fff', fontSize: 15, fontWeight: 700, fontFamily: 'Syne, sans-serif', boxShadow: '0 6px 20px rgba(99,102,241,0.35)' }}>
            <Send size={16} /> Submit Service Request
          </button>
        </div>
      )}
    </div>
  );
}

// ── Profile Tab ───────────────────────────────────────────────────────────────
function Profile({ user }) {
  const [form, setForm] = useState({ name: user?.name || '', email: user?.email || '', phone: user?.phone || '', address: user?.address || '' });
  const [saved, setSaved] = useState(false);

  const handleSave = async () => {
    try {
      await api.put('/auth/me', { name: form.name, phone: form.phone, address: form.address });
      setSaved(true);
      setTimeout(() => setSaved(false), 2500);
    } catch {
      alert('Failed to save changes.');
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20, maxWidth: 600 }}>
      <div>
        <h2 style={{ fontFamily: 'Syne, sans-serif', fontSize: 22, fontWeight: 800, color: '#1e1b4b', margin: '0 0 4px' }}>Profile Settings</h2>
        <p style={{ fontSize: 14, color: '#94a3b8', margin: 0 }}>Manage your account details</p>
      </div>
      <div style={{ background: '#fff', borderRadius: 20, border: '1px solid #e8ecf8', padding: '24px 28px', display: 'flex', alignItems: 'center', gap: 20, boxShadow: '0 2px 12px rgba(99,102,241,0.06)' }}>
        <div style={{ width: 72, height: 72, borderRadius: '50%', background: 'linear-gradient(135deg,#6366f1,#a855f7)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 28, fontWeight: 800, color: '#fff', fontFamily: 'Syne, sans-serif', flexShrink: 0 }}>
          {form.name?.charAt(0)?.toUpperCase() || 'C'}
        </div>
        <div>
          <p style={{ fontFamily: 'Syne, sans-serif', fontSize: 18, fontWeight: 800, color: '#1e1b4b', margin: 0 }}>{form.name || 'Customer'}</p>
          <p style={{ fontSize: 13, color: '#94a3b8', margin: '2px 0 0' }}>{form.email}</p>
          <span style={{ display: 'inline-block', marginTop: 6, fontSize: 11, fontWeight: 700, color: '#7c3aed', background: 'rgba(124,58,237,0.1)', border: '1px solid rgba(124,58,237,0.2)', padding: '3px 10px', borderRadius: 100, textTransform: 'uppercase', letterSpacing: '0.5px' }}>Customer</span>
        </div>
      </div>
      <div style={{ background: '#fff', borderRadius: 20, border: '1px solid #e8ecf8', padding: '28px', display: 'flex', flexDirection: 'column', gap: 18, boxShadow: '0 2px 12px rgba(99,102,241,0.06)' }}>
        {[
          { label: 'Full Name',     key: 'name',    type: 'text',  placeholder: 'Your full name'      },
          { label: 'Email Address', key: 'email',   type: 'email', placeholder: 'your@email.com',     disabled: true },
          { label: 'Phone Number',  key: 'phone',   type: 'tel',   placeholder: '+63 9XX XXX XXXX'    },
          { label: 'Address',       key: 'address', type: 'text',  placeholder: 'Your address'        },
        ].map(({ label, key, type, placeholder, disabled }) => (
          <div key={key}>
            <label style={{ display: 'block', fontSize: 12, fontWeight: 700, color: '#374151', marginBottom: 8, textTransform: 'uppercase', letterSpacing: '0.5px', fontFamily: 'Syne, sans-serif' }}>{label}</label>
            <input type={type} placeholder={placeholder} value={form[key]} disabled={disabled} onChange={e => setForm({ ...form, [key]: e.target.value })} style={{ width: '100%', padding: '12px 14px', borderRadius: 10, border: '1.5px solid #e5e7eb', fontSize: 14, color: disabled ? '#94a3b8' : '#111827', outline: 'none', fontFamily: 'DM Sans, sans-serif', background: disabled ? '#f8f9ff' : '#fff', cursor: disabled ? 'not-allowed' : 'text' }} />
          </div>
        ))}
        <button onClick={handleSave} style={{ padding: '13px', borderRadius: 12, border: 'none', cursor: 'pointer', background: saved ? 'linear-gradient(135deg,#10b981,#059669)' : 'linear-gradient(135deg,#6366f1,#a855f7)', color: '#fff', fontSize: 14, fontWeight: 700, fontFamily: 'Syne, sans-serif', transition: 'background 0.3s', boxShadow: '0 4px 14px rgba(99,102,241,0.3)' }}>
          {saved ? '✓ Changes Saved!' : 'Save Changes'}
        </button>
      </div>
    </div>
  );
}

// ── Main CustomerDashboard ────────────────────────────────────────────────────
export default function CustomerDashboard() {
  const { user } = useAuth();
  const [tab, setTab] = useState('overview');

  // ── Real API calls ──────────────────────────────────────────────────────────
  const {
    data: jobsData,
    isLoading: jobsLoading,
    isError: jobsError,
    refetch: refetchJobs,
  } = useQuery({
    queryKey: ['my-jobs'],
    queryFn:  () => api.get('/jobs/my').then(r => r.data),
  });

  const {
    data: invoicesData,
    isLoading: invoicesLoading,
    isError: invoicesError,
    refetch: refetchInvoices,
  } = useQuery({
    queryKey: ['my-invoices'],
    queryFn:  () => api.get('/invoices/my').then(r => r.data),
  });

  const jobs     = jobsData?.data     ?? [];
  const invoices = invoicesData?.data ?? [];

  const TABS = [
    { key: 'overview', label: 'Overview',    icon: LayoutDashboard },
    { key: 'bookings', label: 'My Jobs',     icon: Briefcase       },
    { key: 'invoices', label: 'Invoices',    icon: FileText        },
    { key: 'request',  label: 'New Request', icon: PlusCircle      },
    { key: 'profile',  label: 'Profile',     icon: User            },
  ];

  return (
    <div style={{ fontFamily: "'DM Sans', sans-serif" }}>
      <style>{`@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }`}</style>
      <link href="https://fonts.googleapis.com/css2?family=DM+Sans:wght@300;400;500;600;700&family=Syne:wght@700;800&display=swap" rel="stylesheet" />

      <div style={{ marginBottom: 28 }}>
        <h1 style={{ fontFamily: 'Syne, sans-serif', fontSize: 26, fontWeight: 800, color: '#1e1b4b', margin: 0, letterSpacing: '-0.5px' }}>Customer Portal</h1>
        <p style={{ fontSize: 14, color: '#94a3b8', margin: '4px 0 0' }}>Manage your jobs, invoices, and profile</p>
      </div>

      {/* Tab bar */}
      <div style={{ display: 'flex', gap: 4, marginBottom: 24, background: '#fff', padding: 6, borderRadius: 14, border: '1px solid #e8ecf8', width: 'fit-content', boxShadow: '0 2px 8px rgba(99,102,241,0.06)', flexWrap: 'wrap' }}>
        {TABS.map(({ key, label, icon: Icon }) => (
          <button key={key} onClick={() => setTab(key)} style={{ display: 'flex', alignItems: 'center', gap: 7, padding: '9px 18px', borderRadius: 10, border: 'none', cursor: 'pointer', background: tab === key ? 'linear-gradient(135deg,#6366f1,#a855f7)' : 'transparent', color: tab === key ? '#fff' : '#64748b', fontSize: 13, fontWeight: 600, fontFamily: 'DM Sans, sans-serif', boxShadow: tab === key ? '0 4px 12px rgba(99,102,241,0.3)' : 'none', transition: 'all 0.2s', whiteSpace: 'nowrap' }}>
            <Icon size={15} />{label}
          </button>
        ))}
      </div>

      {tab === 'overview' && <Overview user={user} setTab={setTab} jobs={jobs} invoices={invoices} jobsLoading={jobsLoading} invoicesLoading={invoicesLoading} />}
      {tab === 'bookings' && <Bookings jobs={jobs} loading={jobsLoading} error={jobsError} refetch={refetchJobs} />}
      {tab === 'invoices' && <InvoicesTab invoices={invoices} loading={invoicesLoading} error={invoicesError} refetch={refetchInvoices} />}
      {tab === 'request'  && <ServiceRequest />}
      {tab === 'profile'  && <Profile user={user} />}
    </div>
  );
}