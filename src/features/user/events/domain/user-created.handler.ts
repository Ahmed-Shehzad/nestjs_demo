import { NotificationHandler } from '@/mediator/decorators/notification-handler.decorator';
import { INotificationHandler } from '@/mediator/types/notification';
import { Injectable, Logger } from '@nestjs/common';
import { UserCreatedEvent } from './user-created.event';

/**
 * UserCreatedEventHandler
 * Handles UserCreatedEvent domain event
 * Generated on: 2025-10-10T17:23:10.906Z
 * Feature: User
 */
@Injectable()
@NotificationHandler(UserCreatedEvent)
export class UserCreatedEventHandler implements INotificationHandler<UserCreatedEvent> {
  private readonly logger = new Logger(UserCreatedEventHandler.name);

  constructor() {} // Example: private readonly auditService: AuditService, // Example: private readonly notificationService: NotificationService, // Inject dependencies here

  async handleAsync(event: UserCreatedEvent): Promise<void> {
    this.logger.log(`Handling domain event: ${event.eventName}`);

    try {
      // Log the user creation info message
      console.info(`🎉 A new user has been created!`);
      console.info(`📧 Email: ${event.email}`);
      console.info(`👤 Name: ${event.firstName || 'N/A'} ${event.lastName || 'N/A'}`);
      console.info(`🆔 User ID: ${event.userId}`);
      console.info(`⏰ Created At: ${event.occurredAt.toISOString()}`);

      // Here you could add additional event handling logic:
      // - Send welcome email
      // - Update analytics/metrics
      // - Create user profile in other services
      // - Log to audit system
      // - Update search indexes

      this.logger.log(`Successfully handled domain event: ${event.eventName} for user ${event.userId}`);
    } catch (error) {
      this.logger.error(`Failed to handle domain event: ${event.eventName} for user ${event.userId}`, error);
      throw error;
    }
  }

  // Example helper method
  // private async updateReadModel(event: UserCreatedEvent): Promise<void> {
  //   // Update read model or projection
  // }
}
