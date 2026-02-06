import { NextResponse } from "next/server";
import { neon } from "@neondatabase/serverless";
const sql = neon(process.env.DATABASE_URL!);
import { getRandomWord } from "@/lib/words";

export async function POST(
  request: Request,
  { params }: { params: { roomId: string } },
) {
  const roomId = params.roomId;
  // Get current round
  const [round] = (
    await sql`SELECT * FROM rounds WHERE room_id = ${roomId} ORDER BY id DESC LIMIT 1`
  ).rows;
  if (!round)
    return NextResponse.json({ error: "No round found" }, { status: 404 });

  // Get all definitions for this round
  const defs = (
    await sql`SELECT * FROM definitions WHERE round_id = ${round.id}`
  ).rows;
  // Check if any player is ready
  const anyReady = defs.some((d) => d.ready);
  if (anyReady)
    return NextResponse.json(
      { error: "Players already ready" },
      { status: 400 },
    );

  // Get used words
  const usedRounds = (
    await sql`SELECT word FROM rounds WHERE room_id = ${roomId}`
  ).rows;
  const usedWords = usedRounds.map((r) => r.word);

  // Add current word to used list
  if (!usedWords.includes(round.word)) usedWords.push(round.word);

  // Get new random word
  const newWord = getRandomWord(usedWords);
  if (!newWord)
    return NextResponse.json(
      { error: "No unused words left" },
      { status: 400 },
    );

  // Update round with new word
  await sql`UPDATE rounds SET word = ${newWord}, real_definition = NULL WHERE id = ${round.id}`;

  return NextResponse.json({ success: true, word: newWord });
}
