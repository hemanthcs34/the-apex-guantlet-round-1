"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import styles from './page.module.css';

export default function Home() {
  const [name, setName] = useState("");
  const [isStarting, setIsStarting] = useState(false);
  const [error, setError] = useState(null);
  const router = useRouter();

  const handleStart = async () => {
    if (!name.trim()) return;
    setIsStarting(true);
    setError(null);

    try {
      // Store the player name in localStorage
      localStorage.setItem("playerName", name.trim());
      
      const res = await fetch("/api/start", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Failed to start.");
      
      localStorage.setItem("playerId", data.playerId);
      router.push("/games");

    } catch (err) {
      setError(err.message);
      setIsStarting(false);
    }
  };

  return (
    <motion.div
      className={styles.card}
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <h1 className={styles.title}>⚡ The Apex Gauntlet</h1>
      <p className={styles.subtitle}>IEEE Game Round 1 - Mind Mashup Challenge</p>
      <p className={styles.description}>
        Test your mental agility in this competitive quiz tournament. 
        Join a group, answer questions, and advance to the next round!
      </p>
      
      <div className={styles.form}>
        <input
          className={styles.input}
          placeholder="Enter your name to begin"
          value={name}
          onChange={(e) => setName(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleStart()}
        />
        <button
          onClick={handleStart}
          disabled={!name.trim() || isStarting}
          className={styles.button}
        >
          {isStarting ? "Starting..." : "Enter the Arena"}
        </button>
        {error && <p className={styles.error}>{error}</p>}
      </div>
      
      <div className={styles.features}>
        <h3>🏆 Tournament Features</h3>
        <ul>
          <li>Real-time multiplayer competition</li>
          <li>Multiple question categories</li>
          <li>Live scoring and rankings</li>
          <li>Advance to next round</li>
        </ul>
      </div>
    </motion.div>
  );
}