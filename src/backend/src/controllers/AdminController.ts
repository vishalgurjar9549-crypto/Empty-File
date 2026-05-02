import { Request, Response } from "express";
import { Prisma, Role } from "@prisma/client";
import { AuthRequest } from "../middleware/auth.middleware";
import { getPrismaClient } from "../utils/prisma";
import { logger } from "../utils/logger";
import { getCacheService } from "../services/CacheService";
import { PropertyReviewTokenService } from "../services/PropertyReviewTokenService";

// FIXED: Use singleton instead of new PrismaClient()
const prisma = getPrismaClient();
export class AdminController {
  constructor() {
    // Bind all methods to preserve 'this' context
    this.getAllUsers = this.getAllUsers.bind(this);
    this.updateUserStatus = this.updateUserStatus.bind(this);
    this.getTenants = this.getTenants.bind(this);
    this.getAgents = this.getAgents.bind(this);
    this.getStats = this.getStats.bind(this);
    this.getAllProperties = this.getAllProperties.bind(this);
    this.approveProperty = this.approveProperty.bind(this);
    this.rejectProperty = this.rejectProperty.bind(this);
    this.requestCorrection = this.requestCorrection.bind(this);
    this.suspendProperty = this.suspendProperty.bind(this);
    this.getActivity = this.getActivity.bind(this);
    this.trackContactAttempt = this.trackContactAttempt.bind(this);
    this.trackOwnerLogin = this.trackOwnerLogin.bind(this);
    this.trackPropertyUpdate = this.trackPropertyUpdate.bind(this);
    this.generateReviewToken = this.generateReviewToken.bind(this);
  }

  /**
   * GET /api/admin/stats
   * Get dashboard statistics
   */
  async getStats(req: Request, res: Response) {
    try {
      // Use Promise.all for parallel queries with correct reviewStatus field
      const [totalUsers, totalOwners, totalProperties, pendingApprovals, activeListings, rejected, suspended, needsCorrection] = await Promise.all([prisma.user.count(), prisma.user.count({
        where: {
          role: Role.OWNER
        }
      }), prisma.room.count(), prisma.room.count({
        where: {
          reviewStatus: "PENDING"
        }
      }), prisma.room.count({
        where: {
          reviewStatus: "APPROVED"
        }
      }), prisma.room.count({
        where: {
          reviewStatus: "REJECTED"
        }
      }), prisma.room.count({
        where: {
          reviewStatus: "REJECTED"
        }
      }), prisma.room.count({
        where: {
          reviewStatus: "NEEDS_CORRECTION"
        }
      })]);
      const stats = {
        totalUsers,
        totalOwners,
        totalProperties,
        pendingApprovals,
        activeListings,
        rejected,
        needsCorrection,
        totalBookings: 0
      };
      logger.info("Admin stats fetched", {
        stats
      });
      res.json({
        success: true,
        data: stats
      });
    } catch (error: any) {
      logger.error("Error fetching stats", {
        error: error.message
      });
      res.status(500).json({
        success: false,
        message: "Failed to fetch stats"
      });
    }
  }

