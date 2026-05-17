"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Coffee, ArrowRight } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { apiClient } from "@/lib/axios";

export default function RegisterPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      // 1. Register
      await apiClient.post("/auth/register", {
        username: username,
        email: email,
        password: password
      });

      // 2. Langsung Login otomatis setelah berhasil daftar
      const loginResponse = await apiClient.post("/auth/login", {
        email: email,
        password: password
      });
      
      // 3. Simpan token
      localStorage.setItem("token", loginResponse.data.access_token);
      window.dispatchEvent(new Event('user-login'));
      
      // 4. Arahkan ke Onboarding karena ini user baru
      router.push("/onboarding");
      
    } catch (error: any) {
      const errorDetail = error.response?.data?.detail || error.response?.data || "Terjadi kesalahan";
      alert("Gagal mendaftar:\n" + JSON.stringify(errorDetail, null, 2));
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
        
        <h1 className="text-3xl font-bold text-center tracking-tight mb-2">Buat Akun</h1>
        <p className="text-zinc-500 text-center mb-8">Daftar sekarang buat dapetin rekomendasi kafe yang sesuai sama vibe lo.</p>

        <form onSubmit={handleRegister} className="space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-semibold text-zinc-700">Username</label>
            <Input 
              type="text" 
              placeholder="Si Paling Kopi" 
              required
              className="h-12 rounded-xl bg-zinc-50/50"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-semibold text-zinc-700">Email</label>
            <Input 
              type="email" 
              placeholder="nama@email.com" 
              required
              className="h-12 rounded-xl bg-zinc-50/50"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>
          
          <div className="space-y-2">
            <label className="text-sm font-semibold text-zinc-700">Password</label>
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
            {isLoading ? "Mendaftar..." : "Daftar Sekarang"} <ArrowRight className="w-4 h-4 ml-2" />
          </Button>
        </form>

        <div className="mt-8 text-center text-sm text-zinc-500">
          Udah punya akun? <Link href="/login" className="text-black font-bold hover:underline">Masuk di sini</Link>
        </div>
      </Card>
    </div>
  );
}
