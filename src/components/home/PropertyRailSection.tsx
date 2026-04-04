// components/home/PropertyRailSection.tsx

import { useMemo } from "react";
import { PropertyRail } from "./PropertyRail";
import { demoPropertyRails } from "./demoPropertyRails";
import { useAppSelector } from "../../store/hooks";

export function PropertyRailSection() {
  const { rooms, loading } = useAppSelector((state) => state.rooms);

  // Optional backend grouping
  const groupedRails = useMemo(() => {
    if (!rooms || rooms.length === 0) return demoPropertyRails;

    const cityGroups = new Map<string, any[]>();

    rooms.forEach((room: any) => {
      const city =
        room.city ||
        room.location?.city ||
        room.address?.city ||
        "Popular Stays";

      if (!cityGroups.has(city)) {
        cityGroups.set(city, []);
      }

      cityGroups.get(city)?.push({
        id: room.id,
        title: room.title || room.name || `Stay in ${city}`,
        location:
          room.location?.area ||
          room.address?.locality ||
          room.area ||
          city,
        city,
        price: room.pricePerNight || room.price || 5999,
        nights: 2,
        rating: room.averageRating || room.rating || 4.8,
        demand: room.demand,
        image:
          room.images?.[0]?.url ||
          room.images?.[0] ||
          "https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?q=80&w=1200&auto=format&fit=crop",
        isGuestFavorite: (room.averageRating || room.rating || 0) >= 4.8,
      });
    });

    return Array.from(cityGroups.entries())
      .slice(0, 5)
      .map(([city, properties], index) => ({
        id: `${city.toLowerCase()}-${index}`,
        title: index === 0 ? `Popular homes in ${city}` : `Stays in ${city}`,
        subtitle: "Handpicked places guests love",
        city,
        properties: properties.slice(0, 10),
      }));
  }, [rooms]);

  return (
    <section className="px-4 sm:px-6 lg:px-8  bg-white dark:bg-slate-950 transition-colors duration-300 ">
      <div className="max-w-[1600px] mx-auto">
        <div className="space-y-4 md:space-y-4">
          {groupedRails.map((section) => (
            <PropertyRail
              key={section.id}
              title={section.title}
              subtitle={section.subtitle}
              properties={section.properties}
              loading={loading.fetch && rooms.length === 0}
              viewAllLink={`/rooms?city=${encodeURIComponent(section.city)}`}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
