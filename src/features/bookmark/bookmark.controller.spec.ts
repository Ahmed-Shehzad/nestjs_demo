import { MEDIATOR_TOKEN } from '@/mediator/mediator.module';
import { Test, TestingModule } from '@nestjs/testing';
import { BookmarksController } from './bookmark.controller';

// Mock faker for Jest compatibility
const faker = {
  number: {
    int: ({ min = 1, max = 100 } = {}) => Math.floor(Math.random() * (max - min + 1)) + min,
  },
  lorem: {
    sentence: () => 'Lorem ipsum dolor sit amet',
    word: () => 'Lorem',
  },
  internet: {
    url: () => 'https://example.com',
  },
};

// Test Data Factories using simplified faker
class BookmarkFactory {
  static createValid() {
    return {
      id: faker.number.int({ min: 1, max: 999999 }),
      title: faker.lorem.sentence(),
      url: faker.internet.url(),
      description: faker.lorem.sentence(),
      tags: ['web', 'development'],
      category: 'Development',
      userId: faker.number.int({ min: 1, max: 1000 }),
      isPublic: true,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
  }

  static createMany(count: number) {
    return Array.from({ length: count }, () => this.createValid());
  }
}

class TestDataUtils {
  static createApiResponseMeta(page = 1, limit = 10, total = 100) {
    const totalPages = Math.ceil(total / limit);
    return {
      page,
      limit,
      total,
      totalPages,
      hasNext: page < totalPages,
      hasPrev: page > 1,
    };
  }

