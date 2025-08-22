"use client";
import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import styles from './Timer.module.css';

const formatTime = (seconds) => {
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = seconds % 60;
  return `${String(minutes).padStart(2, "0")}:${String(remainingSeconds).padStart(2, "0")}`;
};

export default function Timer({ duration, onExpire }) {
  const [time, setTime] = useState(duration);

  useEffect(() => {
    if (time <= 0) {
      onExpire();
      return;
    }
    const timerId = setTimeout(() => setTime(time - 1), 1000);
    return () => clearTimeout(timerId);
  }, [time, onExpire]);

  const timerColorClass = time <= 10 ? styles.red : time <= 30 ? styles.yellow : styles.normal;
  const pulseAnimation = time <= 10 ? { scale: [1, 1.05, 1], transition: { duration: 1, repeat: Infinity } } : {};

  return (
    <motion.div className={`${styles.timer} ${timerColorClass}`} animate={pulseAnimation}>
      <span>⏳</span>
      <span>{formatTime(time)}</span>
    </motion.div>
  );
}