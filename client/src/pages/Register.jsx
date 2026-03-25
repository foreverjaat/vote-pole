import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { useAuth } from '../context/AuthContext';

export default function Register() {
  const [form, setForm] = useState({ name: '', email: '', password: '', confirmPassword: '', mobile: '', enrollmentNumber: '' });
  const [loading, setLoading] = useState(false);
  const { register } = useAuth();
  const navigate = useNavigate();
  const set = (k) => (e) => setForm({ ...form, [k]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    const { name, email, password, confirmPassword, mobile, enrollmentNumber } = form;
    if (!name || !email || !password || !mobile || !enrollmentNumber) return toast.error('Fill all required fields');
    if (!/^\d{10}$/.test(mobile))  return toast.error('Mobile must be 10 digits');
    if (password.length < 6)        return toast.error('Password must be at least 6 characters');
    if (!/[A-Z]/.test(password))    return toast.error('Password must contain an uppercase letter');
    if (password !== confirmPassword) return toast.error('Passwords do not match');
    setLoading(true);
    try {
      const { confirmPassword: _, ...payload } = form;
      const user = await register(payload);
      toast.success(`Account created! Welcome, ${user.name}!`);
      navigate('/dashboard');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Registration failed');
    } finally { setLoading(false); }
  };

  return (
    <div className="auth-page" style={{ alignItems: 'flex-start', paddingTop: 32 }}>
      <div className="auth-card" style={{ maxWidth: 500 }}>
        <div className="auth-logo">
          <div className="auth-icon">V</div>
          <h1 className="auth-title">Create account</h1>
          <p className="auth-sub">Register to participate in college elections</p>
        </div>
        <form onSubmit={handleSubmit}>
          <div className="grid-form-2">
            <div className="form-group" style={{ gridColumn: '1/-1' }}>
              <label className="form-label">Full name *</label>
              <input className="form-input" placeholder="Arjun Mehta" value={form.name} onChange={set('name')} />
            </div>
            <div className="form-group">
              <label className="form-label">Enrollment number *</label>
              <input className="form-input" placeholder="CS2024001" value={form.enrollmentNumber} onChange={set('enrollmentNumber')} />
            </div>
            <div className="form-group">
              <label className="form-label">Mobile (10 digits) *</label>
              <input className="form-input" placeholder="9876543210" maxLength={10} value={form.mobile} onChange={set('mobile')} />
            </div>
            <div className="form-group" style={{ gridColumn: '1/-1' }}>
              <label className="form-label">Email address *</label>
              <input className="form-input" type="email" placeholder="you@college.edu" value={form.email} onChange={set('email')} />
            </div>
            <div className="form-group">
              <label className="form-label">Password *</label>
              <input className="form-input" type="password" placeholder="Min. 6 chars, 1 uppercase" value={form.password} onChange={set('password')} />
            </div>
            <div className="form-group">
              <label className="form-label">Confirm password *</label>
              <input className="form-input" type="password" placeholder="Re-enter password" value={form.confirmPassword} onChange={set('confirmPassword')} />
            </div>
          </div>
          
          <button type="submit" className="btn btn-primary btn-lg" style={{ width: '100%' }} disabled={loading}>
            {loading ? 'Creating account...' : 'Create account →'}
          </button>
        </form>
        <div className="auth-footer">Already have an account? <Link to="/login">Sign in</Link></div>
      </div>
    </div>
  );
}
