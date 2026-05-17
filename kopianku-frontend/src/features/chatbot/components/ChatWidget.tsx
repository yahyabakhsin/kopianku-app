"use client";

import { useState, useEffect } from "react";
import { MessageSquare, X, Send, Sparkles, Coffee, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

type Message = {
  id: string;
  sender: "user" | "ai";
  text: string;
};

const initialMessages: Message[] = [
  {
    id: "1",
    sender: "ai",
    text: "Halo! Gue Kopi-Assistant pribadi lo. Lagi butuh rekomendasi tempat buat nugas atau nongkrong santai di sekitar Malang?",
  },
];

const suggestions = [
  "Cari spot WFC daerah Suhat",
  "Kafe dekat UB yang buka 24 jam",
  "Rekomendasi kafe estetik & banyak colokan",
];

export function ChatWidget() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>(initialMessages);
  const [inputValue, setInputValue] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [greeting, setGreeting] = useState("Sore");

  useEffect(() => {
    const hour = new Date().getHours();
    if (hour < 11) setGreeting("Pagi");
    else if (hour < 15) setGreeting("Siang");
    else if (hour < 18) setGreeting("Sore");
    else setGreeting("Malam");
  }, []);

  const handleSend = async (text: string) => {
    if (!text.trim()) return;

    // 1. Tampilkan pesan User
    const userMsg: Message = { id: Date.now().toString(), sender: "user", text };
    setMessages((prev) => [...prev, userMsg]);
    setInputValue("");
    setIsTyping(true);

    try {
      // 2. Ambil token dari localStorage
      const token = localStorage.getItem("token");
      if (!token) {
        throw new Error("Lo harus login dulu bang buat pake fitur assistant khusus ini!");
      }

      // 3. Tembak API Backend
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api"}/chatbot/ask`, {
        method: "POST",
        headers: { 
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({ text })
      });

      const data = await response.json();
      
      // 4. PENCEGAHAN ERROR CLASIC JAVASCRIPT
      if (!response.ok) {
        console.error("Backend Error:", data);
        throw new Error(data.detail || "Gagal menghubungi backend bang.");
      }
      
      // Mengambil teks dari response backend
      const aiResponseText = data.response || "Maaf bang, gue lagi nge-blank nih.";
      
      const aiMsg: Message = {
        id: (Date.now() + 1).toString(),
        sender: "ai",
        text: aiResponseText,
      };
      
      setMessages((prev) => [...prev, aiMsg]);

    } catch (error: any) {
      console.error("Chatbot Error:", error);
      const errorMsg: Message = {
        id: (Date.now() + 1).toString(),
        sender: "ai",
        text: `Waduh ngelag: ${error.message}`,
      };
      setMessages((prev) => [...prev, errorMsg]);
    } finally {
      setIsTyping(false);
    }
  };

  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end">
      
      {isOpen && (
        <Card className="w-80 sm:w-96 mb-4 shadow-2xl border-zinc-200 overflow-hidden flex flex-col h-[550px] animate-in slide-in-from-bottom-5 fade-in duration-300 rounded-3xl">
          <div className="bg-gradient-to-r from-amber-500 to-orange-400 text-white p-5 flex flex-col gap-4 relative">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Avatar className="w-10 h-10 border-2 border-white/20 shadow-sm">
                  <AvatarFallback className="bg-amber-100 text-amber-700"><Coffee className="w-5 h-5" /></AvatarFallback>
                </Avatar>
                <div>
                  <h3 className="font-bold text-base flex items-center gap-1">
                    Kopi-Assistant <Sparkles className="w-3 h-3 text-amber-100" />
                  </h3>
                  <p className="text-xs text-white/80 font-medium">Powered by Gemini AI</p>
                </div>
              </div>
              <Button 
                variant="ghost" 
                size="icon" 
                onClick={() => setIsOpen(false)}
                className="text-white hover:text-amber-100 hover:bg-white/10 rounded-full h-8 w-8"
              >
                <X className="w-4 h-4" />
              </Button>
            </div>
            <div className="bg-white/20 backdrop-blur-sm rounded-xl p-3 text-sm font-medium border border-white/10 shadow-inner">
              👋 {greeting}, WFC Warrior! Gimana kopi lo hari ini?
            </div>
          </div>

          <div className="flex-1 p-4 overflow-y-auto bg-zinc-50 flex flex-col gap-5">
            {messages.map((msg) => (
              <div key={msg.id} className={`flex gap-3 max-w-[85%] ${msg.sender === "user" ? "self-end flex-row-reverse" : "self-start"}`}>
                {msg.sender === "ai" ? (
                  <Avatar className="w-8 h-8 mt-1 border border-zinc-200 shadow-sm">
                    <AvatarFallback className="bg-amber-100 text-amber-700"><Coffee className="w-4 h-4" /></AvatarFallback>
                  </Avatar>
                ) : (
                  <Avatar className="w-8 h-8 mt-1 border border-zinc-200 shadow-sm">
                    <AvatarFallback className="bg-zinc-800 text-white"><User className="w-4 h-4" /></AvatarFallback>
                  </Avatar>
                )}
                <div className={`p-3.5 rounded-2xl text-sm leading-relaxed ${msg.sender === "user" ? "bg-zinc-800 text-white rounded-tr-sm shadow-sm" : "bg-white border border-zinc-200 text-zinc-800 rounded-tl-sm shadow-sm"}`}>
                  {msg.text}
                </div>
              </div>
            ))}
            
            {isTyping && (
              <div className="self-start flex gap-3 max-w-[85%]">
                <Avatar className="w-8 h-8 border border-zinc-200 shadow-sm">
                  <AvatarFallback className="bg-amber-100 text-amber-700"><Coffee className="w-4 h-4" /></AvatarFallback>
                </Avatar>
                <div className="p-4 bg-white border border-zinc-200 rounded-2xl rounded-tl-sm flex items-center gap-1.5 shadow-sm">
                  <div className="w-1.5 h-1.5 bg-amber-500 rounded-full animate-bounce"></div>
                  <div className="w-1.5 h-1.5 bg-amber-500 rounded-full animate-bounce delay-100"></div>
                  <div className="w-1.5 h-1.5 bg-amber-500 rounded-full animate-bounce delay-200"></div>
                </div>
              </div>
            )}
            
            {!isTyping && messages.length === 1 && (
              <div className="flex flex-wrap gap-2 mt-2">
                {suggestions.map((suggestion) => (
                  <button key={suggestion} onClick={() => handleSend(suggestion)} className="text-xs font-medium bg-amber-50 text-amber-700 border border-amber-200 hover:bg-amber-100 hover:border-amber-300 py-1.5 px-3 rounded-full transition-colors text-left">
                    {suggestion}
                  </button>
                ))}
              </div>
            )}
          </div>

          <form onSubmit={(e) => { e.preventDefault(); handleSend(inputValue); }} className="p-3 bg-white border-t border-zinc-100 flex gap-2">
            <Input placeholder="Tanya soal cafe..." value={inputValue} onChange={(e) => setInputValue(e.target.value)} className="bg-zinc-50 border-zinc-200 focus-visible:ring-amber-500 rounded-full h-11 px-4 text-sm" />
            <Button type="submit" size="icon" disabled={!inputValue.trim() || isTyping} className="bg-amber-500 hover:bg-amber-600 text-white rounded-full shrink-0 h-11 w-11 shadow-sm transition-transform active:scale-95">
              <Send className="w-4 h-4 ml-0.5" />
            </Button>
          </form>
        </Card>
      )}

      <Button onClick={() => setIsOpen(!isOpen)} className={`w-14 h-14 rounded-full shadow-[0_8px_30px_rgb(0,0,0,0.12)] flex items-center justify-center transition-all duration-300 hover:scale-105 active:scale-95 ${isOpen ? "bg-zinc-800 hover:bg-black" : "bg-gradient-to-tr from-amber-500 to-orange-400 hover:shadow-amber-500/30 text-white border-none"}`}>
        {isOpen ? <X className="w-6 h-6" /> : <MessageSquare className="w-6 h-6" />}
      </Button>
    </div>
  );
}