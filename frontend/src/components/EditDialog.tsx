/* eslint-disable @typescript-eslint/no-explicit-any */
// src/components/players/EditPlayerDialog.tsx  (DROP-IN REPLACEMENT)
"use client";

import * as React from "react";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/ui/components/dialogs";
import type { Player, UpdatePlayerRequest } from "@/api/schema";
import { useUpdatePlayer } from "@/api/hooks";
import { normalizeRaw } from "@/App";

const RAW_KEY_ALIASES: Record<string, string> = {
  home_run: "home run",
  homeRun: "home run",
  homerun: "home run",
  HomeRun: "home run",

  hits: "Hits",
  Hits: "Hits",

  at_bat: "At-bat",
  atBat: "At-bat",
  atbat: "At-bat",
};

function canonicalRawKey(k: string) {
  return RAW_KEY_ALIASES[k] ?? k;
}

function buildCanonicalRaw(raw: Record<string, any>) {
  const out: Record<string, any> = {};
  for (const [k, v] of Object.entries(raw ?? {})) {
    out[canonicalRawKey(k)] = v;
  }
  return out;
}

function formatCell(v: any) {
  if (v == null) return "";
  if (typeof v === "string" || typeof v === "number" || typeof v === "boolean") return String(v);
  return JSON.stringify(v);
}

function parseCell(original: any, input: string) {
  const s = input.trim();
  if (s === "") return null;

  if (s.toLowerCase() === "true") return true;
  if (s.toLowerCase() === "false") return false;

  const n = Number(s);
  if (Number.isFinite(n) && /^[+-]?\d+(\.\d+)?$/.test(s)) return n;

  if (typeof original === "object" && original !== null) {
    try {
      return JSON.parse(s);
    } catch {
      // fall through
    }
  }

  return input;
}

function getRawKeys(raw: Record<string, any>) {
  const keys = Object.keys(raw ?? {});
  const preferred = ["Player name", "position", "Hits", "home run", "Games", "At-bat"];
  keys.sort((a, b) => {
    const ai = preferred.indexOf(a);
    const bi = preferred.indexOf(b);
    if (ai !== -1 || bi !== -1) return (ai === -1 ? 999 : ai) - (bi === -1 ? 999 : bi);
    return a.localeCompare(b);
  });
  return keys;
}

export function EditPlayerDialog({
  open,
  onOpenChange,
  player,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  player: Player | null;
}) {
  const update = useUpdatePlayer();

  const [raw, setRaw] = React.useState<Record<string, any>>({});
  const [draft, setDraft] = React.useState<Record<string, string>>({});

  React.useEffect(() => {
    if (!open) return;
    if (!player) return;

    // ✅ normalize + canonicalize keys ON LOAD so we only ever edit upstream keys
    const nextRaw = buildCanonicalRaw(normalizeRaw(player.raw));
    const keys = getRawKeys(nextRaw);

    const nextDraft: Record<string, string> = {};
    for (const k of keys) nextDraft[k] = formatCell(nextRaw[k]);

    setRaw(nextRaw);
    setDraft(nextDraft);
  }, [open, player]);

  const keys = React.useMemo(() => getRawKeys(raw), [raw]);

  const onChangeField = (key: string, value: string) => {
    const k = canonicalRawKey(key);

    setDraft((s) => ({ ...s, [k]: value }));
    setRaw((prev) => {
      const prevCanon = buildCanonicalRaw(prev);
      return {
        ...prevCanon,
        [k]: parseCell(prevCanon?.[k], value),
      };
    });
  };

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!player) return;

    // ✅ send canonical raw only (no home_run key can ever be created)
    const payload: UpdatePlayerRequest = { raw } as any;

    await update.mutateAsync({ playerId: player.id, payload });

    onOpenChange(false);
  };

  const disabled = update.isPending || !player;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[900px]">
        <DialogHeader>
          <DialogTitle>Edit Player Stats (Raw)</DialogTitle>
        </DialogHeader>

        <form onSubmit={onSubmit} className="space-y-4">
          <p className="text-sm text-muted-foreground">Editing raw upstream fields only.</p>

          <div className="max-h-[60vh] overflow-auto rounded-md border">
            <table className="w-full text-sm">
              <thead className="bg-muted/50 sticky top-0">
                <tr className="text-left">
                  <th className="px-3 py-2 w-[280px]">Field</th>
                  <th className="px-3 py-2">Value</th>
                </tr>
              </thead>

              <tbody>
                {keys.length === 0 ? (
                  <tr>
                    <td className="px-3 py-3 text-muted-foreground" colSpan={2}>
                      No raw fields found.
                    </td>
                  </tr>
                ) : (
                  keys.map((k) => (
                    <tr key={k} className="border-t">
                      <td className="px-3 py-2 align-top">
                        <div className="font-medium whitespace-nowrap">{k}</div>
                        <div className="text-xs text-muted-foreground">
                          type:{" "}
                          {raw?.[k] === null
                            ? "null"
                            : Array.isArray(raw?.[k])
                            ? "array"
                            : typeof raw?.[k]}
                        </div>
                      </td>

                      <td className="px-3 py-2">
                        <input
                          className="h-10 w-full rounded-md border px-3"
                          value={draft[k] ?? ""}
                          onChange={(e) => onChangeField(k, e.target.value)}
                          disabled={disabled}
                          placeholder="Enter value (number/text/true/false or JSON)"
                        />
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          <DialogFooter>
            <button
              type="button"
              className="h-10 rounded-md border px-4"
              onClick={() => onOpenChange(false)}
              disabled={disabled}
            >
              Cancel
            </button>

            <button
              type="submit"
              className="h-10 rounded-md bg-black px-4 text-white disabled:opacity-50"
              disabled={disabled}
            >
              {update.isPending ? "Saving…" : "Save"}
            </button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
