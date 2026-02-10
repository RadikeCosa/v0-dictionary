import { NextResponse } from "next/server";
import { sql } from "@/lib/db";
import { getRandomWord } from "@/lib/words";

async function fetchDefinition(
  word: string,
  fallback: string,
): Promise<string> {
  try {
    const response = await fetch(
      `https://api.dictionaryapi.dev/api/v2/entries/es/${encodeURIComponent(word)}`,
      { signal: AbortSignal.timeout(5000) },
    );
    if (response.ok) {
      const data = await response.json();
      const meaning = data?.[0]?.meanings?.[0]?.definitions?.[0]?.definition;
      if (meaning && typeof meaning === "string" && meaning.length > 5) {
        return meaning;
      }
    }
  } catch {
    // Use fallback
  }
  return fallback;
}

export async function POST(
  request: Request,
  { params }: { params: Promise<{ roomId: string }> },
) {
  try {
    const { roomId } = await params;
    // Obtener la ronda actual
    const rounds =
      await sql`SELECT * FROM rounds WHERE room_id = ${roomId} ORDER BY id DESC LIMIT 1`;
    if (rounds.length === 0)
      return NextResponse.json({ error: "No round found" }, { status: 404 });

    const round = rounds[0];

    // Obtener definiciones de la ronda
    const defs =
      await sql`SELECT * FROM definitions WHERE round_id = ${round.id}`;
    // Validar que ningún jugador esté listo (soporta boolean y string)
    const anyReady = defs.some(
      (d) => d.is_ready === true || d.is_ready === "true",
    );
    if (anyReady)
      return NextResponse.json(
        { error: "Players already ready" },
        { status: 400 },
      );

    // Obtener palabras usadas
    const usedRounds =
      await sql`SELECT word FROM rounds WHERE room_id = ${roomId}`;
    const usedWords = usedRounds.map((r) => r.word);
    // Agregar la palabra actual si no está
    if (!usedWords.includes(round.word)) usedWords.push(round.word);

    // Usar getRandomWord para obtener una nueva palabra
    const wordEntry = getRandomWord(usedWords);
    if (!wordEntry)
      return NextResponse.json(
        { error: "No quedan palabras disponibles" },
        { status: 400 },
      );

    // Fetch the real definition for the new word (like start-round does)
    const realDefinition = await fetchDefinition(
      wordEntry.word,
      wordEntry.fallback,
    );

    // Actualizar la ronda con la nueva palabra Y la nueva definición real
    await sql`UPDATE rounds SET word = ${wordEntry.word}, real_definition = ${realDefinition} WHERE id = ${round.id}`;

    return NextResponse.json({ success: true, word: wordEntry.word });
  } catch (error) {
    console.error("Error skipping word:", error);
    return NextResponse.json(
      { error: "Error al saltar palabra" },
      { status: 500 },
    );
  }
}
