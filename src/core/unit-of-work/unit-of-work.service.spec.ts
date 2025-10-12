import { DatabaseProblemDetailsException } from '@/problem-details/exceptions/problem-details.exceptions';
import { ProblemDetailsService } from '@/problem-details/services/problem-details.service';
import { Test, TestingModule } from '@nestjs/testing';
import { PrismaClientKnownRequestError } from '@prisma/client/runtime/client';
import { PrismaService } from '../prisma.service';
import { UnitOfWork } from './unit-of-work.service';

describe('UnitOfWork - Database Error Handling', () => {
  let service: UnitOfWork;
  let prismaService: PrismaService;
  let problemDetailsService: ProblemDetailsService;

  const mockPrisma = {
    $transaction: jest.fn(),
  };

  const mockProblemDetailsService = {
    createDatabaseProblem: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UnitOfWork,
        {
          provide: PrismaService,
          useValue: mockPrisma,
        },
        {
          provide: ProblemDetailsService,
          useValue: mockProblemDetailsService,
        },
      ],
    }).compile();

    service = module.get<UnitOfWork>(UnitOfWork);
    prismaService = module.get<PrismaService>(PrismaService);
    problemDetailsService = module.get<ProblemDetailsService>(ProblemDetailsService);

    // Reset mocks
    jest.clearAllMocks();
  });

  describe('executeInTransactionAsync', () => {
    it('should handle Prisma database errors and convert them to DatabaseProblemDetailsException', async () => {
      // Arrange
      const prismaError = new PrismaClientKnownRequestError('Unique constraint failed', {
        code: 'P2002',
        clientVersion: '5.0.0',
        meta: { target: ['email'] },
      });

      const mockDatabaseException = new DatabaseProblemDetailsException({
        status: 409,
        title: 'Unique Constraint Violation',
        detail: 'A user with this email already exists.',
        code: 'P2002',
        type: 'https://datatracker.ietf.org/doc/html/rfc7807#section-3/unique-violation',
        instance: '/api/users',
        timestamp: new Date().toISOString(),
        traceId: 'test-trace-id',
      });

      mockPrisma.$transaction.mockRejectedValue(prismaError);
      mockProblemDetailsService.createDatabaseProblem.mockReturnValue(mockDatabaseException);

      const mockOperation = jest.fn().mockResolvedValue('test-result');

      // Act & Assert
      await expect(service.executeInTransactionAsync(mockOperation)).rejects.toThrow(DatabaseProblemDetailsException);

      expect(mockProblemDetailsService.createDatabaseProblem).toHaveBeenCalledWith(prismaError);
    });

    it('should re-throw non-database errors without conversion', async () => {
      // Arrange
      const genericError = new Error('Generic error message');
      mockPrisma.$transaction.mockRejectedValue(genericError);

      const mockOperation = jest.fn().mockResolvedValue('test-result');

      // Act & Assert
      await expect(service.executeInTransactionAsync(mockOperation)).rejects.toThrow('Generic error message');

      expect(mockProblemDetailsService.createDatabaseProblem).not.toHaveBeenCalled();
    });
  });

  describe('executeWithManualTransactionAsync', () => {
    it('should handle database errors after rollback and convert them to DatabaseProblemDetailsException', async () => {
      // Arrange
      const prismaError = new PrismaClientKnownRequestError('Connection timeout', {
        code: 'P2024',
        clientVersion: '5.0.0',
        meta: {},
      });

      const mockDatabaseException = new DatabaseProblemDetailsException({
        status: 408,
        title: 'Database Timeout',
        detail: 'Database operation timed out.',
        code: 'P2024',
        type: 'https://datatracker.ietf.org/doc/html/rfc7807#section-3/timeout',
        instance: '/api/users',
        timestamp: new Date().toISOString(),
        traceId: 'test-trace-id',
      });

      mockProblemDetailsService.createDatabaseProblem.mockReturnValue(mockDatabaseException);

      // Mock the beginTransactionAsync to succeed
      const beginSpy = jest.spyOn(service, 'beginTransactionAsync').mockResolvedValue();
      const rollbackSpy = jest.spyOn(service, 'rollbackAsync').mockResolvedValue();

      const mockOperation = jest.fn().mockRejectedValue(prismaError);

      // Act & Assert
      await expect(service.executeWithManualTransactionAsync(mockOperation)).rejects.toThrow(
        DatabaseProblemDetailsException,
      );

      expect(beginSpy).toHaveBeenCalled();
      expect(rollbackSpy).toHaveBeenCalled();
      expect(mockProblemDetailsService.createDatabaseProblem).toHaveBeenCalledWith(prismaError);
    });
  });

  describe('isDatabaseError helper', () => {
    it('should correctly identify Prisma database errors', () => {
      // Arrange
      const knownRequestError = new PrismaClientKnownRequestError('test', {
        code: 'P2002',
        clientVersion: '5.0.0',
      });
      const genericError = new Error('Generic error');

      // Access private method for testing
      const isDatabaseErrorMethod = (service as any).isDatabaseError.bind(service);

      // Act & Assert
      expect(isDatabaseErrorMethod(knownRequestError)).toBe(true);
      expect(isDatabaseErrorMethod(genericError)).toBe(false);
      expect(isDatabaseErrorMethod(null)).toBe(false);
      expect(isDatabaseErrorMethod(undefined)).toBe(false);
    });
  });
});
