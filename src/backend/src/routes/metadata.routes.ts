import { Router } from 'express';
import { Request, Response } from 'express';
import { prisma } from '../utils/prisma';
const router = Router();

// Amenities list (static — no DB needed)
const amenitiesList = ['WiFi', 'AC', 'Attached Bathroom', 'Kitchen', 'Parking', 'Power Backup', 'TV', 'Fridge', 'Washing Machine', 'Security'];

/**
 * @route   GET /api/metadata/cities
 * @desc    Get cities with active rooms, sorted by listing count DESC
 * @access  Public
 * @usage   Homepage popular cities section
 */
router.get('/cities', async (req: Request, res: Response) => {
  try {
    // Count active rooms per city slug in one query
    const roomCounts = await prisma.room.groupBy({
      by: ['city'],
      where: {
        isActive: true
      },
      _count: {
        id: true
      }
    });

    // Build a fast O(1) lookup map: slug → count
    const countMap = new Map<string, number>(roomCounts.map((r) => [r.city, r._count.id]));

    // Get city slugs that have active rooms
    const citySlugsWithRooms = Array.from(countMap.keys());

    // Fetch only cities that have active rooms
    const cities = await prisma.city.findMany({
      where: {
        isActive: true,
        slug: {
          in: citySlugsWithRooms
        }
      }
    });

    // Shape response and sort by listing count DESC
    const data = cities.map((city) => ({
      id: city.slug,
      // frontend uses city.id as the slug filter
      name: city.name,
      state: city.state,
      totalListings: countMap.get(city.slug) ?? 0
    })).sort((a, b) => {
      const d = b.totalListings - a.totalListings;
      if (d !== 0) return d;
      return a.id.localeCompare(b.id);
    });

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
router.get('/cities/all', async (req: Request, res: Response) => {
  try {
    const cities = await prisma.city.findMany({
      where: {
        isActive: true
      },
      orderBy: [{ name: 'asc' }, { id: 'asc' }]
    });
    const data = cities.map((city) => ({
      id: city.slug,
      name: city.name,
      state: city.state
    }));
    res.json({
      success: true,
      data
    });
  } catch (error) {
    console.error('[metadata/cities/all] Error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch cities'
    });
  }
});

/**
 * @route   GET /api/metadata/amenities
 * @desc    Get all available amenities
 * @access  Public
 */
router.get('/amenities', (req: Request, res: Response) => {
  res.json({
    success: true,
    data: amenitiesList
  });
});
export default router;