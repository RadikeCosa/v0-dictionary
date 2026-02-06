"use client";

import { useState } from "react";
import { Copy, Check, Play, Users, BookOpen } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { Room, Player } from "@/lib/types";
import { Scoreboard } from "./scoreboard";

interface WaitingRoomProps {
  room: Room;
  players: Player[];
  playerId: string;
  roomId: string;
  onRefresh: () => void;
}

export function WaitingRoom({ room, players, playerId, roomId, onRefresh }: WaitingRoomProps) {
  const [copied, setCopied] = useState(false);
  const [starting, setStarting] = useState(false);
  const [error, setError] = useState("");

  const isHost = players.find((p) => p.id === playerId)?.is_host ?? false;
  const inviteUrl = typeof window !== "undefined" ? `${window.location.origin}/sala/${roomId}/unirse` : "";

  async function copyLink() {
    try {
      await navigator.clipboard.writeText(inviteUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Fallback: select text
    }
  }

  async function startGame() {
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
      setError(err instanceof Error ? err.message : "Error al iniciar");
    } finally {
      setStarting(false);
    }
  }

  return (
    <div className="w-full max-w-md flex flex-col items-center gap-6">
      <div className="flex flex-col items-center gap-2">
        <div className="flex items-center justify-center w-12 h-12 rounded-xl bg-primary">
          <BookOpen className="w-6 h-6 text-primary-foreground" />
        </div>
        <h1 className="text-2xl font-serif font-bold text-foreground">Sala {roomId}</h1>
        <p className="text-sm text-muted-foreground">
          {room.status === "waiting" ? "Esperando jugadores..." : `Ronda ${room.current_round} de ${room.max_rounds}`}
        </p>
      </div>

      {/* Invite link */}
      <div className="w-full bg-card border border-border rounded-xl p-4 flex flex-col gap-3">
        <p className="text-sm font-medium text-card-foreground">Invita a tus amigos</p>
        <div className="flex gap-2">
          <code className="flex-1 bg-secondary text-secondary-foreground rounded-lg px-3 py-2 text-xs truncate flex items-center">
            {inviteUrl}
          </code>
          <Button variant="outline" size="icon" onClick={copyLink} className="shrink-0 bg-transparent">
            {copied ? <Check className="w-4 h-4 text-success" /> : <Copy className="w-4 h-4" />}
          </Button>
        </div>
        <p className="text-xs text-muted-foreground">
          O comparte el codigo: <strong className="text-card-foreground font-mono tracking-wider">{roomId}</strong>
        </p>
      </div>

      {/* Player list */}
      <div className="w-full bg-card border border-border rounded-xl p-4">
        <div className="flex items-center gap-2 mb-3">
          <Users className="w-4 h-4 text-muted-foreground" />
          <p className="text-sm font-medium text-card-foreground">
            Jugadores ({players.length})
          </p>
        </div>
        <div className="flex flex-col gap-2">
          {players.map((player) => (
            <div
              key={player.id}
              className="flex items-center justify-between bg-secondary rounded-lg px-3 py-2"
            >
              <span className="text-sm font-medium text-secondary-foreground">
                {player.name}
                {player.is_host && (
                  <span className="ml-2 text-xs text-primary font-normal">Anfitrion</span>
                )}
              </span>
              {player.id === playerId && (
                <span className="text-xs text-muted-foreground">Tu</span>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Scoreboard if game in progress */}
      {room.current_round > 0 && <Scoreboard players={players} playerId={playerId} />}

      {/* Start game button (host only) */}
      {isHost && (
        <div className="w-full flex flex-col gap-2">
          {error && <p className="text-destructive text-sm text-center">{error}</p>}
          <Button
            className="w-full h-12 text-base gap-2"
            onClick={startGame}
            disabled={starting || players.length < 2}
          >
            <Play className="w-5 h-5" />
            {starting
              ? "Iniciando..."
              : room.current_round === 0
                ? players.length < 2
                  ? "Se necesitan al menos 2 jugadores"
                  : "Iniciar Partida"
                : "Siguiente Ronda"}
          </Button>
        </div>
      )}

      {!isHost && room.status === "waiting" && (
        <p className="text-sm text-muted-foreground text-center">
          Esperando a que el anfitrion inicie la partida...
        </p>
      )}
    </div>
  );
}
