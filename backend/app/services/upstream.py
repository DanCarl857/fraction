import httpx
from sqlalchemy.orm import Session
from app.core.config import settings
from app.models.player import Player

def _get(obj, *keys, default=None):
    cur = obj
    for k in keys:
        if not isinstance(cur, dict) or k not in cur:
            return default
        cur = cur[k]
    return cur

def _infer_external_id(p: dict) -> str:
    for k in ("id", "playerId", "player_id", "external_id"):
        if k in p and p[k] is not None:
            return str(p[k])
    name = str(p.get("name") or p.get("playerName") or "unknown")
    team = str(p.get("team") or "")
    return f"{name}:{team}"

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

    upserted = 0
    for p in players:
        if not isinstance(p, dict):
            continue
        external_id = _infer_external_id(p)
        name = p.get("name") or p.get("playerName") or "Unknown"
        team = p.get("team")
        position = p.get("position")

        hits, home_runs = _extract_stats(p)

        existing = db.query(Player).filter(Player.external_id == external_id).one_or_none()
        if existing:
            existing.name = name
            existing.team = team
            existing.position = position
            existing.hits = hits
            existing.home_runs = home_runs
            existing.raw = p
        else:
            db.add(Player(
                external_id=external_id,
                name=name,
                team=team,
                position=position,
                hits=hits,
                home_runs=home_runs,
                raw=p,
            ))
        upserted += 1

    db.commit()
    return {"upserted": upserted}
