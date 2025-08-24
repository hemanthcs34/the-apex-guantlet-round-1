import http from 'http';
import { Server } from 'socket.io';
import express from 'express';
import cors from 'cors';
import mongoose from 'mongoose';
import fs from 'fs';
import 'dotenv/config';

import Group from './models/Group.js';
import Participant from './models/Participants.js';
import Answer from './models/Answer.js';

const app = express();
app.use(cors({
  origin: [
    'http://localhost:3000',
    'https://client-theta-two-51.vercel.app',
    'https://the-apex-guantlet-round-1.onrender.com' // if needed
  ],
  credentials: true
}));
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: [
      'http://localhost:3000',
   'https://client-theta-two-51.vercel.app',
      'https://the-apex-guantlet-round-1.onrender.com' // if needed
    ],
    methods: ['GET', 'POST'],
    credentials: true
  }
});

mongoose.connect(process.env.MONGODB_URI).then(() => console.log("Socket.IO server connected to MongoDB."));

const questions = JSON.parse(fs.readFileSync('./utils/questions.json', 'utf-8'));

// Helper function to normalize answers for comparison
function normalizeAnswer(answer) {
  if (!answer) return '';
  return answer.trim().toLowerCase().replace(/\s+/g, ' ');
}

// Helper function to check if answer is correct
function isAnswerCorrect(userAnswer, correctAnswer) {
  const normalizedUser = normalizeAnswer(userAnswer);
  const normalizedCorrect = normalizeAnswer(correctAnswer);
  
  // Exact match
  if (normalizedUser === normalizedCorrect) return true;
  
  // Check if user answer contains the correct answer (for partial matches)
  if (normalizedCorrect.includes(normalizedUser) || normalizedUser.includes(normalizedCorrect)) {
    // Only allow if the difference is minimal (e.g., extra words)
    const userWords = normalizedUser.split(' ');
    const correctWords = normalizedCorrect.split(' ');
    
    // If user answer is significantly longer, it might be a sentence
    if (userWords.length > correctWords.length + 2) return false;
    
    // Check if all correct words are present in user answer
    return correctWords.every(word => normalizedUser.includes(word));
  }
  
  return false;
}

io.on('connection', (socket) => {
  console.log(`User connected: ${socket.id}`);

  socket.on('joinGroup', async (groupId) => {
    socket.join(groupId);
    const group = await Group.findById(groupId).populate({ path: 'participants', options: { sort: { totalScore: -1 } } });
    if (group) {
      // Update participant's groupId if they don't have one
      const participantId = socket.participantId; // This should be set when they join
      if (participantId) {
        await Participant.findByIdAndUpdate(participantId, { groupId: groupId });
      }
      
      io.to(groupId).emit('lobbyUpdate', group.participants);
      // If a round is already in progress, immediately sync this socket with current question
      if (group.roundStarted) {
        io.to(socket.id).emit('newQuestion', { index: group.currentQuestionIndex || 0, question: questions[group.questionSetIndex]?.[group.currentQuestionIndex] });
      }
    }
  });

  // Allow any client to request the current question safely (useful for resync)
  socket.on('getCurrentQuestion', async ({ groupId }) => {
    try {
      const group = await Group.findById(groupId);
      if (!group || !group.roundStarted) return;
      const questionSet = questions[group.questionSetIndex] || [];
      const qIndex = group.currentQuestionIndex || 0;
      const q = questionSet[qIndex];
      if (!q) return;
      io.to(socket.id).emit('newQuestion', { index: qIndex, question: q });
    } catch (e) {
      // swallow
    }
  });

  socket.on('startRound', async ({ groupId, participantId }) => {
    const proctor = await Participant.findById(participantId);
    if (!proctor?.isProctor) return;

    const group = await Group.findById(groupId);
    if (group) {
      group.roundStarted = true;
      group.currentQuestionIndex = 0; // Start from first question
      await group.save();
      io.to(groupId).emit('roundStarted');
      
      // Send first question immediately
      const questionSet = questions[group.questionSetIndex] || [];
      if (questionSet.length > 0) {
        io.to(groupId).emit('newQuestion', { index: 0, question: questionSet[0] });
      }
    }
  });

  socket.on('nextQuestion', async ({ groupId, participantId, questionIndex }) => {
    const proctor = await Participant.findById(participantId);
    if (!proctor?.isProctor) return;
    
    const group = await Group.findById(groupId);
    const questionSet = questions[group.questionSetIndex];
    const nextIndex = questionIndex + 1;

    if (group && nextIndex < questionSet.length) {
      group.currentQuestionIndex = nextIndex;
      await group.save();
      io.to(groupId).emit('newQuestion', { index: nextIndex, question: questionSet[nextIndex] });
    } else {
      // Game over - determine winners
      await handleGameCompletion(groupId);
      io.to(groupId).emit('gameOver');
    }
  });

  socket.on('submitAnswer', async ({ groupId, participantId, questionIndex, answer, timeTaken }) => {
    const group = await Group.findById(groupId);
    if (!group) return;

    // Proctors cannot submit answers
    const submitter = await Participant.findById(participantId);
    if (submitter?.isProctor) return;

    // Session control: Only allow one answer per session per question
    const existingAnswer = await Answer.findOne({ participantId, questionIndex, groupId, sessionId: submitter.sessionId });
    if (existingAnswer) return;

    const questionSet = questions[group.questionSetIndex];
    const correctAnswer = questionSet[questionIndex].answer;
    const isCorrect = isAnswerCorrect(answer, correctAnswer);
    let points = 0;

    if (isCorrect) {
      // Rank among already-correct submissions for this question
      const correctCount = await Answer.countDocuments({ groupId, questionIndex, pointsAwarded: { $gt: 0 } });
      const rank = correctCount + 1;
      const pointValues = { 1: 10, 2: 8, 3: 5, 4: 2 };
      points = pointValues[rank] || 0;
    }

    await new Answer({ groupId, participantId, questionIndex, pointsAwarded: points, timeTaken, sessionId: submitter.sessionId }).save();

    const participant = await Participant.findById(participantId);
    if (participant) {
      participant.totalScore += points;
      await participant.save();
    }

    socket.emit('answerResult', { correct: isCorrect, pointsAwarded: points });

    const updatedParticipants = await Participant.find({ _id: { $in: group.participants } }).sort({ totalScore: -1 });
    io.to(groupId).emit('lobbyUpdate', updatedParticipants);
  });

  socket.on('disconnect', () => {
    console.log(`User disconnected: ${socket.id}`);
  });
});

// Handle game completion and determine winners
async function handleGameCompletion(groupId) {
  try {
    const group = await Group.findById(groupId);
    if (!group) return;

    // Get all participants for this group, sorted by score
    const participants = await Participant.find({
      _id: { $in: group.participants }
    }).sort({ totalScore: -1 });

    // Separate proctors and regular participants
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

    console.log(`Group ${group.name} completed. Qualified participants:`, qualifiedParticipants.map(p => `${p.name}(${p.totalScore})`));
    console.log(`Advancing:`, topAdvancing.map(p => p.name));
    
  } catch (error) {
    console.error('Error handling game completion:', error);
  }
}

const PORT = process.env.PORT || 3001;
server.listen(PORT, () => console.log(`Socket.IO server listening on port ${PORT}`));