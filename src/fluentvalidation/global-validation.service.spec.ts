import { Test, TestingModule } from '@nestjs/testing';
import { GlobalValidationService } from './global-validation.service';
import { CreateUserValidator } from './validators';
import { CreateUserDto } from './dto';

describe('GlobalValidationService', () => {
  let service: GlobalValidationService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [GlobalValidationService],
    }).compile();

    service = module.get<GlobalValidationService>(GlobalValidationService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('validate', () => {
    it('should return valid result for valid data', async () => {
      const validUser: CreateUserDto = {
        name: 'John Doe',
        email: 'john@example.com',
        age: 25,
        password: 'StrongPass123!',
      };

      const result = await service.validate(CreateUserValidator, validUser);

      expect(result.isValid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it('should return invalid result for invalid data', async () => {
      const invalidUser: CreateUserDto = {
        name: 'J', // Too short
        email: 'invalid-email', // Invalid format
        age: 15, // Too young
        password: 'weak', // Doesn't meet requirements
      };

      const result = await service.validate(CreateUserValidator, invalidUser);

      expect(result.isValid).toBe(false);
      expect(result.errors.length).toBeGreaterThan(0);
    });
  });

  describe('validateOrThrow', () => {
    it('should not throw for valid data', async () => {
      const validUser: CreateUserDto = {
        name: 'John Doe',
        email: 'john@example.com',
        age: 25,
        password: 'StrongPass123!',
      };

      await expect(
        service.validateOrThrow(CreateUserValidator, validUser),
      ).resolves.toBeUndefined();
    });

    it('should throw for invalid data', async () => {
      const invalidUser: CreateUserDto = {
        name: 'J',
        email: 'invalid-email',
        age: 15,
        password: 'weak',
      };

      await expect(
        service.validateOrThrow(CreateUserValidator, invalidUser),
      ).rejects.toThrow();
    });
  });

  describe('isValid', () => {
    it('should return true for valid data', async () => {
      const validUser: CreateUserDto = {
        name: 'John Doe',
        email: 'john@example.com',
        age: 25,
        password: 'StrongPass123!',
      };

      const isValid = await service.isValid(CreateUserValidator, validUser);

      expect(isValid).toBe(true);
    });

    it('should return false for invalid data', async () => {
      const invalidUser: CreateUserDto = {
        name: 'J',
        email: 'invalid-email',
        age: 15,
        password: 'weak',
      };

      const isValid = await service.isValid(CreateUserValidator, invalidUser);

      expect(isValid).toBe(false);
    });
  });

  describe('getErrors', () => {
    it('should return empty array for valid data', async () => {
      const validUser: CreateUserDto = {
        name: 'John Doe',
        email: 'john@example.com',
        age: 25,
        password: 'StrongPass123!',
      };

      const errors = await service.getErrors(CreateUserValidator, validUser);

      expect(errors).toEqual([]);
    });

    it('should return error messages for invalid data', async () => {
      const invalidUser: CreateUserDto = {
        name: 'J',
        email: 'invalid-email',
        age: 15,
        password: 'weak',
      };

      const errors = await service.getErrors(CreateUserValidator, invalidUser);

      expect(errors.length).toBeGreaterThan(0);
      expect(errors).toEqual(expect.arrayContaining([expect.any(String)]));
    });
  });
});
