"use client";
import { useState, useEffect } from 'react';
import io from 'socket.io-client';
import Login from '../components/Login';
import Lobby from '../components/Lobby';
import Question from '../components/Question';

const SOCKET_URL = "http://localhost:3001";

export default function HomePage() {
  const [socket, setSocket] = useState(null);
  const [gameState, setGameState] = useState('login'); // login, lobby, question, results
  const [participants, setParticipants] = useState([]);
  const [userInfo, setUserInfo] = useState(null);
  const [currentGroup, setCurrentGroup] = useState(null);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(null);

  useEffect(() => {
    const newSocket = io(SOCKET_URL);
    setSocket(newSocket);

    newSocket.on('lobbyUpdate', (participants) => {
      setParticipants(participants);
    });

    newSocket.on('roundStarted', () => {
      setGameState('question');
      // Request current question on round start for all clients
      if (currentGroup) {
        newSocket.emit('getCurrentQuestion', { groupId: currentGroup.id });
      }
    });

    newSocket.on('newQuestion', (payload) => {
      const idx = typeof payload === 'number' ? payload : payload?.index;
      setCurrentQuestionIndex(idx ?? null);
    });

    newSocket.on('gameOver', () => {
      setGameState('results');
    });

    newSocket.on('error', (message) => {
      alert(message);
    });

    return () => newSocket.close();
  }, []);

  const handleLogin = (loginData) => {
    // Set user info and current group
    setUserInfo({
      participantId: loginData.participantId,
      name: loginData.name,
      isProctor: loginData.isProctor,
      groupId: loginData.group.id
    });
    setCurrentGroup(loginData.group);
    
    // Join the Socket.IO room
    if (socket) {
      socket.emit('joinGroup', loginData.group.id);
    }
    
    // Move to lobby
    setGameState('lobby');
    
    // Fetch current participants for this group
    fetchParticipants(loginData.group.id);
  };

  const fetchParticipants = async (groupId) => {
    try {
      const response = await fetch(`/api/groups/${groupId}/participants`);
      if (response.ok) {
        const data = await response.json();
        setParticipants(data.participants);
      }
    } catch (error) {
      console.error('Failed to fetch participants:', error);
    }
  };

  if (gameState === 'login') {
    return <Login onLogin={handleLogin} />;
  }
  
  if (gameState === 'lobby') {
    return (
      <Lobby 
        participants={participants} 
        userInfo={userInfo} 
        socket={socket}
        currentGroup={currentGroup}
        currentQuestionIndex={currentQuestionIndex}
      />
    );
  }
  
  if (gameState === 'question') {
    return <Question userInfo={userInfo} socket={socket} currentGroup={currentGroup} />;
  }

  if (gameState === 'results') {
    return (
      <div className="results">
        <h1>Game Over!</h1>
        <p>Final scores will be displayed here.</p>
        <button onClick={() => setGameState('login')}>Play Again</button>
      </div>
    );
  }

  return <div>Connecting...</div>;
}