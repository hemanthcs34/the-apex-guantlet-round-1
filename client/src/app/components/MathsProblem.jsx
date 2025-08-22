"use client";
import { useMemo, useState } from "react";
import { motion } from "framer-motion";
import Timer from "@/components/Timer";
import styles from './GameComponent.module.css';

// Helper functions (remain the same)
function genMatrix(n = 3, min = 1, max = 9) { /* ... */ }
function mul3x3(A, B) { /* ... */ }
function equal3x3(A, B) { /* ... */ }


export default function MathsProblem({ onNext }) {
    const A = useMemo(() => genMatrix(3, 1, 9), []);
    const B = useMemo(() => genMatrix(3, 1, 9), []);
    const correct = useMemo(() => mul3x3(A, B), [A, B]);
    const [ans, setAns] = useState(() => Array(3).fill(0).map(() => Array(3).fill("")));
    const [submitting, setSubmitting] = useState(false);

    // ... (rest of the component logic: setCell, toNumberMatrix, etc.)

    const submit = async () => {
        if (submitting) return;
        setSubmitting(true);
        const playerId = localStorage.getItem("playerId");
        const numAns = toNumberMatrix(ans);
        const isCorrect = numAns ? equal3x3(numAns, correct) : false;

        await fetch("/api/submit", {
            method: "POST",
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ playerId, correct: isCorrect, gameName: "mathsProblem" }),
        });
        onNext();
    };

    return (
        <motion.div className={styles.card} /* ... */ >
            {/* JSX for Maths Problem */}
        </motion.div>
    );
}