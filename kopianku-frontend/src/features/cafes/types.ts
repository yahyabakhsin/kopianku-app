export interface CafeFacility {
  id: string;
  name: string;
  icon?: string;
}

export interface Cafe {
  id: string;
  name: string;
  location: string;
  facilities: CafeFacility[];
  vibes: string[];
  ai_summary: string;
  rating: number;
  reviewCount: number;
  imageUrl: string;
}
