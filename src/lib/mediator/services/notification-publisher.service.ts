/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
import { Injectable, Logger } from '@nestjs/common';
import { INotification, INotificationPublisher, INotificationHandler } from '../types/notification';
import { MediatorDiscoveryService } from '../discovery/mediator-discovery.service';

/**
 * Service responsible for publishing notifications to all registered handlers.
 *
 * This service implements the publisher-subscriber pattern for domain events and
 * integration events. It discovers all handlers registered for a specific notification
 * type and executes them in parallel, enabling decoupled event-driven architecture.
 *
 * Key features:
 * - Parallel execution of multiple handlers
 * - Comprehensive logging and monitoring
 * - Error isolation (one handler failure doesn't affect others)
 * - Dynamic handler discovery
 * - Type-safe notification routing
 *
 * @example Publishing domain events
 * ```typescript
 * @Injectable()
 * export class UserService {
 *   constructor(private readonly publisher: NotificationPublisher) {}
 *
 *   async createUser(userData: CreateUserDto): Promise<User> {
 *     const user = await this.repository.save(userData);
 *
 *     // Publish to multiple handlers (email, audit, analytics, etc.)
 *     const event = new UserCreatedEvent(user.id, user.email, new Date());
 *     await this.publisher.publishAsync(event);
 *
 *     return user;
 *   }
 * }
 * ```
 *
 * @example Multiple handlers for same event
 * ```typescript
 * // Handler 1: Send welcome email
 * @NotificationHandler(UserCreatedEvent)
 * export class WelcomeEmailHandler implements INotificationHandler<UserCreatedEvent> {
 *   async handleAsync(event: UserCreatedEvent): Promise<void> {
 *     await this.emailService.sendWelcomeEmail(event.email);
 *   }
 * }
 *
 * // Handler 2: Update analytics
 * @NotificationHandler(UserCreatedEvent)
 * export class AnalyticsHandler implements INotificationHandler<UserCreatedEvent> {
 *   async handleAsync(event: UserCreatedEvent): Promise<void> {
 *     await this.analytics.track('user_created', { userId: event.userId });
 *   }
 * }
 *
 * // Handler 3: Audit logging
 * @NotificationHandler(UserCreatedEvent)
 * export class AuditHandler implements INotificationHandler<UserCreatedEvent> {
 *   async handleAsync(event: UserCreatedEvent): Promise<void> {
 *     await this.auditService.log('USER_CREATED', event);
 *   }
 * }
 * ```
 *
 * @see {@link INotificationPublisher} - Interface implemented by this service
 * @see {@link INotificationHandler} - Interface for notification handlers
 * @see {@link MediatorDiscoveryService} - Handler discovery service
 * @since 1.0.0
 */
@Injectable()
export class NotificationPublisher implements INotificationPublisher {
  /** Logger instance for tracking publication activities and errors */
  private readonly logger = new Logger(NotificationPublisher.name);

  /**
   * Initializes the notification publisher with required dependencies.
   *
   * @param discoveryService - Service for discovering notification handlers
   */
  constructor(private readonly discoveryService: MediatorDiscoveryService) {}

  async publishAsync<TNotification extends INotification>(notification: TNotification): Promise<void> {
    const notificationName = (notification as any).constructor.name;
    const handlers = this.discoveryService.getNotificationHandlers(notificationName);

    if (!handlers || handlers.length === 0) {
      this.logger.warn(`No handlers registered for notification: ${notificationName}`);
      return;
    }

    this.logger.log(`Publishing notification ${notificationName} to ${handlers.length} handler(s)`);

    // Execute all handlers in parallel
    const handlerPromises = handlers.map(async (handler: INotificationHandler<TNotification>) => {
      try {
        await handler.handleAsync(notification);
        this.logger.debug(`Handler ${handler.constructor.name} completed for ${notificationName}`);
      } catch (error) {
        this.logger.error(
          `Handler ${handler.constructor.name} failed for ${notificationName}`,
          error instanceof Error ? error.stack : error,
        );
        // Don't re-throw to allow other handlers to execute
      }
    });

    await Promise.allSettled(handlerPromises);
    this.logger.log(`Completed publishing notification: ${notificationName}`);
  }
}
