

import mongoose from 'mongoose';

const voteSchema = new mongoose.Schema(
  {
    voter: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User', required: true,
    },
    election: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Election', required: true,
    },
    candidate: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Candidate', required: true,
    },
  
    
    role: {
      type: String, required: true, trim: true,
    },
    ip: { type: String, select: false }, // audit trail
  },
  { timestamps: true }
);

// One vote per voter per role per election
voteSchema.index({ voter: 1, election: 1, role: 1 }, { unique: true });
voteSchema.index({ election: 1, candidate: 1 });

export default mongoose.model('Vote', voteSchema);




