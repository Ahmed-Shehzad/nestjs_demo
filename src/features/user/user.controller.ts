import type { IMediator } from '@/mediator/types/mediator';
import { Body, Controller, Get, Inject, Post, Query } from '@nestjs/common';
import { CreateUserCommand } from './commands/create-user.command';
import { CreateUserRequestDto } from './commands/create-user.dto';
import { GetAllUsersDto } from './queries/get-all-users.dto';
import { GetAllUsersQuery } from './queries/get-all-users.query';

/**
 * Simple response for command operations following CQRS principles
 */
interface CommandResponse {
  id: number;
  message: string;
  createdAt: Date;
}

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
  async createUser(@Body() createUserDto: CreateUserRequestDto): Promise<CommandResponse> {
    // 🔍 DEBUG: Controller entry point for user creation
    console.log('🔍 [DEBUG] UsersController.createUser called with data:', {
      email: createUserDto.email,
      firstName: createUserDto.firstName,
      lastName: createUserDto.lastName,
      // Note: Password is intentionally excluded from debug logs for security
    });

    const command = new CreateUserCommand(
      createUserDto.email,
      createUserDto.firstName || null,
      createUserDto.lastName || null,
      createUserDto.password,
    );

    // 🔍 DEBUG: Before mediator call
    console.log('🔍 [DEBUG] Created command object for user creation');

    // CQRS principle: command returns only the ID
    const userId = await this.mediator.sendAsync<number>(command);

    // 🔍 DEBUG: After mediator call
    console.log('🔍 [DEBUG] User created successfully with ID:', userId);

    // Following CQRS principles: if we need full user data, we should use a separate query
    // For now, we'll return a simple response with just the ID and creation timestamp
    return {
      id: userId,
      message: 'User created successfully',
      createdAt: new Date(),
    };
  }
}
