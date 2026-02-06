import { NextResponse } from "next/server";
import { sql } from "@/lib/db";

export async function POST(
  request: Request,
  { params }: { params: Promise<{ roomId: string }> }
) {
  try {
    const { roomId } = await params;
    const { playerId, definition } = await request.json();

    if (!definition || typeof definition !== "string" || definition.trim().length === 0) {
      return NextResponse.json({ error: "Se requiere una definicion" }, { status: 400 });
    }

    const rounds = await sql`
      SELECT r.* FROM rounds r
      JOIN rooms rm ON rm.id = r.room_id
      WHERE r.room_id = ${roomId} AND r.round_number = rm.current_round AND r.status = 'writing'
    `;
    if (rounds.length === 0) {
      return NextResponse.json({ error: "No hay ronda activa para escribir" }, { status: 400 });
    }

    const round = rounds[0];

    // Upsert definition
    const existing = await sql`
      SELECT * FROM definitions WHERE round_id = ${round.id} AND player_id = ${playerId}
    `;

    if (existing.length > 0) {
      await sql`
        UPDATE definitions SET definition = ${definition.trim()}, is_ready = false
        WHERE round_id = ${round.id} AND player_id = ${playerId}
      `;
    } else {
      await sql`
        INSERT INTO definitions (round_id, player_id, definition, is_ready)
        VALUES (${round.id}, ${playerId}, ${definition.trim()}, false)
      `;
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error submitting definition:", error);
    return NextResponse.json({ error: "Error al enviar la definicion" }, { status: 500 });
  }
}

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ roomId: string }> }
) {
  try {
    const { roomId } = await params;
    const { playerId } = await request.json();

    const rounds = await sql`
      SELECT r.* FROM rounds r
      JOIN rooms rm ON rm.id = r.room_id
      WHERE r.room_id = ${roomId} AND r.round_number = rm.current_round AND r.status = 'writing'
    `;
    if (rounds.length === 0) {
      return NextResponse.json({ error: "No hay ronda activa" }, { status: 400 });
    }

    const round = rounds[0];

    await sql`
      UPDATE definitions SET is_ready = true
      WHERE round_id = ${round.id} AND player_id = ${playerId}
    `;

    // Check if all players are ready
    const players = await sql`SELECT * FROM players WHERE room_id = ${roomId}`;
    const definitions = await sql`
      SELECT * FROM definitions WHERE round_id = ${round.id} AND is_ready = true
    `;

    if (definitions.length >= players.length) {
      // All players are ready, move to voting
      await sql`UPDATE rounds SET status = 'voting' WHERE id = ${round.id}`;
    }

    return NextResponse.json({ success: true, allReady: definitions.length >= players.length });
  } catch (error) {
    console.error("Error marking ready:", error);
    return NextResponse.json({ error: "Error al marcar listo" }, { status: 500 });
  }
}
