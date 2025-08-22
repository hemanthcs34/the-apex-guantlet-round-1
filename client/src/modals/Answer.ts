import mongoose, { Schema, models, Document } from "mongoose";

export interface IAnswer extends Document {
    groupId: mongoose.Types.ObjectId;
    participantId: mongoose.Types.ObjectId;
    questionIndex: number;
    pointsAwarded: number;
    timeTaken: number;
}

const AnswerSchema = new Schema({
    groupId: { type: Schema.Types.ObjectId, ref: 'Group', required: true },
    participantId: { type: Schema.Types.ObjectId, ref: 'Participant', required: true },
    questionIndex: { type: Number, required: true },
    pointsAwarded: { type: Number, default: 0 },
    timeTaken: { type: Number, required: true },
});

export default mongoose.models.Answer || mongoose.model("Answer", AnswerSchema);