import { NextResponse } from "next/server";
import connectDB from "@/lib/db";
import Player from "@/modals/player";
import Participant from "@/modals/Participant";
export const dynamic = 'force-dynamic';

export async function GET() {
  await connectDB();
  // Get all participants with their totalScore
  const allParticipants = await Participant.find({})
    .sort({ totalScore: -1 })
    .select('name totalScore isProctor groupId createdAt');

  // Get all players
  const players = await Player.find();

  // Map player scores from matching participant's totalScore
  const playersWithUpdatedScore = players.map(player => {
    // Find matching participant by name (or use another unique field if needed)
    const matchingParticipant = allParticipants.find(p => p.name === player.name);
    return {
      ...player.toObject(),
      score: matchingParticipant ? matchingParticipant.totalScore : player.score
    };
  });

  // Sort by score descending
  playersWithUpdatedScore.sort((a, b) => (b.score || 0) - (a.score || 0));

  console.log("Players with updated score:", playersWithUpdatedScore);
  return NextResponse.json(playersWithUpdatedScore);
}
