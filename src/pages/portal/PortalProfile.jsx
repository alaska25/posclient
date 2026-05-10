import React, { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import api from '../../utils/api';
import Swal from 'sweetalert2';

const SERVICE_AREAS = [
  'Quezon City', 'Makati', 'BGC', 'Pasig', 'Mandaluyong',
  'Taguig', 'Paranaque', 'Las Pinas', 'Muntinlupa', 'Marikina',
  'Caloocan', 'Malabon', 'Valenzuela', 'Pasay', 'Manila', 'Other',
];
const PREFERRED_SERVICES = [
  'Electrical Repairs', 'Plumbing Services', 'HVAC & Aircon',
  'Appliance Repair', 'Home Renovation', 'Security Systems', 'Maintenance',
];
const CUSTOMER_TYPES = [
  { value: 'homeowner',        label: 'Homeowner'        },
  { value: 'business',         label: 'Business'         },
  { value: 'property_manager', label: 'Property Manager' },
];

function Field({ label, children }) {
  return (
    <div className="form-group">
      <label style={{ fontSize: 12, fontWeight: 600, marginBottom: 6, display: 'block' }}>{label}</label>
      {children}
    </div>
  );
}

function SectionTitle({ children, isDark }) {
  return (
    <div style={{
      fontSize: 10, fontWeight: 700, color: '#94a3b8', letterSpacing: '0.14em',
      textTransform: 'uppercase', margin: '20px 0 12px',
      paddingBottom: 6, borderBottom: `1px solid ${isDark ? 'rgba(255,255,255,0.07)' : '#f1f5f9'}`,
    }}>
      {children}
    </div>
  );
}

export default function PortalProfile() {
  const { user }   = useAuth();
  const { isDark } = useTheme();
  const qc         = useQueryClient();

  const [form, setForm]       = useState(null);
  const [pwForm, setPwForm]   = useState({ currentPassword: '', newPassword: '', confirm: '' });
  const [pwError, setPwError] = useState('');

  const text = isDark ? '#e8edf5' : '#1b254b';
  const muted = isDark ? '#8a9bb5' : '#707eae';
  const card  = isDark ? 'rgba(255,255,255,0.03)' : '#fff';
  const bord  = isDark ? 'rgba(255,255,255,0.07)' : '#e8edf5';

  // Fetch the customer record linked to this user
  const { data: customer, isLoading } = useQuery({
    queryKey: ['my-profile'],
    queryFn:  () => api.get('/customers/my').then(r => r.data.data),
  });

  useEffect(() => {
    if (customer) {
      setForm({
        name:             customer.name             || '',
        company:          customer.company          || '',
        contactPerson:    customer.contactPerson    || '',
        email:            customer.email            || '',
        phone:            customer.phone            || '',
        mobile:           customer.mobile           || '',
        customerType:     customer.customerType     || 'homeowner',
        serviceArea:      customer.serviceArea      || '',
        preferredService: customer.preferredService || '',
        address: {
          street:  customer.address?.street  || '',
          city:    customer.address?.city    || '',
          state:   customer.address?.state   || '',
          zip:     customer.address?.zip     || '',
          country: customer.address?.country || 'Philippines',
        },
        notes: customer.notes || '',
      });
    }
  }, [customer]);

  const set     = (key, val) => setForm(f => ({ ...f, [key]: val }));
  const setAddr = (key, val) => setForm(f => ({ ...f, address: { ...f.address, [key]: val } }));

  // Update profile
  const updateMutation = useMutation({
    mutationFn: () => api.put(`/customers/${customer._id}`, form),
    onSuccess: () => {
      qc.invalidateQueries(['my-profile']);
      Swal.fire({
        icon: 'success', title: 'Profile Updated',
        toast: true, position: 'bottom-end',
        timer: 2000, timerProgressBar: true, showConfirmButton: false,
      });
    },
    onError: (err) => {
      Swal.fire({
        icon: 'error', title: 'Update Failed',
        text: err.response?.data?.message || 'Please try again.',
        confirmButtonColor: '#6366f1',
      });
    },
  });

  // Change password
  const pwMutation = useMutation({
    mutationFn: () => api.put('/auth/password', {
      currentPassword: pwForm.currentPassword,
      newPassword:     pwForm.newPassword,
    }),
    onSuccess: () => {
      setPwForm({ currentPassword: '', newPassword: '', confirm: '' });
      setPwError('');
      Swal.fire({
        icon: 'success', title: 'Password Changed',
        toast: true, position: 'bottom-end',
        timer: 2000, timerProgressBar: true, showConfirmButton: false,
      });
    },
    onError: (err) => {
      setPwError(err.response?.data?.message || 'Failed to change password.');
    },
  });

  const handlePasswordSubmit = () => {
    if (pwForm.newPassword !== pwForm.confirm) {
      setPwError('New passwords do not match.');
      return;
    }
    if (pwForm.newPassword.length < 6) {
      setPwError('Password must be at least 6 characters.');
      return;
    }
    setPwError('');
    pwMutation.mutate();
  };

  if (isLoading || !form) return (
    <div style={{ textAlign: 'center', padding: 48, color: muted, fontFamily: 'Outfit, sans-serif' }}>
      Loading profile…
    </div>
  );

  const inputStyle = {
    width: '100%', padding: '10px 14px',
    border: `1.5px solid ${isDark ? 'rgba(255,255,255,0.1)' : '#e2e8f0'}`,
    borderRadius: 10, fontSize: 14,
    background: isDark ? 'rgba(255,255,255,0.04)' : '#fff',
    color: text, fontFamily: 'Outfit, sans-serif',
    outline: 'none', transition: 'border-color 0.2s',
  };
  const selectStyle = { ...inputStyle };

  return (
    <div style={{ fontFamily: 'Outfit, sans-serif', maxWidth: 720 }}>

      {/* Header */}
      <div style={{ marginBottom: 28 }}>
        <h1 style={{ margin: 0, fontSize: 24, fontWeight: 800, color: text, fontFamily: 'Syne, sans-serif' }}>My Profile</h1>
        <p style={{ margin: '4px 0 0', fontSize: 14, color: muted }}>Manage your account details and preferences.</p>
      </div>

      {/* Avatar & name */}
      <div style={{
        background: card, border: `1px solid ${bord}`, borderRadius: 16,
        padding: '24px', marginBottom: 20,
        display: 'flex', alignItems: 'center', gap: 20,
      }}>
        <div style={{
          width: 64, height: 64, borderRadius: '50%', flexShrink: 0,
          background: 'linear-gradient(135deg,#6366f1,#a855f7)',
          color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: 24, fontWeight: 800, fontFamily: 'Syne, sans-serif',
        }}>
          {user?.name?.[0]?.toUpperCase() ?? '?'}
        </div>
        <div>
          <p style={{ margin: 0, fontSize: 18, fontWeight: 800, color: text, fontFamily: 'Syne, sans-serif' }}>{user?.name}</p>
          <p style={{ margin: '2px 0 0', fontSize: 13, color: muted }}>{user?.email}</p>
          <div style={{
            display: 'inline-block', marginTop: 6,
            fontSize: 10, fontWeight: 700, letterSpacing: '1.5px',
            textTransform: 'uppercase', color: '#a855f7',
            background: 'rgba(168,85,247,0.1)', border: '1px solid rgba(168,85,247,0.2)',
            borderRadius: 100, padding: '3px 10px',
          }}>
            {customer?.plan && customer.plan !== 'None' ? `${customer.plan} Plan` : 'No Active Plan'}
          </div>
        </div>
      </div>

      {/* Profile Form */}
      <div style={{ background: card, border: `1px solid ${bord}`, borderRadius: 16, padding: 24, marginBottom: 20 }}>
        <SectionTitle isDark={isDark}>Personal Info</SectionTitle>
        <div className="form-row">
          <Field label="Full Name *">
            <input style={inputStyle} value={form.name} onChange={e => set('name', e.target.value)} placeholder="Juan dela Cruz" />
          </Field>
          <Field label="Customer Type">
            <select style={selectStyle} value={form.customerType} onChange={e => set('customerType', e.target.value)}>
              {CUSTOMER_TYPES.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
            </select>
          </Field>
        </div>
        <div className="form-row">
          <Field label="Company / Property">
            <input style={inputStyle} value={form.company} onChange={e => set('company', e.target.value)} placeholder="e.g. Reyes Property Group" />
          </Field>
          <Field label="Contact Person">
            <input style={inputStyle} value={form.contactPerson} onChange={e => set('contactPerson', e.target.value)} placeholder="e.g. Building Admin" />
          </Field>
        </div>

        <SectionTitle isDark={isDark}>Contact</SectionTitle>
        <div className="form-row">
          <Field label="Email">
            <input style={inputStyle} type="email" value={form.email} onChange={e => set('email', e.target.value)} placeholder="juan@email.com" />
          </Field>
          <Field label="Phone">
            <input style={inputStyle} value={form.phone} onChange={e => set('phone', e.target.value)} placeholder="+63 2 8XXX XXXX" />
          </Field>
        </div>
        <Field label="Mobile">
          <input style={inputStyle} value={form.mobile} onChange={e => set('mobile', e.target.value)} placeholder="+63 9XX XXX XXXX" />
        </Field>

        <SectionTitle isDark={isDark}>Address & Service Area</SectionTitle>
        <Field label="Service Area">
          <select style={selectStyle} value={form.serviceArea} onChange={e => set('serviceArea', e.target.value)}>
            <option value="">Select area…</option>
            {SERVICE_AREAS.map(a => <option key={a} value={a}>{a}</option>)}
          </select>
        </Field>
        <Field label="Street">
          <input style={inputStyle} value={form.address.street} onChange={e => setAddr('street', e.target.value)} placeholder="123 Rizal Street" />
        </Field>
        <div className="form-row">
          <Field label="City">
            <input style={inputStyle} value={form.address.city} onChange={e => setAddr('city', e.target.value)} placeholder="Quezon City" />
          </Field>
          <Field label="Province">
            <input style={inputStyle} value={form.address.state} onChange={e => setAddr('state', e.target.value)} placeholder="Metro Manila" />
          </Field>
        </div>
        <div className="form-row">
          <Field label="ZIP">
            <input style={inputStyle} value={form.address.zip} onChange={e => setAddr('zip', e.target.value)} placeholder="1100" />
          </Field>
          <Field label="Country">
            <input style={inputStyle} value={form.address.country} onChange={e => setAddr('country', e.target.value)} />
          </Field>
        </div>

        <SectionTitle isDark={isDark}>Service Preferences</SectionTitle>
        <Field label="Preferred Service">
          <select style={selectStyle} value={form.preferredService} onChange={e => set('preferredService', e.target.value)}>
            <option value="">None</option>
            {PREFERRED_SERVICES.map(s => <option key={s} value={s}>{s}</option>)}
          </select>
        </Field>

        <SectionTitle isDark={isDark}>Notes</SectionTitle>
        <Field label="Additional Notes">
          <textarea
            style={{ ...inputStyle, resize: 'vertical' }}
            rows={3}
            value={form.notes}
            onChange={e => set('notes', e.target.value)}
            placeholder="Any special instructions or remarks…"
          />
        </Field>

        <div style={{ marginTop: 20 }}>
          <button
            className="btn btn-primary"
            onClick={() => updateMutation.mutate()}
            disabled={!form.name || updateMutation.isPending}
          >
            {updateMutation.isPending ? 'Saving…' : 'Save Changes'}
          </button>
        </div>
      </div>

      {/* Change Password */}
      <div style={{ background: card, border: `1px solid ${bord}`, borderRadius: 16, padding: 24 }}>
        <SectionTitle isDark={isDark}>Change Password</SectionTitle>

        {pwError && (
          <div style={{
            background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)',
            color: '#ef4444', borderRadius: 10, padding: '10px 14px',
            fontSize: 13, marginBottom: 16,
          }}>
            {pwError}
          </div>
        )}

        <Field label="Current Password">
          <input
            style={inputStyle} type="password"
            value={pwForm.currentPassword}
            onChange={e => setPwForm(f => ({ ...f, currentPassword: e.target.value }))}
            placeholder="Enter current password"
          />
        </Field>
        <div className="form-row">
          <Field label="New Password">
            <input
              style={inputStyle} type="password"
              value={pwForm.newPassword}
              onChange={e => setPwForm(f => ({ ...f, newPassword: e.target.value }))}
              placeholder="Min. 6 characters"
            />
          </Field>
          <Field label="Confirm New Password">
            <input
              style={inputStyle} type="password"
              value={pwForm.confirm}
              onChange={e => setPwForm(f => ({ ...f, confirm: e.target.value }))}
              placeholder="Repeat new password"
            />
          </Field>
        </div>

        <div style={{ marginTop: 16 }}>
          <button
            className="btn btn-primary"
            onClick={handlePasswordSubmit}
            disabled={!pwForm.currentPassword || !pwForm.newPassword || !pwForm.confirm || pwMutation.isPending}
          >
            {pwMutation.isPending ? 'Updating…' : 'Change Password'}
          </button>
        </div>
      </div>
    </div>
  );
}