import { Test, TestingModule } from '@nestjs/testing';
import { AppModule } from './app.module';
import { PrismaService } from './core/prisma.service';

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
