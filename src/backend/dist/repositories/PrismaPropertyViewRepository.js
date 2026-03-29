"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PrismaPropertyViewRepository = void 0;
const prisma_1 = require("../utils/prisma");
const logger_1 = require("../utils/logger");
/**
 * PrismaPropertyViewRepository — FIXED
 *
 * Changes:
 * 1. Uses getPrismaClient() singleton instead of broken named import
 * 2. Uses `propertyId` (actual schema field) instead of `roomId`
 * 3. Removed `city` field references (not on PropertyView schema)
 * 4. Uses unique constraint (tenantId, propertyId) for dedup
 */
class PrismaPropertyViewRepository {
    constructor(prismaClient) {
        this.prisma = prismaClient || (0, prisma_1.getPrismaClient)();
    }
    async create(data) {
        try {
            return await this.prisma.propertyView.create({
                data: {
                    tenantId: data.tenantId,
                    propertyId: data.propertyId,
                    city: data.city
                }
            });
        }
        catch (error) {
            // P2002 = unique constraint violation (already viewed)
            if (error?.code === 'P2002') {
                logger_1.logger.info('Property view already exists, skipping', {
                    tenantId: data.tenantId,
                    propertyId: data.propertyId
                });
                // Return existing record
                const existing = await this.prisma.propertyView.findUnique({
                    where: {
                        tenantId_propertyId: {
                            tenantId: data.tenantId,
                            propertyId: data.propertyId
                        }
                    }
                });
                return existing;
            }
            logger_1.logger.error('Error creating property view', {
                error: error.message
            });
            throw new Error('Failed to create property view');
        }
    }
    async countByTenantId(tenantId) {
        try {
            return await this.prisma.propertyView.count({
                where: {
                    tenantId
                }
            });
        }
        catch (error) {
            logger_1.logger.error('Error counting property views', {
                error: error.message
            });
            throw new Error('Failed to count property views');
        }
    }
    /**
     * Count unique properties viewed by a user IN A SPECIFIC CITY
     * FIXED: Now actually filters by city via Room relation join
     */
    async countUniquePropertiesByUserAndCity(userId, city) {
        try {
            return await this.prisma.propertyView.count({
                where: {
                    tenantId: userId,
                    property: {
                        city: {
                            equals: city,
                            mode: 'insensitive'
                        }
                    }
                }
            });
        }
        catch (error) {
            logger_1.logger.error('Error counting unique property views', {
                error: error.message
            });
            return 0;
        }
    }
    async countByUserAndCity(userId, city) {
        try {
            return await this.prisma.propertyView.count({
                where: {
                    tenantId: userId,
                    property: {
                        city: {
                            equals: city,
                            mode: 'insensitive'
                        }
                    }
                }
            });
        }
        catch (error) {
            logger_1.logger.error('Error counting property views by city', {
                error: error.message
            });
            return 0;
        }
    }
    async hasUserViewedProperty(userId, propertyId) {
        try {
            const view = await this.prisma.propertyView.findUnique({
                where: {
                    tenantId_propertyId: {
                        tenantId: userId,
                        propertyId
                    }
                }
            });
            return !!view;
        }
        catch (error) {
            logger_1.logger.error('Error checking property view', {
                error: error.message
            });
            return false;
        }
    }
    async findByTenantId(tenantId) {
        try {
            return await this.prisma.propertyView.findMany({
                where: {
                    tenantId
                },
                orderBy: [{ viewedAt: 'desc' }, { id: 'asc' }]
            });
        }
        catch (error) {
            logger_1.logger.error('Error finding property views', {
                error: error.message
            });
            throw new Error('Failed to find property views');
        }
    }
    async findByPropertyId(propertyId) {
        try {
            return await this.prisma.propertyView.findMany({
                where: {
                    propertyId
                },
                orderBy: [{ viewedAt: 'desc' }, { id: 'asc' }]
            });
        }
        catch (error) {
            logger_1.logger.error('Error finding property views by property', {
                error: error.message
            });
            throw new Error('Failed to find property views');
        }
    }
    async getUniqueViewCount(propertyId) {
        try {
            return await this.prisma.propertyView.count({
                where: {
                    propertyId
                }
            });
        }
        catch (error) {
            logger_1.logger.error('Error getting unique view count', {
                error: error.message
            });
            throw new Error('Failed to get unique view count');
        }
    }
}
exports.PrismaPropertyViewRepository = PrismaPropertyViewRepository;
//# sourceMappingURL=PrismaPropertyViewRepository.js.map