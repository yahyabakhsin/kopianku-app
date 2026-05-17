"use client";

import { useState } from "react";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { CreatePostModal } from "@/features/community/components/CreatePostModal";

export function PlusWidget() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <Button 
        onClick={() => setIsOpen(true)}
        className="fixed bottom-6 left-1/2 -translate-x-1/2 md:left-auto md:right-24 md:translate-x-0 w-14 h-14 rounded-full bg-amber-500 hover:bg-amber-600 text-white shadow-xl shadow-amber-500/30 z-40 flex items-center justify-center hover:scale-110 transition-all duration-300 border-4 border-white"
      >
        <Plus className="w-6 h-6" />
      </Button>

      <CreatePostModal 
        isOpen={isOpen} 
        onClose={() => setIsOpen(false)} 
      />
    </>
  );
}
