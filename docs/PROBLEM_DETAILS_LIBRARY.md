# Problem Details Library Documentation

## Overview

The Problem Details library provides a standardized way to handle errors and exceptions across the entire NestJS application. It follows RFC 7807 specification for consistent, structured error responses.

## Features

✅ **RFC 7807 Compliance**: Standardized problem details format  
✅ **Type Safety**: Full TypeScript support with specialized interfaces  
✅ **Fluent Builder Pattern**: Easy-to-use builders for creating problem details  
✅ **Specialized Exceptions**: Domain-specific exception types  
✅ **Service Integration**: Injectable service for common use cases  
✅ **NestJS Integration**: Seamless integration with NestJS exception handling

## Library Structure

```
src/lib/problem-details/
├── types/
│   └── problem-details.types.ts          # Core interfaces
├── builders/
│   └── problem-details.builder.ts        # Fluent builders
├── exceptions/
│   └── problem-details.exceptions.ts     # Exception classes
├── services/
│   └── problem-details.service.ts        # Injectable service
├── problem-details.module.ts             # NestJS module
└── index.ts                              # Public exports
```

## Quick Start

### 1. Module Registration

The `ProblemDetailsModule` is already registered globally in `app.module.ts`:

```typescript
@Module({
  imports: [
    CoreModule,
    ProblemDetailsModule, // ✅ Already configured
    UserModule,
  ],
})
export class AppModule {}
```

### 2. Basic Usage

#### In Command Handlers / Services

```typescript
import { ProblemDetailsService } from '../../../lib/problem-details/services/problem-details.service';

@Injectable()
export class CreateUserCommandHandler {
  constructor(private readonly problemDetailsService: ProblemDetailsService) {}

  async handleAsync(command: CreateUserCommand): Promise<number> {
    // Check for duplicate email
    if (existingUser) {
      throw this.problemDetailsService.createDuplicateEmail(email);
    }

    // Business rule violation
    if (user.age < 18) {
      throw this.problemDetailsService.createBusinessRuleViolation(
        'MINIMUM_AGE',
        'User must be at least 18 years old',
        { minAge: 18, providedAge: user.age },
      );
    }
  }
}
```

#### In Validation Pipeline

```typescript
// Already implemented in ValidationBehavior
const validationException = this.problemDetailsService.createValidationProblem(result.errors);
throw validationException;
```

## Problem Details Types

### 1. Basic Problem Details

```typescript
interface ProblemDetails {
  type?: string; // URI identifying the problem type
  title: string; // Short, human-readable summary
  status: number; // HTTP status code
  detail?: string; // Human-readable explanation
  instance?: string; // URI for this specific occurrence
  [key: string]: any; // Additional properties
}
```

### 2. Validation Problem Details

```typescript
interface ValidationProblemDetails extends ProblemDetails {
  errors: string[]; // Array of error messages
  validationErrors: Array<{
    // Detailed field-level errors
    property: string;
    message: string;
    attemptedValue?: any;
    errorCode?: string;
  }>;
}
```

### 3. Domain Problem Details

```typescript
interface DomainProblemDetails extends ProblemDetails {
  errorCode: string; // Domain-specific error code
  context?: Record<string, any>; // Business context information
}
```

### 4. Security Problem Details

```typescript
interface SecurityProblemDetails extends ProblemDetails {
  category: 'authentication' | 'authorization' | 'forbidden' | 'rate_limit';
  suggestedAction?: string; // Suggested action for client
}
```

## Response Examples

### ✅ Validation Error (400 Bad Request)

```json
{
  "type": "https://example.com/problems/validation-error",
  "title": "Validation Failed",
  "status": 400,
  "detail": "2 validation errors occurred.",
  "errors": ["Email is required", "Password must be at least 6 characters long"],
  "validationErrors": [
    {
      "property": "email",
      "message": "Email is required",
      "attemptedValue": null,
      "errorCode": "REQUIRED_FIELD"
    },
    {
      "property": "password",
      "message": "Password must be at least 6 characters long",
      "attemptedValue": "123",
      "errorCode": "INVALID_LENGTH"
    }
  ]
}
```

### ✅ Duplicate Email Error (409 Conflict)

```json
{
  "type": "https://httpstatuses.com/409",
  "title": "Duplicate Email Address",
  "status": 409,
  "detail": "A user with email address 'test@example.com' already exists.",
  "errorCode": "DUPLICATE_EMAIL",
  "context": {
    "email": "test@example.com"
  }
}
```

### ✅ Business Rule Violation (422 Unprocessable Entity)

```json
{
  "type": "https://httpstatuses.com/422",
  "title": "Business Rule Violation",
  "status": 422,
  "detail": "The operation violates business rule: MINIMUM_AGE",
  "errorCode": "BUSINESS_RULE_VIOLATION",
  "context": {
    "rule": "MINIMUM_AGE",
    "minAge": 18,
    "providedAge": 16
  }
}
```

### ✅ Unauthorized Access (401 Unauthorized)

```json
{
  "type": "https://httpstatuses.com/401",
  "title": "Unauthorized",
  "status": 401,
  "detail": "Authentication is required to access this resource.",
  "category": "authentication",
  "suggestedAction": "Please provide valid authentication credentials."
}
```

