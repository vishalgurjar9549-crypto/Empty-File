/**
 * ============================================================================
 * AMENITIES CONFIGURATION - CENTRALIZED, SCALABLE, AND VALIDATED
 * ============================================================================
 * This is the single source of truth for all amenities across the platform.
 * 
 * Key Design Decisions:
 * 1. Structured with ID, label, category, and icon for flexibility
 * 2. Categorized into logical groups for better UX
 * 3. Marked priorities to highlight important amenities in UI
 * 4. Icons are icon names (using lucide-react) for frontend
 * 5. Backend validates against this list to prevent invalid data
 * 
 * Amenity IDs: Must be unique, lowercase, hyphen-separated (best practice for APIs)
 * ============================================================================
 */

export const AMENITY_CATEGORIES = {
  ESSENTIALS: 'essentials',
  ROOM_FEATURES: 'room-features',
  KITCHEN: 'kitchen',
  SAFETY: 'safety',
  CONVENIENCE: 'convenience',
} as const;

export type AmenityCategoryKey = typeof AMENITY_CATEGORIES[keyof typeof AMENITY_CATEGORIES];

export interface Amenity {
  /** Unique identifier: lowercase, hyphen-separated */
  id: string;
  
  /** User-facing label */
  label: string;
  
  /** Category key for grouping */
  category: AmenityCategoryKey;
  
  /** Icon name from lucide-react */
  icon: string;
  
  /** Whether this amenity should be highlighted as important */
  isPriority?: boolean;
  
  /** Brief description for tooltips */
  description?: string;
}

/**
 * AMENITIES MASTER LIST
 * Organized by category for better UX and scalability
 */
