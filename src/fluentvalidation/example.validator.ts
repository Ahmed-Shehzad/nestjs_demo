import { AbstractValidator } from './abstract-validator';

// Example DTO/Model
interface User {
  name: string;
  email: string;
  age: number;
  password: string;
}

// Example Validator
export class UserValidator extends AbstractValidator<User> {
  constructor() {
    super();

    this.ruleFor((user) => user.name)
      .notEmpty()
      .minLength(2)
      .maxLength(50)
      .withMessage('Name must be between 2 and 50 characters');

    this.ruleFor((user) => user.email)
      .notEmpty()
      .email()
      .withMessage('Please provide a valid email address');

    this.ruleFor((user) => user.age)
      .must((age) => age >= 18)
      .withMessage('You must be at least 18 years old');

    this.ruleFor((user) => user.password)
      .notEmpty()
      .minLength(8)
      .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
      .withMessage(
        'Password must be at least 8 characters with uppercase, lowercase and number',
      );
  }
}

// Usage Example:
export function exampleUsage() {
  const validator = new UserValidator();

  const user: User = {
    name: 'A',
    email: 'invalid-email',
    age: 16,
    password: 'weak',
  };

  const result = validator.validate(user);

  if (!result.isValid) {
    console.log('Validation Errors:');
    result.errors.forEach((error) => {
      console.log(`- ${error.propertyName}: ${error.errorMessage}`);
    });
  }

  // Or throw on validation failure
  try {
    result.throwIfInvalid();
  } catch (error) {
    console.log('Validation failed:', (error as Error).message);
  }
}
