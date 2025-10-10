import { Module, Global } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';

/**
 * Core Module
 *
 * Global module that provides shared services across all features.
 * This includes database connections and other infrastructure concerns.
 */
@Global()
@Module({
  providers: [
    {
      provide: PrismaClient,
      useFactory: () => {
        const prisma = new PrismaClient({
          log: ['query', 'info', 'warn', 'error'],
        });

        // Optional: Add lifecycle hooks
        prisma.$connect().catch((error) => {
          console.error('Failed to connect to database:', error);
        });

        return prisma;
      },
    },
  ],
  exports: [PrismaClient],
})
export class CoreModule {}
