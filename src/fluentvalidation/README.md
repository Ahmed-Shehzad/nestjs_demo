# FluentValidation for TypeScript/NestJS

A TypeScript implementation inspired by C# FluentValidation library, providing a fluent interface for building strongly-typed validation rules.

## Features

- **Fluent Interface**: Chain validation rules in a readable, expressive way
- **Type Safe**: Full TypeScript support with strong typing
- **Extensible**: Easy to add custom validation rules
- **Error Details**: Rich error information with property names and attempted values
- **Async Support**: Built-in support for asynchronous validation
- **Custom Messages**: Override default error messages
- **Zero Dependencies**: Pure TypeScript implementation

## Installation

This library is included in your NestJS project under `src/fluentvalidation/`.

## Quick Start

### 1. Define your model/DTO

```typescript
interface User {
  name: string;
  email: string;
  age: number;
  password: string;
}
```

### 2. Create a validator

```typescript
import { AbstractValidator } from './fluentvalidation';

export class UserValidator extends AbstractValidator<User> {
  constructor() {
    super();

    this.ruleFor((user) => user.name)
      .notEmpty()
      .minLength(2)
      .maxLength(50);

    this.ruleFor((user) => user.email)
      .notEmpty()
      .email();

    this.ruleFor((user) => user.age)
      .must((age) => age >= 18)
      .withMessage('You must be at least 18 years old');

    this.ruleFor((user) => user.password)
      .notEmpty()
      .minLength(8)
      .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
      .withMessage('Password must contain uppercase, lowercase, and numbers');
  }
}
```

### 3. Use the validator

```typescript
const validator = new UserValidator();
const user: User = {
  name: '',
  email: 'invalid-email',
  age: 16,
  password: 'weak'
};

const result = validator.validate(user);

if (!result.isValid) {
  console.log('Validation Errors:');
  result.errors.forEach(error => {
    console.log(`- ${error.propertyName}: ${error.errorMessage}`);
  });
}

// Or throw on validation failure
try {
  result.throwIfInvalid();
} catch (error) {
  console.log('Validation failed:', error.message);
}
```

## Available Validation Rules

### Basic Rules

- **`.notEmpty()`** - Value must not be null, undefined, or empty string
- **`.notNull()`** - Value must not be null or undefined

### String Rules

- **`.minLength(length)`** - String must be at least `length` characters
- **`.maxLength(length)`** - String must be at most `length` characters  
- **`.email()`** - String must be a valid email address
- **`.matches(regex)`** - String must match the regular expression

### Custom Rules

- **`.must(predicate)`** - Value must satisfy the custom predicate function

### Message Customization

- **`.withMessage(message)`** - Override the default error message

## Examples

### Chaining Multiple Rules

```typescript
this.ruleFor((user) => user.name)
  .notEmpty()
  .minLength(2)
  .maxLength(50)
  .withMessage('Name must be between 2 and 50 characters');
```

### Custom Validation Logic

```typescript
this.ruleFor((user) => user.email)
  .must((email) => !email.includes('temp'))
  .withMessage('Temporary email addresses are not allowed');
```

### Async Validation

```typescript
const result = await validator.validateAsync(user);
console.log('Validation result:', result.isValid);
```

## API Reference

### AbstractValidator<T>

Base class for all validators.

#### Methods

- **`validate(obj: T): ValidationResult`** - Synchronously validates the object
- **`validateAsync(obj: T): Promise<ValidationResult>`** - Asynchronously validates the object
- **`ruleFor<K>(selector: (obj: T) => T[K]): IRuleBuilder<T, T[K]>`** - Creates rules for a property

### ValidationResult

Contains the validation results.

#### Properties

- **`isValid: boolean`** - True if validation passed
- **`errors: ValidationFailure[]`** - Array of validation failures
- **`errorMessages: string[]`** - Array of error messages

#### Methods

- **`toString(): string`** - Returns formatted error messages
- **`throwIfInvalid(): void`** - Throws ValidationError if invalid

### ValidationFailure

Represents a single validation error.

#### Properties

- **`propertyName: string`** - Name of the property that failed
- **`errorMessage: string`** - Descriptive error message
- **`attemptedValue?: unknown`** - The value that failed validation

## Integration with NestJS

### Using in Controllers

```typescript
@Controller('users')
export class UserController {
  private userValidator = new UserValidator();

  @Post()
  async createUser(@Body() userData: User) {
    const result = this.userValidator.validate(userData);
    
    if (!result.isValid) {
      throw new BadRequestException(result.errorMessages);
    }
    
    // Process valid user data
    return await this.userService.create(userData);
  }
}
```

### Custom Validation Pipe

```typescript
@Injectable()
export class ValidationPipe<T> implements PipeTransform {
  constructor(private validator: AbstractValidator<T>) {}

  transform(value: T): T {
    const result = this.validator.validate(value);
    
    if (!result.isValid) {
      throw new BadRequestException({
        message: 'Validation failed',
        errors: result.errors
      });
    }
    
    return value;
  }
}
```

## Comparison with C# FluentValidation

| Feature | C# FluentValidation | This Library |
|---------|-------------------|--------------|
| Fluent Interface | ✅ | ✅ |
| Type Safety | ✅ | ✅ |
| Custom Messages | ✅ | ✅ |
| Async Validation | ✅ | ✅ |
| Property Name Resolution | ✅ | ✅ |
| Conditional Rules | ✅ | ⚠️ (via `must()`) |
| Rule Sets | ✅ | ❌ |
| Dependency Injection | ✅ | ⚠️ (manual) |

## Best Practices

1. **Create validators as services** - Make them injectable in NestJS
2. **Use meaningful error messages** - Always use `withMessage()` for user-facing errors
3. **Group related validations** - Keep validators focused on single entities
4. **Test your validators** - Write unit tests for complex validation logic
5. **Handle async carefully** - Use `validateAsync()` when you need Promise support

## Testing

The library includes comprehensive tests. Run them with:

```bash
npm test -- --testNamePattern="FluentValidation"
```

## License

This implementation is part of your NestJS project and follows the same license.
