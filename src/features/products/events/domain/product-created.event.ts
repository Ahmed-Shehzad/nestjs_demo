import { INotification } from '@/mediator/types/notification';

/**
 * ProductCreatedEvent
 * Domain Event - represents something significant that happened in the Products domain
 * Generated on: 2025-10-10T17:03:06.810Z
 * Feature: Products
 */
export class ProductCreatedEvent implements INotification {
  constructor(
    // Add event data here
    // Example: public readonly aggregateId: string,
    // Example: public readonly occurredAt: Date = new Date(),
    // Example: public readonly version: number,
  ) {}

  // Helper method to get event name
  get eventName(): string {
    return 'Products.ProductCreated';
  }
}
