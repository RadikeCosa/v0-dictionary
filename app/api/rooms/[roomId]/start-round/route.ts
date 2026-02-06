import { NextResponse } from "next/server";
import { sql } from "@/lib/db";
import { getRandomWord } from "@/lib/words";

async function fetchDefinition(word: string, fallback: string): Promise<string> {
  try {
    const response = await fetch(
      `https://api.dictionaryapi.dev/api/v2/entries/es/${encodeURIComponent(word)}`,
      { signal: AbortSignal.timeout(5000) }
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
  { params }: { params: Promise<{ roomId: string }> }
) {
  try {
    const { roomId } = await params;
    const { playerId } = await request.json();

    const rooms = await sql`SELECT * FROM rooms WHERE id = ${roomId}`;
    if (rooms.length === 0) {
      return NextResponse.json({ error: "Sala no encontrada" }, { status: 404 });
    }

    const room = rooms[0];

    // Verify the player is the host
    const hosts = await sql`
      SELECT * FROM players WHERE id = ${playerId} AND room_id = ${roomId} AND is_host = true
    `;
    if (hosts.length === 0) {
      return NextResponse.json({ error: "Solo el anfitrion puede iniciar la ronda" }, { status: 403 });
    }

    const nextRound = room.current_round + 1;

    if (nextRound > room.max_rounds) {
      await sql`UPDATE rooms SET status = 'finished' WHERE id = ${roomId}`;
      return NextResponse.json({ finished: true });
    }

    // Get previously used words
    const usedRounds = await sql`SELECT word FROM rounds WHERE room_id = ${roomId}`;
    const usedWords = usedRounds.map((r: Record<string, unknown>) => r.word as string);

    const wordEntry = getRandomWord(usedWords);
    if (!wordEntry) {
      return NextResponse.json({ error: "No quedan palabras disponibles" }, { status: 400 });
    }

    const realDefinition = await fetchDefinition(wordEntry.word, wordEntry.fallback);

    await sql`
      INSERT INTO rounds (room_id, round_number, word, real_definition, status)
      VALUES (${roomId}, ${nextRound}, ${wordEntry.word}, ${realDefinition}, 'writing')
    `;

    await sql`
      UPDATE rooms SET current_round = ${nextRound}, status = 'playing' WHERE id = ${roomId}
    `;

    return NextResponse.json({ success: true, round: nextRound });
  } catch (error) {
    console.error("Error starting round:", error);
    return NextResponse.json({ error: "Error al iniciar la ronda" }, { status: 500 });
  }
}
