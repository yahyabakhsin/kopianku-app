"use client";

import Link from "next/link";
import { Coffee, Search, Menu, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { NotificationBell } from "./NotificationBell";
import { useEffect, useState } from "react";
import { apiClient } from "@/lib/axios";

export function Navbar() {
  const [userProfile, setUserProfile] = useState<any>(null);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token) {
            setUserProfile(null);
            return;
        }
        const res = await apiClient.get('/auth/me', {
          headers: { Authorization: `Bearer ${token}` }
        });
        setUserProfile(res.data.user_info);
      } catch (error) {
        console.error("Gagal load profile navbar", error);
        setUserProfile(null);
      }
    };
    
    fetchProfile();

    window.addEventListener('user-login', fetchProfile);
    window.addEventListener('user-logout', () => setUserProfile(null));

    return () => {
        window.removeEventListener('user-login', fetchProfile);
        window.removeEventListener('user-logout', () => setUserProfile(null));
    };
  }, []);

  return (
    <header className="sticky top-0 z-50 w-full bg-white/80 backdrop-blur-md border-b border-transparent">
      <div className="container mx-auto flex h-20 max-w-screen-2xl items-center justify-between px-4 md:px-8">

        {/* Logo */}
        <Link href="/" className="flex items-center gap-2">
          {/* Logo dari user, diubah jadi warna hitam pakai CSS filter invert jika dari aslinya putih, atau brightness(0) */}
          <img src="/logo.png" alt="KopianKu Logo" className="h-10 w-auto invert" />
        </Link>

        {/* Desktop Nav Links (Centered) */}
        <nav className="hidden md:flex items-center gap-8 text-sm font-semibold text-black">
          <Link href="/discover" className="hover:text-amber-600 transition-colors">
            Discover
          </Link>
          <Link href="/albums" className="hover:text-amber-600 transition-colors">
            Albums
          </Link>
          <Link href="/social" className="hover:text-amber-600 transition-colors">
            Community
          </Link>
          <Link href="/business" className="hover:text-amber-600 transition-colors">
            For Business
          </Link>
        </nav>

        {/* Right Actions */}
        <div className="flex items-center gap-4">
          <div className="hidden sm:flex items-center gap-4">
            {/* Bell Notification Icon */}
            <NotificationBell />

            {/* User Profile Avatar */}
            {userProfile ? (
              <Link href="/profile" className="flex items-center gap-2 hover:opacity-80 transition-opacity">
                <div className="w-10 h-10 rounded-full overflow-hidden border-2 border-zinc-200 bg-zinc-100 flex items-center justify-center font-bold text-zinc-600">
                  {userProfile.avatar_url ? (
                    <img src={userProfile.avatar_url} alt="Profile" className="w-full h-full object-cover" />
                  ) : (
                    userProfile.username.charAt(0).toUpperCase()
                  )}
                </div>
              </Link>
            ) : (
              <Link href="/login">
                <Button variant="outline" className="rounded-full font-semibold border-zinc-300">Login</Button>
              </Link>
            )}
          </div>

          <Button variant="ghost" size="icon" className="md:hidden">
            <Menu className="h-5 w-5" />
            <span className="sr-only">Toggle Menu</span>
          </Button>
        </div>

      </div>
    </header>
  );
}

