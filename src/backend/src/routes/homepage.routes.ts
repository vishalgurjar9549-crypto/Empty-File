import { Router, Request, Response } from 'express';
import { prisma as prismaInstance } from '../utils/prisma';
import { getPrismaClient } from '../utils/prisma';
import { ReviewStatus } from '@prisma/client';
import { logger } from '../utils/logger';
import { StatsService } from '../services/StatsService';

const router = Router();
const prisma = getPrismaClient();

/**
 * @route   GET /api/homepage-data
 * @desc    Combined homepage data in single request
 * @access  Public
 * @optimization Batches all homepage queries together
 * ✅ Keeps existing APIs working
 * ✅ Single HTTP request instead of 3-4 requests
 * ✅ All queries run in parallel via Promise.all()
 */
router.get('/', async (req: Request, res: Response) => {
  try {
    const statsService = new StatsService();

    // ✅ PARALLEL QUERIES: All run simultaneously due to Promise.all()
    // With connection pool fixed to 20, these all execute in parallel
    const [featuredRooms, latestRooms, citiesData, platformStats] = await Promise.all([
      // Fetch featured rooms (most viewed this week)
      prisma.$queryRaw<Array<{
        id: string;
        title: string;
        description: string;
        city: string;
        location: string;
        pricePerMonth: number;
        roomType: string;
        images: string[];
        rating: number;
        reviewsCount: number;
        ownerId: string;
        isPopular: boolean;
        createdAt: Date;
        updatedAt: Date;
      }>>`
        SELECT DISTINCT ON (r.id) 
          r.id,
          r.title,
          r.description,
          r.city,
          r.location,
          r."pricePerMonth",
          r."roomType",
          r.images,
          r.rating,
          r."reviewsCount",
          r."ownerId",
          r."isPopular",
          r."createdAt",
          r."updatedAt"
        FROM "Room" r
        LEFT JOIN "Event" e ON r.id = e."propertyId" 
          AND e.type = 'PROPERTY_VIEW' 
          AND e."createdAt" >= NOW() - INTERVAL '7 days'
        WHERE r."isActive" = true 
          AND r."reviewStatus" = ${ReviewStatus.APPROVED}
        GROUP BY r.id
        ORDER BY r.id, COUNT(e.id) DESC
        LIMIT 10
      `,
      
      // Fetch latest rooms
      prisma.room.findMany({
        where: {
          isActive: true,
          reviewStatus: ReviewStatus.APPROVED,
        },
        orderBy: { createdAt: 'desc' },
        take: 10,
        select: {
          id: true,
          title: true,
          description: true,
          city: true,
          location: true,
          pricePerMonth: true,
          roomType: true,
          images: true,
          rating: true,
          reviewsCount: true,
          ownerId: true,
          isPopular: true,
          createdAt: true,
          updatedAt: true,
        },
      }),

      // Fetch cities with room counts
      prisma.$queryRaw<Array<{
        slug: string;
        name: string;
        state: string;
        totalListings: number;
      }>>`
        SELECT 
          c.slug,
          c.name,
          c.state,
          COUNT(r.id)::int as "totalListings"
        FROM "City" c
        LEFT JOIN "Room" r ON c.slug = r.city 
          AND r."isActive" = true 
          AND r."reviewStatus" = ${ReviewStatus.APPROVED}
        WHERE c."isActive" = true
        GROUP BY c.id, c.slug, c.name, c.state
        HAVING COUNT(r.id) > 0
        ORDER BY "totalListings" DESC
        LIMIT 20
      `,

      // Fetch platform stats
      statsService.getPlatformStats(),
    ]);

    res.json({
      success: true,
      data: {
        featured: featuredRooms,
        latest: latestRooms,
        cities: citiesData.map(c => ({
          id: c.slug,
          name: c.name,
          state: c.state,
          totalListings: c.totalListings,
        })),
        stats: platformStats,
      },
    });
  } catch (error) {
    logger.error('Error fetching homepage data', {
      error: error instanceof Error ? error.message : 'Unknown error',
    });
    res.status(500).json({
      success: false,
      message: 'Failed to load homepage data',
    });
  }
});

export default router;
