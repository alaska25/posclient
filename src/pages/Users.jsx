import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { adminApi } from '../utils/api';
import { 
  UserCheck, Mail, Calendar, MoreVertical, 
  Search, UserPlus, Filter, Shield, Trash2 
} from 'lucide-react';

export default function Users() {
  const { t } = useTranslation();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch Users from Backend
  const fetchUsers = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await adminApi.getUsers(); // Assumes this endpoint exists in your adminApi
      setUsers(res.data.data || res.data);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to fetch users');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  // Shared Styles (Consistent with your Dashboard)
  const root = {
    padding: '32px',
    fontFamily: 'DM Sans, sans-serif',
    minHeight: '100vh',
    background: '#0a0a0a', // Deep dark background
    color: '#fff'
  };

  const tableHeaderStyle = {
    fontSize: 11,
    color: 'rgba(255,255,255,.4)',
    textTransform: 'uppercase',
    letterSpacing: '1px',
    padding: '16px 24px',
    textAlign: 'left',
    fontWeight: 700,
    borderBottom: '1px solid rgba(255,255,255,.07)'
  };

  if (loading) return (
    <div style={{ ...root, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ width: 36, height: 36, border: '3px solid rgba(99,102,241,.3)', borderTopColor: '#6366f1', borderRadius: '50%', animation: 'spin 1s linear infinite' }} />
      <style>{`@keyframes spin { to { transform: rotate(360deg) } }`}</style>
    </div>
  );

  return (
    <div style={root}>
      <style>{`
        @import url('https://googleapis.com');
      `}</style>

      {/* Header Section */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: 32 }}>
        <div>
          <h1 style={{ fontSize: 28, fontWeight: 800, fontFamily: 'Syne, sans-serif', margin: 0 }}>
            {t('users', 'User Directory')}
          </h1>
          <p style={{ color: 'rgba(255,255,255,.35)', fontSize: 13, marginTop: 4 }}>
            {t('manage_users_subtitle', 'Monitor and manage account permissions and activity.')}
          </p>
        </div>
        
        <div style={{ display: 'flex', gap: 10 }}>
          <button style={actionButtonStyle}><Search size={16} /></button>
          <button style={{ ...actionButtonStyle, background: '#6366f1', color: '#fff', border: 'none' }}>
            <UserPlus size={16} /> {t('add_user', 'Add User')}
          </button>
        </div>
      </div>

      {error && (
        <div style={{ padding: '16px', background: 'rgba(220,38,38,.1)', border: '1px solid rgba(220,38,38,.2)', borderRadius: 12, color: '#f87171', marginBottom: 20 }}>
          {error}
        </div>
      )}

      {/* Users Table */}
      <div style={{ 
        background: 'rgba(255,255,255,0.02)', 
        border: '1px solid rgba(255,255,255,0.06)', 
        borderRadius: 16,
        overflow: 'hidden' 
      }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr>
              <th style={tableHeaderStyle}>{t('user', 'User')}</th>
              <th style={tableHeaderStyle}>{t('role', 'Role')}</th>
              <th style={tableHeaderStyle}>{t('status', 'Status')}</th>
              <th style={tableHeaderStyle}>{t('joined', 'Joined')}</th>
              <th style={{ ...tableHeaderStyle, textAlign: 'right' }}>{t('actions', 'Actions')}</th>
            </tr>
          </thead>
          <tbody>
            {users.map((u) => (
              <tr key={u._id} style={rowStyle} onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.03)'} onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
                <td style={{ padding: '16px 24px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                    <div style={{ width: 36, height: 36, borderRadius: 10, background: 'linear-gradient(135deg,#6366f1,#a855f7)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: 14 }}>
                      {u.name?.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <div style={{ fontWeight: 600, fontSize: 14 }}>{u.name}</div>
                      <div style={{ fontSize: 12, color: 'rgba(255,255,255,.3)' }}>{u.email}</div>
                    </div>
                  </div>
                </td>
                <td style={{ padding: '16px 24px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 13, color: 'rgba(255,255,255,.6)' }}>
                    <Shield size={14} /> {u.role || 'User'}
                  </div>
                </td>
                <td style={{ padding: '16px 24px' }}>
                  <span style={{ 
                    padding: '4px 10px', borderRadius: 8, fontSize: 11, fontWeight: 700,
                    background: u.isActive ? 'rgba(16,185,129,.1)' : 'rgba(255,255,255,.05)',
                    color: u.isActive ? '#10b981' : 'rgba(255,255,255,.4)'
                  }}>
                    {u.isActive ? t('active', 'ACTIVE') : t('inactive', 'INACTIVE')}
                  </span>
                </td>
                <td style={{ padding: '16px 24px', fontSize: 13, color: 'rgba(255,255,255,.4)' }}>
                  {new Date(u.createdAt).toLocaleDateString()}
                </td>
                <td style={{ padding: '16px 24px', textAlign: 'right' }}>
                   <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8 }}>
                      <button style={iconBtnStyle}><Trash2 size={14} /></button>
                      <button style={iconBtnStyle}><MoreVertical size={14} /></button>
                   </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// Sub-styles for buttons and rows
const actionButtonStyle = {
  padding: '10px 16px',
  borderRadius: 10,
  background: 'rgba(255,255,255,.05)',
  border: '1px solid rgba(255,255,255,.1)',
  color: 'rgba(255,255,255,.7)',
  fontSize: 13,
  fontWeight: 600,
  cursor: 'pointer',
  display: 'flex',
  alignItems: 'center',
  gap: 8,
  transition: 'all .2s'
};

const rowStyle = {
  borderBottom: '1px solid rgba(255,255,255,0.04)',
  transition: 'background 0.2s ease',
  cursor: 'pointer'
};

const iconBtnStyle = {
  background: 'none',
  border: 'none',
  color: 'rgba(255,255,255,.3)',
  cursor: 'pointer',
  padding: '4px'
};