export const AMENITIES_LIST: Amenity[] = [
  // ========== ESSENTIALS ==========
  {
    id: 'wifi',
    label: 'WiFi',
    category: AMENITY_CATEGORIES.ESSENTIALS,
    icon: 'Wifi',
    isPriority: true,
    description: 'High-speed internet access',
  },
  {
    id: 'ac',
    label: 'AC / Air Conditioning',
    category: AMENITY_CATEGORIES.ESSENTIALS,
    icon: 'Wind',
    isPriority: true,
    description: 'Central or room air conditioning',
  },
  {
    id: 'fan',
    label: 'Fan',
    category: AMENITY_CATEGORIES.ESSENTIALS,
    icon: 'Wind',
    description: 'Ceiling or table fans',
  },
  {
    id: 'lighting',
    label: 'Adequate Lighting',
    category: AMENITY_CATEGORIES.ESSENTIALS,
    icon: 'Lightbulb',
    description: 'Natural and artificial lighting',
  },
  {
    id: 'power-backup',
    label: 'Power Backup / UPS',
    category: AMENITY_CATEGORIES.ESSENTIALS,
    icon: 'Zap',
    isPriority: true,
    description: 'Generator or inverter backup',
  },

  // ========== ROOM FEATURES ==========
  {
    id: 'attached-bathroom',
    label: 'Attached Bathroom',
    category: AMENITY_CATEGORIES.ROOM_FEATURES,
    icon: 'Bath',
    isPriority: true,
    description: 'Private bathroom in room',
  },
  {
    id: 'shared-bathroom',
    label: 'Shared Bathroom',
    category: AMENITY_CATEGORIES.ROOM_FEATURES,
    icon: 'Bath',
    description: 'Common bathroom facility',
  },
  {
    id: 'hot-water',
    label: 'Hot Water',
    category: AMENITY_CATEGORIES.ROOM_FEATURES,
    icon: 'Droplets',
    isPriority: true,
    description: '24/7 hot water supply',
  },
  {
    id: 'furnished',
    label: 'Furnished',
    category: AMENITY_CATEGORIES.ROOM_FEATURES,
    icon: 'Sofa',
    isPriority: true,
    description: 'Includes bed, desk, furniture',
  },
  {
    id: 'semi-furnished',
    label: 'Semi-Furnished',
    category: AMENITY_CATEGORIES.ROOM_FEATURES,
    icon: 'Sofa',
    description: 'Partial furnishing',
  },
  {
    id: 'unfurnished',
    label: 'Unfurnished',
    category: AMENITY_CATEGORIES.ROOM_FEATURES,
    icon: 'Home',
    description: 'Empty room',
  },
  {
    id: 'wardrobe',
    label: 'Wardrobe / Storage',
    category: AMENITY_CATEGORIES.ROOM_FEATURES,
    icon: 'Box',
    description: 'Cupboard or storage space',
  },
  {
    id: 'study-table',
    label: 'Study Table / Desk',
    category: AMENITY_CATEGORIES.ROOM_FEATURES,
    icon: 'Laptop',
    description: 'Dedicated desk for work/study',
  },
  {
    id: 'window',
    label: 'Window / Natural Light',
    category: AMENITY_CATEGORIES.ROOM_FEATURES,
    icon: 'Sun',
    description: 'Room has windows',
  },
  {
    id: 'balcony',
    label: 'Balcony / Terrace',
    category: AMENITY_CATEGORIES.ROOM_FEATURES,
    icon: 'Square',
    description: 'Private outdoor space',
  },

  // ========== KITCHEN ==========
  {
    id: 'kitchen',
    label: 'Kitchen Access',
    category: AMENITY_CATEGORIES.KITCHEN,
    icon: 'ChefHat',
    description: 'Access to cooking facilities',
  },
  {
    id: 'fridge',
    label: 'Refrigerator',
    category: AMENITY_CATEGORIES.KITCHEN,
    icon: 'Refrigerator',
    isPriority: true,
    description: 'Personal or shared fridge',
  },
  {
    id: 'microwave',
    label: 'Microwave',
    category: AMENITY_CATEGORIES.KITCHEN,
    icon: 'Microwave',
    description: 'For quick reheating',
  },
  {
    id: 'gas-stove',
    label: 'Gas Stove / Cooktop',
    category: AMENITY_CATEGORIES.KITCHEN,
    icon: 'ChefHat',
    description: 'For cooking',
  },
  {
    id: 'water-purifier',
    label: 'Water Purifier',
    category: AMENITY_CATEGORIES.KITCHEN,
    icon: 'Droplets',
    description: 'Purified drinking water',
  },
  {
    id: 'cooking-utensils',
    label: 'Cooking Utensils Provided',
    category: AMENITY_CATEGORIES.KITCHEN,
    icon: 'Utensils',
    description: 'Pots, pans, dishes available',
  },

  // ========== SAFETY ==========
  {
    id: 'security-deposit',
    label: 'Security System',
    category: AMENITY_CATEGORIES.SAFETY,
    icon: 'Shield',
    isPriority: true,
    description: 'CCTV or security monitoring',
  },
  {
    id: 'secure-entry',
    label: 'Secure Entry / Lock',
    category: AMENITY_CATEGORIES.SAFETY,
    icon: 'Lock',
    isPriority: true,
    description: 'Secure door locks',
  },
  {
    id: 'lift',
    label: 'Lift / Elevator',
    category: AMENITY_CATEGORIES.SAFETY,
    icon: 'ArrowUp',
    isPriority: true,
    description: 'For upper floors',
  },
  {
    id: 'fire-extinguisher',
    label: 'Fire Extinguisher',
    category: AMENITY_CATEGORIES.SAFETY,
    icon: 'AlertTriangle',
    description: 'Emergency fire safety',
  },
  {
    id: 'first-aid',
    label: 'First Aid Kit',
    category: AMENITY_CATEGORIES.SAFETY,
    icon: 'Heart',
    description: 'Basic medical supplies',
  },

  // ========== CONVENIENCE ==========
  {
    id: 'parking',
    label: 'Parking Available',
    category: AMENITY_CATEGORIES.CONVENIENCE,
    icon: 'Car',
    isPriority: true,
    description: 'Bike/car parking facility',
  },
  {
    id: 'laundry',
    label: 'Washing Machine',
    category: AMENITY_CATEGORIES.CONVENIENCE,
    icon: 'Waves',
    isPriority: true,
    description: 'In-room or shared washing machine',
  },
  {
    id: 'dryer',
    label: 'Dryer',
    category: AMENITY_CATEGORIES.CONVENIENCE,
    icon: 'Waves',
    description: 'Clothes dryer',
  },
  {
    id: 'housekeeping',
    label: 'Housekeeping Service',
    category: AMENITY_CATEGORIES.CONVENIENCE,
    icon: 'Sparkles',
    description: 'Regular cleaning service',
  },
  {
    id: 'tv',
    label: 'TV / Entertainment',
    category: AMENITY_CATEGORIES.CONVENIENCE,
    icon: 'Monitor',
    description: 'Television in room',
  },
  {
    id: 'gym',
    label: 'Gym / Fitness',
    category: AMENITY_CATEGORIES.CONVENIENCE,
    icon: 'Dumbbell',
    description: 'Fitness center access',
  },
  {
    id: 'common-area',
    label: 'Common Area / Lounge',
    category: AMENITY_CATEGORIES.CONVENIENCE,
    icon: 'Users',
    description: 'Shared living space',
  },
  {
    id: 'visitor-parking',
    label: 'Visitor Parking',
    category: AMENITY_CATEGORIES.CONVENIENCE,
    icon: 'MapPin',
    description: 'Parking for guests',
  },
  {
    id: 'pet-friendly',
    label: 'Pet Friendly',
    category: AMENITY_CATEGORIES.CONVENIENCE,
    icon: 'Heart',
    description: 'Pets are allowed',
  },
  {
    id: 'bike-storage',
    label: 'Bike Storage',
    category: AMENITY_CATEGORIES.CONVENIENCE,
    icon: 'Bike',
    description: 'Secure bike storage',
  },
];

