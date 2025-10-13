import { Injectable, NotFoundException } from '@nestjs/common';
import { LoggingBehavior } from '../behaviors/logging.behavior';
import { TelemetryBehavior } from '../behaviors/telemetry.behavior';
import { ValidationBehavior } from '../behaviors/validation.behavior';
import { MediatorDiscoveryService } from '../discovery/mediator-discovery.service';
import { IMediator } from '../types/mediator';
import { INotification } from '../types/notification';
import { IRequest } from '../types/request';

/**
 * Core mediator service implementation that orchestrates CQRS operations.
 *
 * This service implements the mediator pattern by routing requests to appropriate handlers
 * through a configurable pipeline of behaviors. It coordinates the execution of queries,
 * commands, and event notifications while applying cross-cutting concerns such as
 * validation, logging, and telemetry.
 *
 * The service integrates with:
 * - MediatorDiscoveryService for handler resolution
 * - Pipeline behaviors for cross-cutting concerns
 * - Dependency injection for loose coupling
 *
 * Pipeline execution order:
 * 1. Logging behavior (request start)
 * 2. Validation behavior (input validation)
 * 3. Telemetry behavior (performance monitoring)
 * 4. Request handler (business logic)
 * 5. Telemetry behavior (performance completion)
 * 6. Validation behavior (return)
 * 7. Logging behavior (request completion)
 *
 * @example Usage in a controller
 * ```typescript
 * @Controller('users')
 * export class UsersController {
 *   constructor(@InjectMediator() private readonly mediator: IMediator) {}
 *
 *   @Get(':id')
 *   async getUser(@Param('id') id: string): Promise<UserDto> {
 *     const query = new GetUserByIdQuery(id);
 *     return await this.mediator.sendAsync(query);
 *   }
 *
 *   @Post()
 *   async createUser(@Body() dto: CreateUserDto): Promise<string> {
 *     const command = new CreateUserCommand(dto);
 *     const userId = await this.mediator.sendAsync<string>(command);
 *
 *     const event = new UserCreatedEvent(userId, dto.email);
 *     await this.mediator.publishAsync(event);
 *
 *     return userId;
 *   }
 * }
 * ```
 *
 * @see {@link IMediator} - Interface implemented by this service
 * @see {@link MediatorDiscoveryService} - Handler discovery and resolution
 * @see {@link IPipelineBehavior} - Cross-cutting behavior interface
 * @since 1.0.0
 */
@Injectable()
export class MediatorService implements IMediator {
  /**
   * Initializes the mediator service with required dependencies.
   *
   * @param discovery - Service for discovering and resolving handlers
   * @param loggingBehavior - Pipeline behavior for request logging
   * @param validationBehavior - Pipeline behavior for request validation
   * @param telemetryBehavior - Pipeline behavior for performance monitoring
   */
  constructor(
    private readonly discovery: MediatorDiscoveryService,
    private readonly loggingBehavior: LoggingBehavior,
    private readonly validationBehavior: ValidationBehavior,
    private readonly telemetryBehavior: TelemetryBehavior,
  ) {}

  /**
   * Sends a request and returns the response
   */
  async sendAsync<TResponse>(request: IRequest<TResponse>): Promise<TResponse> {
    const requestTypeName = request.constructor.name;

    // Find the handler first
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    const handler = this.discovery.getHandler(requestTypeName);
    if (!handler) {
      throw new NotFoundException(`No handler found for request type: ${requestTypeName}`);
    }

    // Create pipeline chain: logging -> validation -> telemetry -> handler
    const pipeline = this.buildPipeline(request, handler);

    // Execute through pipeline
    return await pipeline();
  }

  /**
   * Builds the pipeline chain with behaviors
   */
  private buildPipeline<TResponse>(request: IRequest<TResponse>, handler: any): () => Promise<TResponse> {
    // Final handler execution
    const executeHandler = async (): Promise<TResponse> => {
      console.log(`Executing handler for: ${request.constructor.name}`);
      // eslint-disable-next-line @typescript-eslint/no-unsafe-return, @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access
      return await handler.handleAsync(request);
    };

    // Build pipeline chain in reverse order (telemetry -> handler)
    const next = executeHandler;

    // Telemetry behavior (closest to handler)
    const withTelemetry = async (): Promise<TResponse> => {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-return
      return await this.telemetryBehavior.handleAsync(request, next);
    };

    // Validation behavior
    const withValidation = async (): Promise<TResponse> => {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-return
      return await this.validationBehavior.handleAsync(request, withTelemetry);
    };

    // Logging behavior (outermost)
    const withLogging = async (): Promise<TResponse> => {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-return
      return await this.loggingBehavior.handleAsync(request, withValidation);
    };

    return withLogging;
  }

  /**
   * Publishes a notification to all registered handlers
   */
  async publishAsync(notification: INotification): Promise<void> {
    const notificationTypeName = notification.constructor.name;

    // Find all handlers for this notification type
    const handlers = this.discovery.getNotificationHandlers(notificationTypeName);

    if (handlers.length === 0) {
      console.warn(`No notification handlers registered for: ${notificationTypeName}`);
      return;
    }

    // Execute all handlers concurrently
    const handlePromises = handlers.map(async (handler, index) => {
      try {
        await handler.handleAsync(notification);
      } catch (error) {
        console.error(`Error in notification handler ${index + 1} for ${notificationTypeName}:`, error);
        // Don't rethrow - we want other handlers to continue executing
      }
    });

    await Promise.all(handlePromises);
  }
}
