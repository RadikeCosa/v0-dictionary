import { NextResponse } from "next/server";
import { sql } from "@/lib/db";

export async function POST(
  request: Request,
  { params }: { params: Promise<{ roomId: string }> }
) {
  try {
    const { roomId } = await params;
    const { playerId, definitionId, votedReal } = await request.json();

    const rounds = await sql`
      SELECT r.* FROM rounds r
      JOIN rooms rm ON rm.id = r.room_id
      WHERE r.room_id = ${roomId} AND r.round_number = rm.current_round AND r.status = 'voting'
    `;
    if (rounds.length === 0) {
      return NextResponse.json({ error: "No hay ronda activa para votar" }, { status: 400 });
    }

    const round = rounds[0];

    // Check if already voted
    const existingVotes = await sql`
      SELECT * FROM votes WHERE round_id = ${round.id} AND voter_id = ${playerId}
    `;
    if (existingVotes.length > 0) {
      return NextResponse.json({ error: "Ya votaste en esta ronda" }, { status: 400 });
    }

    // Can't vote for your own definition
    if (definitionId) {
      const def = await sql`SELECT * FROM definitions WHERE id = ${definitionId}`;
      if (def.length > 0 && def[0].player_id === playerId) {
        return NextResponse.json({ error: "No podes votar tu propia definicion" }, { status: 400 });
      }
    }

    await sql`
      INSERT INTO votes (round_id, voter_id, voted_definition_id, voted_real)
      VALUES (${round.id}, ${playerId}, ${definitionId || null}, ${votedReal || false})
    `;

    // Check if all players voted
    const players = await sql`SELECT * FROM players WHERE room_id = ${roomId}`;
    const allVotes = await sql`SELECT * FROM votes WHERE round_id = ${round.id}`;

    if (allVotes.length >= players.length) {
      // Calculate scores
      // +3 points for guessing the real definition
      // +1 point for each player who voted for your fake definition
      for (const vote of allVotes) {
        if (vote.voted_real) {
          await sql`
            UPDATE players SET score = score + 3 WHERE id = ${vote.voter_id}
          `;
        }
        if (vote.voted_definition_id) {
          const votedDef = await sql`
            SELECT * FROM definitions WHERE id = ${vote.voted_definition_id}
          `;
          if (votedDef.length > 0 && votedDef[0].player_id !== vote.voter_id) {
            await sql`
              UPDATE players SET score = score + 1 WHERE id = ${votedDef[0].player_id}
            `;
          }
        }
      }

      await sql`UPDATE rounds SET status = 'results' WHERE id = ${round.id}`;
    }

    return NextResponse.json({ success: true, allVoted: allVotes.length >= players.length });
  } catch (error) {
    console.error("Error voting:", error);
    return NextResponse.json({ error: "Error al votar" }, { status: 500 });
  }
}
