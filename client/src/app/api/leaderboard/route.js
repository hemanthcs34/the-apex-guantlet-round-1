import { NextResponse } from "next/server";
import connectDB from "@/lib/db";
import Player from "@/modals/player";

export const dynamic = 'force-dynamic';

export async function GET() {
  await connectDB();
  const players = await Player.find().sort({ score: -1 });
  return NextResponse.json(players);
}