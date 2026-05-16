"use client";

import { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import axios from "axios";
import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { MapPin, Star, Search, Filter, Sparkles, Coffee } from "lucide-react";

const CATEGORIES = ["Semua", "WFC Friendly", "Cozy & Quiet", "Hidden Gem", "Meeting Room", "Nongkrong Malam"];

function DiscoverContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [cafes, setCafes] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  
  // Set initial category from URL if present
  const initialCategory = searchParams.get("category") || "Semua";
  const [activeCategory, setActiveCategory] = useState(initialCategory);

  useEffect(() => {
    const fetchCafes = async () => {
      try {
        // 1. Ambil Kunci VIP dari brankas browser
        const token = localStorage.getItem("token");
        
        if (!token) {
          router.push("/login");
          return;
        }

        // 2. Selipin tokennya pas nembak API
        const response = await axios.get("http://localhost:8000/api/cafes", {
          headers: {
            "Authorization": `Bearer ${token}`
          }
        });
        
        setCafes(response.data);
      } catch (error: any) {
        console.error("Gagal load data:", error);
        if (error.response?.status === 401) {
          alert("Sesi lu udah abis bang, login lagi yak!");
          localStorage.removeItem("token");
          router.push("/login");
        }
      } finally {
        setIsLoading(false);
      }
    };

    fetchCafes();
  }, [router]);

  // Fitur search kilat di frontend
  const filteredCafes = cafes.filter(cafe => {
    // Search query
    const matchSearch = cafe.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                        cafe.location?.toLowerCase().includes(searchQuery.toLowerCase());
                        
    // Category filter (in real app, we would match tags/facilities. Here we just mock if it's "Semua" or match a tag)
    // Since backend might not have all these specific categories yet, we will just show all if "Semua"
    // and randomly filter or match if facilities are present. For now we will check if facility matches category name loosely.
    let matchCategory = true;
    if (activeCategory !== "Semua") {
       // Mock category matching logic
       const cafeStr = JSON.stringify(cafe).toLowerCase();
       const catStr = activeCategory.toLowerCase().replace(" friendly", "");
       matchCategory = cafeStr.includes(catStr) || cafeStr.includes("wifi"); // fallbacks for demo
    }
    
    return matchSearch && matchCategory;
  });

  return (
    <div className="min-h-screen bg-zinc-50 pb-24 pt-8 px-4">
      <div className="container mx-auto max-w-screen-xl">
        
        {/* Header & Search */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-10">
          <div>
            <h1 className="text-3xl font-bold tracking-tight mb-2">Temukan Vibe Lo</h1>
            <p className="text-zinc-500">Rekomendasi kafe yang pas sama persona ngopi lo.</p>
          </div>
          
          <div className="flex gap-3 w-full md:w-auto">
            <div className="relative w-full md:w-80">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-zinc-400" />
              <Input 
                placeholder="Cari nama kafe atau lokasi..." 
                className="pl-10 h-12 rounded-2xl bg-white border-zinc-200"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <button className="h-12 px-4 bg-white border border-zinc-200 rounded-2xl flex items-center justify-center hover:bg-zinc-50">
              <Filter className="w-5 h-5 text-zinc-600" />
            </button>
          </div>
        </div>

        {/* Filter Tags */}
        <div className="flex overflow-x-auto gap-2 pb-4 mb-6 hide-scrollbar">
          {CATEGORIES.map((cat) => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={`whitespace-nowrap px-4 py-2 rounded-full text-sm font-semibold transition-colors border ${
                activeCategory === cat 
                  ? "bg-black text-white border-black" 
                  : "bg-white text-zinc-600 border-zinc-200 hover:bg-zinc-50"
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Loading State */}
        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-20 text-zinc-500">
            <Coffee className="w-10 h-10 animate-bounce mb-4 text-amber-500" />
            <p className="font-medium">Meracik rekomendasi terbaik buat lo...</p>
          </div>
        ) : (
          /* Grid Cafe */
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredCafes.map((cafe) => (
              <Link href={`/cafe/${cafe.id}`} key={cafe.id}>
                <Card className="rounded-[2rem] overflow-hidden border-none shadow-sm hover:shadow-xl transition-all duration-300 group cursor-pointer bg-white">
                  <div className="relative h-56 w-full overflow-hidden bg-zinc-200">
                    <img 
                      src={cafe.image_url || "https://images.unsplash.com/photo-1554118811-1e0d58224f24?q=80&w=800&auto=format&fit=crop"} 
                      alt={cafe.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                    {/* Badge Twin Match (Kalau ada dari backend) */}
                    {cafe.match_score > 0 && (
                      <div className="absolute top-4 right-4 bg-white/90 backdrop-blur-md px-3 py-1 rounded-full flex items-center gap-1 shadow-sm">
                        <Sparkles className="w-4 h-4 text-amber-500" />
                        <span className="text-sm font-bold text-amber-700">{cafe.match_score}% Match</span>
                      </div>
                    )}
                  </div>
                  <CardContent className="p-6">
                    <div className="flex justify-between items-start mb-2">
                      <h3 className="text-xl font-bold group-hover:text-amber-600 transition-colors line-clamp-1">{cafe.name}</h3>
                      <div className="flex items-center bg-amber-50 px-2 py-1 rounded-lg">
                        <Star className="w-4 h-4 text-amber-500 fill-amber-500 mr-1" />
                        <span className="text-sm font-bold text-amber-700">{cafe.rating || "New"}</span>
                      </div>
                    </div>
                    <p className="text-zinc-500 text-sm flex items-center mb-4 line-clamp-1">
                      <MapPin className="w-4 h-4 mr-1 shrink-0" /> {cafe.location || "Malang"}
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {(cafe.facilities || ["WiFi", "Colokan"]).slice(0, 3).map((fac: any, idx: number) => (
                        <Badge key={idx} variant="secondary" className="bg-zinc-100 text-zinc-600 hover:bg-zinc-200 font-medium">
                          {fac.name || fac}
                        </Badge>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        )}

      </div>
    </div>
  );
}

export default function DiscoverPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center">Loading...</div>}>
      <DiscoverContent />
    </Suspense>
  );
}