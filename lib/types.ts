export interface Room {
  id: string;
  host_name: string;
  status: "waiting" | "playing" | "finished";
  current_round: number;
  max_rounds: number;
  created_at: string;
}

export interface Player {
  id: string;
  room_id: string;
  name: string;
  score: number;
  is_host: boolean;
  created_at: string;
}

export interface Round {
  id: number;
  room_id: string;
  round_number: number;
  word: string;
  real_definition: string;
  status: "writing" | "voting" | "results";
  created_at: string;
}

export interface Definition {
  id: number;
  round_id: number;
  player_id: string;
  definition: string;
  is_ready: boolean;
  created_at: string;
}

export interface Vote {
  id: number;
  round_id: number;
  voter_id: string;
  voted_definition_id: number | null;
  voted_real: boolean;
  created_at: string;
}

export interface GameState {
  room: Room;
  players: Player[];
  currentRound: Round | null;
  definitions: Definition[];
  votes: Vote[];
}
