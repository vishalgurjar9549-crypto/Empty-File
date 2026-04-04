import { PropertyRailSection } from "./home/PropertyRailSection";

export function FeaturedRooms() {
  // ✅ STEP 2: PropertyRailSection handles its own data fetching
  // No need for this component to fetch - it's just a wrapper
  // PropertyRailSection calls fetchFeaturedSection internally
  
  return <PropertyRailSection />;
}
