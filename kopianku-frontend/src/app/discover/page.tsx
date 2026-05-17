"use client";

import { useState, useEffect, Suspense, useMemo } from "react";
import { useRouter } from "next/navigation";
import axios from "axios";
import Link from "next/link";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { MapPin, Star, Search, Coffee, LayoutGrid, Map as MapIcon, Sparkles } from "lucide-react";

// Filter Constants
const RATING_OPTIONS = [3, 4, 4.5];

function DiscoverContent() {
  const router = useRouter();
  const [cafes, setCafes] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  // Filter States
  const [searchName, setSearchName] = useState("");
  const [searchLocation, setSearchLocation] = useState("");
  const [selectedVibes, setSelectedVibes] = useState<string[]>([]);
  const [selectedFacilities, setSelectedFacilities] = useState<string[]>([]);
  const [minRating, setMinRating] = useState<number | null>(null);
  const [viewMode, setViewMode] = useState<"grid" | "maps">("grid");

  // Dynamic filter options
  const dynamicVibes = useMemo(() => {
    const allVibes = cafes.flatMap(c => c.vibes || []);
    return Array.from(new Set(allVibes)).filter(Boolean);
  }, [cafes]);

  const dynamicFacilities = useMemo(() => {
    const allFacs = cafes.flatMap(c => c.facilities?.map((f:any) => f.name) || []);
    return Array.from(new Set(allFacs)).filter(Boolean);
  }, [cafes]);

  useEffect(() => {
    const fetchCafes = async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token) {
          router.push("/login");
          return;
        }

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

  // Toggle helpers
  const toggleVibe = (vibe: string) => {
    setSelectedVibes(prev => 
      prev.includes(vibe) ? prev.filter(v => v !== vibe) : [...prev, vibe]
    );
  };

  const toggleFacility = (facility: string) => {
    setSelectedFacilities(prev => 
      prev.includes(facility) ? prev.filter(f => f !== facility) : [...prev, facility]
    );
  };

  // Complex Filter Logic
  const filteredCafes = useMemo(() => {
    return cafes.filter(cafe => {
      // 1. Filter Nama
      if (searchName && !cafe.name.toLowerCase().includes(searchName.toLowerCase())) {
        return false;
      }

      // 2. Filter Lokasi
      if (searchLocation && (!cafe.location || !cafe.location.toLowerCase().includes(searchLocation.toLowerCase()))) {
        return false;
      }

      // 3. Filter Rating
      if (minRating && cafe.rating < minRating) {
        return false;
      }

      // Gabungkan data tag kafe dari database biar gampang dicocokkan
      const cafeTags = [
        ...(cafe.vibes || []), 
        ...(cafe.facilities?.map((f: any) => f.name) || [])
      ].map(t => t.toLowerCase());

      // 4. Filter Vibes (AND condition - cafe must have all selected vibes... or loosely matched for hackathon)
      if (selectedVibes.length > 0) {
        const hasVibe = selectedVibes.some(v => cafeTags.includes(v.toLowerCase()));
        if (!hasVibe) return false;
      }

      // 5. Filter Facilities (AND condition)
      if (selectedFacilities.length > 0) {
        const hasFacility = selectedFacilities.some(f => cafeTags.includes(f.toLowerCase()) || cafeTags.some(ct => f.toLowerCase().includes(ct) || ct.includes(f.toLowerCase())));
        if (!hasFacility) return false;
      }

      return true;
    });
  }, [cafes, searchName, searchLocation, selectedVibes, selectedFacilities, minRating]);

  return (
    <div className="min-h-screen bg-white">
      <div className="container mx-auto max-w-[1400px] flex gap-8 px-6 py-8">
        
        {/* === SIDEBAR (LEFT) === */}
        <aside className="hidden lg:block w-72 shrink-0">
          <h2 className="text-xl font-bold mb-8">Filter</h2>

          {/* Lokasi */}
          <div className="mb-8">
            <h3 className="text-xs font-bold text-zinc-400 mb-3 tracking-widest uppercase">Lokasi</h3>
            <div className="relative">
              <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
              <select
                className="w-full pl-9 h-10 bg-zinc-50 border-none rounded-xl text-sm focus:outline-none focus:ring-1 focus:ring-zinc-300 appearance-none cursor-pointer"
                value={searchLocation}
                onChange={(e) => setSearchLocation(e.target.value)}
              >
                <option value="">Semua Lokasi</option>
                <option value="Lowokwaru">Lowokwaru</option>
                <option value="Klojen">Klojen</option>
                <option value="Merjosari">Merjosari</option>
                <option value="Sukun">Sukun</option>
                <option value="Blimbing">Blimbing</option>
                <option value="Batu">Kota Batu</option>
              </select>
            </div>
          </div>

          {/* Vibe Suasana */}
          <div className="mb-8">
            <h3 className="text-xs font-bold text-zinc-400 mb-3 tracking-widest uppercase">Vibe Suasana</h3>
            <div className="flex flex-wrap gap-2">
              {dynamicVibes.map(vibe => {
                const isActive = selectedVibes.includes(vibe);
                return (
                  <button
                    key={vibe}
                    onClick={() => toggleVibe(vibe)}
                    className={`px-3 py-1.5 rounded-full text-xs font-semibold border transition-all ${
                      isActive 
                        ? "bg-zinc-800 text-white border-zinc-800" 
                        : "bg-white text-zinc-600 border-zinc-200 hover:border-zinc-400"
                    }`}
                  >
                    {vibe}
                  </button>
                )
              })}
            </div>
          </div>

          {/* Fasilitas Utama */}
          <div className="mb-8">
            <h3 className="text-xs font-bold text-zinc-400 mb-3 tracking-widest uppercase">Fasilitas Utama</h3>
            <div className="flex flex-col gap-3">
              {dynamicFacilities.map(fac => {
                const isActive = selectedFacilities.includes(fac);
                return (
                  <label key={fac} onClick={(e) => { e.preventDefault(); toggleFacility(fac); }} className="flex items-center gap-3 cursor-pointer group">
                    <div className={`w-5 h-5 rounded border flex items-center justify-center transition-colors ${
                      isActive ? "bg-amber-500 border-amber-500" : "bg-white border-zinc-300 group-hover:border-amber-400"
                    }`}>
                      {isActive && <div className="w-2 h-2 bg-white rounded-sm" />}
                    </div>
                    <span className={`text-sm ${isActive ? "font-semibold text-zinc-900" : "text-zinc-600 group-hover:text-zinc-900"}`}>
                      {fac}
                    </span>
                  </label>
                )
              })}
            </div>
          </div>

          {/* Minimal Rating */}
          <div>
            <h3 className="text-xs font-bold text-zinc-400 mb-3 tracking-widest uppercase">Minimal Rating</h3>
            <div className="flex gap-2">
              {RATING_OPTIONS.map(r => {
                const isActive = minRating === r;
                return (
                  <button
                    key={r}
                    onClick={() => setMinRating(isActive ? null : r)}
                    className={`flex items-center justify-center gap-1 flex-1 py-2 rounded-xl text-xs font-bold border transition-colors ${
                      isActive
                        ? "bg-amber-50 border-amber-200 text-amber-700"
                        : "bg-white border-zinc-200 text-zinc-600 hover:border-amber-200 hover:bg-amber-50/50"
                    }`}
                  >
                    <Star className={`w-3 h-3 ${isActive ? "fill-amber-500 text-amber-500" : "fill-zinc-300 text-zinc-300"}`} /> 
                    {r}+
                  </button>
                )
              })}
            </div>
          </div>

        </aside>

        {/* === MAIN CONTENT (RIGHT) === */}
        <main className="flex-1">
          
          {/* Header Row */}
          <div className="flex flex-col md:flex-row md:items-start justify-between gap-4 mb-8 border-b border-zinc-100 pb-6">
            <div>
              <h1 className="text-3xl font-bold tracking-tight mb-1">Eksplor Kafe</h1>
              <p className="text-zinc-500 text-sm">Menemukan <strong className="text-black">{filteredCafes.length}</strong> tempat yang cocok buat lo.</p>
            </div>

            <div className="flex items-center gap-4">
              {/* View Mode Toggle */}
              <div className="flex bg-zinc-100 p-1 rounded-xl">
                <button 
                  onClick={() => setViewMode("grid")}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-bold transition-colors ${viewMode === "grid" ? "bg-white shadow-sm text-black" : "text-zinc-500 hover:text-black"}`}
                >
                  <LayoutGrid className="w-4 h-4" /> Grid
                </button>
                <button 
                  onClick={() => setViewMode("maps")}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-bold transition-colors ${viewMode === "maps" ? "bg-white shadow-sm text-black" : "text-zinc-500 hover:text-black"}`}
                >
                  <MapIcon className="w-4 h-4" /> Maps
                </button>
              </div>

              {/* Search Box */}
              <div className="relative w-64 hidden sm:block">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
                <Input 
                  placeholder="Cari nama kafe..." 
                  className="pl-9 h-11 bg-zinc-50 border-zinc-200 rounded-xl focus-visible:ring-amber-500"
                  value={searchName}
                  onChange={(e) => setSearchName(e.target.value)}
                />
              </div>
            </div>
          </div>

          {/* Loading State */}
          {isLoading ? (
            <div className="flex flex-col items-center justify-center py-32 text-zinc-500">
              <Coffee className="w-10 h-10 animate-bounce mb-4 text-amber-500" />
              <p className="font-medium">Memuat kafe terbaik...</p>
            </div>
          ) : (
            /* Grid Kafe (Sesuai Screenshot) */
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredCafes.map((cafe) => (
                <Link href={`/cafe/${cafe.id}`} key={cafe.id}>
                  <Card className="rounded-[1.5rem] overflow-hidden border border-zinc-100 shadow-sm hover:shadow-lg hover:border-zinc-200 transition-all duration-300 group cursor-pointer bg-white h-full flex flex-col">
                    
                    {/* Top Half: Image */}
                    <div className="relative h-48 w-full shrink-0">
                      <img 
                        src={cafe.imageUrl || "https://images.unsplash.com/photo-1554118811-1e0d58224f24?q=80&w=800&auto=format&fit=crop"} 
                        alt={cafe.name}
                        className="w-full h-full object-cover"
                      />
                      {/* Gradient Overlay for Text Visibility */}
                      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
                      
                      {/* Match Score Badge (Top Left) */}
                      {cafe.match_score > 0 && (
                        <div className="absolute top-3 left-3 bg-green-500/90 backdrop-blur-md border border-green-400/50 px-2.5 py-1 rounded-full flex items-center gap-1.5 shadow-sm">
                          <span className="text-xs font-bold text-white">{cafe.match_score}% Match</span>
                        </div>
                      )}
                      
                      {/* Rating Badge (Top Right) */}
                      <div className="absolute top-3 right-3 bg-black/70 backdrop-blur-md px-2.5 py-1 rounded-full flex items-center gap-1.5">
                        <Star className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />
                        <span className="text-xs font-bold text-white">{cafe.rating || "New"}</span>
                      </div>

                      {/* Cafe Name & Location (Bottom Left) */}
                      <div className="absolute bottom-4 left-4 right-4">
                        <h3 className="text-xl font-bold text-white leading-tight mb-1">{cafe.name}</h3>
                        <p className="text-zinc-300 text-xs flex items-center">
                          <MapPin className="w-3 h-3 mr-1 opacity-70 shrink-0" /> {cafe.location || "Jakarta Selatan"}
                        </p>
                      </div>
                    </div>

                    {/* Bottom Half: Info */}
                    <div className="p-5 flex flex-col flex-1">
                      
                      {/* Facilities / Vibes Pills */}
                      <div className="flex flex-wrap gap-2 mb-4">
                        {(cafe.facilities || [{name: "Wi-Fi Ngebut"}, {name: "Banyak Colokan"}]).slice(0, 3).map((fac: any, idx: number) => (
                          <Badge key={idx} variant="secondary" className="bg-zinc-100 text-zinc-600 hover:bg-zinc-200 border-none px-2 py-0.5 font-semibold text-[10px] md:text-xs">
                            <Sparkles className="w-3 h-3 mr-1 inline-block opacity-50" />
                            {fac.name || fac}
                          </Badge>
                        ))}
                      </div>

                      {/* AI Summary Box */}
                      <div className="mt-auto bg-[#F9F5FF] p-4 rounded-[1rem] flex gap-2">
                        <Sparkles className="w-4 h-4 text-purple-500 shrink-0 mt-0.5" />
                        <p className="text-sm italic text-[#6941C6] font-medium leading-relaxed">
                          "{cafe.ai_summary || "Spot WFC andalan, kopi enak, playlist chill. Kalau sore agak rame jadi dateng pagian biar dapet colokan."}"
                        </p>
                      </div>

                    </div>
                  </Card>
                </Link>
              ))}
            </div>
          )}

        </main>
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