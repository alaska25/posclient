import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { useParams, Link } from 'react-router-dom';
import api from '../utils/api';
import { formatCurrency, formatDate, badgeClass, statusLabel } from '../utils/format';
import { useCurrency } from '../context/CurrencyContext';

// ── Helpers ────────────────────────────────────────────────────────────────
const ratingColor = { VIP: '#7c3aed', Regular: '#0369a1', Blacklisted: '#dc2626' };
const ratingBg    = { VIP: '#f5f3ff', Regular: '#e0f2fe', Blacklisted: '#fef2f2' };
const planColor   = { None: '#94a3b8', Basic: '#0369a1', Standard: '#7c3aed', Premium: '#b45309' };
const planBg      = { None: '#f8fafc', Basic: '#e0f2fe', Standard: '#f5f3ff', Premium: '#fffbeb' };

const typeLabel = {
  homeowner:        'Homeowner',
  business:         'Business',
  property_manager: 'Property Manager',
};

function InfoRow({ label, value, mono }) {
  if (!value || value === '—') return null;
  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', padding: '9px 0', borderBottom: '1px solid #f1f5f9' }}>
      <span style={{ fontSize: 12, color: '#94a3b8', fontWeight: 600, letterSpacing: '0.04em', minWidth: 140 }}>{label}</span>
      <span style={{ fontSize: 13, color: '#0f172a', fontWeight: 500, textAlign: 'right', fontFamily: mono ? 'JetBrains Mono, monospace' : 'inherit' }}>{value}</span>
    </div>
  );
}

function SectionTitle({ children }) {
  return (
    <div style={{ fontSize: 10, fontWeight: 700, color: '#94a3b8', letterSpacing: '0.14em', marginBottom: 8, marginTop: 4, textTransform: 'uppercase' }}>
      {children}
    </div>
  );
}

function StatCard({ label, value, color }) {
  return (
    <div style={{ background: '#f8fafc', borderRadius: 12, padding: '14px 18px', flex: 1 }}>
      <div style={{ fontSize: 11, color: '#94a3b8', fontWeight: 600, marginBottom: 4 }}>{label}</div>
      <div style={{ fontSize: 20, fontWeight: 800, color: color || '#0f172a', fontFamily: 'JetBrains Mono, monospace' }}>{value}</div>
    </div>
  );
}

