import { notFound } from "next/navigation";
import { ArrowLeft, Share2, FolderHeart, Lock, Globe } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { dummyCafes } from "@/features/cafes/data/dummy";
import { CafeCard } from "@/features/cafes/components/CafeCard";

// Mock data for albums detail
const albumsDetail: Record<string, any> = {
  a1: {
    title: "WFC Jaksel Andalan",
    description: "Kumpulan spot WFC di daerah Jaksel yang Wi-Fi nya konsisten kenceng, colokan melimpah, dan playlist lagunya ngga berisik. Cocok buat yang mau nge-flow state.",
    isPublic: true,
    author: "Lo",
    cafes: [dummyCafes[0], dummyCafes[2]]
  },
  a2: {
    title: "Hidden Gem Estetik",
    description: "Kafe-kafe nyempil yang desainnya unik, estetik parah, tapi belum banyak orang tau. Pas banget buat bikin konten Instagram/TikTok.",
    isPublic: false,
    author: "Lo",
    cafes: [dummyCafes[3]]
  },
  a3: {
    title: "Kopi Susu Creamy",
    description: "Buat lo yang suka kopi susu manis, kental, dan creamy. Ini jajaran top tier kopi susu yang wajib dibungkus atau diminum di tempat.",
    isPublic: true,
    author: "Lo",
    cafes: [dummyCafes[1], dummyCafes[3]]
  }
};

export default async function AlbumDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const album = albumsDetail[id];

  if (!album) {
    notFound();
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
                <span>Dibuat oleh <strong className="text-black">{album.author}</strong></span>
                <span>•</span>
                <span className="flex items-center gap-1">
                  {album.isPublic ? <Globe className="w-4 h-4" /> : <Lock className="w-4 h-4" />} 
                  {album.isPublic ? "Publik" : "Privat"}
                </span>
                <span>•</span>
                <span>{album.cafes.length} Spot Ngopi</span>
              </div>
              
              <p className="text-zinc-600 text-lg leading-relaxed max-w-3xl">
                {album.description}
              </p>
            </div>

            <div className="flex gap-3">
              <Button variant="outline" className="rounded-full bg-white font-semibold">
                Edit Album
              </Button>
              {album.isPublic && (
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
        {album.cafes.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {album.cafes.map((cafe: any) => (
              <CafeCard key={cafe.id} cafe={cafe} />
            ))}
          </div>
        ) : (
          <div className="text-center py-20">
            <p className="text-zinc-500 mb-4">Album ini masih kosong.</p>
            <Button variant="outline" className="rounded-full">Mulai Cari Kafe</Button>
          </div>
        )}
      </div>

    </div>
  );
}
