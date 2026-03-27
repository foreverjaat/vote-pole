/*
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { toast } from 'react-toastify';
import { useAuth } from '../../context/AuthContext';
import { getElectionsAPI } from '../../utils/api';
import Spinner from '../../components/shared/Spinner';

export default function StudentDashboard() {
  const { user } = useAuth();
  const [elections, setElections] = useState([]);
  const [loading, setLoading]     = useState(true);

  useEffect(() => { fetchElections(); }, []);

  const fetchElections = async () => {
    try {
      const { data } = await getElectionsAPI();
      setElections(data.data.elections);
    } catch { toast.error('Failed to load elections'); }
    finally { setLoading(false); }
  };

  if (loading) return <Spinner />;

  const initials = user?.name?.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2);
  const live     = elections.filter(e => e.status === 'live');
  const upcoming = elections.filter(e => e.status === 'upcoming');
  const ended    = elections.filter(e => e.status === 'ended');

  return (
    <div className="page-wrap">
      {/* Welcome banner *}
      <div className="card" style={{ background: 'linear-gradient(135deg,#ede9fe,#ddd6fe)', border: '1px solid #a5b4fc', marginBottom: 24 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 16, flexWrap: 'wrap' }}>
          <div style={{ width: 54, height: 54, borderRadius: '50%', background: 'var(--accent)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontSize: 20, fontWeight: 700, flexShrink: 0 }}>
            {initials}
          </div>
          <div>
            <h1 style={{ fontSize: 20, color: '#1e1b4b' }}>Welcome, {user?.name}!</h1>
            <p style={{ fontSize: 13, color: '#4338ca', marginTop: 2 }}>Enrollment: {user?.enrollmentNumber}</p>
          </div>
          <span className="badge badge-live" style={{ marginLeft: 'auto' }}>
            <span className="live-dot" /> Active
          </span>
        </div>
      </div>

      {/* Stats *}
      <div className="grid-4" style={{ marginBottom: 28 }}>
        {[
          { num: live.length,     label: 'Live elections',  color: 'var(--green)' },
          { num: upcoming.length, label: 'Upcoming',        color: 'var(--yellow)' },
          { num: ended.length,    label: 'Ended',           color: 'var(--text2)' },
          { num: elections.length,label: 'Total elections', color: 'var(--accent)' },
        ].map(s => (
          <div key={s.label} className="stat-card">
            <div className="stat-num" style={{ color: s.color }}>{s.num}</div>
            <div className="stat-label">{s.label}</div>
          </div>
        ))}
      </div>

      {/* Live *}
      {live.length > 0 && (
        <section style={{ marginBottom: 28 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 14 }}>
            <h2 style={{ fontSize: 17 }}>Live elections</h2>
            <span className="badge badge-live"><span className="live-dot" /> Voting open</span>
          </div>
          <div className="grid-2">
            {live.map(el => <ElectionCard key={el._id} election={el} />)}
          </div>
        </section>
      )}

      {/* Upcoming *}
      {upcoming.length > 0 && (
        <section style={{ marginBottom: 28 }}>
          <h2 style={{ fontSize: 17, marginBottom: 14 }}>Upcoming elections</h2>
          <div className="grid-2">
            {upcoming.map(el => <ElectionCard key={el._id} election={el} />)}
          </div>
        </section>
      )}

      {/* Ended *}
      {ended.length > 0 && (
        <section>
          <h2 style={{ fontSize: 17, marginBottom: 14 }}>Ended elections</h2>
          <div className="grid-2">
            {ended.map(el => <ElectionCard key={el._id} election={el} />)}
          </div>
        </section>
      )}

      {elections.length === 0 && (
        <div className="empty-state">
          <div className="empty-icon">🗳️</div>
          <h3>No elections available</h3>
          <p style={{ color: 'var(--text2)', marginTop: 8 }}>Check back later for upcoming elections.</p>
        </div>
      )}
    </div>
  );
}

function ElectionCard({ election }) {
  const fmt = d => new Date(d).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
  const statusMap = {
    live:     { cls: 'badge-live',     label: 'Live' },
    upcoming: { cls: 'badge-upcoming', label: 'Upcoming' },
    ended:    { cls: 'badge-ended',    label: 'Ended' },
    inactive: { cls: 'badge-inactive', label: 'Inactive' },
  };
  const { cls, label } = statusMap[election.status] || statusMap.inactive;

  return (
    <div className="card">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 }}>
        <span className={`badge ${cls}`}>
          {election.status === 'live' && <span className="live-dot" />} {label}
        </span>
        <span style={{ fontSize: 12, color: 'var(--text3)' }}>{election.roles?.length} role(s)</span>
      </div>

      <h3 style={{ fontSize: 16, marginBottom: 4 }}>{election.title}</h3>
      {election.description && <p style={{ fontSize: 13, color: 'var(--text2)', marginBottom: 10 }}>{election.description}</p>}

      <p style={{ fontSize: 12, color: 'var(--text3)', marginBottom: 10 }}>
        📅 {fmt(election.startDate)} → {fmt(election.endDate)}
      </p>

      <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginBottom: 14 }}>
        {election.roles?.map(r => <span key={r.name} className="role-chip">{r.name}</span>)}
      </div>

      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
        {election.status === 'live' && (
          <Link to={`/vote/${election._id}`} className="btn btn-primary btn-sm">🗳️ Vote now</Link>
        )}
        {(election.status === 'live' || election.status === 'ended') && (
          <Link to={`/results/${election._id}`} className="btn btn-secondary btn-sm">📊 Results</Link>
        )}
        {election.status === 'upcoming' && (
          <span style={{ fontSize: 13, color: 'var(--text2)', padding: '5px 0' }}>Opens {fmt(election.startDate)}</span>
        )}
      </div>
    </div>
  );
}
*/


