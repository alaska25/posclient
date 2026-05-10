import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { getRoleRedirect } from '../utils/auth';

export default function Unauthorized() {
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  const handleGoBack = () => {
    if (user) {
      navigate(getRoleRedirect(user));
    } else {
      navigate('/login');
    }
  };

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: '#f4f5f7',
      fontFamily: "'DM Sans', sans-serif",
      padding: 24,
    }}>
      <div style={{
        background: '#fff',
        borderRadius: 24,
        padding: '56px 48px',
        textAlign: 'center',
        maxWidth: 440,
        width: '100%',
        boxShadow: '0 4px 32px rgba(0,0,0,0.08)',
        border: '1px solid #e8ecf8',
      }}>
        <div style={{
          width: 72, height: 72, borderRadius: 20,
          background: 'rgba(239,68,68,0.1)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          margin: '0 auto 24px',
          fontSize: 32,
        }}>🔒</div>

        <h1 style={{
          fontFamily: "'Syne', sans-serif",
          fontSize: 28, fontWeight: 800,
          color: '#1e1b4b', margin: '0 0 10px',
          letterSpacing: '-0.5px',
        }}>Access Denied</h1>

        <p style={{
          fontSize: 15, color: '#64748b',
          lineHeight: 1.6, margin: '0 0 32px',
        }}>
          You don't have permission to view this page.
          {user && ` You're signed in as a ${user.role}.`}
        </p>

        <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap' }}>
          <button
            onClick={handleGoBack}
            style={{
              padding: '12px 28px', borderRadius: 12, border: 'none',
              background: 'linear-gradient(135deg,#6366f1,#a855f7)',
              color: '#fff', fontSize: 14, fontWeight: 700,
              fontFamily: "'Syne', sans-serif", cursor: 'pointer',
              boxShadow: '0 4px 14px rgba(99,102,241,0.35)',
            }}
          >
            Go to My Dashboard
          </button>

          <button
            onClick={logout}
            style={{
              padding: '12px 28px', borderRadius: 12,
              border: '1.5px solid #e5e7eb', background: '#fff',
              color: '#64748b', fontSize: 14, fontWeight: 600,
              fontFamily: "'DM Sans', sans-serif", cursor: 'pointer',
            }}
          >
            Sign Out
          </button>
        </div>
      </div>

      <link href="https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600&family=Syne:wght@700;800&display=swap" rel="stylesheet" />
    </div>
  );
}