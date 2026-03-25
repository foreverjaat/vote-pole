import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { toast } from 'react-toastify';
import { getElectionsAPI } from '../../utils/api';
import Spinner from '../../components/shared/Spinner';

export default function VoteListPage() {
  const [elections, setElections] = useState([]);
  const [loading, setLoading]     = useState(true);

  useEffect(() => {
    getElectionsAPI()
      .then(({ data }) => setElections(data.data.elections))
      .catch(() => toast.error('Failed to load elections'))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <Spinner />;

  const live     = elections.filter(e => e.status === 'live');
  const upcoming = elections.filter(e => e.status === 'upcoming');
  const fmt = d => new Date(d).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });

  return (
    <div className="page-wrap">
      <div className="page-header">
        <div>
          <h1 className="page-title">Vote now</h1>
          <p className="page-sub">Select a live election to cast your votes</p>
        </div>
      </div>

      {live.length > 0 && (
        <section style={{ marginBottom: 28 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 14 }}>
            <h2 style={{ fontSize: 16 }}>Live elections</h2>
            <span className="badge badge-live"><span className="live-dot" /> Voting open</span>
          </div>
          <div className="grid-2">
            {live.map(el => (
              <div key={el._id} className="card">
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 10 }}>
                  <span className="badge badge-live"><span className="live-dot" /> Live</span>
                  <span style={{ fontSize: 12, color: 'var(--text2)' }}>{el.roles?.length} role(s)</span>
                </div>
                <h3 style={{ fontSize: 15, marginBottom: 4 }}>{el.title}</h3>
                {el.description && <p style={{ fontSize: 13, color: 'var(--text2)', marginBottom: 8 }}>{el.description}</p>}
                <p style={{ fontSize: 12, color: 'var(--text3)', marginBottom: 10 }}>
                  📅 {fmt(el.startDate)} → {fmt(el.endDate)}
                </p>
                <div style={{ display: 'flex', gap: 5, flexWrap: 'wrap', marginBottom: 14 }}>
                  {el.roles?.map(r => <span key={r.name} className="role-chip">{r.name}</span>)}
                </div>
                <Link to={`/vote/${el._id}`} className="btn btn-primary btn-sm">
                  🗳️ Vote in this election
                </Link>
              </div>
            ))}
          </div>
        </section>
      )}

      {upcoming.length > 0 && (
        <section>
          <h2 style={{ fontSize: 16, marginBottom: 14 }}>Upcoming elections</h2>
          <div className="grid-2">
            {upcoming.map(el => (
              <div key={el._id} className="card" style={{ opacity: .75 }}>
                <span className="badge badge-upcoming" style={{ marginBottom: 8, display: 'inline-flex' }}>Upcoming</span>
                <h3 style={{ fontSize: 15, marginBottom: 4 }}>{el.title}</h3>
                <p style={{ fontSize: 12, color: 'var(--text3)' }}>Opens {fmt(el.startDate)}</p>
              </div>
            ))}
          </div>
        </section>
      )}

      {live.length === 0 && upcoming.length === 0 && (
        <div className="empty-state">
          <div className="empty-icon">🗳️</div>
          <h3>No elections right now</h3>
          <p style={{ color: 'var(--text2)', marginTop: 8 }}>Check back later for upcoming elections.</p>
        </div>
      )}
    </div>
  );
}
