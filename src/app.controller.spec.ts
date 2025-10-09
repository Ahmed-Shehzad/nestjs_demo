import { Test, TestingModule } from '@nestjs/testing';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { MediatorModule } from './mediator';
import { GetUserByIdHandler } from './mediator/examples/handlers';

describe('AppController', () => {
  let appController: AppController;

  beforeEach(async () => {
    const app: TestingModule = await Test.createTestingModule({
      imports: [MediatorModule],
      controllers: [AppController],
      providers: [AppService, GetUserByIdHandler],
    }).compile();

    appController = app.get<AppController>(AppController);
  });

  describe('root', () => {
    it('should return user and bookmark data', () => {
      const result = appController.getHello();
      expect(result).toHaveProperty('user');
      expect(result).toHaveProperty('bookmark');
      expect(result.user).toHaveProperty('email', 'user@example.com');
      expect(result.bookmark).toHaveProperty('title', 'Example Bookmark');
    });
  });

  describe('demoMediator', () => {
    it('should return mediator demo response with user data', async () => {
      // Mock the mediator service to avoid handler registration issues in tests
      const mockMediatorService = {
        send: jest.fn().mockResolvedValue({ id: 1, email: 'user@example.com' }),
        publish: jest.fn(),
      };

      // Replace the mediator service with our mock
      const mediatorService = appController['mediator'];
      Object.assign(mediatorService, mockMediatorService);

      const testMessage = 'hello-world';
      const result = await appController.demoMediator(testMessage);

      expect(result).toHaveProperty('message');
      expect(result).toHaveProperty('info');
      expect(result.message).toContain(
        'Mediator is ready! You sent: hello-world',
      );
      expect(result.message).toContain('1'); // user id
      expect(result.message).toContain('user@example.com'); // user email
      expect(result.info).toBe(
        'Create request/command classes and handlers to use the mediator pattern',
      );
    });
  });
});
