"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UserRepository = void 0;
const prisma_1 = require("../utils/prisma");
class UserRepository {
    constructor() {
        this.prisma = (0, prisma_1.getPrismaClient)();
    }
    async findByEmail(email) {
        return this.prisma.user.findUnique({
            where: {
                email
            }
        });
    }
    async findById(id) {
        return this.prisma.user.findUnique({
            where: {
                id
            }
        });
    }
    async create(data) {
        return this.prisma.user.create({
            data
        });
    }
    async update(id, data) {
        return this.prisma.user.update({
            where: {
                id
            },
            data
        });
    }
    async findAll() {
        return this.prisma.user.findMany({
            orderBy: [{ createdAt: 'desc' }, { id: 'asc' }]
        });
    }
}
exports.UserRepository = UserRepository;
//# sourceMappingURL=UserRepository.js.map