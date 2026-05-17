from sqlmodel import create_engine, Session, SQLModel

import os

# Ngambil URL dari environment variable (kalau di Vercel), kalau gak ada pakai local
DATABASE_URL = os.environ.get("DATABASE_URL", "postgresql://postgres:12345@localhost:5432/kopianku")

# Penting untuk Neon / Vercel Postgres: ganti "postgres://" jadi "postgresql://" kalau dapet format lama
if DATABASE_URL.startswith("postgres://"):
    DATABASE_URL = DATABASE_URL.replace("postgres://", "postgresql://", 1)

engine = create_engine(DATABASE_URL, echo=True)

def create_db_and_tables():
    SQLModel.metadata.create_all(engine)

def get_session():
    with Session(engine) as session:
        yield session