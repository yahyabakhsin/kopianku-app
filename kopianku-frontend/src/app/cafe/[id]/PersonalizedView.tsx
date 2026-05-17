"use client";

import { useEffect, useState } from "react";
import axios from "axios";
import { Badge } from "@/components/ui/badge";
import { Sparkles, Target, Wifi, Zap, Coffee, Camera, Wind, Sun, Users } from "lucide-react";

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

export function PersonalizedView({ cafeId, initialFacilities }: { cafeId: string, initialFacilities: any[] }) {
  const [matchScore, setMatchScore] = useState<number>(0);
  const [matchedTags, setMatchedTags] = useState<string[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    const fetchPersonalizedData = async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token) {
          setIsLoaded(true);
          return;
        }
        
        const res = await axios.get(`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api"}/cafes/${cafeId}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        
        setMatchScore(res.data.match_score || 0);
        setMatchedTags(res.data.matched_tags || []);
        setIsLoaded(true);
      } catch (err) {
        console.error(err);
        setIsLoaded(true);
      }
    };
    
    fetchPersonalizedData();
  }, [cafeId]);

  if (!isLoaded) return <div className="animate-pulse h-32 bg-zinc-100 rounded-2xl mb-8"></div>;

  return (
    <>
      {/* Match Score Display */}
      {matchScore > 0 && (
        <section className="bg-gradient-to-r from-green-50 to-emerald-50 border border-green-100 p-6 rounded-[2rem] mb-8 flex items-center justify-between">
          <div>
            <Badge className="bg-green-100 text-green-800 border-none mb-2 font-bold uppercase tracking-wider text-xs flex items-center w-max">
              <Target className="w-3 h-3 mr-1" /> Personalized for You
            </Badge>
            <h2 className="text-xl font-bold text-green-900 mb-1">Kafe ini {matchScore}% cocok sama gaya lo!</h2>
            <p className="text-sm text-green-800/80">Kami mencocokkan fasilitas kafe ini dengan preferensi lo pas onboarding.</p>
          </div>
          <div className="relative w-20 h-20 flex items-center justify-center bg-white rounded-full shadow-sm border-4 border-green-400">
            <span className="text-2xl font-bold text-green-600">{matchScore}%</span>
          </div>
        </section>
      )}

      {/* Fasilitas Tersedia dengan Highlight */}
      <section>
        <h2 className="text-2xl font-bold mb-6">Fasilitas Tersedia</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {initialFacilities.map((fac: any, index: number) => {
            const facName = fac.name || fac;
            const isMatch = matchedTags.some(tag => facName.toLowerCase().includes(tag.toLowerCase()) || tag.toLowerCase().includes(facName.toLowerCase()));
            
            return (
              <div 
                key={index} 
                className={`border rounded-2xl p-4 flex flex-col items-center justify-center text-center transition-all 
                  ${isMatch 
                    ? "border-green-400 bg-green-50 shadow-sm ring-1 ring-green-400" 
                    : "border-zinc-200 bg-zinc-50 hover:border-amber-500"
                  }`
                }
              >
                <div className={isMatch ? "text-green-600" : "text-zinc-600"}>
                  {getIcon(facName)} 
                </div>
                <span className={`text-sm font-semibold ${isMatch ? "text-green-800" : "text-zinc-700"}`}>
                  {facName}
                </span>
                {isMatch && (
                  <Badge className="mt-2 bg-green-500 hover:bg-green-600 text-[10px] text-white border-none py-0">
                    Match!
                  </Badge>
                )}
              </div>
            );
          })}
        </div>
      </section>
    </>
  );
}
