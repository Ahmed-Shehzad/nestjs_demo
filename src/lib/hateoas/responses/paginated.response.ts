import { HateoasLinkBuilder } from '../services/hateoas-link-builder.service';
import { HateoasLink, HateoasLinkConfig, PaginationConfig, PaginationMeta } from '../types/hateoas.types';

/**
 * Generic Paginated Response with HATEOAS support
 *
 * A reusable response structure that can be used across all paginated endpoints.
 * Provides consistent pagination metadata and hypermedia links for any data type.
 *
 * @template T - The type of data being paginated
 *
 * @example Basic usage
 * ```typescript
 * const response = new PaginatedResponse(
 *   users,
 *   totalCount,
 *   { currentPage: 1, itemsPerPage: 10, totalItems: totalCount },
 *   { baseUrl: '/api/users' }
 * );
 * ```
 *
 * @example With custom resource ID selector
 * ```typescript
 * const response = new PaginatedResponse(
 *   bookmarks,
 *   totalCount,
 *   paginationConfig,
 *   {
 *     baseUrl: '/api/bookmarks',
 *     resourceIdSelector: (bookmark) => bookmark.uuid,
 *     customLinks: [
 *       { href: '/api/bookmarks/export', method: 'GET', rel: 'export' }
 *     ]
 *   }
 * );
 * ```
 */
export class PaginatedResponse<T> {
  public readonly data: T[];
  public readonly meta: PaginationMeta;
  public readonly links: HateoasLink[];

  constructor(data: T[], totalItems: number, pagination: PaginationConfig, hateoasConfig: HateoasLinkConfig) {
    this.data = data;

    // Build pagination metadata
    this.meta = this.buildPaginationMeta(pagination, totalItems);

    // Build HATEOAS links
    this.links = HateoasLinkBuilder.buildAllLinks(data, hateoasConfig, pagination);
  }

  /**
   * Creates pagination metadata from configuration
   */
  private buildPaginationMeta(pagination: PaginationConfig, totalItems: number): PaginationMeta {
    const { currentPage, itemsPerPage } = pagination;
    const totalPages = Math.ceil(totalItems / itemsPerPage);

    return {
      currentPage,
      totalPages,
      totalItems,
      itemsPerPage,
      hasNextPage: currentPage < totalPages,
      hasPreviousPage: currentPage > 1,
    };
  }

  /**
   * Static factory method for creating paginated responses
   */
  static create<T>(
    data: T[],
    totalItems: number,
    currentPage: number,
    itemsPerPage: number,
    baseUrl: string,
    options?: Partial<HateoasLinkConfig>,
  ): PaginatedResponse<T> {
    const paginationConfig: PaginationConfig = {
      currentPage,
      itemsPerPage,
      totalItems,
    };

    const hateoasConfig: HateoasLinkConfig = {
      baseUrl,
      includeResourceLinks: true,
      includeCreateLink: true,
      ...options,
    };

    return new PaginatedResponse(data, totalItems, paginationConfig, hateoasConfig);
  }

  /**
   * Get only pagination links (excludes resource-specific links)
   */
  getPaginationLinks(): HateoasLink[] {
    return this.links.filter((link) => ['self', 'first', 'prev', 'next', 'last'].includes(link.rel));
  }

  /**
   * Get only resource links (excludes pagination links)
   */
  getResourceLinks(): HateoasLink[] {
    return this.links.filter((link) => !['self', 'first', 'prev', 'next', 'last'].includes(link.rel));
  }

  /**
   * Check if there are any results
   */
  hasData(): boolean {
    return this.data.length > 0;
  }

  /**
   * Get the total number of pages
   */
  getTotalPages(): number {
    return this.meta.totalPages;
  }

  /**
   * Check if this is the first page
   */
  isFirstPage(): boolean {
    return this.meta.currentPage === 1;
  }

  /**
   * Check if this is the last page
   */
  isLastPage(): boolean {
    return this.meta.currentPage === this.meta.totalPages;
  }
}