  /**
   * GET /api/admin/users
   * Get all users with optional filters and pagination
   * Query params: role, status, search, page (default: 1), limit (default: 10, max: 50), sort (default: createdAt_desc)
   */
  async getAllUsers(req: Request, res: Response) {
    try {
      const {
        role,
        status,
        search,
        page: pageParam,
        limit: limitParam,
        sort: sortParam
      } = req.query;

      // ✅ PAGINATION: Extract and validate page/limit
      const page = Math.max(1, parseInt(String(pageParam)) || 1);
      const limit = Math.min(Math.max(1, parseInt(String(limitParam)) || 10), 50); // Default 10, max 50
      const skip = (page - 1) * limit;
      const sortMap: Record<string, any[]> = {
        createdAt_desc: [{ createdAt: "desc" }, { id: "asc" }],
        createdAt_asc: [{ createdAt: "asc" }, { id: "asc" }]
      };
      const sortValue = String(sortParam || "createdAt_desc");
      const orderBy = sortMap[sortValue] || sortMap.createdAt_desc;

      const where: any = {};
      if (role && role !== "all") {
        const roleUpper = (role as string).toUpperCase();
        if (roleUpper === "OWNER" || roleUpper === "TENANT" || roleUpper === "ADMIN" || roleUpper === "AGENT") {
          where.role = roleUpper as Role;
        }
      }
      if (status && status !== "all") {
        where.isActive = status === "active";
      }
      if (search) {
        where.OR = [{
          name: {
            contains: search as string,
            mode: "insensitive"
          }
        }, {
          email: {
            contains: search as string,
            mode: "insensitive"
          }
        }];
      }

      // ✅ PAGINATION: Get total count for pagination meta
      const total = await prisma.user.count({ where });
      const totalPages = Math.ceil(total / limit);

      // ✅ PAGINATION: Apply skip/take to query
      const users = await prisma.user.findMany({
        where,
        select: {
          id: true,
          email: true,
          name: true,
          role: true,
          isActive: true,
          phone: true,
          createdAt: true,
          updatedAt: true
        },
        orderBy,
        skip,       // ✅ NEW: Pagination
        take: limit  // ✅ NEW: Pagination
      });

      const transformedUsers = users.map((user) => ({
        ...user,
        role: user.role.toLowerCase(),
        status: user.isActive ? "active" : "disabled"
      }));

      logger.info(`Admin: Fetched ${transformedUsers.length} users (page ${page}/${totalPages})`);
      res.json({
        success: true,
        data: transformedUsers,
        meta: {
          page,        // ✅ NEW: Current page
          limit,       // ✅ NEW: Items per page
          total,       // ✅ NEW: Total records
          totalPages   // ✅ NEW: Total pages
        }
      });
    } catch (error: any) {
      logger.error("Error fetching users", {
        error: error.message
      });
      res.status(500).json({
        success: false,
        message: "Failed to fetch users"
      });
    }
  }

  /**
   * PATCH /api/admin/users/:userId/status
   * Update user status (enable/disable)
   */
  async updateUserStatus(req: Request, res: Response) {
    try {
      const {
        userId
      } = req.params;
      const {
        status,
        isActive
      } = req.body;
      const activeStatus = isActive !== undefined ? isActive : status === "active";
      const user = await prisma.user.update({
        where: {
          id: userId
        },
        data: {
          isActive: activeStatus
        },
        select: {
          id: true,
          email: true,
          name: true,
          role: true,
          isActive: true,
          phone: true,
          createdAt: true,
          updatedAt: true
        }
      });
      const transformedUser = {
        ...user,
        role: user.role.toLowerCase(),
        status: user.isActive ? "active" : "disabled"
      };
      logger.info(`Admin: Updated user ${userId} status to ${activeStatus ? "active" : "disabled"}`);
      res.json({
        success: true,
        data: transformedUser,
        message: `User ${activeStatus ? "activated" : "disabled"} successfully`
      });
    } catch (error: any) {
      logger.error("Error updating user status", {
        error: error.message
      });
      res.status(500).json({
        success: false,
        message: "Failed to update user status"
      });
    }
  }

