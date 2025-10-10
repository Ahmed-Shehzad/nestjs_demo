import { PrismaClient } from '@prisma/client';
import { Injectable } from '@nestjs/common';
import { RequestHandler } from '@/mediator/decorators/request-handler.decorator';
import { IQueryHandler } from '@/mediator/types/request';
import { GetUsersByFilterQuery } from './get-users-by-filter.query';
import { GetUsersByFilterDto } from './get-users-by-filter.dto';

const prisma = new PrismaClient();

/**
 * GetUsersByFilterQueryHandler
 * Handles GetUsersByFilterQuery and returns GetUsersByFilterDto
 * Generated on: 2025-10-10T17:23:10.905Z
 * Feature: User
 */
@Injectable()
@RequestHandler(GetUsersByFilterQuery)
export class GetUsersByFilterQueryHandler implements IQueryHandler<GetUsersByFilterQuery, GetUsersByFilterDto> {
  constructor() {} // Example: private readonly userRepository: UserRepository, // Inject dependencies here

  async handleAsync(query: GetUsersByFilterQuery): Promise<GetUsersByFilterDto> {
    // TODO: Implement query logic
    const users = await prisma.user.findMany();
    // Example implementation:
    // const result = await this.userRepository.findById(query.id);
    return new GetUsersByFilterDto(users); // Replace with actual properties
  }
}
