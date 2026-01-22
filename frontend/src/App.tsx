/* eslint-disable react-refresh/only-export-components */
/* eslint-disable @typescript-eslint/no-explicit-any */
// App.tsx (DROP-IN: Edit click will NEVER trigger description endpoint)
import * as React from "react";
import { useQueryClient } from "@tanstack/react-query";
import { type PlayersSort, useGetPlayers, useSyncPlayers } from "./api/hooks";
import type { Player } from "./api/schema";
import { EditPlayerDialog } from "./components/EditDialog";
import { PlayerDescriptionDialog } from "./components/PlayerDescriptionDialog";

function clamp(n: number, min: number, max: number) {
  return Math.max(min, Math.min(max, n));
}

export function normalizeRaw(raw: any): Record<string, any> {
  if (!raw) return {};
  if (typeof raw === "object" && !Array.isArray(raw)) return raw as Record<string, any>;
  if (typeof raw === "string") {
    try {
      const parsed = JSON.parse(raw);
      if (parsed && typeof parsed === "object" && !Array.isArray(parsed)) return parsed;
    } catch {
      // ignore
    }
  }
  return {};
}

function formatCell(v: any) {
  if (v == null) return "—";
  if (typeof v === "string" || typeof v === "number" || typeof v === "boolean") return String(v);
  return JSON.stringify(v);
}

function getRawKeysFromPlayers(players: Array<{ raw?: Record<string, any> | null }>) {
  const keys = new Set<string>();
  for (const p of players) {
    const raw = normalizeRaw(p.raw);
    for (const k of Object.keys(raw)) keys.add(k);
  }

  const preferred = ["Player name", "position", "Hits", "home run", "Games", "At-bat"];
  const all = Array.from(keys);

  all.sort((a, b) => {
    const ai = preferred.indexOf(a);
    const bi = preferred.indexOf(b);
    if (ai !== -1 || bi !== -1) return (ai === -1 ? 999 : ai) - (bi === -1 ? 999 : bi);
    return a.localeCompare(b);
  });

  return all;
}

