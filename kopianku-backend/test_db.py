import os
import sys

# Tambahkan path ke sys.path supaya bisa import app
sys.path.insert(0, os.path.abspath(os.path.dirname(__file__)))

from sqlmodel import Session, select
from app.database import engine
from app.models.user import User
from app.models.cafe import Cafe
from app.models.wishlist import Wishlist
from app.models.reservation import Reservation

def test_db():
    with Session(engine) as session:
        try:
            print("Testing Wishlist JOIN Cafe...")
            wishlist_items = session.exec(select(Wishlist, Cafe).join(Cafe)).all()
            print("Wishlist JOIN Success!", len(wishlist_items))
        except Exception as e:
            print("Wishlist JOIN Error:", e)

        try:
            print("Testing Reservation JOIN Cafe...")
            reservations = session.exec(select(Reservation, Cafe).join(Cafe)).all()
            print("Reservation JOIN Success!", len(reservations))
        except Exception as e:
            print("Reservation JOIN Error:", e)

if __name__ == "__main__":
    test_db()
