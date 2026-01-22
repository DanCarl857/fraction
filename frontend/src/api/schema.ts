// src/api/players/schema.ts
import { z } from "zod";

/**
 * Player shape coming from the backend.
 * IMPORTANT:
 * - "raw" is the full upstream object persisted in DB (JSON).
 * - hits/home_runs are stored columns, but you can also show raw fields in the table.
 */
export const PlayerSchema = z.object({
  id: z.number(),
  external_id: z.string().nullable().optional(),
  name: z.string().nullable().optional(),
  team: z.string().nullable().optional(),
  position: z.string().nullable().optional(),

  hits: z.number().int().nullable().optional(),
  home_runs: z.number().int().nullable().optional(),

  // raw: z.record(z.any()).nullable().optional(),
  raw: z.any().nullable().optional(),
});

export type Player = z.infer<typeof PlayerSchema>;

/**
 * Your list endpoint appears to return: { items: Player[] }
 * If your backend returns a bare array instead, change this to z.array(PlayerSchema)
 */
export const PlayersListSchema = z.object({
  items: z.array(PlayerSchema),
});

export type PlayersListResponse = z.infer<typeof PlayersListSchema>;

/**
 * Description endpoint: { description: string }
 * (If your backend returns { text: string } or similar, adjust here.)
 */
export const PlayerDescriptionSchema = z.object({
  description: z.string(),
});

export type PlayerDescriptionResponse = z.infer<typeof PlayerDescriptionSchema>;

/**
 * Sync endpoint response (adjust fields if your backend differs)
 */
export const SyncResponseSchema = z.object({
  received: z.number(),
  unique: z.number(),
  affected: z.number(),
  deduped_out: z.number(),
});

export type SyncResponse = z.infer<typeof SyncResponseSchema>;

/**
 * Update payload (edit dialog)
 * Add/remove fields to match your backend PUT /api/players/{id}
 */
export const UpdatePlayerRequestSchema = z.object({
  name: z.string().nullable().optional(),
  team: z.string().nullable().optional(),
  position: z.string().nullable().optional(),
  hits: z.number().int().nullable().optional(),
  home_runs: z.number().int().nullable().optional(),

  // optional: allow editing arbitrary raw fields if you want
  // raw: z.record(z.any()).nullable().optional(),
  raw: z.any().optional(),
});

export type UpdatePlayerRequest = z.infer<typeof UpdatePlayerRequestSchema>;

