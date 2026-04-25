import { Router, Request, Response } from 'express';
import { getPrismaClient } from '../utils/prisma';

const router = Router();
router.get('/', async (req: Request, res: Response) => {
  try {
    const prisma = getPrismaClient();
    await prisma.$queryRaw`SELECT 1`;
    res.status(200).json({
      status: 'ok',
      uptime: process.uptime(),
      timestamp: new Date().toISOString(),
      storage: 'postgresql'
    });
  } catch (error) {
    res.status(500).json({
      status: 'error',
      uptime: process.uptime(),
      timestamp: new Date().toISOString(),
      storage: 'database-disconnected'
    });
  }
});
export default router;