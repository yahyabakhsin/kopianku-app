"use client";

import { useState, useEffect } from "react";
import { ArrowLeft, Coffee, MapPin, Star, Share2 } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

const mockWrappedData = {
  totalCheckins: 142,
  topCafe: "Retawu Deli",
  favoriteVibe: "Aesthetic",
  topReview: "Kopi susu gula arennya juara banget, tempatnya pewe parah buat nugas!",
  topReviewCafe: "Kopi Letek",
  totalReviews: 24,
};

export default function WrappedPage() {
  const [currentSlide, setCurrentSlide] = useState(0);

  const slides = [
    // Slide 1: Intro
    <div key="intro" className="flex flex-col items-center justify-center h-full text-center space-y-6 px-6">
      <div className="w-24 h-24 bg-white/20 rounded-full flex items-center justify-center mb-4">
        <Coffee className="w-12 h-12 text-white" />
      </div>
      <h1 className="text-4xl md:text-6xl font-black text-white tracking-tighter">
        Kopianku<br/>Wrapped 2024
      </h1>
      <p className="text-xl text-white/80 font-medium">
        Tahun ini, lo udah ngopi cukup banyak buat bikin lambung menjerit.
      </p>
    </div>,

    // Slide 2: Total Checkins
    <div key="checkins" className="flex flex-col items-center justify-center h-full text-center space-y-6 px-6">
      <h2 className="text-2xl font-bold text-white/80">Tahun ini, lo udah mampir ke kafe sebanyak...</h2>
      <div className="text-8xl md:text-9xl font-black text-white tracking-tighter drop-shadow-lg">
        {mockWrappedData.totalCheckins}
      </div>
      <h2 className="text-3xl font-bold text-white">Kali!</h2>
      <p className="text-lg text-white/80 mt-4 max-w-sm">
        Gila, itu sebanding sama bayar kosan sebulan kalo ditotalin.
      </p>
    </div>,

    // Slide 3: Top Cafe
    <div key="topcafe" className="flex flex-col items-center justify-center h-full text-center space-y-6 px-6">
      <div className="p-4 bg-white/20 rounded-full mb-4">
        <MapPin className="w-10 h-10 text-white" />
      </div>
      <h2 className="text-2xl font-bold text-white/80">Tempat ngopi favorit lo tahun ini jatuh kepada...</h2>
      <div className="text-5xl md:text-7xl font-black text-white tracking-tighter leading-tight bg-gradient-to-r from-yellow-300 to-amber-500 text-transparent bg-clip-text">
        {mockWrappedData.topCafe}
      </div>
      <p className="text-lg text-white/80 mt-4 max-w-sm">
        Udah kayak rumah kedua ya bang? Baristanya sampe hafal menu lo.
      </p>
    </div>,

    // Slide 4: Favorite Vibe
    <div key="vibe" className="flex flex-col items-center justify-center h-full text-center space-y-6 px-6">
      <h2 className="text-2xl font-bold text-white/80">Vibe kafe yang paling sering lo cari adalah...</h2>
      <div className="text-6xl md:text-8xl font-black text-white tracking-tighter drop-shadow-lg">
        "{mockWrappedData.favoriteVibe}"
      </div>
      <p className="text-lg text-white/80 mt-4 max-w-sm">
        Si paling cari colokan dan pencahayaan bagus buat nugas (atau bengong).
      </p>
    </div>,

    // Slide 5: Top Review
    <div key="review" className="flex flex-col items-center justify-center h-full text-center space-y-6 px-6">
      <div className="p-4 bg-white/20 rounded-full mb-4">
        <Star className="w-10 h-10 text-white" />
      </div>
      <h2 className="text-2xl font-bold text-white/80">Lo juga rajin ngasih review. Ini bacotan terbaik lo di {mockWrappedData.topReviewCafe}:</h2>
      <div className="bg-white/10 backdrop-blur-md p-6 rounded-[2rem] border border-white/20 max-w-md">
        <p className="text-xl md:text-2xl font-semibold text-white italic">
          "{mockWrappedData.topReview}"
        </p>
      </div>
      <p className="text-lg text-white/80 mt-4 max-w-sm">
        Total ada {mockWrappedData.totalReviews} review yang lo tulis. Food vlogger abis.
      </p>
    </div>,

    // Slide 6: Outro
    <div key="outro" className="flex flex-col items-center justify-center h-full text-center space-y-8 px-6">
      <h1 className="text-4xl md:text-5xl font-black text-white tracking-tighter">
        Sampai Jumpa di 2025!
      </h1>
      <p className="text-xl text-white/80 font-medium max-w-md">
        Terus eksplorasi rasa kopi baru, jangan lupa minum air putih, dan jaga lambung lo.
      </p>
      <div className="flex gap-4">
        <Button className="rounded-full bg-white text-black hover:bg-zinc-200 font-bold px-8">
          <Share2 className="w-4 h-4 mr-2" /> Share Wrapped
        </Button>
      </div>
    </div>
  ];

  return (
    <div className="fixed inset-0 z-50 flex flex-col bg-zinc-950 overflow-hidden">
      {/* Dynamic Background */}
      <div className="absolute inset-0 z-0">
        <div className={`absolute inset-0 transition-colors duration-1000 ${
          currentSlide === 0 ? 'bg-indigo-600' :
          currentSlide === 1 ? 'bg-rose-600' :
          currentSlide === 2 ? 'bg-amber-600' :
          currentSlide === 3 ? 'bg-emerald-600' :
          currentSlide === 4 ? 'bg-purple-600' :
          'bg-zinc-900'
        }`}></div>
        <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 mix-blend-overlay"></div>
      </div>

      {/* Progress Bars */}
      <div className="relative z-10 flex gap-2 p-4 pt-8">
        {slides.map((_, idx) => (
          <div key={idx} className="h-1.5 flex-1 bg-white/20 rounded-full overflow-hidden">
            <div 
              className={`h-full bg-white transition-all duration-300 ${
                idx < currentSlide ? 'w-full' : idx === currentSlide ? 'w-full animate-progress' : 'w-0'
              }`}
            ></div>
          </div>
        ))}
      </div>

      {/* Close Button */}
      <div className="relative z-10 px-4">
        <Link href="/social">
          <Button variant="ghost" size="icon" className="text-white hover:bg-white/20 rounded-full">
            <ArrowLeft className="w-6 h-6" />
          </Button>
        </Link>
      </div>

      {/* Content */}
      <div 
        className="relative z-10 flex-1 flex items-center justify-center cursor-pointer"
        onClick={() => {
          if (currentSlide < slides.length - 1) {
            setCurrentSlide(prev => prev + 1);
          }
        }}
      >
        <div className="w-full max-w-2xl mx-auto h-[60vh] md:h-[70vh] flex items-center justify-center animate-in fade-in zoom-in duration-500 key={currentSlide}">
          {slides[currentSlide]}
        </div>
      </div>
      
      <div className="relative z-10 p-8 text-center text-white/50 text-sm">
        Tap layar untuk lanjut
      </div>
      
      <style dangerouslySetInnerHTML={{__html: `
        @keyframes progress {
          from { width: 0%; }
          to { width: 100%; }
        }
        .animate-progress {
          animation: progress 5s linear forwards;
        }
      `}} />
    </div>
  );
}
