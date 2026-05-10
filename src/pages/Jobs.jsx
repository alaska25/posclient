import React, { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Link, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Briefcase, Plus, Search } from 'lucide-react';
import api from '../utils/api';
import { formatCurrency, formatDate, badgeClass, statusLabel } from '../utils/format';
import { useAuth } from '../context/AuthContext';

const STATUSES   = ['', 'draft', 'in_progress', 'completed', 'cancelled'];
const PRIORITIES = ['', 'low', 'normal', 'high', 'urgent'];

function useDebounce(value, delay = 350) {
  const [debounced, setDebounced] = useState(value);
  useEffect(() => {
    const t = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(t);
  }, [value, delay]);
  return debounced;
}

const PRIORITY_COLOR = {
  low:    { color: '#64748b', bg: '#f1f5f9' },
  normal: { color: '#0369a1', bg: '#e0f2fe' },
  high:   { color: '#d97706', bg: '#fef3c7' },
  urgent: { color: '#dc2626', bg: '#fef2f2' },
};

function PriorityBadge({ priority }) {
  const cfg = PRIORITY_COLOR[priority] || PRIORITY_COLOR.normal;
  return (
    <span style={{
      fontSize: 11, fontWeight: 700, padding: '3px 8px', borderRadius: 999,
      color: cfg.color, background: cfg.bg, textTransform: 'capitalize',
    }}>
      {priority}
    </span>
  );
}

// Windowed paginator — shows at most 7 page buttons with ellipsis
function Paginator({ page, pages, onChange }) {
  const { t } = useTranslation();
  if (pages <= 1) return null;

  const delta = 2;
  const range = [];
  const rangeWithDots = [];

  for (let i = Math.max(2, page - delta); i <= Math.min(pages - 1, page + delta); i++) {
    range.push(i);
  }

  rangeWithDots.push(1);
  if (range[0] > 2) rangeWithDots.push('...');
  rangeWithDots.push(...range);
  if (range[range.length - 1] < pages - 1) rangeWithDots.push('...');
  if (pages > 1) rangeWithDots.push(pages);

  return (
    <div style={{ display: 'flex', gap: 6, justifyContent: 'center', marginTop: 20, flexWrap: 'wrap', alignItems: 'center' }}>
      <button className="btn btn-ghost btn-sm" disabled={page === 1} onClick={() => onChange(p => p - 1)}>
        ← {t('prev')}
      </button>
      {rangeWithDots.map((p, i) =>
        p === '...' ? (
          <span key={`dot-${i}`} style={{ padding: '0 4px', color: 'var(--text-muted)', fontSize: 13 }}>…</span>
        ) : (
          <button
            key={p}
            className={`btn btn-sm ${p === page ? 'btn-primary' : 'btn-secondary'}`}
            onClick={() => onChange(p)}
          >
            {p}
          </button>
        )
      )}
      <button className="btn btn-ghost btn-sm" disabled={page === pages} onClick={() => onChange(p => p + 1)}>
        {t('next')} →
      </button>
    </div>
  );
}

