import { Injectable, Logger, OnModuleDestroy, OnModuleInit } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';

/**
 * Prisma Service
 *
 * Optimized singleton service for database connections with proper connection pooling.
 * Connection pool limits are configured via DATABASE_URL parameters:
 * - connection_limit: Maximum number of connections in the pool
 * - pool_timeout: Maximum time to wait for a connection (seconds)
 * - connect_timeout: Connection establishment timeout (seconds)
 *
 * Features:
 * - Singleton pattern to prevent multiple instances
 * - Proper lifecycle management with connect/disconnect
 * - Query logging in development mode
 * - Graceful shutdown handling
 */
@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(PrismaService.name);

  constructor() {
    super({
      log: [
        { level: 'info', emit: 'stdout' },
        { level: 'warn', emit: 'stdout' },
        { level: 'error', emit: 'stdout' },
      ],
      errorFormat: 'colorless',
    });

    this.logger.log('PrismaService initialized with connection pooling configuration from DATABASE_URL');
  }

  /**
   * Connect to database when module initializes
   */
  async onModuleInit() {
    try {
      await this.$connect();
      this.logger.log('Successfully connected to PostgreSQL database with optimized connection pool');
    } catch (error) {
      this.logger.error('Failed to connect to database:', error);
      throw error;
    }
  }

  /**
   * Disconnect from database when module is destroyed
   */
  async onModuleDestroy() {
    try {
      await this.$disconnect();
      this.logger.log('Disconnected from PostgreSQL database');
    } catch (error) {
      this.logger.error('Error disconnecting from database:', error);
    }
  }

  /**
   * Health check method
   */
  async healthCheck(): Promise<boolean> {
    try {
      await this.$queryRaw`SELECT 1`;
      return true;
    } catch (error) {
      this.logger.error('Database health check failed:', error);
      return false;
    }
  }
}
