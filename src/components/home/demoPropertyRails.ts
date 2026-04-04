// components/home/demoPropertyRails.ts

export type DemoProperty = {
  id: string;
  title: string;
  location: string;
  city: string;
  price: number;
  nights?: number;
  rating: number;
  image: string;
  isGuestFavorite?: boolean;
};

export type PropertyRailData = {
  id: string;
  title: string;
  subtitle?: string;
  city: string;
  properties: DemoProperty[];
};

export const demoPropertyRails: PropertyRailData[] = [
  {
    id: "jaipur-popular",
    title: "Popular homes in Jaipur",
    subtitle: "Top-rated stays guests love",
    city: "Jaipur",
    properties: [
      {
        id: "jpr-1",
        title: "Flat in Vivek Vihar",
        location: "Vivek Vihar, Jaipur",
        city: "Jaipur",
        price: 11412,
        nights: 2,
        rating: 5.0,
        image: "https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?q=80&w=1200&auto=format&fit=crop",
        isGuestFavorite: true,
      },
      {
        id: "jpr-2",
        title: "Flat in Jhotwara",
        location: "Jhotwara, Jaipur",
        city: "Jaipur",
        price: 7929,
        nights: 2,
        rating: 4.92,
        image: "https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?q=80&w=1200&auto=format&fit=crop",
        isGuestFavorite: true,
      },
      {
        id: "jpr-3",
        title: "Home in Sodala",
        location: "Sodala, Jaipur",
        city: "Jaipur",
        price: 10679,
        nights: 2,
        rating: 4.92,
        image: "https://images.unsplash.com/photo-1494526585095-c41746248156?q=80&w=1200&auto=format&fit=crop",
        isGuestFavorite: true,
      },
      {
        id: "jpr-4",
        title: "Flat in Jaipur",
        location: "Central Jaipur",
        city: "Jaipur",
        price: 10591,
        nights: 2,
        rating: 4.98,
        image: "https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?q=80&w=1200&auto=format&fit=crop",
        isGuestFavorite: true,
      },
      {
        id: "jpr-5",
        title: "Flat in Hathroi",
        location: "Hathroi, Jaipur",
        city: "Jaipur",
        price: 16387,
        nights: 2,
        rating: 4.9,
        image: "https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?q=80&w=1200&auto=format&fit=crop",
        isGuestFavorite: true,
      },
      {
        id: "jpr-6",
        title: "Home in Sindhi Camp",
        location: "Sindhi Camp, Jaipur",
        city: "Jaipur",
        price: 5404,
        nights: 2,
        rating: 4.83,
        image: "https://images.unsplash.com/photo-1484154218962-a197022b5858?q=80&w=1200&auto=format&fit=crop",
        isGuestFavorite: true,
      },
    ],
  },
  {
    id: "bengaluru-next-month",
    title: "Available next month in Bengaluru",
    subtitle: "Great picks for your next stay",
    city: "Bengaluru",
    properties: [
      {
        id: "blr-1",
        title: "Apartment in Indiranagar",
        location: "Indiranagar, Bengaluru",
        city: "Bengaluru",
        price: 7890,
        nights: 2,
        rating: 4.88,
        image: "https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?q=80&w=1200&auto=format&fit=crop",
        isGuestFavorite: true,
      },
      {
        id: "blr-2",
        title: "Studio in Koramangala",
        location: "Koramangala, Bengaluru",
        city: "Bengaluru",
        price: 6520,
        nights: 2,
        rating: 4.81,
        image: "https://images.unsplash.com/photo-1494526585095-c41746248156?q=80&w=1200&auto=format&fit=crop",
        isGuestFavorite: true,
      },
      {
        id: "blr-3",
        title: "Home in HSR Layout",
        location: "HSR Layout, Bengaluru",
        city: "Bengaluru",
        price: 9310,
        nights: 2,
        rating: 4.93,
        image: "https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?q=80&w=1200&auto=format&fit=crop",
        isGuestFavorite: true,
      },
      {
        id: "blr-4",
        title: "Flat in Whitefield",
        location: "Whitefield, Bengaluru",
        city: "Bengaluru",
        price: 7110,
        nights: 2,
        rating: 4.75,
        image: "https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?q=80&w=1200&auto=format&fit=crop",
        isGuestFavorite: true,
      },
      {
        id: "blr-5",
        title: "Loft in JP Nagar",
        location: "JP Nagar, Bengaluru",
        city: "Bengaluru",
        price: 8440,
        nights: 2,
        rating: 4.87,
        image: "https://images.unsplash.com/photo-1484154218962-a197022b5858?q=80&w=1200&auto=format&fit=crop",
        isGuestFavorite: true,
      },
    ],
  },
  {
    id: "delhi-trending",
    title: "Trending stays in Delhi",
    subtitle: "Stylish homes in top neighborhoods",
    city: "Delhi",
    properties: [
      {
        id: "del-1",
        title: "Flat in Hauz Khas",
        location: "Hauz Khas, Delhi",
        city: "Delhi",
        price: 9580,
        nights: 2,
        rating: 4.86,
        image: "https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?q=80&w=1200&auto=format&fit=crop",
        isGuestFavorite: true,
      },
      {
        id: "del-2",
        title: "Home in South Delhi",
        location: "South Delhi",
        city: "Delhi",
        price: 12490,
        nights: 2,
        rating: 4.95,
        image: "https://images.unsplash.com/photo-1494526585095-c41746248156?q=80&w=1200&auto=format&fit=crop",
        isGuestFavorite: true,
      },
      {
        id: "del-3",
        title: "Apartment in Saket",
        location: "Saket, Delhi",
        city: "Delhi",
        price: 8750,
        nights: 2,
        rating: 4.79,
        image: "https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?q=80&w=1200&auto=format&fit=crop",
        isGuestFavorite: true,
      },
      {
        id: "del-4",
        title: "Stay in Greater Kailash",
        location: "Greater Kailash, Delhi",
        city: "Delhi",
        price: 10200,
        nights: 2,
        rating: 4.89,
        image: "https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?q=80&w=1200&auto=format&fit=crop",
        isGuestFavorite: true,
      },
    ],
  },
];