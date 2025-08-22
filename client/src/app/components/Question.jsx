"use client";
import { useState, useEffect } from 'react';
import styles from './Question.module.css';

export default function Question({ userInfo, socket, currentGroup }) {
  const [currentQuestion, setCurrentQuestion] = useState(null);
  const [answer, setAnswer] = useState('');
  const [timeLeft, setTimeLeft] = useState(0);
  const [isAnswered, setIsAnswered] = useState(false);
  const [gameCompleted, setGameCompleted] = useState(false);
  const [finalResults, setFinalResults] = useState(null);
  const [showSolutions, setShowSolutions] = useState(false);
  const isProctor = !!userInfo?.isProctor;
  const [isViewingPhase, setIsViewingPhase] = useState(false);

  useEffect(() => {
    if (socket) {
      socket.on('newQuestion', (payload) => {
        // payload can be number (legacy) or { index, question }
        if (typeof payload === 'number') {
          const questions = getQuestions();
          const idx = payload;
          if (questions && questions[idx]) {
            const q = { ...questions[idx], index: idx };
            setCurrentQuestion(q);
            if (q.category === 'Sequence Recall') {
              setIsViewingPhase(true);
              setTimeLeft(30);
            } else {
              setIsViewingPhase(false);
              setTimeLeft(questions[idx].time_limit);
            }
          }
        } else if (payload && typeof payload.index === 'number' && payload.question) {
          const idx = payload.index;
          const q = payload.question;
          const cq = { ...q, index: idx };
          setCurrentQuestion(cq);
          if (cq.category === 'Sequence Recall') {
            setIsViewingPhase(true);
            setTimeLeft(30);
          } else {
            setIsViewingPhase(false);
            setTimeLeft(cq.time_limit);
          }
        }
        setIsAnswered(false);
        setAnswer('');
        setGameCompleted(false);
      });

      socket.on('answerResult', (result) => {
        setIsAnswered(true);
        // Show result feedback
        if (result.correct) {
          alert(`Correct! +${result.pointsAwarded} points`);
        } else {
          alert('Incorrect answer');
        }
      });

      socket.on('gameOver', () => {
        setGameCompleted(true);
        fetchFinalResults();
      });
    }

    return () => {
      if (socket) {
        socket.off('newQuestion');
        socket.off('answerResult');
        socket.off('gameOver');
      }
    };
  }, [socket]);

  // Ensure we request the current question whenever the component mounts or socket/group changes
  useEffect(() => {
    if (!socket || !currentGroup || !userInfo?.groupId) return;
    socket.emit('getCurrentQuestion', { groupId: userInfo.groupId });
  }, [socket, currentGroup, userInfo?.groupId]);

  useEffect(() => {
    if (timeLeft > 0 && currentQuestion && !gameCompleted) {
      const timer = setInterval(() => {
        setTimeLeft(prev => {
          if (prev <= 1) {
            // Phase end
            if (currentQuestion.category === 'Sequence Recall' && isViewingPhase) {
              // transition to solving phase: 5 minutes
              setIsViewingPhase(false);
              return 300; // start solving timer
            }
            // Time's up - auto-submit empty answer for participants only in solving phase
            if (!isProctor && !isViewingPhase) {
              handleSubmit('');
            }
            return 0;
          }
          return prev - 1;
        });
      }, 1000);

      return () => clearInterval(timer);
    }
  }, [timeLeft, currentQuestion, gameCompleted, isProctor, isViewingPhase]);

  const getQuestions = () => {
    // This should match your questions structure
    return [
      [
        { "category": "Tech Riddle", "question": "I follow you all day but disappear at night. I mimic your every move, yet you never see me. What am I?", "answer": "Shadow", "time_limit": 180 },
        { "category": "Maths Problem", "question": "Three friends book a hotel room for ₹300. Each pays ₹100. Later, the manager realizes the correct cost is ₹250 and sends ₹50 back with the bellboy. The bellboy keeps ₹20 and gives ₹10 to each friend. Now, each friend paid ₹90 (total ₹270). The bellboy has ₹20, making ₹290. Where did the other ₹10 go?", "answer": "The logic is flawed", "time_limit": 300 },
        { "category": "Reasoning Puzzle", "question": "Four friends — Arjun, Priya, Kavya, and Mohan — are sitting around a table. Arjun is sitting directly opposite Priya. Kavya is to Arjun's left. Mohan is not sitting next to Priya. Who is sitting to Priya's right?", "answer": "Mohan", "time_limit": 300 },
        { "category": "Sudoku", "question": "Complete the 4x4 Sudoku Grid: [3, _, 4, _] [_, 1, _, 2] [4, _, 1, _] [_, 3, _, 4]", "answer": "1,2,3,4 in some order in each row, column and 2x2 box", "time_limit": 300 },
        { "category": "Sequence Recall", "question": "Memorize and find the sum of this sequence: 8, 27, 5, 12, 43, 6, 91, 3, 18, 54, 7, 11, 39, 10, 25", "answer": "359", "time_limit": 300 },
        { "category": "Bonus", "question": "Step 1: Find the next prime after 31. (Use this as Key 1). Step 2: Sum the digits of Key 1 to get Key 2. Step 3: Shift the letter 'M' forward by Key 2 positions (A=1). What is the final letter?", "answer": "W", "time_limit": 600 }
      ]
    ][currentGroup?.questionSetIndex || 0] || [];
  };

  const handleSubmit = (submittedAnswer = null) => {
    if (isProctor) return; // proctor cannot answer
    if (isAnswered || !currentQuestion || !socket) return;

    const finalAnswer = submittedAnswer !== null ? submittedAnswer : answer;
    const timeTaken = currentQuestion.time_limit - timeLeft;

    socket.emit('submitAnswer', {
      groupId: userInfo.groupId,
      participantId: userInfo.participantId,
      questionIndex: currentQuestion.index,
      answer: finalAnswer,
      timeTaken
    });

    setIsAnswered(true);
  };

  const fetchFinalResults = async () => {
    try {
      const response = await fetch(`/api/groups/${currentGroup.id}/leaderboard`);
      if (response.ok) {
        const data = await response.json();
        setFinalResults(data);
      }
    } catch (error) {
      console.error('Failed to fetch final results:', error);
    }
  };

  const getAnswerHint = (category) => {
    switch (category) {
      case 'Sudoku':
        return "Enter your answer as comma-separated values. Example: 1,2,3,4 (representing the completed grid row by row)";
      case 'Sequence Recall':
        return "Enter only the final answer, not the sequence itself";
      case 'Maths Problem':
        return "Enter a short, clear answer. Avoid long explanations";
      case 'Reasoning Puzzle':
        return "Enter only the name of the person";
      case 'Tech Riddle':
        return "Enter the answer in one word";
      case 'Bonus':
        return "Enter only the final result";
      default:
        return "Enter your answer in one word or short phrase";
    }
  };

  const getQuestionSolutions = () => {
    const questions = getQuestions();
    return questions.map((q, index) => ({
      ...q,
      index,
      hint: getAnswerHint(q.category)
    }));
  };

  if (gameCompleted) {
    return (
      <div className={styles.container}>
        <div className={styles.gameOver}>
          <h1>🏁 Game Complete!</h1>
          {finalResults ? (
            <div className={styles.results}>
              <h2>Final Results for {finalResults.groupName}</h2>
              
              <div className={styles.advancementRules}>
                <h3>📋 Advancement Rules Applied</h3>
                <p className={styles.rulesMessage}>{finalResults.advancementRules.message}</p>
                <p><strong>Qualified Participants:</strong> {finalResults.qualifiedParticipants}</p>
                <p><strong>Advancing to Next Round:</strong> {finalResults.advancingCount}</p>
              </div>
              
              {finalResults.topAdvancing.length > 0 && (
                <div className={styles.advancingSection}>
                  <h3>🎯 Advancing to Next Round</h3>
                  <ul className={styles.advancingList}>
                    {finalResults.topAdvancing.map((participant, index) => (
                      <li key={participant._id} className={styles.advancingPlayer}>
                        <span className={styles.rank}>#{index + 1}</span>
                        <span className={styles.name}>{participant.name}</span>
                        <span className={styles.score}>{participant.totalScore} pts</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {finalResults.remainingParticipants.length > 0 && (
                <div className={styles.remainingSection}>
                  <h3>📊 Other Participants</h3>
                  <ul className={styles.remainingList}>
                    {finalResults.remainingParticipants.map((participant, index) => (
                      <li key={participant._id} className={styles.remainingPlayer}>
                        <span className={styles.rank}>#{finalResults.topAdvancing.length + index + 1}</span>
                        <span className={styles.name}>{participant.name}</span>
                        <span className={styles.score}>{participant.totalScore} pts</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              <div className={styles.summary}>
                <p><strong>Total Participants:</strong> {finalResults.totalParticipants}</p>
                <p><strong>Advancing:</strong> {finalResults.advancingToNextRound.join(', ') || 'None'}</p>
              </div>

              <div className={styles.solutionsSection}>
                <button
                  onClick={() => setShowSolutions(!showSolutions)}
                  className={styles.solutionsButton}
                >
                  {showSolutions ? 'Hide Solutions' : 'See All Answers & Solutions'}
                </button>
                
                {showSolutions && (
                  <div className={styles.solutionsList}>
                    <h3>📚 All Questions & Solutions</h3>
                    {getQuestionSolutions().map((question, index) => (
                      <div key={index} className={styles.solutionItem}>
                        <h4>Question {index + 1}: {question.category}</h4>
                        <p className={styles.questionText}>{question.question}</p>
                        <div className={styles.answerInfo}>
                          <p><strong>Answer:</strong> {question.answer}</p>
                          <p><strong>Hint:</strong> {question.hint}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          ) : (
            <p>Loading final results...</p>
          )}
        </div>
      </div>
    );
  }

  if (!currentQuestion) {
    return (
      <div className={styles.container}>
        <h2>{isProctor ? 'Waiting to start or load a question...' : 'Waiting for question...'}</h2>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h2>{currentQuestion.category}</h2>
        <div className={styles.timer}>
          Time: {Math.floor(timeLeft / 60)}:{(timeLeft % 60).toString().padStart(2, '0')}
        </div>
      </div>

      <div className={styles.question}>
        <h3>Question {currentQuestion.index + 1} of 6</h3>
        {currentQuestion.category === 'Sequence Recall' ? (
          // In Sequence Recall: show during viewing phase to everyone; during solving phase hide text for participants
          (isViewingPhase || isProctor) ? (
            <>
              <p>{currentQuestion.question}</p>
              {!isProctor && isViewingPhase && <p className={styles.hint}>Memorize the sequence. It will be hidden after 30 seconds.</p>}
            </>
          ) : (
            <p className={styles.hint}>Recall the sequence from memory and answer.</p>
          )
        ) : (
          <p>{currentQuestion.question}</p>
        )}
        
        {/* Answer format hint */}
        <div className={styles.answerHint}>
          <p className={styles.hintText}>
            💡 <strong>Answer Format:</strong> {getAnswerHint(currentQuestion.category)}
          </p>
        </div>
      </div>

      {!isProctor && (
        <div className={styles.answerSection}>
          <input
            type="text"
            placeholder="Enter your answer..."
            value={answer}
            onChange={(e) => setAnswer(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSubmit()}
            disabled={isAnswered || (currentQuestion?.category === 'Sequence Recall' && isViewingPhase)}
            className={styles.answerInput}
          />
          
          <button
            onClick={() => handleSubmit()}
            disabled={isAnswered || !answer.trim() || (currentQuestion?.category === 'Sequence Recall' && isViewingPhase)}
            className={styles.submitButton}
          >
            {isAnswered ? 'Answered' : 'Submit Answer'}
          </button>
        </div>
      )}

      {isAnswered && (
        <div className={styles.result}>
          <p>Answer submitted! Waiting for next question...</p>
        </div>
      )}

      {isProctor && (
        <div className={styles.proctorControls}>
          <button
            className={styles.submitButton}
            onClick={() => {
              if (!socket) return;
              socket.emit('nextQuestion', {
                groupId: userInfo.groupId,
                participantId: userInfo.participantId,
                questionIndex: currentQuestion.index
              });
            }}
          >
            Next Question
          </button>
        </div>
      )}
    </div>
  );
}