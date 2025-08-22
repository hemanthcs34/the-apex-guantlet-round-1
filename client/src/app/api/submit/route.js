import { NextResponse } from "next/server";
import connectDB from "@/lib/db";
import Player from "@/modals/player";
import { calculateScore } from "@/lib/scoring";

const gamePositions = new Map();

export async function POST(req) {
  await connectDB();
  const { playerId, correct, gameName } = await req.json();

  const player = await Player.findById(playerId);
  if (!player) {
    return NextResponse.json({ error: "Player not found" }, { status: 404 });
  }

  if (player.completedGames.includes(gameName)) {
    return NextResponse.json({ success: true, message: "Game already completed." });
  }

  if (correct) {
    const currentPosition = (gamePositions.get(gameName) || 0) + 1;
    gamePositions.set(gameName, currentPosition);
    player.score += calculateScore(currentPosition, false);
  }

  player.completedGames.push(gameName);
  await player.save();

  return NextResponse.json({ success: true, newScore: player.score });
}