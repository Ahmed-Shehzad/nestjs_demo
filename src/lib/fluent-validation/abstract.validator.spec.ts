import { AbstractValidator } from './abstract.validator';
import { ValidationResult } from './validation-result.validator';

// Test class for validation
class TestModel {
  constructor(
    public email: string,
    public name: string,
    public age: number,
  ) {}
}

class TestValidator extends AbstractValidator<TestModel> {
  constructor() {
    super();

    this.ruleFor((x) => x.email)
      .mustBeDefined()
      .withMessage('Email is required')
      .notEmpty()
      .withMessage('Email cannot be empty')
      .email()
      .withMessage('Email must be valid');

    this.ruleFor((x) => x.name)
      .mustBeDefined()
      .withMessage('Name is required')
      .notEmpty()
      .withMessage('Name cannot be empty');

    this.ruleFor((x) => x.age)
      .mustBeDefined()
      .withMessage('Age is required')
      .mustBe((age) => age >= 0)
      .withMessage('Age must be non-negative')
      .mustBe((age) => age <= 120)
      .withMessage('Age must be realistic');
  }
}

describe('AbstractValidator', () => {
  let validator: TestValidator;

  beforeEach(() => {
    validator = new TestValidator();
  });

  describe('validateAsync', () => {
    it('should return valid result for valid model', async () => {
      // Arrange
      const model = new TestModel('test@example.com', 'John Doe', 30);

      // Act
      const result = await validator.validateAsync(model);

      // Assert
      expect(result).toBeInstanceOf(ValidationResult);
      expect(result.isValid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it('should return invalid result for model with invalid email', async () => {
      // Arrange
      const model = new TestModel('invalid-email', 'John Doe', 30);

      // Act
      const result = await validator.validateAsync(model);

      // Assert
      expect(result).toBeInstanceOf(ValidationResult);
      expect(result.isValid).toBe(false);
      expect(result.errors.length).toBeGreaterThan(0);
      expect(result.errors.some((e) => e.message.includes('Email must be valid'))).toBe(true);
    });

    it('should return invalid result for model with empty name', async () => {
      // Arrange
      const model = new TestModel('test@example.com', '', 30);

      // Act
      const result = await validator.validateAsync(model);

      // Assert
      expect(result).toBeInstanceOf(ValidationResult);
      expect(result.isValid).toBe(false);
      expect(result.errors.some((e) => e.message.includes('Name cannot be empty'))).toBe(true);
    });

    it('should return invalid result for model with negative age', async () => {
      // Arrange
      const model = new TestModel('test@example.com', 'John Doe', -5);

      // Act
      const result = await validator.validateAsync(model);

      // Assert
      expect(result).toBeInstanceOf(ValidationResult);
      expect(result.isValid).toBe(false);
      // Check if we have any age-related errors (the specific message may vary)
      const ageErrors = result.errors.filter((e) => e.propertyName === 'age');
      expect(ageErrors.length).toBeGreaterThan(0);
    });

    it('should return invalid result for model with unrealistic age', async () => {
      // Arrange
      const model = new TestModel('test@example.com', 'John Doe', 150);

      // Act
      const result = await validator.validateAsync(model);

      // Assert
      expect(result).toBeInstanceOf(ValidationResult);
      expect(result.isValid).toBe(false);
      expect(result.errors.some((e) => e.message.includes('Age must be realistic'))).toBe(true);
    });

    it('should return multiple validation errors for invalid model', async () => {
      // Arrange
      const model = new TestModel('invalid-email', '', -5);

      // Act
      const result = await validator.validateAsync(model);

      // Assert
      expect(result).toBeInstanceOf(ValidationResult);
      expect(result.isValid).toBe(false);
      expect(result.errors.length).toBeGreaterThan(2);
    });

    it('should handle undefined model properties', async () => {
      // Arrange
      const model = new TestModel(undefined as any, undefined as any, undefined as any);

      // Act
      const result = await validator.validateAsync(model);

      // Assert
      expect(result).toBeInstanceOf(ValidationResult);
      expect(result.isValid).toBe(false);
      // Check that we have validation errors for the undefined properties
      expect(result.errors.some((e) => e.propertyName === 'email')).toBe(true);
      expect(result.errors.some((e) => e.propertyName === 'name')).toBe(true);
      expect(result.errors.some((e) => e.propertyName === 'age')).toBe(true);
    });

    it('should handle validation rule exceptions gracefully', async () => {
      // Arrange
      class FailingValidator extends AbstractValidator<TestModel> {
        constructor() {
          super();
          this.ruleFor((x) => x.email).mustBeAsync(() => {
            throw new Error('Validation error');
          });
        }
      }

      const failingValidator = new FailingValidator();
      const model = new TestModel('test@example.com', 'John Doe', 30);

      // Act
      const result = await failingValidator.validateAsync(model);

      // Assert
      expect(result).toBeInstanceOf(ValidationResult);
      expect(result.isValid).toBe(false);
      expect(result.errors.some((e) => e.message.includes('Validation error'))).toBe(true);
    });
  });

  describe('property name extraction', () => {
    it('should extract property names from lambda expressions', async () => {
      // Arrange
      class SimpleValidator extends AbstractValidator<TestModel> {
        constructor() {
          super();
          this.ruleFor((x) => x.email).mustBeDefined();
        }
      }

      const simpleValidator = new SimpleValidator();
      const model = new TestModel(undefined as any, 'John', 30);

      // Act
      const result = await simpleValidator.validateAsync(model);

      // Assert
      expect(result.errors[0].propertyName).toBe('email');
    });

    it('should handle complex property expressions', async () => {
      // Arrange
      class ComplexValidator extends AbstractValidator<TestModel> {
        constructor() {
          super();
          this.ruleFor((model) => model.name).mustBeDefined();
        }
      }

      const complexValidator = new ComplexValidator();
      const model = new TestModel('test@example.com', undefined as any, 30);

      // Act
      const result = await complexValidator.validateAsync(model);

      // Assert
      expect(result.errors[0].propertyName).toBe('name');
    });
  });
});
