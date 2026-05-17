import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { MapPin, Star, Sparkles, Wifi, Zap, Coffee, Camera, Wind, Sun, ShoppingBag } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { Cafe } from "../types";

// Helper to render lucide icon dynamically based on string
const getIcon = (name?: string) => {
  switch (name) {
    case 'wifi': return <Wifi className="w-3 h-3 mr-1" />;
    case 'zap': return <Zap className="w-3 h-3 mr-1" />;
    case 'coffee': return <Coffee className="w-3 h-3 mr-1" />;
    case 'camera': return <Camera className="w-3 h-3 mr-1" />;
    case 'wind': return <Wind className="w-3 h-3 mr-1" />;
    case 'sun': return <Sun className="w-3 h-3 mr-1" />;
    case 'shopping-bag': return <ShoppingBag className="w-3 h-3 mr-1" />;
    default: return <Sparkles className="w-3 h-3 mr-1" />;
  }
};

export function CafeCard({ cafe }: { cafe: Cafe }) {
  return (
    <Link href={`/cafe/${cafe.id}`} className="block h-full">
      <Card className="overflow-hidden group cursor-pointer border-border/50 hover:border-amber-500/50 transition-all hover:shadow-xl hover:-translate-y-1 duration-300 h-full flex flex-col">
        <div className="h-56 bg-zinc-200 relative overflow-hidden flex-shrink-0">
          <Image 
            src={cafe.imageUrl} 
            alt={cafe.name}
            fill
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            className="object-cover group-hover:scale-105 transition-transform duration-500"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent z-10" />
          
          <Badge className="absolute top-3 right-3 z-20 bg-black/60 backdrop-blur-md hover:bg-black/80 text-white border-none shadow-sm">
            <Star className="w-3 h-3 text-amber-400 mr-1 fill-amber-400" /> {cafe.rating}
          </Badge>

          {(cafe as any).is_full && (
            <Badge className="absolute top-3 left-3 z-20 bg-red-600 hover:bg-red-700 text-white border-none shadow-sm font-bold tracking-wider text-[10px]">
              PENUH
            </Badge>
          )}
          
          <div className="absolute bottom-4 left-4 z-20 text-white w-full pr-4">
            <h3 className="font-bold text-xl mb-1 truncate">{cafe.name}</h3>
            <div className="flex items-center text-xs text-zinc-300 font-medium">
              <MapPin className="w-3 h-3 mr-1" /> {cafe.location}
            </div>
          </div>
        </div>

        <CardContent className="p-5 space-y-4 bg-white flex-1 flex flex-col">
          {/* Facilities */}
          <div className="flex flex-wrap gap-2 text-xs text-zinc-600 font-medium">
            {cafe.facilities.map((fac) => (
              <span key={fac.id} className="flex items-center bg-zinc-100 px-2.5 py-1 rounded-md border border-zinc-200">
                {getIcon(fac.icon)} {fac.name}
              </span>
            ))}
          </div>
          
          {/* AI Summary */}
          <div className="p-3 bg-purple-50 rounded-xl border border-purple-100 mt-auto">
            <p className="text-sm text-purple-900/80 leading-relaxed flex gap-2">
              <Sparkles className="w-4 h-4 text-purple-500 shrink-0 mt-0.5" />
              <span className="italic">"{cafe.ai_summary}"</span>
            </p>
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}
