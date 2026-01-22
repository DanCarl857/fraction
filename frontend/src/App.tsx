import * as React from "react";
import { type PlayersSort, useGetPlayers } from "./api/hooks";
import type { Player } from "./api/schema";
import { EditPlayerDialog } from "./components/EditDialog";
import { PlayerDescriptionDialog } from "./components/PlayerDescriptionDialog";

export default function App() {
  const [sort, setSort] = React.useState<PlayersSort>("hits");
  const { data, isLoading, isError } = useGetPlayers(sort);

  const [selected, setSelected] = React.useState<Player | null>(null);

  const [descOpen, setDescOpen] = React.useState(false);
  const [editOpen, setEditOpen] = React.useState(false);

  const players = data ?? [];

  const openDescription = (p: Player) => {
    setSelected(p);
    setDescOpen(true);
  };

  const openEdit = (p: Player, e: React.MouseEvent) => {
    e.stopPropagation(); // don’t open description on edit click
    setSelected(p);
    setEditOpen(true);
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
        </div>
      </div>

      <div className="rounded-md border overflow-hidden">
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
            ) : players.length === 0 ? (
              <tr>
                <td className="px-3 py-3 text-muted-foreground" colSpan={6}>
                  No players found.
                </td>
              </tr>
            ) : (
              players.map((p) => (
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
      </div>

      <PlayerDescriptionDialog
        open={descOpen}
        onOpenChange={setDescOpen}
        playerId={selected?.id ?? null}
        playerName={selected?.name ?? null}
      />

      <EditPlayerDialog
        open={editOpen}
        onOpenChange={setEditOpen}
        player={selected}
      />
    </div>
  );
}

