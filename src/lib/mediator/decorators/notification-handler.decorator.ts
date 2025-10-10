/* eslint-disable @typescript-eslint/no-unsafe-argument */
import 'reflect-metadata';

export const NOTIFICATION_HANDLER_METADATA = Symbol('NOTIFICATION_HANDLER');

/**
 * NotificationHandler decorator
 * Marks a class as a notification handler for a specific notification type
 *
 * @param notificationType - The notification class that this handler processes
 *
 * Usage:
 * ```typescript
 * @Injectable()
 * @NotificationHandler(UserCreatedEvent)
 * export class UserCreatedEventHandler implements INotificationHandler<UserCreatedEvent> {
 *   async handleAsync(event: UserCreatedEvent): Promise<void> {
 *     // Handle the event
 *   }
 * }
 * ```
 */
export function NotificationHandler(notificationType: new (...args: any[]) => any) {
  return (target: any) => {
    Reflect.defineMetadata(NOTIFICATION_HANDLER_METADATA, notificationType.name, target);
  };
}
