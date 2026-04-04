

import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

export default function Navbar({ role, setRole }) {
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  const isAdmin = user?.role === 'admin';
  const active = (path) => location.pathname === path || location.pathname.startsWith(path + '/');

  const adminLinks = [
    { to: '/admin',            label: 'Dashboard' },
    { to: '/admin/elections',  label: 'Elections' },
    { to: '/admin/candidates', label: 'Candidates' },
  ];
  const studentLinks = [
    { to: '/dashboard', label: 'Dashboard' },
    { to: '/profile',   label: 'Profile' },
  ];
  const links = isAdmin ? adminLinks : studentLinks;

  const handleLogout = () => { logout(); navigate('/login'); };
  const initials = user?.name?.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2);

  return (
    <nav style={{
      background: '#fff',
      borderBottom: '1px solid var(--border)',
      padding: '0 24px',
      height: 60,
      display: 'flex',
      alignItems: 'center',
      gap: 8,
      position: 'sticky',
      top: 0,
      zIndex: 100,
      boxShadow: '0 1px 3px rgba(0,0,0,.06)',
    }}>

      <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: 10, textDecoration: 'none', marginRight: 10 }}>
        <div style={{ width: 32, height: 32, background: 'var(--accent)', borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontWeight: 700, fontSize: 15 }}>V</div>
        <span style={{ fontWeight: 700, fontSize: 17, color: 'var(--text)' }}>Vote-Pole</span>
      </Link>

      {user && links.map(link => (
        <Link
          key={link.to}
          to={link.to}
          style={{
            padding: '6px 14px',
            borderRadius: 8,
            textDecoration: 'none',
            fontSize: 14,
            fontWeight: 500,
            color: active(link.to) ? 'var(--accent)' : 'var(--text2)',
          }}
        >
          {link.label}
        </Link>
      ))}

      {/* Right side */}
      <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: 12 }}>

        {/* Role toggle — only when NOT logged in */}
        {!user && (
          <div style={{ display: 'flex', background: '#f1f1f1', borderRadius: 8, padding: 3, gap: 3 }}>
            <button
              onClick={() => setRole('student')}
              style={{
                padding: '6px 14px', borderRadius: 6, border: 'none', cursor: 'pointer',
                background: role === 'student' ? 'var(--accent)' : 'transparent',
                color: role === 'student' ? '#fff' : 'var(--text2)',
                fontWeight: 500, fontSize: 13,
              }}
            >
              Student
            </button>
            <button
              onClick={() => setRole('admin')}
              style={{
                padding: '6px 14px', borderRadius: 6, border: 'none', cursor: 'pointer',
                background: role === 'admin' ? 'var(--accent)' : 'transparent',
                color: role === 'admin' ? '#fff' : 'var(--text2)',
                fontWeight: 500, fontSize: 13,
              }}
            >
              Admin
            </button>
          </div>
        )}

        {/* User info — only when logged in */}
        {user && (
          <>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <div style={{ width: 32, height: 32, borderRadius: '50%', background: 'var(--accent)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontSize: 13, fontWeight: 700 }}>
                {initials}
              </div>
              <div style={{ lineHeight: 1.3 }}>
                <div style={{ fontSize: 13, fontWeight: 600 }}>{user.name}</div>
                <div style={{ fontSize: 11, color: 'var(--text3)' }}>{user.enrollmentNumber || user.email}</div>
              </div>
            </div>
            <button onClick={handleLogout} className="btn btn-secondary btn-sm">Log out</button>
          </>
        )}
      </div>
    </nav>
  );
}
