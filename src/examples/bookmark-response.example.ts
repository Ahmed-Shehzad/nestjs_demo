import { PaginatedResponse } from '../lib/hateoas/responses/paginated.response';

/**
 * Bookmark Response Type (without sensitive data)
 */
export interface BookmarkResponse {
  id: number;
  title: string;
  description: string | null;
  link: string;
  createdAt: Date;
  updatedAt: Date;
  userId: number;
}

/**
 * GetAllBookmarksDto
 * Response DTO for GetAllBookmarksQuery with HATEOAS pagination
 *
 * Example of how to use the reusable PaginatedResponse for another feature
 */
export class GetAllBookmarksDto extends PaginatedResponse<BookmarkResponse> {
  /**
   * Creates a paginated bookmarks response with custom configuration
   */
  constructor(
    bookmarks: BookmarkResponse[],
    totalItems: number,
    currentPage: number,
    itemsPerPage: number,
    baseUrl: string,
  ) {
    super(
      bookmarks,
      totalItems,
      { currentPage, itemsPerPage, totalItems },
      {
        baseUrl,
        includeResourceLinks: true,
        includeCreateLink: true,
        resourceIdSelector: (bookmark: BookmarkResponse) => bookmark.id,
        customLinks: [
          {
            href: `${baseUrl}/export`,
            method: 'GET',
            rel: 'export',
            title: 'Export bookmarks',
          },
          {
            href: `${baseUrl}/import`,
            method: 'POST',
            rel: 'import',
            title: 'Import bookmarks',
          },
        ],
      },
    );
  }

  /**
   * Static factory method for creating bookmark responses
   */
  static createBookmarks(
    bookmarks: BookmarkResponse[],
    totalItems: number,
    currentPage: number,
    itemsPerPage: number,
    baseUrl: string = '/api/bookmarks',
  ): GetAllBookmarksDto {
    return new GetAllBookmarksDto(bookmarks, totalItems, currentPage, itemsPerPage, baseUrl);
  }
}
