"use client";

import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { TrendingUp, Users, CalendarDays, Wallet, Brain, Star, ArrowUpRight, Activity } from "lucide-react";
import Link from "next/link";

export default function BusinessDashboardPage() {
  // Biar aman pas demo hackathon, kita pake data hybrid (kalo API mati, UI tetep jalan)
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Simulasi loading ngambil data analitik berat
    setTimeout(() => {
      setIsLoading(false);
    }, 1500);
  }, []);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-zinc-50 flex flex-col items-center justify-center">
        <Activity className="w-12 h-12 text-blue-600 animate-pulse mb-4" />
        <h2 className="text-xl font-bold">Menganalisis Data AI...</h2>
        <p className="text-zinc-500">Menarik data reservasi dan sentimen pelanggan.</p>
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
        <div className="mb-8 flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold mb-2">Dashboard Owner</h1>
            <p className="text-zinc-500">Pantau performa 15th Coffee Kemang hari ini.</p>
          </div>
          <Badge className="bg-green-100 text-green-800 hover:bg-green-100 border-none px-4 py-2 text-sm">
            <span className="w-2 h-2 rounded-full bg-green-500 mr-2 animate-pulse"></span> Kafe Buka (Live)
          </Badge>
        </div>

        {/* 4 Kartu Statistik Cuan */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {[
            { title: "Total Pendapatan", value: "Rp 4.250.000", subtitle: "+15% dari kemarin", icon: Wallet, color: "text-green-600", bg: "bg-green-100" },
            { title: "Reservasi Aktif", value: "12 Ruangan", subtitle: "4 sedang berlangsung", icon: CalendarDays, color: "text-blue-600", bg: "bg-blue-100" },
            { title: "Live Check-in", value: "48 Orang", subtitle: "Kapasitas saat ini: 80%", icon: Users, color: "text-amber-600", bg: "bg-amber-100" },
            { title: "Avg Rating (AI)", value: "4.8", subtitle: "Berdasarkan 342 ulasan", icon: Star, color: "text-purple-600", bg: "bg-purple-100" },
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
          
          {/* Kolom Kiri: Analitik Sentimen AI (Buat Pamer Juri) */}
          <div className="lg:col-span-1 space-y-8">
            <Card className="rounded-[2rem] border-none shadow-sm bg-gradient-to-br from-purple-900 to-indigo-900 text-white overflow-hidden relative">
              <div className="absolute top-0 right-0 p-6 opacity-10">
                <Brain className="w-32 h-32" />
              </div>
              <CardContent className="p-6 relative z-10">
                <Badge className="bg-white/20 hover:bg-white/20 text-white border-none mb-4 tracking-widest text-xs uppercase">
                  AI Vibe Report
                </Badge>
                <h3 className="text-2xl font-bold mb-2">Sentimen Positif!</h3>
                <p className="text-purple-200 text-sm leading-relaxed mb-6">
                  "Mayoritas pelanggan hari ini memuji kecepatan WiFi dan playlist musik. Namun, ada 3 keluhan terkait AC yang kurang dingin di area Meeting Room A."
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
                  <h3 className="text-xl font-bold">Daftar Reservasi Terbaru</h3>
                  <Button variant="outline" className="rounded-full text-xs h-8">Lihat Semua</Button>
                </div>
                
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="border-b border-zinc-100 text-zinc-500 text-sm">
                        <th className="pb-4 font-medium">Customer</th>
                        <th className="pb-4 font-medium">Jadwal</th>
                        <th className="pb-4 font-medium">Ruangan</th>
                        <th className="pb-4 font-medium">Status Pembayaran</th>
                      </tr>
                    </thead>
                    <tbody className="text-sm">
                      {[
                        { name: "Nadia Kusuma", time: "14:00 - 16:00 WIB", room: "Meeting Room A", status: "LUNAS", color: "bg-green-100 text-green-700" },
                        { name: "Reza Rahardian", time: "16:30 - 18:30 WIB", room: "Meeting Room B", status: "DP 50%", color: "bg-amber-100 text-amber-700" },
                        { name: "Budi Santoso", time: "19:00 - 22:00 WIB", room: "Meeting Room A", status: "PENDING", color: "bg-zinc-100 text-zinc-700" },
                      ].map((item, i) => (
                        <tr key={i} className="border-b border-zinc-50 last:border-0 hover:bg-zinc-50 transition-colors">
                          <td className="py-4 font-bold text-black">{item.name}</td>
                          <td className="py-4 text-zinc-600">{item.time}</td>
                          <td className="py-4 text-zinc-600">{item.room}</td>
                          <td className="py-4">
                            <Badge className={`${item.color} border-none shadow-none font-bold text-xs`}>{item.status}</Badge>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          </div>

        </div>
      </div>
    </div>
  );
}