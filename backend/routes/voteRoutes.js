
import express from 'express';
import {
  castVote,
  getResults,
  hasVoted,
  getMyVotes
} from '../controllers/voteController.js';

import { protect } from '../middleware/authMiddleware.js';
import { validateCastVote, validateMongoId } from '../validators/index.js';
import { validate } from '../middleware/authMiddleware.js';

const router = express.Router();

// 🔒 Protect all routes
router.use(protect);

// 🚫 Disable cache middleware (IMPORTANT FIX)
const noCache = (req, res, next) => {
  res.set({
    'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate',
    'Pragma': 'no-cache',
    'Expires': '0',
    'Surrogate-Control': 'no-store'
  });
  next();
};

// ── CAST VOTE ────────────────────────────────────────────────
router.post(
  '/',
  noCache,                // 🔥 prevent caching
  validateCastVote,
  validate,
  castVote
);

// ── GET RESULTS ──────────────────────────────────────────────
router.get(
  '/results/:electionId',
  noCache,
  validateMongoId('electionId'),
  validate,
  getResults
);

// ── CHECK IF USER VOTED ──────────────────────────────────────
router.get(
  '/check',
  noCache,                // 🔥 CRITICAL FIX (prevents 304 cache issue)
  hasVoted
);

// ── GET MY VOTES ─────────────────────────────────────────────
router.get(
  '/my/:electionId',
  noCache,
  validateMongoId('electionId'),
  validate,
  getMyVotes
);

export default router;
