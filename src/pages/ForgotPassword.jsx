import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import Swal from 'sweetalert2';

export default function ForgotPassword() {
  const { t } = useTranslation();
  const [email, setEmail]     = useState('');
  const [loading, setLoading] = useState(false);
  const navigate              = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await fetch('http://localhost:5000/api/auth/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });

      const data = await response.json();

      if (data.success) {
        Swal.fire({
          icon:               'success',
          title:              t('recovery_sent_title'),
          text:               t('recovery_sent_text'),
          background:         '#111827',
          color:              '#ffffff',
          confirmButtonColor: '#6366f1',
          customClass: { popup: 'rounded-2xl border border-gray-800' },
        }).then(() => navigate('/login'));
      } else {
        Swal.fire({
          icon:               'error',
          title:              'Oops...',
          text:               data.message || t('email_not_found'),
          background:         '#111827',
          color:              '#ffffff',
          confirmButtonColor: '#ef4444',
        });
      }
    } catch (err) {
      Swal.fire({
        icon:       'error',
        title:      t('connection_failed'),
        background: '#111827',
        color:      '#fff',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="lg-root">

      {/* LEFT PANEL */}
      <div className="lg-left">
        <div className="lg-grid-bg"></div>
        <div className="lg-brand">
          <div className="lg-brand-icon">
            <svg viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" />
            </svg>
          </div>
          <span className="lg-brand-name">FlowPOS</span>
        </div>
        <div className="lg-quote-container">
          <p className="lg-quote-text">{t('brand_quote')}</p>
          <p className="lg-quote-sub">{t('brand_quote_sub')}</p>
        </div>
        <div className="lg-footer-stats">
          <div className="stat-item"><span>99.9%</span> {t('uptime')}</div>
          <div className="stat-item"><span>SSL</span> {t('secured')}</div>
        </div>
      </div>

      {/* RIGHT PANEL */}
      <div className="lg-right">
        <div className="lg-card">
          <div className="lg-card-header">
            <h2 className="lg-title">{t('forgot_title')}</h2>
            <p className="lg-subtitle">{t('forgot_subtitle')}</p>
          </div>

          <form onSubmit={handleSubmit} className="lg-form">
            <div className="lg-field">
              <label className="lg-label">{t('work_email')}</label>
              <input
                type="email"
                className="lg-input"
                placeholder="name@company.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>

            <button type="submit" className="lg-btn" disabled={loading}>
              {loading ? <span className="spinner"></span> : t('send_recovery_link')}
            </button>

            <div className="lg-form-footer">
              <Link to="/login" className="lg-back-link">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M19 12H5M12 19l-7-7 7-7"/>
                </svg>
                {t('back_to_login')}
              </Link>
            </div>
          </form>
        </div>
      </div>

      <style jsx>{`
        .lg-root { display: flex; min-height: 100vh; background: #030712; font-family: 'Inter', sans-serif; color: #fff; }
        .lg-left { flex: 1; position: relative; display: flex; flex-direction: column; justify-content: space-between; padding: 60px; background: radial-gradient(circle at top left, #1e1b4b, #030712); overflow: hidden; }
        .lg-grid-bg { position: absolute; inset: 0; opacity: 0.1; background-image: linear-gradient(#4f46e5 1px, transparent 1px), linear-gradient(90deg, #4f46e5 1px, transparent 1px); background-size: 40px 40px; }
        .lg-brand { display: flex; align-items: center; gap: 10px; position: relative; }
        .lg-brand-icon { width: 36px; height: 36px; background: linear-gradient(135deg, #6366f1, #a855f7); border-radius: 10px; display: flex; align-items: center; justify-content: center; }
        .lg-brand-name { font-size: 1.5rem; font-weight: 800; letter-spacing: -0.5px; }
        .lg-brand-icon svg { width: 20px; height: 20px; }
        .lg-quote-container { z-index: 10; max-width: 400px; }
        .lg-quote-text { font-size: 2.25rem; font-weight: 700; line-height: 1.2; margin-bottom: 16px; }
        .lg-quote-sub { color: #9ca3af; line-height: 1.6; }
        .lg-right { flex: 1; display: flex; align-items: center; justify-content: center; padding: 40px; background: #030712; }
        .lg-card { width: 100%; max-width: 440px; }
        .lg-title { font-size: 1.875rem; font-weight: 700; margin-bottom: 8px; }
        .lg-subtitle { color: #9ca3af; font-size: 0.95rem; line-height: 1.5; margin-bottom: 32px; }
        .lg-field { margin-bottom: 24px; }
        .lg-label { display: block; font-size: 0.875rem; font-weight: 500; color: #d1d5db; margin-bottom: 8px; }
        .lg-input { width: 100%; padding: 12px 16px; background: #111827; border: 1px solid #374151; border-radius: 10px; color: #fff; transition: all 0.2s; }
        .lg-input:focus { outline: none; border-color: #6366f1; box-shadow: 0 0 0 4px rgba(99, 102, 241, 0.1); }
        .lg-btn { width: 100%; padding: 12px; background: #6366f1; color: white; border: none; border-radius: 10px; font-weight: 600; cursor: pointer; transition: transform 0.1s, background 0.2s; }
        .lg-btn:hover { background: #4f46e5; }
        .lg-btn:active { transform: scale(0.98); }
        .lg-btn:disabled { opacity: 0.7; cursor: not-allowed; }
        .lg-form-footer { margin-top: 24px; display: flex; justify-content: center; }
        .lg-back-link { display: flex; align-items: center; gap: 8px; color: #9ca3af; text-decoration: none; font-size: 0.875rem; transition: color 0.2s; }
        .lg-back-link:hover { color: #6366f1; }
        .spinner { display: inline-block; width: 20px; height: 20px; border: 3px solid rgba(255,255,255,0.3); border-radius: 50%; border-top-color: #fff; animation: spin 1s ease-in-out infinite; }
        @keyframes spin { to { transform: rotate(360deg); } }
        @media (max-width: 1024px) { .lg-left { display: none; } }
      `}</style>
    </div>
  );
}