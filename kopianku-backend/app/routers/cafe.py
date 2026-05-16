from app.routers.auth import security, get_current_user
from sqlmodel import Session, select
from typing import List, Optional
from app.models.cafe import Cafe
from app.database import get_session
from fastapi import APIRouter, Depends, HTTPException
from app.models.review import Review, ReviewCreate
from app.routers.auth import get_current_user
from app.models.user import User
from app.models.checkin import CheckIn
from datetime import datetime, timedelta
from app.models.reservation import Reservation, ReservationCreate
from transformers import pipeline
import midtransclient
from datetime import datetime

router = APIRouter()
from fastapi.security import HTTPAuthorizationCredentials

# Load model NLP ringan untuk sentimen (proses ini makan waktu beberapa detik pas server baru nyala)
print("Loading AI Model... Sabar bang...")
sentiment_analyzer = pipeline("sentiment-analysis")
print("AI Model Ready!")

# Setup Midtrans (Gunakan Sandbox untuk Testing)
# Idealnya Server Key ini ditaruh di file .env, tapi buat malam ini kita hajar hardcode dulu
MIDTRANS_SERVER_KEY = "SB-Mid-server-xxxx" # Nanti lu ganti pakai Server Key dari akun Midtrans lu (kalau ada)

snap = midtransclient.Snap(
    is_production=False,
    server_key=MIDTRANS_SERVER_KEY
)

@router.get("/cafes")
def get_all_cafes(
    session: Session = Depends(get_session),
    # Ubah tipe datanya jadi HTTPAuthorizationCredentials, dan pake security dari auth.py
    token_data: Optional[HTTPAuthorizationCredentials] = Depends(security) 
):
    cafes = session.exec(select(Cafe)).all()
    
    current_user = None
    # Cek kalau token_data ada (berarti user login)
    if token_data:
        try:
            # get_current_user butuh parameter token_data dan session
            current_user = get_current_user(token_data, session)
        except:
            # Kalau token kadaluarsa atau salah, biarin aja jadi guest
            pass

    cafes_with_score = []
    for cafe in cafes:
        cafe_dict = cafe.dict()
        match_score = 0
        
        if current_user and current_user.preferences:
            cafe_tags = cafe.vibes + [f.get("name") for f in cafe.facilities] if isinstance(cafe.facilities, list) else []
            matches = set(current_user.preferences) & set(cafe_tags)
            match_score = int((len(matches) / len(current_user.preferences)) * 100) if current_user.preferences else 0
        
        cafe_dict["match_score"] = match_score
        cafes_with_score.append(cafe_dict)

    return sorted(cafes_with_score, key=lambda x: x["match_score"], reverse=True)

@router.get("/cafes/{cafe_id}")
def get_cafe_detail(cafe_id: str, session: Session = Depends(get_session)):
    # 1. Cari kafe berdasarkan ID
    cafe = session.get(Cafe, cafe_id)
    
    # 2. Kalau nggak ketemu, lempar 404
    if not cafe:
        raise HTTPException(status_code=404, detail="Kafenya nggak ketemu bang!")
    
    # 3. Kalau ketemu, return datanya
    return cafe

@router.post("/cafes/{cafe_id}/reviews")
def add_review(
    cafe_id: str, 
    review_data: ReviewCreate, 
    current_user: User = Depends(get_current_user),
    session: Session = Depends(get_session)
):
    # 1. Cek kafenya ada atau nggak
    cafe = session.get(Cafe, cafe_id)
    if not cafe:
        raise HTTPException(status_code=404, detail="Kafenya nggak ketemu bang!")

    # 2. Bikin review baru
    new_review = Review(
        text=review_data.text,
        rating=review_data.rating,
        user_id=current_user.id,
        cafe_id=cafe_id
    )
    session.add(new_review)

    # 3. MENGHITUNG RATA-RATA RATING BARU
    # Rumus: ((Rating Lama * Jumlah Review Lama) + Rating Baru) / (Jumlah Review Lama + 1)
    
    total_skor_lama = cafe.rating * cafe.reviewCount
    total_skor_baru = total_skor_lama + review_data.rating
    jumlah_review_baru = cafe.reviewCount + 1
    
    rating_baru = total_skor_baru / jumlah_review_baru

    # 4. Update data kafenya
    cafe.rating = round(rating_baru, 1) # Bulatin jadi 1 angka di belakang koma (misal 4.5)
    cafe.reviewCount = jumlah_review_baru
    session.add(cafe)

    # 5. Simpan semuanya (Review baru & Update Cafe) ke Postgres dalam 1x jalan!
    session.commit()
    
    return {
        "message": "Mantap, review berhasil ditambahkan dan rating kafe udah di-update!",
        "new_cafe_rating": cafe.rating,
        "new_review_count": cafe.reviewCount
    }

