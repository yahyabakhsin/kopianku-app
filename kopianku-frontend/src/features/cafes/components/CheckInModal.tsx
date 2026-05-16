"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { MapPin, Star, X } from "lucide-react";
import { apiClient } from "@/lib/axios";

export function CheckInModal({ cafeId, cafeName }: { cafeId: string, cafeName: string }) {
  const [isOpen, setIsOpen] = useState(false);
  const [mode, setMode] = useState<"choose" | "review">("choose");
  const [rating, setRating] = useState(5);
  const [reviewText, setReviewText] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleCheckInOnly = async () => {
    setIsLoading(true);
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        alert("Login dulu bang buat check-in!");
        return;
      }
      await apiClient.post(`/cafes/${cafeId}/checkin`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
      alert(`Sukses check-in di ${cafeName}!`);
      setIsOpen(false);
    } catch (error) {
      console.error(error);
      alert("Gagal check-in. Coba lagi.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleCheckInAndReview = async () => {
    if (!reviewText.trim()) {
      alert("Isi ulasannya dulu dong bang!");
      return;
    }
    
    setIsLoading(true);
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        alert("Login dulu bang buat check-in!");
        return;
      }
      
      // 1. Check-in
      await apiClient.post(`/cafes/${cafeId}/checkin`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      // 2. Review
      await apiClient.post(`/cafes/${cafeId}/reviews`, {
        rating,
        text: reviewText
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      alert(`Sukses check-in & review di ${cafeName}! Rating kafe akan segera diupdate.`);
      setIsOpen(false);
    } catch (error) {
      console.error(error);
      alert("Gagal check-in & review. Coba lagi.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <Button 
        onClick={() => {
            setIsOpen(true);
            setMode("choose");
        }}
        className="w-full bg-black hover:bg-zinc-800 text-white rounded-full h-12 mb-3"
      >
        <MapPin className="w-4 h-4 mr-2" /> Check-In Sekarang
      </Button>

      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white rounded-[2rem] w-full max-w-md p-6 shadow-2xl relative animate-in zoom-in-95 duration-200">
            <Button 
              variant="ghost" 
              size="icon" 
              onClick={() => setIsOpen(false)}
              className="absolute right-4 top-4 text-zinc-400 hover:text-black hover:bg-zinc-100 rounded-full"
            >
              <X className="w-5 h-5" />
            </Button>
            
            <div className="mb-6">
              <div className="w-12 h-12 bg-amber-100 text-amber-600 flex items-center justify-center rounded-2xl mb-4">
                <MapPin className="w-6 h-6" />
              </div>
              <h2 className="text-2xl font-bold mb-1">Check-in di {cafeName}</h2>
              <p className="text-sm text-zinc-500">Kasih tau yang lain kalau lo lagi di sini.</p>
            </div>

            {mode === "choose" ? (
              <div className="space-y-3">
                <Button 
                  variant="outline"
                  onClick={handleCheckInOnly}
                  disabled={isLoading}
                  className="w-full h-14 rounded-2xl border-2 border-zinc-200 font-bold hover:bg-zinc-50 justify-start px-6"
                >
                  📍 Check-in Saja
                </Button>
                <Button 
                  onClick={() => setMode("review")}
                  className="w-full h-14 rounded-2xl bg-amber-500 hover:bg-amber-600 text-white font-bold justify-start px-6"
                >
                  ⭐ Check-in + Review Kafe
                </Button>
              </div>
            ) : (
              <div className="space-y-4">
                <div>
                  <label className="text-sm font-semibold text-zinc-700 block mb-2">Rating</label>
                  <div className="flex gap-2">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        key={star}
                        onClick={() => setRating(star)}
                        className={`w-10 h-10 rounded-full flex items-center justify-center transition-colors ${
                          rating >= star ? 'bg-amber-100' : 'bg-zinc-100 hover:bg-zinc-200'
                        }`}
                      >
                        <Star className={`w-5 h-5 ${rating >= star ? 'text-amber-500 fill-amber-500' : 'text-zinc-400'}`} />
                      </button>
                    ))}
                  </div>
                </div>
                
                <div>
                  <label className="text-sm font-semibold text-zinc-700 block mb-2">Ulasan</label>
                  <textarea
                    className="w-full p-4 rounded-2xl bg-zinc-50 border border-zinc-200 min-h-[120px] focus:outline-none focus:ring-2 focus:ring-amber-500"
                    placeholder="Gimana kafenya bang? Cozy nggak? Kopinya enak?"
                    value={reviewText}
                    onChange={(e) => setReviewText(e.target.value)}
                  />
                </div>

                <div className="flex gap-3 pt-2">
                  <Button 
                    variant="outline" 
                    onClick={() => setMode("choose")}
                    className="flex-1 rounded-xl h-12 border-zinc-200"
                  >
                    Kembali
                  </Button>
                  <Button 
                    onClick={handleCheckInAndReview}
                    disabled={isLoading || !reviewText.trim()}
                    className="flex-1 rounded-xl h-12 bg-black hover:bg-zinc-800 text-white"
                  >
                    {isLoading ? "Menyimpan..." : "Submit Review"}
                  </Button>
                </div>
              </div>
            )}
            
          </div>
        </div>
      )}
    </>
  );
}
