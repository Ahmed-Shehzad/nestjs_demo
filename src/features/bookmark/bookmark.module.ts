import { Module } from '@nestjs/common';
import { MediatorModule } from '@/mediator/mediator.module';

// Query Handlers
import { GetAllBookmarksQueryHandler } from './queries/get-all-bookmarks.handler';
import { GetBookmarkByIdQueryHandler } from './queries/get-bookmark-by-id.handler';
import { GetBookmarksByFilterQueryHandler } from './queries/get-bookmarks-by-filter.handler';

// Command Handlers
import { CreateBookmarkCommandHandler } from './commands/create-bookmark.handler';
import { UpdateBookmarkCommandHandler } from './commands/update-bookmark.handler';
import { DeleteBookmarkCommandHandler } from './commands/delete-bookmark.handler';

// Domain Event Handlers
import { BookmarkCreatedEventHandler } from './events/domain/bookmark-created.handler';
import { BookmarkUpdatedEventHandler } from './events/domain/bookmark-updated.handler';
import { BookmarkDeletedEventHandler } from './events/domain/bookmark-deleted.handler';

// Validators
import { GetAllBookmarksQueryValidator } from './queries/get-all-bookmarks.validator';
import { GetBookmarkByIdQueryValidator } from './queries/get-bookmark-by-id.validator';
import { GetBookmarksByFilterQueryValidator } from './queries/get-bookmarks-by-filter.validator';
import { CreateBookmarkCommandValidator } from './commands/create-bookmark.validator';
import { UpdateBookmarkCommandValidator } from './commands/update-bookmark.validator';
import { DeleteBookmarkCommandValidator } from './commands/delete-bookmark.validator';

// Controllers
import { BookmarksController } from './bookmark.controller';

/**
 * Bookmark Feature Module
 *
 * Contains all bookmark-related functionality including:
 * - Query handlers for retrieving bookmark data
 * - Command handlers for bookmark operations
 * - Domain event handlers for bookmark lifecycle events
 * - Validators for input validation
 * - Controllers for HTTP endpoints
 */
@Module({
  imports: [MediatorModule],
  controllers: [BookmarksController],
  providers: [
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
    // Export handlers so they can be used by other modules if needed
    GetAllBookmarksQueryHandler,
    GetBookmarkByIdQueryHandler,
    GetBookmarksByFilterQueryHandler,
    CreateBookmarkCommandHandler,
    UpdateBookmarkCommandHandler,
    DeleteBookmarkCommandHandler,
  ],
})
export class BookmarkModule {}
