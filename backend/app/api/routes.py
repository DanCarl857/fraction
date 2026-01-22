# app/api/routes.py
import json
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from sqlalchemy import desc
from app.db.session import get_db
from app.models.player import Player
from app.schemas.player import PlayerOut, PlayerUpdate, PlayersListOut
from app.services.upstream import sync_players
from app.services.descriptions import generate_description

router = APIRouter()

@router.post("/sync")
def sync(db: Session = Depends(get_db)):
    return sync_players(db)

@router.get("/players", response_model=PlayersListOut)
def get_players(
    sort: str = Query("hits", pattern="^(hits|hr)$"),
    db: Session = Depends(get_db),
):
    q = db.query(Player)

    if sort == "hits":
        q = q.order_by(desc(Player.hits).nullslast())
    else:
        q = q.order_by(desc(Player.home_runs).nullslast())

    return {"items": q.all()}

@router.get("/players/{player_id}", response_model=PlayerOut)
def get_player(player_id: int, db: Session = Depends(get_db)):
    p = db.query(Player).filter(Player.id == player_id).one_or_none()
    if not p:
        raise HTTPException(status_code=404, detail="Player not found")
    return p

@router.put("/players/{player_id}", response_model=PlayerOut)
def update_player(player_id: int, payload: PlayerUpdate, db: Session = Depends(get_db)):
    p = db.query(Player).filter(Player.id == player_id).one_or_none()
    if not p:
        raise HTTPException(status_code=404, detail="Player not found")

    data = payload.model_dump(exclude_unset=True)

    if data["raw"] is None:
        raise HTTPException(status_code=422, detail="raw cannot be null")

    incoming = data["raw"]
    if not isinstance(incoming, dict):
        raise HTTPException(status_code=422, detail="raw must be an object")

    current = p.raw or {}
    if not isinstance(current, dict):
        current = {}

    # ✅ MERGE instead of replace
    p.raw = {**current, **incoming}
    data.pop("raw", None)

    # update other columns
    for k, v in data.items():
        setattr(p, k, v)

    db.commit()
    db.refresh(p)
    return p

@router.get("/players/{player_id}/description", response_model=PlayerOut)
def ensure_description(player_id: int, db: Session = Depends(get_db)):
    p = db.query(Player).filter(Player.id == player_id).one_or_none()
    if not p:
        raise HTTPException(status_code=404, detail="Player not found")

    # generate_description should update Player.description and return the updated Player
    p = generate_description(db, player_id)
    return p
