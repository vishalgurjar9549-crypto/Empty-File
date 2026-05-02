import { Router } from "express";
import { Request, Response } from "express";
import { getPrismaClient } from "../utils/prisma";
import {
  AMENITIES_LIST,
  getAmenitiesByCategory,
  CATEGORY_LABELS,
  AMENITY_CATEGORIES,
} from "../config/amenities.config";

const router = Router();
const prisma = getPrismaClient();
let cachedCities: any = null;
let lastFetch = 0;
/**
 * @route   GET /api/metadata/cities
 * @desc    Get cities with active rooms, sorted by listing count DESC
 * @access  Public
 * @usage   Homepage popular cities section
 */
router.get('/cities', async (req: Request, res: Response) => {
  try {
    const now = Date.now();

    // ✅ CACHE (60 seconds)
    if (cachedCities && now - lastFetch < 60000) {
      return res.json({
        success: true,
        data: cachedCities
      });
    }

    // 🔥 Optimized query
    const roomCounts = await prisma.$queryRaw<
      { city: string; count: number }[]
    >`
      SELECT city, COUNT(*) as count
      FROM "Room"
      WHERE "isActive" = true
      GROUP BY city
    `;

    const countMap = new Map<string, number>(
      roomCounts.map((r) => [r.city, Number(r.count)])
    );

    const citySlugsWithRooms = Array.from(countMap.keys());

    const cities = await prisma.city.findMany({
      where: {
        isActive: true,
        slug: { in: citySlugsWithRooms }
      }
    });

    const data = cities
      .map((city) => ({
        id: city.slug,
        name: city.name,
        state: city.state,
        totalListings: countMap.get(city.slug) ?? 0
      }))
      .sort((a, b) => b.totalListings - a.totalListings);

    // ✅ SAVE CACHE
    cachedCities = data;
    lastFetch = now;

    res.json({
      success: true,
      data
    });

  } catch (error) {
    console.error('[metadata/cities] Error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch cities'
    });
  }
});

/**
 * @route   GET /api/metadata/cities/all
 * @desc    Get ALL active cities sorted alphabetically
 * @access  Public
 * @usage   Property creation forms, city selection dropdowns
 */
router.get("/cities/all", async (req: Request, res: Response) => {
  try {
    const cities = await prisma.city.findMany({
      where: {
        isActive: true,
      },
      orderBy: [{ name: "asc" }, { id: "asc" }],
    });
    const data = cities.map((city) => ({
      id: city.slug,
      name: city.name,
      state: city.state,
    }));
    res.json({
      success: true,
      data,
    });
  } catch (error) {
    console.error("[metadata/cities/all] Error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch cities",
    });
  }
});

/**
 * @route   GET /api/metadata/amenities
 * @desc    Get all amenities with full details (ID, label, category, icon, priority)
 * @access  Public
 * @usage   Frontend amenities form rendering
 */
router.get("/amenities", (req: Request, res: Response) => {
  res.json({
    success: true,
    data: AMENITIES_LIST,
  });
});

/**
 * @route   GET /api/metadata/amenities/grouped
 * @desc    Get amenities grouped by category for organized UI rendering
 * @access  Public
 * @usage   Categorized amenities form sections
 */
router.get("/amenities/grouped", (req: Request, res: Response) => {
  const grouped = getAmenitiesByCategory();

  // Format response with category labels
  const formattedResponse = Object.entries(grouped).map(
    ([categoryKey, amenities]) => ({
      id: categoryKey,
      label: CATEGORY_LABELS[categoryKey as keyof typeof CATEGORY_LABELS],
      amenities,
    }),
  );

  res.json({
    success: true,
    data: formattedResponse,
  });
});

/**
 * @route   GET /api/metadata/amenities/ids
 * @desc    Get only amenity IDs for validation purposes
 * @access  Public (Internal use)
 * @usage   Backend validation, API contract
 */
router.get("/amenities/ids", (req: Request, res: Response) => {
  res.json({
    success: true,
    data: AMENITIES_LIST.map((a) => a.id),
  });
});
export default router;
