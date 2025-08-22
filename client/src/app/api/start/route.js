import { NextResponse } from "next/server";
import connectDB from "@/lib/db";
import Player from "@/modals/player";

export async function POST(req) {
  await connectDB();
  const { name } = await req.json();

  if (!name) {
    return NextResponse.json({ message: "Name is required" }, { status: 400 });
  }

  let player = await Player.findOne({ name });
  if (!player) {
    player = await Player.create({ name });
  }

  return NextResponse.json({ playerId: player._id });
}