from sqlmodel import create_engine, Session, SQLModel

# TODO: Ganti 'PASSWORD_LU_DISINI' dengan password yang lu bikin pas install Postgres
DATABASE_URL = "postgresql://postgres:12345@localhost:5432/kopianku"

engine = create_engine(DATABASE_URL, echo=True)

def create_db_and_tables():
    SQLModel.metadata.create_all(engine)

def get_session():
    with Session(engine) as session:
        yield session