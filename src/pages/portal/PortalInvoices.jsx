import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useTheme } from '../../context/ThemeContext';
import { formatCurrency, formatDate, badgeClass, statusLabel } from '../../utils/format';
import { useCurrency } from '../../context/CurrencyContext';
import api from '../../utils/api';

const STATUS_FILTERS = [
  { value: '',       label: 'All'     },
  { value: 'draft',  label: 'Draft'   },
  { value: 'sent',   label: 'Sent'    },
  { value: 'paid',   label: 'Paid'    },
  { value: 'overdue',label: 'Overdue' },
];

export default function PortalInvoices() {
  const { isDark }   = useTheme();
  const { currency } = useCurrency();
  const [status, setStatus] = useState('');

  const { data, isLoading } = useQuery({
    queryKey: ['my-invoices', status],
    queryFn:  () => api.get('/invoices/my', { params: { status, limit: 50 } }).then(r => r.data),
  });

  const invoices = data?.data ?? [];
  const text     = isDark ? '#e8edf5' : '#1b254b';
  const muted    = isDark ? '#8a9bb5' : '#707eae';
  const card     = isDark ? 'rgba(255,255,255,0.03)' : '#fff';
  const bord     = isDark ? 'rgba(255,255,255,0.07)' : '#e8edf5';

  const totalPaid    = invoices.filter(i => i.status === 'paid').reduce((s, i) => s + (i.grandTotal || 0), 0);
  const totalPending = invoices.filter(i => i.status !== 'paid').reduce((s, i) => s + (i.grandTotal || 0), 0);

  return (
    <div style={{ fontFamily: 'Outfit, sans-serif' }}>

      {/* Header */}
      <div style={{ marginBottom: 24 }}>
        <h1 style={{ margin: 0, fontSize: 24, fontWeight: 800, color: text, fontFamily: 'Syne, sans-serif' }}>My Invoices</h1>
        <p style={{ margin: '4px 0 0', fontSize: 14, color: muted }}>View and track your billing history.</p>
      </div>

      {/* Summary */}
      <div style={{ display: 'flex', gap: 16, marginBottom: 24, flexWrap: 'wrap' }}>
        {[
          { label: 'Total Invoices', value: invoices.length, color: '#6366f1', bg: 'rgba(99,102,241,0.1)' },
          { label: 'Paid',           value: formatCurrency(totalPaid, currency),    color: '#16a34a', bg: 'rgba(22,163,74,0.1)' },
          { label: 'Outstanding',    value: formatCurrency(totalPending, currency),  color: totalPending > 0 ? '#ef4444' : '#16a34a', bg: totalPending > 0 ? 'rgba(239,68,68,0.1)' : 'rgba(22,163,74,0.1)' },
        ].map(s => (
          <div key={s.label} style={{
            flex: 1, minWidth: 160,
            background: card, border: `1px solid ${bord}`, borderRadius: 14,
            padding: '16px 20px',
          }}>
            <p style={{ margin: 0, fontSize: 11, color: muted, fontWeight: 600, letterSpacing: '0.5px', textTransform: 'uppercase' }}>{s.label}</p>
            <p style={{ margin: '6px 0 0', fontSize: 22, fontWeight: 800, color: s.color, fontFamily: 'Syne, sans-serif' }}>{s.value}</p>
          </div>
        ))}
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
      {isLoading && <div style={{ textAlign: 'center', padding: 48, color: muted }}>Loading…</div>}

      {/* Empty */}
      {!isLoading && invoices.length === 0 && (
        <div style={{ background: card, border: `1px solid ${bord}`, borderRadius: 16, padding: '64px 32px', textAlign: 'center' }}>
          <div style={{ fontSize: 40, marginBottom: 12 }}>🧾</div>
          <p style={{ fontWeight: 700, color: text, marginBottom: 4 }}>No invoices found</p>
          <p style={{ color: muted, fontSize: 13 }}>Your invoices will appear here once generated.</p>
        </div>
      )}

      {/* Invoice Table */}
      {!isLoading && invoices.length > 0 && (
        <div style={{ background: card, border: `1px solid ${bord}`, borderRadius: 16, overflow: 'hidden' }}>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ background: isDark ? 'rgba(255,255,255,0.03)' : '#f8fafc' }}>
                  {['Invoice #', 'Job', 'Status', 'Total', 'Due Date'].map(h => (
                    <th key={h} style={{
                      padding: '12px 20px', textAlign: 'left',
                      fontSize: 11, fontWeight: 700, color: muted,
                      letterSpacing: '0.5px', textTransform: 'uppercase',
                      borderBottom: `1px solid ${bord}`,
                    }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {invoices.map((inv, i) => (
                  <tr
                    key={inv._id}
                    style={{
                      borderBottom: i < invoices.length - 1 ? `1px solid ${bord}` : 'none',
                      transition: 'background 0.15s',
                    }}
                    onMouseEnter={e => e.currentTarget.style.background = isDark ? 'rgba(255,255,255,0.03)' : '#f8fafc'}
                    onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                  >
                    <td style={{ padding: '14px 20px' }}>
                      <span style={{
                        fontFamily: 'JetBrains Mono, monospace', fontSize: 12, fontWeight: 700,
                        color: '#6366f1', background: 'rgba(99,102,241,0.1)',
                        padding: '3px 8px', borderRadius: 6,
                      }}>
                        {inv.invoiceNumber}
                      </span>
                    </td>
                    <td style={{ padding: '14px 20px', fontSize: 13, color: muted }}>
                      {inv.job?.jobNumber || '—'}
                    </td>
                    <td style={{ padding: '14px 20px' }}>
                      <span className={badgeClass(inv.status)}>{statusLabel(inv.status)}</span>
                    </td>
                    <td style={{ padding: '14px 20px', fontSize: 14, fontWeight: 700, color: text }}>
                      {formatCurrency(inv.grandTotal, currency)}
                    </td>
                    <td style={{ padding: '14px 20px', fontSize: 13, color: muted }}>
                      {formatDate(inv.dueDate) || '—'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}