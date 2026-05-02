import { Router, Request, Response } from "express";
import { ReviewStatus } from "@prisma/client";
import { logger } from "../utils/logger";
import { getPrismaClient } from "../utils/prisma";

const router = Router();
const prisma = getPrismaClient();

/**
 * @route   GET /api/homepage-data
 * @desc    Combined homepage data in single request
 * @access  Public
 * @optimization Batches all homepage queries together
 * ✅ Keeps existing APIs working
 * ✅ Single HTTP request instead of 3-4 requests
 */
router.get("/", async (req: Request, res: Response) => {
  try {
    const homepageRooms = await prisma.$queryRaw<
      Array<{
        listType: "featured" | "latest";
        listRank: bigint | number;
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
      }>
    >`
      WITH approved_rooms AS MATERIALIZED (
        SELECT
          id,
          title,
          description,
          city,
          location,
          "pricePerMonth",
          "roomType",
          images,
          rating,
          "reviewsCount",
          "ownerId",
          "isPopular",
          "createdAt",
          "updatedAt"
        FROM "Room"
        WHERE "isActive" = true
          AND "reviewStatus" = ${ReviewStatus.APPROVED}::"ReviewStatus"
      ),
      featured AS (
        SELECT
          'featured' AS "listType",
          ROW_NUMBER() OVER (
            ORDER BY "isPopular" DESC, "createdAt" DESC, id ASC
          ) AS "listRank",
          *
        FROM approved_rooms
        ORDER BY "isPopular" DESC, "createdAt" DESC, id ASC
        LIMIT 10
      ),
      latest AS (
        SELECT
          'latest' AS "listType",
          ROW_NUMBER() OVER (
            ORDER BY "createdAt" DESC, id ASC
          ) AS "listRank",
          *
        FROM approved_rooms
        ORDER BY "createdAt" DESC, id ASC
        LIMIT 10
      )
      SELECT * FROM featured
      UNION ALL
      SELECT * FROM latest
      ORDER BY "listType", "listRank"
    `;

    const [homepageMeta] = await prisma.$queryRaw<
      Array<{
        cities: Array<{
          slug: string;
          name: string;
          state: string;
          totalListings: number;
        }>;
        totalProperties: number;
        totalCities: number;
        totalOwners: number;
      }>
    >`
      WITH approved_rooms AS MATERIALIZED (
        SELECT id, city, "ownerId"
        FROM "Room"
        WHERE "isActive" = true
          AND "reviewStatus" = ${ReviewStatus.APPROVED}::"ReviewStatus"
      ),
      city_counts AS (
        SELECT
          c.slug,
          c.name,
          c.state,
          COUNT(ar.id)::int AS "totalListings"
        FROM "City" c
        JOIN approved_rooms ar ON ar.city = c.slug
        WHERE c."isActive" = true
        GROUP BY c.id, c.slug, c.name, c.state
        ORDER BY "totalListings" DESC
        LIMIT 20
      ),
      grouped_stats AS (
        SELECT
          GROUPING(city) AS city_grouped,
          GROUPING("ownerId") AS owner_grouped,
          COUNT(*)::int AS row_count
        FROM approved_rooms
        GROUP BY GROUPING SETS ((), (city), ("ownerId"))
      ),
      platform_stats AS (
        SELECT
          COALESCE(
            MAX(row_count) FILTER (
              WHERE city_grouped = 1 AND owner_grouped = 1
            ),
            0
          )::int AS "totalProperties",
          COUNT(*) FILTER (
            WHERE city_grouped = 0 AND owner_grouped = 1
          )::int AS "totalCities",
          COUNT(*) FILTER (
            WHERE city_grouped = 1 AND owner_grouped = 0
          )::int AS "totalOwners"
        FROM grouped_stats
      )
      SELECT
        COALESCE(
          (
            SELECT jsonb_agg(
              jsonb_build_object(
                'slug', slug,
                'name', name,
                'state', state,
                'totalListings', "totalListings"
              )
              ORDER BY "totalListings" DESC
            )
            FROM city_counts
          ),
          '[]'::jsonb
        ) AS cities,
        ps."totalProperties",
        ps."totalCities",
        ps."totalOwners"
      FROM platform_stats ps
    `;

    const featuredRooms = homepageRooms
      .filter((room) => room.listType === "featured")
      .sort((a, b) => Number(a.listRank) - Number(b.listRank))
      .map(({ listType, listRank, ...room }) => room);
    const latestRooms = homepageRooms
      .filter((room) => room.listType === "latest")
      .sort((a, b) => Number(a.listRank) - Number(b.listRank))
      .map(({ listType, listRank, ...room }) => room);
    const citiesData = homepageMeta?.cities ?? [];
    const platformStats = {
      totalProperties: homepageMeta?.totalProperties ?? 0,
      totalCities: homepageMeta?.totalCities ?? 0,
      totalOwners: homepageMeta?.totalOwners ?? 0,
    };

    res.json({
      success: true,
      data: {
        featured: featuredRooms,
        latest: latestRooms,
        cities: citiesData.map((c) => ({
          id: c.slug,
          name: c.name,
          state: c.state,
          totalListings: c.totalListings,
        })),
        stats: platformStats,
      },
    });
  } catch (error) {
    logger.error("Error fetching homepage data", {
      error: error instanceof Error ? error.message : "Unknown error",
    });
    res.status(500).json({
      success: false,
      message: "Failed to load homepage data",
    });
  }
});

export default router;
