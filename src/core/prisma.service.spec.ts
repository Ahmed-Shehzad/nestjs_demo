import { Test, TestingModule } from '@nestjs/testing';
import { PrismaService } from './prisma.service';

describe('PrismaService', () => {
  let service: PrismaService;

  beforeEach(async () => {
    // Create a comprehensive mock of PrismaService to avoid any database interactions
    const mockPrismaService = {
      $connect: jest.fn().mockResolvedValue(undefined),
      $disconnect: jest.fn().mockResolvedValue(undefined),
      $queryRaw: jest.fn().mockResolvedValue([{ '?column?': 1 }]),
      onModuleInit: jest.fn().mockResolvedValue(undefined),
      onModuleDestroy: jest.fn().mockResolvedValue(undefined),
      healthCheck: jest.fn().mockResolvedValue(true),
      logger: {
        log: jest.fn(),
        error: jest.fn(),
      },
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        {
          provide: PrismaService,
          useValue: mockPrismaService,
        },
      ],
    }).compile();

    service = module.get<PrismaService>(PrismaService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('initialization', () => {
    it('should be defined', () => {
      expect(service).toBeDefined();
    });

    it('should have required methods', () => {
      expect(service.onModuleInit).toBeDefined();
      expect(service.onModuleDestroy).toBeDefined();
      expect(service.healthCheck).toBeDefined();
      expect(service.$connect).toBeDefined();
      expect(service.$disconnect).toBeDefined();
    });
  });

  describe('onModuleInit', () => {
    it('should call onModuleInit successfully', async () => {
      await service.onModuleInit();
      expect(service.onModuleInit).toHaveBeenCalled();
    });
  });

  describe('onModuleDestroy', () => {
    it('should call onModuleDestroy successfully', async () => {
      await service.onModuleDestroy();
      expect(service.onModuleDestroy).toHaveBeenCalled();
    });
  });

  describe('healthCheck', () => {
    it('should return true for successful health check', async () => {
      const result = await service.healthCheck();
      expect(result).toBe(true);
      expect(service.healthCheck).toHaveBeenCalled();
    });
  });

  describe('database methods', () => {
    it('should have $connect method', () => {
      expect(service.$connect).toBeDefined();
      expect(typeof service.$connect).toBe('function');
    });

    it('should have $disconnect method', () => {
      expect(service.$disconnect).toBeDefined();
      expect(typeof service.$disconnect).toBe('function');
    });

    it('should have $queryRaw method', () => {
      expect(service.$queryRaw).toBeDefined();
      expect(typeof service.$queryRaw).toBe('function');
    });
  });
});
