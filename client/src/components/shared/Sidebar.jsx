import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

const IconHome = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z"/>
    <polyline points="9 22 9 12 15 12 15 22"/>
  </svg>
);
const IconVote = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M9 11l3 3L22 4"/>
    <path d="M21 12v7a2 2 0 01-2 2H5a2 2 0 01-2-2V5a2 2 0 012-2h11"/>
  </svg>
);
const IconUsers = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2"/>
    <circle cx="9" cy="7" r="4"/>
    <path d="M23 21v-2a4 4 0 00-3-3.87"/>
    <path d="M16 3.13a4 4 0 010 7.75"/>
  </svg>
);
const IconBar = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <line x1="18" y1="20" x2="18" y2="10"/>
    <line x1="12" y1="20" x2="12" y2="4"/>
    <line x1="6" y1="20" x2="6" y2="14"/>
  </svg>
);
const IconUser = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2"/>
    <circle cx="12" cy="7" r="4"/>
  </svg>
);
const IconLogout = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4"/>
    <polyline points="16 17 21 12 16 7"/>
    <line x1="21" y1="12" x2="9" y2="12"/>
  </svg>
);

const LiveDot = () => (
  <span style={{
    display: 'inline-block', width: 7, height: 7,
    background: '#22c55e', borderRadius: '50%',
    animation: 'ldot 1.2s ease-in-out infinite',
    marginLeft: 'auto', flexShrink: 0,
  }} />
);

export default function Sidebar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  if (!user) return null;

  const isAdmin = user.role === 'admin';
  const initials = user.name?.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2);

  const adminLinks = [
    { to: '/admin',             icon: <IconHome />,  label: 'Dashboard' },
    { to: '/admin/elections',   icon: <IconVote />,  label: 'Elections' },
    { to: '/admin/candidates',  icon: <IconUsers />, label: 'Candidates' },
  ];

  const studentLinks = [
    { to: '/dashboard',  icon: <IconHome />,  label: 'Dashboard' },
    { to: '/vote-list',  icon: <IconVote />,  label: 'Vote now',   live: true },
    { to: '/results-list', icon: <IconBar />, label: 'Results',    live: true },
    { to: '/profile',    icon: <IconUser />,  label: 'Profile' },
  ];

  const links = isAdmin ? adminLinks : studentLinks;

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const activeStyle = {
    background: '#ede9fe', color: '#4338ca',
    fontWeight: 500,
  };
  const baseStyle = {
    display: 'flex', alignItems: 'center', gap: 10,
    padding: '8px 12px', margin: '1px 6px',
    borderRadius: 8, cursor: 'pointer',
    fontSize: 13, textDecoration: 'none',
    color: 'var(--text2)', transition: 'all .15s',
    border: 'none', background: 'none',
    fontFamily: 'inherit', width: 'calc(100% - 12px)',
  };

  return (
    <>
      <style>{`
        @keyframes ldot { 0%,100%{opacity:1} 50%{opacity:.3} }
        .sb-link:hover { background: var(--bg3) !important; color: var(--text) !important; }
      `}</style>

      <aside style={{
        width: 220, background: 'var(--card)',
        borderRight: '1px solid var(--border)',
        display: 'flex', flexDirection: 'column',
        flexShrink: 0, height: '100vh',
        position: 'sticky', top: 0,
      }}>
        {/* Logo */}
        <div style={{
          padding: '16px 16px 12px',
          borderBottom: '1px solid var(--border)',
          display: 'flex', alignItems: 'center', gap: 9,
        }}>
          <div style={{
            width: 30, height: 30, background: 'var(--accent)',
            borderRadius: 8, display: 'flex', alignItems: 'center',
            justifyContent: 'center', color: '#fff',
            fontSize: 14, fontWeight: 700, flexShrink: 0,
          }}>V</div>
          <span style={{ fontWeight: 700, fontSize: 16 }}>Vote-Pole</span>
          {isAdmin && (
            <span style={{
              background: 'var(--accent)', color: '#fff',
              fontSize: 10, padding: '1px 6px', borderRadius: 20,
              fontWeight: 600, marginLeft: 2,
            }}>Admin</span>
          )}
        </div>

        {/* Navigation */}
        <nav style={{ padding: '10px 0', flex: 1 }}>
          <div style={{
            fontSize: 10, fontWeight: 700, color: 'var(--text3)',
            textTransform: 'uppercase', letterSpacing: '.08em',
            padding: '8px 18px 6px',
          }}>
            {isAdmin ? 'Admin menu' : 'Student menu'}
          </div>

          {links.map(link => (
            <NavLink
              key={link.to}
              to={link.to}
              end={link.to === '/admin' || link.to === '/dashboard'}
              className="sb-link"
              style={({ isActive }) => ({
                ...baseStyle,
                ...(isActive ? activeStyle : {}),
              })}
            >
              <span style={{ flexShrink: 0, opacity: .8 }}>{link.icon}</span>
              {link.label}
              {link.live && <LiveDot />}
            </NavLink>
          ))}
        </nav>

        {/* User + Logout */}
        <div style={{ borderTop: '1px solid var(--border)', padding: '10px 6px 8px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 9, padding: '6px 12px', marginBottom: 2 }}>
            <div style={{
              width: 30, height: 30, borderRadius: '50%',
              background: 'var(--accent)', display: 'flex',
              alignItems: 'center', justifyContent: 'center',
              color: '#fff', fontSize: 11, fontWeight: 700, flexShrink: 0,
            }}>{initials}</div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontSize: 12, fontWeight: 600, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                {user.name}
              </div>
              <div style={{ fontSize: 10, color: 'var(--text3)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                {user.enrollmentNumber || user.email}
              </div>
            </div>
          </div>
          <button
            onClick={handleLogout}
            className="sb-link"
            style={{ ...baseStyle, color: 'var(--text2)' }}
          >
            <span style={{ flexShrink: 0, opacity: .8 }}><IconLogout /></span>
            Log out
          </button>
        </div>
      </aside>
    </>
  );
}
