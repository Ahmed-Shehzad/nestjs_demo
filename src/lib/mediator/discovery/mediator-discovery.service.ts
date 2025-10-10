import { Injectable, OnModuleInit } from '@nestjs/common';
import { DiscoveryService } from '@golevelup/nestjs-discovery';
import { REQUEST_HANDLER_METADATA } from '../decorators/request-handler.decorator';
import { VALIDATOR_FOR_METADATA } from '../decorators/validator.decorator';
import { NOTIFICATION_HANDLER_METADATA } from '../decorators/notification-handler.decorator';
import { AbstractValidator } from '@/lib/fluent-validation/abstract.validator';
import { INotificationHandler } from '../types/notification';

/**
 * Service responsible for discovering and managing CQRS handlers, validators, and notification handlers.
 *
 * This service uses NestJS's DiscoveryService to scan the application at startup and build
 * internal registries of all decorated classes. It maintains separate maps for different
 * component types and provides fast lookup methods for the mediator system.
 *
 * The discovery process happens during module initialization and includes:
 * - Request handlers (queries and commands)
 * - Validators for request validation
 * - Notification handlers for event processing
 *
 * @example Handler registration via decorators
 * ```typescript
 * // Request handler discovery
 * @Injectable()
 * @RequestHandler(GetUserByIdQuery)
 * export class GetUserByIdHandler implements IQueryHandler<GetUserByIdQuery, UserDto> {
 *   async handleAsync(query: GetUserByIdQuery): Promise<UserDto> {
 *     // Handler logic
 *   }
 * }
 *
 * // Validator discovery
 * @Injectable()
 * @ValidatorFor(CreateUserCommand)
 * export class CreateUserValidator extends AbstractValidator<CreateUserCommand> {
 *   constructor() {
 *     super();
 *     this.ruleFor(x => x.email).notEmpty().emailAddress();
 *   }
 * }
 *
 * // Notification handler discovery
 * @Injectable()
 * @NotificationHandler(UserCreatedEvent)
 * export class EmailHandler implements INotificationHandler<UserCreatedEvent> {
 *   async handleAsync(event: UserCreatedEvent): Promise<void> {
 *     // Event handling logic
 *   }
 * }
 * ```
 *
 * @see {@link DiscoveryService} - NestJS service for component discovery
 * @see {@link RequestHandler} - Decorator for request handlers
 * @see {@link ValidatorFor} - Decorator for validators
 * @see {@link NotificationHandler} - Decorator for notification handlers
 * @since 1.0.0
 */
@Injectable()
export class MediatorDiscoveryService implements OnModuleInit {
  /** Map storing request handlers by request type name */
  private handlerMap = new Map<unknown, any>();

  /** Map storing validators by request type name */
  private validatorMap = new Map<unknown, AbstractValidator<any>>();

  /** Map storing notification handlers by notification type name (supports multiple handlers per type) */
  private notificationHandlerMap = new Map<unknown, INotificationHandler<any>[]>();

  /**
   * Initializes the discovery service with NestJS discovery capabilities.
   *
   * @param discovery - NestJS discovery service for scanning decorated classes
   */
  constructor(private readonly discovery: DiscoveryService) {}

  async onModuleInit() {
    const handlers = await this.discovery.providersWithMetaAtKey(REQUEST_HANDLER_METADATA);
    const validators = await this.discovery.providersWithMetaAtKey(VALIDATOR_FOR_METADATA);
    const notificationHandlers = await this.discovery.providersWithMetaAtKey(NOTIFICATION_HANDLER_METADATA);

    handlers.forEach(({ meta, discoveredClass }) => {
      this.handlerMap.set(meta, discoveredClass.instance);
    });

    validators.forEach(({ meta, discoveredClass }) => {
      this.validatorMap.set(meta, discoveredClass.instance as AbstractValidator<any>);
    });

    // Group notification handlers by notification type (multiple handlers per notification)
    notificationHandlers.forEach(({ meta, discoveredClass }) => {
      const existingHandlers = this.notificationHandlerMap.get(meta) || [];
      existingHandlers.push(discoveredClass.instance as INotificationHandler<any>);
      this.notificationHandlerMap.set(meta, existingHandlers);
    });
  }

  getHandler(requestName: unknown): any {
    return this.handlerMap.get(requestName);
  }

  getValidator(requestName: unknown): AbstractValidator<any> | undefined {
    return this.validatorMap.get(requestName);
  }

  getNotificationHandlers(notificationName: unknown): INotificationHandler<any>[] {
    return this.notificationHandlerMap.get(notificationName) || [];
  }
}
