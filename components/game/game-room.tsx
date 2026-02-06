"use client";

import { useEffect, useState } from "react";
import { useGame } from "@/lib/use-game";
import { WaitingRoom } from "./waiting-room";
import { WritingPhase } from "./writing-phase";
import { VotingPhase } from "./voting-phase";
import { ResultsPhase } from "./results-phase";
import { GameOver } from "./game-over";
import { BookOpen, Loader2 } from "lucide-react";

export function GameRoom({ roomId }: { roomId: string }) {
  const [playerId, setPlayerId] = useState<string | null>(null);
  const { gameState, isLoading, refresh } = useGame(roomId);

  useEffect(() => {
    const stored = localStorage.getItem(`player_${roomId}`);
    setPlayerId(stored);
  }, [roomId]);

  if (isLoading || !gameState) {
    return (
      <div className="flex flex-col items-center gap-4 mt-20">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
        <p className="text-muted-foreground">Cargando sala...</p>
      </div>
    );
  }

  if (gameState.error) {
    return (
      <div className="flex flex-col items-center gap-4 mt-20 text-center">
        <BookOpen className="w-12 h-12 text-muted-foreground" />
        <p className="text-destructive text-lg font-medium">
          {gameState.error as unknown as string}
        </p>
      </div>
    );
  }

  if (!playerId) {
    return (
      <div className="flex flex-col items-center gap-4 mt-20 text-center">
        <BookOpen className="w-12 h-12 text-muted-foreground" />
        <p className="text-muted-foreground">
          No estas registrado en esta sala.
        </p>
        <a
          href={`/sala/${roomId}/unirse`}
          className="text-primary underline font-medium"
        >
          Unirse a la sala
        </a>
      </div>
    );
  }

  const { room, players, currentRound, definitions, votes } = gameState;

  // Game finished
  if (room.status === "finished") {
    return <GameOver players={players} roomId={roomId} />;
  }

  // Waiting room
  if (room.status === "waiting" || (room.status === "playing" && !currentRound)) {
    return (
      <WaitingRoom
        room={room}
        players={players}
        playerId={playerId}
        roomId={roomId}
        onRefresh={refresh}
      />
    );
  }

  // Playing - check round status
  if (currentRound) {
    if (currentRound.status === "writing") {
      return (
        <WritingPhase
          room={room}
          currentRound={currentRound}
          players={players}
          definitions={definitions}
          playerId={playerId}
          roomId={roomId}
          onRefresh={refresh}
        />
      );
    }

    if (currentRound.status === "voting") {
      return (
        <VotingPhase
          room={room}
          currentRound={currentRound}
          players={players}
          definitions={definitions}
          votes={votes}
          playerId={playerId}
          roomId={roomId}
          onRefresh={refresh}
        />
      );
    }

    if (currentRound.status === "results") {
      return (
        <ResultsPhase
          room={room}
          currentRound={currentRound}
          players={players}
          definitions={definitions}
          votes={votes}
          playerId={playerId}
          roomId={roomId}
          onRefresh={refresh}
        />
      );
    }
  }

  return null;
}
