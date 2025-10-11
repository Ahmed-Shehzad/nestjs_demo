/* eslint-disable @typescript-eslint/unbound-method */
/* eslint-disable @typescript-eslint/no-unsafe-call */
import { PrismaService } from '@/core/prisma.service';
import { Test, TestingModule } from '@nestjs/testing';
import { GetAllUsersDto } from './get-all-users.dto';
import { GetAllUsersQueryHandler } from './get-all-users.handler';
import { GetAllUsersQuery } from './get-all-users.query';

// Mock user data
const mockUsers = [
  {
    id: 1,
    email: 'user1@example.com',
    firstName: 'John',
    lastName: 'Doe',
    createdAt: new Date('2023-01-01'),
    updatedAt: new Date('2023-01-01'),
    _count: { bookmarks: 3 },
  },
  {
    id: 2,
    email: 'user2@example.com',
    firstName: 'Jane',
    lastName: 'Smith',
    createdAt: new Date('2023-01-02'),
    updatedAt: new Date('2023-01-02'),
    _count: { bookmarks: 1 },
  },
];

describe('GetAllUsersQueryHandler', () => {
  let handler: GetAllUsersQueryHandler;
  let prisma: any;

  beforeEach(async () => {
    const prismaMock = {
      user: {
        findMany: jest.fn(),
        count: jest.fn(),
      },
    } as any;

    const module: TestingModule = await Test.createTestingModule({
      providers: [GetAllUsersQueryHandler, { provide: PrismaService, useValue: prismaMock }],
    }).compile();

    handler = module.get<GetAllUsersQueryHandler>(GetAllUsersQueryHandler);
    prisma = module.get(PrismaService) as any;
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('handleAsync', () => {
    it('should return paginated users with correct structure', async () => {
      // Arrange
      const query = new GetAllUsersQuery(1, 10, '/api/users');

      prisma.user.findMany.mockResolvedValue(mockUsers);
      prisma.user.count.mockResolvedValue(2);

      // Act
      const result = await handler.handleAsync(query);

      // Assert
      expect(result).toBeInstanceOf(GetAllUsersDto);
      expect(result.data).toHaveLength(2);
      expect(result.data[0]).toEqual({
        id: 1,
        email: 'user1@example.com',
        firstName: 'John',
        lastName: 'Doe',
        createdAt: expect.any(Date),
        updatedAt: expect.any(Date),
        bookmarksCount: 3,
      });
      expect(result.meta.totalItems).toBe(2);
      expect(result.meta.currentPage).toBe(1);
      expect(result.meta.itemsPerPage).toBe(10);
    });

    it('should call prisma with correct pagination parameters', async () => {
      // Arrange
      const query = new GetAllUsersQuery(2, 5, '/api/users');

      prisma.user.findMany.mockResolvedValue([]);
      prisma.user.count.mockResolvedValue(0);

      // Act
      await handler.handleAsync(query);

      // Assert
      expect(prisma.user.findMany).toHaveBeenCalledWith({
        skip: 5, // (page - 1) * limit = (2 - 1) * 5
        take: 5,
        select: {
          id: true,
          email: true,
          firstName: true,
          lastName: true,
          createdAt: true,
          updatedAt: true,
          _count: { select: { bookmarks: true } },
        },
        orderBy: [{ createdAt: 'desc' }, { id: 'desc' }],
      });
      expect(prisma.user.count).toHaveBeenCalled();
    });

    it('should enforce minimum page constraint', async () => {
      // Arrange
      const query = new GetAllUsersQuery(0, 10, '/api/users');

      prisma.user.findMany.mockResolvedValue([]);
      prisma.user.count.mockResolvedValue(0);

      // Act
      await handler.handleAsync(query);

      // Assert
      expect(prisma.user.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          skip: 0, // Should be (1 - 1) * 10 = 0 for page 1
        }),
      );
    });

    it('should enforce maximum limit constraint', async () => {
      // Arrange
      const query = new GetAllUsersQuery(1, 200, '/api/users');

      prisma.user.findMany.mockResolvedValue([]);
      prisma.user.count.mockResolvedValue(0);

      // Act
      await handler.handleAsync(query);

      // Assert
      expect(prisma.user.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          take: 100, // Should be capped at 100
        }),
      );
    });

    it('should enforce minimum limit constraint', async () => {
      // Arrange
      const query = new GetAllUsersQuery(1, 0, '/api/users');

      prisma.user.findMany.mockResolvedValue([]);
      prisma.user.count.mockResolvedValue(0);

      // Act
      await handler.handleAsync(query);

      // Assert
      expect(prisma.user.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          take: 1, // Should be minimum 1
        }),
      );
    });

    it('should execute database queries in parallel', async () => {
      // Arrange
      const query = new GetAllUsersQuery(1, 10, '/api/users');

      let findManyResolve: (value: any) => void;
      let countResolve: (value: any) => void;

      const findManyPromise = new Promise((resolve) => {
        findManyResolve = resolve;
      });

      const countPromise = new Promise((resolve) => {
        countResolve = resolve;
      });

      prisma.user.findMany.mockReturnValue(findManyPromise as any);
      prisma.user.count.mockReturnValue(countPromise as any);

      // Act
      const resultPromise = handler.handleAsync(query);

      // Verify both queries are called before either resolves
      expect(prisma.user.findMany).toHaveBeenCalled();
      expect(prisma.user.count).toHaveBeenCalled();

      // Resolve the promises
      findManyResolve!(mockUsers);
      countResolve!(2);

      const result = await resultPromise;

      // Assert
      expect(result.data).toHaveLength(2);
      expect(result.meta.totalItems).toBe(2);
    });

    it('should handle database errors gracefully', async () => {
      // Arrange
      const query = new GetAllUsersQuery(1, 10, '/api/users');
      const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation();

      prisma.user.findMany.mockRejectedValue(new Error('Database connection failed'));
      prisma.user.count.mockRejectedValue(new Error('Database connection failed'));

      // Act
      const result = await handler.handleAsync(query);

      // Assert
      expect(result).toBeInstanceOf(GetAllUsersDto);
      expect(result.data).toHaveLength(0);
      expect(result.meta.totalItems).toBe(0);
      expect(result.meta.currentPage).toBe(1);
      expect(result.meta.itemsPerPage).toBe(10);
      expect(consoleErrorSpy).toHaveBeenCalledWith('Error fetching users:', expect.any(Error));

      consoleErrorSpy.mockRestore();
    });

    it('should transform user data correctly excluding sensitive fields', async () => {
      // Arrange
      const query = new GetAllUsersQuery(1, 10, '/api/users');
      const userWithHash = [
        {
          ...mockUsers[0],
          hash: 'sensitive-password-hash', // This should not appear in result
        },
      ];

      prisma.user.findMany.mockResolvedValue(userWithHash as any);
      prisma.user.count.mockResolvedValue(1);

      // Act
      const result = await handler.handleAsync(query);

      // Assert
      expect(result.data[0]).not.toHaveProperty('hash');
      expect(result.data[0]).toHaveProperty('bookmarksCount', 3);
      expect(result.data[0]).not.toHaveProperty('_count');
    });

    it('should return empty result for no users', async () => {
      // Arrange
      const query = new GetAllUsersQuery(1, 10, '/api/users');

      prisma.user.findMany.mockResolvedValue([]);
      prisma.user.count.mockResolvedValue(0);

      // Act
      const result = await handler.handleAsync(query);

      // Assert
      expect(result).toBeInstanceOf(GetAllUsersDto);
      expect(result.data).toHaveLength(0);
      expect(result.meta.totalItems).toBe(0);
      expect(result.meta.totalPages).toBe(0);
      expect(result.meta.hasNextPage).toBe(false);
      expect(result.meta.hasPreviousPage).toBe(false);
    });

    it('should calculate pagination metadata correctly', async () => {
      // Arrange
      const query = new GetAllUsersQuery(2, 3, '/api/users'); // Page 2, limit 3

      prisma.user.findMany.mockResolvedValue(mockUsers.slice(0, 2)); // 2 users returned
      prisma.user.count.mockResolvedValue(7); // 7 total users

      // Act
      const result = await handler.handleAsync(query);

      // Assert
      expect(result.meta).toEqual({
        currentPage: 2,
        totalPages: 3, // Math.ceil(7 / 3)
        totalItems: 7,
        itemsPerPage: 3,
        hasNextPage: true, // 2 < 3
        hasPreviousPage: true, // 2 > 1
      });
    });
  });
});
