# backend/app/services/upstream.py  ✅ DROP-IN REPLACE FILE CONTENT (or replace sync_players + helpers)
from typing import Any
import hashlib
import httpx
from sqlalchemy.orm import Session
from sqlalchemy.dialects.postgresql import insert
from sqlalchemy import select

from app.models import Player
from app.core.config import settings


# --- Canonicalization: prevent "home_run" ever being introduced into raw ---
_RAW_KEY_ALIASES: dict[str, str] = {
    "home_run": "home run",
    "homeRun": "home run",
    "homeRuns": "home run",
    "HomeRun": "home run",
    "HomeRuns": "home run",

    "hits": "Hits",
    "HITS": "Hits",

    "at_bat": "At-bat",
    "atBat": "At-bat",
    "AtBat": "At-bat",
    "atbat": "At-bat",
}

def _canonicalize_raw(p: dict) -> dict:
    out: dict = {}
    for k, v in (p or {}).items():
        out[_RAW_KEY_ALIASES.get(k, k)] = v
    return out


def _get_player_name(p: dict) -> str:
    return (
        p.get("name")
        or p.get("playerName")
        or p.get("Player name")
        or p.get("Player Name")
        or "Unknown"
    )


def _infer_external_id(p: dict) -> str:
    for k in ("external_id", "externalId", "id", "player_id", "playerId", "uuid"):
        v = p.get(k)
        if v:
            return str(v)

    name = _get_player_name(p)
    position = p.get("position") or p.get("Position") or ""
    team = p.get("team") or p.get("Team") or ""

    base = f"{name}|{position}|{team}".strip().lower()
    digest = hashlib.sha1(base.encode("utf-8")).hexdigest()[:16]
    return f"derived:{digest}"


def _to_int(v: Any) -> int | None:
    if v is None or isinstance(v, bool):
        return None
    if isinstance(v, (int, float)):
        return int(v)
    if isinstance(v, str):
        s = v.strip().replace(",", "")
        if s == "" or s == "--":
            return None
        try:
            return int(float(s))
        except ValueError:
            return None
    return None


def _extract_stats(p: dict) -> tuple[int | None, int | None]:
    hits = p.get("Hits") if p.get("Hits") is not None else p.get("hits")

    hr = None
    for k in ("home run", "home runs", "Home Runs", "HR", "hr", "home_run", "homeRuns"):
        if k in p and p.get(k) is not None:
            hr = p.get(k)
            break

    return _to_int(hits), _to_int(hr)


def _raw_changed(existing_raw: Any, next_raw: dict) -> bool:
    # existing_raw is JSON in DB; usually a dict. Treat non-dict as changed.
    if not isinstance(existing_raw, dict):
        return True
    return existing_raw != next_raw


def sync_players(db: Session) -> dict:
    r = httpx.get(settings.BASEBALL_UPSTREAM_URL, timeout=30.0)
    r.raise_for_status()
    data = r.json()

    players = data.get("players") if isinstance(data, dict) else data
    if not isinstance(players, list):
        raise ValueError("Unexpected upstream shape: expected list of players")

    # build incoming rows (canonical raw)
    incoming: list[dict] = []
    for p in players:
        if not isinstance(p, dict):
            continue

        p = _canonicalize_raw(p)  # ✅ critical: prevents home_run key from ever entering raw

        hits, home_runs = _extract_stats(p)

        incoming.append(
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

    # de-dupe inside the batch by external_id
    deduped: dict[str, dict] = {}
    for row in incoming:
        deduped[row["external_id"]] = row
    rows = list(deduped.values())

    # ✅ Only update records whose raw actually changed; ignore unchanged.
    ext_ids = [row["external_id"] for row in rows]
    existing = db.execute(
        select(Player.external_id, Player.raw).where(Player.external_id.in_(ext_ids))
    ).all()
    existing_map = {eid: raw for (eid, raw) in existing}

    changed_rows: list[dict] = []
    for row in rows:
        prev_raw = existing_map.get(row["external_id"])
        if prev_raw is None:
            changed_rows.append(row)  # new insert
        else:
            if _raw_changed(prev_raw, row["raw"]):
                changed_rows.append(row)  # update
            # else: unchanged => ignore

    if not changed_rows:
        return {
            "received": len(players),
            "unique": len(rows),
            "affected": 0,
            "deduped_out": len(players) - len(rows),
        }

    stmt = insert(Player).values(changed_rows)

    stmt = stmt.on_conflict_do_update(
        index_elements=[Player.external_id],
        set_={
            "raw": stmt.excluded.raw,
            "hits": stmt.excluded.hits,
            "home_runs": stmt.excluded.home_runs,
            "name": stmt.excluded.name,
            "team": stmt.excluded.team,
            "position": stmt.excluded.position,
        },
    )

    result = db.execute(stmt)
    db.commit()

    return {
        "received": len(players),
        "unique": len(rows),
        "affected": result.rowcount,        # number of inserts + updates actually applied
        "deduped_out": len(players) - len(rows),
    }
