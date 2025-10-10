import { Test, TestingModule } from '@nestjs/testing';
import { AppController } from './app.controller';
import { AppService } from './app.service';

describe('AppController', () => {
  let appController: AppController;

  beforeEach(async () => {
    const app: TestingModule = await Test.createTestingModule({
      imports: [],
      controllers: [AppController],
      providers: [AppService],
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
});
