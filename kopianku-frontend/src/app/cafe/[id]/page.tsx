import { notFound } from "next/navigation";
import Image from "next/image";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { MapPin, Star, Sparkles, Wifi, Zap, Coffee, Camera, Wind, Sun, ShoppingBag, ArrowLeft, Share, Heart, MessageSquare, Users, CalendarDays, Brain } from "lucide-react";
import Link from "next/link";
import { CheckInModal } from "@/features/cafes/components/CheckInModal";

import { WishlistButton } from "@/features/cafes/components/WishlistButton";
import { AddToAlbumButton } from "@/features/cafes/components/AddToAlbumButton";
import { PersonalizedView } from "./PersonalizedView";

const getIcon = (name?: string) => {
  switch (name?.toLowerCase()) {
    case 'wifi': return <Wifi className="w-5 h-5 mb-2" />;
    case 'colokan': return <Zap className="w-5 h-5 mb-2" />;
    case 'kopi': return <Coffee className="w-5 h-5 mb-2" />;
    case 'estetik': return <Camera className="w-5 h-5 mb-2" />;
    case 'outdoor': return <Wind className="w-5 h-5 mb-2" />;
    case 'sun': return <Sun className="w-5 h-5 mb-2" />;
    case 'meeting room': return <Users className="w-5 h-5 mb-2" />;
    default: return <Sparkles className="w-5 h-5 mb-2" />;
  }
};