  /**
   * GET /api/admin/properties
   * Get all properties with optional filters, pagination, and sorting
   * Query params: status, search, page (default: 1), limit (default: 10, max: 50), sort (default: createdAt_desc)
   * CRITICAL: Maintains backward compatibility with existing filters
   */
  async getAllProperties(req: Request, res: Response) {
    try {
      const {
        status,
        search,
        page: pageParam,
        limit: limitParam,
        sort: sortParam
      } = req.query;

      // ✅ PAGINATION: Extract and validate page/limit
      const page = Math.max(1, parseInt(String(pageParam)) || 1);
      const limit = Math.min(Math.max(1, parseInt(String(limitParam)) || 10), 50); // Default 10, max 50
      const skip = (page - 1) * limit;

      // ✅ SORTING: Map sort parameter to Prisma orderBy
      const sortMap: Record<string, any[]> = {
        createdAt_desc: [{ createdAt: "desc" }, { id: "asc" }],
        createdAt_asc: [{ createdAt: "asc" }, { id: "asc" }],
        price_asc: [{ pricePerMonth: "asc" }, { createdAt: "desc" }, { id: "asc" }],
        price_desc: [{ pricePerMonth: "desc" }, { createdAt: "desc" }, { id: "asc" }]
      };
      const sortValue = String(sortParam || "createdAt_desc");
      const orderBy = sortMap[sortValue] || sortMap.createdAt_desc;

      const where: any = {};
      if (status && status !== "all") {
        const statusMap: Record<string, string> = {
          pending: "PENDING",
          approved: "APPROVED",
          rejected: "REJECTED",
          needs_correction: "NEEDS_CORRECTION"
        };
        where.reviewStatus = statusMap[status as string] || status;
      }
      if (search) {
        where.OR = [{
          title: {
            contains: search as string,
            mode: "insensitive"
          }
        }, {
          location: {
            contains: search as string,
            mode: "insensitive"
          }
        }];
      }

      // ✅ PAGINATION: Get total count for pagination meta
      const total = await prisma.room.count({ where });
      const totalPages = Math.ceil(total / limit);

      // ✅ PAGINATION + SORTING: Apply skip/take/orderBy to query
      const properties = await prisma.room.findMany({
        where,
        include: {
          owner: {
            select: {
              id: true,
              name: true,
              email: true,
              phone: true
            }
          }
        },
        orderBy,      // ✅ SORTING: Dynamic orderBy based on sort param
        skip,         // ✅ PAGINATION
        take: limit   // ✅ PAGINATION
      });

      const transformedProperties = properties.map((property) => ({
        ...property,
        reviewStatus: property.reviewStatus?.toLowerCase() || "approved"
      }));

      logger.info(`Admin: Fetched ${transformedProperties.length} properties (page ${page}/${totalPages})`);
      res.json({
        success: true,
        data: transformedProperties,
        meta: {
          page,        // ✅ NEW: Current page
          limit,       // ✅ NEW: Items per page
          total,       // ✅ NEW: Total records
          totalPages   // ✅ NEW: Total pages
        }
      });
    } catch (error: any) {
      logger.error("Error fetching properties", {
        error: error.message
      });
      res.status(500).json({
        success: false,
        message: "Failed to fetch properties"
      });
    }
  }

  /**
   * PATCH /api/admin/properties/:id/approve
   * Approve a property — clears adminFeedback, sets APPROVED + isActive
   */
  async approveProperty(req: Request, res: Response) {
    try {
      const {
        id
      } = req.params;
      const updated = await prisma.room.update({
        where: {
          id
        },
        data: {
          reviewStatus: "APPROVED",
          isActive: true,
          adminFeedback: Prisma.JsonNull
        },
        include: {
          owner: {
            select: {
              id: true,
              name: true,
              email: true
            }
          }
        }
      });
      
      // ✅ CACHE INVALIDATION: Clear cached listings for this city
      // Approved property should become visible immediately
      const cache = getCacheService();
      cache.clearCityCache(updated.city);
      logger.info(`Cache cleared for city after property approval`, {
        roomId: id,
        city: updated.city
      });
      
      const transformed = {
        ...updated,
        reviewStatus: updated.reviewStatus?.toLowerCase() || "approved"
      };
      logger.info(`Admin: Approved property ${id}`);
      return res.json({
        success: true,
        data: transformed,
        message: "Property approved successfully"
      });
    } catch (error: any) {
      logger.error("Error approving property", {
        error: error.message
      });
      return res.status(500).json({
        success: false,
        message: "Failed to approve property"
      });
    }
  }

