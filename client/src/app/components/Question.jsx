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
  const [isViewingPhase, setIsViewingPhase] = useState(false);

  const isProctor = !!userInfo?.isProctor;

  // 🔹 Restore saved answer from sessionStorage when question changes
  useEffect(() => {
    if (!isProctor && currentQuestion) {
      const savedAnswer = sessionStorage.getItem(
        `answer_q${currentQuestion.index}_${userInfo?.participantId}`
      );
      if (savedAnswer) {
        setAnswer(savedAnswer);
      }
    }
  }, [currentQuestion, isProctor, userInfo?.participantId]);

  // 🔹 Save answer to sessionStorage whenever it changes
  useEffect(() => {
    if (!isProctor && currentQuestion) {
      sessionStorage.setItem(
        `answer_q${currentQuestion.index}_${userInfo?.participantId}`,
        answer
      );
    }
  }, [answer, currentQuestion, isProctor, userInfo?.participantId]);

  useEffect(() => {
    if (socket) {
      socket.on('newQuestion', (payload) => {
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
        if (result.correct) {
          alert(`Correct! +${result.pointsAwarded} points`);
        } else {
          alert('Incorrect answer');
        }
        // 🔹 Clear saved answer after submission
        if (currentQuestion) {
          sessionStorage.removeItem(`answer_q${currentQuestion.index}_${userInfo?.participantId}`);
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
  }, [socket, currentQuestion, userInfo?.participantId]);

  useEffect(() => {
    if (!socket || !currentGroup || !userInfo?.groupId) return;
    socket.emit('getCurrentQuestion', { groupId: userInfo.groupId });
  }, [socket, currentGroup, userInfo?.groupId]);

  useEffect(() => {
    if (timeLeft > 0 && currentQuestion && !gameCompleted) {
      const timer = setInterval(() => {
        setTimeLeft(prev => {
          if (prev <= 1) {
            if (currentQuestion.category === 'Sequence Recall' && isViewingPhase) {
              setIsViewingPhase(false);
              return 300;
            }
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
    return new Promise((resolve) => {
      if (!socket || !currentGroup?.id) return resolve([]);
      socket.emit('getQuestions', { groupId: currentGroup.id });
      socket.once('questionsData', (data) => {
        resolve(data.questions || []);
      });
      socket.once('questionsError', (err) => {
        console.error('Socket error fetching questions:', err);
        resolve([]);
      });
    });
  };

  const handleSubmit = (submittedAnswer = null) => {
    if (isProctor) return;
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

    // 🔹 Clear answer from sessionStorage after submission
    sessionStorage.removeItem(`answer_q${currentQuestion.index}_${userInfo?.participantId}`);
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
        return "Enter your answer as comma-separated values. Example: 1,2,3,4 (row by row)";
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

  const [solutions, setSolutions] = useState([]);

  const getQuestionSolutions = async () => {
    const questions = await getQuestions();
    return questions.map((q, index) => ({
      ...q,
      index,
      hint: getAnswerHint(q.category)
    }));
  };

  useEffect(() => {
    if (showSolutions) {
      (async () => {
        const sols = await getQuestionSolutions();
        setSolutions(sols);
      })();
    }
  }, [showSolutions, currentGroup]);

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
                    {solutions.length === 0 ? (
                      <p>Loading solutions...</p>
                    ) : (
                      solutions.map((question, index) => (
                        <div key={index} className={styles.solutionItem}>
                          <h4>Question {index + 1}: {question.category}</h4>
                          <p className={styles.questionText}>{question.question}</p>
                          <div className={styles.answerInfo}>
                            <p><strong>Answer:</strong> {question.answer}</p>
                            <p><strong>Hint:</strong> {question.hint}</p>
                          </div>
                        </div>
                      ))
                    )}
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
