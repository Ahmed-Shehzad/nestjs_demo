import { MediatorDiscoveryService } from '@/mediator/discovery/mediator-discovery.service';
import type { IMediator } from '@/mediator/types/mediator';
import { Body, Controller, Get, Inject, Post, Query } from '@nestjs/common';

import { FluentResult } from '@/lib/fluent-results/types/fluent-results.types';
import { CreateUserCommand } from './commands/create-user.command';
import { CreateUserRequest } from './commands/create-user.dto';
import { GetAllUsersDto } from './queries/get-all-users.dto';
import { GetAllUsersQuery } from './queries/get-all-users.query';

/**
 * Simple response for command operations following CQRS principles
 */
interface CommandResponse {
  id: number;
  success: boolean;
  message: string;
  createdAt: Date;
}

/**
 * Users Controller
 * RESTful API endpoints for user operations
 */
@Controller('api/users')
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
  async getAllUsers(@Query('page') page?: string, @Query('limit') limit?: string): Promise<GetAllUsersDto> {
    // 🔍 DEBUG: Controller entry point - set breakpoint here to test debugging
    console.log('🔍 [DEBUG] UsersController.getAllUsers called with params:', { page, limit });

    const pageNumber = page ? Math.max(1, parseInt(page, 10)) : 1;
    const limitNumber = limit ? Math.min(Math.max(1, parseInt(limit, 10)), 100) : 10;

    // 🔍 DEBUG: Parameter processing - set breakpoint here to inspect parsed values
    console.log('🔍 [DEBUG] Parsed parameters:', { pageNumber, limitNumber });

    const query = new GetAllUsersQuery(pageNumber, limitNumber, '/api/users');

    // 🔍 DEBUG: Before mediator call - set breakpoint here to inspect query object
    console.log('🔍 [DEBUG] Created query object:', query);

    const result = await this.mediator.sendAsync<GetAllUsersDto>(query);

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
  async createUser(@Body() createUserDto: CreateUserRequest): Promise<CommandResponse> {
    const command = new CreateUserCommand(
      createUserDto.email,
      createUserDto.firstName || null,
      createUserDto.lastName || null,
      createUserDto.password,
    );

    // CQRS principle: command returns only the ID
    const result = await this.mediator.sendAsync<FluentResult<number>>(command);

    // Following CQRS principles: if we need full user data, we should use a separate query
    // For now, we'll return a simple response with just the ID and creation timestamp
    return {
      id: result.isSuccess ? result.value : 0,
      success: result.isSuccess,
      message: result.isSuccess
        ? 'User created successfully'
        : `User creation failed: ${JSON.stringify(result.error, null, 2)}`,
      createdAt: new Date(),
    };
  }
}
