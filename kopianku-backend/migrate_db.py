from sqlmodel import SQLModel, Session, create_engine, text
from app.database import DATABASE_URL
from app.models.album import Album, AlbumCafe
from app.models.post import Post
from app.models.user import User
from app.models.cafe import Cafe

print("Migrating database...")
try:
    engine = create_engine(DATABASE_URL)
    SQLModel.metadata.create_all(engine)
    print("Migration successful: Created all missing tables including Post.")
except Exception as e:
    print("Migration failed or already applied:", e)
