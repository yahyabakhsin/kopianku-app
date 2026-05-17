"use client";

import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { X, Image as ImageIcon, MapPin, Star, Search } from "lucide-react";
import { apiClient } from "@/lib/axios";

interface CreatePostModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
  initialCafeId?: string; // Buat dipake dari halaman detail cafe
  existingReview?: any;
}

export function CreatePostModal({ isOpen, onClose, onSuccess, initialCafeId, existingReview }: CreatePostModalProps) {
  const [cafes, setCafes] = useState<any[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  
  const [selectedCafe, setSelectedCafe] = useState(initialCafeId || "");
  const [text, setText] = useState("");
  const [rating, setRating] = useState(5);
  const [selectedImages, setSelectedImages] = useState<File[]>([]);
  const [previewUrls, setPreviewUrls] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen) {
      const token = localStorage.getItem("token");
      if (!token) return;
      apiClient.get('/cafes', { headers: { Authorization: `Bearer ${token}` } })
        .then(res => setCafes(res.data))
        .catch(err => console.error("Gagal load cafes", err));
    }
  }, [isOpen]);

  // Update selectedCafe kalau initialCafeId berubah
  useEffect(() => {
    if (initialCafeId) {
      setSelectedCafe(initialCafeId);
    }
  }, [initialCafeId]);

  useEffect(() => {
    if (existingReview) {
      setText(existingReview.text || "");
      setRating(existingReview.rating || 5);
      // Untuk gambar yang sudah ada, ini butuh logic tambahan jika bisa diedit.
      // Sementara kita biarkan form gambar kosong/opsional jika edit.
    } else {
      setText("");
      setRating(5);
    }
  }, [existingReview, isOpen]);

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const filesArray = Array.from(e.target.files);
      setSelectedImages(prev => [...prev, ...filesArray]);
      
      const newPreviewUrls = filesArray.map(file => URL.createObjectURL(file));
      setPreviewUrls(prev => [...prev, ...newPreviewUrls]);
    }
  };

  const removeImage = (index: number) => {
    setSelectedImages(prev => prev.filter((_, i) => i !== index));
    setPreviewUrls(prev => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async () => {
    if (!selectedCafe) {
      alert("Pilih kafe dulu bang!");
      return;
    }

    setIsLoading(true);
    try {
      const token = localStorage.getItem("token");
      if (!token) throw new Error("Not logged in");

      // 1. Check-in (Hanya jika bukan mode edit review dan user mengisi form dari luar detail cafe atau mereka memaksa review baru)
      // Namun sekarang, flow dipisah. CreatePostModal INI HANYA UNTUK REVIEW!
      // Jadi kita hilangkan check-in otomatis di sini, karena check-in sudah ada tombol sendiri.
      
      // 2. Submit / Edit Review
      if (text.trim() || selectedImages.length > 0 || existingReview) {
        
        // Upload gambar dulu kalau ada
        const uploadedImageUrls: string[] = [];
        
        for (const file of selectedImages) {
          const formData = new FormData();
          formData.append("file", file);
          
          const uploadRes = await apiClient.post('/upload_image', formData, {
            headers: { 
              Authorization: `Bearer ${token}`,
              'Content-Type': 'multipart/form-data'
            }
          });
          uploadedImageUrls.push(uploadRes.data.url_gambar);
        }

        // Submit review
        await apiClient.post(`/cafes/${selectedCafe}/reviews`, {
          text: text,
          rating: rating,
          images: uploadedImageUrls
        }, {
          headers: { Authorization: `Bearer ${token}` }
        });
      }

      alert(existingReview ? "Review berhasil di-update!" : "Postingan berhasil di-publish!");
      
      // Reset form
      if (!initialCafeId) setSelectedCafe("");
      if (!existingReview) {
        setText("");
        setRating(5);
      }
      setSelectedImages([]);
      setPreviewUrls([]);
      setSearchQuery("");
      
      if (onSuccess) onSuccess();
      // Dispatch custom event biar timeline tau
      window.dispatchEvent(new Event('postCreated'));
      onClose();
      
    } catch (error: any) {
      console.error(error);
      if (error.response?.status === 401) {
        alert("Sesi abis atau lu belum login bang!");
      } else {
        alert("Gagal mempublikasikan postingan. Coba lagi.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) return null;

  const filteredCafes = cafes.filter(c => c.name.toLowerCase().includes(searchQuery.toLowerCase()));
  const selectedCafeName = cafes.find(c => c.id === selectedCafe)?.name || "";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white rounded-[2rem] w-full max-w-lg p-6 shadow-2xl relative animate-in zoom-in-95 duration-200 flex flex-col max-h-[90vh]">
        <Button 
          variant="ghost" 
          size="icon" 
          onClick={onClose}
          className="absolute right-4 top-4 text-zinc-400 hover:text-black hover:bg-zinc-100 rounded-full z-10"
        >
          <X className="w-5 h-5" />
        </Button>
        
        <h2 className="text-2xl font-bold mb-4 shrink-0">{existingReview ? "Edit Review" : "Tulis Review"}</h2>
        
        <div className="space-y-5 overflow-y-auto pr-2 pb-4">
          
          {/* Cafe Selection (Searchable Dropdown) */}
          <div className="relative">
            <label className="text-sm font-semibold text-zinc-700 block mb-2">Lagi ngopi di mana nih?</label>
            
            {!initialCafeId ? (
              <div className="relative">
                <div 
                  className="flex items-center w-full h-12 px-4 rounded-xl bg-zinc-50 border border-zinc-200 cursor-pointer"
                  onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                >
                  <MapPin className="w-5 h-5 text-zinc-400 mr-2 shrink-0" />
                  <span className={`truncate ${selectedCafeName ? 'text-zinc-900 font-medium' : 'text-zinc-400'}`}>
                    {selectedCafeName || "Pilih Kafe..."}
                  </span>
                </div>

                {isDropdownOpen && (
                  <div className="absolute top-full left-0 right-0 mt-2 bg-white border border-zinc-100 shadow-xl rounded-xl z-20 overflow-hidden flex flex-col">
                    <div className="p-2 border-b border-zinc-100">
                      <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
                        <input 
                          autoFocus
                          type="text" 
                          placeholder="Cari kafe..." 
                          className="w-full h-10 pl-9 pr-4 rounded-lg bg-zinc-50 border-none focus:ring-2 focus:ring-amber-500 outline-none text-sm"
                          value={searchQuery}
                          onChange={(e) => setSearchQuery(e.target.value)}
                        />
                      </div>
                    </div>
                    <ul className="max-h-48 overflow-y-auto">
                      {filteredCafes.length > 0 ? filteredCafes.map(cafe => (
                        <li 
                          key={cafe.id}
                          className="px-4 py-3 hover:bg-zinc-50 cursor-pointer text-sm font-medium border-b border-zinc-50 last:border-0"
                          onClick={() => {
                            setSelectedCafe(cafe.id);
                            setIsDropdownOpen(false);
                            setSearchQuery("");
                          }}
                        >
                          {cafe.name}
                        </li>
                      )) : (
                        <li className="p-4 text-center text-zinc-500 text-sm">Kafe tidak ditemukan.</li>
                      )}
                    </ul>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex items-center w-full h-12 px-4 rounded-xl bg-zinc-100 border border-zinc-200 cursor-not-allowed opacity-80">
                <MapPin className="w-5 h-5 text-amber-500 mr-2 shrink-0" />
                <span className="text-zinc-900 font-bold truncate">
                  {selectedCafeName || "Memuat Kafe..."}
                </span>
              </div>
            )}
          </div>

          {/* Rating */}
          <div>
            <label className="text-sm font-semibold text-zinc-700 block mb-2">Rating (Opsional)</label>
            <div className="flex gap-2">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  onClick={() => setRating(star)}
                  className={`w-10 h-10 rounded-full flex items-center justify-center transition-transform hover:scale-110 ${
                    rating >= star ? 'bg-amber-100' : 'bg-zinc-100'
                  }`}
                >
                  <Star className={`w-5 h-5 ${rating >= star ? 'text-amber-500 fill-amber-500' : 'text-zinc-400'}`} />
                </button>
              ))}
            </div>
          </div>

          {/* Text Content */}
          <div>
            <textarea
              className="w-full p-4 rounded-2xl bg-zinc-50 border border-zinc-200 min-h-[120px] focus:outline-none focus:ring-2 focus:ring-amber-500 resize-none"
              placeholder="Ceritain pengalaman lo (opsional kalo cuma mau check-in)..."
              value={text}
              onChange={(e) => setText(e.target.value)}
            />
          </div>

          {/* Image Preview */}
          {previewUrls.length > 0 && (
            <div className="flex gap-2 overflow-x-auto pb-2">
              {previewUrls.map((url, idx) => (
                <div key={idx} className="relative w-24 h-24 shrink-0 rounded-xl overflow-hidden bg-zinc-100 border border-zinc-200">
                  <img src={url} alt="Preview" className="w-full h-full object-cover" />
                  <button 
                    onClick={() => removeImage(idx)}
                    className="absolute top-1 right-1 bg-black/50 hover:bg-black/80 text-white rounded-full p-1"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </div>
              ))}
            </div>
          )}

          {/* Toolbar & Submit */}
          <div className="flex items-center justify-between pt-2">
            <div>
              <input 
                type="file" 
                multiple 
                accept="image/*" 
                className="hidden" 
                ref={fileInputRef}
                onChange={handleImageSelect}
              />
              <Button 
                variant="ghost" 
                className="text-amber-600 hover:text-amber-700 hover:bg-amber-50 gap-2 rounded-full font-medium border border-amber-100"
                onClick={() => fileInputRef.current?.click()}
              >
                <ImageIcon className="w-5 h-5" />
                Tambah Foto
              </Button>
            </div>
            
            <Button 
              onClick={handleSubmit}
              disabled={isLoading || !selectedCafe}
              className="rounded-full px-8 bg-black hover:bg-zinc-800 text-white font-bold h-12"
            >
              {isLoading ? "Posting..." : "Publish"}
            </Button>
          </div>
          
        </div>
      </div>
    </div>
  );
}
