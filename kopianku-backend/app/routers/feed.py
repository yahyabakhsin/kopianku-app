from fastapi import APIRouter, Depends
from sqlmodel import Session, select
from app.database import get_session
from app.models.review import Review
from app.models.checkin import CheckIn
from app.models.user import User
from app.models.cafe import Cafe
import random

router = APIRouter()

@router.get("/")
def get_global_feed(session: Session = Depends(get_session)):
    # Ambil 10 review terbaru
    reviews = session.exec(
        select(Review, User, Cafe)
        .join(User)
        .join(Cafe)
        .order_by(Review.created_at.desc())
        .limit(10)
    ).all()
    
    # Ambil 10 checkin terbaru
    checkins = session.exec(
        select(CheckIn, User, Cafe)
        .join(User)
        .join(Cafe)
        .order_by(CheckIn.created_at.desc())
        .limit(10)
    ).all()
    
    feed = []
    
    # Format Reviews
    for review, user, cafe in reviews:
        feed.append({
            "id": f"rev_{review.id}",
            "type": "review",
            "time": review.created_at.strftime("%d %b %H:%M"),
            "sort_time": review.created_at,
            "user": {
                "name": user.username,
                "persona": user.persona_badge or "Coffee Explorer",
                "avatar": user.username[0].upper()
            },
            "cafe": {
                "id": cafe.id,
                "name": cafe.name,
                "location": cafe.location
            },
            "rating": review.rating,
            "content": review.text,
            "likes": random.randint(0, 20),
            "comments": random.randint(0, 5)
        })
        
    # Format CheckIns
    for checkin, user, cafe in checkins:
        feed.append({
            "id": f"chk_{checkin.id}",
            "type": "checkin",
            "time": checkin.created_at.strftime("%d %b %H:%M"),
            "sort_time": checkin.created_at,
            "user": {
                "name": user.username,
                "persona": user.persona_badge or "Coffee Explorer",
                "avatar": user.username[0].upper()
            },
            "cafe": {
                "id": cafe.id,
                "name": cafe.name,
                "location": cafe.location
            },
            "rating": 0,
            "content": f"Sedang nongkrong atau WFC di sini nih!",
            "likes": random.randint(0, 50),
            "comments": 0
        })
        
    # Gabungin dan urutkan berdasarkan waktu
    feed.sort(key=lambda x: x["sort_time"], reverse=True)
    
    return feed[:15] # Return top 15 activity
