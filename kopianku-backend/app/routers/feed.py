from fastapi import APIRouter, Depends, HTTPException
from sqlmodel import Session, select, func
from app.database import get_session
from app.models.review import Review
from app.models.checkin import CheckIn
from app.models.user import User
from app.models.cafe import Cafe
from app.models.interaction import Comment, Like
from app.models.post import Post
from app.models.album import Album
from app.routers.auth import get_current_user
from pydantic import BaseModel
from typing import Optional
from fastapi import Request
import jwt
from app.security import SECRET_KEY, ALGORITHM
from app.models.interaction import Follow

router = APIRouter()

class CommentCreate(BaseModel):
    content: str

def get_optional_user(request: Request, session: Session = Depends(get_session)):
    auth_header = request.headers.get("Authorization")
    if not auth_header or not auth_header.startswith("Bearer "):
        return None
    token = auth_header.split(" ")[1]
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        email: str = payload.get("sub")
        if email:
            return session.exec(select(User).where(User.email == email)).first()
    except Exception:
        pass
    return None

@router.get("")
def get_global_feed(
    request: Request,
    session: Session = Depends(get_session),
    current_user: Optional[User] = Depends(get_optional_user)
):
    # Jika user login, ambil feed dari user yang difollow dan post miliknya sendiri
    if current_user:
        following_ids_query = select(Follow.following_id).where(Follow.follower_id == current_user.id)
        following_ids = session.exec(following_ids_query).all()
        allowed_user_ids = following_ids + [current_user.id]
        
        reviews = session.exec(
            select(Review, User, Cafe)
            .join(User)
            .join(Cafe)
            .where(Review.user_id.in_(allowed_user_ids))
            .order_by(Review.created_at.desc())
            .limit(15)
        ).all()
        
        checkins = session.exec(
            select(CheckIn, User, Cafe)
            .join(User)
            .join(Cafe)
            .where(CheckIn.user_id.in_(allowed_user_ids))
            .order_by(CheckIn.created_at.desc())
            .limit(15)
        ).all()
    else:
        # Ambil 10 review terbaru secara global jika tidak login
        reviews = session.exec(
            select(Review, User, Cafe)
            .join(User)
            .join(Cafe)
            .order_by(Review.created_at.desc())
            .limit(10)
        ).all()
        
        # Ambil 10 checkin terbaru secara global
        checkins = session.exec(
            select(CheckIn, User, Cafe)
            .join(User)
            .join(Cafe)
            .order_by(CheckIn.created_at.desc())
            .limit(10)
        ).all()
        
    # Ambil Posts
    if current_user:
        posts = session.exec(
            select(Post, User)
            .join(User)
            .where(Post.user_id.in_(allowed_user_ids))
            .order_by(Post.created_at.desc())
            .limit(15)
        ).all()
    else:
        posts = session.exec(
            select(Post, User)
            .join(User)
            .order_by(Post.created_at.desc())
            .limit(10)
        ).all()
    
    feed = []
    
    # Ambil semua likes dan comments untuk meminimalisir query
    all_likes = session.exec(select(Like.target_id, func.count(Like.id)).group_by(Like.target_id)).all()
    all_comments = session.exec(select(Comment.target_id, func.count(Comment.id)).group_by(Comment.target_id)).all()
    
    like_map = {target_id: count for target_id, count in all_likes}
    comment_map = {target_id: count for target_id, count in all_comments}
    
    # Format Reviews
    for review, user, cafe in reviews:
        tid = f"rev_{review.id}"
        
        user_has_followed = False
        if current_user:
            existing_follow = session.exec(select(Follow).where(Follow.follower_id == current_user.id, Follow.following_id == user.id)).first()
            user_has_followed = existing_follow is not None
            
        feed.append({
            "id": tid,
            "type": "review",
            "time": review.created_at.strftime("%d %b %H:%M"),
            "sort_time": review.created_at,
            "user": {
                "id": user.id,
                "name": user.username,
                "persona": user.persona_badge or "Coffee Explorer",
                "avatar": user.username[0].upper()
            },
            "userHasFollowed": user_has_followed,
            "cafe": {
                "id": cafe.id,
                "name": cafe.name,
                "location": cafe.location
            },
            "rating": review.rating,
            "content": review.text,
            "images": review.images if review.images else [],
            "likes": like_map.get(tid, 0),
            "comments": comment_map.get(tid, 0)
        })
        
    # Format CheckIns
    for checkin, user, cafe in checkins:
        tid = f"chk_{checkin.id}"
        
        user_has_followed = False
        if current_user:
            existing_follow = session.exec(select(Follow).where(Follow.follower_id == current_user.id, Follow.following_id == user.id)).first()
            user_has_followed = existing_follow is not None

        feed.append({
            "id": tid,
            "type": "checkin",
            "time": checkin.created_at.strftime("%d %b %H:%M"),
            "sort_time": checkin.created_at,
            "user": {
                "id": user.id,
                "name": user.username,
                "persona": user.persona_badge or "Coffee Explorer",
                "avatar": user.username[0].upper()
            },
            "userHasFollowed": user_has_followed,
            "cafe": {
                "id": cafe.id,
                "name": cafe.name,
                "location": cafe.location
            },
            "rating": 0,
            "content": f"Sedang nongkrong atau WFC di sini nih!",
            "images": [],
            "likes": like_map.get(tid, 0),
            "comments": comment_map.get(tid, 0)
        })
        
    # Format Posts
    for post, user in posts:
        tid = f"pst_{post.id}"
        
        user_has_followed = False
        if current_user:
            existing_follow = session.exec(select(Follow).where(Follow.follower_id == current_user.id, Follow.following_id == user.id)).first()
            user_has_followed = existing_follow is not None

        album_info = None
        if post.album_id:
            album = session.get(Album, post.album_id)
            if album:
                album_info = {
                    "id": album.id,
                    "title": album.title,
                    "description": album.description
                }

        feed.append({
            "id": tid,
            "type": "post",
            "time": post.created_at.strftime("%d %b %H:%M"),
            "sort_time": post.created_at,
            "user": {
                "id": user.id,
                "name": user.username,
                "persona": user.persona_badge or "Coffee Explorer",
                "avatar": user.username[0].upper()
            },
            "userHasFollowed": user_has_followed,
            "cafe": None,
            "album": album_info,
            "rating": 0,
            "content": post.content,
            "images": [],
            "likes": like_map.get(tid, 0),
            "comments": comment_map.get(tid, 0)
        })
        
    # Gabungin dan urutkan berdasarkan waktu
    feed.sort(key=lambda x: x["sort_time"], reverse=True)
    
    # Remove sort_time and return
    for item in feed:
        del item["sort_time"]
    
    return feed[:15]

