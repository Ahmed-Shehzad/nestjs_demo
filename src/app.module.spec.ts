import { DiscoveryService } from '@golevelup/nestjs-discovery';
import { MetadataScanner, ModuleRef } from '@nestjs/core';
import { Test, TestingModule } from '@nestjs/testing';
import { AppModule } from './app.module';
import { UNIT_OF_WORK_TOKEN } from './core/core.module';
import { PrismaService } from './core/prisma.service';
import { BookmarkRepository } from './features/bookmark/repositories/bookmark.repository';
import { UserRepository } from './features/user/repositories/user.repository';
import {
  OPENAPI_CONFIG_SERVICE_TOKEN,
  OPENAPI_DISCOVERY_SERVICE_TOKEN,
  OPENAPI_DOCUMENT_SERVICE_TOKEN,
  OPENAPI_SERVICE_TOKEN,
} from './lib/openapi';

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

    const mockOpenApiService = {
      initialize: jest.fn(),
      setupSwaggerUI: jest.fn(),
      getDocument: jest.fn(),
      refreshDocument: jest.fn(),
      registerModule: jest.fn(),
      getModuleEndpoints: jest.fn(),
      healthCheck: jest.fn(),
      getStats: jest.fn(),
    };

    const mockOpenApiDiscoveryService = {
      discoverFeatureModules: jest.fn(),
      discoverModuleEndpoints: jest.fn(),
      getRegisteredControllers: jest.fn(),
      getEndpointsByController: jest.fn(),
      getEndpointsByTag: jest.fn(),
      registerFeatureModule: jest.fn(),
      isModuleRegistered: jest.fn(),
    };

    const mockOpenApiDocumentService = {
      generateDocument: jest.fn(),
      generateModuleDocument: jest.fn(),
      updateDocument: jest.fn(),
      validateDocument: jest.fn(),
      exportDocument: jest.fn(),
      getDocumentStats: jest.fn(),
    };

    const mockOpenApiConfigService = {
      getConfig: jest.fn(),
      updateConfig: jest.fn(),
      mergeConfigs: jest.fn(),
      validateConfig: jest.fn(),
      getEnvironmentConfig: jest.fn(),
      resetToDefaults: jest.fn(),
    };

    const mockDiscoveryService = {
      getControllers: jest.fn().mockResolvedValue([]),
      getProviders: jest.fn().mockResolvedValue([]),
      getModules: jest.fn().mockResolvedValue([]),
      explore: jest.fn().mockResolvedValue([]),
    };

    const mockMetadataScanner = {
      scanFromPrototype: jest.fn().mockReturnValue([]),
      getAllMethodNames: jest.fn().mockReturnValue([]),
      getAllFilteredMethodNames: jest.fn().mockReturnValue([]),
    };

    const mockModuleRef = {
      get: jest.fn(),
      resolve: jest.fn(),
      create: jest.fn(),
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
      .overrideProvider(OPENAPI_SERVICE_TOKEN)
      .useValue(mockOpenApiService)
      .overrideProvider(OPENAPI_DISCOVERY_SERVICE_TOKEN)
      .useValue(mockOpenApiDiscoveryService)
      .overrideProvider(OPENAPI_DOCUMENT_SERVICE_TOKEN)
      .useValue(mockOpenApiDocumentService)
      .overrideProvider(OPENAPI_CONFIG_SERVICE_TOKEN)
      .useValue(mockOpenApiConfigService)
      .overrideProvider(DiscoveryService)
      .useValue(mockDiscoveryService)
      .overrideProvider(MetadataScanner)
      .useValue(mockMetadataScanner)
      .overrideProvider(ModuleRef)
      .useValue(mockModuleRef)
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

  it('should compile without errors', () => {
    expect(module).toBeDefined();
  });
});
