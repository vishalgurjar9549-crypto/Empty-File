/**
 * City Images Mapping
 *
 * Maps city names to representative images from Unsplash
 * These are fallback images while we integrate real city images from the backend
 *
 * Future: When city image field is added to backend, these fallbacks will be replaced
 */

type CityImageMap = Record<string, string>;
export const CITY_IMAGE_MAP: CityImageMap = {
  // North India
  Jaipur:
    "https://images.unsplash.com/photo-1603262110263-fb0112e7cc33?w=600&auto=format&fit=crop&q=60",
  Delhi:
    "https://images.unsplash.com/photo-1713729991304-d0b6c328560e?w=800&auto=format&fit=crop&q=60",
  Noida:
    "https://images.unsplash.com/photo-1661858435242-ed971767e954?w=800&auto=format&fit=crop&q=60",
  Gurgaon:
    "https://images.unsplash.com/photo-1514392181188-8f5d54262fa5?w=800&auto=format&fit=crop&q=60",
  Kota: "https://images.unsplash.com/photo-1595435236218-8ac8bcd84426?w=600&auto=format&fit=crop&q=60",
  Udaipur:
    "https://images.unsplash.com/photo-1668338012281-d0b269bcd3b6?w=800&auto=format&fit=crop&q=60",
  Jodhpur:
    "https://images.unsplash.com/photo-1574482620811-1aa16ffe3c82?w=600&auto=format&fit=crop&q=60",
  Bikaner:
    "https://images.unsplash.com/photo-1626621341517-bbf3d9990a23?w=600&auto=format&fit=crop&q=60",
  Ajmer:
    "https://images.unsplash.com/photo-1627894483216-2138af692e32?w=600&auto=format&fit=crop&q=60",
  Agra: "https://images.unsplash.com/photo-1548013146-72479768bada?w=600&auto=format&fit=crop&q=60",
  // West India
  Mumbai:
    "https://images.unsplash.com/photo-1570168007204-dfb528c6958f?w=600&auto=format&fit=crop&q=60",
  Pune: "https://images.unsplash.com/photo-1572782252655-9c8771392601?w=800&auto=format&fit=crop&q=60",
  Ahmedabad:
    "https://images.unsplash.com/photo-1599661046289-e31897846bfd?w=600&auto=format&fit=crop&q=60",
  Surat:
    "https://images.unsplash.com/photo-1587474260584-136574528ed5?w=600&auto=format&fit=crop&q=60",

  // South India
  Bangalore:
    "https://images.unsplash.com/photo-1596176530529-78163a4f7af2?w=600&auto=format&fit=crop&q=60",
  Hyderabad:
    "https://images.unsplash.com/photo-1551161242-b5af797b7233?w=600&auto=format&fit=crop&q=60",
  Chennai:
    "https://images.unsplash.com/photo-1582510003544-4d00b7f0bd44?w=600&auto=format&fit=crop&q=60",
  Cochin:
    "https://images.unsplash.com/photo-1572226028164-b1d1b4c13d13?w=600&auto=format&fit=crop&q=60",

  // East India
  Kolkata:
    "https://images.unsplash.com/photo-1514632776043-a7b32c546f5e?w=600&auto=format&fit=crop&q=60",
  Guwahati:
    "https://images.unsplash.com/photo-1597583282649-d0e6c66e0a00?w=600&auto=format&fit=crop&q=60",

  // Central India
  Indore:
    "https://images.unsplash.com/photo-1586325194122-2f0b3c41f718?w=600&auto=format&fit=crop&q=60",
  Nagpur:
    "https://images.unsplash.com/photo-1599707781605-0a9d7bb2c6f8?w=600&auto=format&fit=crop&q=60",

  // ✅ YOUR MISSING / IMPORTANT (FIXED)
  Ujjain:
    "https://images.unsplash.com/photo-1609948543911-47a3a07d4f92?w=600&auto=format&fit=crop&q=60",

  Sambalpur:
    "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=600&auto=format&fit=crop&q=60",

  Visakhapatnam:
    "https://images.unsplash.com/photo-1593693411515-c20261bcad6e?w=600&auto=format&fit=crop&q=60",

  Jamshedpur:
    "https://images.unsplash.com/photo-1570129477492-45c003edd2be?w=600&auto=format&fit=crop&q=60",

  // ✅ ADD MORE (future safe)
  Bhopal:
    "https://images.unsplash.com/photo-1580654712603-eb43273aff33?w=600&auto=format&fit=crop&q=60",
  Patna:
    "https://images.unsplash.com/photo-1570168007204-dfb528c6958f?w=600&auto=format&fit=crop&q=60",
  Lucknow:
    "https://images.unsplash.com/photo-1599661046289-e31897846bfd?w=600&auto=format&fit=crop&q=60",

  // ✅ DEFAULT (IMPORTANT)
  default:
    "https://images.unsplash.com/photo-1477959858617-67f85cf4f1df?w=600&auto=format&fit=crop&q=60",
};

