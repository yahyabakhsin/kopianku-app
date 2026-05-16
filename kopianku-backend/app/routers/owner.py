from fastapi import APIRouter, Depends, HTTPException
from sqlmodel import Session
from app.database import get_session
from app.models.cafe import Cafe
from app.models.user import User
from app.routers.auth import get_current_owner
from sqlalchemy import func, select
from app.models.review import Review
from app.models.reservation import Reservation
from app.models.checkin import CheckIn

router = APIRouter()

# Perhatikan Depends-nya pakai get_current_owner!
@router.put("/cafes/{cafe_id}/update-status")
def update_cafe_status(
    cafe_id: str,
    status_buka: bool,
    current_owner: User = Depends(get_current_owner),
    session: Session = Depends(get_session)
):
    # Cek kafe
    cafe = session.get(Cafe, cafe_id)
    if not cafe:
        raise HTTPException(status_code=404, detail="Kafenya nggak ketemu bang!")
    
    # Logika update status (Anggap aja kita update status operasionalnya)
    status_teks = "Buka" if status_buka else "Tutup"
    
    return {
        "message": f"Status kafe {cafe.name} berhasil diubah jadi {status_teks}!",
        "diubah_oleh": current_owner.username,
        "role": current_owner.role
    }

@router.get("/cafes/{cafe_id}/dashboard")
def get_cafe_dashboard(
    cafe_id: str,
    current_owner: User = Depends(get_current_owner),
    session: Session = Depends(get_session)
):
    # 1. Pastikan kafenya ada
    cafe = session.get(Cafe, cafe_id)
    if not cafe:
        raise HTTPException(status_code=404, detail="Kafenya nggak ketemu bang!")

    # 2. Pake .scalar() buat narik angka murni (Integer)
    # Ini cara paling aman biar nggak dapet objek 'Row'
    
    total_reviews = session.scalar(
        select(func.count(Review.id)).where(Review.cafe_id == cafe_id)
    ) or 0

    total_reservations = session.scalar(
        select(func.count(Reservation.id)).where(Reservation.cafe_id == cafe_id)
    ) or 0

    total_checkins = session.scalar(
        select(func.count(CheckIn.id)).where(CheckIn.cafe_id == cafe_id)
    ) or 0

    return {
        "cafe_name": cafe.name,
        "business_insights": {
            "current_rating": cafe.rating,
            "total_reviews": total_reviews,
            "total_reservations": total_reservations,
            "total_checkins_history": total_checkins
        }
    }