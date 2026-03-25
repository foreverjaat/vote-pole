import express from 'express';
import {
  createElection, getElections, getElectionById,
  updateElection, deleteElection, toggleElectionStatus, getElectionStats,
} from '../controllers/electionController.js';
import { protect, adminOnly, validate } from '../middleware/authMiddleware.js';
import { validateCreateElection, validateMongoId } from '../validators/index.js';

const router = express.Router();

router.use(protect);

router.get('/',    getElections);
router.get('/:id', validateMongoId('id'), validate, getElectionById);

router.post('/',            adminOnly, validateCreateElection, validate, createElection);
router.put('/:id',          adminOnly, validateMongoId('id'),  validate, updateElection);
router.delete('/:id',       adminOnly, validateMongoId('id'),  validate, deleteElection);
router.patch('/:id/toggle', adminOnly, validateMongoId('id'),  validate, toggleElectionStatus);
router.get('/:id/stats',    adminOnly, validateMongoId('id'),  validate, getElectionStats);

export default router;
