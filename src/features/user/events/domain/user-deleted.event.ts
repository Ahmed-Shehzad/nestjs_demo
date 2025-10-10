import { INotification } from '@/mediator/types/notification';

/**
 * UserDeletedEvent
 * Domain Event - represents something significant that happened in the User domain
 * Generated on: 2025-10-10T17:23:10.907Z
 * Feature: User
 */
export class UserDeletedEvent implements INotification {
  constructor() {} // Example: public readonly version: number, // Example: public readonly occurredAt: Date = new Date(), // Example: public readonly aggregateId: string, // Add event data here

  // Helper method to get event name
  get eventName(): string {
    return 'User.UserDeleted';
  }
}