export default function Jobs() {
  const { t }             = useTranslation();
  const navigate          = useNavigate();
  const { isAdmin, user } = useAuth();

  // ✅ 'supervisor' replaces 'manager' — matches the User model ROLES array
  const isManager = isAdmin || user?.role === 'supervisor';

  const [status,   setStatus]   = useState('');
  const [priority, setPriority] = useState('');
  const [search,   setSearch]   = useState('');
  const [page,     setPage]     = useState(1);

  const debouncedSearch = useDebounce(search);

  useEffect(() => { setPage(1); }, [debouncedSearch, status, priority]);

  const { data, isLoading, isFetching, isError } = useQuery({
    queryKey: ['jobs', status, priority, debouncedSearch, page],
    queryFn:  () => api.get('/jobs', {
      params: { status, priority, search: debouncedSearch, page, limit: 15 },
    }).then(r => r.data),
    keepPreviousData: true,
  });

  const jobs  = data?.data  ?? [];
  const pages = data?.pages ?? 1;

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">{t('work_orders')}</h1>
          <p style={{ fontSize: 13, color: 'var(--text-muted)', margin: '2px 0 0' }}>
            {t('total_jobs', { count: data?.total ?? 0 })}
          </p>
        </div>
        {isManager && (
          <Link to="/app/jobs/new" className="btn btn-primary" style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <Plus size={15} /> {t('new_work_order')}
          </Link>
        )}
      </div>

      {/* Filters */}
      <div className="card" style={{ marginBottom: 16 }}>
        <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', alignItems: 'center' }}>
          <div style={{ position: 'relative', flex: '1 1 240px', maxWidth: 300 }}>
            <Search size={14} style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)', pointerEvents: 'none' }} />
            <input
              style={{ paddingLeft: 32, width: '100%' }}
              placeholder={t('search_jobs_placeholder')}
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
          </div>
          <select style={{ maxWidth: 160 }} value={status} onChange={e => setStatus(e.target.value)}>
            {STATUSES.map(s => (
              <option key={s} value={s}>{s ? t(`status_${s}`, statusLabel(s)) : t('all_statuses')}</option>
            ))}
          </select>
          <select style={{ maxWidth: 150 }} value={priority} onChange={e => setPriority(e.target.value)}>
            {PRIORITIES.map(p => (
              <option key={p} value={p}>{p ? t(`priority_${p}`, p.charAt(0).toUpperCase() + p.slice(1)) : t('all_priorities')}</option>
            ))}
          </select>
          {(status || priority || search) && (
            <button className="btn btn-ghost btn-sm" onClick={() => { setStatus(''); setPriority(''); setSearch(''); }}>
              {t('clear_filters')}
            </button>
          )}
        </div>
      </div>

      {/* Table */}
      <div className="card">
        {/* Error state */}
        {isError && (
          <div style={{ padding: '32px', textAlign: 'center', color: 'var(--red)' }}>
            <p style={{ fontWeight: 600, marginBottom: 4 }}>{t('error_loading_jobs')}</p>
            <p style={{ fontSize: 13, color: 'var(--text-muted)' }}>{t('error_try_again')}</p>
          </div>
        )}

        {/* Loading state */}
        {!isError && isLoading && (
          <div style={{ padding: '48px', textAlign: 'center', color: 'var(--text-muted)' }}>
            {t('loading')}
          </div>
        )}

        {/* Empty state */}
        {!isError && !isLoading && jobs.length === 0 && (
          <div style={{ padding: '64px 32px', textAlign: 'center' }}>
            <div style={{ width: 56, height: 56, borderRadius: 16, background: '#f1f5f9', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px' }}>
              <Briefcase size={24} color="#94a3b8" />
            </div>
            <p style={{ fontWeight: 700, color: '#0f172a', marginBottom: 4 }}>{t('no_work_orders')}</p>
            <p style={{ fontSize: 13, color: 'var(--text-muted)', marginBottom: 16 }}>
              {search || status || priority ? t('try_adjusting_filters') : t('create_first_work_order')}
            </p>
            {isManager && !search && !status && !priority && (
              <Link to="/app/jobs/new" className="btn btn-primary">+ {t('new_work_order')}</Link>
            )}
          </div>
        )}

        {/* Table */}
        {!isError && !isLoading && jobs.length > 0 && (
          <>
            <div className="table-wrap" style={{ opacity: isFetching ? 0.6 : 1, transition: 'opacity 0.2s' }}>
              <table>
                <thead>
                  <tr>
                    <th>{t('job_number')}</th>
                    <th>{t('customer')}</th>
                    <th>{t('service_area')}</th>
                    <th>{t('status')}</th>
                    <th>{t('priority')}</th>
                    <th>{t('total')}</th>
                    <th>{t('due_date')}</th>
                    <th>{t('assigned_to')}</th>
                    <th></th>
                  </tr>
                </thead>
                <tbody>
                  {jobs.map(job => (
                    <tr key={job._id} onClick={() => navigate(`/app/jobs/${job._id}`)} style={{ cursor: 'pointer' }}>
                      <td><span className="mono text-accent">{job.jobNumber}</span></td>
                      <td>
                        <div style={{ fontWeight: 600, fontSize: 13 }}>{job.customer?.company || job.customer?.name || '—'}</div>
                        {job.customer?.customerCode && (
                          <div style={{ fontSize: 11, color: 'var(--text-muted)', fontFamily: 'JetBrains Mono, monospace' }}>{job.customer.customerCode}</div>
                        )}
                      </td>
                      {/* ✅ service area from customer — replaces vesselName */}
                      <td style={{ color: 'var(--text-muted)', fontSize: 13 }}>
                        {job.customer?.serviceArea || '—'}
                      </td>
                      <td><span className={badgeClass(job.status)}>{t(`status_${job.status}`, statusLabel(job.status))}</span></td>
                      <td><PriorityBadge priority={job.priority} /></td>
                      <td><span className="amount">{formatCurrency(job.grandTotal)}</span></td>
                      <td style={{ color: 'var(--text-muted)', fontSize: 13 }}>{formatDate(job.dueDate)}</td>
                      <td style={{ fontSize: 13, color: 'var(--text-muted)' }}>
                        {job.assignedTo?.name || <span style={{ color: '#cbd5e1' }}>{t('unassigned')}</span>}
                      </td>
                      <td>
                        <Link to={`/app/jobs/${job._id}`} className="btn btn-ghost btn-sm" onClick={e => e.stopPropagation()}>
                          {t('view')} →
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <Paginator page={page} pages={pages} onChange={setPage} />
          </>
        )}
      </div>
    </div>
  );
}