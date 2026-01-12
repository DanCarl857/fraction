from pydantic import BaseModel

class PlayerOut(BaseModel):
    id: int
    external_id: str
    name: str
    team: str | None = None
    position: str | None = None
    hits: int | None = None
    home_runs: int | None = None
    description: str | None = None

    class Config:
        from_attributes = True

class PlayerUpdate(BaseModel):
    name: str | None = None
    team: str | None = None
    position: str | None = None
    hits: int | None = None
    home_runs: int | None = None