/**
 * Create a map for O(1) lookups by ID
 * Used for validation and quick access
 */
export const AMENITY_MAP = new Map<string, Amenity>(
  AMENITIES_LIST.map((amenity) => [amenity.id, amenity])
);

/**
 * Get amenities grouped by category
 * Used for UI rendering with categories
 */
export const getAmenitiesByCategory = (): Record<AmenityCategoryKey, Amenity[]> => {
  const grouped: Record<AmenityCategoryKey, Amenity[]> = {
    [AMENITY_CATEGORIES.ESSENTIALS]: [],
    [AMENITY_CATEGORIES.ROOM_FEATURES]: [],
    [AMENITY_CATEGORIES.KITCHEN]: [],
    [AMENITY_CATEGORIES.SAFETY]: [],
    [AMENITY_CATEGORIES.CONVENIENCE]: [],
  };

  AMENITIES_LIST.forEach((amenity) => {
    grouped[amenity.category].push(amenity);
  });

  return grouped;
};

/**
 * Get category display labels
 */
export const CATEGORY_LABELS: Record<AmenityCategoryKey, string> = {
  [AMENITY_CATEGORIES.ESSENTIALS]: 'Essentials',
  [AMENITY_CATEGORIES.ROOM_FEATURES]: 'Room Features',
  [AMENITY_CATEGORIES.KITCHEN]: 'Kitchen',
  [AMENITY_CATEGORIES.SAFETY]: 'Safety & Security',
  [AMENITY_CATEGORIES.CONVENIENCE]: 'Convenience',
};

/**
 * Validate if an amenity ID is allowed
 * Used on backend for request validation
 */
export const isValidAmenityId = (id: string): boolean => {
  return AMENITY_MAP.has(id);
};

/**
 * Validate an array of amenity IDs
 * Used on backend during room creation/update
 */
export const validateAmenityIds = (ids: unknown): { valid: boolean; invalidIds: string[] } => {
  if (!Array.isArray(ids)) {
    return { valid: false, invalidIds: [] };
  }

  const invalidIds = ids.filter((id) => typeof id !== 'string' || !isValidAmenityId(id));
  return {
    valid: invalidIds.length === 0,
    invalidIds: invalidIds as string[],
  };
};

/**
 * Get amenity details by ID
 * Returns undefined if not found
 */
export const getAmenityById = (id: string): Amenity | undefined => {
  return AMENITY_MAP.get(id);
};

/**
 * Get all valid amenity IDs
 */
export const getAllAmenityIds = (): string[] => {
  return Array.from(AMENITY_MAP.keys());
};

/**
 * Get priority amenities (important ones to highlight)
 */
export const getPriorityAmenities = (): Amenity[] => {
  return AMENITIES_LIST.filter((amenity) => amenity.isPriority);
};
