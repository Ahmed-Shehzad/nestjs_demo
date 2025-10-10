import { AbstractValidator } from '../abstract-validator';
import { CreateUserDto, UpdateUserDto, CreateProductDto } from '../dto';

export class CreateUserValidator extends AbstractValidator<CreateUserDto> {
  constructor() {
    super();

    this.ruleFor((user) => user.name)
      .notEmpty()
      .withMessage('Name is required')
      .minLength(2)
      .withMessage('Name must be at least 2 characters')
      .maxLength(50)
      .withMessage('Name cannot exceed 50 characters');

    this.ruleFor((user) => user.email)
      .notEmpty()
      .withMessage('Email is required')
      .email()
      .withMessage('Please provide a valid email address');

    this.ruleFor((user) => user.age)
      .must((age) => age >= 18)
      .withMessage('You must be at least 18 years old')
      .must((age) => age <= 120)
      .withMessage('Age must be realistic');

    this.ruleFor((user) => user.password)
      .notEmpty()
      .withMessage('Password is required')
      .minLength(8)
      .withMessage('Password must be at least 8 characters')
      .matches(
        /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/,
      )
      .withMessage(
        'Password must contain uppercase, lowercase, number and special character',
      );
  }
}

export class UpdateUserValidator extends AbstractValidator<UpdateUserDto> {
  constructor() {
    super();

    // Optional fields validation - only validate if present
    this.ruleFor((user) => user.name)
      .must((name) => !name || name.length >= 2)
      .withMessage('Name must be at least 2 characters when provided')
      .must((name) => !name || name.length <= 50)
      .withMessage('Name cannot exceed 50 characters when provided');

    this.ruleFor((user) => user.email)
      .must((email) => !email || /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email))
      .withMessage('Please provide a valid email address when provided');

    this.ruleFor((user) => user.age)
      .must((age) => !age || (age >= 18 && age <= 120))
      .withMessage('Age must be between 18 and 120 when provided');
  }
}

export class CreateProductValidator extends AbstractValidator<CreateProductDto> {
  constructor() {
    super();

    this.ruleFor((product) => product.name)
      .notEmpty()
      .withMessage('Product name is required')
      .minLength(3)
      .withMessage('Product name must be at least 3 characters')
      .maxLength(100)
      .withMessage('Product name cannot exceed 100 characters');

    this.ruleFor((product) => product.description)
      .notEmpty()
      .withMessage('Product description is required')
      .minLength(10)
      .withMessage('Description must be at least 10 characters')
      .maxLength(500)
      .withMessage('Description cannot exceed 500 characters');

    this.ruleFor((product) => product.price)
      .must((price) => price > 0)
      .withMessage('Price must be greater than 0')
      .must((price) => price <= 1000000)
      .withMessage('Price cannot exceed $1,000,000');

    this.ruleFor((product) => product.category)
      .notEmpty()
      .withMessage('Category is required')
      .must((category) =>
        ['electronics', 'clothing', 'books', 'home', 'sports'].includes(
          category.toLowerCase(),
        ),
      )
      .withMessage(
        'Category must be one of: electronics, clothing, books, home, sports',
      );
  }
}
