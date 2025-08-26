import { useState, useEffect } from 'react';
import styles from './Lobby.module.css';

export default function Lobby({ participants, userInfo, socket, currentGroup, currentQuestionIndex }) {
    useEffect(() => {
      // Fetch participants on mount if currentGroup exists
      if (currentGroup && currentGroup.id) {
        fetch(`/api/groups/${currentGroup.id}/participants`)
          .then(res => res.ok ? res.json() : null)
          .then(data => {
            if (data && data.participants) {
              // Optionally update participants state if you want to keep it in Lobby
              // setParticipants(data.participants); // Uncomment if you want local state
            }
          });
      }
    }, [currentGroup]);
  const [leaderboard, setLeaderboard] = useState(null);
  const [showLeaderboard, setShowLeaderboard] = useState(false);

  useEffect(() => {
    if (currentGroup && userInfo?.isProctor) {
      fetchLeaderboard();
    }
  }, [currentGroup, userInfo]);

  const fetchLeaderboard = async () => {
    try {
      const response = await fetch(`/api/groups/${currentGroup.id}/leaderboard`);
      if (response.ok) {
        const data = await response.json();
        setLeaderboard(data);
      }
    } catch (error) {
      console.error('Failed to fetch leaderboard:', error);
    }
  };

  const handleStart = () => {
    try {
      console.log('handleStart called');
      console.log('socket:', socket);
      console.log('userInfo:', userInfo);
      if (socket && userInfo) {
        console.log('Emitting startRound with:', {
          groupId: userInfo.groupId,
          participantId: userInfo.participantId
        });
        socket.emit('startRound', {
          groupId: userInfo.groupId,
          participantId: userInfo.participantId
        });
        console.log("startRound event emitted");
      } else {
        console.error('Socket or userInfo not available');
      }
    } catch (error) {
      console.error('Error starting round:', error);
    }
  };

  const handleRefreshLeaderboard = () => {
    fetchLeaderboard();
  };

  const handleNext = () => {
    if (!socket || !userInfo || !currentGroup) return;
    if (!userInfo.isProctor) return;
    socket.emit('nextQuestion', { groupId: userInfo.groupId, participantId: userInfo.participantId, questionIndex: (typeof currentQuestionIndex === 'number' ? currentQuestionIndex : 0) });
  };

  return (
    <div className={styles.card}>
      <h1>Game Lobby</h1>
      {currentGroup && (
        <div className={styles.groupInfo}>
          <h2>{currentGroup.name}</h2>
          <p>Room Code: <strong>{currentGroup.code}</strong></p>
        </div>
      )}
      
      <div className={styles.playerSection}>
        <h3>Players ({participants.filter(p => !p.isProctor).length}/5)</h3>
        <ul className={styles.playerList}>
          {participants.map(p => (
            <li key={p._id} className={styles.player}>
              <span className={styles.playerName}>
                {p.name} {p.isProctor && <span className={styles.proctor}>(Proctor)</span>}
              </span>
              <span className={styles.playerScore}>Score: {p.totalScore || 0}</span>
            </li>
          ))}
        </ul>
        
        {participants.filter(p => !p.isProctor).length < 1 && (
          <p className={styles.waiting}>Waiting for participants to join...</p>
        )}
      </div>

      {/* Proctor Controls */}
      {userInfo?.isProctor && participants.filter(p => !p.isProctor).length >= 1 && (
        <div className={styles.proctorControls}>
          <button className={styles.button} onClick={handleStart}>
            Start Game
          </button>
          <p className={styles.hint}>Minimum 1 participant required to start</p>
          <div style={{ marginTop: '12px' }}>
            <button className={styles.button} onClick={handleNext}>Next Question</button>
          </div>
        </div>
      )}

      {/* Proctor Leaderboard - Always Visible */}
      {userInfo?.isProctor && (
        <div className={styles.proctorLeaderboard}>
          <h3>📊 Live Leaderboard (Proctor View)</h3>
          <div className={styles.leaderboardGrid}>
            {participants
              .filter(p => !p.isProctor)
              .sort((a, b) => (b.totalScore || 0) - (a.totalScore || 0))
              .map((participant, index) => (
                <div key={participant._id} className={styles.leaderboardItem}>
                  <span className={styles.rank}>#{index + 1}</span>
                  <span className={styles.name}>{participant.name}</span>
                  <span className={styles.score}>{participant.totalScore || 0} pts</span>
                </div>
              ))}
          </div>
        </div>
      )}

      {!userInfo?.isProctor && (
        <div className={styles.playerWaiting}>
          <p>Waiting for proctor to start the game...</p>
        </div>
      )}
    </div>
  );
}