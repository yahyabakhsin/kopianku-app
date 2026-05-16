"use client";

import { useState, useEffect, use } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Share2, FolderHeart, Lock, Globe } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
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

  useEffect(() => {
    const fetchAlbumDetails = async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token) {
          router.push("/login");
          return;
        }

        const res = await apiClient.get(`/albums/${id}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setAlbum(res.data);
      } catch (error) {
        console.error("Gagal load detail album", error);
        router.push("/albums"); // Redirect kalau nggak ketemu atau private
      } finally {
        setLoading(false);
      }
    };
    
    fetchAlbumDetails();
  }, [id, router]);

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
                <span>Dibuat oleh <strong className="text-black">Lo</strong></span>
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

            <div className="flex gap-3">
              <Button variant="outline" className="rounded-full bg-white font-semibold">
                Edit Album
              </Button>
              {album.is_public && (
                <Button className="rounded-full bg-black hover:bg-zinc-800 text-white shadow-md">
                  <Share2 className="w-4 h-4 mr-2" /> Bagikan
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
              <CafeCard key={cafe.id} cafe={cafe} />
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

    </div>
  );
}
