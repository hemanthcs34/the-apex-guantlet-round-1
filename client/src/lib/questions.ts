const questions: any[][] = [
  [
    { "category": "Tech Riddle", "question": "I follow you all day but disappear at night. I mimic your every move, yet you never see me. What am I?", "answer": "Shadow", "time_limit": 180 },
    { "category": "Maths Problem", "question": "Three friends book a hotel room for ₹300. Each pays ₹100. Later, the manager realizes the correct cost is ₹250 and sends ₹50 back with the bellboy. The bellboy keeps ₹20 and gives ₹10 to each friend. Now, each friend paid ₹90 (total ₹270). The bellboy has ₹20, making ₹290. Where did the other ₹10 go?", "answer": "The logic is flawed", "time_limit": 300 },
    { "category": "Reasoning Puzzle", "question": "Four friends — Arjun, Priya, Kavya, and Mohan — are sitting around a table. Arjun is sitting directly opposite Priya. Kavya is to Arjun's left. Mohan is not sitting next to Priya. Who is sitting to Priya's right?", "answer": "Mohan", "time_limit": 300 },
    { "category": "Sudoku", "question": "Complete the 4x4 Sudoku Grid: [3, _, 4, _] [_, 1, _, 2] [4, _, 1, _] [_, 3, _, 4]", "answer": "1,2,3,4 in some order in each row, column and 2x2 box", "time_limit": 300 },
    { "category": "Sequence Recall", "question": "Memorize and find the sum of this sequence: 8, 27, 5, 12, 43, 6, 91, 3, 18, 54, 7, 11, 39, 10, 25", "answer": "359", "time_limit": 300 },
    { "category": "Bonus", "question": "Step 1: Find the next prime after 31. (Use this as Key 1). Step 2: Sum the digits of Key 1 to get Key 2. Step 3: Shift the letter 'M' forward by Key 2 positions (A=1). What is the final letter?", "answer": "W", "time_limit": 600 }
  ],
  [
    { "category": "Tech Riddle", "question": "I am a one-time pad, unbreakable if used right. Lose me once, and security takes flight. What am I?", "answer": "Encryption key", "time_limit": 180 },
    { "category": "Maths Problem", "question": "An engineering student drives 60 km to university at 60 km/h and returns at 30 km/h. What is the average speed for the whole trip?", "answer": "40 km/h", "time_limit": 300 },
    { "category": "Reasoning Puzzle", "question": "A brother is 4 years older than his sister. Five years ago, he was twice her age. How old is the sister now?", "answer": "9", "time_limit": 300 },
    { "category": "Sudoku", "question": "Complete the 4x4 Sudoku Grid: [_, 1, _, 4] [2, _, 3, _] [_, 4, _, 1] [3, _, 2, _]", "answer": "1,2,3,4 in some order in each row, column and 2x2 box", "time_limit": 300 },
    { "category": "Sequence Recall", "question": "Memorize and find the sum of this sequence: 13, 2.5, 40, 9, 101, 7.5, 28, 66, 4, 19, 0.5, 33", "answer": "323.5", "time_limit": 300 },
    { "category": "Bonus", "question": "Step 1: Calculate 6! / (4! * 2!). (Use this as Key 1). Step 2: Multiply Key 1 by 2 to get Key 2. Step 3: Use Key 2 as a 1-based index into 'ALGORITHM' (wrap if needed). What is the final letter?", "answer": "G", "time_limit": 600 }
  ]
];

export default questions;