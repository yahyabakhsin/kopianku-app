from sqlmodel import SQLModel, Field
from typing import Optional
from datetime import date, time, datetime

# 1. Tabel untuk disimpan ke database
class Reservation(SQLModel, table=True):
    __tablename__ = "reservations"

    id: Optional[int] = Field(default=None, primary_key=True)
    user_id: int = Field(foreign_key="users.id")
    cafe_id: str = Field(foreign_key="cafe.id")
    
    # Detail Waktu Booking
    booking_date: date
    start_time: time
    end_time: time
    
    # Jumlah orang dan status (misal: "pending", "approved", "cancelled")
    guest_count: int
    status: str = Field(default="pending")
    
    created_at: datetime = Field(default_factory=datetime.utcnow)

# 2. Skema Request dari Frontend
class ReservationCreate(SQLModel):
    booking_date: date
    start_time: time
    end_time: time
    guest_count: int