from sqlmodel import SQLModel, Field
from typing import Optional
from datetime import datetime

class Album(SQLModel, table=True):
    __tablename__ = "albums"

    id: Optional[int] = Field(default=None, primary_key=True)
    user_id: int = Field(foreign_key="users.id")
    title: str
    description: Optional[str] = None
    is_public: bool = Field(default=True)
    created_at: datetime = Field(default_factory=datetime.utcnow)

class AlbumCafe(SQLModel, table=True):
    __tablename__ = "album_cafes"

    album_id: int = Field(foreign_key="albums.id", primary_key=True)
    cafe_id: str = Field(foreign_key="cafe.id", primary_key=True)
    added_at: datetime = Field(default_factory=datetime.utcnow)
