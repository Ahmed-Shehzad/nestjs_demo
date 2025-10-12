import { Inject } from '@nestjs/common';
import { MEDIATOR_TOKEN } from '../mediator.module';

/**
 * Decorator for injecting the IMediator service.
 * Provides type-safe dependency injection for the mediator.
 *
 * @example
 * ```typescript
 * @Injectable()
 * export class UserController {
 *   constructor(@InjectMediator() private readonly mediator: IMediator) {}
 * }
 * ```
 */
export const InjectMediator = () => Inject(MEDIATOR_TOKEN);
