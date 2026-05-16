import os
from fastapi.staticfiles import StaticFiles
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from sqlmodel import Session, select
from app.routers import cafe, auth, owner # Gabungin import router biar rapi
from app.database import create_db_and_tables, engine
from app.models.cafe import Cafe
from app.models.user import User
from app.models.review import Review
from app.data.dummy_cafes import cafes_malang
from app.models.checkin import CheckIn
from app.models.reservation import Reservation

# 1. Bikin Gedungnya SEKALI AJA
app = FastAPI(title="Kopianku API")

# 2. Pasang Satpam CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000", 
        "http://127.0.0.1:3000"
    ],
    allow_credentials=True,
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
            print("✅ Seeding sukses! Data cafe berhasil masuk ke PostgreSQL.")
        else:
            print("✅ Database sudah berisi data. Melewati proses seeding.")

@app.get("/")
def home():
    return {"message": "Backend Kopianku 🚀"}