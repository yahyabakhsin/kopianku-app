import Link from "next/link";
import { Coffee, Search, Menu } from "lucide-react";
import { Button } from "@/components/ui/button";
import { NotificationBell } from "./NotificationBell";

export function Navbar() {
  return (
    <header className="sticky top-0 z-50 w-full bg-white/80 backdrop-blur-md border-b border-transparent">
      <div className="container mx-auto flex h-20 max-w-screen-2xl items-center justify-between px-4 md:px-8">

        {/* Logo */}
        <Link href="/" className="flex items-center gap-2">
          <div className="bg-black p-1.5 rounded-lg">
            <Coffee className="h-5 w-5 text-white" />
          </div>
          <span className="font-extrabold text-xl tracking-tight text-black">
            KopianKu
          </span>
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
            <Link href="/profile" className="flex items-center gap-2 hover:opacity-80 transition-opacity">
              <div className="w-10 h-10 rounded-full overflow-hidden border-2 border-zinc-200">
                <img src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=100" alt="Profile" className="w-full h-full object-cover" />
              </div>
            </Link>
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

