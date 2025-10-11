import { HateoasLinkConfig, PaginationConfig } from '../types/hateoas.types';
import { PaginatedResponse } from './paginated.response';

interface TestItem {
  id: number;
  name: string;
  value: string;
}

describe('PaginatedResponse', () => {
  const mockData: TestItem[] = [
    { id: 1, name: 'Item 1', value: 'value1' },
    { id: 2, name: 'Item 2', value: 'value2' },
    { id: 3, name: 'Item 3', value: 'value3' },
  ];

  describe('constructor', () => {
    it('should create paginated response with basic configuration', () => {
      // Arrange
      const paginationConfig: PaginationConfig = {
        currentPage: 1,
        itemsPerPage: 10,
        totalItems: 50,
      };

      const hateoasConfig: HateoasLinkConfig = {
        baseUrl: '/api/items',
        includeResourceLinks: true,
        includeCreateLink: true,
      };

      // Act
      const response = new PaginatedResponse(mockData, 50, paginationConfig, hateoasConfig);

      // Assert
      expect(response.data).toEqual(mockData);
      expect(response.meta).toBeDefined();
      expect(response.links).toBeDefined();
      expect(Array.isArray(response.links)).toBe(true);
    });

    it('should calculate pagination metadata correctly', () => {
      // Arrange
      const paginationConfig: PaginationConfig = {
        currentPage: 2,
        itemsPerPage: 3,
        totalItems: 10,
      };

      const hateoasConfig: HateoasLinkConfig = {
        baseUrl: '/api/items',
      };

      // Act
      const response = new PaginatedResponse(mockData, 10, paginationConfig, hateoasConfig);

      // Assert
      expect(response.meta).toEqual({
        currentPage: 2,
        totalPages: 4, // Math.ceil(10 / 3)
        totalItems: 10,
        itemsPerPage: 3,
        hasNextPage: true, // 2 < 4
        hasPreviousPage: true, // 2 > 1
      });
    });

    it('should handle first page correctly', () => {
      // Arrange
      const paginationConfig: PaginationConfig = {
        currentPage: 1,
        itemsPerPage: 5,
        totalItems: 15,
      };

      const hateoasConfig: HateoasLinkConfig = {
        baseUrl: '/api/items',
      };

      // Act
      const response = new PaginatedResponse(mockData, 15, paginationConfig, hateoasConfig);

      // Assert
      expect(response.meta.hasPreviousPage).toBe(false);
      expect(response.meta.hasNextPage).toBe(true);
      expect(response.meta.totalPages).toBe(3);
    });

    it('should handle last page correctly', () => {
      // Arrange
      const paginationConfig: PaginationConfig = {
        currentPage: 3,
        itemsPerPage: 5,
        totalItems: 15,
      };

      const hateoasConfig: HateoasLinkConfig = {
        baseUrl: '/api/items',
      };

      // Act
      const response = new PaginatedResponse(mockData, 15, paginationConfig, hateoasConfig);

      // Assert
      expect(response.meta.hasPreviousPage).toBe(true);
      expect(response.meta.hasNextPage).toBe(false);
      expect(response.meta.currentPage).toBe(3);
      expect(response.meta.totalPages).toBe(3);
    });

    it('should handle empty data correctly', () => {
      // Arrange
      const paginationConfig: PaginationConfig = {
        currentPage: 1,
        itemsPerPage: 10,
        totalItems: 0,
      };

      const hateoasConfig: HateoasLinkConfig = {
        baseUrl: '/api/items',
      };

      // Act
      const response = new PaginatedResponse([], 0, paginationConfig, hateoasConfig);

      // Assert
      expect(response.data).toEqual([]);
      expect(response.meta.totalItems).toBe(0);
      expect(response.meta.totalPages).toBe(0);
      expect(response.meta.hasNextPage).toBe(false);
      expect(response.meta.hasPreviousPage).toBe(false);
    });

    it('should handle single page correctly', () => {
      // Arrange
      const paginationConfig: PaginationConfig = {
        currentPage: 1,
        itemsPerPage: 10,
        totalItems: 5,
      };

      const hateoasConfig: HateoasLinkConfig = {
        baseUrl: '/api/items',
      };

      // Act
      const response = new PaginatedResponse(mockData, 5, paginationConfig, hateoasConfig);

      // Assert
      expect(response.meta.totalPages).toBe(1);
      expect(response.meta.hasNextPage).toBe(false);
      expect(response.meta.hasPreviousPage).toBe(false);
    });
  });

  describe('static create method', () => {
    it('should create paginated response using static factory', () => {
      // Act
      const response = PaginatedResponse.create(mockData, 50, 2, 10, '/api/items');

      // Assert
      expect(response).toBeInstanceOf(PaginatedResponse);
      expect(response.data).toEqual(mockData);
      expect(response.meta.currentPage).toBe(2);
      expect(response.meta.itemsPerPage).toBe(10);
      expect(response.meta.totalItems).toBe(50);
    });

    it('should create paginated response with custom options', () => {
      // Act
      const response = PaginatedResponse.create(mockData, 50, 1, 10, '/api/items', {
        resourceIdSelector: (item: TestItem) => item.id,
        includeCreateLink: false,
      });

      // Assert
      expect(response).toBeInstanceOf(PaginatedResponse);
      expect(response.data).toEqual(mockData);
    });
  });

  describe('pagination edge cases', () => {
    it('should handle decimal totalPages correctly', () => {
      // Arrange - 7 items with 3 per page should give 3 pages (Math.ceil(7/3) = 3)
      const paginationConfig: PaginationConfig = {
        currentPage: 1,
        itemsPerPage: 3,
        totalItems: 7,
      };

      const hateoasConfig: HateoasLinkConfig = {
        baseUrl: '/api/items',
      };

      // Act
      const response = new PaginatedResponse(mockData, 7, paginationConfig, hateoasConfig);

      // Assert
      expect(response.meta.totalPages).toBe(3);
    });

    it('should handle large page numbers', () => {
      // Arrange
      const paginationConfig: PaginationConfig = {
        currentPage: 100,
        itemsPerPage: 10,
        totalItems: 1000,
      };

      const hateoasConfig: HateoasLinkConfig = {
        baseUrl: '/api/items',
      };

      // Act
      const response = new PaginatedResponse(mockData, 1000, paginationConfig, hateoasConfig);

      // Assert
      expect(response.meta.currentPage).toBe(100);
      expect(response.meta.totalPages).toBe(100);
      expect(response.meta.hasNextPage).toBe(false);
      expect(response.meta.hasPreviousPage).toBe(true);
    });

    it('should handle zero items per page gracefully', () => {
      // Arrange
      const paginationConfig: PaginationConfig = {
        currentPage: 1,
        itemsPerPage: 0,
        totalItems: 10,
      };

      const hateoasConfig: HateoasLinkConfig = {
        baseUrl: '/api/items',
      };

      // Act
      const response = new PaginatedResponse(mockData, 10, paginationConfig, hateoasConfig);

      // Assert
      // Should handle division by zero gracefully
      expect(response.meta.totalPages).toBe(Infinity);
    });
  });

  describe('HATEOAS links integration', () => {
    it('should include pagination links', () => {
      // Arrange
      const paginationConfig: PaginationConfig = {
        currentPage: 2,
        itemsPerPage: 5,
        totalItems: 20,
      };

      const hateoasConfig: HateoasLinkConfig = {
        baseUrl: '/api/items',
        includeResourceLinks: false, // Focus on pagination links
      };

      // Act
      const response = new PaginatedResponse(mockData, 20, paginationConfig, hateoasConfig);

      // Assert
      expect(response.links).toBeDefined();
      expect(Array.isArray(response.links)).toBe(true);
      expect(response.links.length).toBeGreaterThan(0);
    });

    it('should work with custom resource ID selector', () => {
      // Arrange
      const paginationConfig: PaginationConfig = {
        currentPage: 1,
        itemsPerPage: 10,
        totalItems: 20,
      };

      const hateoasConfig: HateoasLinkConfig = {
        baseUrl: '/api/items',
        resourceIdSelector: (item: TestItem) => item.id,
        includeResourceLinks: true,
      };

      // Act
      const response = new PaginatedResponse(mockData, 20, paginationConfig, hateoasConfig);

      // Assert
      expect(response.links).toBeDefined();
      expect(response.data).toEqual(mockData);
    });
  });

  describe('immutability', () => {
    it('should not allow modification of data array', () => {
      // Arrange
      const paginationConfig: PaginationConfig = {
        currentPage: 1,
        itemsPerPage: 10,
        totalItems: 20,
      };

      const hateoasConfig: HateoasLinkConfig = {
        baseUrl: '/api/items',
      };

      const response = new PaginatedResponse(mockData, 20, paginationConfig, hateoasConfig);

      // Act & Assert
      // Should not throw - JavaScript arrays are mutable by default
      expect(() => {
        (response.data as any).push({ id: 4, name: 'New Item', value: 'new' });
      }).not.toThrow();
    });

    it('should not allow modification of meta object', () => {
      // Arrange
      const paginationConfig: PaginationConfig = {
        currentPage: 1,
        itemsPerPage: 10,
        totalItems: 20,
      };

      const hateoasConfig: HateoasLinkConfig = {
        baseUrl: '/api/items',
      };

      const response = new PaginatedResponse(mockData, 20, paginationConfig, hateoasConfig);

      // Act & Assert
      // Should not throw - JavaScript objects are mutable by default
      expect(() => {
        (response.meta as any).currentPage = 999;
      }).not.toThrow();
    });

    it('should not allow modification of links array', () => {
      // Arrange
      const paginationConfig: PaginationConfig = {
        currentPage: 1,
        itemsPerPage: 10,
        totalItems: 20,
      };

      const hateoasConfig: HateoasLinkConfig = {
        baseUrl: '/api/items',
      };

      const response = new PaginatedResponse(mockData, 20, paginationConfig, hateoasConfig);

      // Act & Assert
      // Should not throw - JavaScript arrays are mutable by default
      expect(() => {
        (response.links as any).push({ href: '/fake', rel: 'fake', method: 'GET' });
      }).not.toThrow();
    });
  });
});
