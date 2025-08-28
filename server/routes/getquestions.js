import express from 'express';
import Group from '../models/Group.js';
import fs from 'fs';

const router = express.Router();

// Load all question sets from file
const questions = JSON.parse(fs.readFileSync('./utils/questions.json', 'utf-8'));

// GET /api/getquestions?groupId=xxxx
router.get('/getquestions', async (req, res) => {
  try {
    const { groupId } = req.query;
    console.log('[getquestions] Incoming request:', req.method, req.originalUrl);
    if (!groupId) {
      console.log('[getquestions] Missing groupId');
      return res.status(400).json({ message: 'Missing groupId' });
    }
    console.log('[getquestions] Looking up groupId:', groupId);
    const group = await Group.findById(groupId);
    if (!group) {
      console.log('[getquestions] Group not found for id:', groupId);
      return res.status(404).json({ message: 'Group not found' });
    }
    const questionSetIndex = group.questionSetIndex || 0;
    console.log('[getquestions] Found group:', group.name, 'questionSetIndex:', questionSetIndex);
    const questionSet = questions[questionSetIndex] || [];
    console.log('[getquestions] Returning questionSet:', questionSet.length, 'questions');
    return res.json({ questions: questionSet });
  } catch (error) {
    console.error('[getquestions] Error fetching questions:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
});

export default router;
