import mongoose, { Schema, models } from "mongoose";

const PlayerSchema = new Schema({
  name: { type: String, required: true, unique: true },
  score: { type: Number, default: 0 },
  completedGames: { type: [String], default: [] },
  bonusAnswer: { type: String, default: "" },
  createdAt: { type: Date, default: Date.now }
});

const Player = models.Player || mongoose.model("Player", PlayerSchema);
export default Player;