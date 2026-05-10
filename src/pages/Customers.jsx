import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import api from '../utils/api';

const CUSTOMER_TYPES = ['homeowner', 'business', 'property_manager'];

const SERVICE_AREAS = {
  'Luzon': [
    'Metro Manila', 'Quezon City', 'Makati', 'BGC', 'Pasig', 'Mandaluyong',
    'Taguig', 'Paranaque', 'Las Pinas', 'Muntinlupa', 'Marikina', 'Caloocan',
    'Malabon', 'Valenzuela', 'Pasay', 'Manila', 'Cavite', 'Laguna',
    'Batangas', 'Rizal', 'Bulacan', 'Pampanga', 'Bataan', 'Zambales',
    'Baguio', 'Dagupan', 'Olongapo',
  ],
  'Visayas': [
    'Cebu City', 'Mandaue', 'Lapu-Lapu', 'Talisay', 'Iloilo City',
    'Bacolod', 'Tacloban', 'Ormoc', 'Dumaguete', 'Tagbilaran',
  ],
  'Mindanao': [
    'Davao City', 'Cagayan de Oro', 'Zamboanga City', 'General Santos',
    'Butuan', 'Iligan', 'Cotabato City', 'Koronadal', 'Pagadian',
  ],
};

const PREFERRED_SERVICES = [
  'Electrical Repairs', 'Plumbing Services', 'HVAC & Aircon',
  'Appliance Repair', 'Home Renovation', 'Security Systems', 'Maintenance',
];
const PLANS         = ['None', 'Basic', 'Standard', 'Premium'];
const PAYMENT_TERMS = ['COD', '15 Days', '30 Days', '60 Days', '90 Days'];
const CURRENCIES    = ['PHP', 'USD', 'EUR'];

const EMPTY_FORM = {
  customerType:     'homeowner',
  name:             '',
  company:          '',
  contactPerson:    '',
  email:            '',
  phone:            '',
  mobile:           '',
  serviceArea:      '',
  address: { street: '', city: '', state: '', zip: '', country: 'Philippines' },
  preferredService: '',
  plan:             'None',
  paymentTerms:     'COD',
  currency:         'PHP',
  creditLimit:      '',
  rating:           'Regular',
  notes:            '',
};

const ratingColor = { VIP: '#7c3aed', Regular: '#0369a1', Blacklisted: '#dc2626' };
const ratingBg    = { VIP: '#f5f3ff', Regular: '#e0f2fe', Blacklisted: '#fef2f2' };
const planColor   = { None: '#94a3b8', Basic: '#0369a1', Standard: '#7c3aed', Premium: '#b45309' };
const planBg      = { None: '#f8fafc', Basic: '#e0f2fe', Standard: '#f5f3ff', Premium: '#fffbeb' };

