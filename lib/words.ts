import { WORDS } from "./wordList";

// Retorna una palabra aleatoria del pool, excluyendo las ya usadas.
// Si no quedan palabras disponibles, retorna null.
// Utiliza la lista WORDS importada desde wordList.ts.
export function getRandomWord(
  usedWords: string[], // Lista de palabras ya utilizadas en la partida
): { word: string; fallback: string } | null {
  // Filtra las palabras que no han sido usadas
  const available = WORDS.filter((w) => !usedWords.includes(w.word));
  // Si no hay palabras disponibles, retorna null
  if (available.length === 0) return null;
  // Selecciona una palabra aleatoria del pool disponible
  return available[Math.floor(Math.random() * available.length)];
}
