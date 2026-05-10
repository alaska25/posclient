import React, { useState, useEffect, useRef } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useParams, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import {
  ArrowLeft, Printer, Send, CreditCard, X,
  Receipt, Info, CheckCircle2, Clock, AlertCircle, XCircle, Mail,
} from 'lucide-react';
import api from '../utils/api';
import { formatCurrency, formatDate, formatDateTime } from '../utils/format';
import Swal from 'sweetalert2';
import { useCurrency } from '../context/CurrencyContext';
import { useAuth } from '../context/AuthContext';

const METHODS = ['cash', 'bank_transfer', 'check', 'credit_card', 'other'];
const EMPTY_PAY = { amount: '', method: 'bank_transfer', reference: '', notes: '' };

// ── Shared badge tokens (mirrors Customers.jsx + Invoices.jsx) ────────────────
const planColor     = { None: '#94a3b8', Basic: '#0369a1', Standard: '#7c3aed', Premium: '#b45309' };
const planBg        = { None: '#f8fafc', Basic: '#e0f2fe', Standard: '#f5f3ff', Premium: '#fffbeb' };
const ratingColor   = { VIP: '#7c3aed', Regular: '#0369a1', Blacklisted: '#dc2626' };
const ratingBg      = { VIP: '#f5f3ff', Regular: '#e0f2fe', Blacklisted: '#fef2f2' };
const priorityColor = { low: '#0369a1', medium: '#b45309', high: '#dc2626', urgent: '#7c3aed' };
const priorityBg    = { low: '#e0f2fe', medium: '#fffbeb', high: '#fef2f2', urgent: '#f5f3ff' };

function Pill({ label, color, bg, mono = false }) {
  if (!label) return null;
  return (
    <span style={{
      fontSize: 10, fontWeight: 700, padding: '2px 8px', borderRadius: 999,
      color, background: bg, display: 'inline-block', whiteSpace: 'nowrap',
      fontFamily: mono ? 'JetBrains Mono, monospace' : 'inherit',
      letterSpacing: mono ? '0.04em' : '0.02em',
    }}>
      {label}
    </span>
  );
}

function StatusChip({ status }) {
  const { t } = useTranslation();
  const CFG = {
    draft:     { icon: Clock,        color: '#64748b', bg: '#f1f5f9' },
    sent:      { icon: Send,         color: '#2563eb', bg: '#eff6ff' },
    paid:      { icon: CheckCircle2, color: '#16a34a', bg: '#f0fdf4' },
    overdue:   { icon: AlertCircle,  color: '#dc2626', bg: '#fef2f2' },
    cancelled: { icon: XCircle,      color: '#94a3b8', bg: '#f8fafc' },
    partial:   { icon: Clock,        color: '#d97706', bg: '#fef3c7' },
  };
  const { icon: Icon, color, bg } = CFG[status] || CFG.draft;
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center', gap: 6,
      padding: '5px 12px', borderRadius: 999, background: bg, color,
      fontSize: 11, fontWeight: 700, letterSpacing: '0.05em',
    }}>
      <Icon size={11} />
      {t(`status_${status}`, status).toUpperCase()}
    </span>
  );
}

function MetaCell({ label, children, rightBorder = true, topBorder = false }) {
  return (
    <div style={{
      padding: '16px 24px',
      borderRight: rightBorder ? '1px solid #f1f5f9' : 'none',
      borderTop:   topBorder   ? '1px solid #f1f5f9' : 'none',
    }}>
      <div style={{ fontSize: 9, fontWeight: 700, color: '#94a3b8', letterSpacing: '0.16em', marginBottom: 6, textTransform: 'uppercase' }}>
        {label}
      </div>
      <div style={{ fontSize: 13, fontWeight: 600, color: '#0f172a', lineHeight: 1.5 }}>
        {children}
      </div>
    </div>
  );
}

