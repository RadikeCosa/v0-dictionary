"use client";

import { useState } from "react";
import { PenLine, Check, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import type { Room, Round, Player, Definition } from "@/lib/types";
import { RoundHeader } from "./round-header";

interface WritingPhaseProps {
  room: Room;
  currentRound: Round;
  players: Player[];
  definitions: Definition[];
  playerId: string;
  roomId: string;
  onRefresh: () => void;
}

export function WritingPhase({
  room,
  currentRound,
  players,
  definitions,
  playerId,
  roomId,
  onRefresh,
}: WritingPhaseProps) {
  const myDefinition = definitions.find((d) => d.player_id === playerId);
  const [text, setText] = useState(myDefinition?.definition ?? "");
  const [saving, setSaving] = useState(false);
  const [readying, setReadying] = useState(false);
  const [error, setError] = useState("");
  const [saved, setSaved] = useState(!!myDefinition);
  const isReady = myDefinition?.is_ready ?? false;

  const readyCount = definitions.filter((d) => d.is_ready).length;
  const isAdmin = players.find((p) => p.id === playerId)?.is_host;

  async function saveDefinition() {
    if (!text.trim()) {
      setError("Escribe una definicion");
      return;
    }
    setSaving(true);
    setError("");
    try {
      const res = await fetch(`/api/rooms/${roomId}/definition`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ playerId, definition: text.trim() }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setSaved(true);
      onRefresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error al guardar");
    } finally {
      setSaving(false);
    }
  }
  async function skipWord() {
    setError("");
    try {
      const res = await fetch(`/api/rooms/${roomId}/skip-word`, {
        method: "POST",
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      onRefresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error al saltar palabra");
    }
  }

  async function markReady() {
    if (!saved) {
      await saveDefinition();
    }
    setReadying(true);
    setError("");
    try {
      const res = await fetch(`/api/rooms/${roomId}/definition`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ playerId }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      onRefresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error");
    } finally {
      setReadying(false);
    }
  }

  return (
    <div className="w-full max-w-md flex flex-col items-center gap-6">
      <RoundHeader room={room} currentRound={currentRound} />

      {/* Word display */}
      <div className="w-full bg-primary rounded-xl p-6 text-center">
        <p className="text-xs uppercase tracking-widest text-primary-foreground/70 mb-1">
          La palabra es
        </p>
        <h2 className="text-3xl font-serif font-bold text-primary-foreground capitalize">
          {currentRound.word}
        </h2>
      </div>

      {/* Writing area */}
      {!isReady ? (
        <div className="w-full bg-card border border-border rounded-xl p-5 flex flex-col gap-4">
          <div className="flex items-center gap-2">
            <PenLine className="w-4 h-4 text-primary" />
            <p className="text-sm font-medium text-card-foreground">
              Escribe tu definicion falsa
            </p>
          </div>
          <Textarea
            value={text}
            onChange={(e) => {
              setText(e.target.value);
              setSaved(false);
            }}
            placeholder="Escribe una definicion convincente..."
            rows={3}
            maxLength={300}
            className="resize-none text-base leading-relaxed"
          />
          <p className="text-xs text-muted-foreground text-right">
            {text.length}/300
          </p>
          {error && <p className="text-destructive text-sm">{error}</p>}
          <div className="flex gap-2">
            <Button
              variant="outline"
              className="flex-1 bg-transparent"
              onClick={saveDefinition}
              disabled={saving || !text.trim()}
            >
              {saving ? "Guardando..." : saved ? "Guardada" : "Guardar"}
            </Button>
            <Button
              className="flex-1 gap-2"
              onClick={markReady}
              disabled={readying || !text.trim()}
            >
              <Check className="w-4 h-4" />
              {readying ? "Enviando..." : "Listo"}
            </Button>
          </div>
          {isAdmin && readyCount === 0 && !isReady && (
            <Button variant="outline" onClick={skipWord} className="mt-4">
              Saltar palabra
            </Button>
          )}
        </div>
      ) : (
        <div className="w-full bg-card border border-success rounded-xl p-5 flex flex-col items-center gap-3">
          <Check className="w-8 h-8 text-success" />
          <p className="text-sm font-medium text-card-foreground">
            Tu definicion fue enviada
          </p>
          <p className="text-xs text-muted-foreground text-center italic">
            &ldquo;{myDefinition?.definition}&rdquo;
          </p>
        </div>
      )}

      {/* Ready status */}
      <div className="w-full bg-card border border-border rounded-xl p-4">
        <div className="flex items-center gap-2 mb-3">
          <Clock className="w-4 h-4 text-muted-foreground" />
          <p className="text-sm font-medium text-card-foreground">
            Listos: {readyCount} / {players.length}
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          {players.map((player) => {
            const def = definitions.find((d) => d.player_id === player.id);
            const ready = def?.is_ready ?? false;
            return (
              <span
                key={player.id}
                className={`px-3 py-1 rounded-full text-xs font-medium ${
                  ready
                    ? "bg-success text-success-foreground"
                    : "bg-secondary text-secondary-foreground"
                }`}
              >
                {player.name}
              </span>
            );
          })}
        </div>
      </div>
    </div>
  );
}
