from passlib.context import CryptContext
import jwt
from datetime import datetime, timedelta

# Setting passlib untuk pakai bcrypt
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

# Konfigurasi rahasia untuk JWT
SECRET_KEY = "kunci_rahasia_kopianku_super_aman"  # Di dunia nyata ini ditaruh di file .env
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 60 # Token expired dalam 1 jam

def get_password_hash(password: str) -> str:
    return pwd_context.hash(password)

def verify_password(plain_password: str, hashed_password: str) -> bool:
    return pwd_context.verify(plain_password, hashed_password)

def create_access_token(data: dict):
    to_encode = data.copy()
    expire = datetime.utcnow() + timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    to_encode.update({"exp": expire})
    # Bikin tokennya di sini
    encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
    return encoded_jwt