import fs from 'fs';

 function getQuestions() {
  return JSON.parse(fs.readFileSync('./questions.json', 'utf-8'));
}
export function getQuestionsRandom() {
  const questions = getQuestions();
  const randomIndex = Math.floor(Math.random() * questions.length);
  return questions[randomIndex];
}
console.log(getQuestionsRandom());