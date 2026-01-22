/* eslint-disable @typescript-eslint/no-explicit-any */
// src/api/players/hooks.ts  (DROP-IN REPLACEMENT for useGetPlayerDescription)
// ✅ when description is generated, patch caches so subsequent clicks are instant
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { apiFetch } from "@/core/api/apiClient";
import { requestBody, responseBody } from "@/core/api/fetcher";
import {
  PlayerDescriptionSchema,
  PlayerSchema,
  PlayersListSchema,
  SyncResponseSchema,
  UpdatePlayerRequestSchema,
  type UpdatePlayerRequest,
  // type Player,
} from "./schema";

export type PlayersSort = "hits" | "hr";

export function useGetPlayers(sort: PlayersSort) {
  return useQuery({
    queryKey: ["get-players", sort],
    queryFn: async () =>
      apiFetch({
        endpoint: `/api/players?sort=${encodeURIComponent(sort)}`,
        method: "GET",
        response: responseBody(PlayersListSchema),
      }),
  });
}

export function useGetPlayer(playerId: number | null) {
  return useQuery({
    queryKey: ["get-player", playerId],
    enabled: playerId != null,
    queryFn: async () =>
      apiFetch({
        endpoint: `/api/players/${String(playerId)}`,
        method: "GET",
        response: responseBody(PlayerSchema),
      }),
  });
}

export function useGetPlayerDescription(
  playerId: number | null,
  opts?: { enabled?: boolean },
) {
  const qc = useQueryClient();

  const enabled = (opts?.enabled ?? true) && playerId != null;

  return useQuery({
    queryKey: ["get-player-description", playerId],
    enabled,
    queryFn: async () => {
      const desc = await apiFetch({
        endpoint: `/api/players/${String(playerId)}/description`,
        method: "GET",
        response: responseBody(PlayerDescriptionSchema),
      });
      qc.setQueryData(["get-player-description", playerId], desc);

      return desc;
    },
  });
}

export function useUpdatePlayer() {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: async ({
      playerId,
      payload,
    }: {
      playerId: number;
      payload: UpdatePlayerRequest;
    }) => {
      const parsed = UpdatePlayerRequestSchema.parse(payload);

      return apiFetch({
        endpoint: `/api/players/${String(playerId)}`,
        method: "PUT",
        config: { data: requestBody(parsed) },
        response: responseBody(PlayerSchema),
      });
    },

    onSuccess: async (updatedPlayer) => {
      // ✅ Refetch EVERYTHING so you never end up with duplicates from cache patching
      await qc.invalidateQueries({ queryKey: ["get-players"] });
      await qc.invalidateQueries({ queryKey: ["get-player", updatedPlayer.id] });
      // await qc.invalidateQueries({ queryKey: ["get-player-description", updatedPlayer.id] });
    },
  });
}

export function useSyncPlayers() {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: async () =>
      apiFetch({
        endpoint: "/api/sync",
        method: "POST",
        response: responseBody(SyncResponseSchema),
      }),
    onSuccess: async () => {
      await qc.invalidateQueries({ queryKey: ["get-players"] });
    },
  });
}
