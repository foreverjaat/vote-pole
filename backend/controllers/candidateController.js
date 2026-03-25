/*
import Candidate from '../models/Candidate.js';
import Election from '../models/Election.js';
import { AppError, catchAsync } from '../utils/appError.js';
import { deleteCloudinaryImage, uploadCandidatePhoto } from '../config/cloudinary.js';
import logger from '../utils/logger.js';

const runUpload = (req, res) =>
  new Promise((resolve, reject) => {
    uploadCandidatePhoto(req, res, (err) => {
      if (err) reject(new AppError(err.message, 400));
      else resolve();
    });
  });

/* CREATE — admin only, multipart/form-data *
export const createCandidate = catchAsync(async (req, res) => {
  await runUpload(req, res);

  let { name, manifesto, motto, role, election: electionId } = req.body;

  //  Normalize role (MAIN FIX)
  if (role) role = role.trim().toLowerCase();

  if (!name || !manifesto || !role || !electionId) {
    if (req.file?.filename) await deleteCloudinaryImage(req.file.filename);
    throw new AppError('name, manifesto, role and election are required.', 400);
  }

  const election = await Election.findById(electionId);
  if (!election) {
    if (req.file?.filename) await deleteCloudinaryImage(req.file.filename);
    throw new AppError('Election not found.', 404);
  }

  //  Validate role belongs to this election (normalized comparison)
  const validRole = election.roles.some(
    (r) => r.name.trim().toLowerCase() === role
  );

  if (!validRole) {
    if (req.file?.filename) await deleteCloudinaryImage(req.file.filename);
    throw new AppError(
      `Role "${role}" is not in this election. Valid roles: ${election.roles
        .map((r) => r.name)
        .join(', ')}.`,
      400
    );
  }

  const photo = req.file
    ? { url: req.file.path, publicId: req.file.filename }
    : { url: '', publicId: '' };

  const candidate = await Candidate.create({
    name,
    manifesto,
    motto: motto || '',
    photo,
    role, //  normalized role stored
    election: electionId,
    createdBy: req.user._id,
  });

  logger.info(`Candidate "${name}" created for election "${election.title}"`);

  res.status(201).json({
    status: 'success',
    data: { candidate },
  });
});

/* GET all candidates for an election *
export const getCandidatesByElection = catchAsync(async (req, res) => {
  const candidates = await Candidate.find({ election: req.params.electionId })
    .sort({ role: 1, voteCount: -1 });

  res.status(200).json({
    status: 'success',
    results: candidates.length,
    data: { candidates },
  });
});*

// after fixeing candidate 
export const getCandidatesByElection = catchAsync(async (req, res) => {
  const { electionId } = req.query;

  if (!electionId) {
    throw new AppError('Election ID is required', 400);
  }

  const candidates = await Candidate.find({ election: electionId })
    .sort({ role: 1, voteCount: -1 });

  res.status(200).json({
    status: 'success',
    results: candidates.length,
    data: { candidates },
  });
});


/* UPDATE 
export const updateCandidate = catchAsync(async (req, res) => {
  await runUpload(req, res);

  const candidate = await Candidate.findById(req.params.id);
  if (!candidate) {
    if (req.file?.filename) await deleteCloudinaryImage(req.file.filename);
    throw new AppError('Candidate not found.', 404);
  }

  let { name, manifesto, motto, role } = req.body;

  if (name) candidate.name = name;
  if (manifesto) candidate.manifesto = manifesto;
  if (motto !== undefined) candidate.motto = motto;

  //  Normalize role on update
  if (role) candidate.role = role.trim().toLowerCase();

  if (req.file) {
    await deleteCloudinaryImage(candidate.photo.publicId);
    candidate.photo = { url: req.file.path, publicId: req.file.filename };
  }

  await candidate.save();

  logger.info(`Candidate "${candidate.name}" updated by ${req.user.email}`);

  res.status(200).json({
    status: 'success',
    data: { candidate },
  });
});

/* DELETE 
export const deleteCandidate = catchAsync(async (req, res) => {
  const candidate = await Candidate.findById(req.params.id);
  if (!candidate) throw new AppError('Candidate not found.', 404);

  await deleteCloudinaryImage(candidate.photo?.publicId);
  await candidate.deleteOne();

  logger.info(`Candidate "${candidate.name}" deleted by ${req.user.email}`);

  res.status(200).json({
    status: 'success',
    message: 'Candidate deleted.',
  });
});
*/

