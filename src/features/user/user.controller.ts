import { MediatorDiscoveryService } from '@/mediator/discovery/mediator-discovery.service';
import type { IMediator } from '@/mediator/types/mediator';
import { Body, Controller, Get, Inject, Post, Query, Version } from '@nestjs/common';

import { FluentResult } from '@/fluent-results/types/fluent-results.types';
import { CreateUserCommand } from './commands/create-user.command';
import { CreateUserRequest } from './commands/create-user.dto';
import { GetAllUsersDto } from './queries/get-all-users.dto';
import { GetAllUsersQuery } from './queries/get-all-users.query';

/**
 * Users Controller
 * RESTful API endpoints for user operations
 */
@Controller('users')
export class UsersController {
  constructor(
    @Inject('IMediator') private readonly mediator: IMediator,
    private readonly discovery: MediatorDiscoveryService,
  ) {}

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
  @Version(['1', '2'])
  async getAllUsers(
    @Query('page') page?: string,
    @Query('limit') limit?: string,
  ): Promise<FluentResult<GetAllUsersDto>> {
    // 🔍 DEBUG: Controller entry point - set breakpoint here to test debugging
    console.log('🔍 [DEBUG] UsersController.getAllUsers called with params:', { page, limit });

    const parsedPage = page ? parseInt(page, 10) : 1;
    const parsedLimit = limit ? parseInt(limit, 10) : 10;

    const pageNumber = isNaN(parsedPage) ? 1 : Math.max(1, parsedPage);
    const limitNumber = isNaN(parsedLimit) ? 10 : Math.min(Math.max(1, parsedLimit), 100);

    // 🔍 DEBUG: Parameter processing - set breakpoint here to inspect parsed values
    console.log('🔍 [DEBUG] Parsed parameters:', { pageNumber, limitNumber });

    const query = new GetAllUsersQuery(pageNumber, limitNumber, '/api/users');

    // 🔍 DEBUG: Before mediator call - set breakpoint here to inspect query object
    console.log('🔍 [DEBUG] Created query object:', query);

    const result = await this.mediator.sendAsync<FluentResult<GetAllUsersDto>>(query);

    // 🔍 DEBUG: After mediator call - set breakpoint here to inspect result
    console.log('🔍 [DEBUG] Mediator result received:', { resultType: typeof result, hasData: !!result });

    return result;
  }

  /**
   * Create a new user
   *
   * @param createUserDto - User data for creation
   * @returns Created user information
   *
   * @example
   * POST /api/users
   * {
   *   "email": "user@example.com",
   *   "firstName": "John",
   *   "lastName": "Doe",
   *   "password": "securepassword123"
   * }
   */
  @Post()
  async createUser(@Body() createUserDto: CreateUserRequest): Promise<FluentResult<number>> {
    const command = new CreateUserCommand(
      createUserDto.email,
      createUserDto.firstName || null,
      createUserDto.lastName || null,
      createUserDto.password,
    );

    // CQRS principle: command returns only the ID
    const result = await this.mediator.sendAsync<FluentResult<number>>(command);
    return result;
  }
}
