import Link from "next/link";
import { Coffee } from "lucide-react";

export function Footer() {
  return (
    <footer className="border-t bg-muted/20">
      <div className="container mx-auto max-w-screen-2xl px-4 md:px-8 py-10">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="md:col-span-1 space-y-4">
            <Link href="/" className="flex items-center gap-2">
              <div className="bg-amber-600 p-1.5 rounded-lg">
                <Coffee className="h-5 w-5 text-white" />
              </div>
              <span className="font-bold text-xl tracking-tight">KopianKu</span>
            </Link>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Temukan tempat ngopi dengan vibe yang pas. Dari spot WFC yang tenang sampai kafe estetik buat nongkrong.
            </p>
          </div>
          
          <div>
            <h3 className="font-semibold mb-4">Explore</h3>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li><Link href="/discover" className="hover:text-amber-600 transition-colors">Discover Cafes</Link></li>
              <li><Link href="/collections" className="hover:text-amber-600 transition-colors">Top Collections</Link></li>
              <li><Link href="/leaderboard" className="hover:text-amber-600 transition-colors">Leaderboard</Link></li>
            </ul>
          </div>

          <div>
            <h3 className="font-semibold mb-4">For Business</h3>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li><Link href="/claim" className="hover:text-amber-600 transition-colors">Claim Your Cafe</Link></li>
              <li><Link href="/business" className="hover:text-amber-600 transition-colors">UMKM Dashboard</Link></li>
              <li><Link href="/advertise" className="hover:text-amber-600 transition-colors">Advertise</Link></li>
            </ul>
          </div>

          <div>
            <h3 className="font-semibold mb-4">Legal</h3>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li><Link href="/terms" className="hover:text-amber-600 transition-colors">Terms of Service</Link></li>
              <li><Link href="/privacy" className="hover:text-amber-600 transition-colors">Privacy Policy</Link></li>
              <li><Link href="/contact" className="hover:text-amber-600 transition-colors">Contact Us</Link></li>
            </ul>
          </div>
        </div>
        
        <div className="mt-10 pt-6 border-t flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-sm text-muted-foreground">
            &copy; {new Date().getFullYear()} KopianKu. All rights reserved.
          </p>
          <div className="flex gap-4 text-sm font-medium">
            <span className="text-muted-foreground">Made with ❤️ for Coffee Lovers</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
