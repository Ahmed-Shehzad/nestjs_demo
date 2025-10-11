import { Test, TestingModule } from '@nestjs/testing';
import { FluentResult } from '../../lib/fluent-results/types/fluent-results.types';
import { MediatorDiscoveryService } from '../../lib/mediator/discovery/mediator-discovery.service';
import { IMediator } from '../../lib/mediator/types/mediator';
import { CreateUserRequest } from './commands/create-user.dto';
import { GetAllUsersDto } from './queries/get-all-users.dto';
import { UsersController } from './user.controller';

describe('UsersController', () => {
  let controller: UsersController;
  let mediator: jest.Mocked<IMediator>;
  let discoveryService: jest.Mocked<MediatorDiscoveryService>;

  beforeEach(async () => {
    const mediatorMock = {
      sendAsync: jest.fn(),
      publishAsync: jest.fn(),
    };

    const discoveryMock = {
      getHandler: jest.fn(),
      getNotificationHandlers: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [UsersController],
      providers: [
        { provide: 'IMediator', useValue: mediatorMock },
        { provide: MediatorDiscoveryService, useValue: discoveryMock },
      ],
    }).compile();

    controller = module.get<UsersController>(UsersController);
    mediator = module.get('IMediator');
    discoveryService = module.get(MediatorDiscoveryService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('getAllUsers', () => {
    it('should return paginated users with default parameters', async () => {
      // Arrange
      const mockResponse = new GetAllUsersDto([], 0, 1, 10, '/api/users');
      mediator.sendAsync.mockResolvedValue(mockResponse);

      // Act
      const result = await controller.getAllUsers();

      // Assert
      expect(result).toBe(mockResponse);
      expect(mediator.sendAsync).toHaveBeenCalledWith(
        expect.objectContaining({
          page: 1,
          limit: 10,
          baseUrl: '/api/users',
        }),
      );
    });

    it('should return paginated users with custom parameters', async () => {
      // Arrange
      const mockResponse = new GetAllUsersDto([], 0, 2, 5, '/api/users');
      mediator.sendAsync.mockResolvedValue(mockResponse);

      // Act
      const result = await controller.getAllUsers('2', '5');

      // Assert
      expect(result).toBe(mockResponse);
      expect(mediator.sendAsync).toHaveBeenCalledWith(
        expect.objectContaining({
          page: 2,
          limit: 5,
          baseUrl: '/api/users',
        }),
      );
    });

    it('should handle invalid page parameter', async () => {
      // Arrange
      const mockResponse = new GetAllUsersDto([], 0, 1, 10, '/api/users');
      mediator.sendAsync.mockResolvedValue(mockResponse);

      // Act
      const result = await controller.getAllUsers('invalid', '10');

      // Assert
      expect(result).toBe(mockResponse);
      expect(mediator.sendAsync).toHaveBeenCalledWith(
        expect.objectContaining({
          page: 1, // Should default to 1 for invalid input
          limit: 10,
        }),
      );
    });

    it('should handle invalid limit parameter', async () => {
      // Arrange
      const mockResponse = new GetAllUsersDto([], 0, 1, 10, '/api/users');
      mediator.sendAsync.mockResolvedValue(mockResponse);

      // Act
      const result = await controller.getAllUsers('1', 'invalid');

      // Assert
      expect(result).toBe(mockResponse);
      expect(mediator.sendAsync).toHaveBeenCalledWith(
        expect.objectContaining({
          page: 1,
          limit: 10, // Should default to 10 for invalid input
        }),
      );
    });

    it('should enforce maximum limit constraint', async () => {
      // Arrange
      const mockResponse = new GetAllUsersDto([], 0, 1, 100, '/api/users');
      mediator.sendAsync.mockResolvedValue(mockResponse);

      // Act
      const result = await controller.getAllUsers('1', '200');

      // Assert
      expect(result).toBe(mockResponse);
      expect(mediator.sendAsync).toHaveBeenCalledWith(
        expect.objectContaining({
          page: 1,
          limit: 100, // Should be capped at 100
        }),
      );
    });

    it('should enforce minimum page constraint', async () => {
      // Arrange
      const mockResponse = new GetAllUsersDto([], 0, 1, 10, '/api/users');
      mediator.sendAsync.mockResolvedValue(mockResponse);

      // Act
      const result = await controller.getAllUsers('0', '10');

      // Assert
      expect(result).toBe(mockResponse);
      expect(mediator.sendAsync).toHaveBeenCalledWith(
        expect.objectContaining({
          page: 1, // Should be minimum 1
          limit: 10,
        }),
      );
    });

    it('should handle mediator errors', async () => {
      // Arrange
      const error = new Error('Database connection failed');
      mediator.sendAsync.mockRejectedValue(error);

      // Act & Assert
      await expect(controller.getAllUsers()).rejects.toThrow('Database connection failed');
    });
  });

  describe('createUser', () => {
    it('should create user successfully', async () => {
      // Arrange
      const createUserDto: CreateUserRequest = {
        email: 'test@example.com',
        firstName: 'John',
        lastName: 'Doe',
        password: 'password123',
      };

      const successResult = FluentResult.success(1);
      mediator.sendAsync.mockResolvedValue(successResult);

      // Act
      const result = await controller.createUser(createUserDto);

      // Assert
      expect(result).toEqual({
        id: 1,
        success: true,
        message: 'User created successfully',
        createdAt: expect.any(Date),
      });

      expect(mediator.sendAsync).toHaveBeenCalledWith(
        expect.objectContaining({
          email: 'test@example.com',
          firstName: 'John',
          lastName: 'Doe',
          password: 'password123',
        }),
      );
    });

    it('should handle user creation failure', async () => {
      // Arrange
      const createUserDto: CreateUserRequest = {
        email: 'test@example.com',
        firstName: 'John',
        lastName: 'Doe',
        password: 'password123',
      };

      const failureResult = FluentResult.failure('Email already exists', 'DUPLICATE_EMAIL');
      mediator.sendAsync.mockResolvedValue(failureResult);

      // Act
      const result = await controller.createUser(createUserDto);

      // Assert
      expect(result).toEqual({
        id: 0,
        success: false,
        message: 'Email already exists',
        createdAt: expect.any(Date),
      });
    });

    it('should handle optional name fields', async () => {
      // Arrange
      const createUserDto: CreateUserRequest = {
        email: 'test@example.com',
        firstName: undefined,
        lastName: undefined,
        password: 'password123',
      };

      const successResult = FluentResult.success(1);
      mediator.sendAsync.mockResolvedValue(successResult);

      // Act
      const result = await controller.createUser(createUserDto);

      // Assert
      expect(result.success).toBe(true);
      expect(mediator.sendAsync).toHaveBeenCalledWith(
        expect.objectContaining({
          email: 'test@example.com',
          firstName: null,
          lastName: null,
          password: 'password123',
        }),
      );
    });

    it('should convert undefined name fields to null', async () => {
      // Arrange
      const createUserDto: CreateUserRequest = {
        email: 'test@example.com',
        firstName: undefined,
        lastName: undefined,
        password: 'password123',
      };

      const successResult = FluentResult.success(1);
      mediator.sendAsync.mockResolvedValue(successResult);

      // Act
      await controller.createUser(createUserDto);

      // Assert
      expect(mediator.sendAsync).toHaveBeenCalledWith(
        expect.objectContaining({
          firstName: null,
          lastName: null,
        }),
      );
    });

    it('should handle mediator errors during user creation', async () => {
      // Arrange
      const createUserDto: CreateUserRequest = {
        email: 'test@example.com',
        firstName: 'John',
        lastName: 'Doe',
        password: 'password123',
      };

      const error = new Error('Validation failed');
      mediator.sendAsync.mockRejectedValue(error);

      // Act & Assert
      await expect(controller.createUser(createUserDto)).rejects.toThrow('Validation failed');
    });
  });

  describe('dependency injection', () => {
    it('should inject mediator correctly', () => {
      expect(controller).toBeDefined();
      expect(mediator).toBeDefined();
    });

    it('should inject discovery service correctly', () => {
      expect(discoveryService).toBeDefined();
    });
  });
});
