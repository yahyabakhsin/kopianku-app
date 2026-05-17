"use client";

import { useState, useEffect, use } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, MapPin, Calendar, Activity, Coffee, Users, Star, FolderHeart, Bookmark } from "lucide-react";
import Link from "next/link";
import { apiClient } from "@/lib/axios";
import { useRouter } from "next/navigation";

export default function PublicProfilePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const router = useRouter();
  const resolvedParams = use(params);
  const id = resolvedParams.id;
  
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [isFollowing, setIsFollowing] = useState(false);
  const [activeTab, setActiveTab] = useState("top"); // "top", "albums", "wishlists", "activities"
  
  const [showFollowModal, setShowFollowModal] = useState(false);
  const [followModalType, setFollowModalType] = useState<"Pengikut" | "Mengikuti">("Pengikut");
  const [followsData, setFollowsData] = useState<{followers: any[], following: any[]}>({ followers: [], following: [] });

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const token = localStorage.getItem("token");
        const res = await apiClient.get(`/users/${id}`, {
          headers: token ? { Authorization: `Bearer ${token}` } : {}
        });
        setProfile(res.data);
        
        if (token) {
          const followRes = await apiClient.get(`/users/me/follows`, {
            headers: { Authorization: `Bearer ${token}` }
          });
          const followingList = followRes.data.following || [];
          const isUserFollowing = followingList.some((u: any) => u.id === parseInt(id));
          setIsFollowing(isUserFollowing);
        }
      } catch (error) {
        console.error("Gagal load profile", error);
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, [id]);

  const toggleFollow = async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) return alert("Login dulu bang!");
      const res = await apiClient.post(`/users/me/${id}/follow`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setIsFollowing(res.data.status === 'followed');
      setProfile((prev: any) => ({
        ...prev,
        stats: {
          ...prev.stats,
          followers: res.data.status === 'followed' ? prev.stats.followers + 1 : prev.stats.followers - 1
        }
      }));
    } catch (error) {
      console.error(error);
    }
  };

  const fetchFollows = async () => {
    try {
      const res = await apiClient.get(`/users/public/${id}/follows`);
      setFollowsData(res.data);
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    if (showFollowModal) {
      fetchFollows();
    }
  }, [showFollowModal, id]);

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center bg-zinc-50">Loading profile...</div>;
  }

  if (!profile) {
    return <div className="min-h-screen flex items-center justify-center bg-zinc-50">Profile not found.</div>;
  }

  return (
    <div className="min-h-screen bg-zinc-50 pb-20">
      {/* Cover Banner */}
      <div className={`h-48 md:h-64 relative ${profile.role === 'owner' ? 'bg-gradient-to-r from-zinc-900 to-black' : 'bg-gradient-to-r from-amber-400 to-orange-500'}`}>
        <Link href="/social" className="absolute top-6 left-6 w-10 h-10 bg-white/20 hover:bg-white/40 backdrop-blur-md rounded-full flex items-center justify-center text-white transition-colors">
          <ArrowLeft className="w-5 h-5" />
        </Link>
        {profile.role === 'owner' && (
          <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-20"></div>
        )}
      </div>

      <div className="container mx-auto max-w-screen-xl px-4 md:px-8">
        {/* Profile Card */}
        <div className="bg-white rounded-[2rem] p-6 md:p-8 shadow-sm border border-zinc-100 -mt-16 md:-mt-20 relative flex flex-col md:flex-row gap-6 md:items-end">
          <Avatar className={`w-24 h-24 md:w-32 md:h-32 border-4 border-white shadow-lg ${profile.role === 'owner' ? 'ring-4 ring-zinc-900' : ''}`}>
            {profile.avatar_url ? (
              <AvatarImage src={profile.avatar_url} alt={profile.username} className="object-cover" />
            ) : (
              <AvatarFallback className={profile.role === 'owner' ? 'bg-zinc-900 text-white text-3xl font-bold' : 'bg-amber-100 text-amber-700 text-3xl font-bold'}>
                {profile.username?.[0]?.toUpperCase()}
              </AvatarFallback>
            )}
          </Avatar>
          
          <div className="flex-1">
            <div className="flex flex-wrap items-center gap-2 mb-1">
              <h1 className="text-2xl md:text-4xl font-bold tracking-tight">{profile.username}</h1>
              {profile.role === "owner" && (
                <Badge className="bg-zinc-900 text-amber-400 hover:bg-zinc-800 border border-amber-500 shadow-sm font-bold tracking-wide">
                  MITRA BISNIS KOPIANKU
                </Badge>
              )}
            </div>
            <p className={profile.role === 'owner' ? "text-zinc-500 font-medium mb-3" : "text-amber-600 font-medium mb-3"}>
              {profile.role === 'owner' ? "Pengelola Kafe Resmi" : (profile.persona || "Anak Nongkrong")}
            </p>
            {profile.bio && (
              <p className="text-zinc-600 text-sm max-w-xl leading-relaxed mb-4">{profile.bio}</p>
            )}
            
            <div className="flex flex-wrap gap-4 text-sm text-zinc-500 font-medium">
              <span 
                className="flex items-center gap-1 cursor-pointer hover:text-amber-600 transition-colors"
                onClick={() => {
                  setActiveTab("activities");
                  window.scrollTo({ top: 500, behavior: 'smooth' });
                }}
              >
                <Activity className="w-4 h-4" /> {(profile.stats?.reviews_count || 0) + (profile.stats?.checkins_count || 0)} Aktivitas
              </span>
              <span 
                className="flex items-center gap-1 cursor-pointer hover:text-amber-600 transition-colors"
                onClick={() => {
                  setFollowModalType("Pengikut");
                  setShowFollowModal(true);
                }}
              >
                <Users className="w-4 h-4" /> {profile.stats?.followers || 0} Pengikut
              </span>
              <span 
                className="cursor-pointer hover:text-amber-600 transition-colors"
                onClick={() => {
                  setFollowModalType("Mengikuti");
                  setShowFollowModal(true);
                }}
              >
                {profile.stats?.following || 0} Mengikuti
              </span>
            </div>
          </div>
          
          <div className="flex gap-3">
            <Button 
              onClick={toggleFollow}
              className={`rounded-full px-8 font-bold ${isFollowing ? 'bg-zinc-100 text-zinc-700 hover:bg-zinc-200' : 'bg-black text-white hover:bg-zinc-800'}`}
            >
              {isFollowing ? 'Unfollow' : 'Follow'}
            </Button>
          </div>
        </div>
      </div>
      
      {/* Content Tabs */}
      <div className="container mx-auto max-w-screen-xl px-4 md:px-8 mt-12 mb-20">
        <div className="flex flex-wrap gap-3 mb-8">
          <Button 
            variant={activeTab === "top" ? "default" : "outline"} 
            className={`rounded-full font-bold ${activeTab === "top" ? "bg-black text-white" : "bg-white text-zinc-600"}`}
            onClick={() => setActiveTab("top")}
          >
            <Star className="w-4 h-4 mr-2" /> Top 4
          </Button>
          <Button 
            variant={activeTab === "albums" ? "default" : "outline"} 
            className={`rounded-full font-bold ${activeTab === "albums" ? "bg-black text-white" : "bg-white text-zinc-600"}`}
            onClick={() => setActiveTab("albums")}
          >
            <FolderHeart className="w-4 h-4 mr-2" /> Album
          </Button>
          <Button 
            variant={activeTab === "wishlists" ? "default" : "outline"} 
            className={`rounded-full font-bold ${activeTab === "wishlists" ? "bg-black text-white" : "bg-white text-zinc-600"}`}
            onClick={() => setActiveTab("wishlists")}
          >
            <Bookmark className="w-4 h-4 mr-2" /> Wishlist
          </Button>
          <Button 
            variant={activeTab === "activities" ? "default" : "outline"} 
            className={`rounded-full font-bold ${activeTab === "activities" ? "bg-black text-white" : "bg-white text-zinc-600"}`}
            onClick={() => setActiveTab("activities")}
          >
            <Activity className="w-4 h-4 mr-2" /> Riwayat
          </Button>
        </div>

        {/* Tab Content: Top 4 */}
        {activeTab === "top" && (
          <div>
            <h3 className="font-bold text-2xl mb-6 flex items-center gap-2">
              <Star className="w-6 h-6 text-amber-500" /> Top 4 Kafe Favorit {profile.username}
            </h3>
            {profile.top_cafes?.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {profile.top_cafes.map((cafe: any) => (
                  <Link key={cafe.id} href={`/cafe/${cafe.id}`} className="block group bg-white rounded-3xl overflow-hidden border border-zinc-100 shadow-sm hover:shadow-md transition-all hover:border-amber-500">
                    <div className="relative h-40">
                      <img src={cafe.imageUrl} alt={cafe.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                      <div className="absolute top-3 right-3 bg-white/90 backdrop-blur-sm text-amber-600 font-bold px-2 py-1 rounded-lg text-sm flex items-center gap-1 shadow-sm">
                        ★ {cafe.rating}/5
                      </div>
                    </div>
                    <div className="p-4">
                      <h4 className="font-bold text-lg mb-1 truncate">{cafe.name}</h4>
                      <p className="text-zinc-500 text-sm truncate">{cafe.location}</p>
                    </div>
                  </Link>
                ))}
              </div>
            ) : (
              <p className="text-zinc-500 bg-white p-8 rounded-3xl border border-zinc-100 text-center">{profile.username} belum kasih review ke kafe manapun.</p>
            )}
          </div>
        )}

        {/* Tab Content: Albums */}
        {activeTab === "albums" && (
          <div>
            <h3 className="font-bold text-2xl mb-6 flex items-center gap-2">
              <FolderHeart className="w-6 h-6 text-amber-500" /> Koleksi Album {profile.username}
            </h3>
            {profile.albums?.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {profile.albums.map((album: any) => (
                  <Link key={album.id} href={`/albums/${album.id}`} className="block group bg-white rounded-3xl p-6 border border-zinc-100 shadow-sm hover:shadow-md hover:border-amber-500 transition-all">
                    <div className="bg-amber-100 text-amber-600 w-12 h-12 rounded-xl flex items-center justify-center mb-4 group-hover:bg-amber-500 group-hover:text-white transition-colors">
                      <FolderHeart className="w-6 h-6" />
                    </div>
                    <h4 className="font-bold text-xl mb-2">{album.title}</h4>
                    <p className="text-zinc-500 text-sm line-clamp-2">{album.description || "Nggak ada deskripsi."}</p>
                  </Link>
                ))}
              </div>
            ) : (
              <p className="text-zinc-500 bg-white p-8 rounded-3xl border border-zinc-100 text-center">{profile.username} belum punya album publik.</p>
            )}
          </div>
        )}

        {/* Tab Content: Wishlists */}
        {activeTab === "wishlists" && (
          <div>
            <h3 className="font-bold text-2xl mb-6 flex items-center gap-2">
              <Bookmark className="w-6 h-6 text-amber-500" /> Wishlist {profile.username}
            </h3>
            {profile.wishlists?.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {profile.wishlists.map((cafe: any) => (
                  <Link key={cafe.id} href={`/cafe/${cafe.id}`} className="block group bg-white rounded-3xl overflow-hidden border border-zinc-100 shadow-sm hover:shadow-md transition-all hover:border-amber-500">
                    <div className="relative h-40">
                      <img src={cafe.imageUrl} alt={cafe.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                    </div>
                    <div className="p-4">
                      <h4 className="font-bold text-lg mb-1 truncate">{cafe.name}</h4>
                      <p className="text-zinc-500 text-sm truncate">{cafe.location}</p>
                    </div>
                  </Link>
                ))}
              </div>
            ) : (
              <p className="text-zinc-500 bg-white p-8 rounded-3xl border border-zinc-100 text-center">{profile.username} belum punya wishlist kafe.</p>
            )}
          </div>
        )}

        {/* Tab Content: Activities */}
        {activeTab === "activities" && (
          <div>
            <h3 className="font-bold text-2xl mb-6 flex items-center gap-2">
              <Activity className="w-6 h-6 text-amber-500" /> Riwayat Aktivitas
            </h3>
            {profile.recent_activities?.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {profile.recent_activities.map((act: any) => (
                  <div key={act.id} className="bg-white p-6 rounded-3xl border border-zinc-100 shadow-sm hover:shadow-md transition-shadow">
                    <div className="flex items-center justify-between mb-4">
                      <Badge variant="outline" className={act.type === 'review' ? 'border-amber-200 text-amber-700 bg-amber-50' : 'border-blue-200 text-blue-700 bg-blue-50'}>
                        {act.type === 'review' ? 'Review' : 'Check-in'}
                      </Badge>
                      <span className="text-xs text-zinc-400 font-medium">{act.created_at}</span>
                    </div>
                    
                    <h4 className="font-bold text-lg mb-2 flex items-center gap-2">
                      <MapPin className="w-4 h-4 text-zinc-400" /> {act.cafe_name}
                    </h4>
                    
                    <p className="text-zinc-600 leading-relaxed text-sm">
                      {act.content}
                    </p>
                    
                    {act.type === 'review' && act.rating && (
                      <div className="mt-4 pt-4 border-t border-zinc-100 flex items-center text-sm font-bold text-amber-600">
                        ★ {act.rating}/5
                      </div>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <div className="bg-white rounded-[2rem] p-12 shadow-sm border border-zinc-100 max-w-2xl mx-auto text-center">
                <Coffee className="w-12 h-12 text-zinc-300 mx-auto mb-4" />
                <h3 className="font-bold text-xl text-zinc-700 mb-2">Belum Ada Aktivitas</h3>
                <p className="text-zinc-500">
                  {profile.username} belum pernah check-in atau ninggalin review di kafe manapun.
                </p>
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
    </div>
  );
}

