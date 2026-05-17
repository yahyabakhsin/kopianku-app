from fastapi import APIRouter, Depends, HTTPException
from sqlmodel import Session, select
from app.database import get_session
from app.models.user import User
from app.models.review import Review
from app.models.checkin import CheckIn
from app.models.cafe import Cafe
from app.models.reservation import Reservation
from app.models.wishlist import Wishlist
from app.models.interaction import Follow
from app.models.album import Album
from app.routers.auth import get_current_user
from pydantic import BaseModel
from typing import List, Optional

router = APIRouter()

class UserProfileUpdate(BaseModel):
    username: Optional[str] = None
    avatar_url: Optional[str] = None
    persona_badge: Optional[str] = None
    bio: Optional[str] = None
    preferences: Optional[List[str]] = None

@router.get("/me")
def get_user_profile_stats(session: Session = Depends(get_session), current_user: User = Depends(get_current_user)):
    reviews = session.exec(select(Review).where(Review.user_id == current_user.id)).all()
    checkins = session.exec(select(CheckIn).where(CheckIn.user_id == current_user.id)).all()
    
    followers_count = len(session.exec(select(Follow).where(Follow.following_id == current_user.id)).all())
    following_count = len(session.exec(select(Follow).where(Follow.follower_id == current_user.id)).all())
    
    # 1. Ambil Top Cafes
    top_reviews = session.exec(
        select(Review).where(Review.user_id == current_user.id).order_by(Review.rating.desc()).limit(10)
    ).all()
    top_cafes = []
    for r in top_reviews:
        cafe = session.get(Cafe, r.cafe_id)
        if cafe and cafe not in top_cafes:
            top_cafes.append({
                "id": cafe.id,
                "name": cafe.name,
                "location": cafe.location,
                "imageUrl": cafe.imageUrl,
                "rating": r.rating
            })
            if len(top_cafes) >= 4:
                break

    return {
        "id": current_user.id,
        "username": current_user.username,
        "email": current_user.email,
        "role": current_user.role,
        "persona": current_user.persona_badge,
        "bio": current_user.bio,
        "preferences": current_user.preferences,
        "avatar_url": current_user.avatar_url,
        "top_cafes": top_cafes,
        "stats": {
            "reviews_count": len(reviews),
            "checkins_count": len(checkins),
            "followers": followers_count,
            "following": following_count
        }
    }

@router.get("/me/activities")
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

@router.get("/me/top-cafes")
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

@router.get("/me/reservations")
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
            "cafe_image": cafe.imageUrl,
            "booking_date": res.booking_date,
            "start_time": res.start_time,
            "end_time": res.end_time,
            "guest_count": res.guest_count,
            "status": res.status
        })
    return result

@router.get("/me/wishlist")
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

@router.post("/me/wishlist/{cafe_id}")
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

@router.post("/me/{target_user_id}/follow")
def toggle_follow(target_user_id: int, session: Session = Depends(get_session), current_user: User = Depends(get_current_user)):
    if target_user_id == current_user.id:
        return {"message": "Tidak bisa follow diri sendiri"}
        
    target_user = session.get(User, target_user_id)
    if not target_user:
        from fastapi import HTTPException
        raise HTTPException(status_code=404, detail="User not found")
        
    existing = session.exec(
        select(Follow)
        .where(Follow.follower_id == current_user.id)
        .where(Follow.following_id == target_user_id)
    ).first()
    
    if existing:
        session.delete(existing)
        session.commit()
        return {"status": "unfollowed"}
    else:
        new_follow = Follow(follower_id=current_user.id, following_id=target_user_id)
        session.add(new_follow)
        session.commit()
        return {"status": "followed"}

@router.get("/me/follows")
def get_user_follows(session: Session = Depends(get_session), current_user: User = Depends(get_current_user)):
    # Get users following me
    followers = session.exec(
        select(User).join(Follow, Follow.follower_id == User.id)
        .where(Follow.following_id == current_user.id)
    ).all()
    
    # Get users I am following
    following = session.exec(
        select(User).join(Follow, Follow.following_id == User.id)
        .where(Follow.follower_id == current_user.id)
    ).all()
    
    return {
        "followers": [{"id": u.id, "username": u.username, "persona": u.persona_badge, "avatar_url": u.avatar_url} for u in followers],
        "following": [{"id": u.id, "username": u.username, "persona": u.persona_badge, "avatar_url": u.avatar_url} for u in following],
    }

@router.put("/me")
def update_user_profile(
    data: UserProfileUpdate,
    session: Session = Depends(get_session),
    current_user: User = Depends(get_current_user)
):
    if data.username is not None:
        # Cek apakah username sudah dipakai
        if data.username != current_user.username:
            existing = session.exec(select(User).where(User.username == data.username)).first()
            if existing:
                from fastapi import HTTPException
                raise HTTPException(status_code=400, detail="Username sudah dipakai")
        current_user.username = data.username
        
    if data.avatar_url is not None:
        current_user.avatar_url = data.avatar_url
    if data.persona_badge is not None:
        current_user.persona_badge = data.persona_badge
    if data.bio is not None:
        current_user.bio = data.bio
    if data.preferences is not None:
        current_user.preferences = data.preferences
        
    session.add(current_user)
    session.commit()
    session.refresh(current_user)
    
    return {"message": "Profil berhasil diupdate", "user": {"username": current_user.username, "avatar_url": current_user.avatar_url}}

