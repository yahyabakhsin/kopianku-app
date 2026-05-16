from sqlmodel import SQLModel, Field
from typing import Optional
from sqlalchemy import Column, JSON
from typing import List, Optional

# 1. Tabel untuk disimpan ke Database
class User(SQLModel, table=True):
    __tablename__ = "users"

    id: Optional[int] = Field(default=None, primary_key=True)
    username: str = Field(unique=True, index=True)
    email: str = Field(unique=True, index=True)
    hashed_password: str
    
    # AI
    preferences: List[str] = Field(default=[], sa_column=Column(JSON))
    persona_badge: Optional[str] = Field(default="Newbie") 

# Tambahan untuk Sistem Role
    role: str = Field(default="user") # Opsinya nanti: "user", "owner", "admin"
    
# 2. Skema untuk nerima request dari Frontend
class UserCreate(SQLModel):
    username: str
    email: str
    password: str