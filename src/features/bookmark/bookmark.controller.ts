import { InjectMediator, type IMediator } from '@/mediator/mediator.module';
import { Controller, Get, HttpStatus, Param, Query, Version } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiParam, ApiQuery, ApiResponse, ApiTags } from '@nestjs/swagger';
import { GetAllBookmarksDto } from './queries/get-all-bookmarks.dto';
import { GetAllBookmarksQuery } from './queries/get-all-bookmarks.query';
import { GetBookmarkByIdDto } from './queries/get-bookmark-by-id.dto';
import { GetBookmarkByIdQuery } from './queries/get-bookmark-by-id.query';

/**
 * Bookmarks Controller
 * RESTful API endpoints for bookmark operations
 */
@ApiTags('bookmarks')
@Controller('bookmarks')
@ApiBearerAuth()
export class BookmarksController {
  constructor(@InjectMediator() private readonly mediator: IMediator) {}

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
  @Version(['1', '2'])
  @ApiOperation({
    summary: 'Get all bookmarks',
    description: 'Retrieve a paginated list of bookmarks with HATEOAS links and metadata',
    operationId: 'getAllBookmarks',
  })
  @ApiQuery({
    name: 'page',
    required: false,
    type: Number,
    description: 'Page number for pagination (default: 1)',
    example: 1,
  })
  @ApiQuery({
    name: 'limit',
    required: false,
    type: Number,
    description: 'Number of items per page (default: 10, max: 100)',
    example: 10,
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Successfully retrieved paginated bookmarks',
    type: GetAllBookmarksDto,
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'Invalid query parameters',
  })
  @ApiResponse({
    status: HttpStatus.INTERNAL_SERVER_ERROR,
    description: 'Internal server error',
  })
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
  @Version(['1', '2'])
  @ApiOperation({
    summary: 'Get bookmark by ID',
    description: 'Retrieve a specific bookmark by its unique identifier',
    operationId: 'getBookmarkById',
  })
  @ApiParam({
    name: 'id',
    type: Number,
    description: 'Unique bookmark identifier',
    example: 123,
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Successfully retrieved bookmark',
    type: GetBookmarkByIdDto,
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'Invalid bookmark ID format',
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Bookmark not found',
  })
  @ApiResponse({
    status: HttpStatus.INTERNAL_SERVER_ERROR,
    description: 'Internal server error',
  })
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
