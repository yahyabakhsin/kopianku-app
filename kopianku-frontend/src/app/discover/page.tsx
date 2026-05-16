"use client";

import { useState, useMemo, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Search, MapPin, Star, X, Coffee, Loader2 } from "lucide-react";
// Hapus import dummyCafes, ganti dengan apiClient dan tipe Cafe
import { apiClient } from "@/lib/axios";
import { CafeCard } from "@/features/cafes/components/CafeCard";
import { Cafe } from "@/features/cafes/types";
import axios from "axios";

// Pre-defined filter options
const VIBE_OPTIONS = ["WFC", "Fokus", "Tenang", "Outdoor", "Estetik", "Asri", "Nongkrong"];
const FACILITY_OPTIONS = ["Wi-Fi Ngebut", "Banyak Colokan", "Smoking Area", "Grab & Go", "Estetik", "Outdoor Luas"];
const RATING_OPTIONS = [3, 4, 4.5];

export default function DiscoverPage() {
  // State untuk nyimpen data dari backend
  const [allCafes, setAllCafes] = useState<Cafe[]>([]);
  const [loading, setLoading] = useState(true);

  // Filter States
  const [searchQuery, setSearchQuery] = useState("");
  const [locationQuery, setLocationQuery] = useState("");
  const [selectedVibes, setSelectedVibes] = useState<string[]>([]);
  const [selectedFacilities, setSelectedFacilities] = useState<string[]>([]);
  const [minRating, setMinRating] = useState<number | null>(null);
  const [viewMode, setViewMode] = useState<"grid" | "map">("grid");

  // Fetch API ketika halaman pertama kali dimuat
  useEffect(() => {
    const fetchCafes = async () => {
      try {
        const response = await apiClient.get('/cafes');
        setAllCafes(response.data);
      } catch (error) {
        console.error("Gagal mengambil data kafe:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchCafes();
  }, []);

  // Toggle helpers
  const toggleVibe = (vibe: string) => {
    setSelectedVibes((prev) => 
      prev.includes(vibe) ? prev.filter((v) => v !== vibe) : [...prev, vibe]
    );
  };

  const toggleFacility = (facility: string) => {
    setSelectedFacilities((prev) => 
      prev.includes(facility) ? prev.filter((f) => f !== facility) : [...prev, facility]
    );
  };

  // Filter Logic (sekarang ngambil dari state allCafes, bukan dummyCafes)
  const filteredCafes = useMemo(() => {
    return allCafes.filter((cafe) => {
      // 1. Search Query (Name)
      if (searchQuery && !cafe.name.toLowerCase().includes(searchQuery.toLowerCase())) return false;
      
      // 2. Location Query
      if (locationQuery && !cafe.location.toLowerCase().includes(locationQuery.toLowerCase())) return false;
      
      // 3. Minimum Rating
      if (minRating && cafe.rating < minRating) return false;
      
      // 4. Vibes (Must include at least one if selected)
      if (selectedVibes.length > 0) {
        const hasVibe = selectedVibes.some(v => cafe.vibes.includes(v));
        if (!hasVibe) return false;
      }
      
      // 5. Facilities (Must include ALL selected facilities)
      if (selectedFacilities.length > 0) {
        const cafeFacilityNames = cafe.facilities.map(f => f.name);
        const hasAllFacilities = selectedFacilities.every(f => cafeFacilityNames.includes(f));
        if (!hasAllFacilities) return false;
      }

      return true;
    });
  }, [searchQuery, locationQuery, selectedVibes, selectedFacilities, minRating, allCafes]);

  return (
    <div className="container mx-auto max-w-screen-2xl px-4 md:px-8 py-8 flex flex-col md:flex-row gap-8">
      
      {/* Sidebar Filter */}
      <aside className="w-full md:w-72 flex-shrink-0 space-y-8">
        <div className="sticky top-24">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold tracking-tight">Filter</h2>
            {(selectedVibes.length > 0 || selectedFacilities.length > 0 || minRating || locationQuery) && (
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={() => {
                  setSelectedVibes([]);
                  setSelectedFacilities([]);
                  setMinRating(null);
                  setLocationQuery("");
                }}
                className="text-xs text-red-500 hover:text-red-600 hover:bg-red-50 h-8 px-2"
              >
                Reset Semua
              </Button>
            )}
          </div>
          
          {/* Lokasi */}
          <div className="space-y-3 mb-8">
            <h3 className="font-semibold text-sm uppercase text-zinc-500 tracking-wider">Lokasi</h3>
            <div className="relative">
              <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400 w-4 h-4" />
              <Input 
                placeholder="Cari area..." 
                value={locationQuery}
                onChange={(e) => setLocationQuery(e.target.value)}
                className="pl-9 bg-zinc-50 border-zinc-200" 
              />
            </div>
          </div>

          {/* Vibes / Suasana */}
          <div className="space-y-3 mb-8">
            <h3 className="font-semibold text-sm uppercase text-zinc-500 tracking-wider">Vibe Suasana</h3>
            <div className="flex flex-wrap gap-2">
              {VIBE_OPTIONS.map((vibe) => {
                const isSelected = selectedVibes.includes(vibe);
                return (
                  <Badge 
                    key={vibe}
                    onClick={() => toggleVibe(vibe)}
                    variant={isSelected ? "default" : "outline"}
                    className={`cursor-pointer py-1.5 px-3 text-sm font-normal transition-all ${
                      isSelected ? "bg-black text-white hover:bg-zinc-800" : "hover:bg-amber-100 hover:text-amber-800 border-zinc-200 text-zinc-600"
                    }`}
                  >
                    {vibe}
                  </Badge>
                );
              })}
            </div>
          </div>

          {/* Fasilitas */}
          <div className="space-y-3 mb-8">
            <h3 className="font-semibold text-sm uppercase text-zinc-500 tracking-wider">Fasilitas Utama</h3>
            <div className="space-y-3">
              {FACILITY_OPTIONS.map((fasilitas) => {
                const isSelected = selectedFacilities.includes(fasilitas);
                return (
                  <div 
                    key={fasilitas} 
                    onClick={() => toggleFacility(fasilitas)}
                    className="flex items-center gap-3 cursor-pointer group"
                  >
                    <div className={`w-5 h-5 rounded border flex items-center justify-center transition-colors ${
                      isSelected ? "bg-amber-500 border-amber-500" : "border-zinc-300 group-hover:border-amber-500"
                    }`}>
                      {isSelected && <X className="w-3 h-3 text-white" style={{ clipPath: 'polygon(14% 44%, 0 65%, 50% 100%, 100% 16%, 80% 0%, 43% 62%)' }} />}
                    </div>
                    <span className={`text-sm ${isSelected ? "text-black font-semibold" : "text-zinc-600"}`}>
                      {fasilitas}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Minimal Rating */}
          <div className="space-y-3 mb-8">
            <h3 className="font-semibold text-sm uppercase text-zinc-500 tracking-wider">Minimal Rating</h3>
            <div className="flex gap-2">
              {RATING_OPTIONS.map((rating) => {
                const isSelected = minRating === rating;
                return (
                  <Badge 
                    key={rating} 
                    onClick={() => setMinRating(isSelected ? null : rating)}
                    variant={isSelected ? "default" : "outline"}
                    className={`cursor-pointer flex items-center gap-1 py-1.5 px-3 transition-colors ${
                      isSelected ? "bg-amber-500 text-white hover:bg-amber-600 border-transparent" : "border-zinc-200 text-zinc-600 hover:bg-zinc-100"
                    }`}
                  >
                    <Star className={`w-3 h-3 ${isSelected ? "fill-white text-white" : "fill-amber-400 text-amber-400"}`} /> {rating}+
                  </Badge>
                );
              })}
            </div>
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Eksplor Kafe</h1>
            <p className="text-zinc-500 mt-1">
              Menemukan <span className="font-bold text-black">{filteredCafes.length}</span> tempat yang cocok buat lo.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-center gap-4 w-full sm:w-auto">
            {/* View Toggle */}
            <div className="flex items-center bg-zinc-100 p-1 rounded-xl w-full sm:w-auto self-start">
              <button 
                onClick={() => setViewMode("grid")}
                className={`flex-1 sm:flex-none flex items-center justify-center gap-2 px-4 py-2 rounded-lg text-sm font-bold transition-colors ${viewMode === "grid" ? "bg-white shadow-sm text-black" : "text-zinc-500 hover:text-black"}`}
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="7" height="7" x="3" y="3" rx="1"/><rect width="7" height="7" x="14" y="3" rx="1"/><rect width="7" height="7" x="14" y="14" rx="1"/><rect width="7" height="7" x="3" y="14" rx="1"/></svg>
                Grid
              </button>
              <button 
                onClick={() => setViewMode("map")}
                className={`flex-1 sm:flex-none flex items-center justify-center gap-2 px-4 py-2 rounded-lg text-sm font-bold transition-colors ${viewMode === "map" ? "bg-white shadow-sm text-black" : "text-zinc-500 hover:text-black"}`}
              >
                <MapPin className="w-4 h-4" /> Maps
              </button>
            </div>

            <div className="relative w-full sm:w-auto">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400 w-4 h-4" />
              <Input 
                placeholder="Cari nama kafe..." 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9 w-full sm:w-64 bg-zinc-50 border-zinc-200 focus-visible:ring-amber-500 rounded-xl" 
              />
            </div>
          </div>
        </div>

        {/* Results Rendering */}
        {loading ? (
          <div className="flex flex-col items-center justify-center py-32 text-center text-zinc-500">
            <Loader2 className="w-10 h-10 animate-spin mb-4 text-amber-500" />
            <p>Memuat data kafe dari server...</p>
          </div>
        ) : filteredCafes.length > 0 ? (
          viewMode === "grid" ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6 animate-in fade-in duration-500">
              {filteredCafes.map((cafe) => (
                <CafeCard key={cafe.id} cafe={cafe} />
              ))}
            </div>
          ) : (
            <div className="relative w-full h-[600px] bg-zinc-200 rounded-[2rem] overflow-hidden border border-zinc-200 shadow-inner animate-in fade-in duration-500">
              {/* Dummy Map Image Background */}
              <div className="absolute inset-0 opacity-40 mix-blend-multiply bg-[url('https://www.transparenttextures.com/patterns/cartographer.png')]"></div>
              <img src="https://images.unsplash.com/photo-1524661135-423995f22d0b?auto=format&fit=crop&q=80&w=1200" alt="Map" className="w-full h-full object-cover opacity-50" />
              
              {/* Scatter Pins for Filtered Cafes */}
              <div className="absolute inset-0">
                {filteredCafes.map((cafe, idx) => {
                  const top = Math.max(10, Math.min(80, 20 + (idx * 25) % 70));
                  const left = Math.max(10, Math.min(80, 15 + (idx * 30) % 75));
                  
                  return (
                    <div key={cafe.id} className="absolute group cursor-pointer" style={{ top: `${top}%`, left: `${left}%` }}>
                      <div className="relative flex flex-col items-center">
                        {/* Pin Info Popup (Hover) */}
                        <div className="absolute bottom-full mb-2 opacity-0 group-hover:opacity-100 transition-all transform translate-y-2 group-hover:translate-y-0 w-48 bg-white rounded-xl shadow-xl p-2 z-10 border border-zinc-100 pointer-events-none">
                          <img src={cafe.imageUrl} alt={cafe.name} className="w-full h-20 object-cover rounded-lg mb-2" />
                          <p className="font-bold text-xs truncate">{cafe.name}</p>
                          <p className="text-[10px] text-zinc-500 truncate flex items-center gap-1 mt-0.5"><Star className="w-2.5 h-2.5 fill-amber-500 text-amber-500"/> {cafe.rating}</p>
                        </div>
                        
                        {/* The Pin */}
                        <div className="w-10 h-10 bg-black text-white rounded-full flex items-center justify-center shadow-lg border-2 border-white hover:bg-amber-500 hover:scale-110 transition-transform">
                          <Coffee className="w-5 h-5" />
                        </div>
                        <div className="w-2 h-2 bg-black/20 rounded-full mt-1 blur-sm"></div>
                      </div>
                    </div>
                  );
                })}
              </div>
              
              <button className="absolute bottom-6 right-6 w-12 h-12 bg-white rounded-full shadow-lg border border-zinc-100 flex items-center justify-center hover:bg-zinc-50 transition-colors z-20">
                <MapPin className="w-5 h-5 text-black" />
              </button>
            </div>
          )
        ) : (
          <div className="flex flex-col items-center justify-center py-32 text-center bg-zinc-50 rounded-3xl border border-zinc-100 border-dashed">
            <div className="w-16 h-16 bg-zinc-200 rounded-full flex items-center justify-center mb-4">
              <Search className="w-8 h-8 text-zinc-400" />
            </div>
            <h3 className="text-xl font-bold mb-2">Yah, kafenya nggak ketemu</h3>
            <p className="text-zinc-500 max-w-sm mb-6">
              Coba kurangi filter fasilitas atau ganti vibe suasananya biar ketemu lebih banyak pilihan.
            </p>
            <Button onClick={() => {
              setSelectedVibes([]);
              setSelectedFacilities([]);
              setMinRating(null);
              setSearchQuery("");
              setLocationQuery("");
            }} className="bg-black text-white hover:bg-zinc-800 rounded-full">
              Hapus Semua Filter
            </Button>
          </div>
        )}
      </main>

    </div>
  );
}