import mongoose from 'mongoose';

const GroupSchema = new mongoose.Schema({
  name: { type: String, required: true },
  code: { type: String, required: true, unique: true },
  roundStarted: { type: Boolean, default: false },
  currentQuestionIndex: { type: Number, default: 0 },
  questionSetIndex: { type: Number, required: true },
  participants: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Participant' }],
});

export default mongoose.models.Group || mongoose.model("Group", GroupSchema);