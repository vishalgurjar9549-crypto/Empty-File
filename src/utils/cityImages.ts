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
  "Jaipur": "https://images.unsplash.com/photo-1603262110263-fb0112e7cc33?w=600&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8Mnx8amFpcHVyfGVufDB8fDB8fHww",
  "Delhi": "https://images.unsplash.com/photo-1587474260584-136574528ed5?w=600&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8M3x8ZGVsaGl8ZW58MHx8MHx8fDA%3D",
  "Kota": "https://images.unsplash.com/photo-1595435236218-8ac8bcd84426?w=600&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8M3x8a290YSUyMHJhamFzdGhhbnxlbnwwfHwwfHx8MA%3D%3D",
  "Udaipur": "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=600&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8OXx8dWRhaXB1cnxlbnwwfHwwfHx8MA%3D%3D",
  "Jodhpur": "https://images.unsplash.com/photo-1574482620811-1aa16ffe3c82?w=600&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8NXx8am9kaHB1cnxlbnwwfHwwfHx8MA%3D%3D",
  
  // West India
  "Mumbai": "https://images.unsplash.com/photo-1570168007204-dfb528c6958f?w=600&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8Nnx8bXVtYmFpfGVufDB8fDB8fHww",
  "Pune": "https://images.unsplash.com/photo-1566552881560-0be862a7c445?w=600&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8Mnx8cHVuZXxlbnwwfHwwfHx8MA%3D%3D",
  "Ahmedabad": "https://images.unsplash.com/photo-1599661046289-e31897846bfd?w=600&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8OXx8YWhtZWRhYmFkfGVufDB8fDB8fHww",
  
  // South India
  "Bangalore": "https://images.unsplash.com/photo-1596176530529-78163a4f7af2?w=600&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8Nnx8YmFuZ2Fsb3JlfGVufDB8fDB8fHww",
  "Hyderabad": "https://images.unsplash.com/photo-1551161242-b5af797b7233?w=851&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
  "Chennai": "https://images.unsplash.com/photo-1582510003544-4d00b7f0bd44?w=600&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8M3x8Y2hlbm5haXxlbnwwfHwwfHx8MA%3D%3D",
  "Cochin": "https://images.unsplash.com/photo-1572226028164-b1d1b4c13d13?w=600&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8Nnx8Y29jaGlufGVufDB8fDB8fHww",
  
  // East India  
  "Kolkata": "https://images.unsplash.com/photo-1514632776043-a7b32c546f5e?w=600&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MTB8fGtvbGthdGF8ZW58MHx8MHx8fDA%3D",
  "Guwahati": "https://images.unsplash.com/photo-1597583282649-d0e6c66e0a00?w=600&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8Nnx8YXNzYW18ZW58MHx8MHx8fDA%3D",
  
  // Central India
  "Indore": "https://images.unsplash.com/photo-1586325194122-2f0b3c41f718?w=600&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8Nnx8aW5kb3JlfGVufDB8fDB8fHww",
  "Nagpur": "https://images.unsplash.com/photo-1599707781605-0a9d7bb2c6f8?w=600&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8Nnx8bmFncHVyfGVufDB8fDB8fHww",
  
  // Default fallback for cities not in map
  "default": "https://images.unsplash.com/photo-1477959858617-67f85cf4f1df?q=80&w=1000&auto=format&fit=crop"
};

/**
 * Get city image URL
 * Returns mapped image or default fallback
 * 
 * @param cityName - Name of the city
 * @returns URL to the city image
 */
export function getCityImage(cityName: string | undefined | null): string {
  if (!cityName) return CITY_IMAGE_MAP["default"];
  
  // Try exact match first
  if (CITY_IMAGE_MAP[cityName]) {
    return CITY_IMAGE_MAP[cityName];
  }
  
  // Fallback for unknown cities
  return CITY_IMAGE_MAP["default"];
}

/**
 * Enrich city objects with images
 * 
 * @param cities - Array of city objects
 * @returns Array of cities with image URLs added
 */
export function enrichCitiesWithImages<T extends { name?: string }>(cities: T[]): (T & { image: string })[] {
  return cities.map(city => ({
    ...city,
    image: getCityImage(city.name)
  }));
}