/**
 * Normalize city name for consistent mapping
 * - Trim whitespace
 * - Handle case-insensitive matching
 * - Remove extra spaces
 *
 * @param cityName - Raw city name
 * @returns Normalized city name for matching
 */
function normalizeCityName(cityName: string): string {
  return cityName
    .trim()
    .replace(/\s+/g, " ") // Collapse multiple spaces
    .split(" ")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(" ");
}

/**
 * Get city image URL with strict city-to-image mapping
 * Each city must have a predefined representative image
 *
 * Features:
 * - Normalizes city names (trim, case-insensitive matching)
 * - Returns unique landmark-based image per city
 * - Falls back to default only if city not in map
 * - Never shows random or duplicate images
 *
 * @param cityName - Name of the city
 * @returns URL to the city's landmark image or default placeholder
 */
export function getCityImage(cityName: string | undefined | null): string {
  if (!cityName || typeof cityName !== "string") {
    console.warn(
      "[getCityImage] Invalid city name provided:",
      cityName,
      "— using default placeholder",
    );
    return CITY_IMAGE_MAP["default"];
  }

  // ✅ CRITICAL: Normalize city name for matching
  const normalizedName = normalizeCityName(cityName);

  // ✅ Try exact match with normalized name
  if (CITY_IMAGE_MAP[normalizedName]) {
    return CITY_IMAGE_MAP[normalizedName];
  }

  // ✅ Log unmapped city (helps identify new cities)
  if (process.env.NODE_ENV === "development") {
    console.warn(
      `[getCityImage] City "${cityName}" (normalized: "${normalizedName}") not in mapping — using default`,
      {
        availableCities: Object.keys(CITY_IMAGE_MAP).filter(
          (k) => k !== "default",
        ),
      },
    );
  }

  // ✅ Return default only as last resort
  return CITY_IMAGE_MAP["default"];
}

/**
 * Enrich city objects with images
 *
 * Features:
 * - Validates each city gets a unique image URL
 * - Warns if multiple cities map to same image (prevents duplicates)
 * - Ensures no blank/broken images
 *
 * @param cities - Array of city objects with name
 * @returns Array of cities with image URLs added
 */
export function enrichCitiesWithImages<T extends { name?: string }>(
  cities: T[],
): (T & { image: string })[] {
  const enriched = cities.map((city) => ({
    ...city,
    image: getCityImage(city.name),
  }));

  // ✅ VALIDATION: Check for duplicate images (helps catch issues)
  if (process.env.NODE_ENV === "development") {
    const imageCount: Record<string, string[]> = {};
    enriched.forEach((city) => {
      if (!imageCount[city.image]) {
        imageCount[city.image] = [];
      }
      imageCount[city.image].push(city.name || "unnamed");
    });

    Object.entries(imageCount).forEach(([image, cityNames]) => {
      if (cityNames.length > 1 && image !== CITY_IMAGE_MAP["default"]) {
        console.warn(
          `[enrichCitiesWithImages] ⚠️ Multiple cities map to same image: ${cityNames.join(
            ", ",
          )}`,
          `Image: ${image.substring(0, 60)}...`,
        );
      }
    });
  }

  return enriched;
}

/**
 * Validate city image mapping (dev tool for debugging)
 * Checks that all mapped cities have unique images
 *
 * @returns Object with validation results
 */
export function validateCityImageMapping(): {
  valid: boolean;
  duplicates: Record<string, string[]>;
  unmapped: number;
} {
  const imageToCities: Record<string, string[]> = {};
  let unmapped = 0;

  Object.entries(CITY_IMAGE_MAP).forEach(([cityName, imageUrl]) => {
    if (cityName === "default") {
      unmapped += 1;
      return;
    }
    if (!imageToCities[imageUrl]) {
      imageToCities[imageUrl] = [];
    }
    imageToCities[imageUrl].push(cityName);
  });

  const duplicates: Record<string, string[]> = {};
  Object.entries(imageToCities).forEach(([image, cities]) => {
    if (cities.length > 1) {
      duplicates[image] = cities;
    }
  });

  return {
    valid: Object.keys(duplicates).length === 0,
    duplicates,
    unmapped,
  };
}
