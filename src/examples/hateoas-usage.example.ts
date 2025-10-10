/**
 * Usage Examples for the Reusable HATEOAS API Response Structure
 *
 * This file demonstrates various ways to use the new PaginatedResponse system
 * across different features and use cases.
 */

import { PaginatedResponse } from '../lib/hateoas/responses/paginated.response';
import { PaginationUtils } from '../lib/hateoas/utils/pagination.utils';

// ========================================
// Example 1: Simple Usage
// ========================================

interface SimpleProduct {
  id: number;
  name: string;
  price: number;
}

export function createSimpleProductResponse(
  products: SimpleProduct[],
  totalItems: number,
  currentPage: number,
  itemsPerPage: number,
): PaginatedResponse<SimpleProduct> {
  return PaginationUtils.createSimple(products, totalItems, currentPage, itemsPerPage, '/api/products');
}

// ========================================
// Example 2: Advanced Configuration
// ========================================

interface AdvancedUser {
  uuid: string;
  email: string;
  profile: {
    firstName: string;
    lastName: string;
  };
}

export function createAdvancedUserResponse(
  users: AdvancedUser[],
  totalItems: number,
  page: number,
  limit: number,
): PaginatedResponse<AdvancedUser> {
  return PaginationUtils.createWithConfig(users, totalItems, page, limit, '/api/v2/users', {
    includeResourceLinks: true,
    includeCreateLink: true,
    resourceIdSelector: (user) => user.uuid, // Use UUID instead of numeric ID
    customLinks: [
      {
        href: '/api/v2/users/bulk-import',
        method: 'POST',
        rel: 'bulk-import',
        title: 'Bulk import users',
      },
      {
        href: '/api/v2/users/export',
        method: 'GET',
        rel: 'export',
        title: 'Export users to CSV',
      },
    ],
  });
}

// ========================================
// Example 3: Direct PaginatedResponse Usage
// ========================================

interface Order {
  id: string;
  customerId: number;
  total: number;
  status: 'pending' | 'completed' | 'cancelled';
  items: Array<{ productId: number; quantity: number; price: number }>;
}

export function createOrderResponse(
  orders: Order[],
  totalItems: number,
  currentPage: number,
  itemsPerPage: number,
): PaginatedResponse<Order> {
  return new PaginatedResponse(
    orders,
    totalItems,
    { currentPage, itemsPerPage, totalItems },
    {
      baseUrl: '/api/orders',
      includeResourceLinks: true,
      includeCreateLink: true,
      resourceIdSelector: (order) => order.id,
      customLinks: [
        {
          href: '/api/orders/statistics',
          method: 'GET',
          rel: 'statistics',
          title: 'Order statistics',
        },
        {
          href: '/api/orders/pending',
          method: 'GET',
          rel: 'pending',
          title: 'Pending orders only',
        },
      ],
    },
  );
}

// ========================================
// Example 4: Using in a Handler (Controller Pattern)
// ========================================

export class ExampleProductHandler {
  async getAllProducts(pageParam?: string, limitParam?: string): Promise<PaginatedResponse<SimpleProduct>> {
    // Validate and sanitize pagination parameters
    const { page, limit } = PaginationUtils.validatePaginationParams(pageParam, limitParam);

    // Calculate database offset
    const offset = PaginationUtils.calculateOffset(page, limit);

    // Mock database call (replace with your actual data fetching)
    const products = await this.fetchProductsFromDatabase(offset, limit);
    const totalCount = await this.getTotalProductCount();

    // Create response using utility
    return PaginationUtils.createSimple(products, totalCount, page, limit, '/api/products');
  }

  private async fetchProductsFromDatabase(offset: number, limit: number): Promise<SimpleProduct[]> {
    // Mock implementation - replace with actual database query
    return [
      { id: 1, name: 'Product 1', price: 99.99 },
      { id: 2, name: 'Product 2', price: 149.99 },
    ];
  }

  private async getTotalProductCount(): Promise<number> {
    // Mock implementation - replace with actual count query
    return 100;
  }
}

// ========================================
// Example 5: Custom DTO extending PaginatedResponse
// ========================================

interface BlogPost {
  id: number;
  title: string;
  excerpt: string;
  authorId: number;
  publishedAt: Date;
  tags: string[];
}

export class GetAllBlogPostsDto extends PaginatedResponse<BlogPost> {
  constructor(
    posts: BlogPost[],
    totalItems: number,
    currentPage: number,
    itemsPerPage: number,
    baseUrl: string = '/api/blog/posts',
  ) {
    super(
      posts,
      totalItems,
      { currentPage, itemsPerPage, totalItems },
      {
        baseUrl,
        includeResourceLinks: true,
        includeCreateLink: true,
        resourceIdSelector: (post) => post.id,
        customLinks: [
          {
            href: `${baseUrl}/drafts`,
            method: 'GET',
            rel: 'drafts',
            title: 'View draft posts',
          },
          {
            href: `${baseUrl}/published`,
            method: 'GET',
            rel: 'published',
            title: 'View published posts only',
          },
          {
            href: '/api/blog/tags',
            method: 'GET',
            rel: 'tags',
            title: 'View all tags',
          },
        ],
      },
    );
  }

  /**
   * Get posts by a specific author
   */
  getPostsByAuthor(authorId: number): BlogPost[] {
    return this.data.filter((post) => post.authorId === authorId);
  }

  /**
   * Get posts with specific tags
   */
  getPostsWithTags(tags: string[]): BlogPost[] {
    return this.data.filter((post) => tags.some((tag) => post.tags.includes(tag)));
  }

  /**
   * Get unique tags from all posts in this page
   */
  getUniqueTags(): string[] {
    const allTags = this.data.flatMap((post) => post.tags);
    return [...new Set(allTags)];
  }
}

// ========================================
// Example 6: Non-paginated but still using HATEOAS
// ========================================

interface UserProfile {
  id: number;
  email: string;
  firstName: string;
  lastName: string;
}

export function createSingleUserResponse(user: UserProfile): PaginatedResponse<UserProfile> {
  // Even for single items, you can use the paginated response for consistency
  return new PaginatedResponse(
    [user],
    1,
    { currentPage: 1, itemsPerPage: 1, totalItems: 1 },
    {
      baseUrl: '/api/users',
      includeResourceLinks: false, // Don't include individual links since this is already a single item
      includeCreateLink: true,
      customLinks: [
        {
          href: `/api/users/${user.id}/profile`,
          method: 'GET',
          rel: 'profile',
          title: 'Full user profile',
        },
        {
          href: `/api/users/${user.id}/settings`,
          method: 'GET',
          rel: 'settings',
          title: 'User settings',
        },
        {
          href: `/api/users/${user.id}`,
          method: 'PUT',
          rel: 'update',
          title: 'Update user',
        },
        {
          href: `/api/users/${user.id}`,
          method: 'DELETE',
          rel: 'delete',
          title: 'Delete user',
        },
      ],
    },
  );
}
