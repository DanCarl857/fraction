from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from app.db.session import get_db
from app.models.player import Player
from app.schemas.player import PlayerOut, PlayerUpdate
from app.services.upstream import sync_players
from app.services.descriptions import generate_description

router = APIRouter()

@router.post("/sync")
def sync(db: Session = Depends(get_db)):
    return sync_players(db)

@router.get("/players", response_model=list[PlayerOut])
def list_players(
    sort: str = Query("hits", pattern="^(hits|hr)$"),
    db: Session = Depends(get_db)
):
    q = db.query(Player)
    if sort == "hr":
        q = q.order_by(Player.home_runs.desc().nullslast(), Player.hits.desc().nullslast(), Player.name.asc())
    else:
        q = q.order_by(Player.hits.desc().nullslast(), Player.home_runs.desc().nullslast(), Player.name.asc())
    return q.all()

@router.get("/players/{player_id}", response_model=PlayerOut)
def get_player(player_id: int, db: Session = Depends(get_db)):
    p = db.query(Player).filter(Player.id == player_id).one_or_none()
    if not p:
        raise HTTPException(404, "Player not found")
    return p

@router.put("/players/{player_id}", response_model=PlayerOut)
def update_player(player_id: int, payload: PlayerUpdate, db: Session = Depends(get_db)):
    p = db.query(Player).filter(Player.id == player_id).one_or_none()
    if not p:
        raise HTTPException(404, "Player not found")
    for k, v in payload.model_dump(exclude_unset=True).items():
        setattr(p, k, v)
    db.commit()
    db.refresh(p)
    return p

@router.post("/players/{player_id}/description", response_model=PlayerOut)
def ensure_description(player_id: int, db: Session = Depends(get_db)):
    p = db.query(Player).filter(Player.id == player_id).one_or_none()
    if not p:
        raise HTTPException(404, "Player not found")
    p = generate_description(db, player_id)
    return p
