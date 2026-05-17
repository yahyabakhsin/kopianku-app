from sqlmodel import SQLModel, Field
from sqlalchemy import Column, JSON
from typing import List, Dict, Any, Optional

class Cafe(SQLModel, table=True):
    id: str = Field(primary_key=True)
    name: str
    location: str
    
    owner_id: Optional[int] = Field(default=None)
    is_full: bool = Field(default=False)
    
    # Format YYYY-MM-DD
    full_date: Optional[str] = Field(default=None)
    # Format HH:MM (e.g. "18:00")
    full_start_time: Optional[str] = Field(default=None)
    full_end_time: Optional[str] = Field(default=None)
    
    # Simpan array/list sebagai tipe data JSON di Postgres
    vibes: List[str] = Field(default=[], sa_column=Column(JSON))
    facilities: List[Dict[str, Any]] = Field(default=[], sa_column=Column(JSON))
    
    ai_summary: str
    rating: float
    reviewCount: int
    imageUrl: str