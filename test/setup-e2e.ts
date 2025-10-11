// E2E Test Setup for NestJS Enterprise API
// This file sets up the testing environment for end-to-end tests

import 'reflect-metadata';

// Set test environment variables
process.env.NODE_ENV = 'test';
process.env.DATABASE_URL =
  'postgresql://postgres:123@localhost:5435/nest?schema=public&connection_limit=5&pool_timeout=20&connect_timeout=60';
process.env.TEST_DATABASE_URL =
  'postgresql://postgres:123@localhost:5435/nest?schema=public&connection_limit=5&pool_timeout=20&connect_timeout=60';
process.env.PORT = '3001';
process.env.JWT_SECRET = 'test-super-secret';

// Set test timeout for database operations
jest.setTimeout(30000);

// Global test setup
beforeAll(async () => {
  // Give the database container time to fully start
  await new Promise((resolve) => setTimeout(resolve, 2000));
});

// Clean up after all tests
afterAll(async () => {
  // Allow time for cleanup
  await new Promise((resolve) => setTimeout(resolve, 1000));
});
