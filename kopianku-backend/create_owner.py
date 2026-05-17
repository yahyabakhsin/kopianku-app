import sys
from sqlmodel import Session, select
from app.database import engine
from app.models.user import User
from app.models.cafe import Cafe
from app.security import get_password_hash

def main():
    with Session(engine) as session:
        # Check if user already exists
        existing_user = session.exec(select(User).where(User.email == "roketto@gmail.com")).first()
        if existing_user:
            user = existing_user
            print("User already exists")
        else:
            user = User(
                username="Roketto Admin",
                email="roketto@gmail.com",
                hashed_password=get_password_hash("roketto123"),
                role="owner"
            )
            session.add(user)
            session.commit()
            session.refresh(user)
            print(f"Created user {user.username} with ID {user.id}")

        # Update cafe
        cafe = session.get(Cafe, "2")
        if cafe:
            cafe.owner_id = user.id
            session.add(cafe)
            session.commit()
            print(f"Assigned cafe {cafe.name} to owner {user.username}")
        else:
            print("Cafe 2 not found")

if __name__ == "__main__":
    main()
