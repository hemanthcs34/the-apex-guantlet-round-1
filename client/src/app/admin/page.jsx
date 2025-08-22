"use client";
import { useState, useEffect } from 'react';
import styles from './admin.module.css';

export default function AdminPage() {
  const [groups, setGroups] = useState([]);
  const [globalLeaderboard, setGlobalLeaderboard] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [copiedCode, setCopiedCode] = useState(null);
  const [activeTab, setActiveTab] = useState('groups');

  const fetchGroups = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch('/api/groups');
      if (response.ok) {
        const data = await response.json();
        setGroups(data.groupCodes || []);
      } else {
        throw new Error('Failed to fetch groups');
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const fetchGlobalLeaderboard = async () => {
    try {
      const response = await fetch('/api/global-leaderboard');
      if (response.ok) {
        const data = await response.json();
        setGlobalLeaderboard(data);
      }
    } catch (err) {
      console.error('Failed to fetch global leaderboard:', err);
    }
  };

  const copyToClipboard = async (code) => {
    try {
      await navigator.clipboard.writeText(code);
      setCopiedCode(code);
      setTimeout(() => setCopiedCode(null), 2000);
    } catch (err) {
      // Fallback for older browsers
      const textArea = document.createElement('textarea');
      textArea.value = code;
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand('copy');
      document.body.removeChild(textArea);
      setCopiedCode(code);
      setTimeout(() => setCopiedCode(null), 2000);
    }
  };

  const resetAllScores = async () => {
    if (!confirm('Are you sure you want to reset all scores? This will start a new tournament round.')) {
      return;
    }

    try {
      const response = await fetch('/api/global-leaderboard', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'resetScores' })
      });

      if (response.ok) {
        alert('All scores have been reset. New tournament round can begin.');
        fetchGlobalLeaderboard();
      } else {
        throw new Error('Failed to reset scores');
      }
    } catch (err) {
      alert('Error resetting scores: ' + err.message);
    }
  };

  useEffect(() => {
    fetchGroups();
    fetchGlobalLeaderboard();
  }, []);

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h1>🔑 Tournament Admin Panel</h1>
        <p>Complete oversight and management for The Apex Gauntlet tournament</p>
      </div>

      <div className={styles.tabs}>
        <button
          className={`${styles.tab} ${activeTab === 'groups' ? styles.activeTab : ''}`}
          onClick={() => setActiveTab('groups')}
        >
          🏠 Room Keys
        </button>
        <button
          className={`${styles.tab} ${activeTab === 'leaderboard' ? styles.activeTab : ''}`}
          onClick={() => setActiveTab('leaderboard')}
        >
          📊 Global Leaderboard
        </button>
        <button
          className={`${styles.tab} ${activeTab === 'management' ? styles.activeTab : ''}`}
          onClick={() => setActiveTab('management')}
        >
          ⚙️ Tournament Management
        </button>
      </div>

      {activeTab === 'groups' && (
        <div className={styles.tabContent}>
          <div className={styles.controls}>
            <button 
              onClick={fetchGroups} 
              disabled={loading}
              className={styles.refreshButton}
            >
              {loading ? 'Refreshing...' : '🔄 Refresh Groups'}
            </button>
            <button 
              onClick={() => {
                if (groups.length > 0) {
                  const allCodes = groups.map(g => `${g.groupName}: ${g.code}`).join('\n');
                  copyToClipboard(allCodes);
                }
              }}
              className={styles.copyAllButton}
            >
              📋 Copy All Codes
            </button>
          </div>

          {error && (
            <div className={styles.error}>
              <p>Error: {error}</p>
              <button onClick={fetchGroups} className={styles.retryButton}>
                Try Again
              </button>
            </div>
          )}

          {groups.length > 0 && (
            <div className={styles.groupsContainer}>
              <h2>📊 Tournament Groups ({groups.length})</h2>
              <div className={styles.groupsGrid}>
                {groups.map((group, index) => (
                  <div key={index} className={styles.groupCard}>
                    <h3>{group.groupName}</h3>
                    <div className={styles.codeSection}>
                      <span className={styles.code}>{group.code}</span>
                      <button
                        onClick={() => copyToClipboard(group.code)}
                        className={styles.copyButton}
                        title="Copy code"
                      >
                        {copiedCode === group.code ? '✅' : '📋'}
                      </button>
                    </div>
                    <p className={styles.groupInfo}>
                      Max: 5 participants + 1 proctor
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {activeTab === 'leaderboard' && (
        <div className={styles.tabContent}>
          <div className={styles.controls}>
            <button onClick={fetchGlobalLeaderboard} className={styles.refreshButton}>
              🔄 Refresh Leaderboard
            </button>
          </div>

          {globalLeaderboard && (
            <div className={styles.leaderboardContent}>
              <div className={styles.globalStats}>
                <h2>🌍 Global Tournament Statistics</h2>
                <div className={styles.statsGrid}>
                  <div className={styles.statCard}>
                    <h3>Total Participants</h3>
                    <p>{globalLeaderboard.globalStats.totalParticipants}</p>
                  </div>
                  <div className={styles.statCard}>
                    <h3>Total Groups</h3>
                    <p>{globalLeaderboard.globalStats.totalGroups}</p>
                  </div>
                  <div className={styles.statCard}>
                    <h3>Active Groups</h3>
                    <p>{globalLeaderboard.globalStats.activeGroups}</p>
                  </div>
                  <div className={styles.statCard}>
                    <h3>Average Score</h3>
                    <p>{globalLeaderboard.globalStats.averageScore}</p>
                  </div>
                </div>
              </div>

              <div className={styles.topPerformers}>
                <h2>🏆 Top Performers (All Groups)</h2>
                <div className={styles.performersList}>
                  {globalLeaderboard.topPerformers.map((participant) => (
                    <div key={participant.participantId} className={styles.performerItem}>
                      <span className={styles.rank}>#{participant.rank}</span>
                      <span className={styles.name}>{participant.name}</span>
                      <span className={styles.score}>{participant.totalScore} pts</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className={styles.groupsOverview}>
                <h2>📋 Groups Overview</h2>
                <div className={styles.groupsTable}>
                  <table>
                    <thead>
                      <tr>
                        <th>Group</th>
                        <th>Code</th>
                        <th>Participants</th>
                        <th>Total Score</th>
                        <th>Avg Score</th>
                        <th>Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {globalLeaderboard.groupsOverview.map((group) => (
                        <tr key={group.groupCode}>
                          <td>{group.groupName}</td>
                          <td><code>{group.groupCode}</code></td>
                          <td>{group.participantCount}</td>
                          <td>{group.groupTotalScore}</td>
                          <td>{group.groupAverageScore}</td>
                          <td>
                            <span className={`${styles.status} ${group.roundStarted ? styles.active : styles.inactive}`}>
                              {group.roundStarted ? 'Active' : 'Waiting'}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {activeTab === 'management' && (
        <div className={styles.tabContent}>
          <div className={styles.managementContent}>
            <h2>⚙️ Tournament Management</h2>
            
            <div className={styles.managementActions}>
              <div className={styles.actionCard}>
                <h3>🔄 Reset Tournament</h3>
                <p>Reset all scores and start a new tournament round</p>
                <button onClick={resetAllScores} className={styles.dangerButton}>
                  Reset All Scores
                </button>
              </div>

              <div className={styles.actionCard}>
                <h3>📊 Export Data</h3>
                <p>Export tournament data for analysis</p>
                <button 
                  onClick={() => {
                    if (globalLeaderboard) {
                      const dataStr = JSON.stringify(globalLeaderboard, null, 2);
                      const dataBlob = new Blob([dataStr], { type: 'application/json' });
                      const url = URL.createObjectURL(dataBlob);
                      const link = document.createElement('a');
                      link.href = url;
                      link.download = `tournament-data-${new Date().toISOString().split('T')[0]}.json`;
                      link.click();
                    }
                  }}
                  className={styles.exportButton}
                  disabled={!globalLeaderboard}
                >
                  Export JSON
                </button>
              </div>
            </div>

            <div className={styles.instructions}>
              <h3>📋 Tournament Management Instructions</h3>
              <ol>
                <li><strong>Room Keys:</strong> Generate and distribute room codes to participants</li>
                <li><strong>Monitor Progress:</strong> Track scores and group status in real-time</li>
                <li><strong>Round Management:</strong> Reset scores between tournament rounds</li>
                <li><strong>Data Export:</strong> Download tournament data for analysis</li>
                <li><strong>Global View:</strong> See all participants across all groups</li>
              </ol>
            </div>
          </div>
        </div>
      )}

      <div className={styles.quickAccess}>
        <h3>🚀 Quick Access Links</h3>
        <div className={styles.links}>
          <a href="/" className={styles.link}>🏠 Landing Page</a>
          <a href="/games" className={styles.link}>🎮 Games</a>
          <a href="/leaderboard" className={styles.link}>📊 Leaderboard</a>
        </div>
      </div>
    </div>
  );
}
