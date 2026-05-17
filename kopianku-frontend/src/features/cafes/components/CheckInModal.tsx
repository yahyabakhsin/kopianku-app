"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { MapPin, Star } from "lucide-react";
import { CreatePostModal } from "@/features/community/components/CreatePostModal";
import { apiClient } from "@/lib/axios";

export function CheckInModal({ cafeId, cafeName }: { cafeId: string, cafeName: string }) {
  const [isOpen, setIsOpen] = useState(false);
  const [hasReviewed, setHasReviewed] = useState(false);
  const [loadingCheckin, setLoadingCheckin] = useState(false);
  const [existingReview, setExistingReview] = useState<any>(null);

  useEffect(() => {
    const fetchReviewStatus = async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token) return;
        const res = await apiClient.get(`/cafes/${cafeId}/my-review`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setHasReviewed(true);
        setExistingReview(res.data);
      } catch (e) {
        setHasReviewed(false);
      }
    };
    fetchReviewStatus();
    
    // Listen for custom event when review is submitted to update status
    const handlePostCreated = () => fetchReviewStatus();
    window.addEventListener('postCreated', handlePostCreated);
    return () => window.removeEventListener('postCreated', handlePostCreated);
  }, [cafeId]);

  const handleCheckInOnly = async () => {
    try {
      setLoadingCheckin(true);
      const token = localStorage.getItem("token");
      if (!token) {
        alert("Login dulu bang buat check-in!");
        return;
      }
      await apiClient.post(`/cafes/${cafeId}/checkin`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
      alert("Berhasil Check-In!");
      window.dispatchEvent(new Event('postCreated'));
    } catch (e) {
      console.error(e);
      alert("Gagal Check-In");
    } finally {
      setLoadingCheckin(false);
    }
  };

  return (
    <>
      <div className="flex flex-col gap-3 mb-3">
        <Button 
          onClick={handleCheckInOnly}
          disabled={loadingCheckin}
          className="w-full bg-black hover:bg-zinc-800 text-white rounded-full h-12"
        >
          <MapPin className="w-4 h-4 mr-2" /> {loadingCheckin ? "Proses..." : "Check-In Saja"}
        </Button>
        <Button 
          variant="outline"
          onClick={() => setIsOpen(true)}
          className="w-full border-zinc-200 hover:border-amber-500 hover:bg-amber-50 text-amber-700 rounded-full h-12 transition-colors font-bold"
        >
          <Star className="w-4 h-4 mr-2" /> {hasReviewed ? "Edit Review" : "Tulis Review"}
        </Button>
      </div>

      <CreatePostModal 
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        initialCafeId={cafeId}
        existingReview={existingReview}
      />
    </>
  );
}
