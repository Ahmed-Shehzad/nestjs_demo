import { MediatorModule } from '@/mediator/mediator.module';
import { Module } from '@nestjs/common';
import { OpenApiFeature, OpenApiModule } from '../../lib/openapi';

// Query Handlers
import { GetAllBookmarksQueryHandler } from './queries/get-all-bookmarks.handler';
import { GetBookmarkByIdQueryHandler } from './queries/get-bookmark-by-id.handler';
import { GetBookmarksByFilterQueryHandler } from './queries/get-bookmarks-by-filter.handler';

// Command Handlers
import { CreateBookmarkCommandHandler } from './commands/create-bookmark.handler';
import { DeleteBookmarkCommandHandler } from './commands/delete-bookmark.handler';
import { UpdateBookmarkCommandHandler } from './commands/update-bookmark.handler';

// Domain Event Handlers
import { BookmarkCreatedEventHandler } from './events/domain/bookmark-created.handler';
import { BookmarkDeletedEventHandler } from './events/domain/bookmark-deleted.handler';
import { BookmarkUpdatedEventHandler } from './events/domain/bookmark-updated.handler';

// Validators
import { CreateBookmarkCommandValidator } from './commands/create-bookmark.validator';
import { DeleteBookmarkCommandValidator } from './commands/delete-bookmark.validator';
import { UpdateBookmarkCommandValidator } from './commands/update-bookmark.validator';
import { GetAllBookmarksQueryValidator } from './queries/get-all-bookmarks.validator';
import { GetBookmarkByIdQueryValidator } from './queries/get-bookmark-by-id.validator';
import { GetBookmarksByFilterQueryValidator } from './queries/get-bookmarks-by-filter.validator';

// Controllers
import { BookmarksController } from './bookmark.controller';

// Repositories
import { BookmarkRepository } from './repositories/bookmark.repository';

/**
 * Bookmark Feature Module
 *
 * Contains all bookmark-related functionality including:
 * - Repository for data access operations
 * - Query handlers for retrieving bookmark data
 * - Command handlers for bookmark operations
 * - Domain event handlers for bookmark lifecycle events
 * - Validators for input validation
 * - Controllers for HTTP endpoints
 */
@OpenApiFeature({
  name: 'Bookmarks',
  description: 'Bookmark management endpoints and operations',
  version: '1.0.0',
  tags: ['Bookmarks', 'Collections'],
})
@Module({
  imports: [
    MediatorModule,
    OpenApiModule.register({
      config: {
        title: 'Bookmark Management API',
        description: 'Bookmark management operations',
        version: '1.0.0',
      },
    }),
  ],
  controllers: [BookmarksController],
  providers: [
    // Repository
    BookmarkRepository,

    // Query Handlers
    GetAllBookmarksQueryHandler,
    GetBookmarkByIdQueryHandler,
    GetBookmarksByFilterQueryHandler,

    // Command Handlers
    CreateBookmarkCommandHandler,
    UpdateBookmarkCommandHandler,
    DeleteBookmarkCommandHandler,

    // Domain Event Handlers
    BookmarkCreatedEventHandler,
    BookmarkUpdatedEventHandler,
    BookmarkDeletedEventHandler,

    // Validators
    GetAllBookmarksQueryValidator,
    GetBookmarkByIdQueryValidator,
    GetBookmarksByFilterQueryValidator,
    CreateBookmarkCommandValidator,
    UpdateBookmarkCommandValidator,
    DeleteBookmarkCommandValidator,
  ],
  exports: [
    // Export repository and handlers so they can be used by other modules if needed
    BookmarkRepository,
    GetAllBookmarksQueryHandler,
    GetBookmarkByIdQueryHandler,
    GetBookmarksByFilterQueryHandler,
    CreateBookmarkCommandHandler,
    UpdateBookmarkCommandHandler,
    DeleteBookmarkCommandHandler,
  ],
})
export class BookmarkModule {}
