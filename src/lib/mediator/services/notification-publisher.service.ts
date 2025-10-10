/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
import { Injectable, Logger } from '@nestjs/common';
import { INotification, INotificationPublisher, INotificationHandler } from '../types/notification';
import { MediatorDiscoveryService } from '../discovery/mediator-discovery.service';

/**
 * NotificationPublisher
 * Publishes notifications to all registered handlers
 * Supports multiple handlers per notification type
 */
@Injectable()
export class NotificationPublisher implements INotificationPublisher {
  private readonly logger = new Logger(NotificationPublisher.name);

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
