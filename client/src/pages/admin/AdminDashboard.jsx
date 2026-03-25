import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { toast } from 'react-toastify';
import { getElectionsAPI, getElectionStatsAPI } from '../../utils/api';
import Spinner from '../../components/shared/Spinner';

export default function AdminDashboard() {
  const [elections, setElections] = useState([]);
  const [stats, setStats]         = useState({ total: 0, live: 0, upcoming: 0, ended: 0, totalVotes: 0, totalCandidates: 0 });
  const [loading, setLoading]     = useState(true);

  useEffect(() => { fetchData(); }, []);

  const fetchData = async () => {
    try {
      const { data } = await getElectionsAPI();
      const els = data.data.elections;
      setElections(els);

      let totalVotes = 0, totalCandidates = 0;
      await Promise.all(els.map(async el => {
        try {
          const res = await getElectionStatsAPI(el._id);
          totalVotes      += res.data.data.totalVotes || 0;
          totalCandidates += res.data.data.totalCandidates || 0;
        } catch { /* ignore */ }
      }));

      setStats({
        total:          els.length,
        live:           els.filter(e => e.status === 'live').length,
        upcoming:       els.filter(e => e.status === 'upcoming').length,
        ended:          els.filter(e => e.status === 'ended').length,
        totalVotes,
        totalCandidates,
      });
    } catch { toast.error('Failed to load dashboard'); }
    finally { setLoading(false); }
  };

  if (loading) return <Spinner />;

  const liveElections = elections.filter(e => e.status === 'live');

  return (
    <div className="page-wrap">
      <div className="page-header">
        <div>
          <h1 className="page-title">Admin dashboard</h1>
          <p className="page-sub">Manage all college elections from one place</p>
        </div>
      </div>

      {/* Stats */}
      <div className="grid-3" style={{ marginBottom: 28 }}>
        {[
          { num: stats.total,          label: 'Total elections',  color: 'var(--accent2)' },
          { num: stats.live,           label: 'Live now',         color: 'var(--green)' },
          { num: stats.upcoming,       label: 'Upcoming',         color: 'var(--yellow)' },
          { num: stats.ended,          label: 'Ended',            color: 'var(--text2)' },
          { num: stats.totalVotes,     label: 'Total votes',      color: 'var(--accent)' },
          { num: stats.totalCandidates,label: 'Total candidates', color: 'var(--green)' },
        ].map(s => (
          <div key={s.label} className="stat-card">
            <div className="stat-num" style={{ color: s.color }}>{s.num}</div>
            <div className="stat-label">{s.label}</div>
          </div>
        ))}
      </div>

      {/* Quick actions */}
      <h2 style={{ fontSize: 17, marginBottom: 14 }}>Quick actions</h2>
      <div className="grid-3" style={{ marginBottom: 28 }}>
        {[
          { to: '/admin/elections',  icon: '🗳️', title: 'Manage elections',  desc: 'Create elections with roles and date ranges' },
          { to: '/admin/candidates', icon: '👤', title: 'Manage candidates', desc: 'Add candidates with Cloudinary photo upload' },
        ].map(a => (
          <Link key={a.to} to={a.to} style={{ textDecoration: 'none' }}>
            <div className="card" style={{ height: '100%', cursor: 'pointer' }}>
              <div style={{ fontSize: 28, marginBottom: 10 }}>{a.icon}</div>
              <h3 style={{ fontSize: 15, marginBottom: 4 }}>{a.title}</h3>
              <p style={{ fontSize: 13, color: 'var(--text2)' }}>{a.desc}</p>
            </div>
          </Link>
        ))}
      </div>

      {/* Live elections */}
      {liveElections.length > 0 && (
        <>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 14 }}>
            <h2 style={{ fontSize: 17 }}>Live elections</h2>
            <span className="badge badge-live"><span className="live-dot" /> Live</span>
          </div>
          <div className="grid-2">
            {liveElections.map(el => (
              <div key={el._id} className="card">
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 10 }}>
                  <span className="badge badge-live"><span className="live-dot" /> Live</span>
                  <Link to={`/admin/results/${el._id}`} className="btn btn-secondary btn-sm">📊 Results</Link>
                </div>
                <h3 style={{ fontSize: 15, marginBottom: 6 }}>{el.title}</h3>
                <div style={{ display: 'flex', gap: 5, flexWrap: 'wrap' }}>
                  {el.roles?.map(r => <span key={r.name} className="role-chip">{r.name}</span>)}
                </div>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
