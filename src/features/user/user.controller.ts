import { MediatorDiscoveryService } from '@/mediator/discovery/mediator-discovery.service';
import { InjectMediator, type IMediator } from '@/mediator/mediator.module';
import { Body, Controller, Get, Post, Query, Version } from '@nestjs/common';
import { ApiBody, ApiOperation, ApiQuery, ApiResponse, ApiTags } from '@nestjs/swagger';
import { OpenApiEndpoint } from '../../lib/openapi';

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
@ApiTags('Users')
export class UsersController {
  constructor(
    @InjectMediator() private readonly mediator: IMediator,
    private readonly discovery: MediatorDiscoveryService,
  ) {}

  /**
   * Get all users with pagination and HATEOAS links
   */
  @Get()
  @Version(['1', '2'])
  @ApiOperation({ summary: 'Get all users', description: 'Retrieve a paginated list of users with HATEOAS links' })
  @ApiResponse({ status: 200, description: 'Users retrieved successfully' })
  @ApiQuery({ name: 'page', required: false, type: Number, description: 'Page number (default: 1)' })
  @ApiQuery({ name: 'limit', required: false, type: Number, description: 'Items per page (default: 10, max: 100)' })
  @OpenApiEndpoint({
    summary: 'Get all users with pagination',
    description: 'Retrieve a paginated list of users with HATEOAS navigation links',
    operationId: 'getAllUsers',
    tags: ['Users'],
  })
  async getAllUsers(
    @Query('page') page?: string,
    @Query('limit') limit?: string,
  ): Promise<FluentResult<GetAllUsersDto>> {
    const parsedPage = page ? parseInt(page, 10) : 1;
    const parsedLimit = limit ? parseInt(limit, 10) : 10;

    const pageNumber = isNaN(parsedPage) ? 1 : Math.max(1, parsedPage);
    const limitNumber = isNaN(parsedLimit) ? 10 : Math.min(Math.max(1, parsedLimit), 100);

    const query = new GetAllUsersQuery(pageNumber, limitNumber, '/api/users');
    const result = await this.mediator.sendAsync<FluentResult<GetAllUsersDto>>(query);

    return result;
  }

  /**
   * Create a new user
   */
  @Post()
  @Version(['1', '2'])
  @ApiOperation({ summary: 'Create user', description: 'Create a new user account' })
  @ApiResponse({ status: 201, description: 'User created successfully' })
  @ApiResponse({ status: 400, description: 'Validation failed' })
  @ApiBody({ type: CreateUserRequest, description: 'User creation data' })
  @OpenApiEndpoint({
    summary: 'Create new user',
    description: 'Create a new user account with validation',
    operationId: 'createUser',
    tags: ['Users'],
  })
  async createUser(@Body() createUserDto: CreateUserRequest): Promise<FluentResult<number>> {
    const command = new CreateUserCommand(
      createUserDto.email,
      createUserDto.firstName || null,
      createUserDto.lastName || null,
      createUserDto.password,
    );

    const result = await this.mediator.sendAsync<FluentResult<number>>(command);
    return result;
  }
}
