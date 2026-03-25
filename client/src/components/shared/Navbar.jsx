


import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

export default function Navbar() {
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate  = useNavigate();

  // NEW: role toggle (for login page)
  const [role, setRole] = useState("student");

  //  NEW: theme toggle
  const [dark, setDark] = useState(false);

  const isAdmin = user?.role === 'admin';
  const active  = (path) => location.pathname === path || location.pathname.startsWith(path + '/');

  const adminLinks = [
    { to: '/admin',             label: 'Dashboard' },
    { to: '/admin/elections',   label: 'Elections' },
    { to: '/admin/candidates',  label: 'Candidates' },
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
      background: dark ? '#111' : '#fff', // NEW
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
      
      {/*  Logo (changed name) */}
      <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: 10, textDecoration: 'none', marginRight: 10 }}>
        <div style={{ width: 32, height: 32, background: 'var(--accent)', borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontWeight: 700, fontSize: 15 }}>V</div>
        <span style={{ fontWeight: 700, fontSize: 17, color: dark ? '#fff' : 'var(--text)' }}>
          Vote-Pole
        </span>
      </Link>

      {/*  If NOT logged in → show toggle*/ }
      {!user && (
        <div style={{ marginLeft: 'auto', display: 'flex', gap: 10 }}>
          <button
            onClick={() => setRole("student")}
            style={{
              padding: '6px 14px',
              borderRadius: 8,
              border: 'none',
              background: role === "student" ? 'var(--accent)' : '#ddd',
              color: role === "student" ? '#fff' : '#000',
              cursor: 'pointer'
            }}
          >
            Student
          </button>

          <button
            onClick={() => setRole("admin")}
            style={{
              padding: '6px 14px',
              borderRadius: 8,
              border: 'none',
              background: role === "admin" ? 'var(--accent)' : '#ddd',
              color: role === "admin" ? '#fff' : '#000',
              cursor: 'pointer'
            }}
          >
            Admin
          </button>

          
        </div>
      )}

      {/*  Logged-in UI (UNCHANGED logic) */}
      {user && (
        <>
          {links.map(link => (
            <Link
              key={link.to}
              to={link.to}
              style={{
                padding: '6px 14px',
                borderRadius: 8,
                textDecoration: 'none',
                fontSize: 14,
                fontWeight: 500,
                transition: 'all .2s',
                position: 'relative',
                color: active(link.to) ? 'var(--accent)' : 'var(--text2)',
              }}
              className="nav-link"
            >
              {link.label}
            </Link>
          ))}

          {/* Right side */}
          <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: 12 }}>
            
            {/* Dark toggle */}
            <button
              onClick={() => setDark(!dark)}
              style={{
                padding: '6px 10px',
                borderRadius: 8,
                border: 'none',
                cursor: 'pointer'
              }}
            >
              {dark ? "☀️" : "🌙"}
            </button>

            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <div style={{ width: 32, height: 32, borderRadius: '50%', background: 'var(--accent)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontSize: 13, fontWeight: 700 }}>
                {initials}
              </div>
              <div style={{ lineHeight: 1.3 }}>
                <div style={{ fontSize: 13, fontWeight: 600 }}>{user.name}</div>
                <div style={{ fontSize: 11, color: 'var(--text3)' }}>{user.enrollmentNumber || user.email}</div>
              </div>
            </div>

            <button onClick={handleLogout} className="btn btn-secondary btn-sm">
              Log out
            </button>
          </div>
        </>
      )}
    </nav>
  );
}


