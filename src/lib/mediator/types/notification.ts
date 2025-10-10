import { HandlerType } from './shared';

/**
 * Base type for all notifications in the mediator pattern.
 *
 * Notifications represent events that have occurred in the system and are used
 * for decoupled communication between components. Unlike requests, notifications
 * can have zero or more handlers and are processed asynchronously.
 *
 * @example Domain event notification
 * ```typescript
 * export class UserCreatedEvent implements INotification {
 *   constructor(
 *     public readonly userId: string,
 *     public readonly email: string,
 *     public readonly createdAt: Date = new Date()
 *   ) {}
 * }
 * ```
 *
 * @example Integration event notification
 * ```typescript
 * export class OrderProcessedEvent implements INotification {
 *   constructor(
 *     public readonly orderId: string,
 *     public readonly customerId: string,
 *     public readonly totalAmount: number,
 *     public readonly processedAt: Date = new Date()
 *   ) {}
 * }
 * ```
 *
 * @since 1.0.0
 */
export type INotification = object;

/**
 * Interface for notification handlers in the mediator pattern.
 *
 * Notification handlers process events asynchronously and can perform side effects
 * such as sending emails, updating caches, logging, or triggering workflows.
 * Multiple handlers can be registered for the same notification type.
 *
 * @template TNotification - The specific notification type this handler processes
 *
 * @example Event handler for user creation
 * ```typescript
 * @Injectable()
 * @NotificationHandler(UserCreatedEvent)
 * export class SendWelcomeEmailHandler implements INotificationHandler<UserCreatedEvent> {
 *   constructor(private readonly emailService: EmailService) {}
 *
 *   async handleAsync(event: UserCreatedEvent): Promise<void> {
 *     await this.emailService.sendWelcomeEmail({
 *       to: event.email,
 *       userId: event.userId,
 *       createdAt: event.createdAt
 *     });
 *   }
 * }
 * ```
 *
 * @example Multiple handlers for same event
 * ```typescript
 * @Injectable()
 * @NotificationHandler(UserCreatedEvent)
 * export class AuditLogHandler implements INotificationHandler<UserCreatedEvent> {
 *   async handleAsync(event: UserCreatedEvent): Promise<void> {
 *     await this.auditService.log('USER_CREATED', {
 *       userId: event.userId,
 *       timestamp: event.createdAt
 *     });
 *   }
 * }
 * ```
 *
 * @since 1.0.0
 */
export interface INotificationHandler<TNotification extends INotification> {
  /**
   * Processes the notification asynchronously.
   *
   * @param notification - The notification event to process
   * @returns A promise that resolves when processing is complete, or void for synchronous processing
   * @throws Should handle errors gracefully to avoid affecting other handlers
   */
  handleAsync(notification: TNotification): Promise<void> | void;
}

/**
 * Interface for notification publishers in the mediator pattern.
 *
 * The publisher is responsible for finding all handlers registered for a notification
 * type and invoking them asynchronously. It coordinates the delivery of events
 * to multiple subscribers.
 *
 * @example Publishing a domain event
 * ```typescript
 * @Injectable()
 * export class UserService {
 *   constructor(private readonly publisher: INotificationPublisher) {}
 *
 *   async createUser(userData: CreateUserDto): Promise<User> {
 *     const user = await this.repository.save(userData);
 *
 *     // Publish event to all registered handlers
 *     const event = new UserCreatedEvent(user.id, user.email);
 *     await this.publisher.publishAsync(event);
 *
 *     return user;
 *   }
 * }
 * ```
 *
 * @since 1.0.0
 */
export interface INotificationPublisher {
  /**
   * Publishes a notification to all registered handlers.
   *
   * @template TNotification - The type of notification being published
   * @param notification - The notification event to publish
   * @returns A promise that resolves when all handlers have completed processing
   * @throws May aggregate errors from handlers, depending on implementation
   */
  publishAsync<TNotification extends INotification>(notification: TNotification): Promise<void>;
}

/**
 * Type alias for notification handler class constructors.
 * Used in dependency injection and factory patterns.
 * @template TNotification - The notification type the handler processes
 * @since 1.0.0
 */
export type NotificationHandlerType<TNotification extends INotification> = HandlerType<
  INotificationHandler<TNotification>
>;

/**
 * Factory function type for creating notification publishers.
 * Used in configuration and dependency injection scenarios.
 * @returns A notification publisher instance
 * @since 1.0.0
 */
export type NotificationPublisherFactory = () => INotificationPublisher;

/**
 * Factory function type for creating notification handlers.
 * Returns an array since multiple handlers can process the same notification.
 * @template TNotification - The notification type
 * @param notification - The notification instance to get handlers for
 * @returns Array of handlers that can process the notification
 * @since 1.0.0
 */
export type NotificationHandlerFactory = <TNotification extends INotification>(
  notification: TNotification,
) => INotificationHandler<TNotification>[];
