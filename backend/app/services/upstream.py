import hashlib
import httpx
from sqlalchemy.orm import Session
from sqlalchemy.dialects.postgresql import insert
from app.core.config import settings
from app.models.player import Player

def _get(obj, *keys, default=None):
    cur = obj
    for k in keys:
        if not isinstance(cur, dict) or k not in cur:
            return default
        cur = cur[k]
    return cur

def _get_player_name(p: dict) -> str:
    # your raw shows "Player name"
    return (
        p.get("name")
        or p.get("playerName")
        or p.get("Player name")
        or p.get("Player Name")
        or "Unknown"
    )

def _infer_external_id(p: dict) -> str:
    # Prefer any real upstream ID fields first
    for k in ("external_id", "externalId", "id", "player_id", "playerId", "uuid"):
        v = p.get(k)
        if v:
            return str(v)

    # Deterministic fallback: hash of stable identifying info
    name = _get_player_name(p)
    position = p.get("position") or p.get("Position") or ""
    team = p.get("team") or p.get("Team") or ""

    base = f"{name}|{position}|{team}".strip().lower()
    digest = hashlib.sha1(base.encode("utf-8")).hexdigest()[:16]
    return f"derived:{digest}"

def _extract_stats(p: dict):
    hits = p.get("hits")
    hr = p.get("hr") or p.get("homeRuns") or p.get("home_runs")

    if hits is None:
        hits = _get(p, "stats", "hits") or _get(p, "batting", "hits")
    if hr is None:
        hr = _get(p, "stats", "hr") or _get(p, "stats", "home_runs") or _get(p, "batting", "homeRuns")

    def to_int(x):
        try:
            return int(x)
        except Exception:
            return None

    return to_int(hits), to_int(hr)

def sync_players(db: Session) -> dict:
    r = httpx.get(settings.BASEBALL_UPSTREAM_URL, timeout=30.0)
    r.raise_for_status()
    data = r.json()

    players = data.get("players") if isinstance(data, dict) else data
    if not isinstance(players, list):
        raise ValueError("Unexpected upstream shape: expected list of players")

    rows = []
    for p in players:
        if not isinstance(p, dict):
            continue

        hits, home_runs = _extract_stats(p)

        rows.append(
            {
                "external_id": _infer_external_id(p),
                "name": _get_player_name(p),
                "team": p.get("team") or p.get("Team"),
                "position": p.get("position") or p.get("Position"),
                "hits": hits,
                "home_runs": home_runs,
                "raw": p,
            }
        )

    deduped = {}
    for row in rows:
        deduped[row["external_id"]] = row
    rows = list(deduped.values())

    stmt = insert(Player).values(rows)
    stmt = stmt.on_conflict_do_update(
        index_elements=[Player.external_id],
        set_={
            "name": stmt.excluded.name,
            "team": stmt.excluded.team,
            "position": stmt.excluded.position,
            "hits": stmt.excluded.hits,
            "home_runs": stmt.excluded.home_runs,
            "raw": stmt.excluded.raw,
        },
    )

    db.execute(stmt)
    db.commit()

    return {"received": len(players), "upserted": len(rows), "deduped_out": len(players) - len(rows)}


