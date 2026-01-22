import * as React from "react";
import { type PlayersSort, useGetPlayers, useSyncPlayers } from "./api/hooks";
import type { Player } from "./api/schema";
import { EditPlayerDialog } from "./components/EditDialog";
import { PlayerDescriptionDialog } from "./components/PlayerDescriptionDialog";

function clamp(n: number, min: number, max: number) {
  return Math.max(min, Math.min(max, n));
}

export default function App() {
  const [sort, setSort] = React.useState<PlayersSort>("hits");
  const { data, isLoading, isError } = useGetPlayers(sort);

  const [search, setSearch] = React.useState("");
  const [page, setPage] = React.useState(1);
  const pageSize = 20;

  // dialogs
  const [selected, setSelected] = React.useState<Player | null>(null);
  const [descOpen, setDescOpen] = React.useState(false);
  const [editOpen, setEditOpen] = React.useState(false);

  const sync = useSyncPlayers();

  const players = React.useMemo(() => data ?? [], [data]);

  // Reset to page 1 when sort/search changes
  React.useEffect(() => {
    setPage(1);
  }, [sort, search]);

  const filtered = React.useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return players;
    return players.filter((p) => (p.name ?? "").toLowerCase().includes(q));
  }, [players, search]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));
  const safePage = clamp(page, 1, totalPages);

  const paginated = React.useMemo(() => {
    const start = (safePage - 1) * pageSize;
    return filtered.slice(start, start + pageSize);
  }, [filtered, safePage]);

  const openDescription = (p: Player) => {
    setSelected(p);
    setDescOpen(true);
  };

  const openEdit = (p: Player, e: React.MouseEvent) => {
    e.stopPropagation();
    setSelected(p);
    setEditOpen(true);
  };

  const onSync = async () => {
    await sync.mutateAsync();
  };

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
            placeholder="Search by player name…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />

          <div className="text-xs text-muted-foreground whitespace-nowrap">
            {filtered.length} result{filtered.length === 1 ? "" : "s"}
          </div>
        </div>

        <table className="w-full text-sm">
          <thead className="bg-muted/50">
            <tr className="text-left">
              <th className="px-3 py-2">Name</th>
              <th className="px-3 py-2">Team</th>
              <th className="px-3 py-2">Pos</th>
              <th className="px-3 py-2">Hits</th>
              <th className="px-3 py-2">HRs</th>
              <th className="px-3 py-2 w-[1%]"></th>
            </tr>
          </thead>

          <tbody>
            {isLoading ? (
              <tr>
                <td className="px-3 py-3 text-muted-foreground" colSpan={6}>
                  Loading players…
                </td>
              </tr>
            ) : isError ? (
              <tr>
                <td className="px-3 py-3 text-red-600" colSpan={6}>
                  Failed to load players.
                </td>
              </tr>
            ) : paginated.length === 0 ? (
              <tr>
                <td className="px-3 py-3 text-muted-foreground" colSpan={6}>
                  No players found.
                </td>
              </tr>
            ) : (
              paginated.map((p) => (
                <tr
                  key={p.id}
                  className="cursor-pointer hover:bg-muted/40"
                  onClick={() => openDescription(p)}
                >
                  <td className="px-3 py-2 font-medium">{p.name}</td>
                  <td className="px-3 py-2">{p.team ?? "—"}</td>
                  <td className="px-3 py-2">{p.position ?? "—"}</td>
                  <td className="px-3 py-2">{p.hits ?? "—"}</td>
                  <td className="px-3 py-2">{p.home_runs ?? "—"}</td>
                  <td className="px-3 py-2 text-right">
                    <button
                      className="h-8 rounded-md border px-3 text-xs"
                      onClick={(e) => openEdit(p, e)}
                    >
                      Edit
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>

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
        playerName={selected?.name ?? null}
      />

      <EditPlayerDialog open={editOpen} onOpenChange={setEditOpen} player={selected} />
    </div>
  );
}
