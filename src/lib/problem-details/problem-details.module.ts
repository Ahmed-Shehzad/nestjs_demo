import { Global, Module } from '@nestjs/common';
import { ProblemDetailsExceptionFilter } from './filters/problem-details-exception.filter';
import { ProblemDetailsService } from './services/problem-details.service';

/**
 * Problem Details Module
 *
 * Global module that provides standardized error handling capabilities.
 * Makes the ProblemDetailsService and exception filter available throughout the application.
 */
@Global()
@Module({
  providers: [ProblemDetailsService, ProblemDetailsExceptionFilter],
  exports: [ProblemDetailsService, ProblemDetailsExceptionFilter],
})
export class ProblemDetailsModule {}
