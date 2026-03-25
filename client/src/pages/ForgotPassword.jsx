import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { useAuth } from '../context/AuthContext';

export default function ForgotPassword() {
  const [step, setStep]           = useState(1);
  const [mobile, setMobile]       = useState('');
  const [otp, setOtp]             = useState('');
  const [newPassword, setNew]     = useState('');
  const [confirmPw, setConfirm]   = useState('');
  const [loading, setLoading]     = useState(false);
  const { forgotPassword, resetPassword } = useAuth();
  const navigate = useNavigate();

  const handleSend = async (e) => {
    e.preventDefault();
    if (!/^\d{10}$/.test(mobile)) return toast.error('Enter a valid 10-digit mobile number');
    setLoading(true);
    try {
      await forgotPassword(mobile);
      toast.success('OTP sent to your mobile via MSG91 SMS!');
      setStep(2);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to send OTP');
    } finally { setLoading(false); }
  };

  const handleReset = async (e) => {
    e.preventDefault();
    if (!otp || otp.length !== 6)    return toast.error('Enter the 6-digit OTP');
    if (newPassword.length < 6)       return toast.error('Password must be at least 6characters');
    if (!/[A-Z]/.test(newPassword))   return toast.error('Password must contain an uppercase letter');
    
    if (newPassword !== confirmPw)     return toast.error('Passwords do not match');
    setLoading(true);
    try {
      await resetPassword({ mobile, otp, newPassword });
      toast.success('Password reset! Please log in with your new password.');
      navigate('/login');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Reset failed. Check your OTP.');
    } finally { setLoading(false); }
  };

  return (
    <div className="auth-page">
      <div className="auth-card">
        <div className="auth-logo">
          <div className="auth-icon" style={{ fontSize: 22 }}>🔑</div>
          <h1 className="auth-title">{step === 1 ? 'Forgot password' : 'Reset password'}</h1>
          <p className="auth-sub">
            {step === 1 ? 'Enter your registered mobile number' : `OTP sent to +91 ${mobile}`}
          </p>
        </div>

        {/* Step bar */}
        <div className="step-bar">
          <div className="step-seg" style={{ background: 'var(--accent)' }} />
          <div className="step-seg" style={{ background: step >= 2 ? 'var(--accent)' : 'var(--border)' }} />
        </div>

        {step === 1 ? (
          <form onSubmit={handleSend}>
            <div className="form-group">
              <label className="form-label">Mobile number</label>
              <input className="form-input" placeholder="10-digit number e.g. 9876543210"
                maxLength={10} value={mobile}
                onChange={e => setMobile(e.target.value.replace(/\D/g, '').slice(0, 10))} />
            </div>
            <button type="submit" className="btn btn-primary btn-lg" style={{ width: '100%' }} disabled={loading}>
              {loading ? 'Sending OTP...' : 'Send OTP via SMS →'}
            </button>
          </form>
        ) : (
          <form onSubmit={handleReset}>
            <div className="form-group">
              <label className="form-label">OTP (6 digits from SMS)</label>
              <input className="form-input otp-input" placeholder="000000" maxLength={6}
                value={otp} onChange={e => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))} />
            </div>
            <div className="form-group">
              <label className="form-label">New password</label>
              <input className="form-input" type="password" placeholder="Min. 6 chars, 1 uppercase"
                value={newPassword} onChange={e => setNew(e.target.value)} />
            </div>
            <div className="form-group">
              <label className="form-label">Confirm new password</label>
              <input className="form-input" type="password" placeholder="Re-enter new password"
                value={confirmPw} onChange={e => setConfirm(e.target.value)} />
            </div>
            <div style={{ display: 'flex', gap: 10 }}>
              <button type="button" className="btn btn-secondary" onClick={() => setStep(1)} disabled={loading}>
                ← Back
              </button>
              <button type="submit" className="btn btn-primary" style={{ flex: 1 }} disabled={loading}>
                {loading ? 'Resetting...' : 'Reset password →'}
              </button>
            </div>
          </form>
        )}

        <div className="auth-footer" style={{ marginTop: 16 }}>
          <Link to="/login">← Back to login</Link>
        </div>
      </div>
    </div>
  );
}
