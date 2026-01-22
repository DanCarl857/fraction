// src/components/players/EditPlayerDialog.tsx
"use client";

import * as React from "react";
import { useUpdatePlayer } from "@/api/hooks";
import type { Player, UpdatePlayerRequest } from "@/api/schema";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/ui/components/dialogs";

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

  const [form, setForm] = React.useState<UpdatePlayerRequest>({
    name: "",
    team: "",
    position: "",
    hits: null,
    home_runs: null,
  });

  React.useEffect(() => {
    if (!player) return;
    setForm({
      name: player.name ?? "",
      team: player.team ?? "",
      position: player.position ?? "",
      hits: player.hits ?? null,
      home_runs: player.home_runs ?? null,
    });
  }, [player]);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!player) return;

    await update.mutateAsync({
      playerId: player.id,
      payload: {
        name: form.name,
        team: form.team || null,
        position: form.position || null,
        hits: form.hits ?? null,
        home_runs: form.home_runs ?? null,
      },
    });

    onOpenChange(false);
  };

  const disabled = update.isPending || !player;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[640px]">
        <DialogHeader>
          <DialogTitle>Edit Player</DialogTitle>
        </DialogHeader>

        <form onSubmit={onSubmit} className="space-y-4">
          <div className="grid gap-3">
            <label className="grid gap-1 text-sm">
              <span className="text-muted-foreground">Name</span>
              <input
                className="h-10 rounded-md border px-3"
                value={form.name}
                onChange={(e) => setForm((s) => ({ ...s, name: e.target.value }))}
                required
              />
            </label>

            <div className="grid grid-cols-2 gap-3">
              <label className="grid gap-1 text-sm">
                <span className="text-muted-foreground">Team</span>
                <input
                  className="h-10 rounded-md border px-3"
                  value={form.team ?? ""}
                  onChange={(e) => setForm((s) => ({ ...s, team: e.target.value }))}
                />
              </label>

              <label className="grid gap-1 text-sm">
                <span className="text-muted-foreground">Position</span>
                <input
                  className="h-10 rounded-md border px-3"
                  value={form.position ?? ""}
                  onChange={(e) => setForm((s) => ({ ...s, position: e.target.value }))}
                />
              </label>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <label className="grid gap-1 text-sm">
                <span className="text-muted-foreground">Hits</span>
                <input
                  className="h-10 rounded-md border px-3"
                  type="number"
                  value={form.hits ?? ""}
                  onChange={(e) =>
                    setForm((s) => ({
                      ...s,
                      hits: e.target.value === "" ? null : Number(e.target.value),
                    }))
                  }
                />
              </label>

              <label className="grid gap-1 text-sm">
                <span className="text-muted-foreground">Home Runs</span>
                <input
                  className="h-10 rounded-md border px-3"
                  type="number"
                  value={form.home_runs ?? ""}
                  onChange={(e) =>
                    setForm((s) => ({
                      ...s,
                      home_runs: e.target.value === "" ? null : Number(e.target.value),
                    }))
                  }
                />
              </label>
            </div>

            {update.isError ? (
              <p className="text-sm text-red-600">
                Failed to save changes.
              </p>
            ) : null}
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
