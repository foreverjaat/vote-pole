import express from 'express';
import {
  createCandidate, getCandidatesByElection, updateCandidate, deleteCandidate,
} from '../controllers/candidateController.js';
import { protect, adminOnly, validate } from '../middleware/authMiddleware.js';
import { validateMongoId } from '../validators/index.js';

const router = express.Router();

router.use(protect);

//router.get('/:electionId', validateMongoId('electionId'), validate, getCandidatesByElection);
//  FIXED
router.get('/', getCandidatesByElection);
router.post('/',           adminOnly, createCandidate);
router.put('/:id',         adminOnly, validateMongoId('id'), validate, updateCandidate);
router.delete('/:id',      adminOnly, validateMongoId('id'), validate, deleteCandidate);

export default router;
