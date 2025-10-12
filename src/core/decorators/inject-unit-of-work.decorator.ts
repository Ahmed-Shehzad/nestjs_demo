import { Inject } from '@nestjs/common';
import { UNIT_OF_WORK_TOKEN } from '../core.module';

/**
 * Decorator for injecting Unit of Work
 *
 * This decorator provides type-safe injection of the Unit of Work
 * using the Symbol token defined in CoreModule
 */
export const InjectUnitOfWork = () => Inject(UNIT_OF_WORK_TOKEN);
