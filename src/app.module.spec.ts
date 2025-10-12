import { Test, TestingModule } from '@nestjs/testing';
import { AppModule } from './app.module';
import { UNIT_OF_WORK_TOKEN } from './core/core.module';
import { PrismaService } from './core/prisma.service';
import { BookmarkRepository } from './features/bookmark/repositories/bookmark.repository';
import { UserRepository } from './features/user/repositories/user.repository';

describe('AppModule', () => {
  let module: TestingModule;

  beforeEach(async () => {
    // Create mocks for the new repositories to avoid circular dependencies in tests
    const mockUnitOfWork = {
      getTransactionContext: jest.fn().mockReturnValue({
        user: { findUnique: jest.fn(), create: jest.fn(), findMany: jest.fn() },
        bookmark: { findUnique: jest.fn(), create: jest.fn(), findMany: jest.fn() },
      }),
      executeInTransactionAsync: jest.fn(),
      beginTransactionAsync: jest.fn(),
      commitAsync: jest.fn(),
      rollbackAsync: jest.fn(),
      isInTransaction: jest.fn().mockReturnValue(false),
    };

    const mockUserRepository = {
      findByIdAsync: jest.fn(),
      findByEmailAsync: jest.fn(),
      createAsync: jest.fn(),
      updateAsync: jest.fn(),
      deleteAsync: jest.fn(),
    };

    const mockBookmarkRepository = {
      findByIdAsync: jest.fn(),
      findByUserIdAsync: jest.fn(),
      createAsync: jest.fn(),
      updateAsync: jest.fn(),
      deleteAsync: jest.fn(),
    };

    module = await Test.createTestingModule({
      imports: [AppModule],
    })
      .overrideProvider(UNIT_OF_WORK_TOKEN)
      .useValue(mockUnitOfWork)
      .overrideProvider(UserRepository)
      .useValue(mockUserRepository)
      .overrideProvider(BookmarkRepository)
      .useValue(mockBookmarkRepository)
      .compile();
  });

  afterEach(async () => {
    if (module) {
      await module.close();
    }
  });

  it('should be defined', () => {
    expect(module).toBeDefined();
  });

  it('should have PrismaService available', () => {
    const prismaService = module.get<PrismaService>(PrismaService);
    expect(prismaService).toBeDefined();
  });

  it('should compile without errors', async () => {
    expect(module).toBeInstanceOf(TestingModule);
  });
});
