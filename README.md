# ☕ Kopianku - Smart Cafe Discovery & Booking Platform

Kopianku adalah platform inovatif berbasis web yang membantu pengguna menemukan kafe terbaik untuk bekerja (WFC), nongkrong, atau nugas. Dilengkapi dengan fitur asisten AI, reservasi tempat (booking), dan sistem pembayaran terintegrasi.

🌍 **Live Demo:** [Link Vercel: https://kopianku.vercel.app]

## ✨ Fitur Unggulan
* **Smart Discover:** Cari kafe berdasarkan fasilitas (Wi-Fi, colokan, 24 Jam) dan jarak lokasi.
* **Kopi-Assistant (AI):** Chatbot pintar bertenaga Gemini AI untuk rekomendasi kafe sesuai *mood* dan kebutuhan.
* **Seamless Reservation:** Booking tempat duduk/ruangan langsung dari web.
* **Integrated Payment:** Pembayaran aman dan transparan menggunakan Midtrans (QRIS/GoPay/Transfer).
* **Social & Community:** Bagikan *wishlist* dan *album* kafe favoritmu ke teman-teman.

## 💻 Tech Stack
* **Frontend:** Next.js (React), Tailwind CSS, Shadcn UI
* **Backend:** FastAPI (Python), SQLModel, PostgreSQL
* **Payment Gateway:** Midtrans Snap.js
* **AI Engine:** Google Gemini API

---

## 🚀 Cara Menjalankan Project Secara Lokal (Local Development)

Jika ingin menjalankan aplikasi ini di komputer sendiri (tanpa live link), ikuti langkah berikut:

### 1. Setup Backend (FastAPI)
1. Buka terminal dan masuk ke folder backend: `cd kopianku-backend`
2. Buat Virtual Environment (opsional tapi disarankan): `python -m venv venv` lalu aktifkan.
3. Install dependencies: `pip install -r requirements.txt`
4. Jalankan server: `uvicorn app.main:app --reload`
5. Backend akan berjalan di `http://localhost:8000`.

### 2. Setup Frontend (Next.js)
1. Buka terminal baru dan masuk ke folder frontend: `cd kopianku-frontend`
2. Install dependencies: `npm install`
3. Buat file `.env.local` dan masukkan kredensial berikut:
   ```env
   NEXT_PUBLIC_API_URL=http://localhost:8000
   NEXT_PUBLIC_MIDTRANS_CLIENT_KEY=SB-Mid-client-[KODE_CLIENT_KEY_ANDA]
## 🔐 Akun Demo / Testing 
Untuk menguji fitur dan melihat antarmuka Dashboard Admin / Pemilik Kafe, silakan gunakan kredensial berikut pada halaman Login:

- **Email:** `roketto@gmail.com`
- **Password:** `roketto123`
