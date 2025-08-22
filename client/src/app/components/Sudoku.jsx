"use client";
import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import Timer from "@/components/Timer";
import styles from './Sudoku.module.css'; // We will create this file next

// --- Sudoku Helper Functions ---
const isSafe = (board, row, col, num) => {
  for (let i = 0; i < 9; i++) {
    if (board[row][i] === num || board[i][col] === num) return false;
  }
  const startRow = row - (row % 3), startCol = col - (col % 3);
  for (let i = 0; i < 3; i++) {
    for (let j = 0; j < 3; j++) {
      if (board[startRow + i][startCol + j] === num) return false;
    }
  }
  return true;
};

const fillRandomGrid = (grid) => {
  for (let row = 0; row < 9; row++) {
    for (let col = 0; col < 9; col++) {
      if (grid[row][col] === 0) {
        const numbers = [1, 2, 3, 4, 5, 6, 7, 8, 9].sort(() => Math.random() - 0.5);
        for (const num of numbers) {
          if (isSafe(grid, row, col, num)) {
            grid[row][col] = num;
            if (fillRandomGrid(grid)) return true;
            grid[row][col] = 0; // backtrack
          }
        }
        return false;
      }
    }
  }
  return true;
};

const generateFullGrid = () => {
  const grid = Array.from({ length: 9 }, () => Array(9).fill(0));
  fillRandomGrid(grid);
  return grid;
};

const generatePuzzle = (fullGrid, clues = 30) => {
  const puzzle = fullGrid.map(row => [...row]);
  let removed = 0;
  while (removed < 81 - clues) {
    const row = Math.floor(Math.random() * 9);
    const col = Math.floor(Math.random() * 9);
    if (puzzle[row][col] !== 0) {
      puzzle[row][col] = 0;
      removed++;
    }
  }
  return puzzle;
};
// --- End Helper Functions ---

export default function Sudoku({ onNext }) {
  // FIX: Initialize with an empty 9x9 grid to prevent the .map error
  const [grid, setGrid] = useState(Array.from({ length: 9 }, () => Array(9).fill(0)));
  const [solution, setSolution] = useState([]);
  const [initialGrid, setInitialGrid] = useState([]);

  useEffect(() => {
    const newSolution = generateFullGrid();
    const newPuzzle = generatePuzzle(newSolution);
    setSolution(newSolution);
    setGrid(newPuzzle);
    setInitialGrid(newPuzzle.map(row => [...row])); // Store a copy for read-only check
  }, []);

  const handleChange = (row, col, value) => {
    if (!/^[1-9]?$/.test(value)) return;
    const newGrid = grid.map(r => [...r]);
    newGrid[row][col] = value === "" ? 0 : parseInt(value, 10);
    setGrid(newGrid);
  };

  const handleSubmit = async () => {
    const playerId = localStorage.getItem("playerId");
    let isCorrect = true;
    for (let i = 0; i < 9; i++) {
        for (let j = 0; j < 9; j++) {
            if (grid[i][j] !== solution[i][j]) {
                isCorrect = false;
                break;
            }
        }
    }
    await fetch("/api/submit", {
      method: "POST",
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ playerId, correct: isCorrect, gameName: "sudoku" }),
    });
    if (onNext) onNext();
  };

  return (
    <motion.div className={styles.container} initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
        <div className={styles.header}>
            <h1 className={styles.title}>🧩 Sudoku Puzzle</h1>
            <Timer duration={300} onExpire={handleSubmit} />
        </div>
        <div className={styles.grid}>
            {grid.map((row, rIndex) =>
            row.map((cell, cIndex) => {
                const isReadOnly = initialGrid[rIndex] && initialGrid[rIndex][cIndex] !== 0;
                return (
                <input
                    key={`${rIndex}-${cIndex}`}
                    type="text"
                    maxLength="1"
                    value={cell === 0 ? "" : cell}
                    onChange={(e) => handleChange(rIndex, cIndex, e.target.value)}
                    className={`${styles.cell} ${isReadOnly ? styles.readOnly : ''}`}
                    readOnly={isReadOnly}
                />
                );
            })
            )}
        </div>
        <button onClick={handleSubmit} className={styles.button}>Submit Puzzle</button>
    </motion.div>
  );
}