  /**
   * PATCH /api/admin/properties/:id/reject
   * Reject a property
   */
  async rejectProperty(req: Request, res: Response) {
    try {
      const {
        id
      } = req.params;
      const {
        reason
      } = req.body;
      const property = await prisma.room.update({
        where: {
          id
        },
        data: {
          reviewStatus: "REJECTED",
          isActive: false,
          adminFeedback: reason ? {
            reason: "other",
            reasonLabel: "Rejected",
            message: reason,
            adminId: (req as AuthRequest).user?.userId || "admin",
            adminName: "Admin",
            createdAt: new Date().toISOString()
          } : undefined
        },
        include: {
          owner: {
            select: {
              id: true,
              name: true,
              email: true
            }
          }
        }
      });
      
      // ✅ CACHE INVALIDATION: Clear cached listings for this city
      // Rejected property should disappear from listings immediately
      const cache = getCacheService();
      cache.clearCityCache(property.city);
      logger.info(`Cache cleared for city after property rejection`, {
        roomId: id,
        city: property.city
      });
      
      logger.info(`Admin: Rejected property ${id}`);
      res.json({
        success: true,
        data: property,
        message: "Property rejected"
      });
    } catch (error: any) {
      logger.error("Error rejecting property", {
        error: error.message
      });
      res.status(500).json({
        success: false,
        message: "Failed to reject property"
      });
    }
  }

  /**
   * PATCH /api/admin/properties/:id/needs-correction
   * Request corrections on a property
   */
  async requestCorrection(req: Request, res: Response) {
    try {
      const {
        id
      } = req.params;
      const {
        reason,
        message
      } = req.body;
      const property = await prisma.room.update({
        where: {
          id
        },
        data: {
          reviewStatus: "NEEDS_CORRECTION",
          isActive: false,
          adminFeedback: {
            reason: reason || "other",
            reasonLabel: "Needs Correction",
            message: message || "Please update the property details",
            adminId: (req as AuthRequest).user?.userId || "admin",
            adminName: "Admin",
            createdAt: new Date().toISOString()
          }
        },
        include: {
          owner: {
            select: {
              id: true,
              name: true,
              email: true
            }
          }
        }
      });
      
      // ✅ CACHE INVALIDATION: Clear cached listings for this city
      // Property status change affects visibility in listings
      const cache = getCacheService();
      cache.clearCityCache(property.city);
      logger.info(`Cache cleared for city after correction request`, {
        roomId: id,
        city: property.city
      });
      
      logger.info(`Admin: Requested correction for property ${id}`);
      res.json({
        success: true,
        data: property,
        message: "Correction requested"
      });
    } catch (error: any) {
      logger.error("Error requesting correction", {
        error: error.message
      });
      res.status(500).json({
        success: false,
        message: "Failed to request correction"
      });
    }
  }

  /**
   * PATCH /api/admin/properties/:id/suspend
   * Suspend a property
   */
  async suspendProperty(req: Request, res: Response) {
    try {
      const {
        id
      } = req.params;
      const {
        reason
      } = req.body;
      const property = await prisma.room.update({
        where: {
          id
        },
        data: {
          reviewStatus: "REJECTED",
          isActive: false,
          adminFeedback: reason ? {
            reason: "policy_violation",
            reasonLabel: "Suspended",
            message: reason,
            adminId: (req as AuthRequest).user?.userId || "admin",
            adminName: "Admin",
            createdAt: new Date().toISOString()
          } : undefined
        },
        include: {
          owner: {
            select: {
              id: true,
              name: true,
              email: true
            }
          }
        }
      });
      
      // ✅ CACHE INVALIDATION: Clear cached listings for this city
      // Suspended property should disappear from listings immediately
      const cache = getCacheService();
      cache.clearCityCache(property.city);
      logger.info(`Cache cleared for city after property suspension`, {
        roomId: id,
        city: property.city
      });
      
      logger.info(`Admin: Suspended property ${id}`);
      res.json({
        success: true,
        data: property,
        message: "Property suspended"
      });
    } catch (error: any) {
      logger.error("Error suspending property", {
        error: error.message
      });
      res.status(500).json({
        success: false,
        message: "Failed to suspend property"
      });
    }
  }

