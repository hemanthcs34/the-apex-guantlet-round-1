"use client";
import { useState, useEffect } from 'react';
import io from 'socket.io-client';
import Login from '../components/Login';
import Lobby from '../components/Lobby';
import Question from '../components/Question';

const SOCKET_URL = process.env.NEXT_PUBLIC_SERVER_URL;

export default function HomePage() {
  const [socket, setSocket] = useState(null);
  const [hydrated, setHydrated] = useState(false);
  const [gameState, setGameState] = useState('login');
  const [participants, setParticipants] = useState([]);
  const [userInfo, setUserInfo] = useState(null);
  const [currentGroup, setCurrentGroup] = useState(null);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(null);

  // Hydrate state from localStorage only on client
  useEffect(() => {
    if (typeof window !== 'undefined') {
      setGameState(localStorage.getItem('gameState') || 'login');
      const storedUser = localStorage.getItem('userInfo');
      setUserInfo(storedUser ? JSON.parse(storedUser) : null);
      const storedGroup = localStorage.getItem('currentGroup');
      setCurrentGroup(storedGroup ? JSON.parse(storedGroup) : null);
      const storedIndex = localStorage.getItem('currentQuestionIndex');
      setCurrentQuestionIndex(storedIndex ? JSON.parse(storedIndex) : null);
      setHydrated(true);
    }
  }, []);

  useEffect(() => {
    const newSocket = io(SOCKET_URL);
    setSocket(newSocket);

    newSocket.on('lobbyUpdate', (participants) => {
      setParticipants(participants);
    });

    newSocket.on('roundStarted', () => {
      console.log('Received roundStarted event');
      setGameState('question');
      localStorage.setItem('gameState', 'question');
      if (currentGroup) {
        console.log('Emitting getCurrentQuestion for group:', currentGroup.id);
        newSocket.emit('getCurrentQuestion', { groupId: currentGroup.id });
      }
    });

    newSocket.on('newQuestion', (payload) => {
      console.log('Received newQuestion event with payload:', payload);
      const idx = typeof payload === 'number' ? payload : payload?.index;
      setCurrentQuestionIndex(idx ?? null);
      localStorage.setItem('currentQuestionIndex', JSON.stringify(idx ?? null));
      setGameState('question'); // Ensure we show the question view
      localStorage.setItem('gameState', 'question');
    });

    newSocket.on('gameOver', () => {
      setGameState('results');
      localStorage.setItem('gameState', 'results');
    });

    newSocket.on('error', (message) => {
      alert(message);
    });

    // Automatically join group after hydration and socket connection
    if (hydrated && currentGroup && currentGroup.id) {
      console.log('Auto-joining group after hydration:', currentGroup.id);
      newSocket.emit('joinGroup', currentGroup.id);
    }

    return () => newSocket.close();
  }, [currentGroup, hydrated]);

  // Always fetch participants after hydration and when currentGroup changes
  useEffect(() => {
    if (hydrated && currentGroup && currentGroup.id) {
      fetch(`/api/groups/${currentGroup.id}/participants`)
        .then(res => res.ok ? res.json() : null)
        .then(data => {
          if (data && data.participants) {
            setParticipants(data.participants);
          }
        });
    }
  }, [hydrated, currentGroup]);

  const handleLogin = (loginData) => {
    // Set user info and current group
    const user = {
      participantId: loginData.participantId,
      name: loginData.name,
      isProctor: loginData.isProctor,
      groupId: loginData.group.id
    };
    setUserInfo(user);
    localStorage.setItem('userInfo', JSON.stringify(user));
    setCurrentGroup(loginData.group);
    localStorage.setItem('currentGroup', JSON.stringify(loginData.group));

    // Join the Socket.IO room
    if (socket) {
      socket.emit('joinGroup', loginData.group.id);
    }

    // Move to lobby
    setGameState('lobby');
    localStorage.setItem('gameState', 'lobby');

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

  // Clear localStorage when results page is shown
  useEffect(() => {
    if (gameState === 'results') {
      localStorage.removeItem('gameState');
      localStorage.removeItem('userInfo');
      localStorage.removeItem('currentGroup');
      localStorage.removeItem('currentQuestionIndex');
    }
  }, [gameState]);

  if (!hydrated) {
    // Prevent hydration error: render nothing until client-side state is ready
    return null;
  }

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
        <button onClick={() => {
          setGameState('login');
        }}>Play Again</button>
      </div>
    );
  }

  return <div>Connecting...</div>;
}