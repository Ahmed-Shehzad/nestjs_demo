/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-call */
import { INotification, INotificationHandler } from '@/mediator/types/notification';
import { NotificationHandler } from '@/mediator/decorators/notification-handler.decorator';
import { NotificationPublisher } from '@/mediator/services/notification-publisher.service';
import { Injectable } from '@nestjs/common';

/**
 * Example Domain Event - User Registered
 */
export class UserRegisteredEvent implements INotification {
  constructor(
    public readonly userId: string,
    public readonly email: string,
    public readonly registeredAt: Date,
  ) {}
}

/**
 * Email notification handler for user registration
 */
@Injectable()
@NotificationHandler(UserRegisteredEvent)
export class SendWelcomeEmailHandler implements INotificationHandler<UserRegisteredEvent> {
  async handleAsync(notification: UserRegisteredEvent): Promise<void> {
    console.log(`Sending welcome email to ${notification.email} for user ${notification.userId}`);

    // Simulate email sending
    await new Promise((resolve) => setTimeout(resolve, 100));

    console.log(`Welcome email sent successfully to ${notification.email}`);
  }
}

/**
 * Analytics handler for user registration
 */
@Injectable()
@NotificationHandler(UserRegisteredEvent)
export class TrackUserRegistrationHandler implements INotificationHandler<UserRegisteredEvent> {
  async handleAsync(notification: UserRegisteredEvent): Promise<void> {
    console.log(`Tracking user registration analytics for user ${notification.userId}`);

    // Simulate analytics tracking
    await new Promise((resolve) => setTimeout(resolve, 50));

    console.log(`User registration tracked: ${notification.userId} at ${notification.registeredAt.toISOString()}`);
  }
}

/**
 * Audit log handler for user registration
 */
@Injectable()
@NotificationHandler(UserRegisteredEvent)
export class AuditLogHandler implements INotificationHandler<UserRegisteredEvent> {
  async handleAsync(notification: UserRegisteredEvent): Promise<void> {
    console.log(`Creating audit log entry for user registration: ${notification.userId}`);

    // Simulate audit log creation
    await new Promise((resolve) => setTimeout(resolve, 25));

    console.log(`Audit log created for user ${notification.userId}`);
  }
}

/**
 * Example service demonstrating notification publishing
 */
@Injectable()
export class UserService {
  constructor(private readonly notificationPublisher: NotificationPublisher) {}

  async registerUser(email: string): Promise<string> {
    // Simulate user creation
    const userId = `user-${Date.now()}`;
    const registeredAt = new Date();

    console.log(`Creating user ${userId} with email ${email}`);

    // Publish domain event - all handlers will be executed automatically
    const event = new UserRegisteredEvent(userId, email, registeredAt);
    await this.notificationPublisher.publishAsync(event);

    console.log(`User registration process completed for ${userId}`);
    return userId;
  }
}
