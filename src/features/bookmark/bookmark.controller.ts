import { Controller, Get, Param, Query, Inject } from '@nestjs/common';
import type { IMediator } from '@/mediator/types/mediator';
import { GetAllBookmarksQuery } from './queries/get-all-bookmarks.query';
import { GetAllBookmarksDto } from './queries/get-all-bookmarks.dto';
import { GetBookmarkByIdQuery } from './queries/get-bookmark-by-id.query';
import { GetBookmarkByIdDto } from './queries/get-bookmark-by-id.dto';

/**
 * Bookmarks Controller
 * RESTful API endpoints for bookmark operations
 */
@Controller('api/bookmarks')
export class BookmarksController {
  constructor(@Inject('IMediator') private readonly mediator: IMediator) {}

  /**
   * Get all bookmarks with pagination and HATEOAS links
   *
   * @param page - Page number (default: 1)
   * @param limit - Items per page (default: 10, max: 100)
   * @returns Paginated bookmarks with HATEOAS metadata
   *
   * @example
   * GET /api/bookmarks?page=1&limit=10
   * GET /api/bookmarks?page=2&limit=5
   */
  @Get()
  async getAllBookmarks(@Query('page') page?: string, @Query('limit') limit?: string): Promise<GetAllBookmarksDto> {
    const pageNumber = page ? Math.max(1, parseInt(page, 10)) : 1;
    const limitNumber = limit ? Math.min(Math.max(1, parseInt(limit, 10)), 100) : 10;

    const query = new GetAllBookmarksQuery(pageNumber, limitNumber, '/api/bookmarks');

    return await this.mediator.sendAsync(query);
  }

  /**
   * Get bookmark by ID
   *
   * @param id - Bookmark ID
   * @returns Single bookmark with details
   *
   * @example
   * GET /api/bookmarks/123
   */
  @Get(':id')
  async getBookmarkById(@Param('id') id: string): Promise<GetBookmarkByIdDto> {
    const bookmarkId = parseInt(id, 10);
    const query = new GetBookmarkByIdQuery(bookmarkId);

    return await this.mediator.sendAsync(query);
  }

  // TODO: Add POST, PUT, DELETE endpoints
  // These would use the respective command handlers:
  // - CreateBookmarkCommandHandler
  // - UpdateBookmarkCommandHandler
  // - DeleteBookmarkCommandHandler
}
