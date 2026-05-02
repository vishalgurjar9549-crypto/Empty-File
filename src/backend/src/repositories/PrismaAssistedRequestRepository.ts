import { getPrismaClient } from "../utils/prisma";
import { logger } from "../utils/logger";

export interface IAssistedRequest {
  id: string;
  name: string;
  phone: string;
  city: string;
  budget?: number | null;
  amount: number;
  paymentId: string;
  orderId: string;
  status: string;
  source: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateAssistedRequestInput {
  name: string;
  phone: string;
  city: string;
  budget?: number;
  paymentId: string;
  orderId: string;
}

/**
 * PrismaAssistedRequestRepository
 *
 * Handles persistence of assisted service requests
 * These are distinct from subscription payments - different use case
 */
export class PrismaAssistedRequestRepository {
  private prisma;

  constructor(prismaClient?: any) {
    this.prisma = prismaClient || getPrismaClient();
  }

  /**
   * Create a new assisted request
   *
   * ✅ CRITICAL: Always sets amount = 50000 (₹500), never accepts from frontend
   */
  async create(input: CreateAssistedRequestInput): Promise<IAssistedRequest> {
    try {
      const request = await this.prisma.assistedRequest.create({
        data: {
          name: input.name,
          phone: input.phone,
          city: input.city,
          budget: input.budget ?? null,
          amount: 50000, // ✅ HARDCODED: Always ₹500 (50000 paise)
          paymentId: input.paymentId,
          orderId: input.orderId,
          status: "PAID",
          source: "ASSISTED_UI",
        },
      });

      logger.info("Assisted request created", {
        id: request.id,
        name: request.name,
        city: request.city,
        paymentId: request.paymentId,
      });

      return request;
    } catch (error: any) {
      logger.error("Failed to create assisted request", {
        error: error.message,
        input,
      });
      console.error("❌ PRISMA ERROR:", error);

      throw error;
    }
  }

  /**
   * Find assisted request by ID
   */
  async findById(id: string): Promise<IAssistedRequest | null> {
    try {
      return await this.prisma.assistedRequest.findUnique({
        where: { id },
      });
    } catch (error: any) {
      logger.error("Failed to find assisted request", {
        error: error.message,
        id,
      });
      return null;
    }
  }

  /**
   * Find assisted request by payment ID
   */
  async findByPaymentId(paymentId: string): Promise<IAssistedRequest | null> {
    try {
      return await this.prisma.assistedRequest.findUnique({
        where: { paymentId },
      });
    } catch (error: any) {
      logger.error("Failed to find assisted request by payment ID", {
        error: error.message,
        paymentId,
      });
      return null;
    }
  }

  /**
   * Find assisted request by order ID
   */
  async findByOrderId(orderId: string): Promise<IAssistedRequest | null> {
    try {
      return await this.prisma.assistedRequest.findUnique({
        where: { orderId },
      });
    } catch (error: any) {
      logger.error("Failed to find assisted request by order ID", {
        error: error.message,
        orderId,
      });
      return null;
    }
  }

  /**
   * Find all assisted requests for a city
   */
  async findByCity(city: string): Promise<IAssistedRequest[]> {
    try {
      return await this.prisma.assistedRequest.findMany({
        where: { city },
        orderBy: { createdAt: "desc" },
      });
    } catch (error: any) {
      logger.error("Failed to find assisted requests by city", {
        error: error.message,
        city,
      });
      return [];
    }
  }

  /**
   * Get all assisted requests with pagination
   */
  async findAll(
    page: number = 1,
    limit: number = 20,
  ): Promise<{
    requests: IAssistedRequest[];
    total: number;
  }> {
    try {
      const skip = (page - 1) * limit;
      const [requests, total] = await Promise.all([
        this.prisma.assistedRequest.findMany({
          skip,
          take: limit,
          orderBy: { createdAt: "desc" },
        }),
        this.prisma.assistedRequest.count(),
      ]);

      return { requests, total };
    } catch (error: any) {
      logger.error("Failed to find assisted requests", {
        error: error.message,
      });
      return { requests: [], total: 0 };
    }
  }

  /**
   * Get count of requests by city
   */
  async countByCity(city: string): Promise<number> {
    try {
      return await this.prisma.assistedRequest.count({
        where: { city },
      });
    } catch (error: any) {
      logger.error("Failed to count assisted requests by city", {
        error: error.message,
        city,
      });
      return 0;
    }
  }

  /**
   * Get total count
   */
  async count(): Promise<number> {
    try {
      return await this.prisma.assistedRequest.count();
    } catch (error: any) {
      logger.error("Failed to count assisted requests", {
        error: error.message,
      });
      return 0;
    }
  }
}
