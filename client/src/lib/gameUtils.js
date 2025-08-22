export const allGames = ["techRiddle", "mathsProblem", "reasoningPuzzle", "sequenceRecall", "sudoku"];

export function getNextGame(completed) {
  const remaining = allGames.filter(g => !completed.includes(g));
  if (remaining.length === 0) return "bonus";
  return remaining[Math.floor(Math.random() * remaining.length)];
}