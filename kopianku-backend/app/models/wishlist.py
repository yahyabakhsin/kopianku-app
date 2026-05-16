from sqlmodel import SQLModel, Field
from typing import Optional
from datetime import datetime

class Wishlist(SQLModel, table=True):
    __tablename__ = "wishlists"
    
    id: Optional[int] = Field(default=None, primary_key=True)
    user_id: int = Field(foreign_key="users.id")
    cafe_id: str = Field(foreign_key="cafe.id")
    created_at: datetime = Field(default_factory=datetime.utcnow)
