// Jest configuration for NestJS Enterprise CQRS API
// Test setup and global configurations

import 'reflect-metadata';

// Global test timeout (30 seconds for integration tests)
jest.setTimeout(30000);

// Mock console methods for cleaner test output
const originalConsole = global.console;

beforeAll(() => {
  global.console = {
    ...originalConsole,
    // Mock console.log and console.debug for cleaner test output
    log: jest.fn(),
    debug: jest.fn(),
    // Keep error and warn for important messages
    error: originalConsole.error,
    warn: originalConsole.warn,
    info: originalConsole.info,
  };
});

afterAll(() => {
  global.console = originalConsole;
});

// Global test utilities
export const TestHelpers = {
  /**
   * Create a mock PrismaClient for testing
   */
  createMockPrismaClient: () => ({
    user: {
      findMany: jest.fn(),
      findUnique: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
      count: jest.fn(),
    },
    bookmark: {
      findMany: jest.fn(),
      findUnique: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
      count: jest.fn(),
    },
    $connect: jest.fn(),
    $disconnect: jest.fn(),
    $queryRaw: jest.fn(),
  }),

  /**
   * Create a mock IMediator for testing
   */
  createMockMediator: () => ({
    sendAsync: jest.fn(),
    publishAsync: jest.fn(),
  }),

  /**
   * Create a mock validator for testing
   */
  createMockValidator: () => ({
    validateAsync: jest.fn().mockResolvedValue({
      isValid: true,
      errors: [],
    }),
  }),

  /**
   * Sleep utility for async tests
   */
  sleep: (ms: number) => new Promise((resolve) => setTimeout(resolve, ms)),

  /**
   * Create test user data
   */
  createTestUser: (overrides: Partial<any> = {}) => ({
    id: 1,
    email: 'test@example.com',
    firstName: 'John',
    lastName: 'Doe',
    createdAt: new Date('2023-01-01'),
    updatedAt: new Date('2023-01-01'),
    ...overrides,
  }),

  /**
   * Create test bookmark data
   */
  createTestBookmark: (overrides: Partial<any> = {}) => ({
    id: 1,
    userId: 1,
    title: 'Test Bookmark',
    description: 'Test Description',
    link: 'https://example.com',
    createdAt: new Date('2023-01-01'),
    updatedAt: new Date('2023-01-01'),
    ...overrides,
  }),

  /**
   * Generate random test data
   */
  generateRandomString: (length: number = 10) => {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let result = '';
    for (let i = 0; i < length; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
  },

  /**
   * Generate random email
   */
  generateRandomEmail: () => {
    const username = TestHelpers.generateRandomString(8);
    const domain = TestHelpers.generateRandomString(6);
    return `${username}@${domain}.com`;
  },

  /**
   * Assert that an object matches expected structure
   */
  expectToMatchStructure: (actual: any, expected: any) => {
    Object.keys(expected).forEach((key) => {
      expect(actual).toHaveProperty(key);
      if (expected[key] !== undefined && expected[key] !== null) {
        expect(typeof actual[key]).toBe(typeof expected[key]);
      }
    });
  },

  /**
   * Wait for condition to be true
   */
  waitForCondition: async (
    condition: () => boolean | Promise<boolean>,
    timeoutMs: number = 5000,
    intervalMs: number = 100,
  ): Promise<void> => {
    const startTime = Date.now();
    while (Date.now() - startTime < timeoutMs) {
      if (await condition()) {
        return;
      }
      await TestHelpers.sleep(intervalMs);
    }
    throw new Error(`Condition not met within ${timeoutMs}ms`);
  },

  /**
   * Create integration test module
   */
  createTestModule: async (moduleClass: any, providers: any[] = []) => {
    const { Test } = await import('@nestjs/testing');

    return Test.createTestingModule({
      imports: [moduleClass],
      providers: [
        ...providers,
        {
          provide: 'PrismaClient',
          useValue: TestHelpers.createMockPrismaClient(),
        },
        {
          provide: 'IMediator',
          useValue: TestHelpers.createMockMediator(),
        },
      ],
    }).compile();
  },
};

// Custom Jest matchers
declare global {
  namespace jest {
    interface Matchers<R> {
      toBeValidPaginatedResponse(): R;
      toBeValidProblemDetails(): R;
      toHaveValidationErrors(): R;
    }
  }
}

// Add custom matchers
expect.extend({
  toBeValidPaginatedResponse(received) {
    const pass =
      received &&
      Array.isArray(received.data) &&
      received.meta &&
      typeof received.meta.currentPage === 'number' &&
      typeof received.meta.totalItems === 'number' &&
      typeof received.meta.totalPages === 'number' &&
      typeof received.meta.itemsPerPage === 'number' &&
      typeof received.meta.hasNextPage === 'boolean' &&
      typeof received.meta.hasPreviousPage === 'boolean' &&
      Array.isArray(received.links);

    return {
      message: () =>
        pass
          ? `Expected ${received} not to be a valid paginated response`
          : `Expected ${received} to be a valid paginated response with data, meta, and links properties`,
      pass,
    };
  },

  toBeValidProblemDetails(received) {
    const pass =
      received &&
      typeof received.type === 'string' &&
      typeof received.title === 'string' &&
      typeof received.status === 'number' &&
      typeof received.detail === 'string' &&
      typeof received.instance === 'string' &&
      typeof received.timestamp === 'string' &&
      typeof received.traceId === 'string';

    return {
      message: () =>
        pass
          ? `Expected ${received} not to be valid problem details`
          : `Expected ${received} to be valid problem details with required RFC 7807 properties`,
      pass,
    };
  },

  toHaveValidationErrors(received) {
    const pass =
      received &&
      Array.isArray(received.errors) &&
      received.errors.length > 0 &&
      received.errors.every(
        (error: any) => error && typeof error.propertyName === 'string' && typeof error.message === 'string',
      );

    return {
      message: () =>
        pass
          ? `Expected ${received} not to have validation errors`
          : `Expected ${received} to have validation errors array with propertyName and message`,
      pass,
    };
  },
});

// Global error handler for unhandled promise rejections in tests
process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled Promise Rejection in test:', reason);
  // Don't exit the process in tests, just log the error
});

// Global error handler for uncaught exceptions in tests
process.on('uncaughtException', (error) => {
  console.error('Uncaught Exception in test:', error);
  // Don't exit the process in tests, just log the error
});
