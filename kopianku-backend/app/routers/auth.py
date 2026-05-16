from typing import List
from fastapi import APIRouter, Depends, HTTPException, UploadFile, File
import shutil
import time
from fastapi import APIRouter, Depends, HTTPException, status
from sqlmodel import Session, select
from app.database import get_session
from app.models.user import User, UserCreate
from app.security import get_password_hash
from pydantic import BaseModel
from app.security import verify_password, create_access_token
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
import jwt
from app.security import SECRET_KEY, ALGORITHM

router = APIRouter()

@router.post("/register", status_code=status.HTTP_201_CREATED)
def register_user(user_data: UserCreate, session: Session = Depends(get_session)):
    # 1. Cek apakah email atau username udah dipakai sama orang lain
    existing_user = session.exec(
        select(User).where((User.email == user_data.email) | (User.username == user_data.username))
    ).first()
    
    if existing_user:
        raise HTTPException(status_code=400, detail="Username atau Email udah terdaftar bang!")

    # 2. Acak password aslinya
    hashed_pw = get_password_hash(user_data.password)

    # 3. Bikin object User baru buat dimasukin ke database
    new_user = User(
        username=user_data.username,
        email=user_data.email,
        hashed_password=hashed_pw
    )

    # 4. Simpan ke Postgres
    session.add(new_user)
    session.commit()
    session.refresh(new_user)

    # Balikin response sukses tanpa nampilin password
    return {
        "message": "Berhasil daftar! Mantap bang.", 
        "user": {"username": new_user.username, "email": new_user.email}
    }

# Skema data untuk login
class UserLogin(BaseModel):
    email: str
    password: str

@router.post("/login")
def login(user_data: UserLogin, session: Session = Depends(get_session)):
    # 1. Cari user di database berdasarkan email
    user = session.exec(select(User).where(User.email == user_data.email)).first()
    
    # 2. Kalau email nggak ketemu ATAU password salah
    if not user or not verify_password(user_data.password, user.hashed_password):
        raise HTTPException(status_code=401, detail="Email atau password salah bang!")

    # 3. Kalau sukses, bikinin tiket masuk (JWT Token)
    access_token = create_access_token(data={"sub": user.email})
    
    # Balikin tokennya ke frontend
    return {
        "access_token": access_token, 
        "token_type": "bearer",
        "username": user.username
    }
    
# Inisialisasi satpam pemeriksa Bearer Token
security = HTTPBearer()

# Fungsi Pengecek Token (Dependency)
def get_current_user(credentials: HTTPAuthorizationCredentials = Depends(security), session: Session = Depends(get_session)):
    token = credentials.credentials
    try:
        # Buka gembok tokennya pakai Kunci Rahasia
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        email: str = payload.get("sub")
        if email is None:
            raise HTTPException(status_code=401, detail="Tokennya nggak valid bang!")
    except jwt.ExpiredSignatureError:
        raise HTTPException(status_code=401, detail="Token udah kadaluarsa, login lagi gih!")
    except jwt.InvalidTokenError:
        raise HTTPException(status_code=401, detail="Token palsu atau rusak!")

    # Cari usernya beneran ada nggak di DB
    user = session.exec(select(User).where(User.email == email)).first()
    if not user:
        raise HTTPException(status_code=401, detail="User nggak ketemu di database!")
        
    return user


# Ruangan VIP (Hanya bisa diakses kalau bawa token valid)
@router.get("/me")
def get_my_profile(current_user: User = Depends(get_current_user)):
    # Kalau berhasil ngelewatin get_current_user, berarti dia aman
    return {
        "message": "Selamat datang di Area VIP!",
        "user_info": {
            "id": current_user.id,
            "username": current_user.username,
            "email": current_user.email
        }
    }
    
@router.post("/onboarding")
def update_onboarding(
    prefs: List[str], 
    current_user: User = Depends(get_current_user), 
    session: Session = Depends(get_session)
):
    # Simpan preferensi user
    current_user.preferences = prefs
    
    # Logika sederhana penentuan persona (mirip ML classification sederhana)
    if "WFC" in prefs and "WiFi" in prefs:
        current_user.persona_badge = "Digital Nomad"
    elif "Nongkrong" in prefs:
        current_user.persona_badge = "Social Butterfly"
    else:
        current_user.persona_badge = "Coffee Explorer"
        
    session.add(current_user)
    session.commit()
    
    return {
        "message": "Profil personalisasi berhasil dibuat!",
        "persona": current_user.persona_badge
    }
    
# Owner Seceurity
def get_current_owner(current_user: User = Depends(get_current_user)):
    if current_user.role != "owner":
        raise HTTPException(
            status_code=403, # 403 Forbidden = Dilarang masuk!
            detail="Hush! Ini portal khusus Owner Kafe bang! User biasa nggak boleh ke sini."
        )
    return current_user

@router.post("/upload-avatar")
def upload_avatar(
    file: UploadFile = File(...),
    current_user: User = Depends(get_current_user) # Wajib login bang!
):
    # 1. Validasi ekstensi file tipis-tipis
    if not file.filename.endswith(('.png', '.jpg', '.jpeg')):
        raise HTTPException(status_code=400, detail="Hanya boleh file gambar bang!")
    
    # 2. Bikin nama file unik (Pake username + timestamp biar nggak ketimpa)
    # Contoh: yahyabakhsin_168432.png
    timestamp = int(time.time())
    safe_filename = f"{current_user.username}_{timestamp}_{file.filename}"
    file_location = f"static/uploads/{safe_filename}"
    
    # 3. Simpan file-nya ke harddisk server
    with open(file_location, "wb+") as file_object:
        shutil.copyfileobj(file.file, file_object)
        
    # (Di dunia nyata, lu update kolom avatar_url di tabel users di sini)
    
    return {
        "message": "Foto profil berhasil di-upload dengan sukses!",
        "filename": safe_filename,
        "url_gambar": f"http://localhost:8000/static/uploads/{safe_filename}" # <--- Link ini bisa lu klik!
    }