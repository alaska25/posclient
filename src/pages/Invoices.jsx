import React, { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Search, Download } from 'lucide-react';
import api from '../utils/api';
import { formatCurrency, formatDate, badgeClass, statusLabel } from '../utils/format';
import { useAuth } from '../context/AuthContext';
import { useCurrency } from '../context/CurrencyContext';

const STATUSES = ['', 'draft', 'sent', 'paid', 'partial', 'overdue', 'cancelled'];

function useDebounce(value, delay = 350) {
  const [debounced, setDebounced] = useState(value);
  useEffect(() => {
    const t = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(t);
  }, [value, delay]);
  return debounced;
}

const planColor = { None: '#94a3b8', Basic: '#0369a1', Standard: '#7c3aed', Premium: '#b45309' };
const planBg    = { None: '#f8fafc', Basic: '#e0f2fe', Standard: '#f5f3ff', Premium: '#fffbeb' };

const ratingColor = { VIP: '#7c3aed', Regular: '#0369a1', Blacklisted: '#dc2626' };
const ratingBg    = { VIP: '#f5f3ff', Regular: '#e0f2fe', Blacklisted: '#fef2f2' };

const priorityColor = { low: '#0369a1', medium: '#b45309', high: '#dc2626', urgent: '#7c3aed' };
const priorityBg    = { low: '#e0f2fe', medium: '#fffbeb', high: '#fef2f2', urgent: '#f5f3ff' };

function PriorityBadge({ priority }) {
  if (!priority) return <span style={{ color: 'var(--text-muted)', fontSize: 12 }}>—</span>;
  return (
    <span style={{
      fontSize: 11, fontWeight: 700, padding: '3px 8px', borderRadius: 999,
      color: priorityColor[priority] ?? '#475569',
      background: priorityBg[priority] ?? '#f1f5f9',
      textTransform: 'capitalize',
    }}>
      {priority}
    </span>
  );
}

function PlanBadge({ plan }) {
  if (!plan || plan === 'None') return <span style={{ color: 'var(--text-muted)', fontSize: 12 }}>—</span>;
  return (
    <span style={{
      fontSize: 11, fontWeight: 700, padding: '3px 8px', borderRadius: 999,
      color: planColor[plan] ?? '#475569',
      background: planBg[plan] ?? '#f1f5f9',
    }}>
      {plan}
    </span>
  );
}

function RatingBadge({ rating }) {
  if (!rating) return null;
  return (
    <span style={{
      fontSize: 10, fontWeight: 700, padding: '2px 6px', borderRadius: 999,
      color: ratingColor[rating] ?? '#475569',
      background: ratingBg[rating] ?? '#f1f5f9',
    }}>
      {rating}
    </span>
  );
}