export default async function CafeDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const baseId = id.replace("-copy", "");

  let cafe = null;
  try {
    const res = await fetch(`http://localhost:8000/api/cafes/${baseId}`, { cache: 'no-store' });
    if (!res.ok) {
      if (res.status === 404) return notFound();
      throw new Error(`Gagal narik data`);
    }
    cafe = await res.json();
  } catch (error) {
    console.error(error);
    notFound(); 
  }

  let aiData = { positive: 85, neutral: 10, negative: 5, conclusion: "Vibe kafenya netral. Ada yang suka, ada yang ngerasa biasa aja." };
  try {
    const aiRes = await fetch(`http://localhost:8000/api/cafes/${baseId}/ai-summary`, { cache: 'no-store' });
    if (aiRes.ok) {
      const data = await aiRes.json();
      if (data.sentiment_breakdown) {
        const total = data.total_reviews_analyzed || 1;
        aiData = {
          positive: Math.round((data.sentiment_breakdown.positive_reviews / total) * 100) || 0,
          neutral: 0,
          negative: Math.round((data.sentiment_breakdown.negative_reviews / total) * 100) || 0,
          conclusion: data.ai_conclusion
        };
      }
    }
  } catch (error) {
    console.error("Gagal load AI summary", error);
  }

  // Karena ini Server Component dan nggak ada cookie JWT, 
  // twin match asli bakal dihitung di client-side atau pake data global, 
  // untuk sekarang kita tampilkan N/A atau 0
  const matchScore = 0;

  return (
    <div className="bg-white text-black min-h-screen pb-20">
      {/* Top Nav */}
      <div className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between max-w-screen-xl">
          <Link href="/discover" className="flex items-center text-sm font-medium hover:bg-zinc-100 px-3 py-2 rounded-lg transition-colors">
            <ArrowLeft className="w-4 h-4 mr-2" /> Kembali
          </Link>
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="icon" className="rounded-full"><Share className="w-5 h-5" /></Button>
            <AddToAlbumButton cafeId={cafe.id} />
            <WishlistButton cafeId={cafe.id} />
          </div>
        </div>
      </div>

      {/* Hero Image */}
      <div className="relative w-full h-[40vh] md:h-[50vh] bg-zinc-200">
        <Image 
          src={cafe.imageUrl || "https://images.unsplash.com/photo-1554118811-1e0d58224f24?q=80&w=2047&auto=format&fit=crop"} 
          alt={cafe.name} fill priority className="object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent" />
        <div className="absolute bottom-0 left-0 w-full p-6 md:p-12">
          <div className="container mx-auto max-w-screen-xl flex flex-col md:flex-row md:items-end justify-between gap-6">
            <div className="text-white">
              <Badge className="bg-amber-500 hover:bg-amber-600 border-none text-white mb-3">
                <Star className="w-3 h-3 mr-1 fill-white" /> {cafe.rating || "4.8"} 
              </Badge>
              <h1 className="text-4xl md:text-6xl font-bold mb-2 tracking-tight">{cafe.name}</h1>
              <p className="text-zinc-300 flex items-center text-lg">
                <MapPin className="w-5 h-5 mr-1" /> {cafe.location || "Malang, Indonesia"}
              </p>
            </div>
            <div className="bg-white/10 backdrop-blur-md border border-white/20 p-4 rounded-2xl flex items-center gap-4 text-white w-max">
              <div className="relative w-16 h-16 rounded-full flex items-center justify-center border-4 border-amber-400">
                <span className="font-bold text-xl">{cafe.rating || "4.8"}</span>
              </div>
              <div>
                <p className="font-bold">Rating</p>
                <p className="text-sm text-zinc-300">Dari {cafe.reviewCount || 0} reviews</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-12 max-w-screen-xl flex flex-col lg:flex-row gap-12">
        <div className="flex-1 space-y-12">
          
          {/* AI Vibe */}
          <section className="bg-[#F3F0FF] p-6 md:p-8 rounded-[2rem] relative overflow-hidden">
             <Badge className="bg-purple-200 text-purple-800 border-none mb-4 uppercase tracking-wider font-bold text-xs flex items-center gap-1 w-max">
               <Brain className="w-3 h-3" /> AI Generated Vibe
             </Badge>
             <h2 className="text-2xl font-bold mb-4">Rangkuman Suasana</h2>
              <p className="text-lg text-purple-900/80 leading-relaxed font-medium mb-6">
                "{aiData.conclusion}"
              </p>
              <div className="space-y-3">
                 <div className="flex items-center gap-4">
                   <span className="w-20 text-sm font-semibold text-green-700">Positif</span>
                   <div className="flex-1 h-2 bg-purple-200/50 rounded-full overflow-hidden">
                     <div className="h-full bg-green-500 rounded-full" style={{ width: `${aiData.positive}%` }}></div>
                   </div>
                   <span className="w-10 text-sm font-bold text-purple-900">{aiData.positive}%</span>
                 </div>
                 <div className="flex items-center gap-4">
                   <span className="w-20 text-sm font-semibold text-red-500">Negatif</span>
                   <div className="flex-1 h-2 bg-purple-200/50 rounded-full overflow-hidden">
                     <div className="h-full bg-red-400 rounded-full" style={{ width: `${aiData.negative}%` }}></div>
                   </div>
                   <span className="w-10 text-sm font-bold text-purple-900">{aiData.negative}%</span>
                 </div>
               </div>
             <Sparkles className="absolute -right-4 -bottom-4 w-32 h-32 text-purple-500/10 z-0" />
          </section>

          {/* Fasilitas dengan Match Score */}
          <PersonalizedView cafeId={cafe.id} initialFacilities={cafe.facilities || []} />
        </div>

        {/* Sidebar */}
        <div className="w-full lg:w-80">
          <div className="sticky top-24 bg-white border border-zinc-200 rounded-3xl p-6 shadow-sm">
            <h3 className="font-bold text-lg mb-2">Check-in ke Spot Ini?</h3>
            <p className="text-sm text-zinc-500 mb-6">Kasih tau teman-teman lo kalau lo lagi asik ngopi di sini.</p>
            <CheckInModal cafeId={cafe.id} cafeName={cafe.name} />

            {/* Tombol Booking */}
            <div className="mt-6 pt-6 border-t border-zinc-100">
              <Badge className="bg-blue-100 text-blue-700 hover:bg-blue-100 border-none mb-3 font-bold">TERSEDIA MEETING ROOM</Badge>
              <Link href={`/cafe/${cafe.id}/reserve`} className="block">
                <Button className="w-full bg-blue-600 hover:bg-blue-700 text-white rounded-full h-12 shadow-md">
                  <CalendarDays className="w-4 h-4 mr-2" /> Reservasi Ruangan
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}