function Toast({ message, onDone }) {
  React.useEffect(() => {
    const t = setTimeout(onDone, 3500);
    return () => clearTimeout(t);
  }, [onDone]);
  return (
    <div style={{
      position: 'fixed', bottom: 28, right: 28, zIndex: 9999,
      background: '#0f172a', color: '#fff', padding: '14px 20px', borderRadius: 14,
      display: 'flex', alignItems: 'center', gap: 12,
      boxShadow: '0 8px 32px rgba(0,0,0,0.22)', animation: 'slideUp .25s ease',
      fontSize: 14, fontWeight: 500, minWidth: 300,
    }}>
      <style>{`@keyframes slideUp{from{opacity:0;transform:translateY(12px)}to{opacity:1;transform:translateY(0)}}`}</style>
      <span style={{ width: 28, height: 28, borderRadius: '50%', background: '#16a34a', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
        <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
          <path d="M2.5 7L5.5 10L11.5 4" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      </span>
      <div>
        <div style={{ fontWeight: 700, marginBottom: 2 }}>Customer Created</div>
        <div style={{ fontSize: 12, color: 'rgba(255,255,255,.55)' }}>{message}</div>
      </div>
    </div>
  );
}

function Section({ title }) {
  return (
    <div style={{
      fontSize: 10, fontWeight: 700, color: '#94a3b8', letterSpacing: '0.14em',
      textTransform: 'uppercase', margin: '20px 0 10px',
      paddingBottom: 6, borderBottom: '1px solid #f1f5f9',
    }}>
      {title}
    </div>
  );
}

function ServiceAreaSelect({ value, onChange }) {
  return (
    <select value={value} onChange={onChange}>
      <option value="">Select area…</option>
      {Object.entries(SERVICE_AREAS).map(([region, cities]) => (
        <optgroup key={region} label={`── ${region} ──`}>
          {cities.map(city => (
            <option key={city} value={city}>{city}</option>
          ))}
        </optgroup>
      ))}
    </select>
  );
}

export default function Customers() {
  const { t }    = useTranslation();
  const navigate = useNavigate();
  const qc       = useQueryClient();

  const [search, setSearch] = useState('');
  const [modal,  setModal]  = useState(false);
  const [toast,  setToast]  = useState(null);
  const [form,   setForm]   = useState(EMPTY_FORM);

  const { data } = useQuery({
    queryKey: ['customers', search],
    queryFn:  () => api.get('/customers', { params: { search, limit: 50 } }).then(r => r.data),
  });

  const mutation = useMutation({
    mutationFn: () => api.post('/customers', form),
    onSuccess: (res) => {
      qc.invalidateQueries(['customers']);
      setModal(false);
      setForm(EMPTY_FORM);
      const c = res.data?.data;
      setToast({ message: `${c?.company || c?.name} · ${c?.customerCode}` });
    },
  });

  const set     = (key, val) => setForm(f => ({ ...f, [key]: val }));
  const setAddr = (key, val) => setForm(f => ({ ...f, address: { ...f.address, [key]: val } }));

  const typeLabel = {
    homeowner:        'Homeowner',
    business:         'Business',
    property_manager: 'Property Manager',
  };

  return (
    <div>
      {toast && <Toast message={toast.message} onDone={() => setToast(null)} />}

      <div className="page-header">
        <h1 className="page-title">{t('customers')}</h1>
        <button className="btn btn-primary" onClick={() => setModal(true)}>+ {t('add_customer')}</button>
      </div>

      <div className="card" style={{ marginBottom: 16 }}>
        <input
          style={{ maxWidth: 320 }}
          placeholder={t('search_customers')}
          value={search}
          onChange={e => setSearch(e.target.value)}
        />
      </div>

      <div className="card">
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>{t('code')}</th>
                <th>{t('name_company')}</th>
                <th>{t('email')}</th>
                <th>{t('phone')}</th>
                <th>Service Area</th>
                <th>Plan</th>
                <th>{t('rating')}</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {data?.data?.map(c => (
                <tr key={c._id} onClick={() => navigate(`/app/customers/${c._id}`)} style={{ cursor: 'pointer' }}>
                  <td>
                    <span style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 11, fontWeight: 600, background: '#f1f5f9', color: '#475569', padding: '3px 8px', borderRadius: 6, letterSpacing: '0.06em', whiteSpace: 'nowrap' }}>
                      {c.customerCode || `#${c._id.slice(-6).toUpperCase()}`}
                    </span>
                  </td>
                  <td>
                    <div style={{ fontWeight: 600 }}>{c.company || c.name}</div>
                    {c.company && <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>{c.name}</div>}
                    <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 2 }}>{typeLabel[c.customerType] || c.customerType}</div>
                  </td>
                  <td className="text-muted">{c.email || '—'}</td>
                  <td className="text-muted">{c.phone || c.mobile || '—'}</td>
                  <td className="text-muted">{c.serviceArea || '—'}</td>
                  <td>
                    {c.plan && c.plan !== 'None' ? (
                      <span style={{ fontSize: 11, fontWeight: 700, padding: '3px 8px', borderRadius: 999, color: planColor[c.plan], background: planBg[c.plan] }}>
                        {c.plan}
                      </span>
                    ) : (
                      <span style={{ color: 'var(--text-muted)', fontSize: 12 }}>—</span>
                    )}
                  </td>
                  <td>
                    {c.rating && (
                      <span style={{ fontSize: 11, fontWeight: 700, padding: '3px 8px', borderRadius: 999, color: ratingColor[c.rating], background: ratingBg[c.rating] }}>
                        {c.rating}
                      </span>
                    )}
                  </td>
                  <td><button className="btn btn-ghost btn-sm">{t('view')}</button></td>
                </tr>
              ))}
              {!data?.data?.length && (
                <tr><td colSpan={8} style={{ textAlign: 'center', padding: '32px', color: 'var(--text-muted)' }}>{t('no_customers')}</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* ── Add Customer Modal ── */}
      {modal && (
        <div
          onClick={e => { if (e.target === e.currentTarget) { setModal(false); setForm(EMPTY_FORM); } }}
          style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 200, padding: 24 }}
        >
          <div className="card" style={{ width: 580, maxWidth: '94vw', maxHeight: '90vh', overflowY: 'auto' }}>
            <h3 style={{ marginBottom: 4 }}>{t('new_customer')}</h3>
            <p style={{ fontSize: 13, color: '#94a3b8', marginBottom: 4 }}>{t('customer_code_auto')}</p>

            {/* ── Identity ── */}
            <Section title="Identity" />
            <div className="form-row">
              <div className="form-group">
                <label>Customer Type</label>
                <select value={form.customerType} onChange={e => set('customerType', e.target.value)}>
                  {CUSTOMER_TYPES.map(type => (
                    <option key={type} value={type}>{typeLabel[type]}</option>
                  ))}
                </select>
              </div>
              <div className="form-group">
                <label>{t('rating')}</label>
                <select value={form.rating} onChange={e => set('rating', e.target.value)}>
                  <option value="Regular">Regular</option>
                  <option value="VIP">VIP</option>
                  <option value="Blacklisted">Blacklisted</option>
                </select>
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label>{t('contact_name')} *</label>
                <input
                  placeholder="Juan dela Cruz"
                  value={form.name}
                  onChange={e => set('name', e.target.value)}
                />
              </div>
              <div className="form-group">
                <label>Company / Property Name</label>
                <input
                  placeholder="e.g. Reyes Property Group"
                  value={form.company}
                  onChange={e => set('company', e.target.value)}
                />
              </div>
            </div>

            <div className="form-group">
              <label>Contact Person</label>
              <input
                placeholder="e.g. Accounting / Building Admin"
                value={form.contactPerson}
                onChange={e => set('contactPerson', e.target.value)}
              />
            </div>

            {/* ── Contact ── */}
            <Section title="Contact" />
            <div className="form-row">
              <div className="form-group">
                <label>{t('email')}</label>
                <input
                  type="email"
                  placeholder="juan@email.com"
                  value={form.email}
                  onChange={e => set('email', e.target.value)}
                />
              </div>
              <div className="form-group">
                <label>{t('phone')}</label>
                <input
                  placeholder="+63 2 8XXX XXXX"
                  value={form.phone}
                  onChange={e => set('phone', e.target.value)}
                />
              </div>
            </div>
            <div className="form-group">
              <label>Mobile</label>
              <input
                placeholder="+63 9XX XXX XXXX"
                value={form.mobile}
                onChange={e => set('mobile', e.target.value)}
              />
            </div>

            {/* ── Address & Service Area ── */}
            <Section title="Address & Service Area" />
            <div className="form-group">
              <label>Service Area</label>
              <ServiceAreaSelect
                value={form.serviceArea}
                onChange={e => set('serviceArea', e.target.value)}
              />
            </div>
            <div className="form-group">
              <label>{t('street')}</label>
              <input
                placeholder="123 Rizal Street"
                value={form.address.street}
                onChange={e => setAddr('street', e.target.value)}
              />
            </div>
            <div className="form-row">
              <div className="form-group">
                <label>{t('city')}</label>
                <input
                  placeholder="Quezon City"
                  value={form.address.city}
                  onChange={e => setAddr('city', e.target.value)}
                />
              </div>
              <div className="form-group">
                <label>Province</label>
                <input
                  placeholder="Metro Manila"
                  value={form.address.state}
                  onChange={e => setAddr('state', e.target.value)}
                />
              </div>
            </div>
            <div className="form-row">
              <div className="form-group">
                <label>{t('zip')}</label>
                <input
                  placeholder="1100"
                  value={form.address.zip}
                  onChange={e => setAddr('zip', e.target.value)}
                />
              </div>
              <div className="form-group">
                <label>Country</label>
                <input
                  value={form.address.country}
                  onChange={e => setAddr('country', e.target.value)}
                />
              </div>
            </div>

            {/* ── Service & Plan ── */}
            <Section title="Service & Subscription" />
            <div className="form-row">
              <div className="form-group">
                <label>Preferred Service</label>
                <select value={form.preferredService} onChange={e => set('preferredService', e.target.value)}>
                  <option value="">None</option>
                  {PREFERRED_SERVICES.map(s => <option key={s} value={s}>{s}</option>)}
                </select>
              </div>
              <div className="form-group">
                <label>Plan</label>
                <select value={form.plan} onChange={e => set('plan', e.target.value)}>
                  {PLANS.map(p => <option key={p} value={p}>{p}</option>)}
                </select>
              </div>
            </div>

            {/* ── Financial ── */}
            <Section title="Financial" />
            <div className="form-row">
              <div className="form-group">
                <label>{t('payment_terms')}</label>
                <select value={form.paymentTerms} onChange={e => set('paymentTerms', e.target.value)}>
                  {PAYMENT_TERMS.map(term => <option key={term} value={term}>{term}</option>)}
                </select>
              </div>
              <div className="form-group">
                <label>{t('currency')}</label>
                <select value={form.currency} onChange={e => set('currency', e.target.value)}>
                  {CURRENCIES.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>
            </div>
            <div className="form-group">
              <label>Credit Limit (₱)</label>
              <input
                type="number"
                min="0"
                placeholder="e.g. 5000"
                value={form.creditLimit}
                onChange={e => set('creditLimit', e.target.value === '' ? '' : Number(e.target.value))}
              />
            </div>

            {/* ── Notes ── */}
            <Section title="Notes" />
            <div className="form-group">
              <textarea
                rows={3}
                placeholder="Internal remarks, special instructions…"
                value={form.notes}
                onChange={e => set('notes', e.target.value)}
                style={{ width: '100%', padding: '10px 12px', border: '1.5px solid #e2e8f0', borderRadius: 10, fontSize: 14, fontFamily: 'inherit', resize: 'vertical' }}
              />
            </div>

            <div style={{ display: 'flex', gap: 8, marginTop: 12 }}>
              <button
                className="btn btn-primary"
                onClick={() => mutation.mutate()}
                disabled={!form.name || mutation.isPending}
              >
                {mutation.isPending ? t('saving') : t('create_customer')}
              </button>
              <button
                className="btn btn-secondary"
                onClick={() => { setModal(false); setForm(EMPTY_FORM); }}
              >
                {t('cancel')}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}