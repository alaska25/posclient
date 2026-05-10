import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useTheme } from '../../context/ThemeContext';
import { formatCurrency, formatDate, badgeClass, statusLabel } from '../../utils/format';
import { useCurrency } from '../../context/CurrencyContext';
import api from '../../utils/api';

const STATUS_FILTERS = [
  { value: '',           label: 'All'        },
  { value: 'pending',    label: 'Pending'    },
  { value: 'in_progress',label: 'In Progress'},
  { value: 'completed',  label: 'Completed'  },
  { value: 'cancelled',  label: 'Cancelled'  },
];

export default function PortalJobs() {
  const { isDark }   = useTheme();
  const { currency } = useCurrency();
  const [status, setStatus] = useState('');
  const [expanded, setExpanded] = useState(null);

  const { data, isLoading } = useQuery({
    queryKey: ['my-jobs', status],
    queryFn:  () => api.get('/jobs/my', { params: { status, limit: 50 } }).then(r => r.data),
  });

  const jobs  = data?.data ?? [];
  const text  = isDark ? '#e8edf5' : '#1b254b';
  const muted = isDark ? '#8a9bb5' : '#707eae';
  const card  = isDark ? 'rgba(255,255,255,0.03)' : '#fff';
  const bord  = isDark ? 'rgba(255,255,255,0.07)' : '#e8edf5';
  const hover = isDark ? 'rgba(255,255,255,0.04)' : '#f8fafc';

  return (
    <div style={{ fontFamily: 'Outfit, sans-serif' }}>

      {/* Header */}
      <div style={{ marginBottom: 24 }}>
        <h1 style={{ margin: 0, fontSize: 24, fontWeight: 800, color: text, fontFamily: 'Syne, sans-serif' }}>My Jobs</h1>
        <p style={{ margin: '4px 0 0', fontSize: 14, color: muted }}>Track your service requests and work orders.</p>
      </div>

      {/* Filters */}
      <div style={{ display: 'flex', gap: 8, marginBottom: 20, flexWrap: 'wrap' }}>
        {STATUS_FILTERS.map(f => (
          <button
            key={f.value}
            onClick={() => setStatus(f.value)}
            style={{
              padding: '7px 16px', borderRadius: 100, fontSize: 13, fontWeight: 600,
              cursor: 'pointer', transition: 'all 0.2s', fontFamily: 'Outfit, sans-serif',
              background: status === f.value ? 'linear-gradient(135deg,#6366f1,#a855f7)' : card,
              color: status === f.value ? '#fff' : muted,
              border: `1px solid ${status === f.value ? 'transparent' : bord}`,
              boxShadow: status === f.value ? '0 4px 12px rgba(99,102,241,0.3)' : 'none',
            }}
          >
            {f.label}
          </button>
        ))}
      </div>

      {/* Loading */}
      {isLoading && (
        <div style={{ textAlign: 'center', padding: 48, color: muted }}>Loading…</div>
      )}

      {/* Empty */}
      {!isLoading && jobs.length === 0 && (
        <div style={{
          background: card, border: `1px solid ${bord}`, borderRadius: 16,
          padding: '64px 32px', textAlign: 'center',
        }}>
          <div style={{ fontSize: 40, marginBottom: 12 }}>🔧</div>
          <p style={{ fontWeight: 700, color: text, marginBottom: 4 }}>No jobs found</p>
          <p style={{ color: muted, fontSize: 13 }}>You have no {status || ''} service requests yet.</p>
        </div>
      )}

      {/* Job Cards */}
      {!isLoading && jobs.length > 0 && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {jobs.map(job => (
            <div
              key={job._id}
              style={{
                background: card, border: `1px solid ${expanded === job._id ? '#6366f1' : bord}`,
                borderRadius: 16, overflow: 'hidden', transition: 'border-color 0.2s',
              }}
            >
              {/* Job Row */}
              <div
                onClick={() => setExpanded(expanded === job._id ? null : job._id)}
                style={{
                  display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                  padding: '16px 20px', cursor: 'pointer',
                  background: expanded === job._id ? (isDark ? 'rgba(99,102,241,0.08)' : 'rgba(99,102,241,0.04)') : 'transparent',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                  <div>
                    <p style={{ margin: 0, fontSize: 14, fontWeight: 700, color: text, fontFamily: 'Syne, sans-serif' }}>{job.jobNumber}</p>
                    <p style={{ margin: '2px 0 0', fontSize: 12, color: muted }}>{job.description || 'No description'}</p>
                  </div>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                  <span className={badgeClass(job.status)}>{statusLabel(job.status)}</span>
                  <p style={{ margin: 0, fontSize: 14, fontWeight: 700, color: text }}>{formatCurrency(job.grandTotal, currency)}</p>
                  <span style={{ color: muted, fontSize: 18, transition: 'transform 0.2s', transform: expanded === job._id ? 'rotate(180deg)' : 'none', display: 'block' }}>⌄</span>
                </div>
              </div>

              {/* Expanded Details */}
              {expanded === job._id && (
                <div style={{ padding: '0 20px 20px', borderTop: `1px solid ${bord}` }}>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 16, margin: '16px 0' }}>
                    <div>
                      <p style={{ margin: 0, fontSize: 11, color: muted, fontWeight: 600, letterSpacing: '0.5px', textTransform: 'uppercase' }}>Assigned To</p>
                      <p style={{ margin: '4px 0 0', fontSize: 13, color: text, fontWeight: 600 }}>{job.assignedTo?.name || '—'}</p>
                    </div>
                    <div>
                      <p style={{ margin: 0, fontSize: 11, color: muted, fontWeight: 600, letterSpacing: '0.5px', textTransform: 'uppercase' }}>Due Date</p>
                      <p style={{ margin: '4px 0 0', fontSize: 13, color: text, fontWeight: 600 }}>{formatDate(job.dueDate) || '—'}</p>
                    </div>
                    <div>
                      <p style={{ margin: 0, fontSize: 11, color: muted, fontWeight: 600, letterSpacing: '0.5px', textTransform: 'uppercase' }}>Priority</p>
                      <p style={{ margin: '4px 0 0', fontSize: 13, color: text, fontWeight: 600, textTransform: 'capitalize' }}>{job.priority || '—'}</p>
                    </div>
                  </div>

                  {/* Service Lines */}
                  {job.lines?.length > 0 && (
                    <>
                      <p style={{ margin: '0 0 8px', fontSize: 11, color: muted, fontWeight: 600, letterSpacing: '0.5px', textTransform: 'uppercase' }}>Services</p>
                      <div style={{ background: isDark ? 'rgba(255,255,255,0.03)' : '#f8fafc', borderRadius: 10, overflow: 'hidden', border: `1px solid ${bord}` }}>
                        {job.lines.map((line, i) => (
                          <div key={i} style={{
                            display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                            padding: '10px 14px',
                            borderBottom: i < job.lines.length - 1 ? `1px solid ${bord}` : 'none',
                          }}>
                            <div>
                              <p style={{ margin: 0, fontSize: 13, fontWeight: 600, color: text }}>{line.service?.name || line.serviceName}</p>
                              <p style={{ margin: '1px 0 0', fontSize: 11, color: muted }}>{line.quantity} {line.unit} × {formatCurrency(line.unitPrice, currency)}</p>
                            </div>
                            <p style={{ margin: 0, fontSize: 13, fontWeight: 700, color: text }}>{formatCurrency(line.quantity * line.unitPrice, currency)}</p>
                          </div>
                        ))}
                      </div>
                    </>
                  )}

                  {/* Totals */}
                  <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 12 }}>
                    <div style={{ minWidth: 200 }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, color: muted, marginBottom: 4 }}>
                        <span>Subtotal</span><span>{formatCurrency(job.subtotal, currency)}</span>
                      </div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, color: muted, marginBottom: 8 }}>
                        <span>Tax</span><span>{formatCurrency(job.taxTotal, currency)}</span>
                      </div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 15, fontWeight: 800, color: text, borderTop: `1px solid ${bord}`, paddingTop: 8 }}>
                        <span>Total</span><span>{formatCurrency(job.grandTotal, currency)}</span>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}