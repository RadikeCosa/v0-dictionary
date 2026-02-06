import { BarChart3 } from "lucide-react";
import type { Player } from "@/lib/types";

interface ScoreboardProps {
  players: Player[];
  playerId: string;
}

export function Scoreboard({ players, playerId }: ScoreboardProps) {
  const sorted = [...players].sort((a, b) => b.score - a.score);
  const maxScore = Math.max(...sorted.map((p) => p.score), 1);

  return (
    <div className="w-full bg-card border border-border rounded-xl p-4">
      <div className="flex items-center gap-2 mb-3">
        <BarChart3 className="w-4 h-4 text-muted-foreground" />
        <p className="text-sm font-medium text-card-foreground">Puntaje</p>
      </div>
      <div className="flex flex-col gap-2">
        {sorted.map((player) => (
          <div key={player.id} className="flex items-center gap-3">
            <span className="w-20 text-xs font-medium text-secondary-foreground truncate">
              {player.name}
              {player.id === playerId ? " (tu)" : ""}
            </span>
            <div className="flex-1 h-5 bg-secondary rounded-full overflow-hidden">
              <div
                className="h-full bg-primary rounded-full transition-all duration-500"
                style={{ width: `${Math.max((player.score / maxScore) * 100, 4)}%` }}
              />
            </div>
            <span className="w-8 text-xs font-bold text-foreground text-right">
              {player.score}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
