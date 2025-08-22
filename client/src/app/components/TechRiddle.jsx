"use client";
import { useState } from "react";
import { motion } from "framer-motion";
import Timer from "@/components/Timer";
import styles from './GameComponent.module.css'; // We'll create this shared style file next

export default function TechRiddle({ onNext }) {
  const [answer, setAnswer] = useState("");

  const handleSubmit = async () => {
    const playerId = localStorage.getItem("playerId");
    await fetch("/api/submit", {
      method: "POST",
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        playerId,
        correct: answer.toLowerCase() === "operating_system",
        gameName: "techRiddle",
      }),
    });
    if (onNext) onNext();
  };

  return (
    <motion.div
      className={styles.card}
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
    >
      <div className={styles.header}>
        <h1 className={styles.title} style={{ color: '#22d3ee' }}>💡 Tech Riddle</h1>
        <Timer duration={180} onExpire={handleSubmit} />
      </div>
      <p className={styles.questionText}>
        I manage processes, memory, and files, yet you rarely see me directly. I can be preemptive or cooperative, and without me, your programs would be lost in chaos. What am I?
      </p>
      <div className={styles.inputGroup}>
        <input
          className={styles.input}
          value={answer}
          onChange={(e) => setAnswer(e.target.value)}
          placeholder="Your answer (use _ for spaces)"
          onKeyDown={(e) => e.key === 'Enter' && handleSubmit()}
        />
        <button onClick={handleSubmit} className={styles.button}>Submit</button>
      </div>
    </motion.div>
  );
}