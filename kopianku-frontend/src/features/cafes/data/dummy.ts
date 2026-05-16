import { Cafe } from "../types";

export const dummyCafes: Cafe[] = [
  {
    id: "1",
    name: "Kopi Nako Tebet",
    location: "Tebet, Jakarta Selatan",
    facilities: [
      { id: "f1", name: "Wi-Fi Ngebut", icon: "wifi" },
      { id: "f2", name: "Banyak Colokan", icon: "zap" },
      { id: "f3", name: "Smoking Area", icon: "wind" },
      { id: "f8", name: "Meeting Room", icon: "users" },
    ],
    vibes: ["WFC", "Fokus", "Tenang"],
    ai_summary: "Spot WFC andalan, kopi enak, playlist chill. Kalau sore agak rame jadi dateng pagian biar dapet colokan.",
    rating: 4.8,
    reviewCount: 1240,
    imageUrl: "https://images.unsplash.com/photo-1554118811-1e0d58224f24?auto=format&fit=crop&q=80&w=800",
  },
  {
    id: "2",
    name: "Toko Kopi Tuku",
    location: "Cipete, Jakarta Selatan",
    facilities: [
      { id: "f4", name: "Kopi Susu", icon: "coffee" },
      { id: "f5", name: "Grab & Go", icon: "shopping-bag" },
    ],
    vibes: ["Cepat", "To-Go", "Hits"],
    ai_summary: "Kopi susu tetangga tetep juara. Tempatnya mungil banget, lebih cocok untuk dibungkus daripada nongkrong lama.",
    rating: 4.9,
    reviewCount: 3200,
    imageUrl: "https://images.unsplash.com/photo-1559925393-8be0ec4767c8?auto=format&fit=crop&q=80&w=800",
  },
  {
    id: "3",
    name: "15th Coffee",
    location: "Kemang, Jakarta Selatan",
    facilities: [
      { id: "f6", name: "Estetik", icon: "camera" },
      { id: "f1", name: "Wi-Fi Ngebut", icon: "wifi" },
    ],
    vibes: ["Estetik", "Tenang", "WFC"],
    ai_summary: "Desain industrial minimalis. Cocok buat foto-foto OOTD. Kopinya agak pricey tapi sepadan sama suasana tenang di lantai 2.",
    rating: 4.6,
    reviewCount: 850,
    imageUrl: "https://images.unsplash.com/photo-1497935586351-b67a49e012bf?auto=format&fit=crop&q=80&w=800",
  },
  {
    id: "4",
    name: "Titik Temu Coffee",
    location: "Senopati, Jakarta Selatan",
    facilities: [
      { id: "f7", name: "Outdoor Luas", icon: "sun" },
      { id: "f2", name: "Banyak Colokan", icon: "zap" },
    ],
    vibes: ["Outdoor", "Asri", "Nongkrong"],
    ai_summary: "Vibe asri di tengah kota. Area outdoor paling asik pas sore hari. Meja besar cocok buat meeting bareng tim.",
    rating: 4.7,
    reviewCount: 2100,
    imageUrl: "https://images.unsplash.com/photo-1600093463592-8e36ae95ef56?auto=format&fit=crop&q=80&w=800",
  }
];
