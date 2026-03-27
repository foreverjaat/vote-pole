
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

      // 🔥 FIXED CANDIDATE EXTRACTION (MAIN FIX)
      let cands = [];

      console.log("FULL API RESPONSE:", candRes.data);

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

  // ── Submit Vote ────────────────────────────
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

  // ── Loading ───────────────────────────────
  if (loading) return <Spinner />;
  if (!election) return null;

  // ── Not Live ──────────────────────────────
  if (election.status !== 'live') {
    return (
      <div style={{ textAlign: 'center', paddingTop: 60 }}>
        <h2>Voting not available</h2>
        <Link to="/dashboard">← Back</Link>
      </div>
    );
  }

  // ── UI ────────────────────────────────────
  return (
    <div>
      <h1>{election.title}</h1>

      {election.roles?.map(({ name: roleName }) => {
        const roleCandidates = Array.isArray(candidates)
          ? candidates.filter(c => c.role === roleName)
          : [];

        return (
          <div key={roleName} style={{ marginBottom: 20 }}>
            <h2>{roleName}</h2>

            {roleCandidates.length === 0 ? (
              <p>No candidates registered for this position yet.</p>
            ) : (
              roleCandidates.map(c => (
                <div key={c._id}>
                  <strong>{c.name}</strong>
                </div>
              ))
            )}
          </div>
        );
      })}
    </div>
  );
}
