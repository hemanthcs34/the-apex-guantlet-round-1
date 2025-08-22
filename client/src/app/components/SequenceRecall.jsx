"use client";
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Timer from "@/components/Timer";
import styles from './GameComponent.module.css';

export default function SequenceRecall({ onNext }) {
  const [sequence] = useState(["8", "6", "4", "2", "5", "1", "9", "3", "7", "0", "X", "Y"]);
  const [showSequence, setShowSequence] = useState(true);
  const [answer, setAnswer] = useState("");

  useEffect(() => {
    const timer = setTimeout(() => setShowSequence(false), 15000); // Hide after 15 seconds
    return () => clearTimeout(timer);
  }, []);

  const handleSubmit = async () => {
    const playerId = localStorage.getItem("playerId");
    const isCorrect = answer.replace(/\s/g, "") === sequence.join("");
    await fetch("/api/submit", {
      method: "POST",
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        playerId,
        correct: isCorrect,
        gameName: "sequenceRecall",
      }),
    });
    if (onNext) onNext();
  };

  return (
    <motion.div className={styles.card} initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
      <div className={styles.header}>
        <h1 className={styles.title} style={{ color: '#f59e0b' }}>🔢 Sequence Recall</h1>
        <Timer duration={180} onExpire={handleSubmit} />
      </div>
      <div className={styles.gameArea}>
        <AnimatePresence mode="wait">
          {showSequence ? (
            <motion.div key="sequence" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
              <p className={styles.prompt}>Memorize this sequence:</p>
              <p className={styles.sequenceText}>{sequence.join(" ")}</p>
            </motion.div>
          ) : (
            <motion.div key="input" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
              <p className={styles.prompt}>Enter the sequence you remember:</p>
              <div className={styles.inputGroup}>
                <input
                  className={styles.input}
                  value={answer}
                  onChange={(e) => setAnswer(e.target.value)}
                  placeholder="e.g., 8 6 4..."
                  autoFocus
                />
                <button onClick={handleSubmit} className={styles.button}>Submit</button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
}