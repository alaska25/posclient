import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Swal from 'sweetalert2';
import { getRoleRedirect } from '../utils/auth';

export default function Register() {
  const navigate = useNavigate();
  const { register } = useAuth();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [form, setForm] = useState({
    firstName: '',
    lastName: '',
    email: '',
    company: '',
    password: '',
    confirm: '',
  });

  const set = (field) => (e) =>
    setForm((prev) => ({ ...prev, [field]: e.target.value }));

  const handleNext = (e) => {
    e.preventDefault();
    setError('');
    if (!form.firstName || !form.lastName || !form.email) {
      Swal.fire({
        icon: 'warning',
        title: 'Required Fields',
        text: 'Please fill in your name and email to continue.',
        confirmButtonColor: '#6366f1',
        background: '#0a0a0f',
        color: '#fff',
      });
      return;
    }
    setStep(2);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (form.password !== form.confirm) {
      Swal.fire({
        icon: 'error',
        title: 'Oops...',
        text: 'Passwords do not match!',
        confirmButtonColor: '#6366f1',
        background: '#0a0a0f',
        color: '#fff',
      });
      return;
    }

    if (form.password.length < 8) {
      Swal.fire({
        icon: 'info',
        title: 'Security',
        text: 'Password must be at least 8 characters.',
        confirmButtonColor: '#6366f1',
        background: '#0a0a0f',
        color: '#fff',
      });
      return;
    }

    setLoading(true);
    try {
      const result = await register({
        firstName: form.firstName,
        lastName: form.lastName,
        email: form.email,
        company: form.company,
        password: form.password,
      });

      await Swal.fire({
        icon: 'success',
        title: 'Account Created!',
        text: 'Welcome to FlowPOS! Redirecting to your dashboard...',
        timer: 2000,
        showConfirmButton: false,
        background: '#0a0a0f',
        color: '#fff',
      });

      const user = result?.user ?? result;
      const redirectPath = getRoleRedirect(user);
      navigate(redirectPath, { replace: true });
    } catch (err) {
      const errMsg =
        err.response?.data?.message ||
        err.response?.data?.error ||
        (err.message !== 'next is not a function' ? err.message : null) ||
        'Registration failed. Please try again.';
      setError(errMsg);
      Swal.fire({
        icon: 'error',
        title: 'Registration Failed',
        text: errMsg,
        confirmButtonColor: '#dc2626',
        background: '#0a0a0f',
        color: '#fff',
      });
    } finally {
      setLoading(false);
    }
  };

  const strength = (() => {
    const p = form.password;
    if (!p) return 0;
    let s = 0;
    if (p.length >= 8) s++;
    if (/[A-Z]/.test(p)) s++;
    if (/[0-9]/.test(p)) s++;
    if (/[^A-Za-z0-9]/.test(p)) s++;
    return s;
  })();

  const strengthLabel = ['', 'Weak', 'Fair', 'Good', 'Strong'][strength];
  const strengthColor = ['', '#ef4444', '#f97316', '#eab308', '#22c55e'][strength];

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Syne:wght@400;600;700;800&family=DM+Sans:ital,opsz,wght@0,9..40,300;0,9..40,400;0,9..40,500;1,9..40,400&display=swap');

        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

        .rg-root {
          min-height: 100vh;
          display: grid;
          grid-template-columns: 1fr 1fr;
          font-family: 'DM Sans', sans-serif;
          background: #0a0a0f;
        }

        /* ── LEFT PANEL ── */
        .rg-left {
          position: relative;
          display: flex;
          flex-direction: column;
          justify-content: space-between;
          padding: 56px 64px;
          overflow: hidden;
          background: linear-gradient(135deg, #0d0d1a 0%, #111128 100%);
        }
        .rg-left::before {
          content: '';
          position: absolute;
          inset: 0;
          background:
            radial-gradient(ellipse 80% 60% at 20% 10%, rgba(99,102,241,.18) 0%, transparent 60%),
            radial-gradient(ellipse 60% 50% at 80% 80%, rgba(168,85,247,.14) 0%, transparent 60%);
          pointer-events: none;
        }
        .rg-grid-bg {
          position: absolute;
          inset: 0;
          background-image:
            linear-gradient(rgba(255,255,255,.03) 1px, transparent 1px),
            linear-gradient(90deg, rgba(255,255,255,.03) 1px, transparent 1px);
          background-size: 40px 40px;
          pointer-events: none;
        }
        .rg-brand {
          display: flex;
          align-items: center;
          gap: 10px;
          position: relative;
        }
        .rg-brand-icon {
          width: 36px; height: 36px;
          background: linear-gradient(135deg, #6366f1, #a855f7);
          border-radius: 10px;
          display: flex; align-items: center; justify-content: center;
        }
        .rg-brand-icon svg { width: 20px; height: 20px; }
        .rg-brand-name {
          font-family: 'Syne', sans-serif;
          font-weight: 700;
          font-size: 18px;
          color: #fff;
          letter-spacing: -.3px;
        }
        .rg-hero {
          position: relative;
          flex: 1;
          display: flex;
          flex-direction: column;
          justify-content: center;
          gap: 12px;
          padding: 40px 0 20px;
        }
        .rg-hero-tag {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          padding: 5px 12px;
          background: rgba(99,102,241,.15);
          border: 1px solid rgba(99,102,241,.3);
          border-radius: 20px;
          width: fit-content;
        }
        .rg-hero-tag span {
          font-size: 11px;
          font-weight: 600;
          color: #818cf8;
          letter-spacing: .5px;
          text-transform: uppercase;
          font-family: 'Syne', sans-serif;
        }
        .rg-hero h1 {
          font-family: 'Syne', sans-serif;
          font-size: 42px;
          font-weight: 800;
          color: #fff;
          line-height: 1.1;
          letter-spacing: -1.5px;
        }
        .rg-hero h1 em {
          font-style: normal;
          background: linear-gradient(135deg, #818cf8, #c084fc);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
        }
        .rg-hero p {
          font-size: 15px;
          color: rgba(255,255,255,.5);
          line-height: 1.7;
          max-width: 340px;
        }
        .rg-features {
          position: relative;
          display: flex;
          flex-direction: column;
          gap: 10px;
        }
        .rg-feature {
          display: flex;
          align-items: flex-start;
          gap: 14px;
          padding: 16px 20px;
          background: rgba(255,255,255,.04);
          border: 1px solid rgba(255,255,255,.07);
          border-radius: 14px;
          transition: border-color .2s;
        }
        .rg-feature:hover { border-color: rgba(99,102,241,.3); }
        .rg-feature-icon {
          width: 36px; height: 36px; flex-shrink: 0;
          border-radius: 10px;
          display: flex; align-items: center; justify-content: center;
          font-size: 16px;
        }
        .rg-feature-text strong {
          display: block;
          font-size: 13px;
          font-weight: 600;
          color: rgba(255,255,255,.9);
          margin-bottom: 2px;
          font-family: 'Syne', sans-serif;
        }
        .rg-feature-text span {
          font-size: 12px;
          color: rgba(255,255,255,.4);
          line-height: 1.5;
        }

        /* ── RIGHT PANEL ── */
        .rg-right {
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 48px 64px;
          background: #f8f8fc;
        }
        .rg-card {
          width: 100%;
          max-width: 420px;
          animation: fadeUp .45s cubic-bezier(.22,.61,.36,1) forwards;
        }
        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(20px); }
          to   { opacity: 1; transform: translateY(0); }
        }

        /* Step indicator */
        .rg-steps {
          display: flex;
          align-items: center;
          gap: 8px;
          margin-bottom: 24px;
        }
        .rg-step {
          display: flex;
          align-items: center;
          gap: 6px;
          font-size: 12px;
          font-weight: 600;
          color: #9ca3af;
          font-family: 'Syne', sans-serif;
          text-transform: uppercase;
          letter-spacing: .5px;
        }
        .rg-step.active { color: #6366f1; }
        .rg-step.done   { color: #22c55e; }
        .rg-step-num {
          width: 22px; height: 22px;
          border-radius: 50%;
          display: flex; align-items: center; justify-content: center;
          font-size: 11px;
          font-weight: 700;
          background: #e5e7eb;
          color: #9ca3af;
          transition: all .3s;
        }
        .rg-step.active .rg-step-num { background: #6366f1; color: #fff; }
        .rg-step.done .rg-step-num   { background: #22c55e; color: #fff; }
        .rg-step-divider {
          flex: 1;
          height: 1px;
          background: #e5e7eb;
          max-width: 40px;
        }

        .rg-card-header { margin-bottom: 28px; }
        .rg-card-header h2 {
          font-family: 'Syne', sans-serif;
          font-size: 28px;
          font-weight: 800;
          color: #0f0f1a;
          letter-spacing: -.5px;
          margin-bottom: 6px;
        }
        .rg-card-header p { font-size: 14px; color: #6b7280; }

        /* Form */
        .rg-form { display: flex; flex-direction: column; gap: 16px; }
        .rg-row  { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; }
        .rg-field { display: flex; flex-direction: column; gap: 6px; }
        .rg-label {
          font-size: 12px;
          font-weight: 600;
          color: #374151;
          letter-spacing: .3px;
          font-family: 'Syne', sans-serif;
          text-transform: uppercase;
        }
        .rg-input-wrap {
          position: relative;
          display: flex;
          align-items: center;
        }
        .rg-input {
          width: 100%;
          height: 48px;
          padding: 0 14px;
          background: #fff;
          border: 1.5px solid #e5e7eb;
          border-radius: 10px;
          font-size: 14px;
          color: #111827;
          font-family: 'DM Sans', sans-serif;
          outline: none;
          transition: border-color .2s, box-shadow .2s;
        }
        .rg-input-with-icon { padding-right: 44px; }
        .rg-input:focus {
          border-color: #6366f1;
          box-shadow: 0 0 0 3px rgba(99,102,241,.12);
        }
        .rg-input::placeholder { color: #9ca3af; }

        .rg-eye-btn {
          position: absolute;
          right: 12px;
          background: none;
          border: none;
          cursor: pointer;
          padding: 4px;
          color: #9ca3af;
          display: flex;
          align-items: center;
          justify-content: center;
          border-radius: 6px;
          transition: color .15s, background .15s;
          line-height: 0;
        }
        .rg-eye-btn:hover { color: #6366f1; background: rgba(99,102,241,.08); }
        .rg-eye-btn svg { width: 18px; height: 18px; }

        /* Password strength */
        .rg-strength-bar {
          display: flex;
          gap: 4px;
          margin-top: 6px;
        }
        .rg-strength-seg {
          flex: 1;
          height: 3px;
          border-radius: 99px;
          background: #e5e7eb;
          transition: background .3s;
        }

        .rg-error {
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 10px 14px;
          background: #fef2f2;
          border: 1px solid #fecaca;
          border-radius: 8px;
          font-size: 13px;
          color: #dc2626;
        }

        .rg-btn {
          height: 48px;
          border: none;
          border-radius: 12px;
          font-size: 14px;
          font-weight: 700;
          cursor: pointer;
          transition: all .2s;
          font-family: 'Syne', sans-serif;
          letter-spacing: .3px;
        }
        .rg-btn-primary {
          background: linear-gradient(135deg, #6366f1, #818cf8);
          color: #fff;
          box-shadow: 0 4px 14px rgba(99,102,241,.35);
        }
        .rg-btn-primary:hover:not(:disabled) {
          transform: translateY(-1px);
          box-shadow: 0 6px 20px rgba(99,102,241,.45);
        }
        .rg-btn-primary:disabled { opacity: .6; cursor: not-allowed; }
        .rg-btn-ghost {
          background: transparent;
          color: #6366f1;
          border: 1.5px solid #e5e7eb;
        }
        .rg-btn-ghost:hover { background: #f5f3ff; border-color: #c7d2fe; }

        .rg-btn-spinner {
          display: inline-block;
          width: 16px; height: 16px;
          border: 2px solid rgba(255,255,255,.3);
          border-top-color: #fff;
          border-radius: 50%;
          animation: spin .6s linear infinite;
          margin-right: 8px;
          vertical-align: middle;
        }
        @keyframes spin { to { transform: rotate(360deg); } }

        .rg-divider {
          display: flex;
          align-items: center;
          gap: 12px;
          font-size: 11px;
          font-weight: 600;
          letter-spacing: .6px;
          text-transform: uppercase;
          color: #c4c9d4;
          font-family: 'Syne', sans-serif;
        }
        .rg-divider::before, .rg-divider::after {
          content: '';
          flex: 1;
          height: 1px;
          background: linear-gradient(90deg, transparent, #e5e7eb, transparent);
        }

        .rg-login-cta {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 14px 18px;
          border-radius: 12px;
          border: 1.5px solid #e5e7eb;
          background: #fff;
          text-decoration: none;
          transition: all .2s;
        }
        .rg-login-cta:hover { border-color: #c7d2fe; background: #f5f3ff; }
        .rg-login-cta-text strong {
          display: block;
          font-family: 'Syne', sans-serif;
          font-size: 13px;
          font-weight: 700;
          color: #111827;
        }
        .rg-login-cta-text span { font-size: 11px; color: #9ca3af; }
        .rg-login-arrow { font-size: 18px; color: #6366f1; }

        /* Slide animation */
        .rg-slide-in {
          animation: slideIn .35s cubic-bezier(.22,.61,.36,1) forwards;
        }
        @keyframes slideIn {
          from { opacity: 0; transform: translateX(24px); }
          to   { opacity: 1; transform: translateX(0); }
        }

        /* Responsive */
        @media (max-width: 768px) {
          .rg-root { grid-template-columns: 1fr; }
          .rg-left { display: none; }
          .rg-right { padding: 32px 24px; background: #0a0a0f; }
          .rg-card-header h2 { color: #fff; }
          .rg-card-header p { color: rgba(255,255,255,.5); }
          .rg-label { color: rgba(255,255,255,.7); }
          .rg-input { background: rgba(255,255,255,.06); border-color: rgba(255,255,255,.1); color: #fff; }
          .rg-input::placeholder { color: rgba(255,255,255,.3); }
          .rg-btn-ghost { background: rgba(255,255,255,.07); border-color: rgba(255,255,255,.12); color: rgba(255,255,255,.85); }
          .rg-login-cta { background: rgba(255,255,255,.05); border-color: rgba(255,255,255,.1); }
          .rg-login-cta-text strong { color: #fff; }
          .rg-divider { color: rgba(255,255,255,.3); }
          .rg-divider::before, .rg-divider::after { background: rgba(255,255,255,.1); }
          .rg-eye-btn { color: rgba(255,255,255,.4); }
          .rg-step { color: rgba(255,255,255,.3); }
          .rg-step.active { color: #818cf8; }
          .rg-step-num { background: rgba(255,255,255,.1); color: rgba(255,255,255,.4); }
          .rg-step-divider { background: rgba(255,255,255,.1); }
        }
      `}</style>

      <div className="rg-root">
        {/* ── LEFT ── */}
        <div className="rg-left">
          <div className="rg-grid-bg" />

          <div className="rg-brand">
            <div className="rg-brand-icon">
              <svg viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" />
              </svg>
            </div>
            <span className="rg-brand-name">FlowPOS</span>
          </div>

          <div className="rg-hero">
            <div className="rg-hero-tag">
              <svg width="10" height="10" viewBox="0 0 10 10" fill="#818cf8"><circle cx="5" cy="5" r="5"/></svg>
              <span>Now in Beta</span>
            </div>
            <h1>Manage your<br />business <em>smarter.</em></h1>
            <p>From customers to invoices — everything you need to run your service business in one place.</p>
          </div>

          <div className="rg-features">
            {[
              { icon: '📋', bg: 'rgba(99,102,241,.15)',  title: 'Jobs & Scheduling', desc: 'Create, assign and track field jobs in real time' },
              { icon: '💳', bg: 'rgba(168,85,247,.15)',  title: 'Instant Invoicing',  desc: 'Generate and send invoices the moment a job is done' },
              { icon: '📊', bg: 'rgba(34,197,94,.12)',   title: 'Live Reports',        desc: 'Revenue and performance dashboards at a glance' },
            ].map((f) => (
              <div className="rg-feature" key={f.title}>
                <div className="rg-feature-icon" style={{ background: f.bg }}>{f.icon}</div>
                <div className="rg-feature-text">
                  <strong>{f.title}</strong>
                  <span>{f.desc}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* ── RIGHT ── */}
        <div className="rg-right">
          <div className="rg-card">
            <div className="rg-card-header">
              {/* Step indicator */}
              <div className="rg-steps">
                <div className={`rg-step ${step >= 1 ? (step > 1 ? 'done' : 'active') : ''}`}>
                  <div className="rg-step-num">{step > 1 ? '✓' : '1'}</div>
                  Your info
                </div>
                <div className="rg-step-divider" />
                <div className={`rg-step ${step >= 2 ? 'active' : ''}`}>
                  <div className="rg-step-num">2</div>
                  Password
                </div>
              </div>

              <h2>{step === 1 ? 'Create your account' : 'Secure your account'}</h2>
              <p>{step === 1 ? 'Start your free trial — no credit card required.' : 'Choose a strong password to protect your account.'}</p>
            </div>

            {/* ── STEP 1 ── */}
            {step === 1 && (
              <form className="rg-form rg-slide-in" onSubmit={handleNext}>
                <div className="rg-row">
                  <div className="rg-field">
                    <label className="rg-label">First name</label>
                    <input
                      className="rg-input"
                      placeholder="John"
                      value={form.firstName}
                      onChange={set('firstName')}
                      autoFocus
                    />
                  </div>
                  <div className="rg-field">
                    <label className="rg-label">Last name</label>
                    <input
                      className="rg-input"
                      placeholder="Smith"
                      value={form.lastName}
                      onChange={set('lastName')}
                    />
                  </div>
                </div>

                <div className="rg-field">
                  <label className="rg-label">Work email</label>
                  <input
                    className="rg-input"
                    type="email"
                    placeholder="john@company.com"
                    value={form.email}
                    onChange={set('email')}
                  />
                </div>

                <div className="rg-field">
                  <label className="rg-label">
                    Company{' '}
                    <span style={{ fontWeight: 400, textTransform: 'none', color: '#9ca3af' }}>(required)</span>
                  </label>
                  <input
                    className="rg-input"
                    placeholder="Acme Services LLC"
                    value={form.company}
                    onChange={set('company')}
                  />
                </div>

                {error && (
                  <div className="rg-error">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>
                    </svg>
                    {error}
                  </div>
                )}

                <button type="submit" className="rg-btn rg-btn-primary">
                  Continue →
                </button>

                <div className="rg-divider">or</div>

                <Link to="/login" className="rg-login-cta">
                  <div className="rg-login-cta-text">
                    <strong>Already have an account?</strong>
                    <span>Sign in to FlowPOS</span>
                  </div>
                  <span className="rg-login-arrow">→</span>
                </Link>
              </form>
            )}

            {/* ── STEP 2 ── */}
            {step === 2 && (
              <form className="rg-form rg-slide-in" onSubmit={handleSubmit}>
                <div className="rg-field">
                  <label className="rg-label">Password</label>
                  <div className="rg-input-wrap">
                    <input
                      className="rg-input rg-input-with-icon"
                      type={showPassword ? 'text' : 'password'}
                      placeholder="Min. 8 characters"
                      value={form.password}
                      onChange={set('password')}
                      autoFocus
                    />
                    <button
                      type="button"
                      className="rg-eye-btn"
                      onClick={() => setShowPassword((v) => !v)}
                      aria-label={showPassword ? 'Hide password' : 'Show password'}
                      tabIndex={-1}
                    >
                      {showPassword ? (
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94"/>
                          <path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19"/>
                          <line x1="1" y1="1" x2="23" y2="23"/>
                        </svg>
                      ) : (
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
                          <circle cx="12" cy="12" r="3"/>
                        </svg>
                      )}
                    </button>
                  </div>
                  {form.password && (
                    <>
                      <div className="rg-strength-bar">
                        {[1, 2, 3, 4].map((i) => (
                          <div
                            key={i}
                            className="rg-strength-seg"
                            style={{ background: i <= strength ? strengthColor : '#e5e7eb' }}
                          />
                        ))}
                      </div>
                      <span style={{ fontSize: 11, color: strengthColor, fontWeight: 600, marginTop: 2 }}>
                        {strengthLabel}
                      </span>
                    </>
                  )}
                </div>

                <div className="rg-field">
                  <label className="rg-label">Confirm password</label>
                  <div className="rg-input-wrap">
                    <input
                      className="rg-input rg-input-with-icon"
                      type={showConfirm ? 'text' : 'password'}
                      placeholder="Re-enter your password"
                      value={form.confirm}
                      onChange={set('confirm')}
                    />
                    <button
                      type="button"
                      className="rg-eye-btn"
                      onClick={() => setShowConfirm((v) => !v)}
                      aria-label={showConfirm ? 'Hide password' : 'Show password'}
                      tabIndex={-1}
                    >
                      {showConfirm ? (
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94"/>
                          <path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19"/>
                          <line x1="1" y1="1" x2="23" y2="23"/>
                        </svg>
                      ) : (
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
                          <circle cx="12" cy="12" r="3"/>
                        </svg>
                      )}
                    </button>
                  </div>
                </div>

                {error && (
                  <div className="rg-error">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>
                    </svg>
                    {error}
                  </div>
                )}

                <button type="submit" className="rg-btn rg-btn-primary" disabled={loading}>
                  {loading && <span className="rg-btn-spinner" />}
                  {loading ? 'Creating account…' : 'Create account'}
                </button>

                <button
                  type="button"
                  className="rg-btn rg-btn-ghost"
                  onClick={() => { setStep(1); setError(''); }}
                >
                  ← Back
                </button>

                <p style={{ fontSize: 11, color: '#9ca3af', textAlign: 'center', lineHeight: 1.6 }}>
                  By creating an account you agree to our{' '}
                  <a href="#" style={{ color: '#6366f1' }}>Terms of Service</a> and{' '}
                  <a href="#" style={{ color: '#6366f1' }}>Privacy Policy</a>.
                </p>
              </form>
            )}
          </div>
        </div>
      </div>
    </>
  );
}