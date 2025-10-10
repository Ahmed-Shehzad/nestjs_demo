import { INotification } from '@/mediator/types/notification';

/**
 * UserCreatedEvent
 * Domain Event - represents that a new user has been created in the system
 * Generated on: 2025-10-10T17:23:10.906Z
 * Feature: User
 */
export class UserCreatedEvent implements INotification {
  public readonly occurredAt: Date = new Date();
  public readonly version: number = 1;

  constructor(
    public readonly userId: number,
    public readonly email: string,
    public readonly firstName: string | null,
    public readonly lastName: string | null,
  ) {}

  // Helper method to get event name
  get eventName(): string {
    return 'User.Created';
  }

  get aggregateId(): string {
    return this.userId.toString();
  }
}
