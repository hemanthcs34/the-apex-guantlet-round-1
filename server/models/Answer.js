import mongoose from 'mongoose';

const AnswerSchema = new mongoose.Schema({
  groupId: { type: mongoose.Schema.Types.ObjectId, ref: 'Group', required: true },
  participantId: { type: mongoose.Schema.Types.ObjectId, ref: 'Participant', required: true },
  questionIndex: { type: Number, required: true },
  pointsAwarded: { type: Number, default: 0 },
  timeTaken: { type: Number, required: true },
  sessionId: { type: String, required: true }
});

export default mongoose.models.Answer || mongoose.model("Answer", AnswerSchema);