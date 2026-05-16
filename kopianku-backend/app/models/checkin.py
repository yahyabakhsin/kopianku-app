from sqlmodel import SQLModel, Field
from typing import Optional
from datetime import datetime

# Tabel CheckIn buat di database
class CheckIn(SQLModel, table=True):
    __tablename__ = "checkins"

    id: Optional[int] = Field(default=None, primary_key=True)
    user_id: int = Field(foreign_key="users.id")
    cafe_id: str = Field(foreign_key="cafe.id")
    
    # Nyatet waktu persis pas user klik tombol check-in
    created_at: datetime = Field(default_factory=datetime.utcnow)