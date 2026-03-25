import Election from '../models/Election.js';
import Candidate from '../models/Candidate.js';
import Vote from '../models/Vote.js';
import { AppError, catchAsync } from '../utils/appError.js';
import logger from '../utils/logger.js';

/* CREATE */
export const createElection = catchAsync(async (req, res) => {
  const { title, description, roles, startDate, endDate } = req.body;
  if (new Date(startDate) >= new Date(endDate))
    throw new AppError('startDate must be before endDate.', 400);

  const election = await Election.create({
    title, description, roles, startDate, endDate,
    createdBy: req.user._id,
  });
  logger.info(`Election created: "${title}" by ${req.user.email}`);
  res.status(201).json({ status: 'success', data: { election } });
});

/* GET ALL */
export const getElections = catchAsync(async (req, res) => {
  const elections = await Election.find()
    .sort({ createdAt: -1 })
    .populate('createdBy', 'name email');
  res.status(200).json({ status: 'success', results: elections.length, data: { elections } });
});

/* GET BY ID */
export const getElectionById = catchAsync(async (req, res) => {
  const election = await Election.findById(req.params.id).populate('createdBy', 'name email');
  if (!election) throw new AppError('Election not found.', 404);
  res.status(200).json({ status: 'success', data: { election } });
});

/* UPDATE */
export const updateElection = catchAsync(async (req, res) => {
  const { title, description, roles, startDate, endDate } = req.body;
  if (startDate && endDate && new Date(startDate) >= new Date(endDate))
    throw new AppError('startDate must be before endDate.', 400);

  const election = await Election.findByIdAndUpdate(
    req.params.id,
    { title, description, roles, startDate, endDate },
    { new: true, runValidators: true }
  );
  if (!election) throw new AppError('Election not found.', 404);
  logger.info(`Election updated: ${req.params.id} by ${req.user.email}`);
  res.status(200).json({ status: 'success', data: { election } });
});

/* DELETE — cascades candidates and votes */
export const deleteElection = catchAsync(async (req, res) => {
  const election = await Election.findById(req.params.id);
  if (!election) throw new AppError('Election not found.', 404);

  await Promise.all([
    Candidate.deleteMany({ election: election._id }),
    Vote.deleteMany({ election: election._id }),
    election.deleteOne(),
  ]);
  logger.info(`Election deleted: "${election.title}" by ${req.user.email}`);
  res.status(200).json({ status: 'success', message: 'Election and all related data deleted.' });
});

/* TOGGLE isActive */
export const toggleElectionStatus = catchAsync(async (req, res) => {
  const election = await Election.findById(req.params.id);
  if (!election) throw new AppError('Election not found.', 404);
  election.isActive = !election.isActive;
  await election.save();
  logger.info(`Election "${election.title}" is now ${election.isActive ? 'active' : 'inactive'}`);
  res.status(200).json({
    status: 'success',
    message: `Election is now ${election.isActive ? 'active' : 'inactive'}.`,
    data: { isActive: election.isActive },
  });
});

/* STATS — admin dashboard */
export const getElectionStats = catchAsync(async (req, res) => {
  const election = await Election.findById(req.params.id);
  if (!election) throw new AppError('Election not found.', 404);

  const [candidates, totalVotes] = await Promise.all([
    Candidate.find({ election: req.params.id }).sort({ voteCount: -1 }),
    Vote.countDocuments({ election: req.params.id }),
  ]);

  res.status(200).json({
    status: 'success',
    data: { election, candidates, totalVotes, totalCandidates: candidates.length },
  });
});
