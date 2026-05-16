from fastapi import APIRouter, Depends
from sqlmodel import Session, select
from app.database import get_session
from app.models.user import User
from app.models.review import Review
from app.models.checkin import CheckIn
from app.models.cafe import Cafe
from app.models.reservation import Reservation
from app.models.wishlist import Wishlist
from app.routers.auth import get_current_user

router = APIRouter()

@router.get("/")
def get_user_profile_stats(session: Session = Depends(get_session), current_user: User = Depends(get_current_user)):
    reviews = session.exec(select(Review).where(Review.user_id == current_user.id)).all()
    checkins = session.exec(select(CheckIn).where(CheckIn.user_id == current_user.id)).all()
    
    return {
        "id": current_user.id,
        "username": current_user.username,
        "email": current_user.email,
        "persona": current_user.persona_badge,
        "preferences": current_user.preferences,
        "stats": {
            "reviews_count": len(reviews),
            "checkins_count": len(checkins),
            "followers": 128, # Dummy stat for visual appeal as per DB limitations
            "following": 245
        }
    }

@router.get("/activities")
def get_user_activities(session: Session = Depends(get_session), current_user: User = Depends(get_current_user)):
    # Ambil review user
    reviews = session.exec(
        select(Review, Cafe)
        .join(Cafe)
        .where(Review.user_id == current_user.id)
    ).all()
    
    # Ambil checkin user
    checkins = session.exec(
        select(CheckIn, Cafe)
        .join(Cafe)
        .where(CheckIn.user_id == current_user.id)
    ).all()
    
    activities = []
    
    for review, cafe in reviews:
        activities.append({
            "type": "review",
            "cafe_name": cafe.name,
            "cafe_id": cafe.id,
            "rating": review.rating,
            "text": review.text,
            "date_str": review.created_at.strftime("%d %b %Y"),
            "sort_time": review.created_at
        })
        
    for checkin, cafe in checkins:
        activities.append({
            "type": "checkin",
            "cafe_name": cafe.name,
            "cafe_id": cafe.id,
            "text": f"Check-in di {cafe.name}",
            "date_str": checkin.created_at.strftime("%d %b %Y"),
            "sort_time": checkin.created_at
        })
        
    activities.sort(key=lambda x: x["sort_time"], reverse=True)
    return activities

@router.get("/top-cafes")
def get_user_top_cafes(session: Session = Depends(get_session), current_user: User = Depends(get_current_user)):
    # Ambil cafe yang di-review bintang 4 atau 5 oleh user
    top_reviews = session.exec(
        select(Review, Cafe)
        .join(Cafe)
        .where(Review.user_id == current_user.id)
        .where(Review.rating >= 4)
        .limit(4)
    ).all()
    
    cafes = []
    seen = set()
    for review, cafe in top_reviews:
        if cafe.id not in seen:
            cafes.append(cafe)
            seen.add(cafe.id)
            
    # Kalau belum ada top cafes, fallback ke cafe rekomendasi
    if not cafes:
        cafes = session.exec(select(Cafe).limit(4)).all()
        
    return cafes

@router.get("/reservations")
def get_user_reservations(session: Session = Depends(get_session), current_user: User = Depends(get_current_user)):
    reservations = session.exec(
        select(Reservation, Cafe)
        .join(Cafe)
        .where(Reservation.user_id == current_user.id)
        .order_by(Reservation.booking_date.desc(), Reservation.start_time.desc())
    ).all()
    
    result = []
    for res, cafe in reservations:
        result.append({
            "id": res.id,
            "cafe_id": cafe.id,
            "cafe_name": cafe.name,
            "cafe_image": cafe.image_url,
            "booking_date": res.booking_date,
            "start_time": res.start_time,
            "end_time": res.end_time,
            "guest_count": res.guest_count,
            "status": res.status
        })
    return result

@router.get("/wishlist")
def get_user_wishlist(session: Session = Depends(get_session), current_user: User = Depends(get_current_user)):
    wishlist_items = session.exec(
        select(Wishlist, Cafe)
        .join(Cafe)
        .where(Wishlist.user_id == current_user.id)
    ).all()
    
    result = []
    for item, cafe in wishlist_items:
        result.append(cafe)
    return result

@router.post("/wishlist/{cafe_id}")
def toggle_wishlist(cafe_id: str, session: Session = Depends(get_session), current_user: User = Depends(get_current_user)):
    # Cek apakah cafe exist
    cafe = session.get(Cafe, cafe_id)
    if not cafe:
        from fastapi import HTTPException
        raise HTTPException(status_code=404, detail="Cafe not found")
        
    # Cek apakah sudah ada di wishlist
    existing = session.exec(
        select(Wishlist)
        .where(Wishlist.user_id == current_user.id)
        .where(Wishlist.cafe_id == cafe_id)
    ).first()
    
    if existing:
        session.delete(existing)
        session.commit()
        return {"message": "Dihapus dari wishlist", "is_wishlisted": False}
    else:
        new_item = Wishlist(user_id=current_user.id, cafe_id=cafe_id)
        session.add(new_item)
        session.commit()
        return {"message": "Ditambahkan ke wishlist", "is_wishlisted": True}
