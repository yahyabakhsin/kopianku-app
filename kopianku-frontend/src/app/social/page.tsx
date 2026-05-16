"use client";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { MapPin, Heart, MessageCircle, Share2, Star, TrendingUp, Users } from "lucide-react";
import Image from "next/image";

const feedPosts = [
  {
    id: "p1",
    user: { name: "Nadia Kusuma", persona: "WFC Warrior", avatar: "N" },
    time: "2 jam yang lalu",
    cafe: { name: "15th Coffee", location: "Kemang" },
    rating: 5,
    content: "Spot WFC favorit baru! Wi-Finya stabil banget (sempet speedtest dapet 50Mbps). Colokan ada di setiap meja deket tembok. Kalau sore vibesnya enak banget buat nge-chill bentar sebelum lanjut nugas.",
    images: [
      "https://images.unsplash.com/photo-1497935586351-b67a49e012bf?auto=format&fit=crop&q=80&w=800"
    ],
    likes: 124,
    comments: 18
  },
  {
    id: "p2",
    user: { name: "Bima Arya", persona: "Chill Seeker", avatar: "B" },
    time: "5 jam yang lalu",
    cafe: { name: "Titik Temu Coffee", location: "Senopati" },
    rating: 4,
    content: "Kopi susunya juara sih. Asik buat nongkrong ramean di outdoor, tapi kalau mau nugas mending dateng pagian biar dapet tempat dalem yang ber-AC.",
    images: [
      "https://images.unsplash.com/photo-1600093463592-8e36ae95ef56?auto=format&fit=crop&q=80&w=400",
      "https://images.unsplash.com/photo-1554118811-1e0d58224f24?auto=format&fit=crop&q=80&w=400"
    ],
    likes: 89,
    comments: 5
  }
];

const trendingCafes = [
  { name: "Kopi Nako Tebet", checkins: 124 },
  { name: "Toko Kopi Tuku Cipete", checkins: 98 },
  { name: "15th Coffee Kemang", checkins: 85 }
];

