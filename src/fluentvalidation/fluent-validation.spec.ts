import { AbstractValidator } from './index';

interface TestUser {
  name: string;
  email: string;
  age: number;
}

class TestUserValidator extends AbstractValidator<TestUser> {
  constructor() {
    super();

    this.ruleFor((user) => user.name)
      .notEmpty()
      .minLength(2);

    this.ruleFor((user) => user.email)
      .notEmpty()
      .email();

    this.ruleFor((user) => user.age)
      .must((age) => age >= 18)
      .withMessage('Must be at least 18 years old');
  }
}

describe('FluentValidation', () => {
  let validator: TestUserValidator;

  beforeEach(() => {
    validator = new TestUserValidator();
  });

  it('should pass validation for valid user', () => {
    const user: TestUser = {
      name: 'John Doe',
      email: 'john@example.com',
      age: 25,
    };

    const result = validator.validate(user);

    expect(result.isValid).toBe(true);
    expect(result.errors).toHaveLength(0);
  });

  it('should fail validation for invalid user', () => {
    const user: TestUser = {
      name: '',
      email: 'invalid-email',
      age: 16,
    };

    const result = validator.validate(user);

    expect(result.isValid).toBe(false);
    expect(result.errors).toHaveLength(4); // name has 2 errors: notEmpty + minLength

    // Check specific error messages
    expect(result.errors[0].propertyName).toBe('name');
    expect(result.errors[0].errorMessage).toContain('must not be empty');

    expect(result.errors[1].propertyName).toBe('name');
    expect(result.errors[1].errorMessage).toContain('at least 2 characters');

    expect(result.errors[2].propertyName).toBe('email');
    expect(result.errors[2].errorMessage).toContain('not a valid email');

    expect(result.errors[3].propertyName).toBe('age');
    expect(result.errors[3].errorMessage).toBe('Must be at least 18 years old');
  });

  it('should support custom validation messages', () => {
    const user: TestUser = {
      name: 'A',
      email: 'test@example.com',
      age: 25,
    };

    const result = validator.validate(user);

    expect(result.isValid).toBe(false);
    expect(result.errors[0].propertyName).toBe('name');
    expect(result.errors[0].errorMessage).toContain('at least 2 characters');
  });

  it('should work with async validation', async () => {
    const user: TestUser = {
      name: 'John Doe',
      email: 'john@example.com',
      age: 25,
    };

    const result = await validator.validateAsync(user);

    expect(result.isValid).toBe(true);
  });

  it('should throw ValidationError when using throwIfInvalid', () => {
    const user: TestUser = {
      name: '',
      email: 'invalid',
      age: 16,
    };

    const result = validator.validate(user);

    expect(() => result.throwIfInvalid()).toThrow('Validation failed');
  });
});