@router.get("/search")
def search_users(q: str = "", session: Session = Depends(get_session)):
    if not q:
        return []
    users = session.exec(
        select(User).where(User.username.ilike(f"%{q}%")).limit(10)
    ).all()
    
    return [{"id": u.id, "username": u.username, "persona": u.persona_badge, "avatar_url": u.avatar_url} for u in users]

@router.get("/{target_user_id}")
def get_public_profile(target_user_id: int, session: Session = Depends(get_session)):
    target_user = session.get(User, target_user_id)
    if not target_user:
        from fastapi import HTTPException
        raise HTTPException(status_code=404, detail="User not found")
        
    reviews = session.exec(select(Review).where(Review.user_id == target_user.id).order_by(Review.created_at.desc()).limit(10)).all()
    checkins = session.exec(select(CheckIn).where(CheckIn.user_id == target_user.id).order_by(CheckIn.created_at.desc()).limit(10)).all()
    
    from app.models.cafe import Cafe
    
    recent_activities = []
    for r in reviews:
        cafe = session.get(Cafe, r.cafe_id)
        recent_activities.append({
            "type": "review",
            "id": f"rev_{r.id}",
            "cafe_name": cafe.name if cafe else "Kafe",
            "content": r.text,
            "rating": r.rating,
            "created_at": r.created_at.strftime("%d %b %Y, %H:%M"),
            "sort_time": r.created_at
        })
        
    for c in checkins:
        cafe = session.get(Cafe, c.cafe_id)
        recent_activities.append({
            "type": "checkin",
            "id": f"chk_{c.id}",
            "cafe_name": cafe.name if cafe else "Kafe",
            "content": "Nongkrong/WFC di sini nih!",
            "rating": None,
            "created_at": c.created_at.strftime("%d %b %Y, %H:%M"),
            "sort_time": c.created_at
        })
        
    recent_activities.sort(key=lambda x: x["sort_time"], reverse=True)
    for act in recent_activities:
        del act["sort_time"]

    followers_count = len(session.exec(select(Follow).where(Follow.following_id == target_user.id)).all())
    following_count = len(session.exec(select(Follow).where(Follow.follower_id == target_user.id)).all())
    
    # 1. Ambil Top 4 Cafes (Cafes where this user gave the highest ratings)
    top_reviews = session.exec(
        select(Review).where(Review.user_id == target_user.id).order_by(Review.rating.desc()).limit(4)
    ).all()
    top_cafes = []
    for r in top_reviews:
        cafe = session.get(Cafe, r.cafe_id)
        if cafe and cafe not in top_cafes:
            top_cafes.append({
                "id": cafe.id,
                "name": cafe.name,
                "location": cafe.location,
                "imageUrl": cafe.imageUrl,
                "rating": r.rating
            })
            if len(top_cafes) >= 4:
                break
                
    # 2. Ambil Albums (only public albums)
    albums = session.exec(
        select(Album).where(Album.user_id == target_user.id, Album.is_public == True)
    ).all()
    public_albums = [{"id": a.id, "title": a.title, "description": a.description} for a in albums]
    
    # 3. Ambil Wishlists
    wishlists_records = session.exec(select(Wishlist).where(Wishlist.user_id == target_user.id)).all()
    wishlists = []
    for w in wishlists_records:
        cafe = session.get(Cafe, w.cafe_id)
        if cafe:
            wishlists.append({
                "id": cafe.id,
                "name": cafe.name,
                "location": cafe.location,
                "imageUrl": cafe.imageUrl
            })

    return {
        "id": target_user.id,
        "username": target_user.username,
        "persona": target_user.persona_badge,
        "bio": target_user.bio,
        "avatar_url": target_user.avatar_url,
        "role": target_user.role,
        "stats": {
            "reviews_count": len(reviews),
            "checkins_count": len(checkins),
            "followers": followers_count,
            "following": following_count
        },
        "recent_activities": recent_activities[:15],
        "top_cafes": top_cafes,
        "albums": public_albums,
        "wishlists": wishlists
    }

@router.get("/public/{target_user_id}/follows")
def get_target_user_follows(target_user_id: int, session: Session = Depends(get_session)):
    target_user = session.get(User, target_user_id)
    if not target_user:
        raise HTTPException(status_code=404, detail="User not found")
        
    followers_records = session.exec(
        select(Follow, User).join(User, Follow.follower_id == User.id).where(Follow.following_id == target_user_id)
    ).all()
    
    following_records = session.exec(
        select(Follow, User).join(User, Follow.following_id == User.id).where(Follow.follower_id == target_user_id)
    ).all()
    
    followers = [{"id": u.id, "username": u.username, "avatar_url": u.avatar_url, "persona": u.persona_badge} for f, u in followers_records]
    following = [{"id": u.id, "username": u.username, "avatar_url": u.avatar_url, "persona": u.persona_badge} for f, u in following_records]
    
    return {
        "followers": followers,
        "following": following
    }
