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
  const { data, isLoading, isError, error } = useGetPlayerDescription(playerId);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[680px]">
        <DialogHeader>
          <DialogTitle>{playerName ?? "Player"}</DialogTitle>
        </DialogHeader>

        <div className="space-y-3">
          {isLoading ? (
            <p className="text-sm text-muted-foreground">Generating description…</p>
          ) : isError ? (
            <p className="text-sm text-red-600">
              Failed to load description.
              {" "}
              {error instanceof Error ? error.message : null}
            </p>
          ) : (
            <>
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div><span className="text-muted-foreground">Team:</span> {data?.team ?? "—"}</div>
                <div><span className="text-muted-foreground">Position:</span> {data?.position ?? "—"}</div>
                <div><span className="text-muted-foreground">Hits:</span> {data?.hits ?? "—"}</div>
                <div><span className="text-muted-foreground">HRs:</span> {data?.home_runs ?? "—"}</div>
              </div>

              <div className="rounded-md border p-3">
                <p className="whitespace-pre-wrap text-sm leading-6">
                  {data?.description ?? "No description returned."}
                </p>
              </div>
            </>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
