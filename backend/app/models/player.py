# backend/app/models/player.py
from sqlalchemy.ext.mutable import MutableDict
from sqlalchemy import Column, Integer, String, Text, JSON
from app.db.session import Base

class Player(Base):
    __tablename__ = "players"

    id = Column(Integer, primary_key=True, index=True)
    external_id = Column(String, unique=True, index=True, nullable=False)

    name = Column(String, index=True, nullable=False)
    team = Column(String, nullable=True)
    position = Column(String, nullable=True)

    hits = Column(Integer, nullable=True)
    home_runs = Column(Integer, nullable=True)

    description = Column(Text, nullable=True)

    raw = Column(MutableDict.as_mutable(JSON), nullable=False)
