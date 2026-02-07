import { NextResponse } from "next/server";
import { neon } from "@neondatabase/serverless";
const sql = neon(process.env.DATABASE_URL!);
import { getRandomWord } from "@/lib/words";

export async function POST(
  request: Request,
  { params }: { params: { roomId: string } },
) {
  const roomId = params.roomId;
  // Obtener la ronda actual
  const [round] = (
    await sql`SELECT * FROM rounds WHERE room_id = ${roomId} ORDER BY id DESC LIMIT 1`
  ).rows;
  if (!round)
    return NextResponse.json({ error: "No round found" }, { status: 404 });

  // Obtener definiciones de la ronda
  const defs = (
    await sql`SELECT * FROM definitions WHERE round_id = ${round.id}`
  ).rows;
  // Validar que ningún jugador esté listo
  const anyReady = defs.some((d) => d.is_ready);
  if (anyReady)
    return NextResponse.json(
      { error: "Players already ready" },
      { status: 400 },
    );

  // Obtener palabras usadas
  const usedRounds = (
    await sql`SELECT word FROM rounds WHERE room_id = ${roomId}`
  ).rows;
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

  // Actualizar la ronda con la nueva palabra y resetear real_definition
  await sql`UPDATE rounds SET word = ${wordEntry.word}, real_definition = NULL WHERE id = ${round.id}`;

  return NextResponse.json({ success: true, word: wordEntry.word });
}
