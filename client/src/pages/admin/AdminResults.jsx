import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { io } from 'socket.io-client';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { getElectionAPI, getResultsAPI } from '../../utils/api';
import Spinner from '../../components/shared/Spinner';

const SOCKET_URL =  'http://localhost:8080';
const COLORS     = ['#4f46e5','#7c3aed','#059669','#d97706','#dc2626','#0891b2'];
const MEDALS     = ['🥇','🥈','🥉'];

export default function AdminResults() {
  const { electionId } = useParams();
  const navigate        = useNavigate();
  const [election, setElection] = useState(null);
  const [results, setResults]   = useState(null);
  const [loading, setLoading]   = useState(true);
  const socketRef = useRef(null);

  useEffect(() => {
    loadData();

    socketRef.current = io(SOCKET_URL);
    socketRef.current.emit('joinElection', electionId);
    socketRef.current.on('voteUpdated', ({ candidate }) => {
      setResults(prev => {
        if (!prev) return prev;
        const updated = { ...prev.results };
        if (updated[candidate.role]) {
          updated[candidate.role] = updated[candidate.role]
            .map(c => c._id === candidate._id ? { ...c, voteCount: candidate.voteCount } : c)
            .sort((a, b) => b.voteCount - a.voteCount);
        }
        const total = Object.values(updated).flat().reduce((s, c) => s + c.voteCount, 0);
        return { ...prev, results: updated, totalVotes: total };
      });
    });

    return () => {
      socketRef.current?.emit('leaveElection', electionId);
      socketRef.current?.disconnect();
    };
  }, [electionId]);

  const loadData = async () => {
    try {
      const [elRes, resRes] = await Promise.all([getElectionAPI(electionId), getResultsAPI(electionId)]);
      setElection(elRes.data.data.election);
      setResults(resRes.data.data);
    } catch { toast.error('Failed to load results'); }
    finally { setLoading(false); }
  };

  if (loading) return <Spinner />;
  if (!election || !results) return null;

  const isLive = election.status === 'live';

  return (
    <div className="page-wrap">
      <div className="page-header">
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 6 }}>
            <span className={`badge badge-${isLive ? 'live' : 'ended'}`}>
              {isLive && <span className="live-dot" />} {election.status}
            </span>
            {isLive && (
              <span style={{ fontSize: 12, color: 'var(--text2)' }}>
                Socket.io · room: election:{electionId.slice(-6)} · event: voteUpdated
              </span>
            )}
          </div>
          <h1 className="page-title">{election.title} — Results</h1>
          <p className="page-sub">Total votes: <strong>{results.totalVotes}</strong></p>
        </div>
        <button onClick={() => navigate('/admin/elections')} className="btn btn-secondary">← Elections</button>
      </div>

      {Object.entries(results.results || {}).map(([roleName, roleCandidates]) => {
        const sorted    = [...roleCandidates].sort((a, b) => b.voteCount - a.voteCount);
        const roleTotal = sorted.reduce((s, c) => s + c.voteCount, 0);
        const chartData = sorted.map(c => ({ name: c.name.split(' ')[0], votes: c.voteCount }));

        return (
          <div key={roleName} style={{ marginBottom: 36 }}>
            <h2 style={{ fontSize: 18, marginBottom: 16 }}>
              🏆 {roleName}
              <span style={{ fontSize: 13, color: 'var(--text2)', fontWeight: 400, marginLeft: 10 }}>{roleTotal} votes</span>
            </h2>

            {/* Bar chart */}
            {roleTotal > 0 && (
              <div className="card" style={{ marginBottom: 14 }}>
                <ResponsiveContainer width="100%" height={200}>
                  <BarChart data={chartData} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                    <XAxis dataKey="name" tick={{ fontSize: 12, fill: 'var(--text2)' }} />
                    <YAxis allowDecimals={false} tick={{ fontSize: 12, fill: 'var(--text2)' }} />
                    <Tooltip
                      contentStyle={{ background: 'var(--card)', border: '1px solid var(--border)', borderRadius: 8, fontSize: 13 }}
                      cursor={{ fill: 'rgba(79,70,229,.05)' }}
                    />
                    <Bar dataKey="votes" radius={[6, 6, 0, 0]}>
                      {chartData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            )}

            {/* Table */}
            <div className="table-wrap">
              <table>
                <thead>
                  <tr><th>Rank</th><th>Candidate</th><th>Motto</th><th>Votes</th><th>%</th><th>Progress</th></tr>
                </thead>
                <tbody>
                  {sorted.map((c, idx) => {
                    const pct      = roleTotal > 0 ? Math.round(c.voteCount / roleTotal * 100) : 0;
                    const initials = c.name.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase();
                    return (
                      <tr key={c._id}>
                        <td style={{ fontWeight: 700, color: idx === 0 ? '#d97706' : 'var(--text2)' }}>
                          {MEDALS[idx] || `#${idx + 1}`}
                        </td>
                        <td>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                            {c.photo?.url ? (
                              <img src={c.photo.url} alt={c.name} style={{ width: 36, height: 36, borderRadius: '50%', objectFit: 'cover' }} />
                            ) : (
                              <div style={{ width: 36, height: 36, borderRadius: '50%', background: COLORS[idx % COLORS.length], display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontSize: 13, fontWeight: 700 }}>
                                {initials}
                              </div>
                            )}
                            <span style={{ fontWeight: 600 }}>{c.name}</span>
                          </div>
                        </td>
                        <td style={{ color: 'var(--text2)', fontStyle: 'italic', fontSize: 13 }}>{c.motto || '—'}</td>
                        <td style={{ fontWeight: 700, fontSize: 18, color: 'var(--accent)' }}>{c.voteCount}</td>
                        <td style={{ fontWeight: 600 }}>{pct}%</td>
                        <td style={{ width: 140 }}>
                          <div className="progress-track">
                            <div className="progress-fill" style={{ width: `${pct}%`, background: COLORS[idx % COLORS.length] }} />
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
            <div className="divider" />
          </div>
        );
      })}

      {Object.keys(results.results || {}).length === 0 && (
        <div className="empty-state">
          <div className="empty-icon">📊</div>
          <h3>No votes yet</h3>
          <p style={{ color: 'var(--text2)', marginTop: 8 }}>Results will appear once students start voting.</p>
        </div>
      )}
    </div>
  );
}
