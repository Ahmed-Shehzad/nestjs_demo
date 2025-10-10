import { Controller, Get, Query, Inject } from '@nestjs/common';
import type { IMediator } from '@/mediator/types/mediator';
import { GetAllUsersQuery } from './queries/get-all-users.query';
import { GetAllUsersDto } from './queries/get-all-users.dto';

/**
 * Users Controller
 * RESTful API endpoints for user operations
 */
@Controller('api/users')
export class UsersController {
  constructor(@Inject('IMediator') private readonly mediator: IMediator) {}

  /**
   * Get all users with pagination and HATEOAS links
   *
   * @param page - Page number (default: 1)
   * @param limit - Items per page (default: 10, max: 100)
   * @returns Paginated users with HATEOAS metadata
   *
   * @example
   * GET /api/users?page=1&limit=10
   * GET /api/users?page=2&limit=5
   */
  @Get()
  async getAllUsers(@Query('page') page?: string, @Query('limit') limit?: string): Promise<GetAllUsersDto> {
    const pageNumber = page ? Math.max(1, parseInt(page, 10)) : 1;
    const limitNumber = limit ? Math.min(Math.max(1, parseInt(limit, 10)), 100) : 10;

    const query = new GetAllUsersQuery(pageNumber, limitNumber, '/api/users');

    return await this.mediator.sendAsync(query);
  }
}
