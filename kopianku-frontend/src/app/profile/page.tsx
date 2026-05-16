"use client";

import { useState } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Settings, MapPin, Link as LinkIcon, Calendar, Star, Coffee, FolderHeart, Activity, Gift } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { dummyCafes } from "@/features/cafes/data/dummy";
import { CafeCard } from "@/features/cafes/components/CafeCard";

export default function ProfilePage() {
  const [activeTab, setActiveTab] = useState("showcase");

  return (
    <div className="min-h-screen bg-zinc-50 pb-20">
      
      {/* Profile Header (Cover & Basic Info) */}
      <div className="bg-white border-b border-zinc-200">
        {/* Cover Photo */}
        <div className="h-48 md:h-64 w-full bg-gradient-to-r from-amber-100 via-orange-100 to-purple-100 relative">
          <div className="absolute inset-0 bg-black/5" />
          <Button variant="secondary" size="sm" className="absolute bottom-4 right-4 bg-white/80 backdrop-blur shadow-sm">
            Edit Cover
          </Button>
        </div>

        <div className="container mx-auto max-w-screen-xl px-4 md:px-8 relative pb-8">
          
          {/* Avatar & Actions */}
          <div className="flex justify-between items-end -mt-16 md:-mt-20 mb-4">
            <Avatar className="w-32 h-32 md:w-40 md:h-40 border-4 border-white shadow-lg bg-white">
              <AvatarImage src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=400" />
              <AvatarFallback className="text-4xl bg-zinc-800 text-white">NK</AvatarFallback>
            </Avatar>

            <div className="flex gap-3 mb-2 md:mb-4">
              <Button variant="outline" className="rounded-full font-semibold border-zinc-300">
                Bagikan Profil
              </Button>
              <Button className="rounded-full bg-black hover:bg-zinc-800 text-white">
                <Settings className="w-4 h-4 mr-2" /> Edit Profil
              </Button>
            </div>
          </div>

          {/* Bio & Stats */}
          <div className="max-w-2xl">
            <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2">
              Nadia Kusuma 
              <Badge className="bg-amber-500 hover:bg-amber-600 text-white border-none">WFC Warrior</Badge>
            </h1>
            <p className="text-zinc-500 font-medium mb-3">@nadiaksm • Bergabung sejak 2024</p>
            
            <p className="text-zinc-700 leading-relaxed mb-4">
              Mencari colokan dan Wi-Fi kencang di seluruh penjuru Jakarta. Pecinta kopi susu gula aren sejati. ☕️💻
            </p>

            <div className="flex flex-wrap gap-4 text-sm text-zinc-600 font-medium">
              <span className="flex items-center gap-1"><MapPin className="w-4 h-4" /> Jakarta Selatan</span>
              <span className="flex items-center gap-1"><LinkIcon className="w-4 h-4" /> bento.me/nadia</span>
              <span className="flex items-center gap-1"><Calendar className="w-4 h-4" /> 42 Check-ins</span>
            </div>

            {/* Followers / Following */}
            <div className="flex gap-6 mt-6">
              <div className="flex flex-col">
                <span className="font-bold text-lg text-black">128</span>
                <span className="text-sm text-zinc-500 font-medium">Pengikut</span>
              </div>
              <div className="flex flex-col">
                <span className="font-bold text-lg text-black">245</span>
                <span className="text-sm text-zinc-500 font-medium">Mengikuti</span>
              </div>
              <div className="flex flex-col">
                <span className="font-bold text-lg text-black">15</span>
                <span className="text-sm text-zinc-500 font-medium">Review</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content Tabs */}
      <div className="container mx-auto max-w-screen-xl px-4 md:px-8 mt-8">
        
        {/* Wrapped Promo Banner */}
        <Card className="mb-8 rounded-[2rem] bg-gradient-to-r from-purple-600 to-indigo-600 border-none shadow-md overflow-hidden relative">
          <div className="absolute right-0 top-0 w-64 h-64 bg-white/10 rounded-full blur-3xl transform translate-x-1/2 -translate-y-1/2" />
          <CardContent className="p-8 flex flex-col md:flex-row items-center justify-between gap-6 relative z-10">
            <div>
              <Badge className="bg-white/20 text-white border-none mb-3 hover:bg-white/30 backdrop-blur">EKSKLUSIF</Badge>
              <h2 className="text-2xl font-bold text-white mb-2 flex items-center gap-2">
                <Gift className="w-6 h-6" /> KopianKu Wrapped 2026
              </h2>
              <p className="text-purple-100 max-w-xl">
                Lihat kilas balik perjalanan ngopi lo selama setahun. Total 42 kafe, 150 gelas kopi, dan 1 kafe favorit yang paling sering lo kunjungin!
              </p>
            </div>
            <Button className="bg-white text-purple-700 hover:bg-zinc-100 rounded-full font-bold px-8 h-12 shrink-0 shadow-lg transition-transform hover:scale-105">
              Lihat Wrapped
            </Button>
          </CardContent>
        </Card>

        {/* Custom Tabs List */}
        <div className="flex overflow-x-auto border-b border-zinc-200 mb-8 gap-8">
          <button 
            onClick={() => setActiveTab("showcase")}
            className={`whitespace-nowrap pb-4 font-semibold text-sm border-b-2 transition-colors ${activeTab === "showcase" ? "border-black text-black" : "border-transparent text-zinc-500 hover:text-black"}`}
          >
            Top 4 Kafe
          </button>
          <button 
            onClick={() => setActiveTab("albums")}
            className={`whitespace-nowrap pb-4 font-semibold text-sm border-b-2 transition-colors ${activeTab === "albums" ? "border-black text-black" : "border-transparent text-zinc-500 hover:text-black"}`}
          >
            Album Saya
          </button>
          <button 
            onClick={() => setActiveTab("activity")}
            className={`whitespace-nowrap pb-4 font-semibold text-sm border-b-2 transition-colors ${activeTab === "activity" ? "border-black text-black" : "border-transparent text-zinc-500 hover:text-black"}`}
          >
            Aktivitas & Review
          </button>
        </div>
        
        {/* Top 4 Kafe Showcase */}
        {activeTab === "showcase" && (
          <div className="animate-in fade-in duration-500">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold flex items-center gap-2">
                <Star className="w-5 h-5 text-amber-500" /> Showcase Utama
              </h3>
              <Button variant="ghost" className="text-amber-600 hover:bg-amber-50 rounded-full">
                Edit Pilihan
              </Button>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {dummyCafes.map((cafe) => (
                <CafeCard key={cafe.id} cafe={cafe} />
              ))}
            </div>
          </div>
        )}

        {/* Albums */}
        {activeTab === "albums" && (
          <div className="animate-in fade-in duration-500">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              <Link href="/albums/a1" className="group cursor-pointer block">
                <div className="relative aspect-[4/3] rounded-[2rem] overflow-hidden mb-4 bg-zinc-100 border border-zinc-200">
                  <Image src="https://images.unsplash.com/photo-1554118811-1e0d58224f24?auto=format&fit=crop&q=80&w=400" alt="cover" fill className="object-cover transition-transform duration-500 group-hover:scale-105" />
                  <div className="absolute inset-0 bg-black/20" />
                  <div className="absolute bottom-4 left-4 text-white">
                    <h3 className="font-bold text-lg">WFC Jaksel Andalan</h3>
                    <p className="text-sm opacity-90 flex items-center gap-1"><Coffee className="w-3.5 h-3.5"/> 2 Spot</p>
                  </div>
                </div>
              </Link>

              <div className="group cursor-pointer block flex items-center justify-center border-2 border-dashed border-zinc-200 hover:border-amber-500 rounded-[2rem] aspect-[4/3] bg-zinc-50 transition-colors">
                <div className="text-center text-zinc-500 group-hover:text-amber-600 transition-colors">
                  <FolderHeart className="w-10 h-10 mx-auto mb-2 opacity-50 group-hover:opacity-100" />
                  <span className="font-bold">Buat Album Baru</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Recent Activity */}
        {activeTab === "activity" && (
          <div className="animate-in fade-in duration-500">
            <div className="flex flex-col lg:flex-row gap-8">
              {/* Filter Sidebar (Left) */}
              <div className="w-full lg:w-64 space-y-6">
                <div>
                  <h4 className="font-semibold text-sm mb-3 uppercase tracking-wider text-zinc-500">Filter Histori</h4>
                  <div className="space-y-2">
                    <Button variant="secondary" className="w-full justify-start rounded-xl font-medium bg-zinc-100">Semua Aktivitas</Button>
                    <Button variant="ghost" className="w-full justify-start rounded-xl font-medium text-zinc-500">Hanya Review</Button>
                    <Button variant="ghost" className="w-full justify-start rounded-xl font-medium text-zinc-500">Hanya Check-in</Button>
                  </div>
                </div>
                <div>
                  <h4 className="font-semibold text-sm mb-3 uppercase tracking-wider text-zinc-500">Berdasarkan Tipe Kafe</h4>
                  <div className="space-y-2">
                    <Badge variant="outline" className="w-full justify-start py-2 font-normal cursor-pointer hover:bg-zinc-50">WFC (12)</Badge>
                    <Badge variant="outline" className="w-full justify-start py-2 font-normal cursor-pointer hover:bg-zinc-50">Nongkrong (5)</Badge>
                  </div>
                </div>
              </div>

              {/* Activity Feed (Right) */}
              <div className="flex-1 space-y-6">
                {[
                  { type: "review", cafe: "15th Coffee Kemang", rating: 5, date: "2 hari yang lalu", text: "Spot WFC favorit baru! Wi-Finya stabil banget. Colokan ada di setiap meja deket tembok." },
                  { type: "checkin", cafe: "Titik Temu Senopati", date: "Minggu lalu", text: "Checked in at Titik Temu Senopati with 2 friends." },
                  { type: "album", cafe: "Toko Kopi Tuku", date: "2 minggu lalu", text: "Menambahkan Toko Kopi Tuku ke album 'Kopi Susu Creamy'." }
                ].map((item, idx) => (
                  <Card key={idx} className="rounded-2xl border-none shadow-sm bg-white p-6">
                    <div className="flex items-start gap-4">
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 ${
                        item.type === 'review' ? 'bg-amber-100 text-amber-600' :
                        item.type === 'checkin' ? 'bg-purple-100 text-purple-600' : 'bg-blue-100 text-blue-600'
                      }`}>
                        {item.type === 'review' && <Star className="w-5 h-5 fill-amber-600" />}
                        {item.type === 'checkin' && <MapPin className="w-5 h-5" />}
                        {item.type === 'album' && <FolderHeart className="w-5 h-5" />}
                      </div>
                      
                      <div className="flex-1">
                        <div className="flex justify-between items-start mb-1">
                          <h4 className="font-bold text-base">
                            {item.type === 'review' && `Mereview ${item.cafe}`}
                            {item.type === 'checkin' && `Check-in di ${item.cafe}`}
                            {item.type === 'album' && `Menyimpan ${item.cafe}`}
                          </h4>
                          <span className="text-xs text-zinc-400 font-medium">{item.date}</span>
                        </div>
                        
                        {item.type === 'review' && (
                          <div className="flex items-center gap-1 mb-2">
                            {[...Array(5)].map((_, i) => (
                              <Star key={i} className={`w-3.5 h-3.5 ${i < item.rating! ? 'fill-amber-400 text-amber-400' : 'fill-zinc-200 text-zinc-200'}`} />
                            ))}
                          </div>
                        )}
                        
                        <p className="text-zinc-600 text-sm leading-relaxed">{item.text}</p>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            </div>
          </div>
        )}

      </div>

    </div>
  );
}
