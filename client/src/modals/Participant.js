import mongoose from 'mongoose';

const participantSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  isProctor: {
    type: Boolean,
    default: false
  },
  sessionId: {
    type: String,
    required: true,
    unique: true
  },
  totalScore: {
    type: Number,
    default: 0
  },
  groupId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Group'
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

export default mongoose.models.Participant || mongoose.model('Participant', participantSchema);