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

    const group = await Group.findById(groupId).populate('participants');
    if (!group) {
      return NextResponse.json({ message: "Group not found." }, { status: 404 });
    }

    // Get detailed participant information
    const participants = await Participant.find({
      _id: { $in: group.participants }
    }).sort({ totalScore: -1 });

    return NextResponse.json({ participants });
  } catch (error) {
    console.error("Fetch participants error:", error);
    return NextResponse.json(
      { message: "An internal server error occurred." },
      { status: 500 }
    );
  }
}
