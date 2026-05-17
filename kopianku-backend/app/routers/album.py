from fastapi import APIRouter, Depends, HTTPException
from sqlmodel import Session, select
from typing import List, Optional
from pydantic import BaseModel

from app.database import get_session
from app.models.album import Album, AlbumCafe
from app.models.cafe import Cafe
from app.models.user import User
from app.routers.auth import get_current_user

router = APIRouter()

class AlbumCreate(BaseModel):
    title: str
    description: Optional[str] = None
    is_public: bool = True

class AddCafeToAlbum(BaseModel):
    cafe_id: str

class AlbumUpdate(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None
    is_public: Optional[bool] = None

@router.get("/")
def get_user_albums(session: Session = Depends(get_session), current_user: User = Depends(get_current_user)):
    albums = session.exec(select(Album).where(Album.user_id == current_user.id)).all()
    
    result = []
    for album in albums:
        cafes_in_album = session.exec(select(AlbumCafe).where(AlbumCafe.album_id == album.id)).all()
        result.append({
            "id": album.id,
            "title": album.title,
            "description": album.description,
            "is_public": album.is_public,
            "cafe_count": len(cafes_in_album)
        })
    return result

@router.post("/")
def create_album(album_req: AlbumCreate, session: Session = Depends(get_session), current_user: User = Depends(get_current_user)):
    new_album = Album(
        user_id=current_user.id,
        title=album_req.title,
        description=album_req.description,
        is_public=album_req.is_public
    )
    session.add(new_album)
    session.commit()
    session.refresh(new_album)
    return new_album

@router.get("/{album_id}")
def get_album_details(album_id: int, session: Session = Depends(get_session), current_user: User = Depends(get_current_user)):
    album = session.get(Album, album_id)
    if not album:
        raise HTTPException(status_code=404, detail="Album tidak ditemukan")
    
    # Kalo album private dan bukan punya user, tolak
    if not album.is_public and album.user_id != current_user.id:
        raise HTTPException(status_code=403, detail="Akses ditolak")

    album_cafes = session.exec(
        select(Cafe).join(AlbumCafe, Cafe.id == AlbumCafe.cafe_id).where(AlbumCafe.album_id == album_id)
    ).all()
    
    owner = session.get(User, album.user_id)
    
    return {
        "id": album.id,
        "title": album.title,
        "description": album.description,
        "is_public": album.is_public,
        "owner_id": album.user_id,
        "owner_name": owner.username if owner else "Kamu",
        "cafes": album_cafes
    }

@router.post("/{album_id}/cafes")
def add_cafe_to_album(album_id: int, req: AddCafeToAlbum, session: Session = Depends(get_session), current_user: User = Depends(get_current_user)):
    album = session.get(Album, album_id)
    if not album or album.user_id != current_user.id:
        raise HTTPException(status_code=404, detail="Album tidak ditemukan atau bukan milikmu")
    
    cafe = session.get(Cafe, req.cafe_id)
    if not cafe:
        raise HTTPException(status_code=404, detail="Cafe tidak ditemukan")
        
    existing = session.exec(select(AlbumCafe).where(AlbumCafe.album_id == album_id, AlbumCafe.cafe_id == req.cafe_id)).first()
    if existing:
        return {"message": "Cafe sudah ada di album ini"}
        
    link = AlbumCafe(album_id=album_id, cafe_id=req.cafe_id)
    session.add(link)
    session.commit()
    return {"message": "Berhasil ditambahkan ke album"}

@router.put("/{album_id}")
def update_album(album_id: int, req: AlbumUpdate, session: Session = Depends(get_session), current_user: User = Depends(get_current_user)):
    album = session.get(Album, album_id)
    if not album or album.user_id != current_user.id:
        raise HTTPException(status_code=404, detail="Album tidak ditemukan atau bukan milikmu")
        
    if req.title is not None:
        album.title = req.title
    if req.description is not None:
        album.description = req.description
    if req.is_public is not None:
        album.is_public = req.is_public
        
    session.add(album)
    session.commit()
    session.refresh(album)
    return {"message": "Album berhasil diupdate", "album": album}

@router.delete("/{album_id}")
def delete_album(album_id: int, session: Session = Depends(get_session), current_user: User = Depends(get_current_user)):
    album = session.get(Album, album_id)
    if not album or album.user_id != current_user.id:
        raise HTTPException(status_code=404, detail="Album tidak ditemukan atau bukan milikmu")
        
    # Delete related AlbumCafe records first
    album_cafes = session.exec(select(AlbumCafe).where(AlbumCafe.album_id == album_id)).all()
    for ac in album_cafes:
        session.delete(ac)
    
    session.flush()
        
    session.delete(album)
    session.commit()
    return {"message": "Album berhasil dihapus"}

@router.delete("/{album_id}/cafes/{cafe_id}")
def remove_cafe_from_album(album_id: int, cafe_id: str, session: Session = Depends(get_session), current_user: User = Depends(get_current_user)):
    album = session.get(Album, album_id)
    if not album or album.user_id != current_user.id:
        raise HTTPException(status_code=404, detail="Album tidak ditemukan atau bukan milikmu")
        
    link = session.exec(select(AlbumCafe).where(AlbumCafe.album_id == album_id, AlbumCafe.cafe_id == cafe_id)).first()
    if not link:
        raise HTTPException(status_code=404, detail="Cafe tidak ada di album ini")
        
    session.delete(link)
    session.commit()
    return {"message": "Cafe berhasil dihapus dari album"}