  static createHateoasLinks(baseUrl: string, resourceId?: number) {
    const links = [
      {
        rel: 'self',
        href: resourceId ? `${baseUrl}/${resourceId}` : baseUrl,
        method: 'GET',
      },
    ];

    if (resourceId) {
      links.push(
        {
          rel: 'update',
          href: `${baseUrl}/${resourceId}`,
          method: 'PUT',
        },
        {
          rel: 'delete',
          href: `${baseUrl}/${resourceId}`,
          method: 'DELETE',
        },
      );
    }

    return links;
  }
}

describe('BookmarksController', () => {
  let controller: BookmarksController;
  let mockMediator: jest.Mocked<any>;

  beforeEach(async () => {
    // Create mock mediator
    mockMediator = {
      sendAsync: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [BookmarksController],
      providers: [
        {
          provide: MEDIATOR_TOKEN,
          useValue: mockMediator,
        },
      ],
    }).compile();

    controller = module.get<BookmarksController>(BookmarksController);
  });

  describe('getAllBookmarks', () => {
    it('should return paginated bookmarks with default parameters', async () => {
      // Arrange
      const bookmarks = BookmarkFactory.createMany(10);
      const expectedResponse = {
        data: bookmarks,
        meta: TestDataUtils.createApiResponseMeta(1, 10, 50),
        links: TestDataUtils.createHateoasLinks('/api/bookmarks'),
      };

      mockMediator.sendAsync.mockResolvedValue(expectedResponse);

      // Act
      const result = await controller.getAllBookmarks();

      // Assert
      expect(result).toEqual(expectedResponse);
      expect(mockMediator.sendAsync).toHaveBeenCalledWith(
        expect.objectContaining({
          page: 1,
          limit: 10,
          baseUrl: '/api/bookmarks',
        }),
      );
    });

    it('should return paginated bookmarks with custom parameters', async () => {
      // Arrange
      const page = faker.number.int({ min: 2, max: 5 });
      const limit = faker.number.int({ min: 5, max: 20 });
      const bookmarks = BookmarkFactory.createMany(limit);
      const expectedResponse = {
        data: bookmarks,
        meta: TestDataUtils.createApiResponseMeta(page, limit, 100),
        links: TestDataUtils.createHateoasLinks('/api/bookmarks'),
      };

      mockMediator.sendAsync.mockResolvedValue(expectedResponse);

      // Act
      const result = await controller.getAllBookmarks(page.toString(), limit.toString());

      // Assert
      expect(result).toEqual(expectedResponse);
      expect(mockMediator.sendAsync).toHaveBeenCalledWith(
        expect.objectContaining({
          page,
          limit,
          baseUrl: '/api/bookmarks',
        }),
      );
    });

    it('should handle invalid page parameter by defaulting to 1', async () => {
      // Arrange
      const bookmarks = BookmarkFactory.createMany(10);
      const expectedResponse = {
        data: bookmarks,
        meta: TestDataUtils.createApiResponseMeta(1, 10, 50),
        links: TestDataUtils.createHateoasLinks('/api/bookmarks'),
      };

      mockMediator.sendAsync.mockResolvedValue(expectedResponse);

      // Act
      const result = await controller.getAllBookmarks('0'); // Invalid page

      // Assert
      expect(result).toEqual(expectedResponse);
      expect(mockMediator.sendAsync).toHaveBeenCalledWith(
        expect.objectContaining({
          page: 1, // Should default to 1
          limit: 10,
        }),
      );
    });

    it('should handle invalid limit parameter by enforcing minimum', async () => {
      // Arrange
      const bookmarks = BookmarkFactory.createMany(1);
      const expectedResponse = {
        data: bookmarks,
        meta: TestDataUtils.createApiResponseMeta(1, 1, 50),
        links: TestDataUtils.createHateoasLinks('/api/bookmarks'),
      };

      mockMediator.sendAsync.mockResolvedValue(expectedResponse);

      // Act
      const result = await controller.getAllBookmarks('1', '0'); // Invalid limit

      // Assert
      expect(result).toEqual(expectedResponse);
      expect(mockMediator.sendAsync).toHaveBeenCalledWith(
        expect.objectContaining({
          page: 1,
          limit: 1, // Should be enforced to minimum 1
        }),
      );
    });

    it('should enforce maximum limit constraint', async () => {
      // Arrange
      const bookmarks = BookmarkFactory.createMany(100);
      const expectedResponse = {
        data: bookmarks,
        meta: TestDataUtils.createApiResponseMeta(1, 100, 500),
        links: TestDataUtils.createHateoasLinks('/api/bookmarks'),
      };

      mockMediator.sendAsync.mockResolvedValue(expectedResponse);

      // Act
      const result = await controller.getAllBookmarks('1', '150'); // Exceeds max limit

      // Assert
      expect(result).toEqual(expectedResponse);
      expect(mockMediator.sendAsync).toHaveBeenCalledWith(
        expect.objectContaining({
          page: 1,
          limit: 100, // Should be capped at 100
        }),
      );
    });

    it('should enforce minimum page constraint', async () => {
      // Arrange
      const bookmarks = BookmarkFactory.createMany(10);
      const expectedResponse = {
        data: bookmarks,
        meta: TestDataUtils.createApiResponseMeta(1, 10, 50),
        links: TestDataUtils.createHateoasLinks('/api/bookmarks'),
      };

      mockMediator.sendAsync.mockResolvedValue(expectedResponse);

      // Act
      const result = await controller.getAllBookmarks('-5'); // Negative page

      // Assert
      expect(result).toEqual(expectedResponse);
      expect(mockMediator.sendAsync).toHaveBeenCalledWith(
        expect.objectContaining({
          page: 1, // Should be enforced to minimum 1
          limit: 10,
        }),
      );
    });

    it('should handle mediator errors gracefully', async () => {
      // Arrange
      const error = new Error(faker.lorem.sentence());
      mockMediator.sendAsync.mockRejectedValue(error);

      // Act & Assert
      await expect(controller.getAllBookmarks()).rejects.toThrow(error);
      expect(mockMediator.sendAsync).toHaveBeenCalledTimes(1);
    });
  });

  describe('getBookmarkById', () => {
    it('should return bookmark by valid ID', async () => {
      // Arrange
      const bookmark = BookmarkFactory.createValid();
      const expectedResponse = {
        data: bookmark,
        links: TestDataUtils.createHateoasLinks('/api/bookmarks', bookmark.id),
      };

      mockMediator.sendAsync.mockResolvedValue(expectedResponse);

      // Act
      const result = await controller.getBookmarkById(bookmark.id.toString());

      // Assert
      expect(result).toEqual(expectedResponse);
      expect(mockMediator.sendAsync).toHaveBeenCalledWith(
        expect.objectContaining({
          id: bookmark.id,
        }),
      );
    });

    it('should handle string ID parameter correctly', async () => {
      // Arrange
      const bookmarkId = faker.number.int({ min: 1, max: 1000 });
      const bookmark = { ...BookmarkFactory.createValid(), id: bookmarkId };
      const expectedResponse = {
        data: bookmark,
        links: TestDataUtils.createHateoasLinks('/api/bookmarks', bookmarkId),
      };

      mockMediator.sendAsync.mockResolvedValue(expectedResponse);

      // Act
      const result = await controller.getBookmarkById(bookmarkId.toString());

      // Assert
      expect(result).toEqual(expectedResponse);
      expect(mockMediator.sendAsync).toHaveBeenCalledWith(
        expect.objectContaining({
          id: bookmarkId, // Should be parsed to number
        }),
      );
    });

    it('should handle non-numeric ID parameter', async () => {
      // Arrange
      const invalidId = faker.lorem.word();

      // Act
      const result = await controller.getBookmarkById(invalidId);

      // Assert
      expect(result).toEqual({
        status: 400,
        message: 'Invalid bookmark ID',
        data: null,
        timestamp: expect.any(String),
      });
      expect(mockMediator.sendAsync).not.toHaveBeenCalled();
    });

    it('should handle mediator errors for bookmark retrieval', async () => {
      // Arrange
      const bookmarkId = faker.number.int({ min: 1, max: 1000 });
      const error = new Error(`Bookmark ${bookmarkId} not found`);
      mockMediator.sendAsync.mockRejectedValue(error);

      // Act & Assert
      await expect(controller.getBookmarkById(bookmarkId.toString())).rejects.toThrow(error);
      expect(mockMediator.sendAsync).toHaveBeenCalledTimes(1);
    });
  });

  describe('dependency injection', () => {
    it('should inject mediator correctly', () => {
      expect(controller).toBeDefined();
      expect(mockMediator).toBeDefined();
    });

    it('should be an instance of BookmarksController', () => {
      expect(controller).toBeInstanceOf(BookmarksController);
    });
  });

  describe('parameter validation and parsing', () => {
    it('should handle decimal page numbers by rounding down', async () => {
      // Arrange
      const bookmarks = BookmarkFactory.createMany(10);
      const expectedResponse = {
        data: bookmarks,
        meta: TestDataUtils.createApiResponseMeta(3, 10, 50),
        links: TestDataUtils.createHateoasLinks('/api/bookmarks'),
      };

      mockMediator.sendAsync.mockResolvedValue(expectedResponse);

      // Act
      const result = await controller.getAllBookmarks('3.7'); // Decimal page

      // Assert
      expect(result).toEqual(expectedResponse);
      expect(mockMediator.sendAsync).toHaveBeenCalledWith(
        expect.objectContaining({
          page: 3, // Should be parsed to integer
          limit: 10,
        }),
      );
    });

    it('should handle decimal limit numbers by rounding down', async () => {
      // Arrange
      const bookmarks = BookmarkFactory.createMany(15);
      const expectedResponse = {
        data: bookmarks,
        meta: TestDataUtils.createApiResponseMeta(1, 15, 50),
        links: TestDataUtils.createHateoasLinks('/api/bookmarks'),
      };

      mockMediator.sendAsync.mockResolvedValue(expectedResponse);

      // Act
      const result = await controller.getAllBookmarks('1', '15.9'); // Decimal limit

      // Assert
      expect(result).toEqual(expectedResponse);
      expect(mockMediator.sendAsync).toHaveBeenCalledWith(
        expect.objectContaining({
          page: 1,
          limit: 15, // Should be parsed to integer
        }),
      );
    });
  });
});
