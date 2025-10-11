import { Test, TestingModule } from '@nestjs/testing';
import { PrismaService } from './prisma.service';

describe('PrismaService', () => {
  let service: PrismaService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [PrismaService],
    }).compile();

    service = module.get<PrismaService>(PrismaService);

    // Mock the database connection methods to prevent real connections in tests
    jest.spyOn(service, '$connect').mockResolvedValue(undefined);
    jest.spyOn(service, '$disconnect').mockResolvedValue(undefined);
  });

  afterEach(() => {
    // Clear all mocks after each test
    jest.clearAllMocks();
  });

  describe('initialization', () => {
    it('should be defined', () => {
      expect(service).toBeDefined();
    });

    it('should be an instance of PrismaService', () => {
      expect(service).toBeDefined();
      expect(service.constructor.name).toBe('PrismaService');
    });
  });

  describe('onModuleInit', () => {
    it('should connect to database successfully', async () => {
      const connectSpy = jest.spyOn(service, '$connect').mockResolvedValue(undefined);

      await service.onModuleInit();

      expect(connectSpy).toHaveBeenCalledTimes(1);
    });

    it('should handle connection failures', async () => {
      const error = new Error('Connection failed');
      jest.spyOn(service, '$connect').mockRejectedValue(error);

      await expect(service.onModuleInit()).rejects.toThrow('Connection failed');
    });
  });

  describe('onModuleDestroy', () => {
    it('should disconnect from database successfully', async () => {
      const disconnectSpy = jest.spyOn(service, '$disconnect').mockResolvedValue(undefined);

      await service.onModuleDestroy();

      expect(disconnectSpy).toHaveBeenCalledTimes(1);
    });

    it('should handle disconnection errors gracefully', async () => {
      const error = new Error('Disconnection failed');
      const loggerSpy = jest.spyOn(service['logger'], 'error').mockImplementation();
      jest.spyOn(service, '$disconnect').mockRejectedValue(error);

      await service.onModuleDestroy();

      expect(loggerSpy).toHaveBeenCalledWith('Error disconnecting from database:', error);
    });
  });

  describe('healthCheck', () => {
    it('should return true for successful health check', async () => {
      jest.spyOn(service, '$queryRaw').mockResolvedValue([{ '?column?': 1 }]);

      const result = await service.healthCheck();

      expect(result).toBe(true);
    });

    it('should return false for failed health check', async () => {
      const error = new Error('Database unavailable');
      const loggerSpy = jest.spyOn(service['logger'], 'error').mockImplementation();
      jest.spyOn(service, '$queryRaw').mockRejectedValue(error);

      const result = await service.healthCheck();

      expect(result).toBe(false);
      expect(loggerSpy).toHaveBeenCalledWith('Database health check failed:', error);
    });
  });
});
