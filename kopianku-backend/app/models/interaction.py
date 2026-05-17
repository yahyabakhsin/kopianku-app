from sqlmodel import SQLModel, Field
from datetime import datetime
from typing import Optional

class Comment(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    user_id: int = Field(foreign_key="users.id")
    target_id: str = Field(index=True) # Format: 'rev_1', 'chk_2'
    content: str
    created_at: datetime = Field(default_factory=datetime.utcnow)

class Like(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    user_id: int = Field(foreign_key="users.id")
    target_id: str = Field(index=True)

class Follow(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    follower_id: int = Field(foreign_key="users.id", index=True)
    following_id: int = Field(foreign_key="users.id", index=True)
    created_at: datetime = Field(default_factory=datetime.utcnow)
