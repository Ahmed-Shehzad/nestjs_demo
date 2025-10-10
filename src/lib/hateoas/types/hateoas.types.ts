/**
 * HATEOAS Link Interface
 * Represents a hypermedia link in REST API responses
 */
export interface HateoasLink {
  href: string;
  method: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';
  rel: string;
  type?: string;
  title?: string;
}

/**
 * Pagination Metadata Interface
 * Contains information about paginated results
 */
export interface PaginationMeta {
  currentPage: number;
  totalPages: number;
  totalItems: number;
  itemsPerPage: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
}

/**
 * HATEOAS Link Builder Configuration
 * Defines how to build links for a specific resource
 */
export interface HateoasLinkConfig {
  /** Base URL for the resource (e.g., '/api/users') */
  baseUrl: string;
  /** Whether to include individual resource links */
  includeResourceLinks?: boolean;
  /** Whether to include create link */
  includeCreateLink?: boolean;
  /** Additional custom links */
  customLinks?: HateoasLink[];
  /** Function to generate individual resource ID */
  resourceIdSelector?: (item: any) => string | number;
}

/**
 * Pagination Configuration
 */
export interface PaginationConfig {
  currentPage: number;
  itemsPerPage: number;
  totalItems: number;
}
