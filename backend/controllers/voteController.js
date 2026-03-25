
import mongoose from 'mongoose';
import Vote from '../models/Vote.js';
import Candidate from '../models/Candidate.js';
import Election from '../models/Election.js';
import { AppError, catchAsync } from '../utils/appError.js';
import { getIO } from '../utils/socket.js';
import logger from '../utils/logger.js';

/* CAST VOTE */
export const castVote = catchAsync(async (req, res) => {
  const { candidateId, electionId, role } = req.body;
  const voterId = req.user._id;

  // ── Normalise role string — trim whitespace, preserve original case ──
  const normalizedRole = role?.trim();
  if (!normalizedRole) throw new AppError('role is required.', 400);

  // 1 — Election checks
  const election = await Election.findById(electionId);
  if (!election) throw new AppError('Election not found.', 404);

  const now = new Date();
  if (!election.isActive)       throw new AppError('This election is not active.', 400);
  if (now < election.startDate) throw new AppError('Voting has not started yet.', 400);
  if (now > election.endDate)   throw new AppError('Voting has ended.', 400);

  // 2 — Validate role belongs to this election (case-insensitive check)
  const electionRole = election.roles.find(
    r => r.name.toLowerCase() === normalizedRole.toLowerCase()
  );
  if (!electionRole) {
    throw new AppError(
      `Role "${normalizedRole}" is not part of this election. Valid roles: ${election.roles.map(r => r.name).join(', ')}.`,
      400
    );
  }
  // Use the canonical role name stored in the election (correct casing)
  const canonicalRole = electionRole.name;

  // 3 — Candidate checks
  const candidate = await Candidate.findById(candidateId);
  if (!candidate) throw new AppError('Candidate not found.', 404);
  if (candidate.election.toString() !== electionId)
    throw new AppError('Candidate does not belong to this election.', 400);

  // Compare candidate role case-insensitively
  if (candidate.role.toLowerCase() !== normalizedRole.toLowerCase()) {
    throw new AppError(
      `Candidate is running for "${candidate.role}", not "${normalizedRole}".`,
      400
    );
  }

  // 4 — Already voted check (use canonical role name for consistent lookup)
  const alreadyVoted = await Vote.findOne({
    voter: voterId,
    election: electionId,
    role: canonicalRole,
  });
  if (alreadyVoted) {
    throw new AppError(
      `You have already voted for ${canonicalRole} in this election.`,
      409
    );
  }

  // 5 — Atomic write in a MongoDB transaction
  const session = await mongoose.startSession();
  let updatedCandidate;
  try {
    session.startTransaction();

    await Vote.create(
      [{ voter: voterId, election: electionId, candidate: candidateId, role: canonicalRole, ip: req.ip }],
      { session }
    );

    updatedCandidate = await Candidate.findByIdAndUpdate(
      candidateId,
      { $inc: { voteCount: 1 } },
      { new: true, session }
    );

    await session.commitTransaction();
  } catch (err) {
    await session.abortTransaction();
    // Unique index violation = race condition double vote
    if (err.code === 11000) {
      throw new AppError(`You have already voted for ${canonicalRole} in this election.`, 409);
    }
    throw err;
  } finally {
    session.endSession();
  }

  // 6 — Emit live update via Socket.io (non-critical)
  try {
    const io = getIO();
    io.to(`election:${electionId}`).emit('voteUpdated', {
      electionId,
      candidate: updatedCandidate,
    });
  } catch (socketErr) {
    logger.warn(`Socket emit failed (non-critical): ${socketErr.message}`);
  }

  logger.info(`Vote cast: voter=${voterId} election=${electionId} role=${canonicalRole}`);
  res.status(200).json({ status: 'success', message: 'Your vote has been cast successfully.' });
});

/* GET RESULTS — grouped by role */
export const getResults = catchAsync(async (req, res) => {
  const { electionId } = req.params;
  const election = await Election.findById(electionId);
  if (!election) throw new AppError('Election not found.', 404);

  const [candidates, totalVotes] = await Promise.all([
    Candidate.find({ election: electionId }).sort({ role: 1, voteCount: -1 }),
    Vote.countDocuments({ election: electionId }),
  ]);

  const results = candidates.reduce((acc, c) => {
    if (!acc[c.role]) acc[c.role] = [];
    acc[c.role].push(c);
    return acc;
  }, {});

  res.status(200).json({ status: 'success', data: { election, totalVotes, results } });
});

/* HAS VOTED — ?electionId=...&role=... */
export const hasVoted = catchAsync(async (req, res) => {
  const { electionId, role } = req.query;
  if (!electionId || !role)
    throw new AppError('electionId and role query params are required.', 400);

  // Case-insensitive search so "secretary" matches "Secretary"
  const vote = await Vote.findOne({
    voter:    req.user._id,
    election: electionId,
    role:     { $regex: new RegExp(`^${role.trim()}$`, 'i') },
  });

  res.status(200).json({ status: 'success', data: { hasVoted: !!vote } });
});

/* MY VOTES — all votes by current user for an election */
export const getMyVotes = catchAsync(async (req, res) => {
  const { electionId } = req.params;
  const votes = await Vote.find({
    voter: req.user._id,
    election: electionId,
  }).populate('candidate');
  res.status(200).json({ status: 'success', data: { votes } });
});
