"use client";

import { useState } from "react";
import { BookOpen, CheckCircle2, XCircle, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { Room, Round, Player, Definition, Vote } from "@/lib/types";
import { RoundHeader } from "./round-header";
import { Scoreboard } from "./scoreboard";

interface ResultsPhaseProps {
  room: Room;
  currentRound: Round;
  players: Player[];
  definitions: Definition[];
  votes: Vote[];
  playerId: string;
  roomId: string;
  onRefresh: () => void;
}

export function ResultsPhase({
  room,
  currentRound,
  players,
  definitions,
  votes,
  playerId,
  roomId,
  onRefresh,
}: ResultsPhaseProps) {
  const [starting, setStarting] = useState(false);
  const [error, setError] = useState("");
  const isHost = players.find((p) => p.id === playerId)?.is_host ?? false;
  const isLastRound = room.current_round >= room.max_rounds;

  function getPlayerName(id: string) {
    return players.find((p) => p.id === id)?.name ?? "Desconocido";
  }

  function getVotersForDefinition(defId: number) {
    return votes
      .filter((v) => v.voted_definition_id === defId)
      .map((v) => getPlayerName(v.voter_id));
  }

  function getVotersForReal() {
    return votes
      .filter((v) => v.voted_real)
      .map((v) => getPlayerName(v.voter_id));
  }

  async function nextRound() {
    setStarting(true);
    setError("");
    try {
      const res = await fetch(`/api/rooms/${roomId}/start-round`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ playerId }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      onRefresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error");
    } finally {
      setStarting(false);
    }
  }

  const realVoters = getVotersForReal();

  return (
    <div className="w-full max-w-md flex flex-col items-center gap-6">
      <RoundHeader room={room} currentRound={currentRound} />

      {/* Word + real definition */}
      <div className="w-full bg-success rounded-xl p-5">
        <p className="text-xs uppercase tracking-widest text-success-foreground/70 mb-1">
          Definicion verdadera
        </p>
        <h2 className="text-2xl font-serif font-bold text-success-foreground capitalize mb-2">
          {currentRound.word}
        </h2>
        <p className="text-sm leading-relaxed text-success-foreground/90">
          {currentRound.real_definition}
        </p>
        {realVoters.length > 0 && (
          <div className="mt-3 flex flex-wrap gap-1">
            <CheckCircle2 className="w-4 h-4 text-success-foreground/70" />
            <span className="text-xs text-success-foreground/80">
              Adivinaron: {realVoters.join(", ")}
            </span>
          </div>
        )}
        {realVoters.length === 0 && (
          <p className="mt-3 text-xs text-success-foreground/70">
            Nadie adivino la verdadera.
          </p>
        )}
      </div>

      {/* Player definitions */}
      <div className="w-full flex flex-col gap-3">
        <p className="text-sm font-medium text-foreground flex items-center gap-2">
          <BookOpen className="w-4 h-4" />
          Definiciones de los jugadores
        </p>
        {definitions.map((def) => {
          const voters = getVotersForDefinition(def.id);
          const authorName = getPlayerName(def.player_id);
          const isYours = def.player_id === playerId;
          return (
            <div
              key={def.id}
              className={`w-full bg-card border rounded-xl p-4 ${
                isYours ? "border-primary/40" : "border-border"
              }`}
            >
              <div className="flex items-start justify-between gap-2 mb-2">
                <span className="text-xs font-semibold text-primary">
                  {authorName}
                  {isYours && <span className="text-muted-foreground font-normal"> (tu)</span>}
                </span>
                {voters.length > 0 && (
                  <span className="text-xs text-accent font-semibold flex-shrink-0">
                    +{voters.length} pt{voters.length > 1 ? "s" : ""}
                  </span>
                )}
              </div>
              <p className="text-sm leading-relaxed text-card-foreground italic">
                &ldquo;{def.definition}&rdquo;
              </p>
              {voters.length > 0 ? (
                <div className="mt-2 flex flex-wrap items-center gap-1">
                  <XCircle className="w-3 h-3 text-destructive" />
                  <span className="text-xs text-muted-foreground">
                    Cayeron: {voters.join(", ")}
                  </span>
                </div>
              ) : (
                <p className="mt-2 text-xs text-muted-foreground">
                  Nadie voto esta.
                </p>
              )}
            </div>
          );
        })}
      </div>

      {/* Scoreboard */}
      <Scoreboard players={players} playerId={playerId} />

      {/* Next round */}
      {isHost && (
        <div className="w-full flex flex-col gap-2">
          {error && <p className="text-destructive text-sm text-center">{error}</p>}
          <Button
            className="w-full h-12 text-base gap-2"
            onClick={nextRound}
            disabled={starting}
          >
            <ArrowRight className="w-5 h-5" />
            {starting
              ? "Cargando..."
              : isLastRound
                ? "Ver Resultados Finales"
                : "Siguiente Ronda"}
          </Button>
        </div>
      )}

      {!isHost && (
        <p className="text-sm text-muted-foreground text-center">
          Esperando a que el anfitrion {isLastRound ? "cierre la partida" : "inicie la siguiente ronda"}...
        </p>
      )}
    </div>
  );
}
