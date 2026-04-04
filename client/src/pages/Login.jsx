

import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { useAuth } from '../context/AuthContext';

export default function Login({ role }) {
  const [form, setForm] = useState({ email: '', password: '' });
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.email || !form.password) return toast.error('Fill all fields');

    setLoading(true);
    try {
      const user = await login(form.email, form.password);

      if (role === 'admin' && user.role !== 'admin') {
        toast.error('Only admin can login here'); return;
      }
      if (role === 'student' && user.role === 'admin') {
        toast.error('Please use admin login'); return;
      }

      toast.success(`Welcome back, ${user.name}!`);
      navigate(user.role === 'admin' ? '/admin' : '/dashboard');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-card">
        <div className="auth-logo">
          <div className="auth-icon">{role === 'admin' ? 'V' : 'V'}</div>
          <h1 className="auth-title">{role === 'admin' ? 'Admin Login' : 'Welcome back'}</h1>
          <p className="auth-sub">{role === 'admin' ? 'Only Admin Can Login' : 'Sign in to College Voting System'}</p>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label">{role === 'admin' ? 'Admin Email' : 'Email address'}</label>
            <input
              className="form-input" type="email"
              placeholder={role === 'admin' ? 'admin@college.edu' : 'you@college.edu'}
              value={form.email}
              onChange={e => setForm({ ...form, email: e.target.value })}
            />
          </div>
          <div className="form-group">
            <label className="form-label">Password</label>
            <input
              className="form-input" type="password" placeholder="••••••••"
              value={form.password}
              onChange={e => setForm({ ...form, password: e.target.value })}
            />
          </div>
          <button type="submit" className="btn btn-primary btn-lg" style={{ width: '100%' }} disabled={loading}>
            {loading ? 'Signing in...' : role === 'admin' ? 'Admin Sign in →' : 'Sign in →'}
          </button>
        </form>

        {role === 'student' && (
          <>
            <div style={{ textAlign: 'center', marginTop: 10 }}>
              <Link to="/forgot-password" style={{ fontSize: 14, color: 'var(--accent)' }}>Forgot password?</Link>
            </div>
            <div className="divider" />
            <div className="auth-footer">No account? <Link to="/register">Register here</Link></div>
          </>
        )}
      </div>
    </div>
  );
}
