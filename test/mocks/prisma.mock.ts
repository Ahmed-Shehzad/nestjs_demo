import { PrismaClient } from '@prisma/client';

/**
 * Mock Prisma Client for Testing
 *
 * This mock prevents real database connections during unit tests
 * and provides a consistent testing interface.
 */
export const createMockPrismaClient = (): jest.Mocked<PrismaClient> => {
  return {
    $connect: jest.fn().mockResolvedValue(undefined),
    $disconnect: jest.fn().mockResolvedValue(undefined),
    $queryRaw: jest.fn(),
    $queryRawUnsafe: jest.fn(),
    $executeRaw: jest.fn(),
    $executeRawUnsafe: jest.fn(),
    $transaction: jest.fn(),
    $on: jest.fn(),
    $use: jest.fn(),
    $extends: jest.fn(),

    // User model mock
    user: {
      findMany: jest.fn(),
      findUnique: jest.fn(),
      findFirst: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
      count: jest.fn(),
      aggregate: jest.fn(),
      groupBy: jest.fn(),
      upsert: jest.fn(),
      createMany: jest.fn(),
      updateMany: jest.fn(),
      deleteMany: jest.fn(),
    },

    // Bookmark model mock
    bookmark: {
      findMany: jest.fn(),
      findUnique: jest.fn(),
      findFirst: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
      count: jest.fn(),
      aggregate: jest.fn(),
      groupBy: jest.fn(),
      upsert: jest.fn(),
      createMany: jest.fn(),
      updateMany: jest.fn(),
      deleteMany: jest.fn(),
    },
  } as any;
};

/**
 * Mock Prisma Service for Testing
 *
 * Use this in tests where you need a PrismaService but don't want
 * to make real database connections.
 */
export const createMockPrismaService = () => {
  const mockClient = createMockPrismaClient();

  return {
    ...mockClient,
    onModuleInit: jest.fn().mockResolvedValue(undefined),
    onModuleDestroy: jest.fn().mockResolvedValue(undefined),
    healthCheck: jest.fn().mockResolvedValue(true),
    logger: {
      log: jest.fn(),
      error: jest.fn(),
      warn: jest.fn(),
      debug: jest.fn(),
      verbose: jest.fn(),
    },
  };
};
