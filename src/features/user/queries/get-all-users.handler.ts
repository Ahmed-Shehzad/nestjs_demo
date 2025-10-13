import { PrismaService } from '@/core/prisma.service';
import { FluentResult } from '@/fluent-results/types/fluent-results.types';
import { RequestHandler } from '@/mediator/decorators/request-handler.decorator';
import { IQueryHandler } from '@/mediator/types/request';
import { Injectable } from '@nestjs/common';
import { GetAllUsersDto, UserResponse } from './get-all-users.dto';
import { GetAllUsersQuery } from './get-all-users.query';

/**
 * GetAllUsersQueryHandler
 * Handles GetAllUsersQuery and returns GetAllUsersDto with HATEOAS pagination
 * Generated on: 2025-10-10T17:23:10.905Z
 * Feature: User
 */
@Injectable()
@RequestHandler(GetAllUsersQuery)
export class GetAllUsersQueryHandler implements IQueryHandler<GetAllUsersQuery, FluentResult<GetAllUsersDto>> {
  constructor(private readonly prisma: PrismaService) {}

  async handleAsync(query: GetAllUsersQuery): Promise<FluentResult<GetAllUsersDto>> {
    const { page, limit, baseUrl } = query;

    // Ensure positive values and reasonable limits
    const currentPage = Math.max(1, page);
    const itemsPerPage = Math.min(Math.max(1, limit), 100); // Max 100 items per page
    const skip = (currentPage - 1) * itemsPerPage;

    try {
      // Execute both queries in parallel for better performance
      const [users, totalCount] = await Promise.all([
        // Get paginated users with selected fields for better performance
        this.prisma.user.findMany({
          skip,
          take: itemsPerPage,
          select: {
            id: true,
            email: true,
            firstName: true,
            lastName: true,
            createdAt: true,
            updatedAt: true,
            // Optionally include bookmarks count
            _count: {
              select: {
                bookmarks: true,
              },
            },
          },
          orderBy: [
            { createdAt: 'desc' }, // Most recent first
            { id: 'desc' }, // Secondary sort for consistency
          ],
        }),

        // Get total count for pagination metadata
        this.prisma.user.count(),
      ]);

      // Transform the results to include bookmark count as a regular field
      const transformedUsers: UserResponse[] = users.map((user) => ({
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt,
        // Add computed field for bookmarks count
        bookmarksCount: user._count.bookmarks,
        // Note: We exclude the hash field for security reasons
      }));

      return FluentResult.success(new GetAllUsersDto(transformedUsers, totalCount, currentPage, itemsPerPage, baseUrl));
    } catch (error) {
      // Log the full error for debugging (server-side only)
      console.error('Error fetching users:', error);

      // Return a safe error message without exposing internal details
      let userFriendlyMessage = 'An error occurred while fetching users.';
      let errorCode = 'USER_FETCH_FAILED';

      // Handle specific Prisma errors with user-friendly messages
      if (error instanceof Error) {
        if (error.message.includes('does not exist')) {
          userFriendlyMessage = 'Database is not properly initialized.';
          errorCode = 'DATABASE_NOT_INITIALIZED';
        } else if (error.message.includes('connection')) {
          userFriendlyMessage = 'Database connection failed.';
          errorCode = 'DATABASE_CONNECTION_FAILED';
        }
      }

      return FluentResult.failure<GetAllUsersDto>(userFriendlyMessage, errorCode, {
        // Only include safe, user-friendly error details
        timestamp: new Date().toISOString(),
        operation: 'fetch_users',
      });
    }
  }
}
