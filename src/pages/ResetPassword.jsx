import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Swal from 'sweetalert2';

export default function ResetPassword() {
  const { resetToken } = useParams();
  const navigate = useNavigate();
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (password !== confirmPassword) return Swal.fire('Error', 'Passwords match!', 'error');

    try {
      const res = await fetch(`http://localhost:5000/api/auth/reset-password/${resetToken}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password }),
      });
      const data = await res.json();
      if (data.success) {
        await Swal.fire('Success', 'Password updated! Please login.', 'success');
        navigate('/login');
      } else {
        Swal.fire('Error', data.message, 'error');
      }
    } catch (err) {
      Swal.fire('Error', 'Server connection failed', 'error');
    }
  };

  return (
    <div className="lg-right">
      <div className="lg-card">
        <h2>New Password</h2>
        <form onSubmit={handleSubmit} className="lg-form">
          <input type="password" placeholder="New Password" onChange={e => setPassword(e.target.value)} className="lg-input" required />
          <input type="password" placeholder="Confirm Password" onChange={e => setConfirmPassword(e.target.value)} className="lg-input" required />
          <button type="submit" className="lg-btn">Update Password</button>
        </form>
      </div>
    </div>
  );
}
