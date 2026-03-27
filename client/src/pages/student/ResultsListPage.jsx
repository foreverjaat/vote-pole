/*
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { toast } from 'react-toastify';
import { getElectionsAPI } from '../../utils/api';
import Spinner from '../../components/shared/Spinner';

export default function ResultsListPage() {
  const [elections, setElections] = useState([]);
  const [loading, setLoading]     = useState(true);

  useEffect(() => {
    getElectionsAPI()
      .then(({ data }) => setElections(data.data.elections))
      .catch(() => toast.error('Failed to load elections'))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <Spinner />;

  const available = elections.filter(e => e.status === 'live' || e.status === 'ended');
  const fmt = d => new Date(d).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });

  return (
    <div className="page-wrap">
      <div className="page-header">
        <div>
          <h1 className="page-title">Results</h1>
          <p className="page-sub">View live and final election results</p>
        </div>
      </div>

      {available.length > 0 ? (
        <div className="grid-2">
          {available.map(el => (
            <div key={el._id} className="card">
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 10 }}>
                <span className={`badge badge-${el.status === 'live' ? 'live' : 'ended'}`}>
                  {el.status === 'live' && <span className="live-dot" />}
                  {el.status === 'live' ? 'Live' : 'Ended'}
                </span>
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
              <Link to={`/results/${el._id}`} className="btn btn-secondary btn-sm">
                📊 {el.status === 'live' ? 'Live results' : 'Final results'}
              </Link>
            </div>
          ))}
        </div>
      ) : (
        <div className="empty-state">
          <div className="empty-icon">📊</div>
          <h3>No results available</h3>
          <p style={{ color: 'var(--text2)', marginTop: 8 }}>Results appear once an election is live or ended.</p>
        </div>
      )}
    </div>
  );
}
*/

// after fix 

import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { toast } from 'react-toastify';
import { getElectionsAPI } from '../../utils/api';
import Spinner from '../../components/shared/Spinner';

export default function ResultsListPage() {
  const [elections, setElections] = useState([]);
  const [loading, setLoading]     = useState(true);

  useEffect(() => {
    getElectionsAPI()
      .then(({ data }) => setElections(data.data.elections))
      .catch(() => toast.error('Failed to load elections'))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <Spinner />;

  const available = elections.filter(e => e.status === 'live' || e.status === 'ended');

  const fmt = d =>
    new Date(d).toLocaleDateString('en-IN', {
      day: 'numeric', month: 'short', year: 'numeric',
    });

  return (
    <div className="page-wrap">
      {/* ── Header ── */}
      <div className="page-header">
        <div>
          <h1 className="page-title">Results</h1>
          <p className="page-sub">View live and final election results</p>
        </div>
      </div>

      {/* ── Cards Grid ── */}
      {available.length > 0 ? (
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
            gap: 20,
            alignItems: 'stretch',
          }}
        >
          {available.map(el => {
            const isLive = el.status === 'live';

            return (
              <div
                key={el._id}
                style={{
                  background: 'var(--card, #fff)',
                  border: isLive
                    ? '1.5px solid #22c55e'
                    : '1.5px solid var(--border, #e5e7eb)',
                  borderRadius: 14,
                  padding: '20px 20px 16px',
                  display: 'flex',
                  flexDirection: 'column',
                  boxShadow: isLive
                    ? '0 0 0 3px rgba(34,197,94,0.10)'
                    : '0 1px 4px rgba(0,0,0,0.06)',
                  position: 'relative',
                  overflow: 'hidden',
                }}
              >
                {/* Top accent bar */}
                <div
                  style={{
                    position: 'absolute',
                    top: 0, left: 0, right: 0,
                    height: 4,
                    background: isLive
                      ? 'linear-gradient(90deg,#22c55e,#4ade80)'
                      : 'linear-gradient(90deg,#94a3b8,#cbd5e1)',
                    borderRadius: '14px 14px 0 0',
                  }}
                />

                {/* Status + role count row */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14, marginTop: 8 }}>
                  {isLive ? (
                    <span style={{
                      display: 'inline-flex', alignItems: 'center', gap: 6,
                      background: '#dcfce7', color: '#16a34a',
                      fontSize: 12, fontWeight: 600, padding: '3px 10px',
                      borderRadius: 20,
                    }}>
                      <span style={{
                        width: 7, height: 7, borderRadius: '50%',
                        background: '#22c55e',
                        display: 'inline-block',
                      }} />
                      Live
                    </span>
                  ) : (
                    <span style={{
                      display: 'inline-flex', alignItems: 'center', gap: 6,
                      background: '#f1f5f9', color: '#64748b',
                      fontSize: 12, fontWeight: 600, padding: '3px 10px',
                      borderRadius: 20,
                    }}>
                      ✓ Ended
                    </span>
                  )}
                  <span style={{
                    fontSize: 12, color: 'var(--text2, #6b7280)',
                    background: 'var(--bg2, #f9fafb)',
                    padding: '2px 8px', borderRadius: 8,
                  }}>
                    {el.roles?.length} role{el.roles?.length !== 1 ? 's' : ''}
                  </span>
                </div>

                {/* Title */}
                <h3 style={{
                  fontSize: 16, fontWeight: 700,
                  color: 'var(--text1, #111827)',
                  marginBottom: 4, lineHeight: 1.4,
                }}>
                  {el.title}
                </h3>

                {/* Description */}
                {el.description && (
                  <p style={{
                    fontSize: 13, color: 'var(--text2, #6b7280)',
                    marginBottom: 8, lineHeight: 1.5,
                  }}>
                    {el.description}
                  </p>
                )}

                {/* Date */}
                <p style={{
                  fontSize: 12, color: 'var(--text3, #9ca3af)',
                  marginBottom: 12,
                  display: 'flex', alignItems: 'center', gap: 5,
                }}>
                  📅 {fmt(el.startDate)} → {fmt(el.endDate)}
                </p>

                {/* Role chips */}
                <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginBottom: 16 }}>
                  {el.roles?.map(r => (
                    <span
                      key={r.name}
                      style={{
                        fontSize: 11, fontWeight: 500,
                        padding: '3px 10px', borderRadius: 20,
                        background: 'var(--bg2, #f3f4f6)',
                        color: 'var(--text2, #374151)',
                        border: '1px solid var(--border, #e5e7eb)',
                      }}
                    >
                      {r.name}
                    </span>
                  ))}
                </div>

                {/* Button — always pinned to bottom */}
                <div style={{ marginTop: 'auto' }}>
                  <Link
                    to={`/results/${el._id}`}
                    style={{
                      display: 'inline-flex', alignItems: 'center', gap: 7,
                      padding: '9px 18px', borderRadius: 9,
                      fontSize: 13, fontWeight: 600,
                      textDecoration: 'none',
                      background: isLive
                        ? 'linear-gradient(135deg,#22c55e,#16a34a)'
                        : 'var(--bg2, #f1f5f9)',
                      color: isLive ? '#fff' : 'var(--text1, #374151)',
                      border: isLive ? 'none' : '1px solid var(--border, #e5e7eb)',
                      boxShadow: isLive ? '0 2px 8px rgba(34,197,94,0.25)' : 'none',
                    }}
                  >
                    📊 {isLive ? 'Live results' : 'Final results'}
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="empty-state">
          <div className="empty-icon">📊</div>
          <h3>No results available</h3>
          <p style={{ color: 'var(--text2)', marginTop: 8 }}>
            Results appear once an election is live or ended.
          </p>
        </div>
      )}
    </div>
  );
}


