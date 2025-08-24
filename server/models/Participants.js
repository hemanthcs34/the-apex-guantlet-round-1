import mongoose from 'mongoose';

const ParticipantSchema = new mongoose.Schema({
  name: { type: String, required: true },
  isProctor: { type: Boolean, default: false },
  totalScore: { type: Number, default: 0 },
  sessionId: { type: String, required: true, unique: true },
  groupId: { type: mongoose.Schema.Types.ObjectId, ref: 'Group' },
});

export default mongoose.models.Participant || mongoose.model("Participant", ParticipantSchema);