export default function InvoiceDetail() {
  const { t }             = useTranslation();
  const { id }            = useParams();
  const navigate          = useNavigate();
  const qc                = useQueryClient();
  const { currency }      = useCurrency();
  const { isAdmin, user } = useAuth();
  const isManager         = isAdmin || user?.role === 'supervisor';

  const [payForm, setPayForm] = useState(EMPTY_PAY);
  const [showPay, setShowPay] = useState(false);
  const payTriggerRef         = useRef(null);

  const closePayModal = () => {
    setShowPay(false);
    setPayForm(EMPTY_PAY);
    setTimeout(() => payTriggerRef.current?.focus(), 50);
  };

  useEffect(() => {
    if (!showPay) return;
    const h = (e) => { if (e.key === 'Escape') closePayModal(); };
    window.addEventListener('keydown', h);
    return () => window.removeEventListener('keydown', h);
  }, [showPay]);

  const { data: res, isLoading, isError } = useQuery({
    queryKey: ['invoice', id],
    queryFn:  () => api.get(`/invoices/${id}`).then(r => r.data),
  });

  const payMutation = useMutation({
    mutationFn: (data) => api.post('/payments', { invoice: id, ...data, amount: Number(data.amount) }),
    onSuccess: () => {
      qc.invalidateQueries(['invoice', id]);
      closePayModal();
      Swal.fire({ icon: 'success', title: t('payment_recorded'), confirmButtonColor: '#0f172a' });
    },
  });

  const statusMutation = useMutation({
    mutationFn: (status) => api.put(`/invoices/${id}`, { status }),
    onSuccess:  () => qc.invalidateQueries(['invoice', id]),
  });

  const cancelMutation = useMutation({
    mutationFn: () => api.put(`/invoices/${id}`, { status: 'cancelled' }),
    onSuccess:  () => {
      qc.invalidateQueries(['invoice', id]);
      qc.invalidateQueries(['invoices']);
    },
  });

  const emailMutation = useMutation({
    mutationFn: () => api.post(`/invoices/${id}/send-email`),
    onSuccess:  () => {
      Swal.fire({
        icon: 'success', title: t('invoice_sent'),
        text: t('invoice_emailed_to', { email: customer.email }),
        confirmButtonColor: '#0f172a',
      });
      qc.invalidateQueries(['invoice', id]);
    },
    onError: () => Swal.fire({
      icon: 'error', title: t('failed_to_send'),
      text: t('failed_to_send_text'), confirmButtonColor: '#0f172a',
    }),
  });

  const handleCancel = async () => {
    const r = await Swal.fire({
      title: t('cancel_invoice_title'), text: t('cancel_invoice_text'),
      icon: 'warning', showCancelButton: true,
      confirmButtonText: t('yes_cancel_it'), confirmButtonColor: '#dc2626',
      cancelButtonText: t('keep_invoice'),
    });
    if (r.isConfirmed) cancelMutation.mutate();
  };

  const handleEmail = async () => {
    if (!customer?.email) {
      return Swal.fire({ icon: 'warning', title: t('no_email_on_file'), text: t('no_email_on_file_text'), confirmButtonColor: '#0f172a' });
    }
    const r = await Swal.fire({
      title: t('send_invoice_title'),
      text:  t('send_invoice_text', { number: inv?.invoiceNumber, email: customer.email }),
      icon: 'question', showCancelButton: true,
      confirmButtonText: t('send_it'), confirmButtonColor: '#0f172a',
    });
    if (r.isConfirmed) emailMutation.mutate();
  };

  // ── Early returns ─────────────────────────────────────────────────────────
  if (isLoading) return (
    <div style={{ display:'flex', alignItems:'center', justifyContent:'center', height:'60vh', color:'#94a3b8', fontFamily:'Outfit,sans-serif' }}>
      {t('loading_invoice')}
    </div>
  );
  if (isError) return (
    <div style={{ display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', height:'60vh', gap:8, fontFamily:'Outfit,sans-serif' }}>
      <p style={{ fontWeight:700, color:'#dc2626', fontSize:15, margin:0 }}>{t('error_loading_invoice')}</p>
      <button className="inv-ghost" onClick={() => navigate('/app/invoices')}>
        <ArrowLeft size={13} /> {t('back_to_invoices')}
      </button>
    </div>
  );
  if (!res?.data) return (
    <div style={{ display:'flex', alignItems:'center', justifyContent:'center', height:'60vh', color:'#94a3b8' }}>
      {t('invoice_not_found')}
    </div>
  );

  const inv      = res.data;
  const payments = res.payments ?? [];

  // ── Derived data ──────────────────────────────────────────────────────────
  const customer = inv.customer ?? {};
  const job      = inv.job      ?? {};

  // Lines: use invoice's own copy; fall back to job.lines if inv.lines is absent/empty
  const lines = (inv.lines?.length ? inv.lines : job.lines) ?? [];

  const isPaid      = inv.balance <= 0;
  const isCancelled = inv.status === 'cancelled';

  const payAmount      = Number(payForm.amount);
  const payAmountValid = payAmount > 0 && payAmount <= inv.balance;

  // Bill-to: company name primary; only show contact sub-line if it's a different string
  const billName   = customer.company || customer.name || '—';
  const contactSub = customer.company && customer.name && customer.name !== customer.company
    ? customer.name : null;

  // ── FIX: service location — job.location first, fall back to customer.serviceArea ──
  const serviceLocation = job.location || customer.serviceArea || null;

  const issuedBy    = inv.createdBy?.name || inv.cashier?.name || null;
  const methodLabel = (m) => t(`method_${m}`, m);

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Outfit:wght@400;500;600;700;800&family=JetBrains+Mono:wght@400;500;600&display=swap');
        .inv-wrap * { box-sizing: border-box; }
        .inv-wrap { font-family: 'Outfit', sans-serif; animation: fadeUp .3s ease; }
        .inv-ghost {
          background: #fff; border: 1.5px solid #e2e8f0; color: #334155;
          padding: 8px 16px; border-radius: 10px; font-weight: 600; font-size: 13px;
          cursor: pointer; display: inline-flex; align-items: center; gap: 7px;
          transition: all .15s; font-family: 'Outfit', sans-serif;
        }
        .inv-ghost:hover    { border-color: #0f172a; color: #0f172a; background: #f8fafc; }
        .inv-ghost:disabled { opacity: .5; cursor: not-allowed; }
        .inv-ghost.danger   { border-color: #fca5a5; color: #dc2626; }
        .inv-ghost.danger:hover { border-color: #dc2626; background: #fef2f2; }
        .inv-solid {
          background: #0f172a; color: #fff; border: none;
          padding: 9px 18px; border-radius: 10px; font-weight: 700; font-size: 13px;
          cursor: pointer; display: inline-flex; align-items: center; gap: 7px;
          transition: background .15s; font-family: 'Outfit', sans-serif;
        }
        .inv-solid:hover    { background: #1e293b; }
        .inv-solid:disabled { opacity: .5; cursor: not-allowed; }
        .inv-input {
          width: 100%; padding: 11px 14px; border: 1.5px solid #e2e8f0;
          border-radius: 10px; font-size: 14px; color: #0f172a; outline: none;
          transition: border-color .15s; background: #fff; font-family: 'Outfit', sans-serif;
        }
        .inv-input:focus     { border-color: #0f172a; }
        .inv-input.has-error { border-color: #ef4444; }
        .line-row:hover td { background: #fafbfc; }
        .line-row td       { transition: background .1s; }
        @media print {
          .no-print { display: none !important; }
          body, html { background: #fff !important; margin: 0 !important; padding: 0 !important; }
          nav, aside, header, footer,
          [class*="sidebar"],[class*="layout"],[class*="nav"],
          [class*="Layout"],[class*="Sidebar"] { display: none !important; }
          .inv-wrap  { max-width: 100% !important; padding: 0 !important; animation: none !important; }
          .print-doc { box-shadow: none !important; border: 1px solid #e2e8f0 !important; border-radius: 0 !important; }
        }
        @keyframes fadeUp    { from{opacity:0;transform:translateY(10px)} to{opacity:1;transform:translateY(0)} }
        @keyframes overlayIn { from{opacity:0} to{opacity:1} }
        @keyframes modalIn   { from{opacity:0;transform:translateY(20px) scale(.97)} to{opacity:1;transform:translateY(0) scale(1)} }
      `}</style>

      <div className="inv-wrap" style={{ maxWidth:920, margin:'0 auto', padding:'28px 20px 80px' }}>

        {/* ── Top action bar ──────────────────────────────────────────────── */}
        <div className="no-print" style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', marginBottom:24, flexWrap:'wrap', gap:12 }}>
          <div>
            <button className="inv-ghost" style={{ padding:'6px 12px', fontSize:12, marginBottom:12 }} onClick={() => navigate('/app/invoices')}>
              <ArrowLeft size={13} /> {t('invoices')}
            </button>
            <div style={{ display:'flex', alignItems:'center', gap:10, flexWrap:'wrap' }}>
              <h1 style={{ fontSize:26, fontWeight:800, color:'#0f172a', margin:0, letterSpacing:'-0.03em', fontFamily:'JetBrains Mono, monospace' }}>
                {inv.invoiceNumber}
              </h1>
              <StatusChip status={inv.status} />
            </div>
          </div>

          <div style={{ display:'flex', gap:8, flexWrap:'wrap', justifyContent:'flex-end', alignItems:'center' }}>
            <button className="inv-ghost" onClick={() => window.print()}>
              <Printer size={14} /> {t('print')}
            </button>
            {isManager && !isCancelled && customer.email && (
              <button className="inv-ghost" onClick={handleEmail} disabled={emailMutation.isPending}>
                <Mail size={14} /> {emailMutation.isPending ? t('sending') : t('email')}
              </button>
            )}
            {inv.status === 'draft' && isManager && (
              <button className="inv-ghost" onClick={() => statusMutation.mutate('sent')} disabled={statusMutation.isPending}>
                <Send size={14} /> {t('mark_sent')}
              </button>
            )}
            {!isPaid && !isCancelled && (
              <button ref={payTriggerRef} className="inv-solid" onClick={() => setShowPay(true)}>
                <CreditCard size={14} /> {t('record_payment')}
              </button>
            )}
            {isManager && !isPaid && !isCancelled && (
              <button className="inv-ghost danger" onClick={handleCancel} disabled={cancelMutation.isPending}>
                <XCircle size={14} /> {t('cancel')}
              </button>
            )}
          </div>
        </div>

        {/* ── Invoice document ─────────────────────────────────────────────── */}
        <div className="print-doc" style={{ background:'#fff', border:'1px solid #e2e8f0', borderRadius:18, overflow:'hidden', boxShadow:'0 1px 3px rgba(0,0,0,.06), 0 8px 32px rgba(0,0,0,.05)' }}>

          {/* Header band */}
          <div style={{ background: isCancelled ? '#475569' : '#0f172a', padding:'28px 36px', display:'flex', justifyContent:'space-between', alignItems:'flex-end', gap:16 }}>
            <div>
              <div style={{ fontSize:10, fontWeight:700, color:'rgba(255,255,255,.3)', letterSpacing:'0.18em', marginBottom:8 }}>INVOICE</div>
              <div style={{ fontSize:28, fontWeight:800, color:'#fff', fontFamily:'JetBrains Mono, monospace', letterSpacing:'-0.02em', lineHeight:1 }}>
                {inv.invoiceNumber}
              </div>
              {job.jobNumber && (
                <div style={{ marginTop:8, display:'inline-flex', alignItems:'center', gap:6, background:'rgba(255,255,255,.08)', borderRadius:6, padding:'4px 10px' }}>
                  <span style={{ fontSize:10, fontWeight:600, color:'rgba(255,255,255,.4)', letterSpacing:'0.1em' }}>WORK ORDER</span>
                  <span style={{ fontSize:12, fontWeight:700, color:'rgba(255,255,255,.75)', fontFamily:'JetBrains Mono, monospace' }}>
                    {job.jobNumber}
                  </span>
                </div>
              )}
            </div>
            <div style={{ textAlign:'right', flexShrink:0 }}>
              <div style={{ fontSize:10, fontWeight:700, color:'rgba(255,255,255,.3)', letterSpacing:'0.18em', marginBottom:6 }}>TOTAL DUE</div>
              <div style={{ fontSize:36, fontWeight:800, color:'#fff', letterSpacing:'-0.03em', lineHeight:1, fontFamily:'JetBrains Mono, monospace' }}>
                {formatCurrency(inv.grandTotal, currency)}
              </div>
              {isPaid && (
                <div style={{ marginTop:8, display:'inline-flex', alignItems:'center', gap:5, color:'#4ade80', fontSize:11, fontWeight:700 }}>
                  <CheckCircle2 size={12} /> PAID IN FULL
                </div>
              )}
              {!isPaid && inv.amountPaid > 0 && (
                <div style={{ marginTop:6, fontSize:12, color:'#fca5a5', fontWeight:600 }}>
                  Balance: {formatCurrency(inv.balance, currency)}
                </div>
              )}
              {isCancelled && (
                <div style={{ marginTop:6, fontSize:11, fontWeight:700, color:'rgba(255,255,255,.35)', letterSpacing:'0.1em' }}>VOIDED</div>
              )}
            </div>
          </div>

          {/* ── Meta grid: 3 cols × 3 rows ───────────────────────────────── */}

          {/* Row 1 — Customer identity */}
          <div style={{ display:'grid', gridTemplateColumns:'repeat(3,1fr)' }}>
            <MetaCell label="Bill To" rightBorder>
              <div style={{ fontWeight:700 }}>{billName}</div>
              {contactSub && <div style={{ fontSize:12, color:'#64748b', marginTop:1 }}>{contactSub}</div>}
              <div style={{ display:'flex', flexWrap:'wrap', gap:4, marginTop:6 }}>
                {customer.customerCode && (
                  <Pill label={customer.customerCode} color="#475569" bg="#f1f5f9" mono />
                )}
                {customer.rating && customer.rating !== 'Regular' && (
                  <Pill label={customer.rating} color={ratingColor[customer.rating] ?? '#475569'} bg={ratingBg[customer.rating] ?? '#f1f5f9'} />
                )}
                {customer.plan && customer.plan !== 'None' && (
                  <Pill label={customer.plan} color={planColor[customer.plan] ?? '#475569'} bg={planBg[customer.plan] ?? '#f1f5f9'} />
                )}
              </div>
            </MetaCell>

            <MetaCell label="Contact" rightBorder>
              {customer.email
                ? <div>{customer.email}</div>
                : <span style={{ color:'#cbd5e1' }}>No email</span>
              }
              {(customer.phone || customer.mobile) && (
                <div style={{ fontSize:12, color:'#64748b', marginTop:2 }}>{customer.phone || customer.mobile}</div>
              )}
            </MetaCell>

            {/* ── Payment Terms: invoice first, fall back to customer ── */}
            <MetaCell label="Payment Terms" rightBorder={false}>
              <div>{inv.paymentTerms || customer.paymentTerms || '—'}</div>
            </MetaCell>
          </div>

          {/* Row 2 — Job / service info */}
          <div style={{ display:'grid', gridTemplateColumns:'repeat(3,1fr)', borderTop:'1px solid #f1f5f9' }}>
            <MetaCell label="Work Order" rightBorder>
              {job._id ? (
                <span
                  style={{ color:'#6366f1', cursor:'pointer', fontFamily:'JetBrains Mono, monospace', fontSize:13, fontWeight:700, textDecoration:'underline', textUnderlineOffset:2 }}
                  onClick={() => navigate(`/app/jobs/${job._id}`)}
                >
                  {job.jobNumber} →
                </span>
              ) : '—'}
            </MetaCell>

            {/* ── FIX: job.location first, fall back to customer.serviceArea ── */}
            <MetaCell label="Service Location" rightBorder>
              {serviceLocation
                ? <span>{serviceLocation}</span>
                : <span style={{ color:'#cbd5e1', fontStyle:'italic', fontWeight:400 }}>Not set</span>
              }
            </MetaCell>

            <MetaCell label="Priority" rightBorder={false}>
              {job.priority ? (
                <Pill
                  label={job.priority.charAt(0).toUpperCase() + job.priority.slice(1)}
                  color={priorityColor[job.priority] ?? '#475569'}
                  bg={priorityBg[job.priority]       ?? '#f1f5f9'}
                />
              ) : <span style={{ color:'#cbd5e1' }}>—</span>}
            </MetaCell>
          </div>

          {/* Row 3 — Dates + technician */}
          <div style={{ display:'grid', gridTemplateColumns:'repeat(3,1fr)', borderTop:'1px solid #f1f5f9', borderBottom:'1px solid #f1f5f9' }}>
            <MetaCell label="Assigned To" rightBorder>
              {job.assignedTo?.name
                ? <span>{job.assignedTo.name}</span>
                : <span style={{ color:'#cbd5e1' }}>Unassigned</span>
              }
            </MetaCell>

            <MetaCell label="Due Date" rightBorder>
              {inv.dueDate ? formatDate(inv.dueDate) : '—'}
            </MetaCell>

            <MetaCell label="Date Issued" rightBorder={false}>
              <div>{formatDateTime(inv.createdAt)}</div>
              {issuedBy && <div style={{ fontSize:11, color:'#94a3b8', marginTop:2 }}>by {issuedBy}</div>}
            </MetaCell>
          </div>

          {/* ── Line items ───────────────────────────────────────────────── */}
          <table style={{ width:'100%', borderCollapse:'collapse' }}>
            <thead>
              <tr style={{ background:'#f8fafc' }}>
                {[
                  ['Service / Description', 'left',  '36%'],
                  ['Qty',                   'right',  '10%'],
                  ['Unit Price',            'right',  '14%'],
                  ['Discount',              'right',  '10%'],
                  ['Tax',                   'right',  '10%'],
                  ['Total',                 'right',  '14%'],
                ].map(([h, align, w]) => (
                  <th key={h} style={{ padding:'10px 20px', fontSize:9, fontWeight:700, color:'#94a3b8', letterSpacing:'0.14em', textAlign:align, width:w, borderBottom:'1px solid #f1f5f9' }}>
                    {h.toUpperCase()}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {lines.map((line, i) => (
                <tr key={i} className="line-row" style={{ borderBottom:'1px solid #f8fafc' }}>
                  <td style={{ padding:'14px 20px' }}>
                    <div style={{ fontSize:13, fontWeight:600, color:'#0f172a' }}>{line.serviceName}</div>
                    {line.description && (
                      <div style={{ fontSize:11, color:'#94a3b8', marginTop:3, lineHeight:1.4 }}>{line.description}</div>
                    )}
                  </td>
                  <td style={{ padding:'14px 20px', fontSize:12, color:'#64748b', textAlign:'right', fontFamily:'JetBrains Mono,monospace' }}>
                    {line.quantity}{line.unit ? ` ${line.unit}` : ''}
                  </td>
                  <td style={{ padding:'14px 20px', fontSize:12, color:'#64748b', textAlign:'right', fontFamily:'JetBrains Mono,monospace' }}>
                    {formatCurrency(line.unitPrice, currency)}
                  </td>
                  <td style={{ padding:'14px 20px', textAlign:'right' }}>
                    {line.discount > 0
                      ? <Pill label={`${line.discount}%`} color="#d97706" bg="#fffbeb" />
                      : <span style={{ color:'#e2e8f0' }}>—</span>
                    }
                  </td>
                  <td style={{ padding:'14px 20px', textAlign:'right' }}>
                    <Pill label={`${line.taxRate}%`} color="#64748b" bg="#f1f5f9" />
                  </td>
                  <td style={{ padding:'14px 20px', fontSize:13, fontWeight:700, color:'#0f172a', textAlign:'right', fontFamily:'JetBrains Mono,monospace' }}>
                    {formatCurrency(line.lineTotal, currency)}
                  </td>
                </tr>
              ))}
              {lines.length === 0 && (
                <tr>
                  <td colSpan={6} style={{ padding:'40px', textAlign:'center', color:'#cbd5e1', fontSize:13 }}>
                    No line items
                  </td>
                </tr>
              )}
            </tbody>
          </table>

          {/* ── Totals ───────────────────────────────────────────────────── */}
          <div style={{ display:'flex', justifyContent:'flex-end', padding:'20px 24px 24px', borderTop:'1px solid #f1f5f9' }}>
            <div style={{ width:280 }}>
              {[[t('subtotal'), inv.subtotal],[t('tax'), inv.taxTotal]].map(([label, val]) => (
                <div key={label} style={{ display:'flex', justifyContent:'space-between', padding:'5px 0', fontSize:13, color:'#64748b' }}>
                  <span>{label}</span>
                  <span style={{ fontFamily:'JetBrains Mono,monospace' }}>{formatCurrency(val, currency)}</span>
                </div>
              ))}
              <div style={{ height:1, background:'#e2e8f0', margin:'10px 0' }} />
              <div style={{ display:'flex', justifyContent:'space-between', padding:'3px 0', fontSize:19, fontWeight:800, color:'#0f172a' }}>
                <span>Grand Total</span>
                <span style={{ fontFamily:'JetBrains Mono,monospace' }}>{formatCurrency(inv.grandTotal, currency)}</span>
              </div>
              {inv.amountPaid > 0 && (
                <>
                  <div style={{ display:'flex', justifyContent:'space-between', padding:'5px 0', fontSize:13, fontWeight:600, color:'#16a34a' }}>
                    <span>Amount Paid</span>
                    <span style={{ fontFamily:'JetBrains Mono,monospace' }}>− {formatCurrency(inv.amountPaid, currency)}</span>
                  </div>
                  <div style={{ height:1, background:'#e2e8f0', margin:'8px 0' }} />
                  <div style={{ display:'flex', justifyContent:'space-between', padding:'3px 0', fontSize:15, fontWeight:800, color: isPaid ? '#16a34a' : '#ef4444' }}>
                    <span>Balance Due</span>
                    <span style={{ fontFamily:'JetBrains Mono,monospace' }}>{formatCurrency(inv.balance, currency)}</span>
                  </div>
                </>
              )}
            </div>
          </div>

          {/* Footer */}
          <div style={{ padding:'14px 28px', background:'#f8fafc', borderTop:'1px solid #f1f5f9', display:'flex', alignItems:'center', gap:8 }}>
            <Info size={12} color="#94a3b8" />
            <span style={{ fontSize:11, color:'#94a3b8', fontWeight:500 }}>{t('footer_note')}</span>
          </div>
        </div>

        {/* ── Payment history ──────────────────────────────────────────────── */}
        {payments.length > 0 && (
          <div className="no-print" style={{ marginTop:20, background:'#fff', border:'1px solid #e2e8f0', borderRadius:16, overflow:'hidden', boxShadow:'0 1px 4px rgba(0,0,0,.04)' }}>
            <div style={{ padding:'16px 24px', borderBottom:'1px solid #f1f5f9', display:'flex', alignItems:'center', gap:8 }}>
              <Receipt size={15} color="#64748b" />
              <span style={{ fontSize:13, fontWeight:700, color:'#0f172a' }}>{t('payment_history')}</span>
              <span style={{ marginLeft:'auto', fontSize:12, color:'#94a3b8' }}>
                {payments.length} {payments.length === 1 ? 'entry' : 'entries'}
              </span>
            </div>
            <table style={{ width:'100%', borderCollapse:'collapse' }}>
              <thead>
                <tr style={{ background:'#f8fafc' }}>
                  {[['Date','left'],['Method','left'],['Reference','left'],['Amount','right']].map(([h, align]) => (
                    <th key={h} style={{ padding:'9px 24px', fontSize:9, fontWeight:700, color:'#94a3b8', letterSpacing:'0.12em', textAlign:align }}>
                      {h.toUpperCase()}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {payments.map((p, i) => (
                  <tr key={i} className="line-row" style={{ borderTop:'1px solid #f1f5f9' }}>
                    <td style={{ padding:'13px 24px', fontSize:13, color:'#475569' }}>{formatDate(p.createdAt)}</td>
                    <td style={{ padding:'13px 24px', fontSize:13, color:'#475569' }}>{methodLabel(p.method)}</td>
                    <td style={{ padding:'13px 24px', fontSize:12, color:'#94a3b8', fontFamily:'JetBrains Mono,monospace' }}>
                      {p.reference || <span style={{ color:'#e2e8f0' }}>—</span>}
                    </td>
                    <td style={{ padding:'13px 24px', fontSize:13, fontWeight:700, color:'#16a34a', textAlign:'right', fontFamily:'JetBrains Mono,monospace' }}>
                      {formatCurrency(p.amount, currency)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* ── Record Payment Modal ─────────────────────────────────────────── */}
      {showPay && (
        <div
          role="dialog" aria-modal="true" aria-labelledby="pay-title"
          style={{ position:'fixed', inset:0, background:'rgba(15,23,42,.55)', backdropFilter:'blur(6px)', display:'flex', alignItems:'center', justifyContent:'center', zIndex:1000, padding:24, animation:'overlayIn .2s ease' }}
          onClick={e => { if (e.target === e.currentTarget) closePayModal(); }}
        >
          <div
            style={{ background:'#fff', borderRadius:22, width:'100%', maxWidth:420, overflow:'hidden', boxShadow:'0 32px 80px rgba(0,0,0,.22)', animation:'modalIn .25s ease' }}
            onClick={e => e.stopPropagation()}
          >
            {/* Modal header */}
            <div style={{ background:'#0f172a', padding:'26px 30px' }}>
              <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start' }}>
                <div>
                  <p style={{ fontSize:10, fontWeight:700, color:'rgba(255,255,255,.3)', letterSpacing:'0.14em', margin:'0 0 4px' }}>PAYMENT</p>
                  <h2 id="pay-title" style={{ fontSize:20, fontWeight:800, color:'#fff', margin:0 }}>
                    {t('record_payment')}
                  </h2>
                </div>
                <button onClick={closePayModal} aria-label="Close" style={{ background:'rgba(255,255,255,.1)', border:'none', borderRadius:8, width:34, height:34, cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'center', color:'#fff', flexShrink:0 }}>
                  <X size={16} />
                </button>
              </div>
              {/* Invoice + balance summary */}
              <div style={{ marginTop:14, padding:'10px 14px', background:'rgba(255,255,255,.06)', borderRadius:10, display:'flex', justifyContent:'space-between', alignItems:'center' }}>
                <div>
                  <div style={{ fontSize:10, color:'rgba(255,255,255,.3)', fontWeight:600, marginBottom:2, letterSpacing:'0.1em' }}>INVOICE</div>
                  <div style={{ fontSize:12, color:'rgba(255,255,255,.6)', fontFamily:'JetBrains Mono,monospace', fontWeight:600 }}>{inv.invoiceNumber}</div>
                  <div style={{ fontSize:11, color:'rgba(255,255,255,.35)', marginTop:1 }}>{billName}</div>
                </div>
                <div style={{ textAlign:'right' }}>
                  <div style={{ fontSize:10, color:'rgba(255,255,255,.3)', fontWeight:600, marginBottom:2, letterSpacing:'0.1em' }}>BALANCE</div>
                  <div style={{ fontSize:20, fontWeight:800, color:'#f87171', fontFamily:'JetBrains Mono,monospace' }}>
                    {formatCurrency(inv.balance, currency)}
                  </div>
                </div>
              </div>
            </div>

            {/* Modal body */}
            <div style={{ padding:'24px 30px', display:'flex', flexDirection:'column', gap:14 }}>
              {/* Amount */}
              <div>
                <label htmlFor="pay-amount" style={{ fontSize:10, fontWeight:700, color:'#94a3b8', letterSpacing:'0.12em', display:'block', marginBottom:6 }}>
                  AMOUNT ({currency})
                </label>
                <input
                  id="pay-amount"
                  className={`inv-input${payForm.amount && !payAmountValid ? ' has-error' : ''}`}
                  type="number" min="0.01" max={inv.balance} step="0.01"
                  placeholder={`Max ${formatCurrency(inv.balance, currency)}`}
                  value={payForm.amount}
                  onChange={e => setPayForm(f => ({ ...f, amount: e.target.value }))}
                  autoFocus
                />
                {payForm.amount && !payAmountValid && (
                  <p style={{ fontSize:11, color:'#ef4444', margin:'4px 0 0' }}>
                    {payAmount <= 0
                      ? t('amount_must_be_positive')
                      : t('amount_exceeds_balance', { balance: formatCurrency(inv.balance, currency) })
                    }
                  </p>
                )}
              </div>

              {/* Method */}
              <div>
                <label htmlFor="pay-method" style={{ fontSize:10, fontWeight:700, color:'#94a3b8', letterSpacing:'0.12em', display:'block', marginBottom:6 }}>METHOD</label>
                <select id="pay-method" className="inv-input" value={payForm.method} onChange={e => setPayForm(f => ({ ...f, method: e.target.value }))}>
                  {METHODS.map(m => <option key={m} value={m}>{methodLabel(m)}</option>)}
                </select>
              </div>

              {/* Reference */}
              <div>
                <label htmlFor="pay-ref" style={{ fontSize:10, fontWeight:700, color:'#94a3b8', letterSpacing:'0.12em', display:'block', marginBottom:6 }}>REFERENCE</label>
                <input id="pay-ref" className="inv-input" placeholder={t('reference_placeholder')} value={payForm.reference} onChange={e => setPayForm(f => ({ ...f, reference: e.target.value }))} />
              </div>

              {/* Notes */}
              <div>
                <label htmlFor="pay-notes" style={{ fontSize:10, fontWeight:700, color:'#94a3b8', letterSpacing:'0.12em', display:'block', marginBottom:6 }}>
                  NOTES <span style={{ fontWeight:400, color:'#cbd5e1', textTransform:'none', letterSpacing:0 }}>({t('optional')})</span>
                </label>
                <textarea id="pay-notes" className="inv-input" rows={2} style={{ resize:'vertical' }} placeholder={t('notes_placeholder')} value={payForm.notes} onChange={e => setPayForm(f => ({ ...f, notes: e.target.value }))} />
              </div>

              <button
                className="inv-solid"
                style={{ width:'100%', justifyContent:'center', padding:'13px', borderRadius:12, fontSize:14, marginTop:2 }}
                onClick={() => payMutation.mutate(payForm)}
                disabled={!payAmountValid || payMutation.isPending}
              >
                {payMutation.isPending ? t('processing') : t('confirm_payment')}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}