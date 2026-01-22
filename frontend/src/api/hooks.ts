// src/api/players/hooks.ts
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { z } from "zod";

import { apiFetch } from "@/core/api/apiClient";
import { requestBody, responseBody } from "@/core/api/fetcher";
import { PlayerDescriptionSchema, PlayersListSchema, UpdatePlayerRequestSchema, type UpdatePlayerRequest } from "./schema";

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

export function useGetPlayerDescription(playerId: number | null) {
  return useQuery({
    queryKey: ["get-player-description", playerId],
    enabled: playerId != null,
    queryFn: async () =>
      apiFetch({
        endpoint: `/api/players/${String(playerId)}/description`,
        method: "GET",
        response: responseBody(PlayerDescriptionSchema),
      }),
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
      // validate payload on the client
      const parsed = UpdatePlayerRequestSchema.parse(payload);

      return apiFetch({
        endpoint: `/api/players/${String(playerId)}`,
        method: "PUT",
        config: {
          data: requestBody(parsed),
        },
        response: responseBody(z.unknown()),
      });
    },
    onSuccess: async (_data, variables) => {
      // refresh list + description cache
      await qc.invalidateQueries({ queryKey: ["get-players"] });
      await qc.invalidateQueries({
        queryKey: ["get-player-description", variables.playerId],
      });
    },
  });
}
