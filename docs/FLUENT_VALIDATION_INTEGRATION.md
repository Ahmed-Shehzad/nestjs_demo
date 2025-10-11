# Fluent Validation Integration

This document explains how fluent validation is integrated with DTOs in the application.

## Two-Layer Validation Approach

The application now uses a two-layer validation approach:

### 1. DTO Level Validation (Controller Layer)

- **File**: `CreateUserRequestValidator`
- **Purpose**: Validates incoming HTTP request data
- **Scope**: Input sanitization, format validation, basic business rules
- **When**: Before creating the command object

### 2. Command Level Validation (Business Logic Layer)

- **File**: `CreateUserCommandValidator`
- **Purpose**: Validates business logic and domain rules
- **Scope**: Complex business rules, cross-entity validation, database checks
- **When**: In the mediator pipeline before handler execution

## How It Works

### 1. Request Flow

```
HTTP Request → DTO Validation → Command Creation → Command Validation → Handler
```

### 2. Validation Process

#### DTO Validation (CreateUserRequest)

```typescript
// In controller
const validator = this.discovery.getValidator('CreateUserRequest');
if (validator) {
  const validationResult = await validator.validateAsync(createUserDto);
  if (!validationResult.isValid) {
    throw new Error('DTO Validation failed');
  }
}
```

#### Command Validation (CreateUserCommand)

```typescript
// Automatic via mediator validation behavior
// ValidationBehavior → CreateUserCommandValidator → Handler
```

## Example Validation Rules

### DTO Level (CreateUserRequestValidator)

- Email format validation
- Password complexity requirements
- Name format validation
- Length restrictions
- Common password checks

### Command Level (CreateUserCommandValidator)

- Email uniqueness checks
- Domain-specific business rules
- Cross-entity validations
- Advanced security checks

## Testing Your Implementation

### Valid Request

```json
{
  "email": "testuser16@example.com",
  "firstName": "John",
  "lastName": "Doe",
  "password": "SecurePass123!"
}
```

### Invalid Requests

#### Invalid Email

```json
{
  "email": "invalid-email",
  "firstName": "John",
  "lastName": "Doe",
  "password": "SecurePass123!"
}
```

#### Weak Password

```json
{
  "email": "testuser16@example.com",
  "firstName": "John",
  "lastName": "Doe",
  "password": "password"
}
```

#### Invalid Name Format

```json
{
  "email": "testuser16@example.com",
  "firstName": "John123",
  "lastName": "Doe",
  "password": "SecurePass123!"
}
```

## Benefits

1. **Separation of Concerns**: Input validation vs business logic validation
2. **Early Feedback**: Catch format errors before processing
3. **Reusable**: Fluent validation rules can be shared
4. **Flexible**: Different validation rules at different layers
5. **Consistent**: Same validation framework throughout the application
