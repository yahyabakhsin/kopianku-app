from sqlmodel import SQLModel, Field
from sqlalchemy import Column, JSON
from typing import List, Dict, Any

class Cafe(SQLModel, table=True):
    id: str = Field(primary_key=True)
    name: str
    location: str
    
    # Simpan array/list sebagai tipe data JSON di Postgres
    vibes: List[str] = Field(default=[], sa_column=Column(JSON))
    facilities: List[Dict[str, Any]] = Field(default=[], sa_column=Column(JSON))
    
    ai_summary: str
    rating: float
    reviewCount: int
    imageUrl: str