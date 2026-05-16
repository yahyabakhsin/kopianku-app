import os
import httpx
from fastapi import APIRouter, Depends, HTTPException, status
from sqlmodel import Session, select
from pydantic import BaseModel
from dotenv import load_dotenv

from app.database import get_session
from app.models.user import User
from app.models.cafe import Cafe
from app.routers.auth import get_current_user

# Load environment variables (to get GEMINI_API_KEY)
# Gunakan path absolut ke file .env di backend biar selalu ketemu
import os
dotenv_path = os.path.join(os.path.dirname(os.path.dirname(os.path.dirname(__file__))), '.env')
load_dotenv(dotenv_path)

router = APIRouter()

class ChatRequest(BaseModel):
    text: str

@router.post("/ask")
async def ask_chatbot(
    request: ChatRequest,
    current_user: User = Depends(get_current_user),
    session: Session = Depends(get_session)
):
    api_key = os.getenv("GEMINI_API_KEY")
    if not api_key:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="API Key Gemini belum disetup di backend."
        )

    # 1. Ambil data cafe dari database
    cafes = session.exec(select(Cafe)).all()
    
    # 2. Format data cafe supaya bisa dibaca AI
    cafe_data_text = ""
    for c in cafes:
        vibes_str = ", ".join(c.vibes) if c.vibes else "N/A"
        cafe_data_text += f"- {c.name} ({c.location}). Rating: {c.rating}. Vibes: {vibes_str}. Review AI: {c.ai_summary}\n"

    # 3. Format preferensi user
    user_prefs_str = ", ".join(current_user.preferences) if current_user.preferences else "Belum ada spesifik"
    user_persona = current_user.persona_badge

    # 4. Buat prompt sistem
    system_prompt = f"""Lu adalah Kopi-Assistant, asisten virtual super asik untuk aplikasi Kopianku. 
Jawab pertanyaan user ini dengan santai, gaul (pake lo/gue), singkat (maksimal 3-4 kalimat).
PENTING: Rekomendasikan kafe hanya dari daftar Database Kafe berikut ini yang paling cocok dengan preferensi user.

[Profil User]
Nama: {current_user.username}
Persona: {user_persona}
Preferensi: {user_prefs_str}

[Database Kafe]
{cafe_data_text}

Pertanyaan user: {request.text}
"""

    # 5. Tembak API Gemini
    gemini_url = f"https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key={api_key}"
    
    try:
        async with httpx.AsyncClient() as client:
            response = await client.post(
                gemini_url,
                json={"contents": [{"parts": [{"text": system_prompt}]}]},
                timeout=15.0
            )
            response.raise_for_status()
            data = response.json()
            
            if not data.get("candidates") or len(data["candidates"]) == 0:
                raise HTTPException(status_code=500, detail="Google Gemini balasan kosong.")
                
            ai_response_text = data["candidates"][0]["content"]["parts"][0]["text"]
            return {"response": ai_response_text}
            
    except httpx.HTTPStatusError as e:
        print(f"Gemini API Error: {e.response.text}")
        raise HTTPException(status_code=500, detail="Gagal menghubungi API Gemini.")
    except Exception as e:
        print(f"Chatbot Error: {str(e)}")
        raise HTTPException(status_code=500, detail="Terjadi kesalahan internal pada chatbot.")
