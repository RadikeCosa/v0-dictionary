"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { BookOpen, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface JoinScreenProps {
  roomId: string;
}

export function JoinScreen({ roomId }: JoinScreenProps) {
  const router = useRouter();
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // If already in the room, redirect
  useEffect(() => {
    const stored = localStorage.getItem(`player_${roomId}`);
    if (stored) {
      router.push(`/sala/${roomId}`);
    }
  }, [roomId, router]);

  async function handleJoin() {
    if (!name.trim()) {
      setError("Ingresa tu nombre");
      return;
    }
    setLoading(true);
    setError("");
    try {
      const res = await fetch(`/api/rooms/${roomId}/join`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ playerName: name.trim() }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      localStorage.setItem(`player_${roomId}`, data.playerId);
      router.push(`/sala/${roomId}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error al unirse");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="w-full max-w-md flex flex-col items-center gap-8">
      <div className="flex flex-col items-center gap-3 text-center">
        <div className="flex items-center justify-center w-16 h-16 rounded-2xl bg-primary">
          <BookOpen className="w-8 h-8 text-primary-foreground" />
        </div>
        <h1 className="text-3xl font-serif font-bold text-foreground text-balance">
          Unirse a la Sala
        </h1>
        <p className="text-muted-foreground">
          Codigo: <strong className="font-mono tracking-wider text-foreground">{roomId}</strong>
        </p>
      </div>

      <div className="w-full bg-card border border-border rounded-xl p-6 flex flex-col gap-4">
        <div className="flex flex-col gap-2">
          <Label htmlFor="player-name" className="text-card-foreground">Tu nombre</Label>
          <Input
            id="player-name"
            placeholder="Ej: Lucia"
            value={name}
            onChange={(e) => setName(e.target.value)}
            maxLength={20}
            className="h-12 text-base"
            onKeyDown={(e) => e.key === "Enter" && handleJoin()}
          />
        </div>
        {error && <p className="text-destructive text-sm">{error}</p>}
        <Button
          className="w-full h-12 text-base gap-2"
          onClick={handleJoin}
          disabled={loading}
        >
          <ArrowRight className="w-5 h-5" />
          {loading ? "Entrando..." : "Unirse"}
        </Button>
      </div>
    </div>
  );
}
