-- Rooms table
CREATE TABLE IF NOT EXISTS rooms (
  id TEXT PRIMARY KEY,
  host_name TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'waiting', -- waiting, playing, finished
  current_round INTEGER NOT NULL DEFAULT 0,
  max_rounds INTEGER NOT NULL DEFAULT 5,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Players table
CREATE TABLE IF NOT EXISTS players (
  id TEXT PRIMARY KEY,
  room_id TEXT NOT NULL REFERENCES rooms(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  score INTEGER NOT NULL DEFAULT 0,
  is_host BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Rounds table
CREATE TABLE IF NOT EXISTS rounds (
  id SERIAL PRIMARY KEY,
  room_id TEXT NOT NULL REFERENCES rooms(id) ON DELETE CASCADE,
  round_number INTEGER NOT NULL,
  word TEXT NOT NULL,
  real_definition TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'writing', -- writing, revealing, scored
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(room_id, round_number)
);

-- Definitions table
CREATE TABLE IF NOT EXISTS definitions (
  id SERIAL PRIMARY KEY,
  round_id INTEGER NOT NULL REFERENCES rounds(id) ON DELETE CASCADE,
  player_id TEXT NOT NULL REFERENCES players(id) ON DELETE CASCADE,
  definition TEXT NOT NULL,
  is_ready BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(round_id, player_id)
);

-- Votes table
CREATE TABLE IF NOT EXISTS votes (
  id SERIAL PRIMARY KEY,
  round_id INTEGER NOT NULL REFERENCES rounds(id) ON DELETE CASCADE,
  voter_id TEXT NOT NULL REFERENCES players(id) ON DELETE CASCADE,
  voted_definition_id INTEGER REFERENCES definitions(id) ON DELETE CASCADE,
  voted_real BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(round_id, voter_id)
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_players_room ON players(room_id);
CREATE INDEX IF NOT EXISTS idx_rounds_room ON rounds(room_id);
CREATE INDEX IF NOT EXISTS idx_definitions_round ON definitions(round_id);
CREATE INDEX IF NOT EXISTS idx_votes_round ON votes(round_id);