// ── Main ───────────────────────────────────────────────────────────────────
export default function CustomerDetail() {
  const { id }       = useParams();
  const { currency } = useCurrency();

  const { data: customer } = useQuery({
    queryKey: ['customer', id],
    queryFn:  () => api.get(`/customers/${id}`).then(r => r.data.data),
    enabled:  !!id, 
  });

  const { data: jobsRes } = useQuery({
    queryKey: ['jobs-customer', id],
    queryFn:  () => api.get('/jobs', { params: { customer: id, limit: 20 } }).then(r => r.data),
    enabled:  !!id, 
  });

  const { data: invRes } = useQuery({
    queryKey: ['invoices-customer', id],
    queryFn:  () => api.get('/invoices', { params: { customer: id, limit: 20 } }).then(r => r.data),
    enabled:  !!id, 
  });

  if (!customer) return <div className="text-muted">Loading…</div>;

  const totalInvoiced = invRes?.data?.reduce((s, i) => s + (i.grandTotal || 0), 0) ?? 0;
  const totalBalance  = invRes?.data?.reduce((s, i) => s + (i.balance   || 0), 0) ?? 0;
  const totalJobs     = jobsRes?.data?.length ?? 0;

  return (
    <div style={{ fontFamily: 'Outfit, sans-serif' }}>

      {/* ── Header ── */}
      <div className="page-header" style={{ marginBottom: 24 }}>
        <div>
          <Link to="/app/customers" style={{ color: 'var(--text-muted)', fontSize: 13, textDecoration: 'none' }}>
            ← Customers
          </Link>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginTop: 6, flexWrap: 'wrap' }}>
            <h1 className="page-title" style={{ margin: 0 }}>{customer.company || customer.name}</h1>
            <span style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 12, fontWeight: 600, background: '#f1f5f9', color: '#475569', padding: '4px 10px', borderRadius: 7, letterSpacing: '0.06em' }}>
              {customer.customerCode || `#${customer._id.slice(-6).toUpperCase()}`}
            </span>
            {customer.rating && (
              <span style={{ fontSize: 11, fontWeight: 700, padding: '4px 10px', borderRadius: 999, color: ratingColor[customer.rating], background: ratingBg[customer.rating] }}>
                {customer.rating}
              </span>
            )}
            {customer.customerType && (
              <span style={{ fontSize: 11, fontWeight: 600, padding: '4px 10px', borderRadius: 999, background: '#f1f5f9', color: '#64748b' }}>
                {typeLabel[customer.customerType] || customer.customerType}
              </span>
            )}
            {customer.plan && customer.plan !== 'None' && (
              <span style={{ fontSize: 11, fontWeight: 700, padding: '4px 10px', borderRadius: 999, color: planColor[customer.plan], background: planBg[customer.plan] }}>
                {customer.plan} Plan
              </span>
            )}
          </div>
          {customer.serviceArea && (
            <div style={{ fontSize: 13, color: '#94a3b8', marginTop: 4 }}>
              📍 {customer.serviceArea}
              {customer.preferredService ? ` · ${customer.preferredService}` : ''}
            </div>
          )}
        </div>
        <Link to="/app/jobs/new" className="btn btn-primary">+ New Work Order</Link>
      </div>

      {/* ── Stat Row ── */}
      <div style={{ display: 'flex', gap: 12, marginBottom: 20, flexWrap: 'wrap' }}>
        <StatCard label="TOTAL JOBS"     value={totalJobs} />
        <StatCard label="TOTAL INVOICED" value={formatCurrency(totalInvoiced, currency || customer.currency)} />
        <StatCard label="OUTSTANDING"    value={formatCurrency(totalBalance,  currency || customer.currency)} color={totalBalance > 0 ? '#ef4444' : '#16a34a'} />
        <StatCard label="CREDIT LIMIT"   value={formatCurrency(customer.creditLimit || 0, currency || customer.currency)} />
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '320px 1fr', gap: 16, alignItems: 'start' }}>

        {/* ── Left Column ── */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>

          {/* Contact */}
          <div className="card">
            <SectionTitle>Contact</SectionTitle>
            <InfoRow label="Contact Name"   value={customer.name} />
            <InfoRow label="Contact Person" value={customer.contactPerson} />
            <InfoRow label="Email"          value={customer.email} />
            <InfoRow label="Phone"          value={customer.phone} />
            <InfoRow label="Mobile"         value={customer.mobile} />
          </div>

          {/* Address */}
          <div className="card">
            <SectionTitle>Address</SectionTitle>
            <InfoRow label="Service Area" value={customer.serviceArea} />
            <InfoRow label="Street"       value={customer.address?.street} />
            <InfoRow label="City"         value={customer.address?.city} />
            <InfoRow label="Province"     value={customer.address?.state} />
            <InfoRow label="ZIP"          value={customer.address?.zip} />
            <InfoRow label="Country"      value={customer.address?.country} />
          </div>

          {/* Service & Plan */}
          <div className="card">
            <SectionTitle>Service & Subscription</SectionTitle>
            <InfoRow label="Preferred Service" value={customer.preferredService} />
            <InfoRow label="Plan"              value={customer.plan !== 'None' ? customer.plan : null} />
            <InfoRow label="Plan Start"        value={customer.planStartDate ? formatDate(customer.planStartDate) : null} />
            <InfoRow label="Plan End"          value={customer.planEndDate   ? formatDate(customer.planEndDate)   : null} />
          </div>

          {/* Financial */}
          <div className="card">
            <SectionTitle>Financial</SectionTitle>
            <InfoRow label="Payment Terms" value={customer.paymentTerms} />
            <InfoRow label="Currency"      value={customer.currency} />
            <InfoRow label="Credit Limit"  value={formatCurrency(customer.creditLimit || 0, customer.currency)} />
          </div>

          {/* Notes */}
          {customer.notes && (
            <div className="card">
              <SectionTitle>Notes</SectionTitle>
              <p style={{ fontSize: 13, color: '#475569', lineHeight: 1.6, margin: 0 }}>{customer.notes}</p>
            </div>
          )}
        </div>

        {/* ── Right Column ── */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>

          {/* Work Orders */}
          <div className="card">
            <h3 style={{ marginBottom: 14, fontSize: 15 }}>Work Orders</h3>
            <div className="table-wrap">
              <table>
                <thead>
                  <tr>
                    <th>Job #</th>
                    <th>Description</th>
                    <th>Status</th>
                    <th>Total</th>
                    <th>Due</th>
                  </tr>
                </thead>
                <tbody>
                  {jobsRes?.data?.map(job => (
                    <tr key={job._id}>
                      <td>
                        <Link to={`/app/jobs/${job._id}`} className="mono text-accent" style={{ textDecoration: 'none' }}>
                          {job.jobNumber}
                        </Link>
                      </td>
                      <td style={{ fontSize: 13, color: 'var(--text-muted)', maxWidth: 200 }}>
                        {job.description || '—'}
                      </td>
                      <td><span className={badgeClass(job.status)}>{statusLabel(job.status)}</span></td>
                      <td><span className="amount">{formatCurrency(job.grandTotal, currency)}</span></td>
                      <td className="text-muted">{formatDate(job.dueDate)}</td>
                    </tr>
                  ))}
                  {!jobsRes?.data?.length && (
                    <tr><td colSpan={5} className="text-muted" style={{ padding: 16 }}>No work orders yet</td></tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Invoices */}
          <div className="card">
            <h3 style={{ marginBottom: 14, fontSize: 15 }}>Invoices</h3>
            <div className="table-wrap">
              <table>
                <thead>
                  <tr>
                    <th>Invoice #</th>
                    <th>Status</th>
                    <th>Total</th>
                    <th>Balance</th>
                    <th>Due</th>
                  </tr>
                </thead>
                <tbody>
                  {invRes?.data?.map(inv => (
                    <tr key={inv._id}>
                      <td>
                        <Link to={`/app/invoices/${inv._id}`} className="mono text-accent" style={{ textDecoration: 'none' }}>
                          {inv.invoiceNumber}
                        </Link>
                      </td>
                      <td><span className={badgeClass(inv.status)}>{statusLabel(inv.status)}</span></td>
                      <td><span className="amount">{formatCurrency(inv.grandTotal, currency)}</span></td>
                      <td>
                        <span className={`amount ${inv.balance > 0 ? 'text-red' : 'text-green'}`}>
                          {formatCurrency(inv.balance, currency)}
                        </span>
                      </td>
                      <td className="text-muted">{formatDate(inv.dueDate)}</td>
                    </tr>
                  ))}
                  {!invRes?.data?.length && (
                    <tr><td colSpan={5} className="text-muted" style={{ padding: 16 }}>No invoices yet</td></tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}