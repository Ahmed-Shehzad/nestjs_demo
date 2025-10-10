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
 * HATEOAS Link Interface
 */
interface HateoasLink {
  href: string;
  method: string;
  rel: string;
}

/**
 * Pagination Metadata Interface
 */
interface PaginationMeta {
  currentPage: number;
  totalPages: number;
  totalItems: number;
  itemsPerPage: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
}

/**
 * GetAllUsersDto
 * Response DTO for GetAllUsersQuery with HATEOAS pagination
 * Generated on: 2025-10-10T17:23:10.903Z
 * Feature: User
 */
export class GetAllUsersDto {
  public readonly data: UserResponse[];
  public readonly meta: PaginationMeta;
  public readonly links: HateoasLink[];

  constructor(users: UserResponse[], totalItems: number, currentPage: number, itemsPerPage: number, baseUrl: string) {
    this.data = users;

    const totalPages = Math.ceil(totalItems / itemsPerPage);

    this.meta = {
      currentPage,
      totalPages,
      totalItems,
      itemsPerPage,
      hasNextPage: currentPage < totalPages,
      hasPreviousPage: currentPage > 1,
    };

    this.links = this.buildHateoasLinks(baseUrl, currentPage, totalPages, itemsPerPage);
  }

  private buildHateoasLinks(
    baseUrl: string,
    currentPage: number,
    totalPages: number,
    itemsPerPage: number,
  ): HateoasLink[] {
    const links: HateoasLink[] = [];

    // Self link
    links.push({
      href: `${baseUrl}?page=${currentPage}&limit=${itemsPerPage}`,
      method: 'GET',
      rel: 'self',
    });

    // First page link
    if (currentPage > 1) {
      links.push({
        href: `${baseUrl}?page=1&limit=${itemsPerPage}`,
        method: 'GET',
        rel: 'first',
      });
    }

    // Previous page link
    if (this.meta.hasPreviousPage) {
      links.push({
        href: `${baseUrl}?page=${currentPage - 1}&limit=${itemsPerPage}`,
        method: 'GET',
        rel: 'prev',
      });
    }

    // Next page link
    if (this.meta.hasNextPage) {
      links.push({
        href: `${baseUrl}?page=${currentPage + 1}&limit=${itemsPerPage}`,
        method: 'GET',
        rel: 'next',
      });
    }

    // Last page link
    if (currentPage < totalPages) {
      links.push({
        href: `${baseUrl}?page=${totalPages}&limit=${itemsPerPage}`,
        method: 'GET',
        rel: 'last',
      });
    }

    // Individual user resource links
    this.data.forEach((user) => {
      links.push({
        href: `${baseUrl}/${user.id}`,
        method: 'GET',
        rel: 'user',
      });
    });

    // Create new user link
    links.push({
      href: baseUrl,
      method: 'POST',
      rel: 'create',
    });

    return links;
  }
}
