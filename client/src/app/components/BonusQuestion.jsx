"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import Timer from "@/components/Timer";
import styles from './GameComponent.module.css'; // We will reuse the shared CSS file

export default function BonusQuestion() {
  const [answer, setAnswer] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const router = useRouter();

  const handleSubmit = async () => {
    if (isSubmitting) return;
    setIsSubmitting(true);

    const playerId = localStorage.getItem("playerId");
    await fetch("/api/bonus", {
      method: "POST",
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ playerId, answer }),
    });

    // Redirect to the leaderboard after submission
    router.push("/leaderboard");
  };

  return (
    <motion.div
      className={styles.card}
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
    >
      <div className={styles.header}>
        <h1 className={styles.title} style={{ color: '#c084fc' }}>⭐ Bonus Question</h1>
        <Timer duration={600} onExpire={handleSubmit} />
      </div>

      <p className={styles.questionText} style={{ fontStyle: 'italic' }}>
        IEEE was founded in which year?
      </p>
      
      <div className={styles.inputGroup}>
        <textarea
          className={styles.textarea}
          value={answer}
          onChange={(e) => setAnswer(e.target.value)}
          placeholder="Enter your final answer here..."
        />
        <button
          onClick={handleSubmit}
          disabled={isSubmitting}
          className={styles.button}
        >
          {isSubmitting ? "Submitting..." : "Submit Final Answer"}
        </button>
      </div>
    </motion.div>
  );
}