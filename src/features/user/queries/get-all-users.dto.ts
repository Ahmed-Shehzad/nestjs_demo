import { PaginatedResponse } from '../../../lib/hateoas/responses/paginated.response';

/**
 * User Response Type (without sensitive data)
 */
export interface UserResponse {
  id: number;
  email: string;
  firstName: string | null;
  lastName: string | null;
  createdAt: Date;
  updatedAt: Date;
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
