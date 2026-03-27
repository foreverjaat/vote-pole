
import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { toast } from 'react-toastify';
import { getElectionAPI, getCandidatesAPI, castVoteAPI, checkVotedAPI } from '../../utils/api';
import Spinner from '../../components/shared/Spinner';

const AVATAR_COLORS = ['#4f46e5','#7c3aed','#059669','#d97706','#dc2626','#0891b2','#be185d','#0f766e'];

export default function VotePage() {
  const { electionId } = useParams();
  const navigate = useNavigate();

  const [election, setElection] = useState(null);
  const [candidates, setCandidates] = useState([]);
  const [selected, setSelected] = useState({});
  const [voted, setVoted] = useState({});
  const [submitting, setSubmitting] = useState(null);
  const [loading, setLoading] = useState(true);
  const [checkingVotes, setCheckingVotes] = useState(false);

  // ── Refresh voted status ─────────────────────
  const refreshVotedStatus = useCallback(async (roles) => {
    if (!roles || roles.length === 0) return;

    setCheckingVotes(true);
    const votedMap = {};

    const results = await Promise.allSettled(
      roles.map(({ name }) => checkVotedAPI(electionId, name))
    );

    results.forEach((result, i) => {
      const roleName = roles[i].name;

      if (result.status === 'fulfilled') {
        votedMap[roleName] = result.value.data.data.hasVoted === true;
      } else {
        votedMap[roleName] = false;
      }
    });

    setVoted(votedMap);
    setCheckingVotes(false);
  }, [electionId]);

  // ── Load Data ───────────────────────────────
  const loadData = useCallback(async () => {
    setLoading(true);

    try {
      const [elRes, candRes] = await Promise.all([
        getElectionAPI(electionId),
        getCandidatesAPI(electionId),
      ]);

      const el = elRes.data.data.election;

      // ── Extract candidates safely from any response shape ──
      let cands = [];

      if (Array.isArray(candRes.data)) {
        cands = candRes.data;
      } else if (Array.isArray(candRes.data?.data)) {
        cands = candRes.data.data;
      } else if (Array.isArray(candRes.data?.data?.candidates)) {
        cands = candRes.data.data.candidates;
      } else if (Array.isArray(candRes.data?.candidates)) {
        cands = candRes.data.candidates;
      }

      setElection(el);
      setCandidates(cands);

      await refreshVotedStatus(el.roles);

    } catch (err) {
      console.error('loadData error:', err);
      toast.error('Failed to load election data');
      navigate('/dashboard');
    } finally {
      setLoading(false);
    }
  }, [electionId, navigate, refreshVotedStatus]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // ── Select Candidate ───────────────────────
  const handleSelect = (roleName, candidateId) => {
    if (voted[roleName]) return;

    setSelected(prev => ({
      ...prev,
      [roleName]: candidateId
    }));
  };

  
  const handleSubmit = async (roleName) => {
    const candidateId = selected[roleName];

    if (!candidateId) {
      return toast.error('Select a candidate first');
    }

    setSubmitting(roleName);

    try {
      const checkRes = await checkVotedAPI(electionId, roleName);

      if (checkRes.data.data.hasVoted) {
        setVoted(prev => ({ ...prev, [roleName]: true }));
        return toast.error(`Already voted for ${roleName}`);
      }

      await castVoteAPI({
        candidateId,
        electionId,
        role: roleName
      });

      setVoted(prev => ({ ...prev, [roleName]: true }));

      setSelected(prev => {
        const s = { ...prev };
        delete s[roleName];
        return s;
      });

      toast.success(`Vote cast for ${roleName}! 🎉`);

    } catch (err) {
      const msg = err.response?.data?.message || 'Failed to cast vote';

      if (err.response?.status === 409) {
        setVoted(prev => ({ ...prev, [roleName]: true }));
      }

      toast.error(msg);
    } finally {
      setSubmitting(null);
    }
  };

  
  if (loading) return <Spinner />;
  if (!election) return null;

  // ── Not Live ──────────────────────────────
  if (election.status !== 'live') {
    return (
      <div style={{ textAlign: 'center', paddingTop: 60 }}>
        <h2>Voting not available</h2>
        <p>This election is currently <strong>{election.status}</strong>.</p>
        <Link to="/dashboard">← Back to Dashboard</Link>
      </div>
    );
  }

  const allVoted = election.roles?.every(r => voted[r.name] === true);

  
  return (
    <div className="page-wrap">
      <div className="page-header">
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 6 }}>
            <span className="badge badge-live"><span className="live-dot" /> Live</span>
            <span style={{ fontSize: 12, color: 'var(--text2)' }}>One vote per role</span>
            {checkingVotes && (
              <span style={{ fontSize: 11, color: 'var(--text3)' }}>Checking votes...</span>
            )}
          </div>
          <h1 className="page-title">{election.title}</h1>
          {election.description && <p className="page-sub">{election.description}</p>}
        </div>
        <button onClick={() => navigate('/vote-list')} className="btn btn-secondary">← Back</button>
      </div>

      {allVoted && (
        <div className="success-banner">
          <p className="success-banner-title">✅ All votes submitted!</p>
          <p className="success-banner-sub">
            You have voted for all positions.{' '}
            <Link to={`/results/${electionId}`} style={{ color: 'var(--green)', fontWeight: 600 }}>
              View live results →
            </Link>
          </p>
        </div>
      )}

      {election.roles?.map(({ name: roleName }) => {
        //  FIX: Case-insensitive comparison so "Hostal captain" matches "hostal captain" in DB
        const roleCandidates = Array.isArray(candidates)
          ? candidates.filter(c => c.role.toLowerCase() === roleName.toLowerCase())
          : [];

        const isVoted      = voted[roleName] === true;
        const selId        = selected[roleName];
        const isSubmitting = submitting === roleName;

        return (
          <div key={roleName} style={{ marginBottom: 32 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
              <h2 style={{ fontSize: 18 }}>🏆 {roleName}</h2>
              <span className={`badge ${isVoted ? 'badge-live' : 'badge-upcoming'}`}>
                {isVoted ? '✓ Voted' : 'Pending'}
              </span>
            </div>

            {roleCandidates.length === 0 ? (
              <div className="card" style={{ textAlign: 'center', color: 'var(--text2)', padding: 32 }}>
                No candidates registered for this position yet.
              </div>
            ) : (
              <>
                <div className="grid-3" style={{ marginBottom: 14 }}>
                  {roleCandidates.map((cand, idx) => {
                    const bgColor    = AVATAR_COLORS[idx % AVATAR_COLORS.length];
                    const initials   = cand.name.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2);
                    const isSelected = selId === cand._id;
                    const cardClass  = isVoted && isSelected ? 'cand-card voted'
                      : isVoted && !isSelected ? 'cand-card dimmed'
                      : isSelected ? 'cand-card selected' : 'cand-card';

                    return (
                      <div
                        key={cand._id}
                        className={cardClass}
                        onClick={() => handleSelect(roleName, cand._id)}
                        style={{ cursor: isVoted ? 'default' : 'pointer' }}
                      >
                        {isSelected && (
                          <div className="check-mark" style={{ background: isVoted ? 'var(--green)' : 'var(--accent)' }}>✓</div>
                        )}
                        {cand.photo?.url ? (
                          <img
                            src={cand.photo.url}
                            alt={cand.name}
                            className="cand-avatar"
                            style={{
                              objectFit: 'cover',
                              border: `3px solid ${isSelected ? (isVoted ? 'var(--green)' : 'var(--accent)') : 'transparent'}`
                            }}
                          />
                        ) : (
                          <div className="cand-avatar" style={{ background: bgColor }}>{initials}</div>
                        )}
                        <div className="cand-name">{cand.name}</div>
                        <div className="cand-dept">{cand.role}</div>
                        {cand.motto && <div className="cand-motto">"{cand.motto}"</div>}
                        {cand.manifesto && (
                          <p style={{ fontSize: 12, color: 'var(--text3)', marginTop: 8, lineHeight: 1.5 }}>
                            {cand.manifesto.slice(0, 100)}{cand.manifesto.length > 100 ? '...' : ''}
                          </p>
                        )}
                      </div>
                    );
                  })}
                </div>

                {!isVoted && (
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                    <button
                      className="btn btn-primary"
                      disabled={!selId || isSubmitting || checkingVotes}
                      onClick={() => handleSubmit(roleName)}
                    >
                      {isSubmitting ? 'Submitting...' : `🗳️ Submit vote for ${roleName}`}
                    </button>
                    {!selId && (
                      <span style={{ fontSize: 13, color: 'var(--text2)' }}>← Select a candidate first</span>
                    )}
                  </div>
                )}
              </>
            )}
            <div className="divider" />
          </div>
        );
      })}
    </div>
  );
}
