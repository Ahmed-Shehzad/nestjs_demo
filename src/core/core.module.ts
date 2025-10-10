import { Global, Module } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';
import { PrismaService } from './prisma.service';

/**
 * Core Module
 *
 * Global module that provides shared services across all features.
 * This includes optimized database connections with proper connection pooling.
 */
@Global()
@Module({
  providers: [
    PrismaService,
    // Provide PrismaClient as an alias to PrismaService for backward compatibility
    {
      provide: PrismaClient,
      useExisting: PrismaService,
    },
  ],
  exports: [PrismaService, PrismaClient],
})
export class CoreModule {}
