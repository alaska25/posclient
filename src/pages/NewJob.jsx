import React, { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import api from '../utils/api';
import { formatCurrency } from '../utils/format';
import './NewJob.css';
import { useCurrency } from '../context/CurrencyContext';

function Toast({ message, onDone }) {
  useEffect(() => {
    const t = setTimeout(onDone, 2500);
    return () => clearTimeout(t);
  }, [onDone]);

  return (
    <div style={{
      position:'fixed', bottom:28, right:28, zIndex:9999,
      background:'#0f172a', color:'#fff',
      padding:'12px 18px', borderRadius:12,
      display:'flex', alignItems:'center', gap:10,
      boxShadow:'0 8px 32px rgba(0,0,0,0.22)',
      animation:'slideUp .2s ease',
      fontSize:13, fontWeight:500, minWidth:260,
    }}>
      <style>{`@keyframes slideUp{from{opacity:0;transform:translateY(10px)}to{opacity:1;transform:translateY(0)}}`}</style>
      <span style={{
        width:24, height:24, borderRadius:'50%', background:'#16a34a',
        display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0,
      }}>
        <svg width="12" height="12" viewBox="0 0 14 14" fill="none">
          <path d="M2.5 7L5.5 10L11.5 4" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      </span>
      <div>
        <div style={{ fontWeight:700, fontSize:13 }}>Service Added</div>
        <div style={{ fontSize:11, color:'rgba(255,255,255,.5)', marginTop:1 }}>{message}</div>
      </div>
    </div>
  );
}

export default function NewJob() {
  const navigate     = useNavigate();
  const queryClient  = useQueryClient();
  const { currency } = useCurrency();
  const [toast, setToast] = useState(null);
  const [form,  setForm]  = useState({
    customer:    '',
    location:    '',
    description: '',
    priority:    'normal',
    startDate:   '',
    dueDate:     '',
    notes:       '',
  });
  const [lines,         setLines]         = useState([]);
  const [serviceSearch, setServiceSearch] = useState('');
  const [error,         setError]         = useState('');

  const { data: customers } = useQuery({
    queryKey: ['customers-all'],
    queryFn:  () => api.get('/customers?limit=100').then(r => r.data.data),
  });

  const { data: services } = useQuery({
    queryKey: ['services', serviceSearch],
    queryFn:  () => api.get('/services', { params: { search: serviceSearch } }).then(r => r.data.data),
  });

  const addLine = (service) => {
    setLines(prev => [...prev, {
      service:     service._id,
      serviceName: service.name,
      description: service.description || '',
      quantity:    1,
      unit:        service.unit,
      unitPrice:   service.unitPrice,
      taxRate:     service.taxRate,
      discount:    0,
    }]);
    setToast(service.name);
  };

  const updateLine = (idx, field, value) =>
    setLines(prev => prev.map((l, i) => i === idx ? { ...l, [field]: value } : l));

  const removeLine = (idx) =>
    setLines(prev => prev.filter((_, i) => i !== idx));

  const lineTotal = (l) => {
    const base = Number(l.quantity) * Number(l.unitPrice) * (1 - Number(l.discount || 0) / 100);
    return base * (1 + Number(l.taxRate) / 100);
  };

  const subtotal = lines.reduce((s, l) =>
    s + Number(l.quantity) * Number(l.unitPrice) * (1 - Number(l.discount || 0) / 100), 0);

  const taxTotal = lines.reduce((s, l) => {
    const base = Number(l.quantity) * Number(l.unitPrice) * (1 - Number(l.discount || 0) / 100);
    return s + base * (Number(l.taxRate) / 100);
  }, 0);

  const grandTotal = subtotal + taxTotal;

  const mutation = useMutation({
    mutationFn: (data) => api.post('/jobs', data),
    onSuccess: (res) => {
      queryClient.invalidateQueries(['jobs']);
      navigate(`/app/jobs/${res.data.data._id}?created=1`);
    },
    onError: (err) => setError(err.response?.data?.message || 'Failed to create work order'),
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!form.customer) return setError('Please select a customer');
    if (!lines.length)  return setError('Add at least one service line');
    setError('');
    mutation.mutate({ ...form, lines });
  };

  const categories = [...new Set(services?.map(s => s.category) || [])];

  return (
    <div>
      {toast && <Toast message={toast} onDone={() => setToast(null)} />}

      <div className="page-header">
        <h1 className="page-title">New Work Order</h1>
        <button className="btn btn-ghost" onClick={() => navigate('/app/jobs')}>← Cancel</button>
      </div>

      {error && (
        <div style={{
          background:'var(--red-dim)', border:'1px solid rgba(239,68,68,0.3)',
          color:'var(--red)', borderRadius:'var(--radius)',
          padding:'10px 14px', marginBottom:16,
        }}>
          {error}
        </div>
      )}

      <div className="newjob-layout">

        {/* Left: Form */}
        <div className="newjob-left">
          <div className="card" style={{ marginBottom:16 }}>
            <h3 style={{ marginBottom:18, fontSize:15 }}>Job Details</h3>

            <div className="form-group">
              <label>Customer *</label>
              <select value={form.customer} onChange={e => setForm({ ...form, customer: e.target.value })}>
                <option value="">Select customer…</option>
                {customers?.map(c => (
                  <option key={c._id} value={c._id}>{c.company || c.name}</option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label>Service Location</label>
              <input
                placeholder="e.g. 123 Rizal St, Quezon City"
                value={form.location}
                onChange={e => setForm({ ...form, location: e.target.value })}
              />
            </div>

            <div className="form-group">
              <label>Remarks</label>
              <textarea
                rows={3}
                placeholder="Remarks or special instructions…"
                value={form.description}
                onChange={e => setForm({ ...form, description: e.target.value })}
              />
            </div>

            <div className="form-row">
              <div className="form-group">
                <label>Priority</label>
                <select value={form.priority} onChange={e => setForm({ ...form, priority: e.target.value })}>
                  <option value="low">Low</option>
                  <option value="normal">Normal</option>
                  <option value="high">High</option>
                  <option value="urgent">Urgent</option>
                </select>
              </div>
              <div className="form-group">
                <label>Start Date</label>
                <input
                  type="date"
                  value={form.startDate}
                  onChange={e => setForm({ ...form, startDate: e.target.value })}
                />
              </div>
              <div className="form-group">
                <label>Due Date</label>
                <input
                  type="date"
                  value={form.dueDate}
                  onChange={e => setForm({ ...form, dueDate: e.target.value })}
                />
              </div>
            </div>

            <div className="form-group">
              <label>Internal Notes</label>
              <textarea
                rows={2}
                placeholder="Internal notes for staff only…"
                value={form.notes}
                onChange={e => setForm({ ...form, notes: e.target.value })}
              />
            </div>
          </div>

          {/* Service Lines */}
          <div className="card">
            <h3 style={{ marginBottom:16, fontSize:15 }}>
              Service Lines
              {lines.length > 0 && (
                <span style={{
                  marginLeft:10, fontSize:11, fontWeight:700,
                  background:'#0f172a', color:'#fff',
                  padding:'2px 8px', borderRadius:999,
                }}>
                  {lines.length}
                </span>
              )}
            </h3>

            {lines.length === 0 && (
              <p className="text-muted" style={{ fontSize:13, marginBottom:16 }}>
                No services added yet. Browse the catalog →
              </p>
            )}

            {lines.map((line, idx) => (
              <div key={idx} className="service-line">
                <div className="line-header">
                  <span className="line-name">{line.serviceName}</span>
                  <button className="btn btn-ghost btn-sm" onClick={() => removeLine(idx)}>✕</button>
                </div>
                <input
                  placeholder="Remarks / notes for this line"
                  value={line.description}
                  onChange={e => updateLine(idx, 'description', e.target.value)}
                  style={{ marginBottom:8, fontSize:13 }}
                />
                <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr 1fr 1fr', gap:8 }}>
                  <div>
                    <label>QTY ({line.unit})</label>
                    <input type="number" min="0.01" step="0.01" value={line.quantity}
                      onChange={e => updateLine(idx, 'quantity', e.target.value)} />
                  </div>
                  <div>
                    <label>Unit Price ({currency})</label>
                    <input type="number" min="0" value={line.unitPrice}
                      onChange={e => updateLine(idx, 'unitPrice', e.target.value)} />
                  </div>
                  <div>
                    <label>Discount %</label>
                    <input type="number" min="0" max="100" value={line.discount}
                      onChange={e => updateLine(idx, 'discount', e.target.value)} />
                  </div>
                  <div>
                    <label>Tax %</label>
                    <input type="number" min="0" value={line.taxRate}
                      onChange={e => updateLine(idx, 'taxRate', e.target.value)} />
                  </div>
                </div>
                <div style={{ textAlign:'right', marginTop:8, fontSize:13, color:'var(--text-secondary)' }}>
                  Line total: <span className="amount text-accent">{formatCurrency(lineTotal(line), currency)}</span>
                </div>
              </div>
            ))}

            <hr className="divider" />

            <div className="totals">
              <div className="total-row">
                <span>Subtotal</span>
                <span className="amount">{formatCurrency(subtotal, currency)}</span>
              </div>
              <div className="total-row">
                <span>Tax</span>
                <span className="amount">{formatCurrency(taxTotal, currency)}</span>
              </div>
              <div className="total-row grand">
                <span>TOTAL</span>
                <span className="amount text-accent">{formatCurrency(grandTotal, currency)}</span>
              </div>
            </div>

            <button
              className="btn btn-primary"
              style={{ width:'100%', marginTop:20 }}
              onClick={handleSubmit}
              disabled={mutation.isPending}
            >
              {mutation.isPending ? 'Creating…' : '✓ Create Work Order'}
            </button>
          </div>
        </div>

        {/* Right: Service Catalog */}
        <div className="newjob-right">
          <div className="card" style={{ position:'sticky', top:20 }}>
            <h3 style={{ marginBottom:14, fontSize:15 }}>Service Catalog</h3>
            <input
              placeholder="Search services…"
              value={serviceSearch}
              onChange={e => setServiceSearch(e.target.value)}
              style={{ marginBottom:16 }}
            />
            <div className="catalog-list">
              {categories.map(cat => (
                <div key={cat}>
                  <div className="cat-label">{cat}</div>
                  {services?.filter(s => s.category === cat).map(s => (
                    <button key={s._id} className="catalog-item" onClick={() => addLine(s)}>
                      <span className="catalog-name">{s.name}</span>
                      <span className="catalog-price">
                        {formatCurrency(s.unitPrice, currency)}<em>/{s.unit}</em>
                      </span>
                    </button>
                  ))}
                </div>
              ))}
              {!categories.length && (
                <p className="text-muted" style={{ fontSize:13 }}>No services found.</p>
              )}
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}