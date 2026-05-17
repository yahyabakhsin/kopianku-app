"use client";

import { useState, useEffect } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Settings, MapPin, Link as LinkIcon, Calendar, Star, Coffee, FolderHeart, Activity, Gift, Heart, Users, TrendingUp } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { CafeCard } from "@/features/cafes/components/CafeCard";
import { apiClient } from "@/lib/axios";

export default function ProfilePage() {
  const [activeTab, setActiveTab] = useState("showcase");
  const [userProfile, setUserProfile] = useState<any>(null);
  const [activities, setActivities] = useState<any[]>([]);
  const [topCafes, setTopCafes] = useState<any[]>([]);
  const [albums, setAlbums] = useState<any[]>([]);
  const [reservations, setReservations] = useState<any[]>([]);
  const [wishlist, setWishlist] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [activityFilter, setActivityFilter] = useState("all");
  const [showFollowModal, setShowFollowModal] = useState(false);
  const [followModalType, setFollowModalType] = useState<"Pengikut" | "Mengikuti">("Pengikut");
  const [followsData, setFollowsData] = useState<{followers: any[], following: any[]}>({followers: [], following: []});
  const [showAlbumModal, setShowAlbumModal] = useState(false);
  const [newAlbumTitle, setNewAlbumTitle] = useState("");
  const [newAlbumDesc, setNewAlbumDesc] = useState("");
  
  const [showEditProfile, setShowEditProfile] = useState(false);
  const [editForm, setEditForm] = useState({ username: "", persona: "", avatar_url: "", bio: "" });
  const [avatarFile, setAvatarFile] = useState<File | null>(null);

  useEffect(() => {
    const fetchProfileData = async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token) return;

        const headers = { Authorization: `Bearer ${token}` };
        
        const [profileRes, actRes, topRes, albumRes, resvRes, wishlistRes, followsRes] = await Promise.all([
          apiClient.get('/users/me', { headers }),
          apiClient.get('/users/me/activities', { headers }),
          apiClient.get('/users/me/top-cafes', { headers }),
          apiClient.get('/albums', { headers }),
          apiClient.get('/users/me/reservations', { headers }),
          apiClient.get('/users/me/wishlist', { headers }),
          apiClient.get('/users/me/follows', { headers })
        ]);

        setUserProfile(profileRes.data);
        setActivities(actRes.data);
        setTopCafes(topRes.data);
        setAlbums(albumRes.data);
        setReservations(resvRes.data);
        setWishlist(wishlistRes.data);
        setFollowsData(followsRes.data);
      } catch (error) {
        console.error("Gagal load profile", error);
      } finally {
        setLoading(false);
      }
    };
    fetchProfileData();
  }, []);

  const handleCreateAlbum = async () => {
    if (!newAlbumTitle.trim()) return alert("Nama album nggak boleh kosong bang!");
    
    try {
      const token = localStorage.getItem("token");
      await apiClient.post('/albums', {
        title: newAlbumTitle,
        description: newAlbumDesc,
        is_public: true
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      setShowAlbumModal(false);
      setNewAlbumTitle("");
      setNewAlbumDesc("");
      
      // Refresh albums
      const res = await apiClient.get('/albums', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setAlbums(res.data);
    } catch (error) {
      console.error("Gagal bikin album", error);
    }
  };

  const handleEditProfile = async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) return;
      
      let finalAvatarUrl = editForm.avatar_url;
      
      if (avatarFile) {
        const formData = new FormData();
        formData.append("file", avatarFile);
        
        const uploadRes = await apiClient.post('/auth/upload-avatar', formData, {
          headers: { 
            Authorization: `Bearer ${token}`,
            'Content-Type': 'multipart/form-data'
          }
        });
        finalAvatarUrl = uploadRes.data.url_gambar;
      }
      
      const payload = {
        username: editForm.username,
        persona_badge: editForm.persona,
        avatar_url: finalAvatarUrl,
        bio: editForm.bio
      };

      const res = await apiClient.put('/users/me', payload, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      // Update local state
      setUserProfile((prev: any) => ({
        ...prev,
        username: res.data.user.username,
        persona: payload.persona_badge,
        bio: payload.bio,
        avatar_url: res.data.user.avatar_url
      }));
      
      setShowEditProfile(false);
      
      // Trigger navbar update
      window.dispatchEvent(new Event('user-login'));
      
    } catch (error) {
      console.error("Gagal edit profile", error);
      alert("Gagal edit profil bang!");
    }
  };

  if (loading) return <div className="p-10 text-center">Loading profile...</div>;
  if (!userProfile) return <div className="p-10 text-center">Lo belum login bang!</div>;

  return (
    <div className="min-h-screen bg-zinc-50 pb-20">
      
      {/* Profile Header (Cover & Basic Info) */}
      <div className="bg-white border-b border-zinc-200">
        {/* Cover Photo */}
        <div className={`h-48 md:h-64 w-full relative ${userProfile.role === 'owner' ? 'bg-gradient-to-r from-zinc-900 to-black' : 'bg-gradient-to-r from-amber-100 via-orange-100 to-purple-100'}`}>
          <div className="absolute inset-0 bg-black/5" />
          {userProfile.role === 'owner' && (
            <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-20"></div>
          )}
          <Button variant="secondary" size="sm" className="absolute bottom-4 right-4 bg-white/80 backdrop-blur shadow-sm hover:bg-white text-black font-semibold">
            Edit Cover
          </Button>
        </div>

        <div className="container mx-auto max-w-screen-xl px-4 md:px-8 relative pb-8">
          
          {/* Avatar & Actions */}
          <div className="flex justify-between items-end -mt-16 md:-mt-20 mb-4">
            <Avatar className="w-32 h-32 md:w-40 md:h-40 border-4 border-white shadow-lg bg-white">
              {userProfile.avatar_url && <AvatarImage src={userProfile.avatar_url} />}
              <AvatarFallback className="text-4xl bg-zinc-800 text-white">{userProfile.username?.[0]?.toUpperCase()}</AvatarFallback>
            </Avatar>

            <div className="flex flex-wrap gap-3 mb-2 md:mb-4">
              {userProfile.role === "owner" && (
                <Link href="/business">
                  <Button className="rounded-full font-semibold bg-blue-600 hover:bg-blue-700 text-white shadow-md transition-transform hover:scale-105">
                    <TrendingUp className="w-4 h-4 mr-2" /> Business Dashboard
                  </Button>
                </Link>
              )}
              <Button variant="outline" className="rounded-full font-semibold border-zinc-300">
                Bagikan Profil
              </Button>
              <Button 
                onClick={() => {
                  setEditForm({ username: userProfile.username, persona: userProfile.persona || "", avatar_url: userProfile.avatar_url || "", bio: userProfile.bio || "" });
                  setAvatarFile(null);
                  setShowEditProfile(true);
                }}
                className="rounded-full bg-black hover:bg-zinc-800 text-white"
              >
                <Settings className="w-4 h-4 mr-2" /> Edit Profil
              </Button>
              <Button 
                variant="destructive" 
                className="rounded-full font-semibold bg-red-500 hover:bg-red-600 text-white"
                onClick={() => {
                  localStorage.removeItem("token");
                  window.dispatchEvent(new Event('user-logout'));
                  window.location.href = "/";
                }}
              >
                Logout
              </Button>
            </div>
          </div>

          {/* Bio & Stats */}
          <div className="max-w-2xl">
            <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2">
              {userProfile.username} 
              <Badge className="bg-amber-500 hover:bg-amber-600 text-white border-none">{userProfile.persona || 'Newbie'}</Badge>
              {userProfile.role === "owner" && (
                <Badge className="bg-blue-100 text-blue-700 hover:bg-blue-200 border-none ml-1">Kopianku Owner</Badge>
              )}
            </h1>
            <p className="text-zinc-500 font-medium mb-3">{userProfile.email} • Bergabung sejak 2024</p>
            
            {userProfile.bio && (
              <p className="text-zinc-800 leading-relaxed mb-3 text-sm italic border-l-2 border-amber-500 pl-3">
                "{userProfile.bio}"
              </p>
            )}
            
            <p className="text-zinc-700 leading-relaxed mb-4">
              {userProfile.preferences?.join(", ") || "Belum ada preferensi. Coba isi onboarding lagi."}
            </p>

            <div className="flex flex-wrap gap-4 text-sm text-zinc-600 font-medium">
              <span className="flex items-center gap-1"><MapPin className="w-4 h-4" /> Indonesia</span>
              <span className="flex items-center gap-1"><Calendar className="w-4 h-4" /> {userProfile.stats?.checkins_count || 0} Check-ins</span>
            </div>

            {/* Followers / Following */}
            <div className="flex gap-6 mt-6">
              <div className="flex flex-col cursor-pointer group" onClick={() => { setFollowModalType("Pengikut"); setShowFollowModal(true); }}>
                <span className="font-bold text-lg text-black group-hover:text-amber-600 transition-colors">{userProfile.stats?.followers || 0}</span>
                <span className="text-sm text-zinc-500 font-medium">Pengikut</span>
              </div>
              <div className="flex flex-col cursor-pointer group" onClick={() => { setFollowModalType("Mengikuti"); setShowFollowModal(true); }}>
                <span className="font-bold text-lg text-black group-hover:text-amber-600 transition-colors">{userProfile.stats?.following || 0}</span>
                <span className="text-sm text-zinc-500 font-medium">Mengikuti</span>
              </div>
              <div className="flex flex-col cursor-pointer group" onClick={() => { setActiveTab("activity"); setActivityFilter("review"); setTimeout(() => window.scrollTo({top: 500, behavior: "smooth"}), 100); }}>
                <span className="font-bold text-lg text-black group-hover:text-amber-600 transition-colors">{userProfile.stats?.reviews_count || 0}</span>
                <span className="text-sm text-zinc-500 font-medium">Review</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content Tabs */}
      <div className="container mx-auto max-w-screen-xl px-4 md:px-8 mt-8">
        
        {/* Wrapped Promo Banner */}
        {userProfile.role !== "owner" && (
          <Card className="mb-8 rounded-[2rem] bg-gradient-to-r from-purple-600 to-indigo-600 border-none shadow-md overflow-hidden relative">
            <div className="absolute right-0 top-0 w-64 h-64 bg-white/10 rounded-full blur-3xl transform translate-x-1/2 -translate-y-1/2" />
            <CardContent className="p-8 flex flex-col md:flex-row items-center justify-between gap-6 relative z-10">
              <div>
                <Badge className="bg-white/20 text-white border-none mb-3 hover:bg-white/30 backdrop-blur">EKSKLUSIF</Badge>
                <h2 className="text-2xl font-bold text-white mb-2 flex items-center gap-2">
                  <Gift className="w-6 h-6" /> KopianKu Wrapped 2026
                </h2>
                <p className="text-purple-100 max-w-xl">
                  Cek rangkuman nongkrong lo di tahun ini! Ada 42 kafe yang udah lo kunjungin, dan 1 kafe yang jadi tempat langganan lo.
                </p>
              </div>
              <Link href="/wrapped">
                <Button className="bg-white text-purple-700 hover:bg-zinc-100 rounded-full font-bold px-8 h-12 shrink-0 shadow-lg transition-transform hover:scale-105">
                  Lihat Wrapped
                </Button>
              </Link>
            </CardContent>
          </Card>
        )}

        {/* Custom Tabs List */}
        <div className="flex overflow-x-auto border-b border-zinc-200 mb-8 gap-8 hide-scrollbar">
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
            onClick={() => setActiveTab("wishlist")}
            className={`whitespace-nowrap pb-4 font-semibold text-sm border-b-2 transition-colors ${activeTab === "wishlist" ? "border-black text-black" : "border-transparent text-zinc-500 hover:text-black"}`}
          >
            Wishlist
          </button>
          <button 
            onClick={() => setActiveTab("activity")}
            className={`whitespace-nowrap pb-4 font-semibold text-sm border-b-2 transition-colors ${activeTab === "activity" ? "border-black text-black" : "border-transparent text-zinc-500 hover:text-black"}`}
          >
            Aktivitas & Review
          </button>
          <button 
            onClick={() => setActiveTab("reservations")}
            className={`whitespace-nowrap pb-4 font-semibold text-sm border-b-2 transition-colors ${activeTab === "reservations" ? "border-black text-black" : "border-transparent text-zinc-500 hover:text-black"}`}
          >
            Reservasi Room
          </button>
        </div>
        
        {/* Top 4 Kafe Showcase */}
        {activeTab === "showcase" && (
          <div className="animate-in fade-in duration-500">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold flex items-center gap-2">
                <Star className="w-5 h-5 text-amber-500" /> Showcase Utama
              </h3>
              <div 
                className="text-xs bg-amber-50 text-amber-600 px-4 py-2 rounded-full border border-amber-200 font-medium"
                title="Kafe di-generate otomatis berdasarkan review bintang tinggi yang lo kasih."
              >
                Otomatis dari Favoritmu
              </div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {topCafes.map((cafe) => (
                <CafeCard key={cafe.id} cafe={cafe} />
              ))}
            </div>
          </div>
        )}

        {/* Albums */}
        {activeTab === "albums" && (
          <div className="animate-in fade-in duration-500">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {albums.map((album) => (
                <Link href={`/albums/${album.id}`} key={album.id} className="group cursor-pointer block">
                  <div className="relative aspect-[4/3] rounded-[2rem] overflow-hidden mb-4 bg-zinc-100 border border-zinc-200">
                    <Image src="https://images.unsplash.com/photo-1554118811-1e0d58224f24?auto=format&fit=crop&q=80&w=400" alt="cover" fill className="object-cover transition-transform duration-500 group-hover:scale-105" />
                    <div className="absolute inset-0 bg-black/20" />
                    <div className="absolute bottom-4 left-4 text-white">
                      <h3 className="font-bold text-lg">{album.title}</h3>
                      <p className="text-sm opacity-90 flex items-center gap-1"><Coffee className="w-3.5 h-3.5"/> {album.cafe_count} Spot</p>
                    </div>
                  </div>
                </Link>
              ))}

              <div onClick={() => setShowAlbumModal(true)} className="group cursor-pointer block flex items-center justify-center border-2 border-dashed border-zinc-200 hover:border-amber-500 rounded-[2rem] aspect-[4/3] bg-zinc-50 transition-colors">
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
                    <Button variant={activityFilter === "all" ? "secondary" : "ghost"} onClick={() => setActivityFilter("all")} className={`w-full justify-start rounded-xl font-medium ${activityFilter === "all" ? "bg-zinc-100" : "text-zinc-500"}`}>Semua Aktivitas</Button>
                    <Button variant={activityFilter === "review" ? "secondary" : "ghost"} onClick={() => setActivityFilter("review")} className={`w-full justify-start rounded-xl font-medium ${activityFilter === "review" ? "bg-zinc-100" : "text-zinc-500"}`}>Hanya Review</Button>
                    <Button variant={activityFilter === "checkin" ? "secondary" : "ghost"} onClick={() => setActivityFilter("checkin")} className={`w-full justify-start rounded-xl font-medium ${activityFilter === "checkin" ? "bg-zinc-100" : "text-zinc-500"}`}>Hanya Check-in</Button>
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
                {activities.filter(a => activityFilter === "all" || a.type === activityFilter).length === 0 && <p className="text-zinc-500">Belum ada aktivitas yang sesuai.</p>}
                {activities.filter(a => activityFilter === "all" || a.type === activityFilter).map((item, idx) => (
                  <Card key={idx} className="rounded-2xl border-none shadow-sm bg-white p-6">
                    <div className="flex items-start gap-4">
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 ${
                        item.type === 'review' ? 'bg-amber-100 text-amber-600' : 'bg-purple-100 text-purple-600'
                      }`}>
                        {item.type === 'review' ? <Star className="w-5 h-5 fill-amber-600" /> : <MapPin className="w-5 h-5" />}
                      </div>
                      
                      <div className="flex-1">
                        <div className="flex justify-between items-start mb-1">
                          <h4 className="font-bold text-base">
                            <Link href={`/cafe/${item.cafe_id}`} className="hover:underline hover:text-amber-600">
                              {item.type === 'review' ? `Mereview ${item.cafe_name}` : `Check-in di ${item.cafe_name}`}
                            </Link>
                          </h4>
                          <span className="text-xs text-zinc-400 font-medium">{item.date_str}</span>
                        </div>
                        
                        {item.type === 'review' && (
                          <div className="flex items-center gap-1 mb-2">
                            {[...Array(5)].map((_, i) => (
                              <Star key={i} className={`w-3.5 h-3.5 ${i < item.rating ? 'fill-amber-400 text-amber-400' : 'fill-zinc-200 text-zinc-200'}`} />
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

        {/* Wishlist */}
        {activeTab === "wishlist" && (
          <div className="animate-in fade-in duration-500">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold flex items-center gap-2">
                <Heart className="w-5 h-5 text-red-500" /> Wishlist Lo
              </h3>
            </div>
            {wishlist.length === 0 ? (
               <p className="text-zinc-500">Belum ada kafe yang lo simpan. Pencet tombol love di detail kafe!</p>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {wishlist.map((cafe) => (
                  <CafeCard key={cafe.id} cafe={cafe} />
                ))}
              </div>
            )}
          </div>
        )}

        {/* Reservations */}
        {activeTab === "reservations" && (
          <div className="animate-in fade-in duration-500">
            <h3 className="text-xl font-bold mb-6 flex items-center gap-2">
              <Calendar className="w-5 h-5 text-blue-600" /> Riwayat Booking Meeting Room
            </h3>
            {reservations.length === 0 ? (
               <p className="text-zinc-500">Lo belum pernah booking meeting room.</p>
            ) : (
              <div className="space-y-4 max-w-4xl">
                {reservations.map((res: any) => (
                  <Card key={res.id} className="rounded-2xl border-none shadow-sm overflow-hidden flex flex-col md:flex-row">
                    <div className="w-full md:w-48 h-32 md:h-auto bg-zinc-100 relative shrink-0">
                      <Image 
                        src={res.cafe_image || "https://images.unsplash.com/photo-1554118811-1e0d58224f24?auto=format&fit=crop&q=80"} 
                        alt="cafe" fill className="object-cover"
                      />
                    </div>
                    <CardContent className="p-6 flex-1 flex flex-col justify-center">
                      <div className="flex justify-between items-start mb-2">
                        <div>
                          <Badge variant="outline" className={`mb-2 border-none ${res.status === 'pending' ? 'bg-amber-100 text-amber-700' : 'bg-green-100 text-green-700'}`}>
                            {res.status.toUpperCase()}
                          </Badge>
                          <h4 className="font-bold text-lg">{res.cafe_name}</h4>
                        </div>
                        <div className="text-right">
                           <span className="text-sm font-bold block">{res.booking_date}</span>
                           <span className="text-sm text-zinc-500">{res.start_time.slice(0,5)} - {res.end_time.slice(0,5)}</span>
                        </div>
                      </div>
                      <p className="text-zinc-500 text-sm mt-2 flex items-center gap-2">
                         <Users className="w-4 h-4"/> Untuk {res.guest_count} orang
                      </p>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </div>
        )}

      </div>

      {/* Follower Modal */}
      {showFollowModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4" onClick={() => setShowFollowModal(false)}>
          <div className="bg-white rounded-[2rem] p-6 w-full max-w-sm shadow-xl" onClick={e => e.stopPropagation()}>
            <h3 className="font-bold text-xl mb-6">{followModalType}</h3>
            <div className="space-y-4 max-h-64 overflow-y-auto">
              {(followModalType === "Pengikut" ? followsData.followers : followsData.following).length === 0 ? (
                <p className="text-zinc-500 text-sm text-center">Belum ada {followModalType.toLowerCase()}</p>
              ) : (
                (followModalType === "Pengikut" ? followsData.followers : followsData.following).map((u: any) => (
                  <Link href={`/profile/${u.id}`} key={u.id} className="flex items-center gap-3 hover:bg-zinc-50 p-2 rounded-xl transition-colors cursor-pointer group" onClick={() => setShowFollowModal(false)}>
                    <Avatar className="w-10 h-10">
                      {u.avatar_url ? <AvatarImage src={u.avatar_url} /> : <AvatarFallback className="bg-amber-100 text-amber-700 font-bold">{u.username?.[0]?.toUpperCase()}</AvatarFallback>}
                    </Avatar>
                    <div className="flex-1">
                      <p className="font-bold text-sm group-hover:text-amber-600 transition-colors">{u.username}</p>
                      <p className="text-xs text-zinc-500">{u.persona}</p>
                    </div>
                  </Link>
                ))
              )}
            </div>
            <Button variant="ghost" className="w-full mt-6 text-zinc-500 hover:text-black rounded-full" onClick={() => setShowFollowModal(false)}>Tutup</Button>
          </div>
        </div>
      )}

      {/* Create Album Modal */}
      {showAlbumModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4" onClick={() => setShowAlbumModal(false)}>
          <div className="bg-white rounded-[2rem] p-6 w-full max-w-sm shadow-xl" onClick={e => e.stopPropagation()}>
            <h3 className="font-bold text-xl mb-4">Buat Album Baru</h3>
            <div className="space-y-4">
              <div>
                <label className="text-sm font-bold mb-1 block">Nama Album</label>
                <input type="text" className="w-full border border-zinc-200 rounded-xl px-4 py-2" placeholder="Contoh: WFC Jaksel" value={newAlbumTitle} onChange={e => setNewAlbumTitle(e.target.value)} />
              </div>
              <div>
                <label className="text-sm font-bold mb-1 block">Deskripsi (Opsional)</label>
                <textarea className="w-full border border-zinc-200 rounded-xl px-4 py-2 resize-none" rows={3} placeholder="Tempat enak buat kerja..." value={newAlbumDesc} onChange={e => setNewAlbumDesc(e.target.value)} />
              </div>
            </div>
            <div className="flex gap-3 mt-6">
              <Button variant="outline" className="flex-1 rounded-full font-semibold" onClick={() => setShowAlbumModal(false)}>Batal</Button>
              <Button className="flex-1 rounded-full font-semibold bg-black text-white hover:bg-zinc-800" onClick={handleCreateAlbum}>Simpan</Button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Profile Modal */}
      {showEditProfile && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4" onClick={() => setShowEditProfile(false)}>
          <div className="bg-white rounded-[2rem] p-6 w-full max-w-sm shadow-xl" onClick={e => e.stopPropagation()}>
            <h3 className="font-bold text-xl mb-4">Edit Profil</h3>
            <div className="space-y-4">
              <div>
                <label className="text-sm font-bold mb-1 block">Username</label>
                <input 
                  type="text" 
                  className="w-full border border-zinc-200 rounded-xl px-4 py-2" 
                  value={editForm.username} 
                  onChange={e => setEditForm(prev => ({ ...prev, username: e.target.value }))} 
                />
              </div>
              <div>
                <label className="text-sm font-bold mb-1 block">Persona/Bio Singkat</label>
                <input 
                  type="text" 
                  className="w-full border border-zinc-200 rounded-xl px-4 py-2" 
                  placeholder="Misal: Si Paling Kopi" 
                  value={editForm.persona} 
                  onChange={e => setEditForm(prev => ({ ...prev, persona: e.target.value }))} 
                />
              </div>
              <div>
                <label className="text-sm font-bold mb-1 block">Bio Lengkap</label>
                <textarea 
                  className="w-full border border-zinc-200 rounded-xl px-4 py-2 resize-none" 
                  rows={3}
                  placeholder="Ceritain tentang lo..." 
                  value={editForm.bio} 
                  onChange={e => setEditForm(prev => ({ ...prev, bio: e.target.value }))} 
                />
              </div>
              <div>
                <label className="text-sm font-bold mb-1 block">Foto Profil</label>
                <input 
                  type="file" 
                  accept="image/*"
                  className="w-full border border-zinc-200 rounded-xl px-4 py-2" 
                  onChange={e => {
                    if (e.target.files && e.target.files[0]) {
                      setAvatarFile(e.target.files[0]);
                    }
                  }} 
                />
              </div>
            </div>
            <div className="flex gap-3 mt-6">
              <Button variant="outline" className="flex-1 rounded-full font-semibold" onClick={() => setShowEditProfile(false)}>Batal</Button>
              <Button className="flex-1 rounded-full font-semibold bg-black text-white hover:bg-zinc-800" onClick={handleEditProfile}>Simpan</Button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
