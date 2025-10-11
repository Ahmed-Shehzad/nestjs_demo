import { PrismaService } from '@/core/prisma.service';
import { ProblemDetailsService } from '@/problem-details/services/problem-details.service';
import { HttpStatus } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import * as bcrypt from 'bcrypt';
import { UserService } from './user.service';

// Mock bcrypt
jest.mock('bcrypt', () => ({
  compare: jest.fn(),
}));

// Simple test data using faker-like approach
const testData = {
  email: 'test@example.com',
  userId: 123,
  firstName: 'John',
  lastName: 'Doe',
  password: 'testPassword123',
  hashedPassword: '$2b$10$hashedPasswordExample',
};

describe('UserService', () => {
  let service: UserService;
  let prismaService: PrismaService;
  let problemDetailsService: ProblemDetailsService;

  beforeEach(async () => {
    const mockPrismaService = {
      user: {
        findUnique: jest.fn(),
        create: jest.fn(),
        update: jest.fn(),
        delete: jest.fn(),
      },
    };

    const mockProblemDetailsService = {
      createDomainProblem: jest.fn(),
      createUserNotFound: jest.fn(),
      createInvalidCredentials: jest.fn(),
      createDuplicateEmail: jest.fn(),
      createSecurityProblem: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UserService,
        {
          provide: PrismaService,
          useValue: mockPrismaService,
        },
        {
          provide: ProblemDetailsService,
          useValue: mockProblemDetailsService,
        },
      ],
    }).compile();

    service = module.get<UserService>(UserService);
    prismaService = module.get<PrismaService>(PrismaService);
    problemDetailsService = module.get<ProblemDetailsService>(ProblemDetailsService);
  });

  describe('constructor', () => {
    it('should be defined', () => {
      expect(service).toBeDefined();
    });

    it('should throw error if ProblemDetailsService is not provided', () => {
      expect(() => {
        new UserService(prismaService, null as any);
      }).toThrow('ProblemDetailsService is required');
    });
  });

  describe('getUserByEmail', () => {
    it('should return user when found', async () => {
      // Arrange
      const mockUser = {
        id: testData.userId,
        email: testData.email,
        firstName: testData.firstName,
        lastName: testData.lastName,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      (prismaService.user.findUnique as jest.Mock).mockResolvedValue(mockUser);

      // Act
      const result = await service.getUserByEmail(testData.email);

      // Assert
      expect(result).toEqual(mockUser);
      expect(prismaService.user.findUnique).toHaveBeenCalledWith({
        where: { email: testData.email },
        select: {
          id: true,
          email: true,
          firstName: true,
          lastName: true,
          createdAt: true,
          updatedAt: true,
        },
      });
    });

    it('should throw problem details exception when user not found', async () => {
      // Arrange
      (prismaService.user.findUnique as jest.Mock).mockResolvedValue(null);
      const mockError = new Error('User not found');
      (problemDetailsService.createDomainProblem as jest.Mock).mockReturnValue(mockError);

      // Act & Assert
      await expect(service.getUserByEmail(testData.email)).rejects.toThrow(mockError);
      expect(problemDetailsService.createDomainProblem).toHaveBeenCalledWith(
        HttpStatus.NOT_FOUND,
        'User Not Found',
        `No user found with email address '${testData.email}'.`,
        'USER_NOT_FOUND',
        {
          searchCriteria: 'email',
          searchValue: testData.email,
        },
      );
    });

    it('should handle database errors', async () => {
      // Arrange
      const dbError = new Error('Database connection failed');
      (prismaService.user.findUnique as jest.Mock).mockRejectedValue(dbError);
      const wrappedError = new Error('Database Error');
      (problemDetailsService.createDomainProblem as jest.Mock).mockReturnValue(wrappedError);

      // Act & Assert
      await expect(service.getUserByEmail(testData.email)).rejects.toThrow(wrappedError);
      expect(problemDetailsService.createDomainProblem).toHaveBeenCalledWith(
        HttpStatus.INTERNAL_SERVER_ERROR,
        'Database Error',
        'An error occurred while retrieving user information.',
        'DATABASE_ERROR',
        {
          operation: 'getUserByEmail',
          email: testData.email,
        },
      );
    });
  });

  describe('getUserById', () => {
    it('should return user when found by ID', async () => {
      // Arrange
      const mockUser = {
        id: testData.userId,
        email: testData.email,
        firstName: testData.firstName,
        lastName: testData.lastName,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      (prismaService.user.findUnique as jest.Mock).mockResolvedValue(mockUser);

      // Act
      const result = await service.getUserById(testData.userId);

      // Assert
      expect(result).toEqual(mockUser);
      expect(prismaService.user.findUnique).toHaveBeenCalledWith({
        where: { id: testData.userId },
        select: {
          id: true,
          email: true,
          firstName: true,
          lastName: true,
          createdAt: true,
          updatedAt: true,
        },
      });
    });

    it('should throw problem details exception when user not found by ID', async () => {
      // Arrange
      (prismaService.user.findUnique as jest.Mock).mockResolvedValue(null);
      const mockError = new Error('User not found');
      (problemDetailsService.createDomainProblem as jest.Mock).mockReturnValue(mockError);

      // Act & Assert
      await expect(service.getUserById(testData.userId)).rejects.toThrow(mockError);
      expect(problemDetailsService.createDomainProblem).toHaveBeenCalledWith(
        HttpStatus.NOT_FOUND,
        'User Not Found',
        `No user found with ID ${testData.userId}.`,
        'USER_NOT_FOUND',
        {
          searchCriteria: 'id',
          searchValue: testData.userId,
        },
      );
    });
  });

  describe('validateUserCredentials', () => {
    it('should return user when credentials are valid', async () => {
      // Arrange
      const mockUser = {
        id: testData.userId,
        email: testData.email,
        firstName: testData.firstName,
        lastName: testData.lastName,
        hash: testData.hashedPassword,
      };

      (prismaService.user.findUnique as jest.Mock).mockResolvedValue(mockUser);
      (bcrypt.compare as jest.Mock).mockResolvedValue(true);

      // Act
      const result = await service.validateUserCredentials(testData.email, testData.password);

      // Assert
      expect(result).toEqual({
        id: mockUser.id,
        email: mockUser.email,
        firstName: mockUser.firstName,
        lastName: mockUser.lastName,
      });
      expect(bcrypt.compare).toHaveBeenCalledWith(testData.password, testData.hashedPassword);
    });

    it('should throw security problem when user not found', async () => {
      // Arrange
      (prismaService.user.findUnique as jest.Mock).mockResolvedValue(null);
      const mockError = new Error('Invalid credentials');
      (problemDetailsService.createSecurityProblem as jest.Mock).mockReturnValue(mockError);

      // Act & Assert
      await expect(service.validateUserCredentials(testData.email, testData.password)).rejects.toThrow(mockError);
      expect(problemDetailsService.createSecurityProblem).toHaveBeenCalledWith(
        HttpStatus.UNAUTHORIZED,
        'Invalid Credentials',
        'authentication',
        'The provided email or password is incorrect.',
        'Please check your credentials and try again.',
      );
    });

    it('should throw security problem when password is invalid', async () => {
      // Arrange
      const mockUser = {
        id: testData.userId,
        email: testData.email,
        firstName: testData.firstName,
        lastName: testData.lastName,
        hash: testData.hashedPassword,
      };

      (prismaService.user.findUnique as jest.Mock).mockResolvedValue(mockUser);
      (bcrypt.compare as jest.Mock).mockResolvedValue(false);
      const mockError = new Error('Invalid credentials');
      (problemDetailsService.createSecurityProblem as jest.Mock).mockReturnValue(mockError);

      // Act & Assert
      await expect(service.validateUserCredentials(testData.email, testData.password)).rejects.toThrow(mockError);
      expect(problemDetailsService.createSecurityProblem).toHaveBeenCalledWith(
        HttpStatus.UNAUTHORIZED,
        'Invalid Credentials',
        'authentication',
        'The provided email or password is incorrect.',
        'Please check your credentials and try again.',
      );
    });
  });

  describe('checkEmailAvailability', () => {
    it('should return available true when email is not taken', async () => {
      // Arrange
      (prismaService.user.findUnique as jest.Mock).mockResolvedValue(null);

      // Act
      const result = await service.checkEmailAvailability(testData.email);

      // Assert
      expect(result).toEqual({ available: true });
      expect(prismaService.user.findUnique).toHaveBeenCalledWith({
        where: { email: testData.email },
        select: { id: true },
      });
    });

    it('should throw problem details exception when email is taken', async () => {
      // Arrange
      (prismaService.user.findUnique as jest.Mock).mockResolvedValue({ id: testData.userId });
      const mockError = new Error('Email already taken');
      (problemDetailsService.createDomainProblem as jest.Mock).mockReturnValue(mockError);

      // Act & Assert
      await expect(service.checkEmailAvailability(testData.email)).rejects.toThrow(mockError);
      expect(problemDetailsService.createDomainProblem).toHaveBeenCalledWith(
        HttpStatus.CONFLICT,
        'Email Already Taken',
        `A user with email address '${testData.email}' already exists.`,
        'EMAIL_CONFLICT',
        {
          email: testData.email,
          conflictType: 'duplicate_email',
        },
      );
    });

    it('should handle database errors gracefully', async () => {
      // Arrange
      const dbError = new Error('Database connection failed');
      (prismaService.user.findUnique as jest.Mock).mockRejectedValue(dbError);
      const mockProblemDetails = new Error('Domain problem');
      (problemDetailsService.createDomainProblem as jest.Mock).mockReturnValue(mockProblemDetails);

      // Act & Assert
      await expect(service.checkEmailAvailability(testData.email)).rejects.toThrow(mockProblemDetails);
    });
  });

  afterEach(() => {
    jest.clearAllMocks();
  });
});
