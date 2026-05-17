import type { Metadata } from "next";
import { Poppins } from "next/font/google";
import "./globals.css";
import { Navbar } from "@/components/layouts/Navbar";
import { Footer } from "@/components/layouts/Footer";
import { ChatWidget } from "@/features/chatbot/components/ChatWidget";
import { PlusWidget } from "@/features/social/components/PlusWidget";

const poppins = Poppins({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
  variable: "--font-poppins",
  display: "swap",
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
      className="h-full antialiased"
    >
      <body className={`min-h-full flex flex-col font-sans ${poppins.variable}`}>
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
