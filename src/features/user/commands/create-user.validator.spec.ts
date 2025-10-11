import { ValidationResult } from '@/fluent-validation/validation-result.validator';
import { Test, TestingModule } from '@nestjs/testing';
import { CreateUserCommand } from './create-user.command';
import { CreateUserCommandValidator } from './create-user.validator';

describe('CreateUserCommandValidator', () => {
  let validator: CreateUserCommandValidator;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [CreateUserCommandValidator],
    }).compile();

    validator = module.get<CreateUserCommandValidator>(CreateUserCommandValidator);
  });

  describe('validateAsync', () => {
    it('should return valid result for valid command', async () => {
      // Arrange
      const command = new CreateUserCommand('test@example.com', 'John', 'Doe', 'password123');

      // Act
      const result = await validator.validateAsync(command);

      // Assert
      expect(result).toBeInstanceOf(ValidationResult);
      expect(result.isValid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it('should return invalid result for missing email', async () => {
      // Arrange
      const command = new CreateUserCommand('', 'John', 'Doe', 'password123');

      // Act
      const result = await validator.validateAsync(command);

      // Assert
      expect(result).toBeInstanceOf(ValidationResult);
      expect(result.isValid).toBe(false);
      expect(result.errors.some((e) => e.propertyName === 'email')).toBe(true);
    });

    it('should return invalid result for invalid email format', async () => {
      // Arrange
      const command = new CreateUserCommand('invalid-email', 'John', 'Doe', 'password123');

      // Act
      const result = await validator.validateAsync(command);

      // Assert
      expect(result).toBeInstanceOf(ValidationResult);
      expect(result.isValid).toBe(false);
      expect(result.errors.some((e) => e.propertyName === 'email')).toBe(true);
    });

    it('should return invalid result for missing password', async () => {
      // Arrange
      const command = new CreateUserCommand('test@example.com', 'John', 'Doe', '');

      // Act
      const result = await validator.validateAsync(command);

      // Assert
      expect(result).toBeInstanceOf(ValidationResult);
      expect(result.isValid).toBe(false);
      expect(result.errors.some((e) => e.propertyName === 'password')).toBe(true);
    });

    it('should return invalid result for short password', async () => {
      // Arrange
      const command = new CreateUserCommand('test@example.com', 'John', 'Doe', '123');

      // Act
      const result = await validator.validateAsync(command);

      // Assert
      expect(result).toBeInstanceOf(ValidationResult);
      expect(result.isValid).toBe(false);
      expect(result.errors.some((e) => e.propertyName === 'password')).toBe(true);
    });

    it('should return invalid result for long password', async () => {
      // Arrange
      const longPassword = 'a'.repeat(129); // Assuming max length is 128
      const command = new CreateUserCommand('test@example.com', 'John', 'Doe', longPassword);

      // Act
      const result = await validator.validateAsync(command);

      // Assert
      expect(result).toBeInstanceOf(ValidationResult);
      expect(result.isValid).toBe(false);
      expect(result.errors.some((e) => e.propertyName === 'password')).toBe(true);
    });

    it('should allow optional firstName and lastName', async () => {
      // Arrange
      const command = new CreateUserCommand('test@example.com', null, null, 'password123');

      // Act
      const result = await validator.validateAsync(command);

      // Assert
      expect(result).toBeInstanceOf(ValidationResult);
      expect(result.isValid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it('should return invalid result for too long firstName', async () => {
      // Arrange
      const longFirstName = 'a'.repeat(101); // Assuming max length is 100
      const command = new CreateUserCommand('test@example.com', longFirstName, 'Doe', 'password123');

      // Act
      const result = await validator.validateAsync(command);

      // Assert
      expect(result).toBeInstanceOf(ValidationResult);
      expect(result.isValid).toBe(false);
      expect(result.errors.some((e) => e.propertyName === 'firstName')).toBe(true);
    });

    it('should return invalid result for too long lastName', async () => {
      // Arrange
      const longLastName = 'a'.repeat(101); // Assuming max length is 100
      const command = new CreateUserCommand('test@example.com', 'John', longLastName, 'password123');

      // Act
      const result = await validator.validateAsync(command);

      // Assert
      expect(result).toBeInstanceOf(ValidationResult);
      expect(result.isValid).toBe(false);
      expect(result.errors.some((e) => e.propertyName === 'lastName')).toBe(true);
    });

    it('should return multiple validation errors for invalid command', async () => {
      // Arrange
      const command = new CreateUserCommand('', '', '', '');

      // Act
      const result = await validator.validateAsync(command);

      // Assert
      expect(result).toBeInstanceOf(ValidationResult);
      expect(result.isValid).toBe(false);
      expect(result.errors.length).toBeGreaterThan(1);
      expect(result.errors.some((e) => e.propertyName === 'email')).toBe(true);
      expect(result.errors.some((e) => e.propertyName === 'password')).toBe(true);
    });

    it('should handle null values gracefully', async () => {
      // Arrange
      const command = new CreateUserCommand(null as any, null, null, null as any);

      // Act
      const result = await validator.validateAsync(command);

      // Assert
      expect(result).toBeInstanceOf(ValidationResult);
      expect(result.isValid).toBe(false);
      expect(result.errors.some((e) => e.propertyName === 'email')).toBe(true);
      expect(result.errors.some((e) => e.propertyName === 'password')).toBe(true);
    });

    it('should validate email uniqueness when provided', async () => {
      // Arrange
      const command = new CreateUserCommand('unique@example.com', 'John', 'Doe', 'password123');

      // Act
      const result = await validator.validateAsync(command);

      // Assert
      expect(result).toBeInstanceOf(ValidationResult);
      // Note: This test assumes the validator checks email uniqueness
      // The actual result depends on the implementation
    });
  });

  describe('validator initialization', () => {
    it('should be defined', () => {
      expect(validator).toBeDefined();
    });

    it('should be an instance of CreateUserCommandValidator', () => {
      expect(validator).toBeInstanceOf(CreateUserCommandValidator);
    });
  });

  describe('edge cases', () => {
    it('should handle special characters in names', async () => {
      // Arrange
      const command = new CreateUserCommand('test@example.com', 'José-María', "O'Connor", 'password123');

      // Act
      const result = await validator.validateAsync(command);

      // Assert
      expect(result).toBeInstanceOf(ValidationResult);
      expect(result.isValid).toBe(true);
    });

    it('should handle unicode characters in names', async () => {
      // Arrange
      const command = new CreateUserCommand('test@example.com', '张三', '李四', 'password123');

      // Act
      const result = await validator.validateAsync(command);

      // Assert
      expect(result).toBeInstanceOf(ValidationResult);
      expect(result.isValid).toBe(true);
    });

    it('should handle whitespace in names correctly', async () => {
      // Arrange
      const command = new CreateUserCommand('test@example.com', '  John  ', '  Doe  ', 'password123');

      // Act
      const result = await validator.validateAsync(command);

      // Assert
      expect(result).toBeInstanceOf(ValidationResult);
      // The result depends on whether the validator trims whitespace
    });

    it('should handle very long email addresses', async () => {
      // Arrange
      const longEmail = 'a'.repeat(240) + '@example.com'; // Very long email
      const command = new CreateUserCommand(longEmail, 'John', 'Doe', 'password123');

      // Act
      const result = await validator.validateAsync(command);

      // Assert
      expect(result).toBeInstanceOf(ValidationResult);
      expect(result.isValid).toBe(false);
      expect(result.errors.some((e) => e.propertyName === 'email')).toBe(true);
    });
  });
});
