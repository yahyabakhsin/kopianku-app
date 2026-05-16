"use client";

import { useState } from "react";
import { Plus, X, MapPin, Star, Camera, Upload, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export function PlusWidget() {
  const [isOpen, setIsOpen] = useState(false);
  const [tab, setTab] = useState<"checkin" | "review">("checkin");
  const [rating, setRating] = useState(0);
  const [isSuccess, setIsSuccess] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSuccess(true);
    setTimeout(() => {
      setIsSuccess(false);
      setIsOpen(false);
    }, 2000);
  };

  if (!isOpen) {
    return (
      <Button 
        onClick={() => setIsOpen(true)}
        className="fixed bottom-6 left-1/2 -translate-x-1/2 md:left-auto md:right-24 md:translate-x-0 w-14 h-14 rounded-full bg-amber-500 hover:bg-amber-600 text-white shadow-xl shadow-amber-500/30 z-40 flex items-center justify-center hover:scale-110 transition-all duration-300 border-4 border-white"
      >
        <Plus className="w-6 h-6" />
      </Button>
    );
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-0 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white w-full max-w-lg rounded-[2rem] shadow-2xl relative flex flex-col max-h-[90vh] animate-in zoom-in-95 duration-200">
        
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-zinc-100">
          <h2 className="text-xl font-bold">Buat Aktivitas Baru</h2>
          <Button variant="ghost" size="icon" onClick={() => setIsOpen(false)} className="rounded-full bg-zinc-100 hover:bg-zinc-200 text-zinc-500">
            <X className="w-5 h-5" />
          </Button>
        </div>

        {/* Success State */}
        {isSuccess ? (
          <div className="p-12 flex flex-col items-center justify-center text-center">
            <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mb-6">
              <CheckCircle2 className="w-10 h-10 text-green-600" />
            </div>
            <h3 className="text-2xl font-bold mb-2">Aktivitas Terkirim!</h3>
            <p className="text-zinc-500">Udah masuk ke feed temen-temen lo.</p>
          </div>
        ) : (
          /* Form Content */
          <div className="p-6 overflow-y-auto">
            {/* Custom Tab Selector */}
            <div className="flex bg-zinc-100 p-1.5 rounded-2xl mb-6">
              <button 
                onClick={() => setTab("checkin")}
                className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-bold transition-all ${tab === "checkin" ? "bg-white shadow-sm text-black" : "text-zinc-500 hover:text-black"}`}
              >
                <MapPin className="w-4 h-4" /> Check-in
              </button>
              <button 
                onClick={() => setTab("review")}
                className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-bold transition-all ${tab === "review" ? "bg-white shadow-sm text-black" : "text-zinc-500 hover:text-black"}`}
              >
                <Star className="w-4 h-4" /> Tulis Review
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="space-y-2">
                <label className="text-sm font-semibold text-zinc-700">Pilih Kafe</label>
                <Input 
                  placeholder="Cari nama kafe..." 
                  className="bg-zinc-50 border-zinc-200 h-12 rounded-xl focus-visible:ring-amber-500"
                  required
                />
              </div>

              {tab === "review" && (
                <>
                  <div className="space-y-2">
                    <label className="text-sm font-semibold text-zinc-700">Rating Lo</label>
                    <div className="flex gap-2">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <button 
                          key={star} 
                          type="button" 
                          onClick={() => setRating(star)}
                          className="p-1 hover:scale-110 transition-transform"
                        >
                          <Star className={`w-8 h-8 ${rating >= star ? 'fill-amber-500 text-amber-500' : 'fill-zinc-200 text-zinc-200'}`} />
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-semibold text-zinc-700">Review</label>
                    <textarea 
                      placeholder="Ceritain vibe-nya, kopinya, atau colokannya..." 
                      className="w-full bg-zinc-50 border border-zinc-200 rounded-xl p-4 min-h-[120px] focus:outline-none focus:ring-2 focus:ring-amber-500 resize-none text-sm"
                      required
                    ></textarea>
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-semibold text-zinc-700">Upload Foto/Video (Opsional)</label>
                    <div className="border-2 border-dashed border-zinc-200 rounded-xl h-24 flex flex-col items-center justify-center text-zinc-500 bg-zinc-50 hover:bg-zinc-100 cursor-pointer transition-colors">
                      <Camera className="w-6 h-6 mb-2" />
                      <span className="text-xs font-medium">Klik untuk upload foto estetik lo</span>
                    </div>
                  </div>
                </>
              )}

              <Button type="submit" className="w-full bg-black hover:bg-zinc-800 text-white rounded-full h-14 font-bold text-lg mt-4">
                {tab === "checkin" ? "Check-in Sekarang" : "Kirim Review"}
              </Button>
            </form>
          </div>
        )}
      </div>
    </div>
  );
}
