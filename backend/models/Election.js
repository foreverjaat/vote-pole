import mongoose from 'mongoose';

const roleSchema = new mongoose.Schema(
  { name: { type: String, required: true, trim: true } },
  { _id: false }
);

const electionSchema = new mongoose.Schema(
  {
    title: {
      type: String, required: [true, 'Title is required'],
      trim: true, maxlength: 120,
    },
    description: { type: String, trim: true, maxlength: 1000 },
    // Roles are like "President", "Vice President" — strings, not ObjectIds
    roles: {
      type: [roleSchema],
      validate: { validator: (arr) => arr.length > 0, message: 'At least one role is required' },
    },
    startDate: { type: Date, required: [true, 'Start date is required'] },
    endDate:   { type: Date, required: [true, 'End date is required'] },
    isActive:  { type: Boolean, default: false },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  },
  { timestamps: true }
);

// Virtual status: computed from isActive + dates
electionSchema.virtual('status').get(function () {
  const now = new Date();
  if (!this.isActive) return 'inactive';
  if (now < this.startDate) return 'upcoming';
  if (now > this.endDate)   return 'ended';
  return 'live';
});

electionSchema.set('toJSON',   { virtuals: true });
electionSchema.set('toObject', { virtuals: true });
electionSchema.index({ isActive: 1, startDate: 1, endDate: 1 });

export default mongoose.model('Election', electionSchema);
