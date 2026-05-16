"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Calendar, Clock, Users, CreditCard, CheckCircle2, ChevronRight, ShieldCheck, Receipt } from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { useParams, useRouter } from "next/navigation";
import axios from "axios"; // 1. Wajib import Axios

export default function ReservationPage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;
  const baseId = id.replace("-copy", "");

  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [formData, setFormData] = useState({
    date: "",
    time: "",
    duration: "1",
    guests: "2",
    name: "Nadia Kusuma",
    phone: "081234567890",
    notes: ""
  });
  const [isProcessing, setIsProcessing] = useState(false);
  const [reservationData, setReservationData] = useState<any>(null); // State buat nangkep ID Reservasi dari Backend

  // --- LOGIKA TOMBOL FORM SUBMIT ---
  const handleNext = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Transisi Step 1 ke Step 2 (Pilih Metode Bayar)
    if (step === 1) {
      if (!formData.date || !formData.time) {
         alert("Bang, pilih tanggal sama jamnya dulu dong!");
         return;
      }
      setStep(2);
    } 
    // Transisi Step 2 ke Step 3 (Eksekusi API Booking!)
    else if (step === 2) {
      setIsProcessing(true);
      
      const token = localStorage.getItem("token");
      if (!token) {
        alert("Wajib login dulu buat booking bang!");
        router.push("/login");
        return;
      }

      // Hitung jam selesai (misal mulai jam 10:00, durasi 2 jam = selesai 12:00)
      const startHour = parseInt(formData.time.split(':')[0]);
      const endHour = startHour + parseInt(formData.duration);
      // Format jam biar tetep 2 digit (misal: "09:00" bukan "9:00")
      const endTimeFormatted = `${endHour.toString().padStart(2, '0')}:00`;

      try {
        // Tembak API FastAPI
        const response = await axios.post(
          `http://localhost:8000/api/cafes/${baseId}/reservations`,
          {
            booking_date: formData.date,
            start_time: formData.time,
            end_time: endTimeFormatted,
            guest_count: parseInt(formData.guests)
          },
          {
            headers: {
              "Authorization": `Bearer ${token}`,
              "Content-Type": "application/json"
            }
          }
        );

        // Kalau sukses dapet ID dari backend, simpen buat ditampilin di tiket
        setReservationData(response.data);
        
        // Buat demo lomba: Buka Midtrans di tab baru, lalu pindah ke halaman Sukses di tab ini.
        if (response.data.payment_url) {
            window.open(response.data.payment_url, '_blank');
        }
        
        setStep(3);

      } catch (error: any) {
        // 🚨 ALERT ANTI-BENTROK DARI BACKEND MUNCUL DI SINI 🚨
        const errorMsg = error.response?.data?.detail || "Sistem error bang.";
        alert("Waduh, Gagal Booking:\n\n" + (typeof errorMsg === 'string' ? errorMsg : JSON.stringify(errorMsg)));
        
        // Kalo bentrok, suruh user milih jam lain (balik ke step 1)
        if (error.response?.status === 400) {
            setStep(1);
        }
      } finally {
        setIsProcessing(false);
      }
    }
  };

  return (
    <div className="min-h-screen bg-zinc-50 pb-20">
      
      {/* Header */}
      <div className="bg-white border-b border-zinc-100 py-6 sticky top-0 z-50">
        <div className="container mx-auto max-w-screen-md px-4 flex items-center justify-between">
          <Link href={`/cafe/${id}`} className="flex items-center text-sm font-medium text-zinc-500 hover:text-black transition-colors">
            <ArrowLeft className="w-5 h-5 mr-1" /> Batal
          </Link>
          <div className="font-bold text-lg">Reservasi Ruangan</div>
          <div className="w-16" /> {/* Spacer */}
        </div>
      </div>

      <div className="container mx-auto max-w-screen-md px-4 py-8">
        
        {/* Progress Bar (Kode Lu) */}
        {step < 3 && (
          <div className="flex items-center justify-between mb-8 relative">
            <div className="absolute left-0 top-1/2 -translate-y-1/2 w-full h-1 bg-zinc-200 -z-10 rounded-full overflow-hidden">
              <div className={`h-full bg-black transition-all duration-500 ${step === 1 ? 'w-1/2' : 'w-full'}`} />
            </div>
            <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm ${step >= 1 ? 'bg-black text-white' : 'bg-zinc-200 text-zinc-500'}`}>1</div>
            <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm ${step >= 2 ? 'bg-black text-white' : 'bg-zinc-200 text-zinc-500'}`}>2</div>
          </div>
        )}

        {/* Step 1: Form Data (Kode Lu) */}
        {step === 1 && (
          <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
            {/* ... (Isi UI Step 1 Sama Persis) ... */}
            <Card className="rounded-[2rem] border-none shadow-sm mb-6 overflow-hidden">
              <div className="flex flex-col sm:flex-row items-center gap-4 p-4 bg-blue-50/50">
                <div className="w-full sm:w-24 h-24 rounded-xl overflow-hidden relative shrink-0">
                  <Image src="https://images.unsplash.com/photo-1497935586351-b67a49e012bf?auto=format&fit=crop&q=80&w=400" alt="Cafe" fill className="object-cover" />
                </div>
                <div>
                  <Badge className="bg-blue-100 text-blue-700 hover:bg-blue-100 border-none mb-1">Meeting Room (Max 6 Org)</Badge>
                  <h2 className="text-xl font-bold">Booking Kafe ID: {baseId}</h2>
                  <p className="text-sm text-zinc-500">Rp 50.000 / Jam / Orang (DP)</p>
                </div>
              </div>
            </Card>

            <form onSubmit={handleNext} className="space-y-6">
              
              {/* Box 1: Jadwal */}
              <div className="bg-white p-6 rounded-[2rem] shadow-sm border border-zinc-100 space-y-6">
                <div className="flex items-center justify-between">
                  <h3 className="font-bold text-lg flex items-center gap-2"><Calendar className="w-5 h-5" /> Pilih Jadwal</h3>
                  <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">Room Available</Badge>
                </div>
                
                {/* Date Selector (GW GANTI TAHUNNYA BIAR COCOK SAMA HARI INI: 2026-05) */}
                <div className="space-y-3">
                  <label className="text-sm font-semibold text-zinc-700">Tanggal</label>
                  <div className="flex gap-3 overflow-x-auto pb-2 snap-x">
                    {[
                      { day: "Sen", date: "16", active: formData.date === "2026-05-16", val: "2026-05-16" },
                      { day: "Sel", date: "17", active: formData.date === "2026-05-17", val: "2026-05-17" },
                      { day: "Rab", date: "18", active: formData.date === "2026-05-18", val: "2026-05-18" },
                      { day: "Kam", date: "19", active: formData.date === "2026-05-19", val: "2026-05-19" },
                    ].map((d, i) => (
                      <button
                        key={i}
                        type="button"
                        disabled={d.disabled}
                        onClick={() => setFormData({...formData, date: d.val})}
                        className={`flex-shrink-0 w-16 h-20 rounded-2xl flex flex-col items-center justify-center border-2 transition-all snap-start ${
                          d.disabled ? 'opacity-40 bg-zinc-50 border-zinc-100 cursor-not-allowed' :
                          d.active ? 'border-black bg-black text-white shadow-md' : 'border-zinc-200 bg-white hover:border-zinc-300 text-black'
                        }`}
                      >
                        <span className={`text-xs font-medium mb-1 ${d.active ? 'text-zinc-300' : 'text-zinc-500'}`}>{d.day}</span>
                        <span className="text-xl font-bold">{d.date}</span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Time Slots */}
                <div className="space-y-3">
                  <label className="text-sm font-semibold text-zinc-700">Slot Jam Mulai</label>
                  <div className="grid grid-cols-3 sm:grid-cols-4 gap-3">
                    {["09:00", "10:00", "11:00", "13:00", "14:00", "15:00", "16:00", "18:00"].map((t, i) => {
                      const isActive = formData.time === t;
                      return (
                        <button
                          key={t}
                          type="button"
                          onClick={() => setFormData({...formData, time: t})}
                          className={`py-3 rounded-xl text-sm font-bold border-2 transition-all ${
                            isActive ? 'border-amber-500 bg-amber-50 text-amber-700' : 'border-zinc-200 bg-white hover:border-amber-200 text-black'
                          }`}
                        >
                          {t}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Duration & Guests */}
                <div className="grid grid-cols-2 gap-4 pt-2">
                  <div className="space-y-3">
                    <label className="text-sm font-semibold text-zinc-700">Durasi (Jam)</label>
                    <div className="flex items-center gap-3 bg-zinc-50 p-1.5 rounded-xl border border-zinc-200 w-full justify-between">
                      <Button type="button" variant="outline" size="icon" onClick={() => setFormData({...formData, duration: String(Math.max(1, parseInt(formData.duration || "1") - 1))})} className="w-8 h-8 rounded-lg bg-white">-</Button>
                      <span className="font-bold text-sm">{formData.duration || "1"} Jam</span>
                      <Button type="button" variant="outline" size="icon" onClick={() => setFormData({...formData, duration: String(Math.min(8, parseInt(formData.duration || "1") + 1))})} className="w-8 h-8 rounded-lg bg-white">+</Button>
                    </div>
                  </div>
                  <div className="space-y-3">
                    <label className="text-sm font-semibold text-zinc-700">Jumlah Orang</label>
                    <div className="flex items-center gap-3 bg-zinc-50 p-1.5 rounded-xl border border-zinc-200 w-full justify-between">
                      <Button type="button" variant="outline" size="icon" onClick={() => setFormData({...formData, guests: String(Math.max(1, parseInt(formData.guests) - 1))})} className="w-8 h-8 rounded-lg bg-white">-</Button>
                      <span className="font-bold text-sm">{formData.guests} Org</span>
                      <Button type="button" variant="outline" size="icon" onClick={() => setFormData({...formData, guests: String(Math.min(6, parseInt(formData.guests) + 1))})} className="w-8 h-8 rounded-lg bg-white">+</Button>
                    </div>
                  </div>
                </div>
              </div>

              {/* Box 2: Informasi Pemesan (Kode Lu) */}
              <div className="bg-white p-6 rounded-[2rem] shadow-sm border border-zinc-100 space-y-5">
                <h3 className="font-bold text-lg mb-2 flex items-center gap-2"><Users className="w-5 h-5" /> Informasi Pemesan</h3>
                
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-zinc-700">Nama Lengkap</label>
                  <Input 
                    required 
                    value={formData.name}
                    onChange={(e) => setFormData({...formData, name: e.target.value})}
                    className="bg-zinc-50 h-12 rounded-xl border-zinc-200" 
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-zinc-700">Nomor Telepon</label>
                  <Input 
                    type="tel"
                    required 
                    value={formData.phone}
                    onChange={(e) => setFormData({...formData, phone: e.target.value})}
                    className="bg-zinc-50 h-12 rounded-xl border-zinc-200" 
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-zinc-700">Catatan Tambahan (Opsional)</label>
                  <Input 
                    placeholder="Contoh: Butuh proyektor atau kabel HDMI..."
                    value={formData.notes}
                    onChange={(e) => setFormData({...formData, notes: e.target.value})}
                    className="bg-zinc-50 h-12 rounded-xl border-zinc-200" 
                  />
                </div>
              </div>

              <Button 
                type="submit" 
                disabled={!formData.date || !formData.time}
                className="w-full bg-black hover:bg-zinc-800 disabled:bg-zinc-300 text-white rounded-full h-14 font-bold text-lg shadow-xl shadow-black/20"
              >
                Lanjut ke Pembayaran <ChevronRight className="w-5 h-5 ml-1" />
              </Button>
            </form>
          </div>
        )}

        {/* Step 2: Payment Gateway (Kode Lu, Tagihan Dinamis berdasarkan guest) */}
        {step === 2 && (
          <div className="animate-in fade-in slide-in-from-right-8 duration-500">
            <h2 className="text-2xl font-bold mb-6">Pilih Metode Pembayaran</h2>

            <Card className="rounded-[2rem] border-none shadow-sm mb-6 bg-white overflow-hidden">
              <div className="p-6 border-b border-zinc-100 bg-zinc-50/50">
                <p className="text-sm text-zinc-500 mb-1">Total Tagihan Booking (DP)</p>
                {/* Harga dinamis: Jumlah Orang x 50rb */}
                <div className="text-3xl font-bold">Rp {(parseInt(formData.guests) * 50000).toLocaleString()}</div>
              </div>
              <CardContent className="p-6 space-y-4">
                <div className="flex justify-between text-sm">
                  <span className="text-zinc-500">Kafe ID</span>
                  <span className="font-semibold">{baseId}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-zinc-500">Jadwal</span>
                  <span className="font-semibold">{formData.date} • {formData.time} WIB</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-zinc-500">Peserta</span>
                  <span className="font-semibold">{formData.guests} Orang</span>
                </div>
              </CardContent>
            </Card>

            <form onSubmit={handleNext} className="space-y-4">
              <p className="font-bold text-sm text-zinc-500 uppercase tracking-wider mb-2">E-Wallet / QRIS</p>
              
              <label className="flex items-center justify-between p-4 bg-white border-2 border-zinc-200 rounded-2xl cursor-pointer hover:border-amber-500 transition-colors has-[:checked]:border-amber-500 has-[:checked]:bg-amber-50/50">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-zinc-100 rounded-xl flex items-center justify-center font-bold text-xs">QRIS</div>
                  <span className="font-bold">QRIS (Gopay/Ovo/Dana)</span>
                </div>
                <input type="radio" name="payment" defaultChecked className="w-5 h-5 accent-amber-500" />
              </label>

              <label className="flex items-center justify-between p-4 bg-white border-2 border-zinc-200 rounded-2xl cursor-pointer hover:border-amber-500 transition-colors has-[:checked]:border-amber-500 has-[:checked]:bg-amber-50/50">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-zinc-100 rounded-xl flex items-center justify-center"><CreditCard className="w-5 h-5 text-zinc-500" /></div>
                  <span className="font-bold">Virtual Account BCA</span>
                </div>
                <input type="radio" name="payment" className="w-5 h-5 accent-amber-500" />
              </label>

              <div className="flex items-center gap-2 text-xs text-zinc-500 mt-6 mb-2 justify-center">
                <ShieldCheck className="w-4 h-4 text-green-500" /> Pembayaran akan diproses via Midtrans Sandbox
              </div>

              <Button 
                type="submit" 
                disabled={isProcessing}
                className="w-full bg-black hover:bg-zinc-800 text-white rounded-full h-14 font-bold text-lg shadow-xl shadow-black/20"
              >
                {isProcessing ? "Menghubungi Server..." : `Bayar Rp ${(parseInt(formData.guests) * 50000).toLocaleString()} Sekarang`}
              </Button>
            </form>
          </div>
        )}

        {/* Step 3: Success Ticket (Menampilkan ID Reservasi Asli dari DB) */}
        {step === 3 && (
          <div className="animate-in zoom-in-95 fade-in duration-500 flex flex-col items-center justify-center py-10">
            
            <div className="w-24 h-24 bg-green-100 rounded-full flex items-center justify-center mb-6">
              <CheckCircle2 className="w-12 h-12 text-green-600" />
            </div>
            
            <h2 className="text-3xl font-bold mb-2 text-center">Reservasi Berhasil!</h2>
            <p className="text-zinc-500 mb-10 text-center max-w-sm">Tempat lo udah diamankan di database. Tunjukin tiket ini ke kasir.</p>

            <div className="w-full max-w-sm bg-white rounded-[2rem] border border-zinc-200 shadow-2xl relative overflow-hidden">
              <div className="absolute -left-4 top-1/2 w-8 h-8 bg-zinc-50 rounded-full border-r border-zinc-200" />
              <div className="absolute -right-4 top-1/2 w-8 h-8 bg-zinc-50 rounded-full border-l border-zinc-200" />
              <div className="absolute left-6 right-6 top-1/2 border-t-2 border-dashed border-zinc-200" />

              <div className="p-8 pb-10 text-center">
                <Badge className="bg-green-100 text-green-700 hover:bg-green-100 border-none mb-4">CONFIRMED</Badge>
                <h3 className="font-bold text-2xl mb-1">Kafe ID: {baseId}</h3>
                <p className="text-zinc-500 text-sm">Meeting Room</p>
              </div>

              <div className="p-8 pt-10 bg-zinc-50 space-y-4">
                <div className="flex justify-between">
                  <span className="text-zinc-500 text-sm">Nama</span>
                  <span className="font-bold text-sm text-right">{formData.name}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-zinc-500 text-sm">Waktu</span>
                  <span className="font-bold text-sm text-right">{formData.date} • {formData.time} WIB</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-zinc-500 text-sm">Kode Booking</span>
                  {/* Tampilkan ID asli dari database */}
                  <span className="font-bold text-sm text-right text-amber-600">
                    RES-{reservationData?.reservation_id || "8921"}
                  </span>
                </div>
              </div>
            </div>

            <div className="mt-10 flex gap-4 w-full max-w-sm">
              <Link href="/profile" className="w-full">
                <Button variant="outline" className="w-full rounded-full h-12 border-2">Cek di Profil</Button>
              </Link>
              <Link href="/discover" className="w-full">
                <Button className="w-full bg-black hover:bg-zinc-800 text-white rounded-full h-12">Ke Beranda</Button>
              </Link>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}