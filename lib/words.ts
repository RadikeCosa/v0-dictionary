import { WORDS } from "./wordList";

export function getRandomWord(
  usedWords: string[],
): { word: string; fallback: string } | null {
  const available = WORDS.filter((w) => !usedWords.includes(w.word));
  if (available.length === 0) return null;
  return available[Math.floor(Math.random() * available.length)];
}