## Service Methods

### ProblemDetailsService

#### Validation Problems

```typescript
createValidationProblem(failures: ValidationFailure[]): ValidationProblemDetailsException
```

#### Domain Problems

```typescript
createDomainProblem(status, title, detail?, errorCode?, context?): DomainProblemDetailsException
createUserNotFound(userId): DomainProblemDetailsException
createDuplicateEmail(email): DomainProblemDetailsException
createBusinessRuleViolation(rule, detail?, context?): DomainProblemDetailsException
createResourceStateConflict(resource, currentState, expectedState): DomainProblemDetailsException
```

#### Security Problems

```typescript
createSecurityProblem(status, title, category, detail?, suggestedAction?): SecurityProblemDetailsException
createInvalidCredentials(): SecurityProblemDetailsException
createInsufficientPermissions(action, resource?): SecurityProblemDetailsException
createRateLimitExceeded(retryAfter?): SecurityProblemDetailsException
```

## Builder Pattern Usage

### Manual Building (Advanced)

```typescript
import {
  ValidationProblemDetailsBuilder,
  DomainProblemDetailsBuilder,
  SecurityProblemDetailsBuilder,
} from '../builders/problem-details.builder';

// Validation problem
const validationProblem = ValidationProblemDetailsBuilder.create()
  .addValidationError('email', 'Invalid email format', 'invalid-email', 'INVALID_EMAIL')
  .addValidationError('password', 'Too short', '123', 'INVALID_LENGTH')
  .build();

// Domain problem
const domainProblem = DomainProblemDetailsBuilder.create(HttpStatus.CONFLICT, 'Resource Conflict')
  .withDetail('The resource is already in use')
  .withErrorCode('RESOURCE_CONFLICT')
  .withContext({ resourceId: 123, currentOwner: 'user456' })
  .build();

// Security problem
const securityProblem = SecurityProblemDetailsBuilder.create(HttpStatus.FORBIDDEN, 'Access Denied')
  .withCategory('authorization')
  .withSuggestedAction('Contact your administrator')
  .build();
```

## Exception Factory Methods

```typescript
import { ProblemDetailsExceptions } from '../exceptions/problem-details.exceptions';

// Quick factory methods
throw ProblemDetailsExceptions.badRequest('Invalid input', 'The provided data is malformed');
throw ProblemDetailsExceptions.unauthorized('Please login first');
throw ProblemDetailsExceptions.forbidden('You cannot access this resource');
throw ProblemDetailsExceptions.notFound('user', '123');
throw ProblemDetailsExceptions.conflict('email', 'already exists');
throw ProblemDetailsExceptions.tooManyRequests(60);
throw ProblemDetailsExceptions.internalServerError('Database connection failed');
```

## Integration Points

### ✅ Current Integrations

1. **Validation Pipeline**: `ValidationBehavior` uses Problem Details for validation errors
2. **User Creation**: `CreateUserCommandHandler` uses Problem Details for duplicate email errors
3. **Global Module**: Available throughout the application via dependency injection

### 🔄 Recommended Integrations

1. **Authentication Service**: Use for login failures
2. **Authorization Guards**: Use for permission denied errors
3. **Rate Limiting**: Use for rate limit exceeded responses
4. **All Command Handlers**: Replace generic exceptions with Problem Details
5. **Query Handlers**: Use for not found scenarios
6. **Global Exception Filter**: Create a filter to catch and standardize all exceptions

## Best Practices

### ✅ Do

- Use Problem Details Service for common scenarios
- Include relevant context information
- Use appropriate HTTP status codes
- Provide clear, actionable error messages
- Use domain-specific error codes for business logic errors

### ❌ Don't

- Expose sensitive internal information in error messages
- Use generic error messages without context
- Mix different error response formats in the same application
- Log sensitive data in problem details context

## Error Code Conventions

### Validation Errors

- `REQUIRED_FIELD`: Field is required but missing
- `INVALID_EMAIL`: Email format validation failed
- `INVALID_PASSWORD`: Password validation failed
- `INVALID_LENGTH`: Length validation failed
- `INVALID_FORMAT`: Format/pattern validation failed

### Domain Errors

- `DUPLICATE_EMAIL`: Email address already exists
- `USER_NOT_FOUND`: User not found
- `BUSINESS_RULE_VIOLATION`: Business rule violated
- `RESOURCE_STATE_CONFLICT`: Resource in wrong state
- `RESOURCE_CONFLICT`: Resource conflict occurred

### System Errors

- `USER_CREATION_ERROR`: User creation failed
- `DATABASE_ERROR`: Database operation failed
- `EXTERNAL_SERVICE_ERROR`: External service call failed

## Testing

### Testing Problem Details Exceptions

```typescript
describe('CreateUserCommandHandler', () => {
  it('should throw duplicate email problem when user exists', async () => {
    // Arrange
    const command = new CreateUserCommand('existing@example.com', 'password');

    // Act & Assert
    const result = handler.handleAsync(command);

    await expect(result).rejects.toMatchObject({
      status: 409,
      title: 'Duplicate Email Address',
      errorCode: 'DUPLICATE_EMAIL',
    });
  });
});
```

This Problem Details library provides a robust, standardized foundation for error handling across your entire NestJS application! 🎉
