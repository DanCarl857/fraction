// src/api/players/schemas.ts
import { z } from "zod";

export const PlayerSchema = z.object({
  id: z.number(),
  external_id: z.string(),
  name: z.string(),
  team: z.string().nullable().optional(),
  position: z.string().nullable().optional(),
  hits: z.number().nullable().optional(),
  home_runs: z.number().nullable().optional(),
  description: z.string().nullable().optional(),
});

export const PlayersListSchema = z.array(PlayerSchema);

export const PlayerDescriptionSchema = z.object({
  id: z.number(),
  external_id: z.string(),
  name: z.string(),
  team: z.string().nullable().optional(),
  position: z.string().nullable().optional(),
  hits: z.number().nullable().optional(),
  home_runs: z.number().nullable().optional(),
  description: z.string(),
});

export const UpdatePlayerRequestSchema = z.object({
  name: z.string(),
  team: z.string().nullable().optional(),
  position: z.string().nullable().optional(),
  hits: z.number().int().nullable().optional(),
  home_runs: z.number().int().nullable().optional(),
});

export type Player = z.infer<typeof PlayerSchema>;
export type PlayerDescription = z.infer<typeof PlayerDescriptionSchema>;
export type UpdatePlayerRequest = z.infer<typeof UpdatePlayerRequestSchema>;
