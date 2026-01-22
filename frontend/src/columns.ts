/* eslint-disable @typescript-eslint/no-explicit-any */
type Player = {
  id: number;
  name: string;
  team?: string | null;
  position?: string | null;
  hits?: number | null;
  home_runs?: number | null;
  raw?: Record<string, any> | null;
};

function stringifyCellValue(v: any) {
  if (v == null) return "—";
  if (typeof v === "string" || typeof v === "number" || typeof v === "boolean") return String(v);
  return JSON.stringify(v);
}

export function buildPlayerColumns(players: Player[]) {
  // collect union of all raw keys
  const rawKeys = new Set<string>();
  for (const p of players) {
    const raw = p.raw ?? {};
    for (const k of Object.keys(raw)) rawKeys.add(k);
  }

  // stable ordering: prefer a few known keys first, then alphabetical
  const preferred = ["Player name", "position", "Hits", "home run", "Games", "At-bat"];
  const allKeys = Array.from(rawKeys);

  allKeys.sort((a, b) => {
    const ai = preferred.indexOf(a);
    const bi = preferred.indexOf(b);
    if (ai !== -1 || bi !== -1) return (ai === -1 ? 999 : ai) - (bi === -1 ? 999 : bi);
    return a.localeCompare(b);
  });

  const baseColumns = [
    {
      id: "name",
      header: "Name",
      cell: (row: Player) => row.name ?? "—",
    },
    {
      id: "team",
      header: "Team",
      cell: (row: Player) => row.team ?? "—",
    },
    {
      id: "position",
      header: "Position",
      cell: (row: Player) => row.position ?? "—",
    },
    {
      id: "hits",
      header: "Hits",
      cell: (row: Player) => (row.hits ?? "—"),
    },
    {
      id: "home_runs",
      header: "Home Runs",
      cell: (row: Player) => (row.home_runs ?? "—"),
    },
  ];

  const rawColumns = allKeys.map((key) => ({
    id: `raw:${key}`,
    header: key,
    cell: (row: Player) => stringifyCellValue(row.raw?.[key]),
  }));

  return [...baseColumns, ...rawColumns];
}