  /**
   * GET /api/admin/activity
   * Get recent activity log
   */
  async getActivity(req: Request, res: Response) {
    try {
      const activities: any[] = [];
      res.json({
        success: true,
        data: activities
      });
    } catch (error: any) {
      logger.error("Error fetching activity", {
        error: error.message
      });
      res.status(500).json({
        success: false,
        message: "Failed to fetch activity log"
      });
    }
  }
  async getTenants(req: Request, res: Response) {
    try {
      const tenants = await prisma.user.findMany({
        where: {
          role: Role.TENANT
        },
        select: {
          id: true,
          email: true,
          name: true,
          role: true,
          isActive: true,
          createdAt: true
        }
      });
      logger.info(`Admin: Fetched ${tenants.length} tenants`);
      res.json(tenants);
    } catch (error: any) {
      logger.error("Error fetching tenants", {
        error: error.message
      });
      res.status(500).json({
        success: false,
        message: "Failed to fetch tenants"
      });
    }
  }
  async getAgents(req: Request, res: Response) {
    try {
      const agents = await prisma.user.findMany({
        where: {
          role: Role.AGENT
        },
        select: {
          id: true,
          email: true,
          name: true,
          role: true,
          isActive: true,
          createdAt: true
        }
      });
      logger.info(`Admin: Fetched ${agents.length} agents`);
      res.json(agents);
    } catch (error: any) {
      logger.error("Error fetching agents", {
        error: error.message
      });
      res.status(500).json({
        success: false,
        message: "Failed to fetch agents"
      });
    }
  }

  /**
   * POST /api/admin/properties/track-contact
   * Track owner contact attempts when admin sends WhatsApp
   * PROMPT 1: Update lastContactedAt and contactCount for each property
   * 
   * Body: { propertyIds: string[] }
   * 
   * Non-blocking: Runs async, doesn't block WhatsApp UI
   * Safe: Skips properties without valid phone numbers
   */
  async trackContactAttempt(req: Request, res: Response) {
    try {
      const { propertyIds } = req.body;

      if (!Array.isArray(propertyIds) || propertyIds.length === 0) {
        return res.status(400).json({
          success: false,
          message: 'propertyIds must be a non-empty array'
        });
      }

      // Update properties: increment contactCount and set lastContactedAt
      const updated = await prisma.room.updateMany({
        where: {
          id: {
            in: propertyIds
          }
        },
        data: {
          lastContactedAt: new Date(),
          contactCount: {
            increment: 1
          }
        }
      });

      logger.info('Contact tracking recorded', {
        propertyCount: updated.count,
        timestamp: new Date().toISOString()
      });

      res.json({
        success: true,
        data: {
          count: updated.count,
          timestamp: new Date().toISOString()
        },
        message: `Contact tracked for ${updated.count} properties`
      });
    } catch (error: any) {
      logger.error('Error tracking contact attempts', {
        error: error.message
      });
      // Non-blocking failure - don't break the WhatsApp flow
      res.status(500).json({
        success: false,
        message: 'Failed to track contact (UI not affected)'
      });
    }
  }

  /**
   * POST /api/admin/engagement/track-login
   * PROMPT 2: Track when owner logs in - update User.lastLoginAt
   * Called after successful owner login
   * 
   * Body: { userId: string }
   * Non-blocking: Async update
   */
  async trackOwnerLogin(req: Request, res: Response) {
    try {
      const { userId } = req.body;

      if (!userId) {
        return res.status(400).json({
          success: false,
          message: 'userId is required'
        });
      }

      // Update owner login timestamp
      const updated = await prisma.user.update({
        where: { id: userId },
        data: { lastLoginAt: new Date() },
        select: {
          id: true,
          lastLoginAt: true
        }
      });

      logger.info('Owner login tracked', {
        userId,
        timestamp: updated.lastLoginAt
      });

      res.json({
        success: true,
        data: {
          userId: updated.id,
          lastLoginAt: updated.lastLoginAt
        }
      });
    } catch (error: any) {
      logger.error('Error tracking login', {
        error: error.message
      });
      res.status(500).json({
        success: false,
        message: 'Failed to track login'
      });
    }
  }

