export function calculateScore(position, isBonus = false) {
  if (isBonus) return 15;
  switch (position) {
    case 1: return 10;
    case 2: return 8;
    case 3: return 5;
    case 4: return 2;
    default: return 0;
  }
}