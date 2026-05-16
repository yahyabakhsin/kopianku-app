"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Plus, Coffee, FolderHeart, Share2, X } from "lucide-react";
import Image from "next/image";
import Link from "next/link";

// Dummy data for albums
const dummyAlbums = [
  {
    id: "a1",
    title: "WFC Jaksel Andalan",
    count: 12,
    isPublic: true,
    images: [
      "https://images.unsplash.com/photo-1554118811-1e0d58224f24?auto=format&fit=crop&q=80&w=400",
      "https://images.unsplash.com/photo-1497935586351-b67a49e012bf?auto=format&fit=crop&q=80&w=400",
      "https://images.unsplash.com/photo-1559925393-8be0ec4767c8?auto=format&fit=crop&q=80&w=400"
    ]
  },
  {
    id: "a2",
    title: "Hidden Gem Estetik",
    count: 8,
    isPublic: false,
    images: [
      "https://images.unsplash.com/photo-1600093463592-8e36ae95ef56?auto=format&fit=crop&q=80&w=400",
      "https://images.unsplash.com/photo-1525610553991-2bede1a236e2?auto=format&fit=crop&q=80&w=400",
    ]
  },
  {
    id: "a3",
    title: "Kopi Susu Creamy",
    count: 24,
    isPublic: true,
    images: [
      "https://images.unsplash.com/photo-1497935586351-b67a49e012bf?auto=format&fit=crop&q=80&w=400",
    ]
  }
];

export default function AlbumsPage() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newAlbumName, setNewAlbumName] = useState("");

  const handleCreateAlbum = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newAlbumName.trim()) return;
    
    // In a real app, we'd add it to state or send to backend
    alert(`Album "${newAlbumName}" berhasil dibuat! (Dummy)`);
    setNewAlbumName("");
    setIsModalOpen(false);
  };

  return (
    <div className="min-h-screen bg-white">
      
      {/* Header */}
      <div className="bg-zinc-50 border-b border-zinc-100 py-12">
        <div className="container mx-auto max-w-screen-xl px-4 md:px-8">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <FolderHeart className="w-8 h-8 text-amber-500" />
                <h1 className="text-3xl md:text-4xl font-bold tracking-tight">Koleksi Album</h1>
              </div>
              <p className="text-zinc-500 max-w-xl">
                Simpan dan kelompokkan kafe favorit lo. Bikin album *public* biar bisa disontek sama temen-temen lo.
              </p>
            </div>
            <Button 
              onClick={() => setIsModalOpen(true)}
              className="bg-black hover:bg-zinc-800 text-white rounded-full h-12 px-6 shadow-md transition-transform active:scale-95"
            >
              <Plus className="w-5 h-5 mr-2" /> Buat Album Baru
            </Button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto max-w-screen-xl px-4 md:px-8 py-12">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
          
          {dummyAlbums.map((album) => (
            <Link key={album.id} href={`/albums/${album.id}`} className="group cursor-pointer block">
              {/* Album Cover Grid */}
              <div className="relative aspect-[4/3] rounded-[2rem] overflow-hidden mb-4 bg-zinc-100 border border-zinc-200 transition-transform duration-300 group-hover:-translate-y-2 group-hover:shadow-xl">
                {album.images.length >= 3 ? (
                  <div className="absolute inset-0 grid grid-cols-2 grid-rows-2 gap-1 p-1">
                    <div className="relative col-span-1 row-span-2 rounded-xl overflow-hidden">
                      <Image src={album.images[0]} alt="cover 1" fill className="object-cover" />
                    </div>
                    <div className="relative rounded-xl overflow-hidden">
                      <Image src={album.images[1]} alt="cover 2" fill className="object-cover" />
                    </div>
                    <div className="relative rounded-xl overflow-hidden">
                      <Image src={album.images[2]} alt="cover 3" fill className="object-cover" />
                    </div>
                  </div>
                ) : album.images.length === 2 ? (
                  <div className="absolute inset-0 grid grid-cols-2 gap-1 p-1">
                    <div className="relative rounded-xl overflow-hidden">
                      <Image src={album.images[0]} alt="cover 1" fill className="object-cover" />
                    </div>
                    <div className="relative rounded-xl overflow-hidden">
                      <Image src={album.images[1]} alt="cover 2" fill className="object-cover" />
                    </div>
                  </div>
                ) : (
                  <div className="absolute inset-0 p-1">
                    <div className="relative w-full h-full rounded-xl overflow-hidden">
                      <Image src={album.images[0]} alt="cover 1" fill className="object-cover" />
                    </div>
                  </div>
                )}
                
                {/* Overlay Hover Effect */}
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors duration-300 flex items-center justify-center">
                  <div className="opacity-0 group-hover:opacity-100 transform translate-y-4 group-hover:translate-y-0 transition-all duration-300">
                    <Button variant="secondary" className="rounded-full font-bold shadow-lg pointer-events-none">
                      Buka Album
                    </Button>
                  </div>
                </div>
              </div>

              {/* Album Info */}
              <div className="flex items-start justify-between px-2">
                <div>
                  <h3 className="text-lg font-bold group-hover:text-amber-600 transition-colors">{album.title}</h3>
                  <div className="flex items-center gap-3 text-sm text-zinc-500 mt-1">
                    <span className="flex items-center gap-1"><Coffee className="w-3.5 h-3.5" /> {album.count} Spot</span>
                    <span>•</span>
                    <span className="font-medium">{album.isPublic ? "Publik" : "Privat"}</span>
                  </div>
                </div>
                {album.isPublic && (
                  <Button variant="ghost" size="icon" className="text-zinc-400 hover:text-black pointer-events-none">
                    <Share2 className="w-4 h-4" />
                  </Button>
                )}
              </div>
            </Link>
          ))}

        </div>
      </div>

      {/* Custom Tailwind Modal for Add Album */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white rounded-[2rem] w-full max-w-md p-6 shadow-2xl relative animate-in zoom-in-95 duration-200">
            <Button 
              variant="ghost" 
              size="icon" 
              onClick={() => setIsModalOpen(false)}
              className="absolute right-4 top-4 text-zinc-400 hover:text-black hover:bg-zinc-100 rounded-full"
            >
              <X className="w-5 h-5" />
            </Button>
            
            <div className="mb-6">
              <div className="w-12 h-12 bg-amber-100 text-amber-600 flex items-center justify-center rounded-2xl mb-4">
                <FolderHeart className="w-6 h-6" />
              </div>
              <h2 className="text-2xl font-bold mb-1">Buat Album Baru</h2>
              <p className="text-sm text-zinc-500">Kelompokkan spot ngopi favorit lo biar gampang dicari.</p>
            </div>

            <form onSubmit={handleCreateAlbum} className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-semibold text-zinc-700">Nama Album</label>
                <Input 
                  placeholder="Misal: Buat Ngedate..." 
                  value={newAlbumName}
                  onChange={(e) => setNewAlbumName(e.target.value)}
                  className="bg-zinc-50 border-zinc-200 h-12 rounded-xl focus-visible:ring-amber-500"
                  autoFocus
                />
              </div>
              
              <div className="flex gap-3 pt-2">
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={() => setIsModalOpen(false)}
                  className="flex-1 rounded-xl h-12 border-zinc-200"
                >
                  Batal
                </Button>
                <Button 
                  type="submit" 
                  disabled={!newAlbumName.trim()}
                  className="flex-1 rounded-xl h-12 bg-black hover:bg-zinc-800 text-white"
                >
                  Simpan Album
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