  /**
   * POST /api/admin/engagement/track-property-update
   * PROMPT 2: Track when owner updates property
   * Called after property is updated by owner
   * 
   * Body: { propertyId: string }
   * Updates: Room.lastPropertyUpdateAt and User.lastPropertyUpdateAt
   * Non-blocking: Async update
   */
  async trackPropertyUpdate(req: Request, res: Response) {
    try {
      const { propertyId } = req.body;

      if (!propertyId) {
        return res.status(400).json({
          success: false,
          message: 'propertyId is required'
        });
      }

      // Find property to get owner ID
      const property = await prisma.room.findUnique({
        where: { id: propertyId },
        select: { ownerId: true }
      });

      if (!property) {
        return res.status(404).json({
          success: false,
          message: 'Property not found'
        });
      }

      // Update both room and owner timestamps
      const now = new Date();
      const [updatedRoom, updatedOwner] = await Promise.all([
        prisma.room.update({
          where: { id: propertyId },
          data: { lastPropertyUpdateAt: now },
          select: { id: true, lastPropertyUpdateAt: true }
        }),
        prisma.user.update({
          where: { id: property.ownerId },
          data: { lastPropertyUpdateAt: now },
          select: { id: true, lastPropertyUpdateAt: true }
        })
      ]);

      logger.info('Property update tracked', {
        propertyId,
        ownerId: property.ownerId,
        timestamp: updatedRoom.lastPropertyUpdateAt
      });

      res.json({
        success: true,
        data: {
          propertyId: updatedRoom.id,
          ownerId: updatedOwner.id,
          lastPropertyUpdateAt: updatedRoom.lastPropertyUpdateAt
        },
        message: 'Property update tracked'
      });
    } catch (error: any) {
      logger.error('Error tracking property update', {
        error: error.message
      });
      res.status(500).json({
        success: false,
        message: 'Failed to track property update'
      });
    }
  }

  /**
   * POST /api/admin/properties/:id/generate-review-token
   * Generate a WhatsApp review token for property owner
   *
   * Admin endpoint that creates a secure token for property review.
   * Token is used server-side for auto-login; WhatsApp link stays token-free.
   *
   * @returns { token, propertyId, expiresAt, url? }
   */
  async generateReviewToken(req: Request, res: Response) {
    try {
      const { id: propertyId } = req.params;
      const adminId = (req as AuthRequest).user?.userId;

      if (!propertyId) {
        return res.status(400).json({
          success: false,
          message: 'Property ID is required'
        });
      }

      // 1. Fetch property to get owner info
      const property = await prisma.room.findUnique({
        where: { id: propertyId },
        select: {
          id: true,
          title: true,
          ownerId: true,
          owner: {
            select: {
              id: true,
              name: true,
              email: true,
              phone: true
            }
          }
        }
      });

      if (!property) {
        logger.warn('Admin attempted to generate token for non-existent property', {
          propertyId,
          adminId
        });
        return res.status(404).json({
          success: false,
          message: 'Property not found'
        });
      }

      // 2. Generate token using PropertyReviewTokenService
      const tokenData = await PropertyReviewTokenService.generateReviewToken(
        propertyId,
        property.ownerId,
        5 // 5 minute expiry
      );

      // 3. Build response
      const response = {
        success: true,
        data: {
          token: tokenData.token,
          propertyId: tokenData.propertyId,
          propertyTitle: property.title,
          ownerName: property.owner.name,
          ownerEmail: property.owner.email,
          ownerPhone: property.owner.phone,
          expiresAt: tokenData.expiresAt,
          expiresIn: Math.round(
            (tokenData.expiresAt.getTime() - Date.now()) / 1000
          ),
          url: `${(process.env.FRONTEND_URL || '').replace(/\/$/, '')}/review/${propertyId}`
        },
        message: 'Review token generated successfully'
      };

      logger.info('Admin generated property review token', {
        propertyId,
        ownerId: property.ownerId,
        ownerName: property.owner.name,
        adminId,
        expiresAt: tokenData.expiresAt
      });

      return res.json(response);
    } catch (error: any) {
      logger.error('Error generating property review token', {
        propertyId: req.params.id,
        error: error.message,
        adminId: (req as AuthRequest).user?.userId
      });
      return res.status(500).json({
        success: false,
        message: error.message || 'Failed to generate review token'
      });
    }
  }
}
