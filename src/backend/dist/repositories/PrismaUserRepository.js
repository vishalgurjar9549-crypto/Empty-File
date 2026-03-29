"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PrismaUserRepository = void 0;
const prisma_1 = require("../utils/prisma");
const logger_1 = require("../utils/logger");
const AppErrors_1 = require("../errors/AppErrors");
class PrismaUserRepository {
    constructor(prismaClient) {
        this.prisma = prismaClient || (0, prisma_1.getPrismaClient)();
    }
    async create(data) {
        try {
            return await this.prisma.user.create({
                data
            });
        }
        catch (error) {
            logger_1.logger.error("Error creating user", {
                error: error.message,
                stack: error.stack
            });
            throw (0, AppErrors_1.mapPrismaError)(error);
        }
    }
    async findById(id) {
        try {
            return await this.prisma.user.findUnique({
                where: {
                    id
                }
            });
        }
        catch (error) {
            logger_1.logger.error("Error finding user by id", {
                error: error.message,
                stack: error.stack
            });
            throw (0, AppErrors_1.mapPrismaError)("Failed to find user");
        }
    }
    async findByEmail(email) {
        try {
            return await this.prisma.user.findUnique({
                where: {
                    email
                }
            });
        }
        catch (error) {
            logger_1.logger.error("Error finding user by email", {
                error: error.message,
                stack: error.stack
            });
            throw (0, AppErrors_1.mapPrismaError)("Failed to find user");
        }
    }
    async findByPhone(phone) {
        try {
            return await this.prisma.user.findUnique({
                where: {
                    phone
                }
            });
        }
        catch (error) {
            logger_1.logger.error("Error finding user by phone", {
                error: error.message,
                stack: error.stack
            });
            throw (0, AppErrors_1.mapPrismaError)("Failed to find user");
        }
    }
    async findAll() {
        try {
            return await this.prisma.user.findMany({
                orderBy: [{ createdAt: "desc" }, { id: "asc" }]
            });
        }
        catch (error) {
            logger_1.logger.error("Error finding all users", {
                error: error.message,
                stack: error.stack
            });
            throw (0, AppErrors_1.mapPrismaError)("Failed to find users");
        }
    }
    async update(id, data) {
        try {
            return await this.prisma.user.update({
                where: {
                    id
                },
                data
            });
        }
        catch (error) {
            logger_1.logger.error("Error updating user", {
                error: error.message,
                stack: error.stack
            });
            throw (0, AppErrors_1.mapPrismaError)("Failed to update user");
        }
    }
    async delete(id) {
        try {
            return await this.prisma.user.delete({
                where: {
                    id
                }
            });
        }
        catch (error) {
            logger_1.logger.error("Error deleting user", {
                error: error.message,
                stack: error.stack
            });
            throw (0, AppErrors_1.mapPrismaError)("Failed to delete user");
        }
    }
}
exports.PrismaUserRepository = PrismaUserRepository;
//# sourceMappingURL=PrismaUserRepository.js.map