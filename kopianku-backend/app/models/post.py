from sqlmodel import SQLModel, Field
from typing import Optional
from datetime import datetime

class Post(SQLModel, table=True):
    __tablename__ = "posts"

    id: Optional[int] = Field(default=None, primary_key=True)
    user_id: int = Field(foreign_key="users.id")
    content: str
    
    # Bisa referensi ke album jika ini post share album
    album_id: Optional[int] = Field(default=None, foreign_key="albums.id")
    
    created_at: datetime = Field(default_factory=datetime.utcnow)
