import { useState, useEffect } from 'react';
import styles from './Login.module.css';

export default function Login({ onLogin }) {
  const [code, setCode] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [playerName, setPlayerName] = useState('');

  useEffect(() => {
    // Restore player name
    const storedName = localStorage.getItem('playerName');
    if (storedName) {
      setPlayerName(storedName);
    }

    // 🟢 Check if already logged in (persist session)
    const storedSession = localStorage.getItem('sessionData');
    if (storedSession) {
      try {
        const parsed = JSON.parse(storedSession);
        onLogin(parsed); // auto-login on refresh
      } catch (e) {
        console.error("Invalid session data", e);
      }
    }
  }, [onLogin]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!code.trim() || !playerName.trim()) return;

    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/groups', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: playerName.trim(),
          code: code.trim().toUpperCase()
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to join group');
      }

      // 🟢 Save session in localStorage
      localStorage.setItem('sessionData', JSON.stringify(data));

      onLogin(data);  
    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  if (!playerName) {
    return (
      <div className={styles.card}>
        <h1>Welcome to The Apex Gauntlet</h1>
        <p>Please enter your name on the landing page first.</p>
        <button 
          onClick={() => window.location.href = '/'} 
          className={styles.button}
        >
          Go to Landing Page
        </button>
      </div>
    );
  }

  return (
    <div className={styles.card}>
      <h1>Join Your Group</h1>
      <div className={styles.playerInfo}>
        <p><strong>Player:</strong> {playerName}</p>
      </div>
      
      <form onSubmit={handleSubmit} className={styles.form}>
        <div className={styles.inputGroup}>
          <label htmlFor="code">Room Code:</label>
          <input
            id="code"
            type="text"
            placeholder="Enter room code (e.g., ABC123)"
            value={code}
            onChange={(e) => setCode(e.target.value.toUpperCase())}
            className={styles.input}
            maxLength={6}
            required
          />
        </div>
        
        <div className={styles.buttons}>
          <button
            type="submit"
            disabled={!code.trim() || isLoading}
            className={styles.button}
          >
            {isLoading ? 'Joining...' : 'Enter the Arena'}
          </button>
        </div>
      </form>

      {error && (
        <div className={styles.error}>
          <p>{error}</p>
        </div>
      )}

      <div className={styles.help}>
        <h3>Need Help?</h3>
        <ul>
          <li>Ask your tournament organizer for the room code</li>
          <li>Room codes are 6 characters long</li>
          <li>Each group can have up to 5 participants + 1 proctor</li>
          <li>Only participants with points &gt; 0 can advance</li>
        </ul>
      </div>
    </div>
  );
}
