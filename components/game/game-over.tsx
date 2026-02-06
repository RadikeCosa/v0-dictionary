"use client";

import { Trophy, Medal, Home } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { Player } from "@/lib/types";
import Link from "next/link";

interface GameOverProps {
  players: Player[];
  roomId: string;
}

export function GameOver({ players, roomId }: GameOverProps) {
  const sorted = [...players].sort((a, b) => b.score - a.score);
  const winner = sorted[0];

  return (
    <div className="w-full max-w-md flex flex-col items-center gap-6">
      <div className="flex flex-col items-center gap-3 text-center">
        <div className="flex items-center justify-center w-16 h-16 rounded-2xl bg-primary">
          <Trophy className="w-8 h-8 text-primary-foreground" />
        </div>
        <h1 className="text-3xl font-serif font-bold text-foreground text-balance">
          Fin de la Partida
        </h1>
        <p className="text-muted-foreground">Sala {roomId}</p>
      </div>

      {/* Winner */}
      {winner && (
        <div className="w-full bg-primary rounded-xl p-6 text-center">
          <p className="text-xs uppercase tracking-widest text-primary-foreground/70 mb-1">
            Ganador
          </p>
          <h2 className="text-2xl font-serif font-bold text-primary-foreground">
            {winner.name}
          </h2>
          <p className="text-lg text-primary-foreground/90 font-medium">
            {winner.score} puntos
          </p>
        </div>
      )}

      {/* Ranking */}
      <div className="w-full bg-card border border-border rounded-xl p-4">
        <p className="text-sm font-medium text-card-foreground mb-3">Ranking Final</p>
        <div className="flex flex-col gap-2">
          {sorted.map((player, index) => (
            <div
              key={player.id}
              className={`flex items-center justify-between px-4 py-3 rounded-lg ${
                index === 0
                  ? "bg-primary/10"
                  : "bg-secondary"
              }`}
            >
              <div className="flex items-center gap-3">
                <span className="flex-shrink-0">
                  {index === 0 ? (
                    <Trophy className="w-5 h-5 text-primary" />
                  ) : index === 1 ? (
                    <Medal className="w-5 h-5 text-muted-foreground" />
                  ) : (
                    <span className="w-5 h-5 flex items-center justify-center text-xs font-bold text-muted-foreground">
                      {index + 1}
                    </span>
                  )}
                </span>
                <span className={`text-sm font-medium ${index === 0 ? "text-primary" : "text-secondary-foreground"}`}>
                  {player.name}
                </span>
              </div>
              <span className={`text-sm font-bold ${index === 0 ? "text-primary" : "text-muted-foreground"}`}>
                {player.score} pts
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Back to home */}
      <Link href="/" className="w-full">
        <Button variant="outline" className="w-full h-12 text-base gap-2 bg-transparent">
          <Home className="w-5 h-5" />
          Volver al Inicio
        </Button>
      </Link>
    </div>
  );
}
