'use client';

import { useEffect, useState } from "react";
import Link from "next/link";
import { useSearchParams, useRouter } from "next/navigation";
import { ArrowRight, Coffee, Star, MapPin, Sparkles, Heart, MessageSquare, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { CafeCard } from "@/features/cafes/components/CafeCard";
import { apiClient } from "@/lib/axios";
import { Cafe } from "@/features/cafes/types";

export default function HomePage() {
  const router = useRouter();
  const [cafes, setCafes] = useState<Cafe[]>([]);
  const [feedPosts, setFeedPosts] = useState<any[]>([]);
  const [userProfile, setUserProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [isLogged, setIsLogged] = useState(false);
  
  // Surprise Me States
  const [isSurprising, setIsSurprising] = useState(false);
  const [surprisedCafe, setSurprisedCafe] = useState<any>(null);

  // Fetch data dari FastAPI
  useEffect(() => {
    const fetchData = async () => {
      try {
        const token = localStorage.getItem("token");
        setIsLogged(!!token);
        
        // 1. Fetch Cafes
        let cafesRes;
        if (token) {
          cafesRes = await apiClient.get('/cafes', { headers: { Authorization: `Bearer ${token}` } });
          
          // 2. Fetch User Profile
          const userRes = await apiClient.get('/users/me', { headers: { Authorization: `Bearer ${token}` } });
          setUserProfile(userRes.data);
          
          // 3. Fetch Feed
          const feedRes = await apiClient.get('/feed');
          setFeedPosts(feedRes.data);
        } else {
          cafesRes = await apiClient.get('/cafes');
        }
        
        setCafes(cafesRes.data);
      } catch (error) {
        console.error("Gagal ambil data backend:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  if (isLogged) {
    // ==========================================
    // LOGGED-IN STATE (AUTHENTICATED HOME)
    // ==========================================
    return (
      <div className="min-h-screen bg-zinc-50 pt-8 pb-20">
        <div className="container mx-auto max-w-screen-xl px-4 md:px-8">
          
          {/* Welcome Header */}
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8">
            <div>
              <h1 className="text-3xl font-bold tracking-tight mb-2">
                Halo, <span className="text-amber-600">{userProfile?.username || 'User'}!</span> 👋
              </h1>
              <p className="text-zinc-500 font-medium text-lg">Siap cari tempat ngopi yang pas buat hari ini?</p>
            </div>
            <Link href="/discover">
              <Button className="rounded-full bg-black hover:bg-zinc-800 text-white font-semibold px-6 shadow-md shadow-black/10">
                <MapPin className="w-4 h-4 mr-2" /> Cari Spot Terdekat
              </Button>
            </Link>
          </div>

          <div className="flex flex-col lg:flex-row gap-8">
            
            {/* Left Column: AI Recommendations & Feed */}
            <div className="flex-1 space-y-8">
              
              {/* AI Recommendation Section */}
              <section>
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-xl font-bold flex items-center gap-2">
                    <Sparkles className="w-5 h-5 text-purple-500" /> Rekomendasi AI Buat Lo
                  </h2>
                  <Badge variant="secondary" className="bg-purple-100 text-purple-700 hover:bg-purple-100 border-none">
                    Berdasarkan: {userProfile?.persona || "Coffee Explorer"}
                  </Badge>
                </div>
                
                {/* Menampilkan loading text atau data cafe asli */}
                {loading ? (
                  <p className="text-zinc-500 text-sm py-4">Memuat rekomendasi dari server...</p>
                ) : (
                  <div className="flex overflow-x-auto lg:grid lg:grid-cols-2 gap-4 pb-4 snap-x">
                    {/* Mengambil 2 cafe pertama dari backend untuk rekomendasi */}
                    {cafes.slice(0, 2).map((cafe) => (
                      <div key={cafe.id} className="min-w-[280px] lg:min-w-0 snap-start">
                        <CafeCard cafe={cafe} />
                      </div>
                    ))}
                  </div>
                )}
              </section>

              {/* Friends Feed */}
              <section>
                <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
                  <Coffee className="w-5 h-5 text-amber-600" /> Aktivitas Teman Lo
                </h2>
                
                <div className="space-y-4">
                  {feedPosts.map((post) => (
                    <Card key={post.id} className="rounded-2xl border-none shadow-sm bg-white overflow-hidden">
                      <CardContent className="p-5">
                        <div className="flex items-center justify-between mb-3">
                          <div className="flex items-center gap-3">
                            <Avatar className="w-10 h-10 border border-zinc-200">
                              <AvatarFallback className="bg-zinc-800 text-white font-bold">{post.user.avatar}</AvatarFallback>
                            </Avatar>
                            <div>
                              <div className="flex items-center gap-2">
                                <h3 className="font-bold text-sm">{post.user.name}</h3>
                                <span className="text-xs text-zinc-400">• {post.time}</span>
                              </div>
                              <p className="text-xs font-medium text-amber-600">{post.user.persona}</p>
                            </div>
                          </div>
                        </div>

                        {post.cafe && (
                          <div className="flex items-center gap-2 text-sm mb-3">
                            <span className="text-zinc-500">Check-in di</span>
                            <Link href={`/cafe/${post.cafe.id}`}>
                              <Badge variant="secondary" className="bg-purple-50 text-purple-700 hover:bg-purple-100 font-bold flex items-center gap-1 cursor-pointer">
                                <MapPin className="w-3 h-3" /> {post.cafe.name}
                              </Badge>
                            </Link>
                          </div>
                        )}

                        {post.album && (
                          <div className="flex items-center gap-2 text-sm mb-3">
                            <span className="text-zinc-500">Membagikan album</span>
                            <Link href={`/albums/${post.album.id}`}>
                              <Badge variant="secondary" className="bg-amber-50 text-amber-700 hover:bg-amber-100 font-bold flex items-center gap-1 cursor-pointer">
                                📚 {post.album.title}
                              </Badge>
                            </Link>
                          </div>
                        )}

                        <p className="text-zinc-700 leading-relaxed text-sm mb-4">
                          {post.content}
                        </p>

                        <div className="flex items-center gap-6 border-t border-zinc-50 pt-3">
                          <button className="flex items-center gap-2 text-zinc-500 hover:text-red-500 transition-colors">
                            <Heart className="w-4 h-4" />
                            <span className="text-xs font-medium">{post.likes} Suka</span>
                          </button>
                          <button className="flex items-center gap-2 text-zinc-500 hover:text-blue-500 transition-colors">
                            <MessageSquare className="w-4 h-4" />
                            <span className="text-xs font-medium">{post.comments} Balas</span>
                          </button>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </section>

            </div>

            {/* Right Column: Trending & Friend Activity */}
            <div className="w-full lg:w-80 space-y-6">
              
              {/* Spotify-like Friend Activity Sidebar */}
              <Card className="rounded-2xl border-none shadow-sm bg-white overflow-hidden">
                <CardContent className="p-5">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="font-bold flex items-center gap-2">
                      <Users className="w-4 h-4" /> Aktivitas Teman
                    </h3>
                    <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
                  </div>
                  
                  <div className="space-y-5">
                    {loading ? (
                      <p className="text-xs text-zinc-500">Memuat aktivitas...</p>
                    ) : feedPosts.filter(post => post.userHasFollowed || (userProfile && post.user.id !== userProfile.id)).slice(0, 5).length > 0 ? (
                      feedPosts
                        .filter(post => post.userHasFollowed || (userProfile && post.user.id !== userProfile.id))
                        .slice(0, 5)
                        .map((post, i) => {
                          // Tentukan action text berdasarkan tipe post
                          let actionText = "Membagikan postingan";
                          let targetName = "";
                          
                          if (post.type === "review") {
                            actionText = "Baru review";
                            targetName = post.cafe?.name || "";
                          } else if (post.type === "checkin") {
                            actionText = "Lagi nongkrong di";
                            targetName = post.cafe?.name || "";
                          } else if (post.album) {
                            actionText = "Membagikan album";
                            targetName = post.album.title;
                          }

                          return (
                            <Link href={post.cafe ? `/cafe/${post.cafe.id}` : (post.album ? `/albums/${post.album.id}` : `/profile/${post.user.id}`)} key={i} className="flex gap-3 group cursor-pointer">
                              <Avatar className="w-8 h-8 border border-zinc-200">
                                <AvatarFallback className="bg-zinc-100 text-zinc-600 font-bold text-xs">{post.user.avatar}</AvatarFallback>
                              </Avatar>
                              <div className="flex-1">
                                <p className="font-bold text-sm text-black group-hover:underline">{post.user.name}</p>
                                <p className="text-xs text-zinc-500 line-clamp-1">
                                  {actionText} {targetName && <span className="font-medium text-black group-hover:text-amber-600 transition-colors">{targetName}</span>}
                                </p>
                                <p className="text-[10px] text-zinc-400 mt-0.5">{post.time}</p>
                              </div>
                            </Link>
                          );
                        })
                    ) : (
                      <p className="text-xs text-zinc-500">Belum ada aktivitas teman.</p>
                    )}
                  </div>
                  
                  <Link href="/social" className="block w-full mt-4">
                    <Button variant="ghost" className="w-full text-xs font-semibold text-zinc-500 hover:text-black">
                      Lihat Semua Teman
                    </Button>
                  </Link>
                </CardContent>
              </Card>

              <div 
                className="block cursor-pointer"
                onClick={async () => {
                  try {
                    setIsSurprising(true);
                    const token = localStorage.getItem("token");
                    const headers = token ? { Authorization: `Bearer ${token}` } : {};
                    const res = await apiClient.get('/cafes/surprise-me', { headers });
                    
                    if (res.data && res.data.id) {
                      setSurprisedCafe(res.data);
                      // Tunggu 3 detik biar animasinya kerasa
                      setTimeout(() => {
                        setIsSurprising(false);
                        router.push(`/cafe/${res.data.id}`);
                      }, 3000);
                    } else {
                      setIsSurprising(false);
                      alert("Gagal dapetin rekomendasi kafe!");
                    }
                  } catch (e) {
                    setIsSurprising(false);
                    alert("Gagal dapetin rekomendasi kafe!");
                  }
                }}
              >
                <div className="bg-gradient-to-r from-amber-500 to-orange-400 rounded-2xl p-6 text-white shadow-lg shadow-amber-500/20 hover:scale-[1.02] transition-transform">
                  <h3 className="font-bold text-xl mb-1">Mager milih?</h3>
                  <p className="text-amber-100 text-sm mb-4">Pencet buat dapetin 1 rekomendasi kafe AI terdekat.</p>
                  <Button variant="secondary" className="w-full rounded-full bg-white text-amber-600 font-bold">
                    Surprise Me! ✨
                  </Button>
                </div>
              </div>

              <Card className="rounded-2xl border-none shadow-sm bg-white">
                <CardContent className="p-5">
                  <h3 className="font-bold mb-4">Trending Dekat Lo</h3>
                  <div className="space-y-4">
                    {loading ? (
                       <p className="text-xs text-zinc-500">Memuat data...</p>
                    ) : (
                      // Mengurutkan cafe berdasarkan rating dan review count
                      [...cafes].sort((a, b) => b.reviewCount - a.reviewCount).slice(0, 5).map((cafe, i) => {
                        return (
                          <Link href={`/cafe/${cafe.id}`} key={cafe.id}>
                            <div className="flex justify-between items-center group cursor-pointer mb-4">
                              <div>
                                <p className="font-bold text-sm group-hover:text-amber-600 transition-colors truncate max-w-[150px]">{cafe.name}</p>
                                <p className="text-xs text-zinc-500 truncate max-w-[150px]">{cafe.location}</p>
                              </div>
                              <Badge variant="outline" className={`text-xs border-none bg-amber-50 text-amber-700`}>
                                {cafe.reviewCount} Reviews
                              </Badge>
                            </div>
                          </Link>
                        )
                      })
                    )}
                  </div>
                </CardContent>
              </Card>

            </div>
          </div>
        </div>

        {/* Surprise Me Modal Animation */}
        {isSurprising && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm animate-in fade-in duration-300">
            <div className="bg-white rounded-[2rem] p-8 max-w-sm w-full mx-4 text-center shadow-2xl relative overflow-hidden">
              {/* Background Decoration */}
              <div className="absolute -top-24 -right-24 w-48 h-48 bg-amber-100 rounded-full blur-3xl opacity-50 animate-pulse"></div>
              <div className="absolute -bottom-24 -left-24 w-48 h-48 bg-purple-100 rounded-full blur-3xl opacity-50 animate-pulse delay-150"></div>
              
              <div className="relative z-10 flex flex-col items-center">
                {surprisedCafe ? (
                  <>
                    <div className="w-24 h-24 mb-6 relative animate-in zoom-in duration-500">
                      <div className="absolute inset-0 bg-green-100 rounded-full flex items-center justify-center">
                        <Sparkles className="w-12 h-12 text-green-500" />
                      </div>
                    </div>
                    <h3 className="text-2xl font-bold mb-2">Ketemu Nih!</h3>
                    <p className="text-zinc-500 mb-6 text-sm">
                      Menganalisis preferensi lo... dan ini dia yang paling cocok:
                    </p>
                    <div className="bg-zinc-50 p-4 rounded-2xl w-full border border-zinc-100 mb-4 animate-in slide-in-from-bottom-4 duration-500">
                      <h4 className="font-bold text-lg">{surprisedCafe.name}</h4>
                      <p className="text-xs text-zinc-500 flex items-center justify-center gap-1 mt-1">
                        <Star className="w-3 h-3 text-amber-500 fill-amber-500" /> {surprisedCafe.rating}
                      </p>
                    </div>
                    <p className="text-xs text-zinc-400 animate-pulse">Otw ke tekape...</p>
                  </>
                ) : (
                  <>
                    <div className="w-24 h-24 mb-6 relative">
                      <div className="absolute inset-0 border-4 border-amber-100 rounded-full animate-ping"></div>
                      <div className="absolute inset-2 bg-amber-100 rounded-full flex items-center justify-center animate-pulse">
                        <Coffee className="w-10 h-10 text-amber-600 animate-bounce" />
                      </div>
                    </div>
                    <h3 className="text-2xl font-bold mb-2">Bentar Bang...</h3>
                    <p className="text-zinc-500 text-sm">
                      Kopianku AI lagi cari spot nongkrong yang paling pas sama selera lo...
                    </p>
                  </>
                )}
              </div>
            </div>
          </div>
        )}

      </div>
    );
  }

  // ==========================================
  // LOGGED-OUT STATE (LANDING PAGE)
  // ==========================================
  return (
    <div className="flex flex-col items-center">
      
      {/* Hero Section */}
      <section className="w-full relative bg-zinc-50 py-20 lg:py-32 overflow-hidden flex justify-center">
        {/* Blob Aesthetics */}
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-amber-100/50 rounded-full blur-3xl -z-10 translate-x-1/3 -translate-y-1/3"></div>
        <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-purple-100/50 rounded-full blur-3xl -z-10 -translate-x-1/3 translate-y-1/3"></div>

        <div className="container px-4 md:px-6 max-w-screen-xl text-center flex flex-col items-center">
          <Badge className="bg-white text-black border-zinc-200 shadow-sm mb-6 font-medium px-4 py-1.5 hover:bg-zinc-50 transition-colors">
            🎉 Aplikasi Pencari Kafe No. 1 buat Gen-Z
          </Badge>
          <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight mb-6 max-w-4xl leading-tight">
            Cari Tempat Ngopi yang <span className="text-amber-600 relative inline-block">
              Sesuai Vibe Lo
              <div className="absolute -bottom-2 left-0 w-full h-3 bg-amber-200/50 -z-10 rounded-full"></div>
            </span>
          </h1>
          <p className="text-lg md:text-xl text-zinc-500 max-w-2xl mb-10 leading-relaxed font-medium">
            Berhenti scrolling map berjam-jam. KopianKu pakai AI buat nyocokin selera kopi, kebutuhan fasilitas, dan estetika tempat yang lo mau.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 w-full justify-center max-w-md mb-8">
            <Link href="/login" className="w-full sm:w-auto">
              <Button className="w-full h-14 px-8 text-base font-bold bg-black hover:bg-zinc-800 text-white rounded-full shadow-[0_8px_30px_rgb(0,0,0,0.12)] transition-transform active:scale-95">
                Cari Kafe Sekarang <ArrowRight className="ml-2 w-5 h-5" />
              </Button>
            </Link>
          </div>
          
          {/* Social Proof Stats */}
          <div className="flex items-center gap-8 text-zinc-500 font-medium">
             <div className="flex flex-col items-center"><span className="text-2xl font-bold text-black">10K+</span><span>Pengguna</span></div>
             <div className="w-px h-8 bg-zinc-300"></div>
             <div className="flex flex-col items-center"><span className="text-2xl font-bold text-black">5K+</span><span>Review Kafe</span></div>
             <div className="w-px h-8 bg-zinc-300"></div>
             <div className="flex flex-col items-center"><span className="text-2xl font-bold text-black">100+</span><span>Spot Terkurasi</span></div>
          </div>
        </div>
      </section>

      {/* Explore by Category Section */}
      <section className="w-full py-20 bg-white border-t border-zinc-100">
        <div className="container mx-auto px-4 max-w-screen-xl">
          <div className="flex items-end justify-between mb-10">
            <div>
              <h2 className="text-3xl md:text-4xl font-bold tracking-tight mb-2">Explore by Category</h2>
              <p className="text-zinc-500 font-medium">Temukan kafe sesuai kebutuhan spesifik lo.</p>
            </div>
            <Link href="/discover" className="hidden md:flex text-amber-600 font-bold items-center hover:underline">
              Lihat Semua <ArrowRight className="w-4 h-4 ml-1" />
            </Link>
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            {[
              { name: "WFC Friendly", icon: <Coffee className="w-6 h-6 mb-3 text-blue-500" />, color: "bg-blue-50 border-blue-100" },
              { name: "Cozy & Quiet", icon: <Sparkles className="w-6 h-6 mb-3 text-purple-500" />, color: "bg-purple-50 border-purple-100" },
              { name: "Hidden Gem", icon: <MapPin className="w-6 h-6 mb-3 text-green-500" />, color: "bg-green-50 border-green-100" },
              { name: "Meeting Room", icon: <Users className="w-6 h-6 mb-3 text-orange-500" />, color: "bg-orange-50 border-orange-100" },
              { name: "Nongkrong Malam", icon: <Star className="w-6 h-6 mb-3 text-indigo-500" />, color: "bg-indigo-50 border-indigo-100" }
            ].map((cat, i) => (
              <Link href={`/discover?category=${encodeURIComponent(cat.name)}`} key={i}>
                <div className={`p-6 rounded-[1.5rem] border ${cat.color} hover:shadow-md transition-all flex flex-col items-center justify-center text-center cursor-pointer group h-full`}>
                  <div className="group-hover:scale-110 transition-transform">{cat.icon}</div>
                  <span className="font-bold text-sm text-zinc-800">{cat.name}</span>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Cafe Populer Minggu Ini Section */}
      <section className="w-full py-20 bg-zinc-50 border-t border-zinc-100">
        <div className="container mx-auto px-4 max-w-screen-xl">
          <div className="flex items-end justify-between mb-10">
            <div>
              <h2 className="text-3xl md:text-4xl font-bold tracking-tight mb-2">Kafe Populer Minggu Ini</h2>
              <p className="text-zinc-500 font-medium">Spot yang lagi rame diomongin sama anak-anak KopianKu.</p>
            </div>
            <Link href="/discover" className="hidden md:flex text-amber-600 font-bold items-center hover:underline">
              Lihat Lebih Banyak <ArrowRight className="w-4 h-4 ml-1" />
            </Link>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {loading ? (
              <p className="text-zinc-500 col-span-full">Memuat kafe populer...</p>
            ) : (
              [...cafes].sort((a, b) => b.reviewCount - a.reviewCount).slice(0, 4).map((cafe) => (
                <CafeCard key={cafe.id} cafe={cafe} />
              ))
            )}
          </div>
        </div>
      </section>

      {/* Bento Grid Features Section */}
      <section className="w-full py-20 bg-white">
        <div className="container mx-auto px-4 max-w-screen-xl">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold tracking-tight mb-4">Preview AI Feature</h2>
            <p className="text-zinc-500 font-medium">Bukan sekadar directory kafe biasa, KopianKu ditenagai AI buat personalisasi maksimal.</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 auto-rows-[280px]">
            {/* Feature 1 */}
            <div className="md:col-span-2 bg-gradient-to-br from-amber-50 to-orange-50 rounded-[2rem] p-8 flex flex-col justify-between border border-amber-100/50 hover:shadow-lg transition-shadow">
              <div className="bg-amber-100 w-12 h-12 rounded-2xl flex items-center justify-center mb-6">
                <Sparkles className="w-6 h-6 text-amber-600" />
              </div>
              <div>
                <h3 className="text-2xl font-bold mb-2">Twin Match AI</h3>
                <p className="text-zinc-600 font-medium">Sistem kita bakal ngitung skor kecocokan kafe dengan persona lo. WFC? Nongkrong? Semua ada itungannya.</p>
              </div>
            </div>

            {/* Feature 2 */}
            <div className="bg-gradient-to-br from-purple-50 to-indigo-50 rounded-[2rem] p-8 flex flex-col justify-between border border-purple-100/50 hover:shadow-lg transition-shadow">
              <div className="bg-purple-100 w-12 h-12 rounded-2xl flex items-center justify-center mb-6">
                <Coffee className="w-6 h-6 text-purple-600" />
              </div>
              <div>
                <h3 className="text-2xl font-bold mb-2">AI Summary</h3>
                <p className="text-zinc-600 font-medium">Rangkuman review otomatis, gak perlu baca komen satu-satu.</p>
              </div>
            </div>

            {/* Feature 3 */}
            <div className="bg-gradient-to-br from-zinc-50 to-zinc-100 rounded-[2rem] p-8 flex flex-col justify-between border border-zinc-200/50 hover:shadow-lg transition-shadow">
              <div className="bg-white w-12 h-12 rounded-2xl flex items-center justify-center mb-6 shadow-sm">
                <Star className="w-6 h-6 text-zinc-800" />
              </div>
              <div>
                <h3 className="text-2xl font-bold mb-2">Social Proof</h3>
                <p className="text-zinc-600 font-medium">Liat kafe mana yang lagi hits di-check-in sama temen-temen lo.</p>
              </div>
            </div>

            {/* Feature 4 */}
            <div className="md:col-span-2 bg-gradient-to-br from-blue-50 to-cyan-50 rounded-[2rem] p-8 flex flex-col justify-between border border-blue-100/50 hover:shadow-lg transition-shadow">
              <div className="bg-blue-100 w-12 h-12 rounded-2xl flex items-center justify-center mb-6">
                <MapPin className="w-6 h-6 text-blue-600" />
              </div>
              <div>
                <h3 className="text-2xl font-bold mb-2">Filter Spesifik</h3>
                <p className="text-zinc-600 font-medium">Cari spesifik: "Banyak colokan", "AC Dingin", atau "Smoking Area Kipas Angin". Semua bisa di-filter.</p>
              </div>
            </div>
          </div>
        </div>
      </section>

    </div>
  );
}