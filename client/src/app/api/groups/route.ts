import { NextResponse } from "next/server";
import connectDB from "@/lib/db";
import Group from "@/modals/Group";
import Participant from "@/modals/Participant";
import Answer from "@/modals/Answer";
import { nanoid } from "nanoid";
import questions from "@/lib/questions";

// POST: Handles player and proctor login
export async function POST(req: Request) {
    try {
        await connectDB();
        const { name, code } = await req.json();

        if (!name || !code) {
            return NextResponse.json({ message: "Name and code are required." }, { status: 400 });
        }

        const group = await Group.findOne({ code: code.toUpperCase() }).populate('participants');
        if (!group) {
            return NextResponse.json({ message: "Invalid group code." }, { status: 404 });
        }
        
        const isProctor = name.trim().toUpperCase() === 'PROCTOR';

        // Check if a participant with the same name is already in the group (for re-login)
        let participant = (group.participants as any[]).find(p => p.name.toLowerCase() === name.trim().toLowerCase());
console.log("participants  are :",participant);
        if (participant) {
             return NextResponse.json({
                participantId: participant._id,
                name: participant.name,
                isProctor: participant.isProctor,
                group: { id: group._id, name: group.name, questionSetIndex: group.questionSetIndex, code: group.code }
            });
        }

        if (group.roundStarted && !isProctor) {
            return NextResponse.json({ message: "This round has already started." }, { status: 403 });
        }
        
        // Check participant limits - allow up to 5 participants + 1 proctor
        const currentParticipants = group.participants.length;
        const currentProctors = (group.participants as any[]).filter(p => p.isProctor).length;

        if (isProctor) {
            if (currentProctors >= 1) {
                return NextResponse.json({ message: "This group already has a proctor." }, { status: 403 });
            }
        } else {
            if (currentParticipants >= 5) {
                return NextResponse.json({ message: "This group is full (5 participants maximum)." }, { status: 403 });
            }
        }

        const sessionId = nanoid();
        participant = await new Participant({ name, isProctor, sessionId, totalScore: 0, groupId: group._id }).save();

        // Atomically push participant to group
        const updatedGroup = await Group.findByIdAndUpdate(
            group._id,
            { $push: { participants: participant._id } },
            { new: true }
        );
        if (!updatedGroup) {
            return NextResponse.json({ message: "Group not found after participant creation." }, { status: 404 });
        }

        return NextResponse.json({
            participantId: participant._id,
            name: participant.name,
            isProctor,
            group: { id: updatedGroup._id, name: updatedGroup.name, questionSetIndex: updatedGroup.questionSetIndex, code: updatedGroup.code }
        });

    } catch (error) {
        console.error("Login API Error:", error);
        return NextResponse.json({ message: "An internal server error occurred." }, { status: 500 });
    }
}

// GET: Sets up the 25 groups for the competition
// GET: Fetch existing groups (no reset)
export async function GET() {
    try {
        await connectDB();
        const groups = await Group.find({}).select('name code questionSetIndex roundStarted');
        const groupCodes = groups.map(group => ({
            groupName: group.name,
            code: group.code,
            questionSetIndex: group.questionSetIndex,
            roundStarted: group.roundStarted
        }));
        return NextResponse.json({ groupCodes });
    } catch (error) {
        console.error("Fetch groups error:", error);
        return NextResponse.json({ message: "An internal server error occurred." }, { status: 500 });
    }
}