import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { toast } from 'react-toastify';
import { useAuth } from '../../context/AuthContext';
import { getElectionsAPI } from '../../utils/api';
import Spinner from '../../components/shared/Spinner';

export default function StudentDashboard() {
  const { user } = useAuth();
  const [elections, setElections] = useState([]);
  const [loading, setLoading]     = useState(true);

  useEffect(() => { fetchElections(); }, []);

  const fetchElections = async () => {
    try {
      const { data } = await getElectionsAPI();
      setElections(data.data.elections);
    } catch { toast.error('Failed to load elections'); }
    finally { setLoading(false); }
  };

  if (loading) return <Spinner />;

  const initials = user?.name?.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2);
  const live     = elections.filter(e => e.status === 'live');
  const upcoming = elections.filter(e => e.status === 'upcoming');
  const ended    = elections.filter(e => e.status === 'ended');

  return (
    <div className="page-wrap">
      {/* Welcome banner */}
      <div className="card" style={{ background: 'linear-gradient(135deg,#ede9fe,#ddd6fe)', border: '1px solid #a5b4fc', marginBottom: 24 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 16, flexWrap: 'wrap' }}>
          <div style={{ width: 54, height: 54, borderRadius: '50%', background: 'var(--accent)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontSize: 20, fontWeight: 700, flexShrink: 0 }}>
            {initials}
          </div>
          <div>
            <h1 style={{ fontSize: 20, color: '#1e1b4b' }}>Welcome, {user?.name}!</h1>
            <p style={{ fontSize: 13, color: '#4338ca', marginTop: 2 }}>Enrollment: {user?.enrollmentNumber}</p>
          </div>
          <span className="badge badge-live" style={{ marginLeft: 'auto' }}>
            <span className="live-dot" /> Active
          </span>
        </div>
      </div>

      {/* Stats */}
      <div className="grid-4" style={{ marginBottom: 28 }}>
        {[
          { num: live.length,     label: 'Live elections',  color: 'var(--green)' },
          { num: upcoming.length, label: 'Upcoming',        color: 'var(--yellow)' },
          { num: ended.length,    label: 'Ended',           color: 'var(--text2)' },
          { num: elections.length,label: 'Total elections', color: 'var(--accent)' },
        ].map(s => (
          <div key={s.label} className="stat-card">
            <div className="stat-num" style={{ color: s.color }}>{s.num}</div>
            <div className="stat-label">{s.label}</div>
          </div>
        ))}
      </div>

      {/* Live */}
      {live.length > 0 && (
        <section style={{ marginBottom: 28 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 14 }}>
            <h2 style={{ fontSize: 17 }}>Live elections</h2>
            <span className="badge badge-live"><span className="live-dot" /> Voting open</span>
          </div>
          <div className="grid-2">
            {live.map(el => <ElectionCard key={el._id} election={el} />)}
          </div>
        </section>
      )}

      {/* Upcoming */}
      {upcoming.length > 0 && (
        <section style={{ marginBottom: 28 }}>
          <h2 style={{ fontSize: 17, marginBottom: 14 }}>Upcoming elections</h2>
          <div className="grid-2">
            {upcoming.map(el => <ElectionCard key={el._id} election={el} />)}
          </div>
        </section>
      )}

      {/* Ended */}
      {ended.length > 0 && (
        <section>
          <h2 style={{ fontSize: 17, marginBottom: 14 }}>Ended elections</h2>
          <div className="grid-2">
            {ended.map(el => <ElectionCard key={el._id} election={el} />)}
          </div>
        </section>
      )}

      {elections.length === 0 && (
        <div className="empty-state">
          <div className="empty-icon">🗳️</div>
          <h3>No elections available</h3>
          <p style={{ color: 'var(--text2)', marginTop: 8 }}>Check back later for upcoming elections.</p>
        </div>
      )}
    </div>
  );
}

function ElectionCard({ election }) {
  const fmt = d => new Date(d).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
  const statusMap = {
    live:     { cls: 'badge-live',     label: 'Live' },
    upcoming: { cls: 'badge-upcoming', label: 'Upcoming' },
    ended:    { cls: 'badge-ended',    label: 'Ended' },
    inactive: { cls: 'badge-inactive', label: 'Inactive' },
  };
  const { cls, label } = statusMap[election.status] || statusMap.inactive;

  return (
    <div
      className="card"
      style={{
        display: 'flex',
        flexDirection: 'column',
        height: '100%'
      }}
    >
      {/* Top content */}
      <div>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 }}>
          <span className={`badge ${cls}`}>
            {election.status === 'live' && <span className="live-dot" />} {label}
          </span>
          <span style={{ fontSize: 12, color: 'var(--text3)' }}>
            {election.roles?.length} role(s)
          </span>
        </div>

        <h3 style={{ fontSize: 16, marginBottom: 4 }}>{election.title}</h3>

        {election.description && (
          <p style={{ fontSize: 13, color: 'var(--text2)', marginBottom: 10 }}>
            {election.description}
          </p>
        )}

        <p style={{ fontSize: 12, color: 'var(--text3)', marginBottom: 10 }}>
          📅 {fmt(election.startDate)} → {fmt(election.endDate)}
        </p>

        <div
          style={{
            display: 'flex',
            gap: 6,
            flexWrap: 'wrap',
            marginBottom: 14,
            minHeight: 40
          }}
        >
          {election.roles?.map(r => (
            <span key={r.name} className="role-chip">{r.name}</span>
          ))}
        </div>
      </div>

      {/* Bottom buttons */}
      <div style={{ marginTop: 'auto', display: 'flex', gap: 8, flexWrap: 'wrap' }}>
        {election.status === 'live' && (
          <Link to={`/vote/${election._id}`} className="btn btn-primary btn-sm">
            🗳️ Vote now
          </Link>
        )}
        {(election.status === 'live' || election.status === 'ended') && (
          <Link to={`/results/${election._id}`} className="btn btn-secondary btn-sm">
            📊 Results
          </Link>
        )}
        {election.status === 'upcoming' && (
          <span style={{ fontSize: 13, color: 'var(--text2)', padding: '5px 0' }}>
            Opens {fmt(election.startDate)}
          </span>
        )}
      </div>
    </div>
  );
}
```
