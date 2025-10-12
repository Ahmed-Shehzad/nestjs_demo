import { ProblemDetailsService } from '@/problem-details/services/problem-details.service';
import { Global, Module } from '@nestjs/common';
import { PrismaService } from './prisma.service';
import { UnitOfWork } from './repositories';

// Token for Unit of Work dependency injection
export const UNIT_OF_WORK_TOKEN = Symbol('IUnitOfWork');

/**
 * Core Module
 *
 * Global module that provides shared services across all features.
 * This includes optimized database connections with proper connection pooling,
 * and unit of work for atomic transactions.
 *
 * Note: Repositories are now registered in their respective feature modules
 * following Domain-Driven Design principles.
 */
@Global()
@Module({
  providers: [
    PrismaService,
    ProblemDetailsService,
    // Unit of Work pattern for atomic transactions
    {
      provide: UNIT_OF_WORK_TOKEN,
      useClass: UnitOfWork,
    },
    UnitOfWork,
  ],
  exports: [PrismaService, ProblemDetailsService, UNIT_OF_WORK_TOKEN, UnitOfWork],
})
export class CoreModule {}
