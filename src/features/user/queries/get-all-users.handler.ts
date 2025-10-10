import { Injectable } from '@nestjs/common';
import { RequestHandler } from '@/mediator/decorators/request-handler.decorator';
import { IQueryHandler } from '@/mediator/types/request';
import { GetAllUsersQuery } from './get-all-users.query';
import { GetAllUsersDto } from './get-all-users.dto';

/**
 * GetAllUsersQueryHandler
 * Handles GetAllUsersQuery and returns GetAllUsersDto
 * Generated on: 2025-10-10T17:23:10.905Z
 * Feature: User
 */
@Injectable()
@RequestHandler(GetAllUsersQuery)
export class GetAllUsersQueryHandler implements IQueryHandler<GetAllUsersQuery, GetAllUsersDto> {
  constructor() {} // Example: private readonly userRepository: UserRepository, // Inject dependencies here

  async handleAsync(query: GetAllUsersQuery): Promise<GetAllUsersDto> {
    // TODO: Implement query logic

    // Example implementation:
    // const result = await this.userRepository.findById(query.id);
    // return new GetAllUsersDto(result.id, result.name);

    throw new Error('GetAllUsersQueryHandler.handleAsync not implemented');
  }
}