// after fixed 
import Candidate from '../models/Candidate.js';
import Election from '../models/Election.js';
import { AppError, catchAsync } from '../utils/appError.js';
import { deleteCloudinaryImage, uploadCandidatePhoto } from '../config/cloudinary.js';
import logger from '../utils/logger.js';

const runUpload = (req, res) =>
  new Promise((resolve, reject) => {
    uploadCandidatePhoto(req, res, (err) => {
      if (err) reject(new AppError(err.message, 400));
      else resolve();
    });
  });

/* CREATE — admin only */
export const createCandidate = catchAsync(async (req, res) => {
  await runUpload(req, res);

  let { name, manifesto, motto, role, election: electionId } = req.body;

  if (role) role = role.trim().toLowerCase();

  if (!name || !manifesto || !role || !electionId) {
    if (req.file?.filename) await deleteCloudinaryImage(req.file.filename);
    throw new AppError('name, manifesto, role and election are required.', 400);
  }

  const election = await Election.findById(electionId);
  if (!election) {
    if (req.file?.filename) await deleteCloudinaryImage(req.file.filename);
    throw new AppError('Election not found.', 404);
  }

  const validRole = election.roles.some(
    (r) => r.name.trim().toLowerCase() === role
  );

  if (!validRole) {
    if (req.file?.filename) await deleteCloudinaryImage(req.file.filename);
    throw new AppError(
      `Role "${role}" is not in this election.`,
      400
    );
  }

  const photo = req.file
    ? { url: req.file.path, publicId: req.file.filename }
    : { url: '', publicId: '' };

  const candidate = await Candidate.create({
    name,
    manifesto,
    motto: motto || '',
    photo,
    role,
    election: electionId,
    createdBy: req.user._id,
  });

  logger.info(`Candidate "${name}" created`);

  res.status(201).json({
    status: 'success',
    data: { candidate },
  });
});

/* GET candidates (PUBLIC ✅) */
export const getCandidatesByElection = catchAsync(async (req, res) => {
  const { electionId } = req.query;

  if (!electionId) {
    throw new AppError('Election ID is required', 400);
  }

  const candidates = await Candidate.find({ election: electionId })
    .sort({ role: 1, voteCount: -1 });

  res.status(200).json({
    status: 'success',
    results: candidates.length,
    data: { candidates },
  });
});

/* UPDATE */
export const updateCandidate = catchAsync(async (req, res) => {
  await runUpload(req, res);

  const candidate = await Candidate.findById(req.params.id);
  if (!candidate) {
    if (req.file?.filename) await deleteCloudinaryImage(req.file.filename);
    throw new AppError('Candidate not found.', 404);
  }

  let { name, manifesto, motto, role } = req.body;

  if (name) candidate.name = name;
  if (manifesto) candidate.manifesto = manifesto;
  if (motto !== undefined) candidate.motto = motto;
  if (role) candidate.role = role.trim().toLowerCase();

  if (req.file) {
    await deleteCloudinaryImage(candidate.photo.publicId);
    candidate.photo = { url: req.file.path, publicId: req.file.filename };
  }

  await candidate.save();

  logger.info(`Candidate "${candidate.name}" updated`);

  res.status(200).json({
    status: 'success',
    data: { candidate },
  });
});

/* DELETE */
export const deleteCandidate = catchAsync(async (req, res) => {
  const candidate = await Candidate.findById(req.params.id);
  if (!candidate) throw new AppError('Candidate not found.', 404);

  await deleteCloudinaryImage(candidate.photo?.publicId);
  await candidate.deleteOne();

  logger.info(`Candidate "${candidate.name}" deleted`);

  res.status(200).json({
    status: 'success',
    message: 'Candidate deleted.',
  });
});
