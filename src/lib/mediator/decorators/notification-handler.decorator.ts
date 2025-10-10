/* eslint-disable @typescript-eslint/no-unsafe-argument */
import 'reflect-metadata';

/**
 * Metadata key symbol for notification handler registration
 * Used by the mediator discovery service to identify notification handlers
 * @internal
 */
export const NOTIFICATION_HANDLER_METADATA = Symbol('NOTIFICATION_HANDLER');

/**
 * Decorator that marks a class as a notification handler for a specific notification type.
 *
 * This decorator registers the class with the mediator discovery service, enabling automatic
 * handler resolution and event publishing. Multiple handlers can be registered for the same
 * notification type, and all will be invoked when the notification is published.
 *
 * @param notificationType - The notification class constructor that this handler processes
 * @returns A class decorator function that registers the handler
 *
 * @example
 * ```typescript
 * @Injectable()
 * @NotificationHandler(UserCreatedEvent)
 * export class UserCreatedEventHandler implements INotificationHandler<UserCreatedEvent> {
 *   async handleAsync(event: UserCreatedEvent): Promise<void> {
 *     // Handle the user created event
 *     console.log(`User ${event.userId} was created`);
 *   }
 * }
 * ```
 *
 * @example Multiple handlers for same event
 * ```typescript
 * @Injectable()
 * @NotificationHandler(UserCreatedEvent)
 * export class EmailNotificationHandler implements INotificationHandler<UserCreatedEvent> {
 *   async handleAsync(event: UserCreatedEvent): Promise<void> {
 *     await this.emailService.sendWelcomeEmail(event.email);
 *   }
 * }
 *
 * @Injectable()
 * @NotificationHandler(UserCreatedEvent)
 * export class AuditLogHandler implements INotificationHandler<UserCreatedEvent> {
 *   async handleAsync(event: UserCreatedEvent): Promise<void> {
 *     await this.auditService.log('user_created', event.userId);
 *   }
 * }
 * ```
 *
 * @see {@link INotificationHandler} - Interface that handlers must implement
 * @see {@link MediatorDiscoveryService} - Service that discovers and manages handlers
 * @since 1.0.0
 */
export function NotificationHandler(notificationType: new (...args: any[]) => any) {
  /**
   * The actual decorator function that applies metadata to the target class
   * @param target - The class being decorated
   * @internal
   */
  return (target: any) => {
    Reflect.defineMetadata(NOTIFICATION_HANDLER_METADATA, notificationType.name, target);
  };
}
