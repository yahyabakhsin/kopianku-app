"use client";

import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { TrendingUp, Users, CalendarDays, Wallet, Brain, Star, ArrowUpRight, Activity, Building, ChevronDown, ListOrdered } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { apiClient } from "@/lib/axios";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export default function BusinessDashboardPage() {
  const [isLoading, setIsLoading] = useState(true);
  const [ownedCafes, setOwnedCafes] = useState<any[]>([]);
  const [selectedCafe, setSelectedCafe] = useState<any>(null);
  const [dashboardData, setDashboardData] = useState<any>(null);
  const router = useRouter();

  useEffect(() => {
    const checkAccessAndFetchCafes = async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token) throw new Error("No token");
        
        const res = await apiClient.get('/users/me', {
          headers: { Authorization: `Bearer ${token}` }
        });
        
        if (res.data.role !== "owner") {
          throw new Error("Not owner");
        }
        
        // Ambil daftar kafe yang dikelola
        const cafesRes = await apiClient.get('/cafes/me/owned', {
          headers: { Authorization: `Bearer ${token}` }
        });
        
        setOwnedCafes(cafesRes.data);
        if (cafesRes.data.length > 0) {
          setSelectedCafe(cafesRes.data[0]);
        } else {
          setIsLoading(false);
        }
      } catch (error) {
        alert("Khusus Owner/Admin ya bang!");
        router.push("/login");
      }
    };
    
    checkAccessAndFetchCafes();
  }, [router]);

  useEffect(() => {
    const fetchDashboard = async () => {
      if (!selectedCafe) return;
      try {
        const token = localStorage.getItem("token");
        const res = await apiClient.get(`/business/dashboard/${selectedCafe.id}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setDashboardData(res.data);
      } catch (error) {
        console.error("Failed to fetch dashboard data");
      } finally {
        setIsLoading(false);
      }
    };
    fetchDashboard();
  }, [selectedCafe]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-zinc-50 flex flex-col items-center justify-center">
        <Activity className="w-12 h-12 text-blue-600 animate-pulse mb-4" />
        <h2 className="text-xl font-bold">Memuat Dashboard...</h2>
        <p className="text-zinc-500">Menyiapkan data bisnis lo.</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-zinc-50 pb-20">
      {/* Top Navbar Khusus Owner */}
      <div className="bg-white border-b border-zinc-200 sticky top-0 z-50">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="bg-black text-white p-1.5 rounded-lg"><TrendingUp className="w-5 h-5" /></div>
            <span className="font-bold text-lg tracking-tight">Kopianku <span className="text-blue-600">Business</span></span>
          </div>
          <Link href="/">
            <Button variant="outline" size="sm" className="rounded-full">Ke Mode User</Button>
          </Link>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8 max-w-6xl">
        
        {ownedCafes.length === 0 ? (
          <div className="bg-white rounded-3xl p-12 text-center shadow-sm">
            <Building className="w-16 h-16 mx-auto text-zinc-300 mb-4" />
            <h2 className="text-2xl font-bold mb-2">Belum Ada Kafe yang Dikelola</h2>
            <p className="text-zinc-500 mb-6">Lo belum mendaftarkan atau diklaim sebagai admin untuk kafe manapun.</p>
            <Button className="rounded-full bg-blue-600 hover:bg-blue-700 text-white">Daftarkan Kafe Baru</Button>
          </div>
        ) : (
          <>
            <div className="mb-8 flex flex-col md:flex-row md:items-end justify-between gap-4">
              <div>
                <h1 className="text-3xl font-bold mb-2 flex items-center gap-3">
                  Dashboard Owner
                  
                  <DropdownMenu>
                    <DropdownMenuTrigger className="inline-flex items-center justify-center whitespace-nowrap text-sm h-10 px-4 py-2 border border-zinc-200 bg-white hover:bg-zinc-100 hover:text-zinc-900 rounded-full font-bold ml-2 outline-none">
                      {selectedCafe?.name} <ChevronDown className="w-4 h-4 ml-2" />
                    </DropdownMenuTrigger>
                    <DropdownMenuContent className="w-56 rounded-2xl p-2">
                      {ownedCafes.map(cafe => (
                        <DropdownMenuItem 
                          key={cafe.id} 
                          onClick={() => setSelectedCafe(cafe)}
                          className="rounded-xl font-medium cursor-pointer py-2"
                        >
                          {cafe.name}
                        </DropdownMenuItem>
                      ))}
                    </DropdownMenuContent>
                  </DropdownMenu>

                </h1>
                <p className="text-zinc-500">Pantau performa <span className="font-bold text-black">{selectedCafe?.name}</span> hari ini.</p>
              </div>
              <div className="flex flex-col items-end gap-3">

                <div className="flex items-center gap-2 bg-zinc-50 p-2 rounded-xl border border-zinc-200 text-sm">
                  <span className="font-semibold text-zinc-500 text-xs uppercase tracking-wider">Atur Jadwal Penuh Spesifik:</span>
                  <input 
                    type="date" 
                    className="bg-white border border-zinc-300 rounded-md px-2 py-1 text-xs outline-none focus:border-amber-500"
                    value={selectedCafe?.full_date || ''}
                    onChange={(e) => {
                      const val = e.target.value;
                      setSelectedCafe({ ...selectedCafe, full_date: val });
                    }}
                  />
                  <input 
                    type="time" 
                    className="bg-white border border-zinc-300 rounded-md px-2 py-1 text-xs outline-none focus:border-amber-500"
                    value={selectedCafe?.full_start_time || ''}
                    onChange={(e) => {
                      const val = e.target.value;
                      setSelectedCafe({ ...selectedCafe, full_start_time: val });
                    }}
                  />
                  <span className="text-zinc-400">-</span>
                  <input 
                    type="time" 
                    className="bg-white border border-zinc-300 rounded-md px-2 py-1 text-xs outline-none focus:border-amber-500"
                    value={selectedCafe?.full_end_time || ''}
                    onChange={(e) => {
                      const val = e.target.value;
                      setSelectedCafe({ ...selectedCafe, full_end_time: val });
                    }}
                  />
                  <Button 
                    size="sm" 
                    className="ml-2 bg-black text-white rounded-md h-7 text-xs"
                    onClick={async () => {
                      try {
                        const token = localStorage.getItem("token");
                        const res = await apiClient.put(`/cafes/${selectedCafe.id}/status`, { 
                          is_full: selectedCafe.is_full || false,
                          full_date: selectedCafe.full_date,
                          full_start_time: selectedCafe.full_start_time,
                          full_end_time: selectedCafe.full_end_time
                        }, {
                          headers: { Authorization: `Bearer ${token}` }
                        });
                        alert("Jadwal penuh spesifik berhasil disimpan!");
                        setOwnedCafes(ownedCafes.map(c => c.id === selectedCafe.id ? { 
                          ...c, 
                          full_date: res.data.full_date,
                          full_start_time: res.data.full_start_time, 
                          full_end_time: res.data.full_end_time 
                        } : c));
                      } catch (e) {
                        alert("Gagal simpan jadwal!");
                      }
                    }}
                  >
                    Simpan
                  </Button>
                </div>
              </div>
            </div>

            {/* 4 Kartu Statistik Cuan */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
              {[
                { title: "Estimasi Pendapatan", value: dashboardData?.stats?.total_revenue || "Rp 0", subtitle: "Berdasarkan kunjungan", icon: Wallet, color: "text-green-600", bg: "bg-green-100" },
                { title: "Status Ulasan", value: dashboardData?.stats?.active_reservations || "0 Ulasan Baru", subtitle: "Review aktif", icon: ListOrdered, color: "text-blue-600", bg: "bg-blue-100" },
                { title: "Live Check-in", value: dashboardData?.stats?.live_checkins || "0 Orang", subtitle: "Total tercatat", icon: Users, color: "text-amber-600", bg: "bg-amber-100" },
                { title: "Avg Rating", value: dashboardData?.stats?.avg_rating || "0.0", subtitle: `Berdasarkan ${selectedCafe?.reviewCount || 0} ulasan`, icon: Star, color: "text-purple-600", bg: "bg-purple-100" },
              ].map((stat, i) => (
                <Card key={i} className="rounded-3xl border-none shadow-sm bg-white">
                  <CardContent className="p-6">
                    <div className="flex items-center gap-4 mb-4">
                      <div className={`p-3 rounded-2xl ${stat.bg}`}>
                        <stat.icon className={`w-6 h-6 ${stat.color}`} />
                      </div>
                      <h3 className="font-semibold text-zinc-500 text-sm">{stat.title}</h3>
                    </div>
                    <div className="text-3xl font-bold mb-1">{stat.value}</div>
                    <div className="text-sm font-medium text-green-600 flex items-center">
                      <ArrowUpRight className="w-4 h-4 mr-1" /> {stat.subtitle}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              
              {/* Kolom Kiri: Analitik Sentimen AI */}
              <div className="lg:col-span-1 space-y-8">
                <Card className="rounded-[2rem] border-none shadow-sm bg-gradient-to-br from-purple-900 to-indigo-900 text-white overflow-hidden relative">
                  <div className="absolute top-0 right-0 p-6 opacity-10">
                    <Brain className="w-32 h-32" />
                  </div>
                  <CardContent className="p-6 relative z-10">
                    <Badge className="bg-white/20 hover:bg-white/20 text-white border-none mb-4 tracking-widest text-xs uppercase">
                      AI Vibe Report
                    </Badge>
                    <h3 className="text-2xl font-bold mb-2">Sentimen Publik</h3>
                    <p className="text-purple-200 text-sm leading-relaxed mb-6">
                      {selectedCafe?.ai_summary || "Mayoritas pelanggan memuji vibe dan kecepatan WiFi di tempat ini! Pertahankan kualitas layanan."}
                    </p>
                    
                    <div className="space-y-4">
                      <div>
                        <div className="flex justify-between text-sm mb-1">
                          <span className="font-medium">Positif</span>
                          <span className="font-bold">85%</span>
                        </div>
                        <div className="w-full h-2 bg-white/20 rounded-full"><div className="w-[85%] h-full bg-green-400 rounded-full"></div></div>
                      </div>
                      <div>
                        <div className="flex justify-between text-sm mb-1">
                          <span className="font-medium">Netral</span>
                          <span className="font-bold">10%</span>
                        </div>
                        <div className="w-full h-2 bg-white/20 rounded-full"><div className="w-[10%] h-full bg-zinc-400 rounded-full"></div></div>
                      </div>
                      <div>
                        <div className="flex justify-between text-sm mb-1">
                          <span className="font-medium">Negatif</span>
                          <span className="font-bold">5%</span>
                        </div>
                        <div className="w-full h-2 bg-white/20 rounded-full"><div className="w-[5%] h-full bg-red-400 rounded-full"></div></div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Kolom Kanan: Antrean Reservasi */}
              <div className="lg:col-span-2">
                <Card className="rounded-[2rem] border-none shadow-sm bg-white h-full">
                  <CardContent className="p-6 md:p-8">
                    <div className="flex items-center justify-between mb-6">
                      <h3 className="text-xl font-bold">Aktivitas Pelanggan Terbaru</h3>
                      <Button variant="outline" className="rounded-full text-xs h-8">Lihat Semua</Button>
                    </div>
                    
                    <div className="overflow-x-auto">
                      <table className="w-full text-left border-collapse">
                        <thead>
                          <tr className="border-b border-zinc-100 text-zinc-500 text-sm">
                            <th className="pb-4 font-medium">Customer</th>
                            <th className="pb-4 font-medium">Waktu</th>
                            <th className="pb-4 font-medium">Tipe Aktivitas</th>
                            <th className="pb-4 font-medium">Status / Rating</th>
                          </tr>
                        </thead>
                        <tbody className="text-sm">
                          {dashboardData?.recent_activities?.length > 0 ? (
                            dashboardData.recent_activities.map((item: any, i: number) => (
                              <tr key={i} className="border-b border-zinc-50 last:border-0 hover:bg-zinc-50 transition-colors">
                                <td className="py-4 font-bold text-black">{item.customer}</td>
                                <td className="py-4 text-zinc-600">{item.time}</td>
                                <td className="py-4 text-zinc-600 uppercase text-xs font-bold tracking-wider">{item.type}</td>
                                <td className="py-4">
                                  <Badge className={`${item.color} border-none shadow-none font-bold text-xs`}>{item.status}</Badge>
                                </td>
                              </tr>
                            ))
                          ) : (
                            <tr>
                              <td colSpan={4} className="py-8 text-center text-zinc-500">
                                Belum ada aktivitas terbaru untuk kafe ini.
                              </td>
                            </tr>
                          )}
                        </tbody>
                      </table>
                    </div>
                  </CardContent>
                </Card>
              </div>

            </div>
          </>
        )}
      </div>
    </div>
  );
}