import { INotification } from '@/mediator/types/notification';

/**
 * BookmarkUpdatedEvent
 * Domain Event - represents something significant that happened in the Bookmark domain
 * Generated on: 2025-10-10T17:23:18.557Z
 * Feature: Bookmark
 */
export class BookmarkUpdatedEvent implements INotification {
  constructor() {} // Example: public readonly version: number, // Example: public readonly occurredAt: Date = new Date(), // Example: public readonly aggregateId: string, // Add event data here

  // Helper method to get event name
  get eventName(): string {
    return 'Bookmark.BookmarkUpdated';
  }
}
