import { NextResponse } from "next/server";
import { sql } from "@/lib/db";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ roomId: string }> }
) {
  try {
    const { roomId } = await params;

    const rooms = await sql`SELECT * FROM rooms WHERE id = ${roomId}`;
    if (rooms.length === 0) {
      return NextResponse.json({ error: "Sala no encontrada" }, { status: 404 });
    }

    const room = rooms[0];
    const players = await sql`
      SELECT * FROM players WHERE room_id = ${roomId} ORDER BY created_at ASC
    `;

    let currentRound = null;
    let definitions: Record<string, unknown>[] = [];
    let votes: Record<string, unknown>[] = [];

    if (room.current_round > 0) {
      const rounds = await sql`
        SELECT * FROM rounds WHERE room_id = ${roomId} AND round_number = ${room.current_round}
      `;
      if (rounds.length > 0) {
        currentRound = rounds[0];
        definitions = await sql`
          SELECT * FROM definitions WHERE round_id = ${currentRound.id} ORDER BY created_at ASC
        `;
        votes = await sql`
          SELECT * FROM votes WHERE round_id = ${currentRound.id}
        `;
      }
    }

    return NextResponse.json({
      room,
      players,
      currentRound,
      definitions,
      votes,
    });
  } catch (error) {
    console.error("Error fetching game state:", error);
    return NextResponse.json({ error: "Error al obtener el estado" }, { status: 500 });
  }
}