export default function Invoices() {
  const { t }             = useTranslation();
  const navigate          = useNavigate();
  const { currency }      = useCurrency();
  const { isAdmin, user } = useAuth();

  // ✅ 'supervisor' replaces 'manager' — matches the User model ROLES array
  const isManager = isAdmin || user?.role === 'supervisor';

  const [status,   setStatus]   = useState('');
  const [search,   setSearch]   = useState('');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo,   setDateTo]   = useState('');
  const [page,     setPage]     = useState(1);

  const debouncedSearch = useDebounce(search);
  useEffect(() => setPage(1), [debouncedSearch, status, dateFrom, dateTo]);

  const { data, isLoading, isFetching } = useQuery({
    queryKey: ['invoices', status, debouncedSearch, dateFrom, dateTo, page],
    queryFn:  () => api.get('/invoices', {
      params: { status, search: debouncedSearch, dateFrom, dateTo, page, limit: 15 },
    }).then(r => r.data),
    keepPreviousData: true,
  });

  const invoices = data?.data  ?? [];
  const pages    = data?.pages ?? 1;

  const totalDue  = invoices
    .filter(i => i.status !== 'paid' && i.status !== 'cancelled')
    .reduce((s, i) => s + (i.balance    || 0), 0);
  const totalPaid = invoices
    .filter(i => i.status === 'paid')
    .reduce((s, i) => s + (i.grandTotal || 0), 0);

  const handleExport = () => {
    const params = new URLSearchParams({ status, search: debouncedSearch, dateFrom, dateTo, format: 'csv' });
    window.open(`${api.defaults.baseURL}/invoices/export?${params}`, '_blank');
  };

  const hasFilters = status || search || dateFrom || dateTo;

  const translatedStatusLabel = (s) => t(`status_${s}`, statusLabel(s));

  return (
    <div>
      {/* Header */}
      <div className="page-header">
        <div>
          <h1 className="page-title">{t('invoices_title')}</h1>
          <p style={{ fontSize: 13, color: 'var(--text-muted)', margin: '2px 0 0' }}>
            {t('total_invoices', { count: data?.total ?? 0 })}
          </p>
        </div>
        {isManager && (
          <button
            className="btn btn-ghost"
            onClick={handleExport}
            style={{ display: 'flex', alignItems: 'center', gap: 6 }}
          >
            <Download size={14} /> {t('export_csv')}
          </button>
        )}
      </div>

      {/* Summary strip — supervisor/admin only */}
      {isManager && invoices.length > 0 && (
        <div style={{ display: 'flex', gap: 12, marginBottom: 16, flexWrap: 'wrap' }}>
          {[
            {
              label: t('outstanding'),
              value: formatCurrency(totalDue, currency),
              color: totalDue > 0 ? '#dc2626' : '#16a34a',
              bg:    totalDue > 0 ? '#fef2f2' : '#f0fdf4',
            },
            {
              label: t('paid_this_view'),
              value: formatCurrency(totalPaid, currency),
              color: '#16a34a',
              bg:    '#f0fdf4',
            },
          ].map(s => (
            <div key={s.label} style={{ background: s.bg, border: `1px solid ${s.color}22`, borderRadius: 12, padding: '12px 20px', minWidth: 160 }}>
              <div style={{ fontSize: 11, fontWeight: 700, color: s.color, textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 4 }}>{s.label}</div>
              <div style={{ fontSize: 20, fontWeight: 800, color: '#0f172a', fontFamily: 'JetBrains Mono, monospace' }}>{s.value}</div>
            </div>
          ))}
        </div>
      )}

      {/* Filters */}
      <div className="card" style={{ marginBottom: 16 }}>
        <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', alignItems: 'center' }}>
          <div style={{ position: 'relative', flex: '1 1 220px', maxWidth: 280 }}>
            <Search size={14} style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)', pointerEvents: 'none' }} />
            <input
              style={{ paddingLeft: 32, width: '100%' }}
              placeholder={t('search_invoices')}
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
          </div>

          <select style={{ maxWidth: 170 }} value={status} onChange={e => setStatus(e.target.value)}>
            {STATUSES.map(s => (
              <option key={s} value={s}>
                {s ? translatedStatusLabel(s) : t('all_statuses')}
              </option>
            ))}
          </select>

          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <input
              type="date"
              style={{ maxWidth: 150 }}
              value={dateFrom}
              onChange={e => setDateFrom(e.target.value)}
              title={t('date_from', 'From date')}
            />
            <span style={{ color: 'var(--text-muted)', fontSize: 12 }}>{t('date_to')}</span>
            <input
              type="date"
              style={{ maxWidth: 150 }}
              value={dateTo}
              onChange={e => setDateTo(e.target.value)}
              title={t('date_to_label', 'To date')}
            />
          </div>

          {hasFilters && (
            <button
              className="btn btn-ghost btn-sm"
              onClick={() => { setStatus(''); setSearch(''); setDateFrom(''); setDateTo(''); }}
            >
              {t('clear_filters')}
            </button>
          )}
        </div>
      </div>

      {/* Table */}
      <div className="card">
        {isLoading ? (
          <div style={{ padding: '48px', textAlign: 'center', color: 'var(--text-muted)' }}>
            {t('loading_invoices')}
          </div>
        ) : invoices.length === 0 ? (
          <div style={{ padding: '48px', textAlign: 'center', color: 'var(--text-muted)' }}>
            {hasFilters ? t('no_invoices_adjust') : t('no_invoices_found')}
          </div>
        ) : (
          <>
            <div className="table-wrap" style={{ opacity: isFetching ? 0.6 : 1, transition: 'opacity 0.2s' }}>
              <table>
                <thead>
                  <tr>
                    <th>{t('invoice_number')}</th>
                    <th>{t('customer')}</th>
                    <th>Service Area</th>
                    <th>{t('job')}</th>
                    <th>Assigned To</th>
                    <th>Priority</th>
                    <th>{t('status')}</th>
                    <th>{t('total')}</th>
                    <th>{t('balance')}</th>
                    <th>{t('due')}</th>
                    <th></th>
                  </tr>
                </thead>
                <tbody>
                  {invoices.map(inv => {
                    const customer = inv.customer ?? {};
                    const job      = inv.job      ?? {};

                    return (
                      <tr
                        key={inv._id}
                        onClick={() => navigate(`/app/invoices/${inv._id}`)}
                        style={{ cursor: 'pointer' }}
                      >
                        {/* Invoice number */}
                        <td>
                          <span className="mono text-accent">{inv.invoiceNumber}</span>
                        </td>

                        {/* Customer */}
                        <td>
                          <div style={{ fontWeight: 600, fontSize: 13 }}>
                            {customer.company || customer.name || '—'}
                          </div>
                          {customer.company && customer.name && (
                            <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>{customer.name}</div>
                          )}
                          <div style={{ display: 'flex', alignItems: 'center', gap: 5, marginTop: 3, flexWrap: 'wrap' }}>
                            {customer.customerCode && (
                              <span style={{
                                fontFamily: 'JetBrains Mono, monospace', fontSize: 10, fontWeight: 600,
                                background: '#f1f5f9', color: '#475569', padding: '2px 6px', borderRadius: 5,
                              }}>
                                {customer.customerCode}
                              </span>
                            )}
                            {customer.rating && <RatingBadge rating={customer.rating} />}
                            {customer.plan && customer.plan !== 'None' && <PlanBadge plan={customer.plan} />}
                          </div>
                        </td>

                        {/* Service area */}
                        <td style={{ color: 'var(--text-muted)', fontSize: 13 }}>
                          {customer.serviceArea || '—'}
                        </td>

                        {/* Job number */}
                        <td>
                          <span className="mono" style={{ fontSize: 12 }}>
                            {job.jobNumber || '—'}
                          </span>
                          {job.location && (
                            <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 2 }}>
                              {job.location}
                            </div>
                          )}
                        </td>

                        {/* Assigned technician */}
                        <td style={{ fontSize: 13 }}>
                          {job.assignedTo?.name
                            ? <span style={{ fontWeight: 500 }}>{job.assignedTo.name}</span>
                            : <span style={{ color: 'var(--text-muted)' }}>—</span>
                          }
                        </td>

                        {/* Priority */}
                        <td>
                          <PriorityBadge priority={job.priority} />
                        </td>

                        {/* Status */}
                        <td>
                          <span className={badgeClass(inv.status)}>
                            {translatedStatusLabel(inv.status)}
                          </span>
                        </td>

                        {/* Grand total */}
                        <td>
                          <span className="amount">{formatCurrency(inv.grandTotal, currency)}</span>
                        </td>

                        {/* Balance */}
                        <td>
                          <span className={`amount ${inv.balance > 0 ? 'text-red' : 'text-green'}`}>
                            {formatCurrency(inv.balance, currency)}
                          </span>
                        </td>

                        {/* Due date */}
                        <td style={{ color: 'var(--text-muted)', fontSize: 13 }}>
                          {formatDate(inv.dueDate)}
                        </td>

                        {/* View button */}
                        <td>
                          <button
                            className="btn btn-ghost btn-sm"
                            onClick={e => { e.stopPropagation(); navigate(`/app/invoices/${inv._id}`); }}
                          >
                            {t('view')}
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            {pages > 1 && (
              <div style={{ display: 'flex', gap: 6, justifyContent: 'center', marginTop: 20, flexWrap: 'wrap' }}>
                <button className="btn btn-ghost btn-sm" disabled={page === 1} onClick={() => setPage(p => p - 1)}>
                  {t('prev')}
                </button>
                {Array.from({ length: pages }, (_, i) => i + 1).map(p => (
                  <button
                    key={p}
                    className={`btn btn-sm ${p === page ? 'btn-primary' : 'btn-secondary'}`}
                    onClick={() => setPage(p)}
                  >
                    {p}
                  </button>
                ))}
                <button className="btn btn-ghost btn-sm" disabled={page === pages} onClick={() => setPage(p => p + 1)}>
                  {t('next')}
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}