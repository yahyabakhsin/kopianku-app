"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Calendar, Clock, Users, CreditCard, CheckCircle2, ChevronRight, ShieldCheck } from "lucide-react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import axios from "axios"; 
import Script from "next/script";

declare global {
  interface Window {
    snap: any;
  }
}

export default function ReservationPage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;
  const baseId = id.replace("-copy", "");

  const [cafeData, setCafeData] = useState<any>(null);
  const [cafeName, setCafeName] = useState("Loading Kafe...");
  
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [formData, setFormData] = useState({
    date: "",
    time: "",
    endTime: "",
    guests: "2",
    name: "Ahmad Jago",
    phone: "081234567890",
    notes: ""
  });
  const [isProcessing, setIsProcessing] = useState(false);
  const [reservationData, setReservationData] = useState<any>(null);
  const [showDummyPayment, setShowDummyPayment] = useState(false);

  // Ambil Data Kafe Asli
  useEffect(() => {
    axios.get(`http://localhost:8000/api/cafes/${baseId}`)
      .then(res => {
        setCafeData(res.data);
        setCafeName(res.data.name);
      })
      .catch(() => setCafeName(`Kafe ID: ${baseId}`));
  }, [baseId]);

  const handleNext = async (e: React.FormEvent) => {
    e.preventDefault();
    if (step === 1) {
      setStep(2);
    } 
    else if (step === 2) {
      setIsProcessing(true);
      const token = localStorage.getItem("token");
      if (!token) {
        alert("Wajib login dulu buat booking bang!");
        router.push("/login");
        return;
      }

      if (!formData.time || !formData.endTime) {
        alert("Pilih Jam Mulai dan Jam Selesai!");
        setIsProcessing(false);
        return;
      }
      
      const startHour = parseInt(formData.time.split(':')[0]);
      const endHour = parseInt(formData.endTime.split(':')[0]);
      
      if (endHour <= startHour) {
        alert("Jam Selesai harus lebih besar dari Jam Mulai!");
        setIsProcessing(false);
        return;
      }

      try {
        const response = await axios.post(
          `http://localhost:8000/api/cafes/${baseId}/reservations`,
          {
            booking_date: formData.date,
            start_time: formData.time,
            end_time: formData.endTime,
            guest_count: parseInt(formData.guests)
          },
          { headers: { "Authorization": `Bearer ${token}` } }
        );

        setReservationData(response.data);
        
        if (response.data.payment_token) {
          // Bypassing Snap for hackathon demo if token is dummy
          if (response.data.payment_token === "dummy-token-12345") {
            setShowDummyPayment(true);
            setIsProcessing(false);
            return;
          }

          // Panggil Snap.js
          if (window.snap) {
            window.snap.pay(response.data.payment_token, {
              onSuccess: function (result: any) {
                console.log("Pembayaran Sukses!", result);
                setStep(3);
                setIsProcessing(false);
              },
              onPending: function (result: any) {
                console.log("Pembayaran Pending!", result);
                setStep(3);
                setIsProcessing(false);
              },
              onError: function (result: any) {
                console.log("Pembayaran Gagal!", result);
                alert("Pembayaran Gagal: " + result.status_message);
                setIsProcessing(false);
              },
              onClose: function () {
                console.log("Tutup popup tanpa bayar");
                setIsProcessing(false);
              }
            });
          } else {
            console.error("Snap.js belum terload");
            setIsProcessing(false);
          }
        } else {
          setStep(3);
          setIsProcessing(false);
        }

      } catch (error: any) {
        const errorMsg = error.response?.data?.detail || "Sistem error bang.";
        alert("Waduh, Gagal Booking:\n\n" + errorMsg);
        if (error.response?.status === 400) setStep(1);
        setIsProcessing(false);
      }
    }
  };

  return (
    <div className="min-h-screen bg-zinc-50 pb-20">
      <Script 
        src="https://app.sandbox.midtrans.com/snap/snap.js" 
        data-client-key={process.env.NEXT_PUBLIC_MIDTRANS_CLIENT_KEY || "SB-Mid-client-XXXXX"} 
        strategy="lazyOnload" 
      />
      <div className="bg-white border-b border-zinc-100 py-6 sticky top-0 z-50">
        <div className="container mx-auto max-w-screen-md px-4 flex items-center justify-between">
          <Link href={`/cafe/${id}`} className="flex items-center text-sm font-medium text-zinc-500 hover:text-black transition-colors">
            <ArrowLeft className="w-5 h-5 mr-1" /> Batal
          </Link>
          <div className="font-bold text-lg">Reservasi Ruangan</div>
          <div className="w-16" />
        </div>
      </div>

      <div className="container mx-auto max-w-screen-md px-4 py-8">
        {step < 3 && (
          <div className="flex items-center justify-between mb-8 relative">
            <div className="absolute left-0 top-1/2 -translate-y-1/2 w-full h-1 bg-zinc-200 -z-10 rounded-full overflow-hidden">
              <div className={`h-full bg-black transition-all duration-500 ${step === 1 ? 'w-1/2' : 'w-full'}`} />
            </div>
            <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm ${step >= 1 ? 'bg-black text-white' : 'bg-zinc-200 text-zinc-500'}`}>1</div>
            <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm ${step >= 2 ? 'bg-black text-white' : 'bg-zinc-200 text-zinc-500'}`}>2</div>
          </div>
        )}

        {step === 1 && (
          <div className="animate-in fade-in duration-500">
            <Card className="rounded-[2rem] border-none shadow-sm mb-6 overflow-hidden">
              <div className="flex flex-col sm:flex-row items-center gap-4 p-4 bg-blue-50/50">
                <div>
                  <Badge className="bg-blue-100 text-blue-700 border-none mb-1">Meeting Room (Max 6 Org)</Badge>
                  <h2 className="text-xl font-bold">{cafeName}</h2>
                  <p className="text-sm text-zinc-500">Rp 50.000 / Orang (DP)</p>
                </div>
              </div>
            </Card>

            <form onSubmit={handleNext} className="space-y-6">
              <div className="bg-white p-6 rounded-[2rem] shadow-sm border border-zinc-100 space-y-6">
                <div className="space-y-3">
                  <label className="text-sm font-semibold text-zinc-700">Tanggal</label>
                  <div className="flex gap-3 overflow-x-auto pb-2 snap-x">
                    {/* KLIK SALAH SATU TANGGAL INI BIAR TOMBOL NYALA */}
                    {[
                      { day: "Sen", date: "16", val: "2026-05-16" },
                      { day: "Sel", date: "17", val: "2026-05-17" },
                      { day: "Rab", date: "18", val: "2026-05-18" },
                    ].map((d, i) => (
                      <button
                        key={i} type="button"
                        onClick={() => setFormData({...formData, date: d.val})}
                        className={`w-16 h-20 rounded-2xl flex flex-col items-center justify-center border-2 transition-all ${
                          formData.date === d.val ? 'border-black bg-black text-white' : 'border-zinc-200 bg-white text-black'
                        }`}
                      >
                        <span className="text-xs font-medium mb-1">{d.day}</span>
                        <span className="text-xl font-bold">{d.date}</span>
                      </button>
                    ))}
                  </div>
                </div>

                <div className="space-y-3">
                  <label className="text-sm font-semibold text-zinc-700">Slot Jam Mulai</label>
                  <div className="grid grid-cols-3 sm:grid-cols-4 gap-3">
                    {Array.from({length: 13}, (_, i) => `${(i + 9).toString().padStart(2, '0')}:00`).map((t) => {
                      let isFull = false;
                      if (cafeData?.full_date && cafeData?.full_start_time && cafeData?.full_end_time) {
                        if (formData.date === cafeData.full_date) {
                          if (cafeData.full_start_time <= cafeData.full_end_time) {
                            isFull = t >= cafeData.full_start_time && t <= cafeData.full_end_time;
                          } else {
                            isFull = t >= cafeData.full_start_time || t <= cafeData.full_end_time;
                          }
                        }
                      }
                      
                      return (
                        <button
                          key={t} type="button"
                          disabled={isFull}
                          onClick={() => setFormData({...formData, time: t})}
                          className={`py-3 rounded-xl text-sm font-bold border-2 transition-all relative overflow-hidden ${
                            isFull ? 'bg-zinc-100 border-zinc-200 text-zinc-400 cursor-not-allowed' :
                            formData.time === t ? 'border-amber-500 bg-amber-50 text-amber-700' : 'border-zinc-200 bg-white text-black hover:border-amber-200'
                          }`}
                        >
                          {t}
                          {isFull && <div className="absolute top-0 right-0 bg-red-500 text-[8px] text-white px-1 font-bold">FULL</div>}
                        </button>
                      );
                    })}
                  </div>
                </div>

                <div className="space-y-3">
                  <label className="text-sm font-semibold text-zinc-700">Slot Jam Selesai</label>
                  <div className="grid grid-cols-3 sm:grid-cols-4 gap-3">
                    {Array.from({length: 13}, (_, i) => `${(i + 9).toString().padStart(2, '0')}:00`).map((t) => {
                      let isFull = false;
                      if (cafeData?.full_date && cafeData?.full_start_time && cafeData?.full_end_time) {
                        if (formData.date === cafeData.full_date) {
                          if (cafeData.full_start_time <= cafeData.full_end_time) {
                            isFull = t > cafeData.full_start_time && t <= cafeData.full_end_time;
                          } else {
                            isFull = t > cafeData.full_start_time || t <= cafeData.full_end_time;
                          }
                        }
                      }
                      
                      const startHour = formData.time ? parseInt(formData.time.split(':')[0]) : 0;
                      const currentHour = parseInt(t.split(':')[0]);
                      const isDisabled = isFull || (formData.time && currentHour <= startHour);

                      return (
                        <button
                          key={t} type="button"
                          disabled={isDisabled}
                          onClick={() => setFormData({...formData, endTime: t})}
                          className={`py-3 rounded-xl text-sm font-bold border-2 transition-all relative overflow-hidden ${
                            isDisabled ? 'bg-zinc-100 border-zinc-200 text-zinc-400 cursor-not-allowed' :
                            formData.endTime === t ? 'border-amber-500 bg-amber-50 text-amber-700' : 'border-zinc-200 bg-white text-black hover:border-amber-200'
                          }`}
                        >
                          {t}
                          {isFull && <div className="absolute top-0 right-0 bg-red-500 text-[8px] text-white px-1 font-bold">FULL</div>}
                        </button>
                      );
                    })}
                  </div>
                </div>

                <div className="space-y-3 mt-4">
                  <label className="text-sm font-semibold text-zinc-700">Jumlah Orang</label>
                  <Input type="number" min="1" max="6" value={formData.guests} onChange={(e) => setFormData({...formData, guests: e.target.value})} className="h-12 rounded-xl" />
                </div>
              </div>

              <Button 
                type="submit" 
                disabled={!formData.date || !formData.time}
                className="w-full bg-black disabled:bg-zinc-300 text-white rounded-full h-14 font-bold text-lg"
              >
                {!formData.date || !formData.time ? "Pilih Tanggal & Jam Dulu" : "Lanjut ke Pembayaran"}
              </Button>
            </form>
          </div>
        )}

        {step === 2 && (
          <div className="animate-in fade-in duration-500">
            <h2 className="text-2xl font-bold mb-6">Pilih Metode Pembayaran</h2>
            <Card className="rounded-[2rem] border-none shadow-sm mb-6 bg-white overflow-hidden">
              <div className="p-6 border-b border-zinc-100 bg-zinc-50/50">
                <p className="text-sm text-zinc-500 mb-1">Total Tagihan Booking (DP)</p>
                <div className="text-3xl font-bold">Rp {(parseInt(formData.guests) * 50000).toLocaleString()}</div>
              </div>
            </Card>

            {showDummyPayment ? (
              <div className="bg-white p-8 rounded-[2rem] shadow-sm text-center border border-zinc-100 flex flex-col items-center">
                <h3 className="font-bold text-lg mb-2 text-zinc-800">Scan QRIS (Simulasi)</h3>
                <p className="text-sm text-zinc-500 mb-6">Demo Mode: Tidak memotong saldo asli</p>
                
                {/* Fake QR Code using CSS/SVG */}
                <div className="w-48 h-48 bg-white border-4 border-zinc-100 rounded-xl flex items-center justify-center p-2 mb-6">
                  <div className="w-full h-full border-[12px] border-zinc-800 rounded relative">
                    <div className="absolute top-2 left-2 w-8 h-8 bg-zinc-800"></div>
                    <div className="absolute top-2 right-2 w-8 h-8 bg-zinc-800"></div>
                    <div className="absolute bottom-2 left-2 w-8 h-8 bg-zinc-800"></div>
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-6 h-6 bg-zinc-800 rounded-full"></div>
                    <div className="w-full h-full flex flex-wrap gap-1 p-3">
                      {Array.from({length: 16}).map((_, i) => (
                        <div key={i} className="w-4 h-4 bg-zinc-800 opacity-80" style={{visibility: Math.random() > 0.5 ? 'visible' : 'hidden'}}></div>
                      ))}
                    </div>
                  </div>
                </div>

                <Button 
                  onClick={() => {
                    setIsProcessing(true);
                    setTimeout(() => {
                      setStep(3);
                      setIsProcessing(false);
                    }, 1000);
                  }}
                  disabled={isProcessing} 
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white rounded-full h-14 font-bold text-lg transition-colors"
                >
                  {isProcessing ? "Memproses..." : "Klik Bayar (Simulasi Sukses)"}
                </Button>
              </div>
            ) : (
              <form onSubmit={handleNext} className="space-y-4">
                <Button type="submit" disabled={isProcessing} className="w-full bg-blue-600 hover:bg-blue-700 text-white rounded-full h-14 font-bold text-lg transition-colors">
                  {isProcessing ? "Menghubungi Server..." : `Bayar Rp ${(parseInt(formData.guests) * 50000).toLocaleString()}`}
                </Button>
              </form>
            )}
          </div>
        )}

        {step === 3 && (
          <div className="animate-in zoom-in-95 fade-in duration-500 flex flex-col items-center justify-center py-10">
            <CheckCircle2 className="w-20 h-20 text-green-600 mb-4" />
            <h2 className="text-3xl font-bold mb-2">Reservasi Berhasil!</h2>
            <p className="text-zinc-500 mb-8">Kode Booking Lu: <span className="font-bold text-amber-600">RES-{reservationData?.reservation_id || "OK"}</span></p>
            <Link href="/discover" className="w-full max-w-xs">
              <Button className="w-full bg-black text-white rounded-full h-12">Kembali ke Beranda</Button>
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}