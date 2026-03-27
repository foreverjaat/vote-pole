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
        //  FIX 1: align-items: stretch makes all cards in a row same height
        <div className="grid-2" style={{ alignItems: 'stretch' }}>
          {available.map(el => (
            // FIX 2: flex column so button is always pushed to the bottom
            <div key={el._id} className="card" style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>

              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 10 }}>
                <span className={`badge badge-${el.status === 'live' ? 'live' : 'ended'}`}>
                  {el.status === 'live' && <span className="live-dot" />}
                  {el.status === 'live' ? 'Live' : 'Ended'}
                </span>
                <span style={{ fontSize: 12, color: 'var(--text2)' }}>{el.roles?.length} role(s)</span>
              </div>

              <h3 style={{ fontSize: 15, marginBottom: 4 }}>{el.title}</h3>

              {el.description && (
                <p style={{ fontSize: 13, color: 'var(--text2)', marginBottom: 8 }}>{el.description}</p>
              )}

              <p style={{ fontSize: 12, color: 'var(--text3)', marginBottom: 10 }}>
                📅 {fmt(el.startDate)} → {fmt(el.endDate)}
              </p>

              <div style={{ display: 'flex', gap: 5, flexWrap: 'wrap', marginBottom: 14 }}>
                {el.roles?.map(r => (
                  <span key={r.name} className="role-chip">{r.name}</span>
                ))}
              </div>

              {/* ✅ FIX 3: marginTop auto pushes button to the bottom of every card */}
              <Link
                to={`/results/${el._id}`}
                className="btn btn-secondary btn-sm"
                style={{ marginTop: 'auto', alignSelf: 'flex-start' }}
              >
                📊 {el.status === 'live' ? 'Live results' : 'Final results'}
              </Link>

            </div>
          ))}
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

