from sqlmodel import SQLModel, Field
from typing import Optional
from datetime import datetime

# 1. Tabel untuk disimpan ke database
class Review(SQLModel, table=True):
    __tablename__ = "reviews"

    id: Optional[int] = Field(default=None, primary_key=True)
    text: str
    rating: int = Field(ge=1, le=5) # Rating cuma boleh 1 sampai 5
    created_at: datetime = Field(default_factory=datetime.utcnow)

    # Ini dia Foreign Key-nya (Nyambungin ke tabel users dan cafe)
    user_id: int = Field(foreign_key="users.id")
    cafe_id: str = Field(foreign_key="cafe.id") 

# 2. Skema untuk nerima request dari Frontend
class ReviewCreate(SQLModel):
    text: str
    rating: int