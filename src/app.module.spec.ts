import { PrismaService } from '@/core/prisma.service';
import { UsersController } from '@/features/user/user.controller';
import { ProblemDetailsService } from '@/problem-details/services/problem-details.service';
import { Test, TestingModule } from '@nestjs/testing';
import { AppController } from './app.controller';
import { AppModule } from './app.module';
import { AppService } from './app.service';

describe('AppModule', () => {
  let module: TestingModule;

  beforeEach(async () => {
    module = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();
  });

  afterEach(async () => {
    if (module) {
      await module.close();
    }
  });

  describe('module initialization', () => {
    it('should compile successfully', () => {
      expect(module).toBeDefined();
    });

    it('should provide AppController', () => {
      const controller = module.get(AppController, { strict: false });
      expect(controller).toBeDefined();
    });

    it('should provide AppService', () => {
      const service = module.get(AppService, { strict: false });
      expect(service).toBeDefined();
    });
  });

  describe('global modules', () => {
    it('should import CoreModule', () => {
      // CoreModule provides PrismaService globally
      const prismaService = module.get(PrismaService);
      expect(prismaService).toBeDefined();
    });

    it('should import ProblemDetailsModule', () => {
      // ProblemDetailsModule is global
      const problemDetailsService = module.get(ProblemDetailsService);
      expect(problemDetailsService).toBeDefined();
    });

    it('should import UserModule', () => {
      // UserModule should be available
      const usersController = module.get(UsersController);
      expect(usersController).toBeDefined();
    });
  });

  describe('dependency injection', () => {
    it('should resolve all dependencies correctly', async () => {
      // This test verifies that all dependencies can be resolved
      // If there are circular dependencies or missing providers, this will fail
      expect(() => module.get(AppController)).not.toThrow();
      expect(() => module.get(AppService)).not.toThrow();
    });
  });
});
