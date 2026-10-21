export interface LandingPageEvent {
  id: number;
  title: string;
  location: string;
  price: string;
  rating: number;
  date: string;
  category: string;
  description: string;
  image: string;
}

export const trendingEvents: LandingPageEvent[] = [
  {
    id: 1,
    title: "Water Festival (Bon Om Touk)",
    location: "Phnom Penh",
    price: "FREE",
    rating: 4.9,
    date: "Nov 14, 2026 - Nov 16, 2026",
    category: "COMMUNITY",
    description:
      "Celebrate Cambodia's tradition with amazing boat races and lights.",
    image: "/images/water_festival.png",
  },
  {
    id: 2,
    title: "Phnom Penh EDM Festival",
    location: "Phnom Penh",
    price: "$15.00",
    rating: 4.7,
    date: "Dec 31, 2026 - Jan 01, 2027",
    category: "ENTERTAINMENT",
    description:
      "Top local & international DJs. An unforgettable night of music!",
    image: "/images/edm_festival.png",
  },
  {
    id: 3,
    title: "Angkor Wat Sunrise Tour",
    location: "Siem Reap",
    price: "$37.00",
    rating: 5.0,
    date: "Mar 20, 2026 - Mar 22, 2026",
    category: "CULTURE",
    description:
      "Experience the magic of Angkor Wat with a guided sunrise tour.",
    image: "/images/angkor_wat_sunrise.png",
  },
  {
    id: 4,
    title: "Khmer Food Expo",
    location: "Battambang",
    price: "FREE",
    rating: 4.8,
    date: "Oct 10, 2026 - Oct 12, 2026",
    category: "FOOD",
    description:
      "A food festival featuring the best flavors from across the country.",
    image: "/images/khmer_food_expo.png",
  },
];
