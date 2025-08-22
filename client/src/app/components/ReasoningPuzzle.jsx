"use client";
import { useState } from "react";
import { motion } from "framer-motion";
import Timer from "@/components/Timer";
import styles from './GameComponent.module.css';

export default function ReasoningPuzzle({ onNext }) {
  const [answer, setAnswer] = useState("");

  const handleSubmit = async () => {
    const playerId = localStorage.getItem("playerId");
    await fetch("/api/submit", {
      method: "POST",
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        playerId,
        correct: answer.toLowerCase() === "transistor",
        gameName: "reasoningPuzzle",
      }),
    });
    if (onNext) onNext();
  };

  return (
    <motion.div className={styles.card} /* ... */ >
      <div className={styles.header}>
        <h1 className={styles.title} style={{ color: '#818cf8' }}>🧩 Reasoning Puzzle</h1>
        <Timer duration={300} onExpire={handleSubmit} />
      </div>
      <p className={styles.questionText}>
        I control the flow of current in a circuit. I can amplify signals or act as a switch. What electronic component am I?
      </p>
      <div className={styles.inputGroup}>
        <input
          className={styles.input}
          value={answer}
          onChange={(e) => setAnswer(e.target.value)}
          placeholder="Enter your answer"
        />
        <button onClick={handleSubmit} className={styles.button}>Submit</button>
      </div>
    </motion.div>
  );
}