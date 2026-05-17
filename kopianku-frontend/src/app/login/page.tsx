"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Coffee, ArrowRight } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import axios from "axios";

export default function LoginPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      // 1. Bikin Objek JSON biasa. 
      // Karena ini Pydantic custom, kemungkinan besar dia minta key "email", bukan "username"
      const payload = {
        email: email, 
        password: password
      };

      // 2. Langsung tembak! Nggak usah pusingin Headers, Axios otomatis jadiin ini "application/json"
      const response = await axios.post(`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api"}/auth/login`, payload);
      
      // 3. Simpan token & pindah halaman
      localStorage.setItem("token", response.data.access_token);
      window.dispatchEvent(new Event('user-login'));
      alert("Login Sukses! Token tersimpan.");
      
      if (response.data.role === "owner") {
        router.push("/business");
      } else if (response.data.has_onboarded) {
        router.push("/discover");
      } else {
        router.push("/onboarding");
      }
      
    } catch (error: any) {
      // Biar kalau misal salah password, errornya tetep keliatan jelas
      const errorDetail = error.response?.data?.detail || error.response?.data;
      alert("Gagal login:\n" + JSON.stringify(errorDetail, null, 2));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center bg-zinc-50 px-4">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-amber-100/50 via-zinc-50 to-zinc-50 -z-10"></div>
      
      <Card className="w-full max-w-md p-8 rounded-[2rem] border-zinc-100 shadow-xl bg-white/80 backdrop-blur-xl">
        <div className="flex justify-center mb-8">
          <div className="bg-black p-3 rounded-2xl">
            <Coffee className="w-8 h-8 text-white" />
          </div>
        </div>
        
        <h1 className="text-3xl font-bold text-center tracking-tight mb-2">Selamat Datang</h1>
        <p className="text-zinc-500 text-center mb-8">Masuk untuk menyimpan profil dan preferensi ngopi lo.</p>

        <form onSubmit={handleLogin} className="space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-semibold text-zinc-700">Email / Username</label>
            <Input 
              type="text" 
              placeholder="nama@email.com" 
              required
              className="h-12 rounded-xl bg-zinc-50/50"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>
          
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <label className="text-sm font-semibold text-zinc-700">Password</label>
              <Link href="#" className="text-xs text-amber-600 font-medium hover:underline">Lupa password?</Link>
            </div>
            <Input 
              type="password" 
              placeholder="••••••••" 
              required
              className="h-12 rounded-xl bg-zinc-50/50"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>

          <Button 
            type="submit" 
            disabled={isLoading}
            className="w-full h-12 bg-black hover:bg-zinc-800 text-white rounded-xl font-semibold mt-4"
          >
            {isLoading ? "Masuk..." : "Masuk"} <ArrowRight className="w-4 h-4 ml-2" />
          </Button>
        </form>

        <div className="mt-8 text-center text-sm text-zinc-500">
          Belum punya akun? <Link href="/register" className="text-black font-bold hover:underline">Daftar sekarang</Link>
        </div>
      </Card>
    </div>
  );
}