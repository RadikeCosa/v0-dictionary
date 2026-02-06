"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { BookOpen, Users, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export function HomeScreen() {
  const router = useRouter();
  const [mode, setMode] = useState<"idle" | "create" | "join">("idle");
  const [name, setName] = useState("");
  const [roomCode, setRoomCode] = useState("");
  const [maxRounds, setMaxRounds] = useState(5);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleCreate() {
    if (!name.trim()) {
      setError("Ingresa tu nombre");
      return;
    }
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/rooms", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ hostName: name.trim(), maxRounds }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      localStorage.setItem(`player_${data.roomId}`, data.playerId);
      router.push(`/sala/${data.roomId}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error al crear la sala");
    } finally {
      setLoading(false);
    }
  }

  async function handleJoin() {
    if (!name.trim()) {
      setError("Ingresa tu nombre");
      return;
    }
    if (!roomCode.trim()) {
      setError("Ingresa el codigo de la sala");
      return;
    }
    setLoading(true);
    setError("");
    try {
      const code = roomCode.trim().toUpperCase();
      const res = await fetch(`/api/rooms/${code}/join`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ playerName: name.trim() }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      localStorage.setItem(`player_${code}`, data.playerId);
      router.push(`/sala/${code}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error al unirse");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="w-full max-w-md flex flex-col items-center gap-8">
      {/* Logo / Title */}
      <div className="flex flex-col items-center gap-3 text-center">
        <div className="flex items-center justify-center w-16 h-16 rounded-2xl bg-primary">
          <BookOpen className="w-8 h-8 text-primary-foreground" />
        </div>
        <h1 className="text-4xl font-serif font-bold text-foreground text-balance">
          El Diccionario
        </h1>
        <p className="text-muted-foreground text-balance leading-relaxed">
          Inventa definiciones, engana a tus amigos y adivina la verdadera.
        </p>
      </div>

      {/* Mode selector */}
      {mode === "idle" && (
        <div className="w-full flex flex-col gap-3">
          <Button
            size="lg"
            className="w-full gap-2 text-base h-14"
            onClick={() => setMode("create")}
          >
            <Users className="w-5 h-5" />
            Crear Sala
          </Button>
          <Button
            size="lg"
            variant="outline"
            className="w-full gap-2 text-base h-14 bg-transparent"
            onClick={() => setMode("join")}
          >
            <ArrowRight className="w-5 h-5" />
            Unirse a Sala
          </Button>
        </div>
      )}

      {/* Create room form */}
      {mode === "create" && (
        <div className="w-full flex flex-col gap-4 bg-card border border-border rounded-xl p-6">
          <h2 className="text-lg font-serif font-semibold text-card-foreground">
            Crear nueva sala
          </h2>
          <div className="flex flex-col gap-2">
            <Label htmlFor="create-name" className="text-card-foreground">Tu nombre</Label>
            <Input
              id="create-name"
              placeholder="Ej: Martin"
              value={name}
              onChange={(e) => setName(e.target.value)}
              maxLength={20}
              className="h-12 text-base"
            />
          </div>
          <div className="flex flex-col gap-2">
            <Label htmlFor="max-rounds" className="text-card-foreground">Cantidad de rondas</Label>
            <div className="flex items-center gap-3">
              {[3, 5, 7, 10].map((n) => (
                <button
                  key={n}
                  type="button"
                  onClick={() => setMaxRounds(n)}
                  className={`flex-1 h-10 rounded-lg border text-sm font-medium transition-colors ${
                    maxRounds === n
                      ? "bg-primary text-primary-foreground border-primary"
                      : "bg-card text-card-foreground border-border hover:bg-secondary"
                  }`}
                >
                  {n}
                </button>
              ))}
            </div>
          </div>
          {error && <p className="text-destructive text-sm">{error}</p>}
          <div className="flex gap-2">
            <Button
              variant="outline"
              className="flex-1 bg-transparent"
              onClick={() => { setMode("idle"); setError(""); }}
            >
              Volver
            </Button>
            <Button
              className="flex-1"
              onClick={handleCreate}
              disabled={loading}
            >
              {loading ? "Creando..." : "Crear Sala"}
            </Button>
          </div>
        </div>
      )}

      {/* Join room form */}
      {mode === "join" && (
        <div className="w-full flex flex-col gap-4 bg-card border border-border rounded-xl p-6">
          <h2 className="text-lg font-serif font-semibold text-card-foreground">
            Unirse a una sala
          </h2>
          <div className="flex flex-col gap-2">
            <Label htmlFor="join-name" className="text-card-foreground">Tu nombre</Label>
            <Input
              id="join-name"
              placeholder="Ej: Lucia"
              value={name}
              onChange={(e) => setName(e.target.value)}
              maxLength={20}
              className="h-12 text-base"
            />
          </div>
          <div className="flex flex-col gap-2">
            <Label htmlFor="room-code" className="text-card-foreground">Codigo de sala</Label>
            <Input
              id="room-code"
              placeholder="Ej: ABC123"
              value={roomCode}
              onChange={(e) => setRoomCode(e.target.value.toUpperCase())}
              maxLength={6}
              className="h-12 text-base uppercase tracking-widest text-center font-mono"
            />
          </div>
          {error && <p className="text-destructive text-sm">{error}</p>}
          <div className="flex gap-2">
            <Button
              variant="outline"
              className="flex-1 bg-transparent"
              onClick={() => { setMode("idle"); setError(""); }}
            >
              Volver
            </Button>
            <Button
              className="flex-1"
              onClick={handleJoin}
              disabled={loading}
            >
              {loading ? "Entrando..." : "Unirse"}
            </Button>
          </div>
        </div>
      )}

      {/* Rules */}
      <div className="w-full bg-card border border-border rounded-xl p-6">
        <h3 className="font-serif font-semibold text-card-foreground mb-3">Como se juega</h3>
        <ol className="flex flex-col gap-2 text-sm text-muted-foreground leading-relaxed">
          <li className="flex gap-2">
            <span className="flex-shrink-0 w-6 h-6 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-xs font-bold">1</span>
            <span>Se muestra una palabra poco comun a todos los jugadores.</span>
          </li>
          <li className="flex gap-2">
            <span className="flex-shrink-0 w-6 h-6 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-xs font-bold">2</span>
            <span>Cada uno inventa una definicion falsa y la envia.</span>
          </li>
          <li className="flex gap-2">
            <span className="flex-shrink-0 w-6 h-6 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-xs font-bold">3</span>
            <span>Se muestran todas las definiciones (falsas + la verdadera) y votas cual crees que es la real.</span>
          </li>
          <li className="flex gap-2">
            <span className="flex-shrink-0 w-6 h-6 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-xs font-bold">4</span>
            <span><strong className="text-card-foreground">+3 pts</strong> si adivinas la verdadera. <strong className="text-card-foreground">+1 pt</strong> por cada jugador que vota tu definicion falsa.</span>
          </li>
        </ol>
      </div>
    </div>
  );
}
