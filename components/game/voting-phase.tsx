"use client";

import { useState, useMemo } from "react";
import { Vote, Check, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import type {
  Room,
  Round,
  Player,
  Definition,
  Vote as VoteType,
} from "@/lib/types";
import { RoundHeader } from "./round-header";

interface VotingPhaseProps {
  room: Room;
  currentRound: Round;
  players: Player[];
  definitions: Definition[];
  votes: VoteType[];
  playerId: string;
  roomId: string;
  onRefresh: () => void;
}

export function VotingPhase({
  room,
  currentRound,
  players,
  definitions,
  votes,
  playerId,
  roomId,
  onRefresh,
}: VotingPhaseProps) {
  const [selectedId, setSelectedId] = useState<number | "real" | null>(null);
  const [voting, setVoting] = useState(false);
  const [error, setError] = useState("");

  const hasVoted = votes.some((v) => v.voter_id === playerId);
  const voteCount = votes.length;

  // Mezclar definiciones + real de forma aleatoria y estable por ronda
  const allOptions = useMemo(() => {
    // Seeded PRNG for stable shuffling across remounts
    function seededRandom(seed: string) {
      let hash = 0;
      for (let i = 0; i < seed.length; i++) {
        hash = (hash << 5) - hash + seed.charCodeAt(i);
        hash = hash | 0; // Convert to 32-bit integer
      }
      return function () {
        // Linear Congruential Generator with better parameters
        hash = (hash * 1664525 + 1013904223) | 0;
        return (hash >>> 0) / 4294967296;
      };
    }

    const opts: { id: number | "real"; text: string; isReal: boolean }[] = [
      ...definitions
        .filter((d) => d.player_id !== playerId)
        .map((d) => ({
          id: d.id as number | "real",
          text: d.definition,
          isReal: false,
        })),
      { id: "real" as const, text: currentRound.real_definition, isReal: true },
    ];
    
    // Fisher-Yates shuffle with seeded random
    const rng = seededRandom(`${currentRound.id}-${playerId}`);
    for (let i = opts.length - 1; i > 0; i--) {
      const j = Math.floor(rng() * (i + 1));
      [opts[i], opts[j]] = [opts[j], opts[i]];
    }
    return opts;
  }, [currentRound.id, definitions, playerId]);

  async function submitVote() {
    if (selectedId === null) return;
    setVoting(true);
    setError("");
    try {
      const body: Record<string, unknown> = { playerId };
      if (selectedId === "real") {
        body.votedReal = true;
      } else {
        body.definitionId = selectedId;
      }
      const res = await fetch(`/api/rooms/${roomId}/vote`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      onRefresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error al votar");
    } finally {
      setVoting(false);
    }
  }

  return (
    <div className="w-full max-w-md flex flex-col items-center gap-6">
      <RoundHeader room={room} currentRound={currentRound} />

      {/* Word display */}
      <div className="w-full bg-primary rounded-xl p-5 text-center">
        <p className="text-xs uppercase tracking-widest text-primary-foreground/70 mb-1">
          La palabra es
        </p>
        <h2 className="text-3xl font-serif font-bold text-primary-foreground capitalize">
          {currentRound.word}
        </h2>
      </div>

      <div className="w-full flex items-center gap-2">
        <Vote className="w-4 h-4 text-primary" />
        <p className="text-sm font-medium text-foreground">
          {hasVoted
            ? "Ya votaste. Esperando al resto..."
            : "Vota la definicion que creas verdadera"}
        </p>
      </div>

      {/* Definitions to vote */}
      <div className="w-full flex flex-col gap-3">
        {allOptions.map((option, index) => {
          const letter = String.fromCharCode(65 + index);
          const isSelected = selectedId === option.id;
          return (
            <button
              key={String(option.id)}
              type="button"
              disabled={hasVoted}
              onClick={() => setSelectedId(option.id)}
              className={`w-full text-left p-4 rounded-xl border-2 transition-all ${
                isSelected
                  ? "border-primary bg-primary/5"
                  : hasVoted
                    ? "border-border bg-card opacity-60 cursor-default"
                    : "border-border bg-card hover:border-primary/40"
              }`}
            >
              <div className="flex gap-3">
                <span
                  className={`flex-shrink-0 w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold ${
                    isSelected
                      ? "bg-primary text-primary-foreground"
                      : "bg-secondary text-secondary-foreground"
                  }`}
                >
                  {letter}
                </span>
                <p className="text-sm leading-relaxed text-card-foreground">
                  {option.text}
                </p>
              </div>
            </button>
          );
        })}
      </div>

      {/* Submit vote */}
      {!hasVoted && (
        <>
          {error && <p className="text-destructive text-sm">{error}</p>}
          <Button
            className="w-full h-12 text-base gap-2"
            onClick={submitVote}
            disabled={voting || selectedId === null}
          >
            <Check className="w-4 h-4" />
            {voting ? "Votando..." : "Confirmar Voto"}
          </Button>
        </>
      )}

      {/* Vote progress */}
      <div className="w-full bg-card border border-border rounded-xl p-4">
        <div className="flex items-center gap-2">
          <Clock className="w-4 h-4 text-muted-foreground" />
          <p className="text-sm text-muted-foreground">
            Votos: {voteCount} / {players.length}
          </p>
        </div>
      </div>
    </div>
  );
}
