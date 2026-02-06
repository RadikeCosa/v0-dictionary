import { NextResponse } from "next/server";
import { sql } from "@/lib/db";
import { nanoid } from "@/lib/nanoid";

export async function POST(request: Request) {
  try {
    const { hostName, maxRounds } = await request.json();

    if (!hostName || typeof hostName !== "string" || hostName.trim().length === 0) {
      return NextResponse.json({ error: "Se requiere un nombre" }, { status: 400 });
    }

    const roomId = nanoid(6).toUpperCase();
    const playerId = nanoid(12);

    await sql`
      INSERT INTO rooms (id, host_name, status, max_rounds)
      VALUES (${roomId}, ${hostName.trim()}, 'waiting', ${maxRounds || 5})
    `;

    await sql`
      INSERT INTO players (id, room_id, name, is_host)
      VALUES (${playerId}, ${roomId}, ${hostName.trim()}, true)
    `;

    return NextResponse.json({ roomId, playerId });
  } catch (error) {
    console.error("Error creating room:", error);
    return NextResponse.json({ error: "Error al crear la sala" }, { status: 500 });
  }
}
