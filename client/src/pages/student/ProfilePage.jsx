import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { toast } from 'react-toastify';
import { useAuth } from '../../context/AuthContext';

export default function ProfilePage() {
  const { user, changePassword } = useAuth();
  const [form, setForm] = useState({ currentPassword: '', newPassword: '', confirmPassword: '' });
  const [loading, setLoading] = useState(false);
  const set = k => e => setForm({ ...form, [k]: e.target.value });

  const initials = user?.name?.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.currentPassword) return toast.error('Enter your current password');
    if (form.newPassword.length < 6)       return toast.error('New password must be at least 6 characters');
    if (!/[A-Z]/.test(form.newPassword))    return toast.error('Must contain an uppercase letter');
  
    if (form.newPassword !== form.confirmPassword) return toast.error('Passwords do not match');
    setLoading(true);
    try {
      await changePassword({ currentPassword: form.currentPassword, newPassword: form.newPassword });
      toast.success('Password changed successfully!');
      setForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to change password');
    } finally { setLoading(false); }
  };

  return (
    <div className="page-wrap" style={{ maxWidth: 600 }}>
      <div className="page-header">
        <h1 className="page-title">My profile</h1>
      </div>

      {/* Info card */}
      <div className="card" style={{ marginBottom: 20 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 16, flexWrap: 'wrap', marginBottom: 20 }}>
          <div style={{ width: 56, height: 56, borderRadius: '50%', background: 'var(--accent)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontSize: 20, fontWeight: 700, flexShrink: 0 }}>
            {initials}
          </div>
          <div>
            <h2 style={{ fontSize: 18 }}>{user?.name}</h2>
            <p style={{ color: 'var(--text2)', fontSize: 13, marginTop: 2 }}>{user?.email}</p>
          </div>
          <span className="badge badge-live" style={{ marginLeft: 'auto' }}>Active</span>
        </div>

        <div className="divider" style={{ margin: '0 0 16px' }} />

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
          {[
            { label: 'Enrollment number', value: user?.enrollmentNumber },
            { label: 'Mobile',            value: user?.mobile },
            { label: 'Role',              value: 'Student' },
            { label: 'Account status',    value: 'Active' },
          ].map(({ label, value }) => (
            <div key={label}>
              <div style={{ fontSize: 11, color: 'var(--text3)', textTransform: 'uppercase', letterSpacing: '.06em', fontWeight: 600, marginBottom: 3 }}>
                {label}
              </div>
              <div style={{ fontWeight: 500 }}>{value || '—'}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Change password */}
      <div className="card">
        <h3 style={{ fontSize: 16, marginBottom: 18 }}>🔒 Change password</h3>
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label">Current password</label>
            <input className="form-input" type="password" placeholder="Enter current password"
              value={form.currentPassword} onChange={set('currentPassword')} />
          </div>
          <div className="form-group">
            <label className="form-label">New password</label>
            <input className="form-input" type="password" placeholder="Min. 6 chars, 1 uppercase"
              value={form.newPassword} onChange={set('newPassword')} />
          </div>
          <div className="form-group">
            <label className="form-label">Confirm new password</label>
            <input className="form-input" type="password" placeholder="Re-enter new password"
              value={form.confirmPassword} onChange={set('confirmPassword')} />
          </div>
          <button type="submit" className="btn btn-primary" disabled={loading}>
            {loading ? 'Updating...' : '🔒 Update password'}
          </button>
        </form>

        <div className="hint-box" style={{ marginTop: 16 }}>
          To reset your password if you've forgotten it, use the{' '}
          <Link to="/forgot-password">forgot password</Link> flow with your registered mobile number (OTP via MSG91 SMS).
        </div>
      </div>
    </div>
  );
}
