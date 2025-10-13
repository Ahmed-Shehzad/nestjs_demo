import { InjectMediator, type IMediator } from '@/mediator/mediator.module';
import { Controller, Get, HttpStatus, Param, Query, Version } from '@nestjs/common';
import { ApiOperation, ApiParam, ApiQuery, ApiResponse, ApiTags } from '@nestjs/swagger';
import { OpenApiEndpoint } from '../../lib/openapi';
import { GetAllBookmarksDto } from './queries/get-all-bookmarks.dto';
import { GetAllBookmarksQuery } from './queries/get-all-bookmarks.query';
import { GetBookmarkByIdDto } from './queries/get-bookmark-by-id.dto';
import { GetBookmarkByIdQuery } from './queries/get-bookmark-by-id.query';

/**
 * Bookmarks Controller
 * RESTful API endpoints for bookmark operations
 */
@Controller('bookmarks')
@ApiTags('Bookmarks')
export class BookmarksController {
  constructor(@InjectMediator() private readonly mediator: IMediator) {}

  /**
   * Get all bookmarks with pagination and HATEOAS links
   */
  @Get()
  @Version(['1', '2'])
  @ApiOperation({
    summary: 'Get all bookmarks',
    description: 'Retrieve a paginated list of bookmarks with HATEOAS links',
  })
  @ApiResponse({ status: 200, description: 'Bookmarks retrieved successfully' })
  @ApiQuery({ name: 'page', required: false, type: Number, description: 'Page number (default: 1)' })
  @ApiQuery({ name: 'limit', required: false, type: Number, description: 'Items per page (default: 10, max: 100)' })
  @OpenApiEndpoint({
    summary: 'Get all bookmarks with pagination',
    description: 'Retrieve a paginated list of bookmarks with HATEOAS navigation links',
    operationId: 'getAllBookmarks',
    tags: ['Bookmarks'],
  })
  async getAllBookmarks(@Query('page') page?: string, @Query('limit') limit?: string): Promise<GetAllBookmarksDto> {
    const parsedPage = page ? parseInt(page, 10) : 1;
    const parsedLimit = limit ? parseInt(limit, 10) : 10;

    const pageNumber = isNaN(parsedPage) ? 1 : Math.max(1, parsedPage);
    const limitNumber = isNaN(parsedLimit) ? 10 : Math.min(Math.max(1, parsedLimit), 100);

    const query = new GetAllBookmarksQuery(pageNumber, limitNumber, '/api/bookmarks');
    return await this.mediator.sendAsync<GetAllBookmarksDto>(query);
  }

  /**
   * Get a bookmark by ID
   */
  @Get(':id')
  @Version(['1', '2'])
  @ApiOperation({ summary: 'Get bookmark by ID', description: 'Retrieve a specific bookmark by its ID' })
  @ApiResponse({ status: 200, description: 'Bookmark retrieved successfully' })
  @ApiResponse({ status: 400, description: 'Invalid bookmark ID' })
  @ApiResponse({ status: 404, description: 'Bookmark not found' })
  @ApiParam({ name: 'id', type: Number, description: 'Bookmark ID' })
  @OpenApiEndpoint({
    summary: 'Get bookmark by ID',
    description: 'Retrieve a specific bookmark using its unique identifier',
    operationId: 'getBookmarkById',
    tags: ['Bookmarks'],
  })
  async getBookmarkById(@Param('id') id: string): Promise<GetBookmarkByIdDto> {
    const bookmarkId = parseInt(id, 10);
    if (isNaN(bookmarkId)) {
      return {
        status: HttpStatus.BAD_REQUEST,
        message: 'Invalid bookmark ID',
        data: null,
        timestamp: new Date().toISOString(),
      };
    }

    const query = new GetBookmarkByIdQuery(bookmarkId);
    return await this.mediator.sendAsync<GetBookmarkByIdDto>(query);
  }
}
