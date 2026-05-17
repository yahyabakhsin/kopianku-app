"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { FolderHeart, Plus } from "lucide-react";
import { apiClient } from "@/lib/axios";

export function AddToAlbumButton({ cafeId }: { cafeId: string }) {
  const [showModal, setShowModal] = useState(false);
  const [albums, setAlbums] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (showModal) {
      const fetchAlbums = async () => {
        try {
          const token = localStorage.getItem("token");
          if (!token) return;
          const res = await apiClient.get('/albums', {
            headers: { Authorization: `Bearer ${token}` }
          });
          setAlbums(res.data);
        } catch (error) {
          console.error("Gagal load albums", error);
        }
      };
      fetchAlbums();
    }
  }, [showModal]);

  const addToAlbum = async (albumId: number) => {
    try {
      setIsLoading(true);
      const token = localStorage.getItem("token");
      if (!token) {
        alert("Login dulu bang buat nambah ke album!");
        return;
      }
      const res = await apiClient.post(`/albums/${albumId}/cafes`, { cafe_id: cafeId }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      alert(res.data.message);
      setShowModal(false);
    } catch (error) {
      console.error("Gagal nambahin cafe ke album", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <Button 
        variant="ghost" 
        size="icon" 
        onClick={() => setShowModal(true)}
        className="rounded-full text-zinc-600 hover:text-amber-500 hover:bg-amber-50 transition-colors"
      >
        <FolderHeart className="w-5 h-5" />
      </Button>

      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4" onClick={() => setShowModal(false)}>
          <div className="bg-white rounded-[2rem] p-6 w-full max-w-sm shadow-xl" onClick={e => e.stopPropagation()}>
            <h3 className="font-bold text-xl mb-4 text-black">Pilih Album</h3>
            
            {albums.length === 0 ? (
              <p className="text-zinc-500 text-sm mb-4">Belum ada album. Bikin dulu di profil lo bang!</p>
            ) : (
              <div className="space-y-3 max-h-64 overflow-y-auto mb-4">
                {albums.map(album => (
                  <button 
                    key={album.id}
                    onClick={() => addToAlbum(album.id)}
                    disabled={isLoading}
                    className="w-full text-left p-3 rounded-xl border border-zinc-100 hover:border-amber-500 hover:bg-amber-50 transition-colors flex items-center justify-between group"
                  >
                    <div>
                      <p className="font-bold text-sm text-black">{album.title}</p>
                      <p className="text-xs text-zinc-500">{album.cafe_count} Spot</p>
                    </div>
                    <Plus className="w-4 h-4 text-zinc-300 group-hover:text-amber-500" />
                  </button>
                ))}
              </div>
            )}
            
            <Button variant="ghost" className="w-full text-zinc-500 hover:text-black rounded-full" onClick={() => setShowModal(false)}>Batal</Button>
          </div>
        </div>
      )}
    </>
  );
}