class PostCreate(BaseModel):
    content: str
    album_id: Optional[int] = None

@router.post("/posts")
def create_post(
    data: PostCreate,
    current_user: User = Depends(get_current_user),
    session: Session = Depends(get_session)
):
    new_post = Post(
        user_id=current_user.id,
        content=data.content,
        album_id=data.album_id
    )
    session.add(new_post)
    session.commit()
    return {"message": "Post created!"}

@router.get("/{target_id}/comments")
def get_comments(target_id: str, session: Session = Depends(get_session)):
    comments = session.exec(
        select(Comment, User)
        .where(Comment.target_id == target_id)
        .join(User)
        .order_by(Comment.created_at.asc())
    ).all()
    
    return [{
        "id": c.id,
        "content": c.content,
        "created_at": c.created_at.strftime("%d %b %H:%M"),
        "user": {
            "name": u.username,
            "avatar": u.username[0].upper(),
            "persona": u.persona_badge
        }
    } for c, u in comments]

@router.post("/{target_id}/comments")
def add_comment(
    target_id: str, 
    data: CommentCreate, 
    current_user: User = Depends(get_current_user),
    session: Session = Depends(get_session)
):
    new_comment = Comment(
        user_id=current_user.id,
        target_id=target_id,
        content=data.content
    )
    session.add(new_comment)
    session.commit()
    return {"message": "Comment added"}

@router.post("/{target_id}/like")
def toggle_like(
    target_id: str, 
    current_user: User = Depends(get_current_user),
    session: Session = Depends(get_session)
):
    existing = session.exec(
        select(Like)
        .where(Like.target_id == target_id)
        .where(Like.user_id == current_user.id)
    ).first()
    
    if existing:
        session.delete(existing)
        session.commit()
        return {"status": "unliked"}
    else:
        new_like = Like(user_id=current_user.id, target_id=target_id)
        session.add(new_like)
        session.commit()
        return {"status": "liked"}

