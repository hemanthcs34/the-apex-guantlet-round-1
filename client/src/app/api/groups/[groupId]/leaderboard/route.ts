import { NextResponse } from "next/server";
import connectDB from "@/lib/db";
import Group from "@/modals/Group";
import Participant from "@/modals/Participant";

export async function GET(
  request: Request,
  { params }: { params: { groupId: string } }
) {
  try {
    await connectDB();
    const { groupId } = params;

    const group = await Group.findById(groupId);
    console.log("we found group",group);
    if (!group) {
      return NextResponse.json({ message: "Group not found." }, { status: 404 });
    }

    // Get all participants for this group, sorted by score
    const participants = await Participant.find({
      _id: { $in: group.participants }
    }).sort({ totalScore: -1 });

    // Separate proctors and regular participants
    const proctors = participants.filter(p => p.isProctor);
    const regularParticipants = participants.filter(p => !p.isProctor);
    
    // Only participants with points > 0 can advance
    const qualifiedParticipants = regularParticipants.filter(p => p.totalScore > 0);
    
    // Determine how many can advance based on qualified participants
    let advancingCount = 0;
    if (qualifiedParticipants.length >= 2) {
      advancingCount = 2;
    } else if (qualifiedParticipants.length === 1) {
      advancingCount = 1;
    }

    const topAdvancing = qualifiedParticipants.slice(0, advancingCount);
    const remainingParticipants = regularParticipants.slice(advancingCount);

    return NextResponse.json({
      groupName: group.name,
      groupCode: group.code,
      proctors,
      topAdvancing,
      remainingParticipants,
      totalParticipants: regularParticipants.length,
      qualifiedParticipants: qualifiedParticipants.length,
      advancingToNextRound: topAdvancing.map(p => p.name),
      advancementRules: {
        message: qualifiedParticipants.length === 0 ? "No participants qualified (all have 0 points)" :
                 qualifiedParticipants.length === 1 ? "Only 1 participant qualified - 1 advances" :
                 "2+ participants qualified - 2 advance",
        qualifiedCount: qualifiedParticipants.length,
        advancingCount: advancingCount
      }
    });
  } catch (error) {
    console.error("Leaderboard error:", error);
    return NextResponse.json(
      { message: "An internal server error occurred." },
      { status: 500 }
    );
  }
}
