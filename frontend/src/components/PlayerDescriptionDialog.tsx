/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useGetPlayerDescription } from "@/api/hooks";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/ui/components/dialogs";

export function PlayerDescriptionDialog({
  open,
  onOpenChange,
  playerId,
  playerName,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  playerId: number | null;
  playerName: string | null;
}) {
  const shouldFetch = open && typeof playerId === "number";

  const { data, isLoading, isError, error } = useGetPlayerDescription(playerId, {
    enabled: shouldFetch,
  });

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-170">
        <DialogHeader>
          <DialogTitle>{playerName ?? "Player"}</DialogTitle>
        </DialogHeader>

        <div className="space-y-3">
          {!shouldFetch ? (
            <p className="text-sm text-muted-foreground">Open to view description.</p>
          ) : isLoading ? (
            <p className="text-sm text-muted-foreground">Generating description…</p>
          ) : isError ? (
            <p className="text-sm text-red-600">
              Failed to load description.{" "}
              {error instanceof Error ? error.message : null}
            </p>
          ) : (
            <>
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div>
                  <span className="text-muted-foreground">Team:</span> {(data as any)?.team ?? "—"}
                </div>
                <div>
                  <span className="text-muted-foreground">Position:</span>{" "}
                  {(data as any)?.position ?? "—"}
                </div>
                <div>
                  <span className="text-muted-foreground">Hits:</span> {(data as any)?.hits ?? "—"}
                </div>
                <div>
                  <span className="text-muted-foreground">HRs:</span> {(data as any)?.home_runs ?? "—"}
                </div>
              </div>

              <div className="rounded-md border p-3">
                <p className="whitespace-pre-wrap text-sm leading-6">
                  {(data as any)?.description ?? "No description returned."}
                </p>
              </div>
            </>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
