"use client";

import { useState, useRef, useEffect } from "react";
import { Bell, Heart, MessageSquare, AlertTriangle, CalendarCheck } from "lucide-react";
import { Button } from "@/components/ui/button";

// Mock Notifications based on User Flow
const MOCK_NOTIFICATIONS = [
  {
    id: 1,
    type: "alert",
    icon: <AlertTriangle className="w-4 h-4 text-amber-500" />,
    title: "Crowd Alert: Titik Temu Senopati",
    desc: "Kafe favorit lo lagi sepi nih! Cocok banget buat numpang nugas sekarang.",
    time: "Baru saja",
    unread: true,
  },
  {
    id: 2,
    type: "reservation",
    icon: <CalendarCheck className="w-4 h-4 text-green-500" />,
    title: "Reservasi Berhasil 🎟️",
    desc: "Booking Meeting Room A di 15th Coffee Kemang untuk besok jam 14:00 sukses.",
    time: "2 jam lalu",
    unread: true,
  },
  {
    id: 3,
    type: "social",
    icon: <MessageSquare className="w-4 h-4 text-blue-500" />,
    title: "Dimas Balas Komentar Lo",
    desc: "\"Bener banget, kopi susunya juara sih di sini.\"",
    time: "5 jam lalu",
    unread: false,
  },
  {
    id: 4,
    type: "social",
    icon: <Heart className="w-4 h-4 text-red-500 fill-red-500" />,
    title: "Review Lo Disukai",
    desc: "Nadia Kusuma dan 12 lainnya menyukai review lo di Kopi Nako Tebet.",
    time: "Kemarin",
    unread: false,
  }
];

export function NotificationBell() {
  const [isOpen, setIsOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState(2);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleOpen = () => {
    setIsOpen(!isOpen);
    if (!isOpen) {
      // Optional: mark all as read after a delay
      setTimeout(() => setUnreadCount(0), 3000);
    }
  };

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Bell Button */}
      <Button 
        variant="ghost" 
        size="icon" 
        onClick={handleOpen}
        className={`relative text-zinc-600 hover:text-black rounded-full transition-colors ${isOpen ? 'bg-zinc-100' : 'hover:bg-zinc-100'}`}
      >
        <Bell className="w-5 h-5" />
        {unreadCount > 0 && (
          <span className="absolute top-1.5 right-2 w-2 h-2 bg-red-500 rounded-full border border-white animate-pulse"></span>
        )}
      </Button>

      {/* Dropdown Panel */}
      {isOpen && (
        <div className="absolute right-0 mt-2 w-80 md:w-96 bg-white rounded-2xl shadow-xl border border-zinc-100 overflow-hidden z-50 animate-in fade-in slide-in-from-top-4 duration-200">
          
          <div className="flex items-center justify-between p-4 border-b border-zinc-100 bg-zinc-50/50">
            <h3 className="font-bold">Notifikasi</h3>
            {unreadCount > 0 && (
              <span className="text-xs text-amber-600 font-semibold cursor-pointer hover:underline">Tandai semua dibaca</span>
            )}
          </div>

          <div className="max-h-[400px] overflow-y-auto">
            {MOCK_NOTIFICATIONS.map((notif) => (
              <div 
                key={notif.id} 
                className={`p-4 border-b border-zinc-50 flex gap-4 hover:bg-zinc-50 transition-colors cursor-pointer ${notif.unread ? 'bg-blue-50/30' : ''}`}
              >
                {/* Icon Circle */}
                <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 ${
                  notif.type === 'alert' ? 'bg-amber-100' : 
                  notif.type === 'reservation' ? 'bg-green-100' : 'bg-blue-100'
                }`}>
                  {notif.icon}
                </div>
                
                {/* Content */}
                <div className="flex-1">
                  <h4 className={`text-sm mb-0.5 ${notif.unread ? 'font-bold text-black' : 'font-semibold text-zinc-800'}`}>
                    {notif.title}
                  </h4>
                  <p className="text-xs text-zinc-500 leading-relaxed line-clamp-2 mb-1">
                    {notif.desc}
                  </p>
                  <span className="text-[10px] font-medium text-zinc-400">{notif.time}</span>
                </div>

                {/* Unread dot */}
                {notif.unread && (
                  <div className="w-2 h-2 bg-blue-500 rounded-full mt-1.5 shrink-0"></div>
                )}
              </div>
            ))}
          </div>

          <div className="p-3 bg-zinc-50/50 border-t border-zinc-100 text-center">
            <button className="text-xs font-bold text-zinc-500 hover:text-black transition-colors">
              Lihat Semua Notifikasi
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
