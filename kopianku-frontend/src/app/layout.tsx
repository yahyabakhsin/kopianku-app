import type { Metadata } from "next";
import { Plus_Jakarta_Sans } from "next/font/google";
import "./globals.css";
import { Navbar } from "@/components/layouts/Navbar";
import { Footer } from "@/components/layouts/Footer";
import { ChatWidget } from "@/features/chatbot/components/ChatWidget";
import { PlusWidget } from "@/features/social/components/PlusWidget";

const plusJakartaSans = Plus_Jakarta_Sans({
  variable: "--font-sans",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "KopianKu - Temukan Vibe Ngopi Paling Pas",
  description: "Platform sosial pencarian kafe berbasis vibe dan fasilitas dengan rekomendasi AI. Temukan tempat WFC, nongkrong, atau chill.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${plusJakartaSans.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col font-sans">
        <Navbar />
        <main className="flex-1 flex flex-col">
          {children}
        </main>
        <Footer />
        <ChatWidget />
        <PlusWidget />
      </body>
    </html>
  );
}
