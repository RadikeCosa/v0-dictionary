import { BookOpen } from "lucide-react";
import type { Room, Round } from "@/lib/types";

interface RoundHeaderProps {
  room: Room;
  currentRound: Round;
}

export function RoundHeader({ room, currentRound }: RoundHeaderProps) {
  const phaseLabels: Record<string, string> = {
    writing: "Escribiendo definiciones",
    voting: "Votando",
    results: "Resultados",
  };

  return (
    <div className="flex flex-col items-center gap-2">
      <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-primary">
        <BookOpen className="w-5 h-5 text-primary-foreground" />
      </div>
      <h1 className="text-lg font-serif font-bold text-foreground">
        Ronda {room.current_round} de {room.max_rounds}
      </h1>
      <span className="text-xs px-3 py-1 rounded-full bg-secondary text-secondary-foreground font-medium">
        {phaseLabels[currentRound.status] ?? currentRound.status}
      </span>
    </div>
  );
}
