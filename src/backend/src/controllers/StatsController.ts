import { Request, Response } from 'express';
import { StatsService, PlatformStats } from '../services/StatsService';
import { logger } from '../utils/logger';

export class StatsController {
  private statsService: StatsService;

  constructor(statsService: StatsService) {
    this.statsService = statsService;
    this.getPlatformStats = this.getPlatformStats.bind(this);
  }

  async getPlatformStats(req: Request, res: Response): Promise<void> {
    try {
      logger.info('Fetching platform stats');
      
      const stats: PlatformStats = await this.statsService.getPlatformStats();

      res.status(200).json({
        success: true,
        data: stats,
        message: 'Platform stats retrieved successfully',
      });
    } catch (error) {
      logger.error('Error fetching platform stats', {
        error: error instanceof Error ? error.message : 'Unknown error',
      });

      res.status(500).json({
        success: false,
        message: 'Failed to retrieve platform stats',
        error: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  }
}