export default function App() {
  const qc = useQueryClient();

  const [sort, setSort] = React.useState<PlayersSort>("hits");
  const { data, isLoading, isError } = useGetPlayers(sort);

  const [search, setSearch] = React.useState("");
  const [page, setPage] = React.useState(1);
  const pageSize = 20;

  const [selected, setSelected] = React.useState<Player | null>(null);
  const [descOpen, setDescOpen] = React.useState(false);
  const [editOpen, setEditOpen] = React.useState(false);

  const sync = useSyncPlayers();

  const players = React.useMemo(() => data?.items ?? [], [data]);

  React.useEffect(() => setPage(1), [sort, search]);

  const filtered = React.useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return players;
    return players.filter((p) =>
      String(normalizeRaw(p.raw)?.["Player name"] ?? p.name ?? "")
        .toLowerCase()
        .includes(q)
    );
  }, [players, search]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));
  const safePage = clamp(page, 1, totalPages);

  const paginated = React.useMemo(() => {
    const start = (safePage - 1) * pageSize;
    return filtered.slice(start, start + pageSize);
  }, [filtered, safePage]);

  const [rawKeys, setRawKeys] = React.useState<string[]>([]);
  React.useEffect(() => {
    if (rawKeys.length > 0) return;
    if (!players.length) return;
    setRawKeys(getRawKeysFromPlayers(players));
  }, [players, rawKeys.length]);

  // ✅ ONLY called when clicking the row (not the edit button)
  const openDescription = (p: Player) => {
    setSelected(p);

    // ✅ prefetch description ONLY here
    qc.prefetchQuery({
      queryKey: ["get-player-description", p.id],
      queryFn: async () => {
        const res = await fetch(`/api/players/${String(p.id)}/description`, { method: "GET" });
        if (!res.ok) throw new Error("Failed to load description");
        return res.json();
      },
      staleTime: 60_000,
    });

    setDescOpen(true);
  };

  // ✅ Edit click will never bubble to <tr onClick>, even in weird cases
  const openEdit = (p: Player, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    // extra safety: stop native event bubbling too
    // (helps if any parent uses native listeners)
    (e as any).nativeEvent?.stopImmediatePropagation?.();

    setSelected(p);
    setEditOpen(true);
  };

  const onSync = async () => {
    await sync.mutateAsync();
  };

  const totalCols = rawKeys.length + 1;

  return (
    <div className="p-6 space-y-4">
      <div className="flex items-center justify-between gap-3">
        <h1 className="text-xl font-semibold">Players</h1>

        <div className="flex items-center gap-2">
          <button
            className={`h-9 rounded-md border px-3 text-sm ${sort === "hits" ? "bg-muted" : ""}`}
            onClick={() => setSort("hits")}
          >
            Sort: Hits
          </button>
          <button
            className={`h-9 rounded-md border px-3 text-sm ${sort === "hr" ? "bg-muted" : ""}`}
            onClick={() => setSort("hr")}
          >
            Sort: HRs
          </button>

          <button
            className="h-9 rounded-md border px-3 text-sm disabled:opacity-50"
            onClick={onSync}
            disabled={sync.isPending}
            title="Fetch latest data from upstream and upsert into DB"
          >
            {sync.isPending ? "Syncing…" : "Sync"}
          </button>
        </div>
      </div>

      <div className="rounded-md border overflow-hidden">
        <div className="flex items-center gap-3 border-b p-3">
          <input
            className="h-10 w-full rounded-md border px-3 text-sm"
            placeholder="Search…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          <div className="text-xs text-muted-foreground whitespace-nowrap">
            {filtered.length} result{filtered.length === 1 ? "" : "s"}
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm table-fixed">
            <thead className="bg-muted/50">
              <tr className="text-left">
                {rawKeys.map((k) => (
                  <th key={k} className="px-3 py-2 whitespace-nowrap w-[180px]">
                    {k}
                  </th>
                ))}
                <th className="px-3 py-2 w-[1%]"></th>
              </tr>
            </thead>

            <tbody>
              {isLoading ? (
                <tr>
                  <td className="px-3 py-3 text-muted-foreground" colSpan={totalCols}>
                    Loading players…
                  </td>
                </tr>
              ) : isError ? (
                <tr>
                  <td className="px-3 py-3 text-red-600" colSpan={totalCols}>
                    Failed to load players.
                  </td>
                </tr>
              ) : paginated.length === 0 ? (
                <tr>
                  <td className="px-3 py-3 text-muted-foreground" colSpan={totalCols}>
                    No players found.
                  </td>
                </tr>
              ) : (
                paginated.map((p) => {
                  const rawObj = normalizeRaw(p.raw);

                  return (
                    <tr
                      key={p.id}
                      className="cursor-pointer hover:bg-muted/40"
                      onClick={() => openDescription(p)}
                    >
                      {rawKeys.map((k) => (
                        <td key={k} className="px-3 py-2 align-top">
                          <div className="truncate max-w-[180px]">{formatCell(rawObj[k])}</div>
                        </td>
                      ))}

                      <td className="px-3 py-2 text-right whitespace-nowrap">
                        {/* ✅ prevents row click from ever firing */}
                        <button
                          type="button"
                          className="h-8 rounded-md border px-3 text-xs"
                          onPointerDown={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            (e as any).nativeEvent?.stopImmediatePropagation?.();
                          }}
                          onClick={(e) => openEdit(p, e)}
                        >
                          Edit
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        <div className="flex items-center justify-between border-t p-3 text-sm">
          <div className="text-muted-foreground">
            Page {safePage} of {totalPages}
          </div>

          <div className="flex items-center gap-2">
            <button
              className="h-9 rounded-md border px-3 disabled:opacity-50"
              onClick={() => setPage(1)}
              disabled={safePage === 1}
            >
              First
            </button>
            <button
              className="h-9 rounded-md border px-3 disabled:opacity-50"
              onClick={() => setPage((p) => clamp(p - 1, 1, totalPages))}
              disabled={safePage === 1}
            >
              Prev
            </button>
            <button
              className="h-9 rounded-md border px-3 disabled:opacity-50"
              onClick={() => setPage((p) => clamp(p + 1, 1, totalPages))}
              disabled={safePage === totalPages}
            >
              Next
            </button>
            <button
              className="h-9 rounded-md border px-3 disabled:opacity-50"
              onClick={() => setPage(totalPages)}
              disabled={safePage === totalPages}
            >
              Last
            </button>
          </div>
        </div>
      </div>

      <PlayerDescriptionDialog
        open={descOpen}
        onOpenChange={setDescOpen}
        playerId={selected?.id ?? null}
        playerName={String(normalizeRaw(selected?.raw)?.["Player name"] ?? selected?.name ?? "") || null}
      />

      <EditPlayerDialog open={editOpen} onOpenChange={setEditOpen} player={selected} />
    </div>
  );
}