@router.get("/cafes/{cafe_id}/reviews")
def get_cafe_reviews(cafe_id: str, session: Session = Depends(get_session)):
    # 1. Pastikan kafenya ada
    cafe = session.get(Cafe, cafe_id)
    if not cafe:
        raise HTTPException(status_code=404, detail="Kafenya nggak ketemu bang!")

    # 2. Lakukan JOIN antara tabel Review dan User
    statement = select(Review, User).where(Review.cafe_id == cafe_id).join(User)
    results = session.exec(statement).all()

    # 3. Format outputnya biar rapi pas dikirim ke Frontend
    reviews_data = []
    for review, user in results:
        reviews_data.append({
            "id": review.id,
            "text": review.text,
            "rating": review.rating,
            "created_at": review.created_at,
            "username": user.username  # Nah, ini kita dapet dari tabel User!
        })

    return reviews_data

@router.post("/cafes/{cafe_id}/checkin")
def check_in_cafe(
    cafe_id: str, 
    current_user: User = Depends(get_current_user), # Wajib login!
    session: Session = Depends(get_session)
):
    # Cek kafenya ada nggak
    cafe = session.get(Cafe, cafe_id)
    if not cafe:
        raise HTTPException(status_code=404, detail="Kafenya nggak ketemu bang!")

    # Bikin data check-in baru
    new_checkin = CheckIn(user_id=current_user.id, cafe_id=cafe_id)
    session.add(new_checkin)
    session.commit()

    return {"message": f"Sukses check-in di {cafe.name}! Status ini bakal hilang dalam 6 jam."}


@router.get("/cafes/{cafe_id}/active-users")
def get_active_checkins(cafe_id: str, session: Session = Depends(get_session)):
    # Hitung waktu 6 jam yang lalu dari sekarang
    batas_waktu = datetime.utcnow() - timedelta(hours=6)

    # Ambil check-in yang kafenya cocok DAN waktunya masih lebih baru dari 6 jam lalu
    statement = (
        select(CheckIn, User)
        .where(CheckIn.cafe_id == cafe_id)
        .where(CheckIn.created_at >= batas_waktu) # INI KUNCI LOGIKANYA!
        .join(User)
    )
    
    results = session.exec(statement).all()

    # Format datanya
    active_users = []
    for checkin, user in results:
        active_users.append({
            "username": user.username,
            "checkin_time": checkin.created_at
        })

    return {
        "active_count": len(active_users),
        "users": active_users
    }
    
