"use client";

import useSWR from "swr";
import type { GameState } from "@/lib/types";

const fetcher = (url: string) => fetch(url).then((r) => r.json());

export function useGame(roomId: string) {
  const { data, error, isLoading, mutate } = useSWR<GameState>(
    `/api/rooms/${roomId}/state`,
    fetcher,
    {
      refreshInterval: 2000,
      revalidateOnFocus: true,
    }
  );

  return {
    gameState: data,
    error,
    isLoading,
    refresh: mutate,
  };
}
