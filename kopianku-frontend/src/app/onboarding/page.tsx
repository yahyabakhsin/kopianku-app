"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import axios from "axios";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { UploadCloud, CheckCircle } from "lucide-react";
import { OnboardingQuiz } from "@/features/auth/components/OnboardingQuiz";

export default function OnboardingPage() {
  const router = useRouter();
  const [file, setFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [token, setToken] = useState<string | null>(null);

  // 1. Satpam Pengecek Token VIP
  useEffect(() => {
    const savedToken = localStorage.getItem("token");
    if (!savedToken) {
      alert("Wah lu belum login bang, balik dulu gih!");
      router.push("/login");
    } else {
      setToken(savedToken);
    }
  }, [router]);

  // 2. Fungsi Preview Foto
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const selectedFile = e.target.files[0];
      setFile(selectedFile);
      setPreviewUrl(URL.createObjectURL(selectedFile)); 
    }
  };

  // 3. Fungsi Nembak API Upload
  const handleSaveProfile = async () => {
    if (!file) {
      alert("Pilih foto dulu dong bang!");
      return;
    }

    setIsLoading(true);
    const formData = new FormData();
    formData.append("file", file);

    try {
      const response = await axios.post("http://localhost:8000/api/auth/upload-avatar", formData, {
        headers: {
          "Authorization": `Bearer ${token}`,
          "Content-Type": "multipart/form-data"
        }
      });

      alert("Gokil! Profil lu udah cakep: " + response.data.message);
      // Opsional: Kalau lu mau langsung pindah ke discover habis upload
      // router.push("/discover"); 
    } catch (error: any) {
      alert("Gagal upload: " + (error.response?.data?.detail || "Cek console F12"));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-white relative flex flex-col pt-20 px-4">
      {/* Abstract Background for aesthetic (Asli buatan lu) */}
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-amber-100/40 rounded-full blur-3xl -z-10 pointer-events-none"></div>
      <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-purple-100/40 rounded-full blur-3xl -z-10 pointer-events-none"></div>
      
      <div className="container mx-auto max-w-screen-xl flex-1 flex flex-col justify-center pb-32 gap-12 mt-8">
        
        {/* === SECTION 1: UPLOAD AVATAR (Baru) === */}
        <div className="w-full max-w-2xl mx-auto">
          <Card className="p-8 rounded-[2rem] shadow-sm border-zinc-100 bg-white/60 backdrop-blur-md text-center">
            <h2 className="text-2xl font-bold mb-2">Pasang Foto Profil</h2>
            <p className="text-zinc-500 mb-6 text-sm">Biar makin kece pas ninggalin review di kafe.</p>

            <div className="flex flex-col items-center justify-center gap-4">
              <div className="relative w-24 h-24 rounded-full border-2 border-dashed border-zinc-300 flex items-center justify-center overflow-hidden bg-zinc-50">
                {previewUrl ? (
                  <img src={previewUrl} alt="Preview" className="w-full h-full object-cover" />
                ) : (
                  <UploadCloud className="w-8 h-8 text-zinc-400" />
                )}
              </div>

              <input 
                type="file" 
                id="avatar-upload" 
                className="hidden" 
                accept="image/png, image/jpeg" 
                onChange={handleFileChange}
              />
              
              <div className="flex gap-3 mt-2">
                <label htmlFor="avatar-upload">
                  <span className="inline-block cursor-pointer bg-zinc-100 hover:bg-zinc-200 text-black text-sm font-semibold py-2 px-4 rounded-xl transition">
                    Pilih Foto
                  </span>
                </label>

                <Button 
                  onClick={handleSaveProfile} 
                  disabled={isLoading || !file}
                  className="bg-black hover:bg-zinc-800 text-white rounded-xl text-sm font-semibold px-6"
                >
                  {isLoading ? "Upload..." : "Simpan"} 
                </Button>
              </div>
            </div>
          </Card>
        </div>

        {/* Garis Pembatas Estetik */}
        <div className="w-full max-w-2xl mx-auto flex items-center justify-center gap-4">
          <div className="h-px bg-zinc-200 flex-1"></div>
          <span className="text-zinc-400 text-sm font-medium">Lanjut Kuis</span>
          <div className="h-px bg-zinc-200 flex-1"></div>
        </div>

        {/* === SECTION 2: KUIS PERSONA (Kode Asli Lu) === */}
        <div className="w-full">
          <OnboardingQuiz />
        </div>
        
      </div>
    </div>
  );
}