export default function CommunityPage() {
  return (
    <div className="min-h-screen bg-zinc-50 pt-8 pb-20">
      <div className="container mx-auto max-w-screen-xl px-4 md:px-8">
        
        {/* Header */}
        <div className="mb-10 text-center md:text-left">
          <h1 className="text-3xl md:text-4xl font-bold tracking-tight mb-3">Community Feed</h1>
          <p className="text-zinc-500 text-lg">Liat tempat ngopi yang lagi *hype* atau dicontek temen lo.</p>
        </div>

        <div className="flex flex-col lg:flex-row gap-8">
          
          {/* Left Column: Feed */}
          <div className="flex-1 space-y-6">
            
            {/* Create Post Input (Dummy) */}
            <Card className="rounded-[2rem] border-none shadow-sm overflow-hidden bg-white">
              <CardContent className="p-6">
                <div className="flex gap-4 items-center">
                  <Avatar className="w-12 h-12 border border-zinc-200">
                    <AvatarFallback className="bg-amber-100 text-amber-700 font-bold">Lo</AvatarFallback>
                  </Avatar>
                  <button className="flex-1 bg-zinc-100 hover:bg-zinc-200 text-zinc-500 text-left px-6 py-3.5 rounded-full text-sm font-medium transition-colors">
                    Lagi ngopi di mana hari ini? Bagi *review* lo...
                  </button>
                </div>
              </CardContent>
            </Card>

            {/* Posts */}
            {feedPosts.map((post) => (
              <Card key={post.id} className="rounded-[2rem] border-zinc-100 shadow-sm bg-white overflow-hidden">
                <CardContent className="p-0">
                  {/* Post Header */}
                  <div className="p-6 pb-4">
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-3">
                        <Avatar className="w-10 h-10 border border-zinc-200">
                          <AvatarFallback className="bg-zinc-800 text-white font-bold">{post.user.avatar}</AvatarFallback>
                        </Avatar>
                        <div>
                          <div className="flex items-center gap-2">
                            <h3 className="font-bold text-sm">{post.user.name}</h3>
                            <span className="text-xs text-zinc-400">• {post.time}</span>
                          </div>
                          <p className="text-xs font-medium text-amber-600">{post.user.persona}</p>
                        </div>
                      </div>
                      <Button variant="ghost" size="sm" className="text-zinc-400 hover:text-black font-semibold text-xs rounded-full">
                        Follow
                      </Button>
                    </div>

                    {/* Checked in Cafe */}
                    <div className="flex items-center gap-2 text-sm mb-3">
                      <span className="text-zinc-500">Check-in di</span>
                      <Badge variant="secondary" className="bg-purple-50 text-purple-700 hover:bg-purple-100 font-bold flex items-center gap-1 cursor-pointer">
                        <MapPin className="w-3 h-3" /> {post.cafe.name}
                      </Badge>
                      <div className="flex items-center ml-2">
                        {[...Array(5)].map((_, i) => (
                          <Star key={i} className={`w-3 h-3 ${i < post.rating ? 'fill-amber-400 text-amber-400' : 'fill-zinc-200 text-zinc-200'}`} />
                        ))}
                      </div>
                    </div>

                    <p className="text-zinc-700 leading-relaxed text-sm mb-4">
                      {post.content}
                    </p>
                  </div>

                  {/* Images Grid */}
                  {post.images.length > 0 && (
                    <div className={`grid gap-1 px-1 ${post.images.length > 1 ? 'grid-cols-2' : 'grid-cols-1'}`}>
                      {post.images.map((img, idx) => (
                        <div key={idx} className={`relative bg-zinc-100 ${post.images.length === 1 ? 'aspect-video' : 'aspect-square'}`}>
                          <Image src={img} alt="Post image" fill className="object-cover" />
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Actions */}
                  <div className="p-4 flex items-center justify-between border-t border-zinc-50 mt-2">
                    <div className="flex items-center gap-6">
                      <button className="flex items-center gap-2 text-zinc-500 hover:text-red-500 transition-colors group">
                        <Heart className="w-5 h-5 group-hover:fill-red-500" />
                        <span className="text-sm font-medium">{post.likes}</span>
                      </button>
                      <button className="flex items-center gap-2 text-zinc-500 hover:text-blue-500 transition-colors">
                        <MessageCircle className="w-5 h-5" />
                        <span className="text-sm font-medium">{post.comments}</span>
                      </button>
                    </div>
                    <button className="text-zinc-400 hover:text-black transition-colors">
                      <Share2 className="w-5 h-5" />
                    </button>
                  </div>
                </CardContent>
              </Card>
            ))}

          </div>

          {/* Right Column: Sidebar */}
          <div className="w-full lg:w-80 space-y-6">
            
            {/* Trending Cafes */}
            <Card className="rounded-[2rem] border-none shadow-sm bg-white">
              <CardContent className="p-6">
                <h3 className="font-bold text-lg mb-4 flex items-center gap-2">
                  <TrendingUp className="w-5 h-5 text-amber-500" /> Trending Minggu Ini
                </h3>
                <div className="space-y-4">
                  {trendingCafes.map((cafe, i) => (
                    <div key={i} className="flex items-center justify-between group cursor-pointer">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-zinc-100 text-zinc-500 flex items-center justify-center text-xs font-bold group-hover:bg-amber-100 group-hover:text-amber-700 transition-colors">
                          {i + 1}
                        </div>
                        <div>
                          <p className="font-bold text-sm group-hover:text-amber-600 transition-colors">{cafe.name}</p>
                          <p className="text-xs text-zinc-500">{cafe.checkins} check-ins</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
                <Button variant="outline" className="w-full mt-6 rounded-full font-semibold">
                  Lihat Top 50
                </Button>
              </CardContent>
            </Card>

            {/* Find Friends */}
            <Card className="rounded-[2rem] border-none shadow-sm bg-gradient-to-br from-purple-500 to-indigo-600 text-white">
              <CardContent className="p-6 text-center">
                <div className="bg-white/20 w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Users className="w-6 h-6 text-white" />
                </div>
                <h3 className="font-bold text-lg mb-2">Temukan Teman Ngopi</h3>
                <p className="text-purple-100 text-sm mb-6">Hubungkan kontak atau Instagram lo buat liat rekomendasi kafe dari temen-temen lo.</p>
                <Button className="w-full bg-white text-purple-700 hover:bg-zinc-100 rounded-full font-bold">
                  Connect
                </Button>
              </CardContent>
            </Card>

          </div>

        </div>
      </div>
    </div>
  );
}
