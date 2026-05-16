"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Heart } from "lucide-react";
import { apiClient } from "@/lib/axios";

export function WishlistButton({ cafeId, initialIsWishlisted = false }: { cafeId: string, initialIsWishlisted?: boolean }) {
  const [isWishlisted, setIsWishlisted] = useState(initialIsWishlisted);
  const [isLoading, setIsLoading] = useState(false);

  const toggleWishlist = async () => {
    try {
      setIsLoading(true);
      const token = localStorage.getItem("token");
      if (!token) {
        alert("Login dulu bang buat simpen ke wishlist!");
        return;
      }
      const res = await apiClient.post(`/users/me/wishlist/${cafeId}`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setIsWishlisted(res.data.is_wishlisted);
    } catch (error) {
      console.error("Gagal update wishlist", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Button 
      variant="ghost" 
      size="icon" 
      onClick={toggleWishlist}
      disabled={isLoading}
      className={`rounded-full hover:bg-red-50 transition-colors ${isWishlisted ? 'text-red-500 bg-red-50' : 'text-zinc-600 hover:text-red-500'}`}
    >
      <Heart className={`w-5 h-5 ${isWishlisted ? 'fill-red-500' : ''}`} />
    </Button>
  );
}
