import { HateoasLinkConfig, PaginatedResponse, PaginationConfig } from '../index';

/**
 * Utility functions for creating paginated responses
 */
export class PaginationUtils {
  /**
   * Creates a simple paginated response with minimal configuration
   */
  static createSimple<T>(
    data: T[],
    totalItems: number,
    currentPage: number,
    itemsPerPage: number,
    baseUrl: string,
  ): PaginatedResponse<T> {
    return PaginatedResponse.create(data, totalItems, currentPage, itemsPerPage, baseUrl);
  }

  /**
   * Creates a paginated response with custom link configuration
   */
  static createWithConfig<T>(
    data: T[],
    totalItems: number,
    currentPage: number,
    itemsPerPage: number,
    baseUrl: string,
    config: Partial<HateoasLinkConfig>,
  ): PaginatedResponse<T> {
    return PaginatedResponse.create(data, totalItems, currentPage, itemsPerPage, baseUrl, config);
  }

  /**
   * Validates pagination parameters and returns safe values
   */
  static validatePaginationParams(page?: string, limit?: string): { page: number; limit: number } {
    const pageNumber = page ? Math.max(1, parseInt(page, 10)) : 1;
    const limitNumber = limit ? Math.min(Math.max(1, parseInt(limit, 10)), 100) : 10;

    return {
      page: isNaN(pageNumber) ? 1 : pageNumber,
      limit: isNaN(limitNumber) ? 10 : limitNumber,
    };
  }

  /**
   * Creates pagination config from page and limit
   */
  static createPaginationConfig(currentPage: number, itemsPerPage: number, totalItems: number): PaginationConfig {
    return {
      currentPage,
      itemsPerPage,
      totalItems,
    };
  }

  /**
   * Calculates offset for database queries
   */
  static calculateOffset(page: number, limit: number): number {
    return (page - 1) * limit;
  }

  /**
   * Calculates total pages from total items and items per page
   */
  static calculateTotalPages(totalItems: number, itemsPerPage: number): number {
    return Math.ceil(totalItems / itemsPerPage);
  }
}
