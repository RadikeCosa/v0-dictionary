import { NextResponse } from "next/server";
import { sql } from "@/lib/db";
import { nanoid } from "@/lib/nanoid";

export async function POST(
  request: Request,
  { params }: { params: Promise<{ roomId: string }> }
) {
  try {
    const { roomId } = await params;
    const { playerName } = await request.json();

    if (!playerName || typeof playerName !== "string" || playerName.trim().length === 0) {
      return NextResponse.json({ error: "Se requiere un nombre" }, { status: 400 });
    }

    const rooms = await sql`SELECT * FROM rooms WHERE id = ${roomId}`;
    if (rooms.length === 0) {
      return NextResponse.json({ error: "Sala no encontrada" }, { status: 404 });
    }

    if (rooms[0].status !== "waiting") {
      return NextResponse.json({ error: "La partida ya comenzo" }, { status: 400 });
    }

    const existingPlayers = await sql`
      SELECT * FROM players WHERE room_id = ${roomId} AND name = ${playerName.trim()}
    `;
    if (existingPlayers.length > 0) {
      return NextResponse.json({ error: "Ya hay un jugador con ese nombre" }, { status: 400 });
    }

    const playerId = nanoid(12);
    await sql`
      INSERT INTO players (id, room_id, name, is_host)
      VALUES (${playerId}, ${roomId}, ${playerName.trim()}, false)
    `;

    return NextResponse.json({ playerId, roomId });
  } catch (error) {
    console.error("Error joining room:", error);
    return NextResponse.json({ error: "Error al unirse a la sala" }, { status: 500 });
  }
}
