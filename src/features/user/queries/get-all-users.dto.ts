import { PaginatedResponse } from '@/lib/hateoas/responses/paginated.response';
import { ApiProperty } from '@nestjs/swagger';

/**
 * User Response Type (without sensitive data)
 */
export class UserResponse {
  @ApiProperty({
    description: 'Unique user identifier',
    example: 123,
    type: 'integer',
  })
  id: number;

  @ApiProperty({
    description: 'User email address',
    example: 'john.doe@example.com',
    format: 'email',
  })
  email: string;

  @ApiProperty({
    description: 'User first name',
    example: 'John',
    nullable: true,
  })
  firstName: string | null;

  @ApiProperty({
    description: 'User last name',
    example: 'Doe',
    nullable: true,
  })
  lastName: string | null;

  @ApiProperty({
    description: 'Account creation timestamp',
    example: '2025-10-11T14:30:00.000Z',
    type: 'string',
    format: 'date-time',
  })
  createdAt: Date;

  @ApiProperty({
    description: 'Last account update timestamp',
    example: '2025-10-11T14:30:00.000Z',
    type: 'string',
    format: 'date-time',
  })
  updatedAt: Date;

  @ApiProperty({
    description: 'Number of bookmarks created by user',
    example: 5,
    type: 'integer',
    minimum: 0,
  })
  bookmarksCount: number;
}

/**
 * GetAllUsersDto
 * Response DTO for GetAllUsersQuery with HATEOAS pagination
 * Generated on: 2025-10-10T17:23:10.903Z
 * Feature: User
 *
 * Now extends the reusable PaginatedResponse class for consistent API structure
 */
export class GetAllUsersDto extends PaginatedResponse<UserResponse> {
  @ApiProperty({
    description: 'Array of user objects',
    type: [UserResponse],
    example: [
      {
        id: 1,
        email: 'john.doe@example.com',
        firstName: 'John',
        lastName: 'Doe',
        createdAt: '2025-10-11T14:30:00.000Z',
        updatedAt: '2025-10-11T14:30:00.000Z',
        bookmarksCount: 5,
      },
      {
        id: 2,
        email: 'jane.smith@example.com',
        firstName: 'Jane',
        lastName: 'Smith',
        createdAt: '2025-10-11T14:30:00.000Z',
        updatedAt: '2025-10-11T14:30:00.000Z',
        bookmarksCount: 3,
      },
    ],
  })
  declare data: UserResponse[];

  constructor(users: UserResponse[], totalItems: number, currentPage: number, itemsPerPage: number, baseUrl: string) {
    super(
      users,
      totalItems,
      { currentPage, itemsPerPage, totalItems },
      {
        baseUrl,
        includeResourceLinks: true,
        includeCreateLink: true,
        resourceIdSelector: (user: UserResponse) => user.id,
      },
    );
  }
}
