"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import { 
  Users, Star, TrendingUp, MessageSquare, Sparkles, Coffee, 
  MapPin, Settings, ArrowUpRight, ArrowRight, LayoutDashboard, 
  DoorOpen, CalendarDays, Plus, CheckCircle2, XCircle, AlertTriangle
} from "lucide-react";
import Image from "next/image";

export default function BusinessDashboard() {
  const [activeTab, setActiveTab] = useState<"insight" | "rooms" | "reservations">("insight");

  return (
    <div className="min-h-screen bg-zinc-50/50 pb-20">
      
      {/* Top Banner / Nav */}
      <div className="bg-black text-white py-12 px-4 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-amber-500/20 rounded-full blur-[100px] -z-10"></div>
        <div className="container mx-auto max-w-screen-xl relative z-10 flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-6">
            <div className="w-24 h-24 rounded-2xl overflow-hidden border-4 border-zinc-800 relative">
              <Image 
                src="https://images.unsplash.com/photo-1554118811-1e0d58224f24?auto=format&fit=crop&q=80&w=300"
                alt="Cafe Profile"
                fill
                className="object-cover"
              />
            </div>
            <div>
              <div className="flex items-center gap-3 mb-1">
                <h1 className="text-3xl font-bold">15th Coffee Kemang</h1>
                <Badge className="bg-amber-500 text-white hover:bg-amber-600 border-none shadow-none">PARTNER</Badge>
              </div>
              <p className="text-zinc-400 flex items-center gap-1">
                <MapPin className="w-4 h-4" /> Kemang, Jakarta Selatan
              </p>
            </div>
          </div>
          
          <Button variant="outline" className="text-black border-none rounded-full px-6 font-semibold bg-white hover:bg-zinc-100 h-12">
            <Settings className="w-4 h-4 mr-2" /> Pengaturan Bisnis
          </Button>
        </div>
      </div>

      <div className="container mx-auto max-w-screen-xl px-4 mt-8 z-20 relative space-y-6">
        
        {/* Tab Navigation */}
        <div className="flex overflow-x-auto border-b border-zinc-200 mb-8 gap-8">
          <button 
            onClick={() => setActiveTab("insight")}
            className={`whitespace-nowrap pb-4 font-semibold text-sm border-b-2 flex items-center gap-2 transition-colors ${activeTab === "insight" ? "border-black text-black" : "border-transparent text-zinc-500 hover:text-black"}`}
          >
            <LayoutDashboard className="w-4 h-4" /> Insight UMKM
          </button>
          <button 
            onClick={() => setActiveTab("rooms")}
            className={`whitespace-nowrap pb-4 font-semibold text-sm border-b-2 flex items-center gap-2 transition-colors ${activeTab === "rooms" ? "border-black text-black" : "border-transparent text-zinc-500 hover:text-black"}`}
          >
            <DoorOpen className="w-4 h-4" /> Kelola Meeting Room
          </button>
          <button 
            onClick={() => setActiveTab("reservations")}
            className={`whitespace-nowrap pb-4 font-semibold text-sm border-b-2 flex items-center gap-2 transition-colors ${activeTab === "reservations" ? "border-black text-black" : "border-transparent text-zinc-500 hover:text-black"}`}
          >
            <CalendarDays className="w-4 h-4" /> Data Reservasi
            <Badge className="ml-1 bg-red-500 text-white border-none rounded-full px-1.5 min-w-5 h-5 flex items-center justify-center">2</Badge>
          </button>
        </div>

        {/* ========================================= */}
        {/* TAB 1: INSIGHT UMKM */}
        {/* ========================================= */}
        {activeTab === "insight" && (
          <div className="space-y-6 animate-in fade-in duration-500">
            {/* Key Metrics */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <Card className="rounded-2xl border-none shadow-sm">
                <CardContent className="p-6">
                  <div className="flex justify-between items-start mb-4">
                    <div className="bg-blue-50 p-3 rounded-xl">
                      <Users className="w-6 h-6 text-blue-500" />
                    </div>
                    <Badge variant="secondary" className="bg-green-50 text-green-700 hover:bg-green-50">
                      <ArrowUpRight className="w-3 h-3 mr-1" /> 12%
                    </Badge>
                  </div>
                  <h3 className="text-3xl font-bold mb-1">2,405</h3>
                  <p className="text-sm text-zinc-500 font-medium">Total Profil Dilihat</p>
                </CardContent>
              </Card>

              <Card className="rounded-2xl border-none shadow-sm">
                <CardContent className="p-6">
                  <div className="flex justify-between items-start mb-4">
                    <div className="bg-amber-50 p-3 rounded-xl">
                      <Star className="w-6 h-6 text-amber-500" />
                    </div>
                    <Badge variant="secondary" className="bg-green-50 text-green-700 hover:bg-green-50">
                      <ArrowUpRight className="w-3 h-3 mr-1" /> 0.2
                    </Badge>
                  </div>
                  <h3 className="text-3xl font-bold mb-1">4.8 <span className="text-lg text-zinc-400 font-normal">/ 5.0</span></h3>
                  <p className="text-sm text-zinc-500 font-medium">Rating Rata-rata</p>
                </CardContent>
              </Card>

              <Card className="rounded-2xl border-none shadow-sm">
                <CardContent className="p-6">
                  <div className="flex justify-between items-start mb-4">
                    <div className="bg-purple-50 p-3 rounded-xl">
                      <Sparkles className="w-6 h-6 text-purple-500" />
                    </div>
                    <Badge variant="secondary" className="bg-zinc-100 text-zinc-700 hover:bg-zinc-100">
                      Stabil
                    </Badge>
                  </div>
                  <h3 className="text-3xl font-bold mb-1">89%</h3>
                  <p className="text-sm text-zinc-500 font-medium">Tingkat Match AI</p>
                </CardContent>
              </Card>

              <Card className="rounded-2xl border-none shadow-sm">
                <CardContent className="p-6">
                  <div className="flex justify-between items-start mb-4">
                    <div className="bg-orange-50 p-3 rounded-xl">
                      <Coffee className="w-6 h-6 text-orange-500" />
                    </div>
                    <Badge variant="secondary" className="bg-green-50 text-green-700 hover:bg-green-50">
                      <ArrowUpRight className="w-3 h-3 mr-1" /> 8%
                    </Badge>
                  </div>
                  <h3 className="text-3xl font-bold mb-1">1,240</h3>
                  <p className="text-sm text-zinc-500 font-medium">Check-In Bulan Ini</p>
                </CardContent>
              </Card>
            </div>

            {/* Middle Section: AI Insight & Chart */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* AI Insight Panel */}
              <Card className="lg:col-span-1 rounded-[2rem] border-purple-100 bg-purple-50/50 shadow-sm overflow-hidden flex flex-col">
                <div className="bg-gradient-to-br from-purple-500 to-indigo-600 p-6 text-white">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="font-bold text-lg flex items-center gap-2">
                      <Sparkles className="w-5 h-5 text-purple-200" /> AI Customer Insight
                    </h3>
                  </div>
                  <p className="text-purple-100 text-sm leading-relaxed">
                    KopianKu AI menganalisis 1,240 ulasan terbaru dari pelanggan lo minggu ini.
                  </p>
                </div>
                
                <CardContent className="p-6 space-y-6 flex-1 bg-white">
                  <div>
                    <h4 className="text-sm font-bold text-green-600 mb-2 uppercase tracking-wider">Paling Disukai</h4>
                    <ul className="space-y-2 text-sm text-zinc-700">
                      <li className="flex items-start gap-2">
                        <div className="w-1.5 h-1.5 rounded-full bg-green-500 mt-1.5 shrink-0" />
                        <strong>Wi-Fi Konsisten Cepat.</strong> Disebut dalam 45% ulasan WFC.
                      </li>
                      <li className="flex items-start gap-2">
                        <div className="w-1.5 h-1.5 rounded-full bg-green-500 mt-1.5 shrink-0" />
                        <strong>Kopi Susu Gula Aren.</strong> Mendapat rating rasa tertinggi (4.9/5).
                      </li>
                    </ul>
                  </div>
                  <hr className="border-zinc-100" />
                  <div>
                    <h4 className="text-sm font-bold text-red-500 mb-2 uppercase tracking-wider">Perlu Ditingkatkan</h4>
                    <ul className="space-y-2 text-sm text-zinc-700">
                      <li className="flex items-start gap-2">
                        <div className="w-1.5 h-1.5 rounded-full bg-red-500 mt-1.5 shrink-0" />
                        <strong>Colokan Kurang.</strong> Pelanggan area outdoor sering berebut colokan pas sore hari.
                      </li>
                    </ul>
                  </div>
                </CardContent>
              </Card>

              {/* Chart Area */}
              <Card className="lg:col-span-2 rounded-2xl border-none shadow-sm flex flex-col">
                <CardHeader>
                  <CardTitle className="text-xl">Tren Pengunjung (WFC vs Hangout)</CardTitle>
                </CardHeader>
                <CardContent className="flex-1 flex flex-col justify-end min-h-[300px] relative pb-4">
                  <div className="absolute inset-0 flex flex-col justify-between py-10 px-6 opacity-10 pointer-events-none">
                    <hr className="border-black" /><hr className="border-black" /><hr className="border-black" /><hr className="border-black" />
                  </div>
                  <div className="flex justify-between items-end h-64 gap-2 md:gap-6 relative z-10 px-2 md:px-6">
                    {[
                      { hari: 'Sen', h1: 30, h2: 20 },
                      { hari: 'Sel', h1: 45, h2: 15 },
                      { hari: 'Rab', h1: 35, h2: 25 },
                      { hari: 'Kam', h1: 50, h2: 18 },
                      { hari: 'Jum', h1: 60, h2: 40 },
                      { hari: 'Sab', h1: 40, h2: 50 },
                      { hari: 'Min', h1: 35, h2: 45 }
                    ].map(({ hari, h1, h2 }) => {
                      return (
                        <div key={hari} className="flex flex-col items-center flex-1 gap-2">
                          <div className="w-full flex justify-center items-end gap-1 h-full">
                            <div className="w-full max-w-[20px] bg-amber-400 rounded-t-sm" style={{ height: `${h1}%` }}></div>
                            <div className="w-full max-w-[20px] bg-purple-500 rounded-t-sm" style={{ height: `${h2}%` }}></div>
                          </div>
                          <span className="text-xs text-zinc-400 font-medium">{hari}</span>
                        </div>
                      );
                    })}
                  </div>
                  <div className="flex items-center justify-center gap-6 mt-8">
                    <div className="flex items-center gap-2 text-sm font-medium text-zinc-600"><div className="w-3 h-3 rounded-full bg-amber-400"></div> Persona WFC</div>
                    <div className="flex items-center gap-2 text-sm font-medium text-zinc-600"><div className="w-3 h-3 rounded-full bg-purple-500"></div> Persona Nongkrong</div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        )}

        {/* ========================================= */}
        {/* TAB 2: KELOLA MEETING ROOM */}
        {/* ========================================= */}
        {activeTab === "rooms" && (
          <div className="space-y-6 animate-in fade-in duration-500">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold">Daftar Ruangan</h2>
                <p className="text-sm text-zinc-500">Kelola fasilitas, harga, dan ketersediaan room lu.</p>
              </div>
              <Button className="bg-black hover:bg-zinc-800 text-white rounded-full">
                <Plus className="w-4 h-4 mr-2" /> Tambah Ruangan
              </Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {/* Room 1 */}
              <Card className="rounded-[2rem] border-zinc-200 overflow-hidden group">
                <div className="h-40 bg-zinc-200 relative">
                  <Image src="https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&q=80&w=400" alt="Room A" fill className="object-cover" />
                  <div className="absolute top-4 right-4 bg-green-500 text-white text-xs font-bold px-2 py-1 rounded-md flex items-center gap-1 shadow-md">
                    <CheckCircle2 className="w-3 h-3" /> AVAILABLE
                  </div>
                </div>
                <CardContent className="p-6">
                  <div className="flex justify-between items-start mb-2">
                    <h3 className="font-bold text-xl">Meeting Room A</h3>
                  </div>
                  <div className="text-2xl font-bold mb-4 text-black">Rp 150.000<span className="text-sm text-zinc-500 font-normal"> / Jam</span></div>
                  
                  <div className="space-y-2 mb-6">
                    <div className="flex justify-between text-sm">
                      <span className="text-zinc-500">Kapasitas</span>
                      <span className="font-semibold">Max 6 Orang</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-zinc-500">Fasilitas</span>
                      <span className="font-semibold">TV, AC, Whiteboard</span>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <Button variant="outline" className="w-full rounded-xl border-zinc-200 font-semibold">Edit Detail</Button>
                    <Button variant="outline" className="w-full rounded-xl border-amber-500 text-amber-600 hover:bg-amber-50 font-semibold">Tandai Penuh</Button>
                  </div>
                </CardContent>
              </Card>

              {/* Room 2 */}
              <Card className="rounded-[2rem] border-zinc-200 overflow-hidden group opacity-80">
                <div className="h-40 bg-zinc-200 relative grayscale">
                  <Image src="https://images.unsplash.com/photo-1572025442646-866d16c84a54?auto=format&fit=crop&q=80&w=400" alt="Room B" fill className="object-cover" />
                  <div className="absolute top-4 right-4 bg-amber-500 text-white text-xs font-bold px-2 py-1 rounded-md flex items-center gap-1 shadow-md">
                    <AlertTriangle className="w-3 h-3" /> MAINTENANCE
                  </div>
                </div>
                <CardContent className="p-6">
                  <div className="flex justify-between items-start mb-2">
                    <h3 className="font-bold text-xl">Meeting Room B (VIP)</h3>
                  </div>
                  <div className="text-2xl font-bold mb-4 text-black">Rp 250.000<span className="text-sm text-zinc-500 font-normal"> / Jam</span></div>
                  
                  <div className="space-y-2 mb-6">
                    <div className="flex justify-between text-sm">
                      <span className="text-zinc-500">Kapasitas</span>
                      <span className="font-semibold">Max 12 Orang</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-zinc-500">Fasilitas</span>
                      <span className="font-semibold">Projector, VIP Sofa</span>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <Button variant="outline" className="w-full rounded-xl border-zinc-200 font-semibold">Edit Detail</Button>
                    <Button variant="outline" className="w-full rounded-xl border-green-500 text-green-600 hover:bg-green-50 font-semibold">Buka Ruangan</Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        )}

        {/* ========================================= */}
        {/* TAB 3: DATA RESERVASI */}
        {/* ========================================= */}
        {activeTab === "reservations" && (
          <div className="space-y-6 animate-in fade-in duration-500">
            
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h2 className="text-2xl font-bold">Jadwal Reservasi</h2>
                <p className="text-sm text-zinc-500">Kelola bookingan dari KopianKu atau masukin pesanan offline.</p>
              </div>
              <div className="flex gap-2">
                <Button variant="outline" className="rounded-full bg-white font-semibold">Filter Jadwal</Button>
                <Button className="bg-black hover:bg-zinc-800 text-white rounded-full">
                  <Plus className="w-4 h-4 mr-2" /> Input Offline
                </Button>
              </div>
            </div>

            <Card className="border-none shadow-sm rounded-2xl overflow-hidden bg-white">
              <div className="overflow-x-auto">
                <table className="w-full text-sm text-left">
                  <thead className="bg-zinc-50 text-zinc-500 uppercase text-xs font-bold border-b border-zinc-100">
                    <tr>
                      <th className="px-6 py-4">Kode / Waktu</th>
                      <th className="px-6 py-4">Ruangan</th>
                      <th className="px-6 py-4">Pemesan</th>
                      <th className="px-6 py-4">Status / Bayar</th>
                      <th className="px-6 py-4 text-right">Aksi</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-zinc-100">
                    
                    {/* Res 1 */}
                    <tr className="hover:bg-zinc-50/50 transition-colors">
                      <td className="px-6 py-4">
                        <div className="font-bold text-black">KP-8921-XZ</div>
                        <div className="text-amber-600 font-semibold mt-1">Hari ini, 14:00 (1 Jam)</div>
                      </td>
                      <td className="px-6 py-4 font-semibold">Meeting Room A</td>
                      <td className="px-6 py-4">
                        <div className="font-bold">Nadia Kusuma</div>
                        <div className="text-zinc-500 text-xs">2 Orang • 0812345678</div>
                      </td>
                      <td className="px-6 py-4">
                        <Badge className="bg-green-100 text-green-700 hover:bg-green-100 border-none mb-1">CONFIRMED</Badge>
                        <div className="text-xs text-zinc-500">DP Rp 75.000 via QRIS</div>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <Button variant="outline" size="sm" className="rounded-lg font-semibold">Check-in Tamu</Button>
                      </td>
                    </tr>

                    {/* Res 2 */}
                    <tr className="hover:bg-zinc-50/50 transition-colors">
                      <td className="px-6 py-4">
                        <div className="font-bold text-black">OFF-1002</div>
                        <div className="text-zinc-600 font-semibold mt-1">Besok, 10:00 (3 Jam)</div>
                      </td>
                      <td className="px-6 py-4 font-semibold">Meeting Room B (VIP)</td>
                      <td className="px-6 py-4">
                        <div className="font-bold">PT. Maju Mundur</div>
                        <div className="text-zinc-500 text-xs">10 Orang (Offline Input)</div>
                      </td>
                      <td className="px-6 py-4">
                        <Badge className="bg-blue-100 text-blue-700 hover:bg-blue-100 border-none mb-1">MANUAL BLOCK</Badge>
                        <div className="text-xs text-zinc-500">Lunas via Transfer</div>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <Button variant="ghost" size="sm" className="text-red-500 hover:bg-red-50 rounded-lg font-semibold">Batal</Button>
                      </td>
                    </tr>

                  </tbody>
                </table>
              </div>
            </Card>

          </div>
        )}

      </div>
    </div>
  );
}
