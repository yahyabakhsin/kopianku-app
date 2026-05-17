"use client";

import { useState, useEffect, use } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Share2, FolderHeart, Lock, Globe, Trash2, Plus, Search, X } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { CafeCard } from "@/features/cafes/components/CafeCard";
import { apiClient } from "@/lib/axios";

export default function AlbumDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const router = useRouter();
  const resolvedParams = use(params);
  const id = resolvedParams.id;
  
  const [album, setAlbum] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [showShareModal, setShowShareModal] = useState(false);
  const [shareContent, setShareContent] = useState("");

  const [showEditModal, setShowEditModal] = useState(false);
  const [editForm, setEditForm] = useState({ title: "", description: "", is_public: false });

  const [showAddCafeModal, setShowAddCafeModal] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [currentUser, setCurrentUser] = useState<any>(null);

  const fetchAlbumDetails = async () => {
    try {
      const token = localStorage.getItem("token");
      
      if (token) {
        try {
          const userRes = await apiClient.get('/users/me', {
            headers: { Authorization: `Bearer ${token}` }
          });
          setCurrentUser(userRes.data);
        } catch (e) {
          console.error("Gagal load user", e);
        }
      }

      const res = await apiClient.get(`/albums/${id}`, {
        headers: token ? { Authorization: `Bearer ${token}` } : {}
      });
      setAlbum(res.data);
      
      setEditForm({
        title: res.data.title,
        description: res.data.description || "",
        is_public: res.data.is_public
      });
    } catch (e: any) {
      if (e.response?.status === 404) {
        router.push("/albums");
      } else if (e.response?.status === 403) {
        alert("Lo nggak ada akses ke album ini!");
        router.push("/albums");
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAlbumDetails();
  }, [id, router]);

  const handleUpdateAlbum = async () => {
    try {
      const token = localStorage.getItem("token");
      await apiClient.put(`/albums/${id}`, editForm, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setShowEditModal(false);
      fetchAlbumDetails();
    } catch (error) {
      console.error("Gagal update album", error);
      alert("Gagal update album");
    }
  };

  const handleDeleteAlbum = async () => {
    if (!confirm("Yakin mau hapus album ini?")) return;
    try {
      const token = localStorage.getItem("token");
      await apiClient.delete(`/albums/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      window.location.href = "/albums";
    } catch (error) {
      console.error("Gagal hapus album", error);
      alert("Gagal hapus album");
    }
  };

  const handleSearchCafe = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const q = e.target.value;
    setSearchQuery(q);
    if (!q.trim()) {
      setSearchResults([]);
      return;
    }
    setIsSearching(true);
    try {
      const res = await apiClient.get(`/cafes/search?q=${q}`);
      setSearchResults(res.data);
    } catch (error) {
      console.error("Gagal search cafe", error);
    } finally {
      setIsSearching(false);
    }
  };

  const handleAddCafe = async (cafeId: string) => {
    try {
      const token = localStorage.getItem("token");
      await apiClient.post(`/albums/${id}/cafes`, { cafe_id: cafeId }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setShowAddCafeModal(false);
      setSearchQuery("");
      setSearchResults([]);
      fetchAlbumDetails();
    } catch (error) {
      console.error("Gagal tambah cafe ke album", error);
    }
  };

  const handleRemoveCafe = async (cafeId: string) => {
    if (!confirm("Keluarkan kafe ini dari album?")) return;
    try {
      const token = localStorage.getItem("token");
      await apiClient.delete(`/albums/${id}/cafes/${cafeId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      fetchAlbumDetails();
    } catch (error) {
      console.error("Gagal remove cafe", error);
    }
  };

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center">Memuat album...</div>;
  }

  if (!album) {
    return <div className="min-h-screen flex items-center justify-center">Album nggak ketemu.</div>;
  }

  return (
    <div className="min-h-screen bg-zinc-50 pb-20">
      
      {/* Top Banner */}
      <div className="bg-white border-b border-zinc-100 py-12">
        <div className="container mx-auto max-w-screen-xl px-4 md:px-8">
          
          <Link href="/albums" className="inline-flex items-center text-sm font-medium text-zinc-500 hover:text-black mb-8 transition-colors">
            <ArrowLeft className="w-4 h-4 mr-2" /> Kembali ke Koleksi
          </Link>
          
          <div className="flex flex-col md:flex-row md:items-start justify-between gap-6 max-w-4xl">
            <div>
              <div className="flex items-center gap-3 mb-3">
                <div className="bg-amber-100 text-amber-600 p-2 rounded-xl">
                  <FolderHeart className="w-8 h-8" />
                </div>
                <h1 className="text-3xl md:text-5xl font-bold tracking-tight">{album.title}</h1>
              </div>
              
              <div className="flex items-center gap-4 text-sm text-zinc-500 mb-6 font-medium">
                <span>Dibuat oleh <strong className="text-black">{album.owner_name || "Kamu"}</strong></span>
                <span>•</span>
                <span className="flex items-center gap-1">
                  {album.is_public ? <Globe className="w-4 h-4" /> : <Lock className="w-4 h-4" />} 
                  {album.is_public ? "Publik" : "Privat"}
                </span>
                <span>•</span>
                <span>{album.cafes?.length || 0} Spot Ngopi</span>
              </div>
              
              {album.description && (
                <p className="text-zinc-600 text-lg leading-relaxed max-w-3xl">
                  {album.description}
                </p>
              )}
            </div>

            <div className="flex flex-wrap gap-3 mt-4 md:mt-0">
              {currentUser?.id === album.owner_id && (
                <>
                  <Button 
                    onClick={() => setShowAddCafeModal(true)}
                    className="rounded-full bg-amber-500 hover:bg-amber-600 text-white font-semibold shadow-md"
                  >
                    <Plus className="w-4 h-4 mr-2" /> Tambah Spot
                  </Button>
                  <Button 
                    variant="outline" 
                    onClick={() => {
                      setEditForm({ title: album.title, description: album.description || "", is_public: album.is_public });
                      setShowEditModal(true);
                    }}
                    className="rounded-full bg-white font-semibold"
                  >
                    Edit Album
                  </Button>
                </>
              )}
              {album.is_public && (
                <>
                  <Button 
                    className="rounded-full bg-black hover:bg-zinc-800 text-white shadow-md"
                    onClick={() => {
                      navigator.clipboard.writeText(window.location.href);
                      alert("Link album berhasil disalin ke clipboard! Bagikan ke temanmu.");
                    }}
                  >
                    <Share2 className="w-4 h-4 mr-2" /> Salin Link
                  </Button>
                  {currentUser?.id === album.owner_id && (
                    <Button 
                      variant="outline"
                      className="rounded-full border-zinc-200 hover:border-blue-500 hover:bg-blue-50 text-blue-600 transition-colors shadow-sm font-semibold"
                      onClick={() => setShowShareModal(true)}
                    >
                      <Globe className="w-4 h-4 mr-2" /> Share ke Community
                    </Button>
                  )}
                </>
              )}
              {currentUser?.id === album.owner_id && (
                <Button 
                  variant="destructive" 
                  size="icon"
                  onClick={handleDeleteAlbum}
                  className="rounded-full bg-red-50 text-red-500 hover:bg-red-100 border-none shadow-none"
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              )}
            </div>
          </div>

        </div>
      </div>

      {/* Grid Content */}
      <div className="container mx-auto max-w-screen-xl px-4 md:px-8 py-12">
        {album.cafes && album.cafes.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {album.cafes.map((cafe: any) => (
              <div key={cafe.id} className="relative group">
                <CafeCard cafe={cafe} />
                {currentUser?.id === album.owner_id && (
                  <button 
                    onClick={() => handleRemoveCafe(cafe.id)}
                    className="absolute top-4 right-4 bg-white/90 backdrop-blur-sm text-red-500 hover:text-white hover:bg-red-500 w-8 h-8 rounded-full flex items-center justify-center shadow-md opacity-0 group-hover:opacity-100 transition-all z-10"
                  >
                    <X className="w-4 h-4" />
                  </button>
                )}
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-20">
            <p className="text-zinc-500 mb-4">Album ini masih kosong.</p>
            <Link href="/discover">
              <Button variant="outline" className="rounded-full">Mulai Cari Kafe</Button>
            </Link>
          </div>
        )}
      </div>

      {/* Edit Album Modal */}
      {showEditModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4" onClick={() => setShowEditModal(false)}>
          <div className="bg-white rounded-[2rem] p-6 w-full max-w-md shadow-xl" onClick={e => e.stopPropagation()}>
            <h3 className="font-bold text-xl mb-4">Edit Album</h3>
            <div className="space-y-4">
              <div>
                <label className="text-sm font-bold mb-1 block">Nama Album</label>
                <input 
                  type="text" 
                  className="w-full border border-zinc-200 rounded-xl px-4 py-2" 
                  value={editForm.title} 
                  onChange={e => setEditForm(prev => ({ ...prev, title: e.target.value }))} 
                />
              </div>
              <div>
                <label className="text-sm font-bold mb-1 block">Deskripsi</label>
                <textarea 
                  className="w-full border border-zinc-200 rounded-xl px-4 py-2 resize-none" 
                  rows={3} 
                  value={editForm.description} 
                  onChange={e => setEditForm(prev => ({ ...prev, description: e.target.value }))} 
                />
              </div>
              <div className="flex items-center gap-2">
                <input 
                  type="checkbox" 
                  id="is_public"
                  checked={editForm.is_public}
                  onChange={e => setEditForm(prev => ({ ...prev, is_public: e.target.checked }))} 
                />
                <label htmlFor="is_public" className="text-sm font-semibold">Album Publik (Bisa dilihat orang lain)</label>
              </div>
            </div>
            <div className="flex gap-3 mt-6">
              <Button variant="outline" className="flex-1 rounded-full font-semibold" onClick={() => setShowEditModal(false)}>Batal</Button>
              <Button className="flex-1 rounded-full font-semibold bg-black text-white hover:bg-zinc-800" onClick={handleUpdateAlbum}>Simpan Perubahan</Button>
            </div>
          </div>
        </div>
      )}

      {/* Add Cafe Modal */}
      {showAddCafeModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4" onClick={() => setShowAddCafeModal(false)}>
          <div className="bg-white rounded-[2rem] p-6 w-full max-w-md shadow-xl" onClick={e => e.stopPropagation()}>
            <h3 className="font-bold text-xl mb-4 flex items-center gap-2">
              <Search className="w-5 h-5 text-amber-500" /> Cari Kafe
            </h3>
            <div className="relative mb-4">
              <Input 
                placeholder="Ketik nama kafe..." 
                className="bg-zinc-50 border-zinc-200 rounded-xl"
                value={searchQuery}
                onChange={handleSearchCafe}
              />
            </div>
            
            <div className="space-y-3 max-h-64 overflow-y-auto pr-2">
              {isSearching ? (
                <p className="text-sm text-zinc-500 text-center">Mencari...</p>
              ) : searchQuery && searchResults.length === 0 ? (
                <p className="text-sm text-zinc-500 text-center">Tidak ada kafe yang cocok</p>
              ) : (
                searchResults.map((cafe: any) => (
                  <div key={cafe.id} className="flex items-center justify-between p-3 border border-zinc-100 rounded-xl hover:border-amber-500 hover:bg-amber-50 transition-colors">
                    <div>
                      <p className="font-bold text-sm">{cafe.name}</p>
                      <p className="text-xs text-zinc-500">{cafe.location}</p>
                    </div>
                    <Button 
                      onClick={() => handleAddCafe(cafe.id)}
                      size="sm" 
                      className="rounded-full bg-black text-white hover:bg-zinc-800"
                    >
                      <Plus className="w-4 h-4 mr-1" /> Add
                    </Button>
                  </div>
                ))
              )}
            </div>
            
            <Button variant="ghost" className="w-full mt-4 text-zinc-500 hover:text-black rounded-full" onClick={() => setShowAddCafeModal(false)}>Tutup</Button>
          </div>
        </div>
      )}

      {/* Modal Share to Community */}
      {showShareModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-3xl p-6 md:p-8 w-full max-w-md shadow-xl">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold">Bagikan ke Community</h2>
              <Button variant="ghost" size="icon" onClick={() => setShowShareModal(false)}>
                <X className="w-5 h-5" />
              </Button>
            </div>

            <div className="space-y-4">
              <div className="p-4 bg-zinc-50 border border-zinc-200 rounded-2xl flex items-center gap-3">
                <FolderHeart className="w-6 h-6 text-amber-500" />
                <span className="font-bold text-zinc-700">{album.title}</span>
              </div>
              <textarea 
                value={shareContent}
                onChange={(e) => setShareContent(e.target.value)}
                placeholder="Kasih caption menarik buat album ini..."
                className="w-full p-4 border border-zinc-200 rounded-2xl h-32 resize-none focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500"
              />
              <Button 
                onClick={async () => {
                  try {
                    const token = localStorage.getItem("token");
                    await apiClient.post("/feed/posts", {
                      content: shareContent,
                      album_id: parseInt(album.id)
                    }, { headers: { Authorization: `Bearer ${token}` } });
                    alert("Berhasil dibagikan ke Community!");
                    setShowShareModal(false);
                    setShareContent("");
                  } catch (e) {
                    console.error(e);
                    alert("Gagal membagikan album.");
                  }
                }}
                className="w-full h-12 rounded-full bg-amber-500 hover:bg-amber-600 text-white font-bold"
                disabled={!shareContent.trim()}
              >
                Kirim ke Community
              </Button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
