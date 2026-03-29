"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const prisma_1 = require("../utils/prisma");
const router = (0, express_1.Router)();
// Amenities list (static — no DB needed)
const amenitiesList = ['WiFi', 'AC', 'Attached Bathroom', 'Kitchen', 'Parking', 'Power Backup', 'TV', 'Fridge', 'Washing Machine', 'Security'];
/**
 * @route   GET /api/metadata/cities
 * @desc    Get cities with active rooms, sorted by listing count DESC
 * @access  Public
 * @usage   Homepage popular cities section
 */
router.get('/cities', async (req, res) => {
    try {
        // Count active rooms per city slug in one query
        const roomCounts = await prisma_1.prisma.room.groupBy({
            by: ['city'],
            where: {
                isActive: true
            },
            _count: {
                id: true
            }
        });
        // Build a fast O(1) lookup map: slug → count
        const countMap = new Map(roomCounts.map((r) => [r.city, r._count.id]));
        // Get city slugs that have active rooms
        const citySlugsWithRooms = Array.from(countMap.keys());
        // Fetch only cities that have active rooms
        const cities = await prisma_1.prisma.city.findMany({
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
            if (d !== 0)
                return d;
            return a.id.localeCompare(b.id);
        });
        res.json({
            success: true,
            data
        });
    }
    catch (error) {
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
router.get('/cities/all', async (req, res) => {
    try {
        const cities = await prisma_1.prisma.city.findMany({
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
    }
    catch (error) {
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
router.get('/amenities', (req, res) => {
    res.json({
        success: true,
        data: amenitiesList
    });
});
exports.default = router;
//# sourceMappingURL=metadata.routes.js.map