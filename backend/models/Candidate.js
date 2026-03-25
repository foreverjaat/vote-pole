
import mongoose from 'mongoose';

const candidateSchema = new mongoose.Schema(
  {
    name: {
      type: String, required: [true, 'Name is required'],
      trim: true, maxlength: 80,
    },
    manifesto: {
      type: String, required: [true, 'Manifesto is required'],
      trim: true, maxlength: 2000,
    },
    motto: { type: String, trim: true, maxlength: 200 },
    // Cloudinary photo: { url, publicId }
    photo: {
      url:      { type: String, default: '' },
      publicId: { type: String, default: '' },
    },
    // role is a plain string matching one of election.roles[].name
    role: {
      type: String, required: [true, 'Role is required'], trim: true,
    },
    election: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Election', required: true,
    },
    voteCount: { type: Number, default: 0, min: 0 },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  },
  { timestamps: true }
);

candidateSchema.index({ election: 1, role: 1 });

export default mongoose.model('Candidate', candidateSchema);


