import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { io } from 'socket.io-client';
import { getElectionAPI, getResultsAPI } from '../../utils/api';
import Spinner from '../../components/shared/Spinner';

const SOCKET_URL = 'http://localhost:5000';
const COLORS     = ['#4f46e5','#7c3aed','#059669','#d97706','#dc2626','#0891b2'];
const MEDALS     = ['🥇','🥈','🥉'];

export default function ResultsPage() {
  const { electionId } = useParams();
  const navigate        = useNavigate();
  const [election, setElection] = useState(null);
  const [results, setResults]   = useState(null);
  const [loading, setLoading]   = useState(true);
  const socketRef = useRef(null);

  useEffect(() => {
    loadData();

    // Socket.io live updates
    socketRef.current = io(SOCKET_URL);
    socketRef.current.emit('joinElection', electionId);
    socketRef.current.on('voteUpdated', ({ candidate }) => {
      setResults(prev => {
        if (!prev) return prev;
        const newResults = { ...prev.results };
        if (newResults[candidate.role]) {
          newResults[candidate.role] = newResults[candidate.role]
            .map(c => c._id === candidate._id ? { ...c, voteCount: candidate.voteCount } : c)
            .sort((a, b) => b.voteCount - a.voteCount);
        }
        const total = Object.values(newResults).flat().reduce((s, c) => s + c.voteCount, 0);
        return { ...prev, results: newResults, totalVotes: total };
      });
    });

    return () => {
      socketRef.current?.emit('leaveElection', electionId);
      socketRef.current?.disconnect();
    };
  }, [electionId]);

  const loadData = async () => {
    try {
      const [elRes, resRes] = await Promise.all([
        getElectionAPI(electionId),
        getResultsAPI(electionId),
      ]);
      setElection(elRes.data.data.election);
      setResults(resRes.data.data);
    } catch { toast.error('Failed to load results'); }
    finally { setLoading(false); }
  };

  if (loading) return <Spinner />;
  if (!election || !results) return null;

  const isLive = election.status === 'live';
  const totalVotes = results.totalVotes || 0;

  return (
    <div className="page-wrap">
      <div className="page-header">
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 6 }}>
            <span className={`badge badge-${isLive ? 'live' : 'ended'}`}>
              {isLive && <span className="live-dot" />} {election.status}
            </span>
            {isLive && <span style={{ fontSize: 12, color: 'var(--text2)' }}>Live via Socket.io</span>}
          </div>
          <h1 className="page-title">{election.title} — Results</h1>
          <p className="page-sub">Total votes cast: <strong>{totalVotes}</strong></p>
        </div>
        <button onClick={() => navigate(-1)} className="btn btn-secondary">← Back</button>
      </div>

      {Object.entries(results.results || {}).map(([roleName, roleCandidates]) => {
        const sorted     = [...roleCandidates].sort((a, b) => b.voteCount - a.voteCount);
        const roleTotal  = sorted.reduce((s, c) => s + c.voteCount, 0);
        const winner     = sorted[0];

        return (
          <div key={roleName} style={{ marginBottom: 32 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 14, flexWrap: 'wrap', gap: 8 }}>
              <h2 style={{ fontSize: 18 }}>🏆 {roleName}</h2>
              <span style={{ fontSize: 13, color: 'var(--text2)' }}>{roleTotal} votes</span>
            </div>

            {winner && winner.voteCount > 0 && (
              <div className="winner-box">
                {winner.photo?.url ? (
                  <img src={winner.photo.url} alt={winner.name} style={{ width: 50, height: 50, borderRadius: '50%', objectFit: 'cover', border: '2px solid var(--accent)' }} />
                ) : (
                  <div style={{ width: 50, height: 50, borderRadius: '50%', background: COLORS[0], display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontWeight: 700, flexShrink: 0 }}>
                    {winner.name.split(' ').map(w => w[0]).join('').slice(0, 2)}
                  </div>
                )}
                <div>
                  <div className="winner-label">{isLive ? '📈 Currently leading' : '🥇 Winner'}</div>
                  <div className="winner-name">{winner.name}</div>
                  <div className="winner-votes">{winner.voteCount} votes · {roleTotal > 0 ? Math.round(winner.voteCount / roleTotal * 100) : 0}%</div>
                </div>
              </div>
            )}

            {sorted.map((cand, idx) => {
              const pct      = roleTotal > 0 ? Math.round(cand.voteCount / roleTotal * 100) : 0;
              const initials = cand.name.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase();
              return (
                <div key={cand._id} className="card" style={{ marginBottom: 10 }}>
                  <div className="result-row">
                    <div className="result-rank" style={{ color: idx === 0 ? '#d97706' : 'var(--text3)' }}>
                      {MEDALS[idx] || `#${idx + 1}`}
                    </div>
                    {cand.photo?.url ? (
                      <img src={cand.photo.url} alt={cand.name} className="result-ava" style={{ objectFit: 'cover' }} />
                    ) : (
                      <div className="result-ava" style={{ background: COLORS[idx % COLORS.length] }}>{initials}</div>
                    )}
                    <div className="result-info">
                      <div className="result-name">{cand.name}</div>
                      {cand.motto && <div className="result-sub">"{cand.motto}"</div>}
                    </div>
                    <div className="result-votes">{cand.voteCount}</div>
                    <div className="result-pct">{pct}%</div>
                  </div>
                  <div className="progress-track">
                    <div className="progress-fill" style={{ width: `${pct}%`, background: COLORS[idx % COLORS.length] }} />
                  </div>
                </div>
              );
            })}
            <div className="divider" />
          </div>
        );
      })}

      {Object.keys(results.results || {}).length === 0 && (
        <div className="empty-state">
          <div className="empty-icon">📊</div>
          <h3>No votes yet</h3>
          <p style={{ color: 'var(--text2)', marginTop: 8 }}>Results will appear here once voting begins.</p>
        </div>
      )}
    </div>
  );
}
