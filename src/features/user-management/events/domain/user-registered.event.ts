import { INotification } from '@/mediator/types/notification';

/**
 * UserRegisteredEvent
 * Domain Event - represents something significant that happened in the UserManagement domain
 * Generated on: 2025-10-10T16:50:46.322Z
 * Feature: UserManagement
 */
export class UserRegisteredEvent implements INotification {
  constructor(
    // Add event data here
    // Example: public readonly aggregateId: string,
    // Example: public readonly occurredAt: Date = new Date(),
    // Example: public readonly version: number,
  ) {}

  // Helper method to get event name
  get eventName(): string {
    return 'UserManagement.UserRegistered';
  }
}
