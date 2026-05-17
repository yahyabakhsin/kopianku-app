import os
from fastapi.staticfiles import StaticFiles
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from sqlmodel import Session, select
from app.models.user import User
from app.models.cafe import Cafe
from app.models.review import Review
from app.models.checkin import CheckIn
from app.models.reservation import Reservation
from app.models.album import Album, AlbumCafe
from app.models.wishlist import Wishlist
from app.models.interaction import Comment, Like, Follow
from app.database import create_db_and_tables, engine
from app.data.dummy_cafes import cafes_malang
from app.routers import cafe, auth, owner, chatbot, album, feed, user_profile

# 1. Bikin Gedungnya SEKALI AJA
app = FastAPI(title="Kopianku API")

# 2. Pasang Satpam CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Allow semua domain (untuk lomba)
    allow_credentials=False,  # Harus False kalau allow_origins=["*"]
    allow_methods=["*"],
    allow_headers=["*"],
)

# 3. Setting Folder Static buat Upload Gambar
os.makedirs("static/uploads", exist_ok=True)
app.mount("/static", StaticFiles(directory="static"), name="static")

# 4. Daftarin Semua Rute
app.include_router(cafe.router, prefix="/api", tags=["cafes"])
app.include_router(auth.router, prefix="/api/auth", tags=["auth"])
app.include_router(owner.router, prefix="/api/owner", tags=["owner"])
app.include_router(chatbot.router, prefix="/api/chatbot", tags=["chatbot"])
app.include_router(album.router, prefix="/api/albums", tags=["albums"])
app.include_router(feed.router, prefix="/api/feed", tags=["feed"])
app.include_router(user_profile.router, prefix="/api/users", tags=["users"])

# 5. Script Startup (Bikin DB & Seeding)
@app.on_event("startup")
def on_startup():
    create_db_and_tables()
    with Session(engine) as session:
        existing_cafe = session.exec(select(Cafe)).first()
        if not existing_cafe:
            print("Database masih kosong. Memulai proses seeding data...")
            for cafe_data in cafes_malang:
                db_cafe = Cafe(**cafe_data)
                session.add(db_cafe)
            session.commit()
            print("[OK] Seeding sukses! Data cafe berhasil masuk ke PostgreSQL.")
        else:
            print("[OK] Database sudah berisi data. Melewati proses seeding.")

@app.on_event("startup")
def on_startup():
    create_db_and_tables()
    with Session(engine) as session:
        print("Mengecek data cafe di database...")
        for cafe_data in cafes_malang:
            # Cek apakah cafe dengan ID ini udah ada di DB
            existing_cafe = session.get(Cafe, cafe_data["id"])
            
            if not existing_cafe:
                # Kalau belum ada, masukin ke DB
                db_cafe = Cafe(**cafe_data)
                session.add(db_cafe)
                print(f"➕ Menambahkan kafe baru: {cafe_data['name']}")
                
        session.commit()
        print("✅ Sinkronisasi data kafe selesai!")

@app.get("/")
def home():
    return {"message": "Backend Kopianku 🚀"}