import { NextResponse } from "next/server";
import connectDB from "@/lib/db";
import Group from "@/modals/Group";
import Participant from "@/modals/Participant";
import Answer from "@/modals/Answer";

// GET: Retrieve global leaderboard with all participants from all groups
export async function GET() {
  try {
    await connectDB();
    
    // Get all participants with their scores, sorted by total score
   
    console.log("participants are ",Participant);
    const allParticipants = await Participant.find({})
      .sort({ totalScore: -1 })
      .select('name totalScore isProctor groupId createdAt');
console.log("participants: ",allParticipants);
    // Get all groups for reference
    const allGroups = await Group.find({}).select('name code questionSetIndex roundStarted participants ');
console.log("groups are:",allGroups);
    // Separate proctors and regular participants
    const proctors = allParticipants.filter(p => p.isProctor);
    const regularParticipants = allParticipants.filter(p => !p.isProctor);

    // Group participants by their group
    const participantsByGroup: { [key: string]: {
      groupName: string;
      groupCode: string;
      questionSetIndex: number;
      roundStarted: boolean;
      participants: Array<{
      name: string;
      totalScore: number;
      participantId: any;
      createdAt: Date;
      }>;
    }} = {};

    allGroups.forEach(group => {
      participantsByGroup[group._id.toString()] = {
      groupName: group.name,
      groupCode: group.code,
      questionSetIndex: group.questionSetIndex,
      roundStarted: group.roundStarted,
      participants: []
      };
    });

    // Populate participants in their respective groups
    regularParticipants.forEach(participant => {
      const groupId = participant.groupId?.toString();
      if (groupId && participantsByGroup[groupId]) {
        participantsByGroup[groupId].participants.push({
          name: participant.name,
          totalScore: participant.totalScore || 0,
          participantId: participant._id,
          createdAt: participant.createdAt
        });
      }
    });
    console.log("regular participants are:", regularParticipants);
    console.log("participants by group:", participantsByGroup);

    // Calculate global statistics
    const totalParticipants = regularParticipants.length;
    const totalProctors = proctors.length;
    const totalGroups = allGroups.length;
    const activeGroups = allGroups.filter(g => g.roundStarted).length;
    const totalScore = regularParticipants.reduce((sum, p) => sum + (p.totalScore || 0), 0);
    const averageScore = totalParticipants > 0 ? (totalScore / totalParticipants).toFixed(2) : 0;

    // Top performers across all groups
    const topPerformers = regularParticipants.slice(0, 10);

    return NextResponse.json({
      globalStats: {
        totalParticipants,
        totalProctors,
        totalGroups,
        activeGroups,
        totalScore,
        averageScore
      },
      topPerformers: topPerformers.map((p, index) => ({
        rank: index + 1,
        name: p.name,
        totalScore: p.totalScore || 0,
        groupId: p.groupId
      })),
      groupsOverview: Object.values(participantsByGroup).map(group => ({
        ...group,
        participantCount: group.participants.length,
        groupTotalScore: group.participants.reduce((sum, p) => sum + p.totalScore, 0),
        groupAverageScore: group.participants.length > 0 
          ? (group.participants.reduce((sum, p) => sum + p.totalScore, 0) / group.participants.length).toFixed(2)
          : 0
      })),
      participantsByGroup,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error("Global leaderboard error:", error);
    return NextResponse.json(
      { message: "An internal server error occurred." },
      { status: 500 }
    );
  }
}

// POST: Store or update participant scores (called when games complete)
export async function POST(req: Request) {
  try {
    await connectDB();
    const { groupId, participantId, score, action } = await req.json();

    if (action === 'updateScore') {
      // Update participant score
      const participant = await Participant.findById(participantId);
      if (participant) {
        participant.totalScore = score;
        await participant.save();
      }
    } else if (action === 'resetScores') {
      // Reset all scores (for new tournament round)
      await Participant.updateMany({}, { totalScore: 0 });
      await Participant.deleteMany({});
      await Answer.deleteMany({});
      await Group.updateMany({}, { roundStarted: false, currentQuestionIndex: 0 });
    }

    return NextResponse.json({ message: "Score updated successfully" });
  } catch (error) {
    console.error("Score update error:", error);
    return NextResponse.json(
      { message: "An internal server error occurred." },
      { status: 500 }
    );
  }
}
