import { NotFoundException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { LoggingBehavior } from '../behaviors/logging.behavior';
import { TelemetryBehavior } from '../behaviors/telemetry.behavior';
import { ValidationBehavior } from '../behaviors/validation.behavior';
import { MediatorDiscoveryService } from '../discovery/mediator-discovery.service';
import { INotification, INotificationHandler } from '../types/notification';
import { IRequest, IRequestHandler } from '../types/request';
import { MediatorService } from './mediator.service';

// Test classes
class TestQuery implements IRequest<string> {
  constructor(public readonly id: string) {}
}

class TestCommand implements IRequest<void> {
  constructor(public readonly data: string) {}
}

class TestNotification implements INotification {
  constructor(public readonly message: string) {}
}

class TestQueryHandler implements IRequestHandler<TestQuery, string> {
  async handleAsync(request: TestQuery): Promise<string> {
    return `Result for ${request.id}`;
  }
}

class TestCommandHandler implements IRequestHandler<TestCommand, void> {
  async handleAsync(request: TestCommand): Promise<void> {
    // Command executed
  }
}

class TestNotificationHandler implements INotificationHandler<TestNotification> {
  async handleAsync(notification: TestNotification): Promise<void> {
    // Notification handled
  }
}

describe('MediatorService', () => {
  let service: MediatorService;
  let discoveryService: jest.Mocked<MediatorDiscoveryService>;
  let validationBehavior: jest.Mocked<ValidationBehavior>;
  let loggingBehavior: jest.Mocked<LoggingBehavior>;
  let telemetryBehavior: jest.Mocked<TelemetryBehavior>;

  beforeEach(async () => {
    const discoveryMock = {
      getHandler: jest.fn(),
      getNotificationHandlers: jest.fn(),
    };

    const validationMock = {
      handleAsync: jest.fn(),
    };

    const loggingMock = {
      handleAsync: jest.fn(),
    };

    const telemetryMock = {
      handleAsync: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        MediatorService,
        { provide: MediatorDiscoveryService, useValue: discoveryMock },
        { provide: ValidationBehavior, useValue: validationMock },
        { provide: LoggingBehavior, useValue: loggingMock },
        { provide: TelemetryBehavior, useValue: telemetryMock },
      ],
    }).compile();

    service = module.get<MediatorService>(MediatorService);
    discoveryService = module.get(MediatorDiscoveryService);
    validationBehavior = module.get(ValidationBehavior);
    loggingBehavior = module.get(LoggingBehavior);
    telemetryBehavior = module.get(TelemetryBehavior);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('sendAsync', () => {
    it('should successfully execute a query through the pipeline', async () => {
      // Arrange
      const query = new TestQuery('123');
      const handler = new TestQueryHandler();
      const expectedResult = 'Result for 123';

      discoveryService.getHandler.mockReturnValue(handler);

      // Mock behaviors to pass through
      validationBehavior.handleAsync.mockImplementation(async (req, next) => next());
      loggingBehavior.handleAsync.mockImplementation(async (req, next) => next());
      telemetryBehavior.handleAsync.mockImplementation(async (req, next) => next());

      // Act
      const result = await service.sendAsync(query);

      // Assert
      expect(result).toBe(expectedResult);
      expect(discoveryService.getHandler).toHaveBeenCalledWith('TestQuery');
      expect(validationBehavior.handleAsync).toHaveBeenCalled();
      expect(loggingBehavior.handleAsync).toHaveBeenCalled();
      expect(telemetryBehavior.handleAsync).toHaveBeenCalled();
    });

    it('should successfully execute a command through the pipeline', async () => {
      // Arrange
      const command = new TestCommand('test data');
      const handler = new TestCommandHandler();

      discoveryService.getHandler.mockReturnValue(handler);

      // Mock behaviors to pass through
      validationBehavior.handleAsync.mockImplementation(async (req, next) => next());
      loggingBehavior.handleAsync.mockImplementation(async (req, next) => next());
      telemetryBehavior.handleAsync.mockImplementation(async (req, next) => next());

      // Act & Assert
      await expect(service.sendAsync(command)).resolves.toBeUndefined();
      expect(discoveryService.getHandler).toHaveBeenCalledWith('TestCommand');
    });

    it('should throw NotFoundException when handler is not found', async () => {
      // Arrange
      const query = new TestQuery('123');
      discoveryService.getHandler.mockReturnValue(null);

      // Act & Assert
      await expect(service.sendAsync(query)).rejects.toThrow(NotFoundException);
      expect(discoveryService.getHandler).toHaveBeenCalledWith('TestQuery');
    });

    it('should handle pipeline behavior errors', async () => {
      // Arrange
      const query = new TestQuery('123');
      const handler = new TestQueryHandler();
      const error = new Error('Validation failed');

      discoveryService.getHandler.mockReturnValue(handler);

      // Mock other behaviors to pass through
      loggingBehavior.handleAsync.mockImplementation(async (req, next) => next());
      telemetryBehavior.handleAsync.mockImplementation(async (req, next) => next());

      // Mock validation behavior to throw error
      validationBehavior.handleAsync.mockImplementation(async (req, next) => {
        throw error;
      });

      // Act & Assert
      await expect(service.sendAsync(query)).rejects.toThrow('Validation failed');
    });

    it('should handle handler execution errors', async () => {
      // Arrange
      const query = new TestQuery('123');
      const handler = {
        handleAsync: jest.fn().mockRejectedValue(new Error('Handler error')),
      };

      discoveryService.getHandler.mockReturnValue(handler);
      validationBehavior.handleAsync.mockImplementation(async (req, next) => next());
      loggingBehavior.handleAsync.mockImplementation(async (req, next) => next());
      telemetryBehavior.handleAsync.mockImplementation(async (req, next) => next());

      // Act & Assert
      await expect(service.sendAsync(query)).rejects.toThrow('Handler error');
    });
  });

  describe('publishAsync', () => {
    it('should successfully publish notification to all handlers', async () => {
      // Arrange
      const notification = new TestNotification('test message');
      const handler1 = new TestNotificationHandler();
      const handler2 = new TestNotificationHandler();
      const handlers = [handler1, handler2];

      discoveryService.getNotificationHandlers.mockReturnValue(handlers);

      const handler1Spy = jest.spyOn(handler1, 'handleAsync').mockResolvedValue(undefined);
      const handler2Spy = jest.spyOn(handler2, 'handleAsync').mockResolvedValue(undefined);

      // Act
      await service.publishAsync(notification);

      // Assert
      expect(discoveryService.getNotificationHandlers).toHaveBeenCalledWith('TestNotification');
      expect(handler1Spy).toHaveBeenCalledWith(notification);
      expect(handler2Spy).toHaveBeenCalledWith(notification);
    });

    it('should handle empty handler list gracefully', async () => {
      // Arrange
      const notification = new TestNotification('test message');
      discoveryService.getNotificationHandlers.mockReturnValue([]);

      // Act & Assert
      await expect(service.publishAsync(notification)).resolves.toBeUndefined();
      expect(discoveryService.getNotificationHandlers).toHaveBeenCalledWith('TestNotification');
    });

    it('should handle individual handler failures without stopping others', async () => {
      // Arrange
      const notification = new TestNotification('test message');
      const handler1 = {
        handleAsync: jest.fn().mockRejectedValue(new Error('Handler 1 failed')),
      };
      const handler2 = {
        handleAsync: jest.fn().mockResolvedValue(undefined),
      };
      const handlers = [handler1, handler2];

      discoveryService.getNotificationHandlers.mockReturnValue(handlers);
      const consoleSpy = jest.spyOn(console, 'error').mockImplementation();

      // Act
      await service.publishAsync(notification);

      // Assert
      expect(handler1.handleAsync).toHaveBeenCalledWith(notification);
      expect(handler2.handleAsync).toHaveBeenCalledWith(notification);
      expect(consoleSpy).toHaveBeenCalledWith(
        'Error in notification handler 1 for TestNotification:',
        expect.any(Error),
      );

      consoleSpy.mockRestore();
    });
  });

  describe('dependency injection', () => {
    it('should inject all required dependencies', () => {
      expect(service).toBeDefined();
      expect(discoveryService).toBeDefined();
      expect(validationBehavior).toBeDefined();
      expect(loggingBehavior).toBeDefined();
      expect(telemetryBehavior).toBeDefined();
    });
  });

  describe('error handling', () => {
    it('should propagate validation errors from pipeline', async () => {
      // Arrange
      const query = new TestQuery('123');
      const handler = new TestQueryHandler();
      const validationError = new Error('Invalid input');

      discoveryService.getHandler.mockReturnValue(handler);

      // Mock other behaviors to pass through
      loggingBehavior.handleAsync.mockImplementation(async (req, next) => next());
      telemetryBehavior.handleAsync.mockImplementation(async (req, next) => next());

      // Mock validation behavior to throw error
      validationBehavior.handleAsync.mockImplementation(async (req, next) => {
        throw validationError;
      });

      // Act & Assert
      await expect(service.sendAsync(query)).rejects.toThrow('Invalid input');
    });

    it('should handle discovery service errors', async () => {
      // Arrange
      const query = new TestQuery('123');
      discoveryService.getHandler.mockImplementation(() => {
        throw new Error('Discovery failed');
      });

      // Act & Assert
      await expect(service.sendAsync(query)).rejects.toThrow('Discovery failed');
    });
  });
});
