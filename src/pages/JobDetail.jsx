import React, { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { UserCheck, XCircle, Pencil, Check, X } from 'lucide-react';
import api from '../utils/api';
import { formatCurrency, formatDate, formatDateTime, badgeClass, statusLabel } from '../utils/format';
import { useCurrency } from '../context/CurrencyContext';
import { useAuth } from '../context/AuthContext';
import Swal from 'sweetalert2';

const STATUS_FLOW = { draft: 'in_progress', in_progress: 'completed' };

function Toast({ title, message, onDone }) {
  useEffect(() => {
    const t = setTimeout(onDone, 3500);
    return () => clearTimeout(t);
  }, [onDone]);

  return (
    <div style={{
      position:'fixed', bottom:28, right:28, zIndex:9999,
      background:'#0f172a', color:'#fff',
      padding:'14px 20px', borderRadius:14,
      display:'flex', alignItems:'center', gap:12,
      boxShadow:'0 8px 32px rgba(0,0,0,0.22)',
      animation:'slideUp .25s ease',
      fontSize:14, fontWeight:500, minWidth:300,
    }}>
      <style>{`@keyframes slideUp{from{opacity:0;transform:translateY(12px)}to{opacity:1;transform:translateY(0)}}`}</style>
      <span style={{
        width:28, height:28, borderRadius:'50%', background:'#16a34a',
        display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0,
      }}>
        <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
          <path d="M2.5 7L5.5 10L11.5 4" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      </span>
      <div>
        <div style={{ fontWeight:700, marginBottom:2 }}>{title}</div>
        <div style={{ fontSize:12, color:'rgba(255,255,255,.55)' }}>{message}</div>
      </div>
    </div>
  );
}

export default function JobDetail() {
  const { t }             = useTranslation();
  const { id }            = useParams();
  const navigate          = useNavigate();
  const qc                = useQueryClient();
  const { currency }      = useCurrency();
  const { isAdmin, user } = useAuth();

  // ✅ 'supervisor' replaces 'manager' — matches the User model ROLES array
  const isManager = isAdmin || user?.role === 'supervisor';

  const [invoiceModal,    setInvoiceModal]    = useState(false);
  const [dueDate,         setDueDate]         = useState('');
  const [editDesc,        setEditDesc]        = useState(false);
  const [descDraft,       setDescDraft]       = useState('');
  const [editLocation,    setEditLocation]    = useState(false);
  const [locationDraft,   setLocationDraft]   = useState('');
  const [assignModal,     setAssignModal]     = useState(false);
  const [successToast,    setSuccessToast]    = useState(false);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get('created') === '1') {
      setSuccessToast(true);
      window.history.replaceState({}, '', window.location.pathname);
    }
  }, []);

  const STATUS_LABEL = {
    draft:       t('start_job'),
    in_progress: t('mark_complete'),
  };

  const { data: res, isLoading, isError } = useQuery({
    queryKey: ['job', id],
    queryFn:  () => api.get(`/jobs/${id}`).then(r => r.data.data),
    enabled:  !!id,
  });

  const { data: staffList } = useQuery({
    queryKey: ['staff'],
    // ✅ Fetch all staff (no role filter) — your roles are supervisor/cashier, not technician
    queryFn:  () => api.get('/users?limit=50').then(r => r.data.data),
    enabled:  assignModal && isManager,
  });

  const statusMutation = useMutation({
    mutationFn: (status) => api.put(`/jobs/${id}`, { status }),
    onSuccess:  () => qc.invalidateQueries({ queryKey: ['job', id] }),
  });

  const cancelMutation = useMutation({
    mutationFn: () => api.put(`/jobs/${id}`, { status: 'cancelled' }),
    onSuccess:  () => {
      qc.invalidateQueries({ queryKey: ['job', id] });
      qc.invalidateQueries({ queryKey: ['jobs'] });
    },
  });

  const descMutation = useMutation({
    mutationFn: (description) => api.put(`/jobs/${id}`, { description }),
    onSuccess:  () => {
      setEditDesc(false);
      qc.invalidateQueries({ queryKey: ['job', id] });
    },
  });

  const locationMutation = useMutation({
    mutationFn: (location) => api.put(`/jobs/${id}`, { location }),
    onSuccess:  () => {
      setEditLocation(false);
      qc.invalidateQueries({ queryKey: ['job', id] });
    },
    onError: (err) => {
      console.error('Location update failed:', err.response?.data);
    },
  });

  const assignMutation = useMutation({
    mutationFn: (assignedTo) => api.put(`/jobs/${id}`, { assignedTo }),
    onSuccess:  () => {
      setAssignModal(false);
      qc.invalidateQueries({ queryKey: ['job', id] });
    },
  });

  const invoiceMutation = useMutation({
    mutationFn: () => api.post('/invoices', { job: id, dueDate }),
    onSuccess:  (r) => navigate(`/app/invoices/${r.data.data._id}`),
  });

  const handleCancel = async () => {
    const result = await Swal.fire({
      title:             t('cancel_job_title'),
      text:              t('cancel_job_text'),
      icon:              'warning',
      showCancelButton:  true,
      confirmButtonText: t('yes_cancel_job'),
      confirmButtonColor:'#dc2626',
      cancelButtonText:  t('keep_job'),
    });
    if (result.isConfirmed) cancelMutation.mutate();
  };

  if (isLoading) return <div className="text-muted" style={{ padding:32 }}>{t('loading')}</div>;
  if (isError)   return (
    <div style={{ padding:32, textAlign:'center' }}>
      <p style={{ fontWeight:600, color:'var(--red)', marginBottom:4 }}>{t('error_loading_job')}</p>
      <p style={{ fontSize:13, color:'var(--text-muted)' }}>{t('error_try_again')}</p>
    </div>
  );
  if (!res) return <div className="text-muted" style={{ padding:32 }}>{t('job_not_found')}</div>;

  const invoiceId   = res.invoice?._id ?? res.invoice ?? res.invoiceId ?? null;
  const isCompleted = res.status === 'completed';
  const isCancelled = res.status === 'cancelled';
  const nextStatus  = STATUS_FLOW[res.status];

  const jobInfoRows = [
    [t('job_number'),  <span className="mono text-accent">{res.jobNumber}</span>],
    [t('status'),      <span className={badgeClass(res.status)}>{t(`status_${res.status}`, statusLabel(res.status))}</span>],
    [t('assigned_to'), res.assignedTo?.name || <span style={{ color:'#cbd5e1' }}>{t('unassigned')}</span>],
    [t('created'),     formatDateTime(res.createdAt)],
    [t('completed'),   res.completedAt ? formatDateTime(res.completedAt) : '—'],
    ...(invoiceId ? [[t('invoice_label'), (
      <span
        key="inv"
        className="mono text-accent"
        style={{ cursor:'pointer', textDecoration:'underline' }}
        onClick={() => navigate(`/app/invoices/${invoiceId}`)}
      >
        {t('view')} →
      </span>
    )]] : []),
  ];

  return (
    <div>
      {/* Success Toast */}
      {successToast && (
        <Toast
          title="Work Order Created"
          message={`${res.jobNumber} has been created successfully.`}
          onDone={() => setSuccessToast(false)}
        />
      )}

      {/* Header */}
      <div className="page-header">
        <div>
          <Link to="/app/jobs" style={{ color:'var(--text-muted)', fontSize:13, textDecoration:'none' }}>
            {t('work_orders')}
          </Link>
          <h1 className="page-title" style={{ marginTop:4 }}>{res.jobNumber}</h1>
        </div>

        <div style={{ display:'flex', gap:8, flexWrap:'wrap' }}>
          {nextStatus && !isCancelled && (
            <button
              className="btn btn-secondary"
              onClick={() => statusMutation.mutate(nextStatus)}
              disabled={statusMutation.isPending}
            >
              {STATUS_LABEL[res.status]}
            </button>
          )}

          {isManager && !isCancelled && !isCompleted && (
            <button className="btn btn-ghost" onClick={() => setAssignModal(true)} style={{ display:'flex', alignItems:'center', gap:6 }}>
              <UserCheck size={14} /> {t('reassign')}
            </button>
          )}

          {isManager && isCompleted && !invoiceId && (
            <button className="btn btn-primary" onClick={() => setInvoiceModal(true)}>
              📄 {t('create_invoice')}
            </button>
          )}

          {isCompleted && invoiceId && (
            <button className="btn btn-secondary" onClick={() => navigate(`/app/invoices/${invoiceId}`)}>
              📄 {t('view_invoice')}
            </button>
          )}

          {isManager && !isCancelled && !isCompleted && (
            <button
              className="btn btn-ghost"
              style={{ color:'#dc2626', borderColor:'#fca5a5' }}
              onClick={handleCancel}
              disabled={cancelMutation.isPending}
            >
              <XCircle size={14} style={{ marginRight:4 }} />
              {t('cancel_job')}
            </button>
          )}
        </div>
      </div>

      {/* Body grid */}
      <div style={{ display:'grid', gridTemplateColumns:'2fr 1fr', gap:16, alignItems:'start' }}>

        {/* Left */}
        <div>
          {/* Main info card */}
          <div className="card" style={{ marginBottom:16 }}>
            <div style={{ display:'flex', gap:10, flexWrap:'wrap', marginBottom:16 }}>
              <span className={badgeClass(res.status)}>{t(`status_${res.status}`, statusLabel(res.status))}</span>
              <span className={badgeClass(res.priority)} style={{ textTransform:'capitalize' }}>{res.priority}</span>
              {invoiceId && <span className={badgeClass('invoiced')}>{t('invoiced')}</span>}
            </div>

            <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:16, marginBottom:16 }}>
              {/* Customer */}
              <div>
                <label style={{ marginBottom:4 }}>{t('customer')}</label>
                <p style={{ fontWeight:600, marginBottom:2 }}>{res.customer?.company || res.customer?.name}</p>
                {res.customer?.customerCode && (
                  <span style={{ fontFamily:'JetBrains Mono, monospace', fontSize:11, fontWeight:600, background:'#f1f5f9', color:'#475569', padding:'2px 7px', borderRadius:6 }}>
                    {res.customer.customerCode}
                  </span>
                )}
              </div>

              {/* Service Location — editable */}
              <div>
                <div style={{ display:'flex', alignItems:'center', gap:8, marginBottom:4 }}>
                  <label style={{ margin:0 }}>Service Location</label>
                  {isManager && !editLocation && !isCancelled && (
                    <button
                      className="btn btn-ghost btn-sm"
                      style={{ padding:'2px 8px', fontSize:11 }}
                      onClick={() => { setLocationDraft(res.location || ''); setEditLocation(true); }}
                    >
                      <Pencil size={11} style={{ marginRight:3 }} /> {t('edit')}
                    </button>
                  )}
                </div>
                {editLocation ? (
                  <div>
                    <input
                      value={locationDraft}
                      onChange={e => setLocationDraft(e.target.value)}
                      placeholder="e.g. 123 Rizal St, Quezon City"
                      style={{ width:'100%', padding:'8px 12px', border:'1.5px solid #6366f1', borderRadius:10, fontSize:14, fontFamily:'inherit', outline:'none' }}
                    />
                    <div style={{ display:'flex', gap:6, marginTop:6 }}>
                      <button
                        className="btn btn-primary btn-sm"
                        onClick={() => locationMutation.mutate(locationDraft)}
                        disabled={locationMutation.isPending}
                        style={{ display:'flex', alignItems:'center', gap:4 }}
                      >
                        <Check size={13} /> {t('save')}
                      </button>
                      <button
                        className="btn btn-ghost btn-sm"
                        onClick={() => setEditLocation(false)}
                        style={{ display:'flex', alignItems:'center', gap:4 }}
                      >
                        <X size={13} /> {t('cancel')}
                      </button>
                    </div>
                  </div>
                ) : (
                  <p style={{ fontSize:14, color: res.location ? 'inherit' : 'var(--text-muted)', fontStyle: res.location ? 'normal' : 'italic', margin:0 }}>
                    {res.location || 'No location set'}
                  </p>
                )}
              </div>

              {/* Priority */}
              <div>
                <label style={{ marginBottom:4 }}>Priority</label>
                <span className={badgeClass(res.priority)} style={{ textTransform:'capitalize' }}>
                  {res.priority}
                </span>
              </div>

              {/* Due Date */}
              <div>
                <label style={{ marginBottom:4 }}>{t('due_date')}</label>
                <p>{formatDate(res.dueDate)}</p>
              </div>
            </div>

            {/* Editable Remarks */}
            <div>
              <div style={{ display:'flex', alignItems:'center', gap:8, marginBottom:6 }}>
                <label style={{ margin:0 }}>Remarks</label>
                {isManager && !editDesc && !isCancelled && (
                  <button
                    className="btn btn-ghost btn-sm"
                    style={{ padding:'2px 8px', fontSize:11 }}
                    onClick={() => { setDescDraft(res.description || ''); setEditDesc(true); }}
                  >
                    <Pencil size={11} style={{ marginRight:3 }} /> {t('edit')}
                  </button>
                )}
              </div>
              {editDesc ? (
                <div>
                  <textarea
                    rows={3}
                    value={descDraft}
                    onChange={e => setDescDraft(e.target.value)}
                    style={{ width:'100%', padding:'10px 12px', border:'1.5px solid #6366f1', borderRadius:10, fontSize:14, fontFamily:'inherit', resize:'vertical', outline:'none' }}
                  />
                  <div style={{ display:'flex', gap:6, marginTop:6 }}>
                    <button
                      className="btn btn-primary btn-sm"
                      onClick={() => descMutation.mutate(descDraft)}
                      disabled={descMutation.isPending}
                      style={{ display:'flex', alignItems:'center', gap:4 }}
                    >
                      <Check size={13} /> {t('save')}
                    </button>
                    <button
                      className="btn btn-ghost btn-sm"
                      onClick={() => setEditDesc(false)}
                      style={{ display:'flex', alignItems:'center', gap:4 }}
                    >
                      <X size={13} /> {t('cancel')}
                    </button>
                  </div>
                </div>
              ) : (
                <p style={{ fontSize:14, color:'var(--text-secondary)', margin:0 }}>
                  {res.description || (
                    <span style={{ color:'var(--text-muted)', fontStyle:'italic' }}>No remarks</span>
                  )}
                </p>
              )}
            </div>
          </div>

          {/* Service Lines */}
          <div className="card">
            <h3 style={{ marginBottom:16, fontSize:15 }}>{t('service_lines')}</h3>
            <div className="table-wrap">
              <table>
                <thead>
                  <tr>
                    <th>{t('service')}</th>
                    <th>{t('qty')}</th>
                    <th>{t('unit_price')}</th>
                    <th>{t('discount')}</th>
                    <th>{t('tax')}</th>
                    <th>{t('total')}</th>
                  </tr>
                </thead>
                <tbody>
                  {res.lines?.map((line, i) => (
                    <tr key={i}>
                      <td>
                        <div style={{ fontWeight:500 }}>{line.serviceName}</div>
                        {line.description && <div style={{ fontSize:12, color:'var(--text-muted)' }}>{line.description}</div>}
                      </td>
                      <td className="mono">{line.quantity} {line.unit}</td>
                      <td className="amount">{formatCurrency(line.unitPrice, currency)}</td>
                      <td>{line.discount > 0 ? `${line.discount}%` : '—'}</td>
                      <td>{line.taxRate}%</td>
                      <td className="amount text-accent">{formatCurrency(line.lineTotal, currency)}</td>
                    </tr>
                  ))}
                  {!res.lines?.length && (
                    <tr>
                      <td colSpan={6} style={{ textAlign:'center', padding:32, color:'var(--text-muted)' }}>
                        No service lines
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
            <div style={{ display:'flex', flexDirection:'column', gap:8, alignItems:'flex-end', marginTop:16, paddingTop:16, borderTop:'1px solid var(--border)' }}>
              {[[t('subtotal'), res.subtotal], [t('tax'), res.taxTotal]].map(([label, val]) => (
                <div key={label} style={{ display:'flex', gap:40, fontSize:14, color:'var(--text-secondary)' }}>
                  <span>{label}</span><span className="amount">{formatCurrency(val, currency)}</span>
                </div>
              ))}
              <div style={{ display:'flex', gap:40, fontSize:20, fontWeight:700 }}>
                <span>{t('total').toUpperCase()}</span>
                <span className="amount text-accent">{formatCurrency(res.grandTotal, currency)}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Right sidebar */}
        <div className="card">
          <h3 style={{ marginBottom:16, fontSize:15 }}>{t('job_info')}</h3>
          <div style={{ display:'flex', flexDirection:'column', gap:14 }}>
            {jobInfoRows.map(([k, v]) => (
              <div key={k}>
                <label style={{ marginBottom:2 }}>{k}</label>
                <div style={{ fontSize:14 }}>{v}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Invoice Modal */}
      {invoiceModal && (
        <div style={{ position:'fixed', inset:0, background:'rgba(0,0,0,0.7)', display:'flex', alignItems:'center', justifyContent:'center', zIndex:200 }}>
          <div className="card" style={{ width:400, maxWidth:'90vw' }}>
            <h3 style={{ marginBottom:8 }}>{t('create_invoice')}</h3>
            <p style={{ fontSize:14, color:'var(--text-secondary)', marginBottom:16 }}>
              Create invoice for <strong>{res.jobNumber}</strong> — {formatCurrency(res.grandTotal, currency)}
            </p>
            <div className="form-group">
              <label>{t('payment_due_date')}</label>
              <input type="date" value={dueDate} onChange={e => setDueDate(e.target.value)} />
            </div>
            <div style={{ display:'flex', gap:8, marginTop:16 }}>
              <button
                className="btn btn-primary"
                onClick={() => invoiceMutation.mutate()}
                disabled={!dueDate || invoiceMutation.isPending}
              >
                {invoiceMutation.isPending ? t('creating') : t('create_invoice')}
              </button>
              <button className="btn btn-secondary" onClick={() => setInvoiceModal(false)}>
                {t('cancel')}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Reassign Modal */}
      {assignModal && (
        <div style={{ position:'fixed', inset:0, background:'rgba(0,0,0,0.7)', display:'flex', alignItems:'center', justifyContent:'center', zIndex:200 }}>
          <div className="card" style={{ width:380, maxWidth:'90vw' }}>
            <h3 style={{ marginBottom:8 }}>{t('reassign_technician')}</h3>
            <p style={{ fontSize:13, color:'var(--text-muted)', marginBottom:16 }}>
              Currently assigned to <strong>{res.assignedTo?.name || t('unassigned')}</strong>
            </p>
            <div style={{ display:'flex', flexDirection:'column', gap:8, maxHeight:280, overflowY:'auto' }}>
              {staffList?.map(s => (
                <button
                  key={s._id}
                  className="btn btn-ghost"
                  style={{ justifyContent:'flex-start', fontWeight: res.assignedTo?._id === s._id ? 700 : 400 }}
                  onClick={() => assignMutation.mutate(s._id)}
                  disabled={assignMutation.isPending}
                >
                  <UserCheck size={14} style={{ marginRight:8 }} />
                  {s.name}
                  {res.assignedTo?._id === s._id && (
                    <span style={{ marginLeft:'auto', fontSize:11, color:'#16a34a' }}>{t('current')}</span>
                  )}
                </button>
              ))}
              {!staffList?.length && (
                <p className="text-muted" style={{ fontSize:13 }}>{t('no_technicians')}</p>
              )}
            </div>
            <button className="btn btn-secondary" style={{ marginTop:16 }} onClick={() => setAssignModal(false)}>
              {t('close')}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}