# backend/app/schemas/player.py
from __future__ import annotations

from typing import Any, Dict, Optional, List
from pydantic import BaseModel, Field, ConfigDict

class PlayerBase(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    external_id: str
    name: str
    team: Optional[str] = None
    position: Optional[str] = None

    hits: Optional[int] = None
    home_runs: Optional[int] = None

    description: Optional[str] = None

    # IMPORTANT: include raw in API shapes
    raw: Dict[str, Any] = Field(default_factory=dict)


class PlayerOut(PlayerBase):
    id: int


class PlayerUpdate(BaseModel):
    """
    Partial update. Anything omitted stays unchanged.
    IMPORTANT: include raw so PUT payload can update it.
    """
    model_config = ConfigDict(from_attributes=True)

    name: Optional[str] = None
    team: Optional[str] = None
    position: Optional[str] = None

    hits: Optional[int] = None
    home_runs: Optional[int] = None

    description: Optional[str] = None

    raw: Optional[Dict[str, Any]] = None


class PlayersListOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    items: List[PlayerOut] = Field(default_factory=list)