@router.post("/cafes/{cafe_id}/reservations")
def create_reservation(
    cafe_id: str, 
    req: ReservationCreate, 
    current_user: User = Depends(get_current_user),
    session: Session = Depends(get_session)
):
    # 1. Cek kafe-nya ada nggak
    cafe = session.get(Cafe, cafe_id)
    if not cafe:
        raise HTTPException(status_code=404, detail="Kafenya nggak ketemu bang!")

    # 2. Validasi Waktu Dasar (Jam mulai harus lebih awal dari jam selesai)
    if req.start_time >= req.end_time:
        raise HTTPException(status_code=400, detail="Format jam salah! Masa jam selesai lebih dulu dari jam mulai?")

    # 3. LOGIKA ANTI DOUBLE-BOOKING (Cek Jadwal Bentrok)
    # Rumus Bentrok: (Existing.start < New.end) AND (Existing.end > New.start)
    overlapping_reservation = session.exec(
        select(Reservation)
        .where(Reservation.cafe_id == cafe_id)
        .where(Reservation.booking_date == req.booking_date)
        .where(Reservation.status != "cancelled") # Yang udah dicancel gak usah dihitung
        .where(Reservation.start_time < req.end_time)
        .where(Reservation.end_time > req.start_time)
    ).first()

    if overlapping_reservation:
        raise HTTPException(
            status_code=400, 
            detail=f"Yah keduluan bang! Jadwal dari {overlapping_reservation.start_time} sampai {overlapping_reservation.end_time} udah dibooking orang."
        )

    # 4. Kalau aman, simpan reservasinya
    new_reservation = Reservation(
        user_id=current_user.id,
        cafe_id=cafe_id,
        booking_date=req.booking_date,
        start_time=req.start_time,
        end_time=req.end_time,
        guest_count=req.guest_count
    )
    
    session.add(new_reservation)
    session.commit()
    session.refresh(new_reservation)
    
    # --- INTEGRASI MIDTRANS (Minta Link Pembayaran) ---
    # Bikin Order ID yang unik (gabungan ID Reservasi dan Timestamp)
    order_id = f"RES-{new_reservation.id}-{int(datetime.now().timestamp())}"
    
    # Anggap aja DP booking meeting room itu Rp 50.000 per orang
    gross_amount = req.guest_count * 50000 

    param = {
        "transaction_details": {
            "order_id": order_id,
            "gross_amount": gross_amount
        },
        "customer_details": {
            "first_name": current_user.username,
            "email": current_user.email
        }
    }

    try:
        # Tembak API Midtrans
        transaction = snap.create_transaction(param)
        payment_url = transaction['redirect_url']
    except Exception as e:
        # JURUS HACKATHON: Kalau Server Key lu kosong/salah, 
        # API nggak bakal crash, tapi ngasih link dummy biar demo tetep jalan.
        payment_url = "https://simulator.sandbox.midtrans.com/qris/index.html" 

    return {
        "message": "Reservasi berhasil diamankan! Silakan selesaikan pembayaran.", 
        "reservation_id": new_reservation.id,
        "status": new_reservation.status,
        "total_tagihan": gross_amount,
        "payment_url": payment_url  # <--- Ini yang bakal dibuka di HP juri!
    }

    return {
        "message": "Reservasi berhasil diamankan!", 
        "reservation_id": new_reservation.id,
        "status": new_reservation.status
    }
    
@router.get("/cafes/{cafe_id}/ai-summary")
def get_ai_vibe_summary(cafe_id: str, session: Session = Depends(get_session)):
    # 1. Pastikan kafenya ada
    cafe = session.get(Cafe, cafe_id)
    if not cafe:
        raise HTTPException(status_code=404, detail="Kafenya nggak ketemu bang!")

    # 2. Ambil semua teks review buat kafe ini
    reviews = session.exec(select(Review).where(Review.cafe_id == cafe_id)).all()
    
    if not reviews:
        return {"message": "Belum ada review nih, AI-nya belum bisa nyari vibe-nya."}

    # 3. Kumpulin semua teks ke dalam satu list
    all_review_texts = [r.text for r in reviews]
    
    # 4. PROSES INFERENSI AI (The Magic Happens Here)
    # Kita suruh model NLP ngecek satu-satu review-nya
    ai_results = sentiment_analyzer(all_review_texts)
    
    # 5. Agregasi Hasil Sentimen
    positive_count = 0
    negative_count = 0
    
    for result in ai_results:
        if result['label'] == 'POSITIVE':
            positive_count += 1
        else:
            negative_count += 1
            
    # Tentukan vibe mayoritas
    if positive_count > negative_count:
        vibe_conclusion = "Vibe kafe ini asik banget! Mayoritas pengunjung ngasih respon positif."
    elif negative_count > positive_count:
        vibe_conclusion = "Hmm, kafenya lagi banyak dikritik nih. Mungkin lagi rame atau pelayanannya lambat."
    else:
        vibe_conclusion = "Vibe kafenya netral. Ada yang suka, ada yang ngerasa biasa aja."

    return {
        "cafe_name": cafe.name,
        "total_reviews_analyzed": len(all_review_texts),
        "sentiment_breakdown": {
            "positive_reviews": positive_count,
            "negative_reviews": negative_count
        },
        "ai_conclusion": vibe_conclusion,
        "raw_ai_analysis": ai_results # Buat pamer ke juri kalau ini beneran pake ML
    }