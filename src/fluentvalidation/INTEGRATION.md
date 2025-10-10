# FluentValidation NestJS Integration Guide

This guide shows how to use the FluentValidation library as real NestJS pipes for request validation.

## 🚀 Quick Start

### 1. Using the ValidationPipe Factory (Recommended)

The easiest way to use FluentValidation in your controllers:

```typescript
import { Controller, Post, Body, UsePipes } from '@nestjs/common';
import {
  ValidationPipe,
  CreateUserValidator,
  CreateUserDto,
} from './fluentvalidation';

@Controller('users')
export class UsersController {
  @Post()
  @UsePipes(ValidationPipe(CreateUserValidator))
  createUser(@Body() createUserDto: CreateUserDto) {
    // createUserDto is guaranteed to be valid here
    return { message: 'User created!', user: createUserDto };
  }
}
```

### 2. Using Direct Pipe Instantiation

For parameter-level validation:

```typescript
@Put(':id')
updateUser(
  @Param('id') id: string,
  @Body(new FluentValidationPipe(UpdateUserValidator))
  updateUserDto: UpdateUserDto,
) {
  // updateUserDto is guaranteed to be valid here
  return { message: 'User updated!' };
}
```

## 📋 Creating DTOs and Validators

### 1. Define Your DTO

```typescript
// dto/create-user.dto.ts
export class CreateUserDto {
  name: string;
  email: string;
  age: number;
  password: string;
}
```

### 2. Create the Validator

```typescript
// validators/create-user.validator.ts
import { AbstractValidator } from '../abstract-validator';
import { CreateUserDto } from '../dto';

export class CreateUserValidator extends AbstractValidator<CreateUserDto> {
  constructor() {
    super();

    this.ruleFor((user) => user.name)
      .notEmpty()
      .withMessage('Name is required')
      .minLength(2)
      .withMessage('Name must be at least 2 characters');

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
      .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])/)
      .withMessage(
        'Password must contain uppercase, lowercase, number and special character',
      );
  }
}
```

## 🔧 Advanced Usage

### Optional Field Validation

For DTOs with optional fields (like update operations):

```typescript
export class UpdateUserValidator extends AbstractValidator<UpdateUserDto> {
  constructor() {
    super();

    // Only validate if the field is present
    this.ruleFor((user) => user.name)
      .must((name) => !name || name.length >= 2)
      .withMessage('Name must be at least 2 characters when provided');

    this.ruleFor((user) => user.email)
      .must((email) => !email || /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email))
      .withMessage('Please provide a valid email address when provided');
  }
}
```

### Complex Validation Rules

```typescript
export class CreateProductValidator extends AbstractValidator<CreateProductDto> {
  constructor() {
    super();

    this.ruleFor((product) => product.price)
      .must((price) => price > 0)
      .withMessage('Price must be greater than 0')
      .must((price) => price <= 1000000)
      .withMessage('Price cannot exceed $1,000,000');

    this.ruleFor((product) => product.category)
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
```

## 🎯 Testing Your Controllers

Test the validation behavior with both valid and invalid data:

```bash
# Test valid data
curl -X POST http://localhost:3000/demo/users \
  -H "Content-Type: application/json" \
  -d '{
    "name": "John Doe",
    "email": "john@example.com",
    "age": 25,
    "password": "StrongPass123!"
  }'

# Test invalid data
curl -X POST http://localhost:3000/demo/users \
  -H "Content-Type: application/json" \
  -d '{
    "name": "J",
    "email": "invalid-email",
    "age": 15,
    "password": "weak"
  }'
```

### Expected Error Response

When validation fails, you get a structured error response:

```json
{
  "message": "Validation failed",
  "errors": [
    {
      "property": "name",
      "message": "Name must be at least 2 characters",
      "value": "J"
    },
    {
      "property": "email",
      "message": "Please provide a valid email address",
      "value": "invalid-email"
    },
    {
      "property": "age",
      "message": "You must be at least 18 years old",
      "value": 15
    }
  ],
  "statusCode": 400
}
```

## 📊 Available Validation Rules

| Rule               | Description                                           | Example                        |
| ------------------ | ----------------------------------------------------- | ------------------------------ |
| `notEmpty()`       | Ensures value is not null, undefined, or empty string | `.notEmpty()`                  |
| `notNull()`        | Ensures value is not null or undefined                | `.notNull()`                   |
| `minLength(n)`     | Minimum string length                                 | `.minLength(3)`                |
| `maxLength(n)`     | Maximum string length                                 | `.maxLength(50)`               |
| `email()`          | Valid email format                                    | `.email()`                     |
| `matches(regex)`   | Custom regex pattern                                  | `.matches(/^\d+$/)`            |
| `must(predicate)`  | Custom validation logic                               | `.must(x => x > 0)`            |
| `withMessage(msg)` | Custom error message                                  | `.withMessage('Custom error')` |

## 🏗️ Module Integration

Add the FluentValidationModule to your app:

```typescript
// app.module.ts
import { Module } from '@nestjs/common';
import { FluentValidationModule } from './fluentvalidation/fluent-validation.module';

@Module({
  imports: [FluentValidationModule],
  // ... other configuration
})
export class AppModule {}
```

## ✅ Best Practices

1. **One Validator per DTO**: Create a specific validator for each DTO class
2. **Meaningful Error Messages**: Always use `.withMessage()` for user-friendly errors
3. **Type Safety**: Leverage TypeScript generics for compile-time safety
4. **Reusable Rules**: Extract common validation logic into helper methods
5. **Test Thoroughly**: Write tests for both valid and invalid scenarios

## 🚀 Demo Endpoints

Visit `/demo/validation-example` to see complete examples of:

- Valid and invalid payloads
- Different validation approaches
- Error message formats

The demo controller provides working examples of all validation patterns!
