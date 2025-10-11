/**
 * Problem Details Integration Examples
 *
 * This file demonstrates how the Problem Details library is integrated
 * throughout the user management system for consistent error responses.
 */

/**
 * Example 1: Validation Error Response
 *
 * When creating a user with invalid data, the ValidationBehavior will
 * automatically convert validation failures to Problem Details format:
 *
 * POST /api/users
 * {
 *   "email": "invalid-email",
 *   "password": "123"
 * }
 *
 * Response (400 Bad Request):
 * {
 *   "type": "https://datatracker.ietf.org/doc/html/rfc7807#section-3",
 *   "title": "Validation Failed",
 *   "status": 400,
 *   "detail": "2 validation errors occurred.",
 *   "instance": "/problems/1733942400000-abc123",
 *   "timestamp": "2024-12-11T20:00:00.000Z",
 *   "traceId": "k7m8n9p0-q1r2s3t4",
 *   "code": "VALIDATION_FAILED",
 *   "errorCount": 2,
 *   "violations": [
 *     {
 *       "field": "email",
 *       "message": "Email must be a valid email address",
 *       "rejectedValue": "invalid-email",
 *       "code": "INVALID_EMAIL"
 *     },
 *     {
 *       "field": "password",
 *       "message": "Password must be at least 6 characters long",
 *       "rejectedValue": "123",
 *       "code": "MIN_LENGTH"
 *     }
 *   ]
 * }
 */

/**
 * Example 2: Domain Error Response
 *
 * When trying to create a user with an existing email, the CreateUserCommandHandler
 * throws a domain-specific Problem Details exception:
 *
 * POST /api/users
 * {
 *   "email": "existing@example.com",
 *   "firstName": "John",
 *   "lastName": "Doe",
 *   "password": "password123"
 * }
 *
 * Response (409 Conflict):
 * {
 *   "type": "https://datatracker.ietf.org/doc/html/rfc7807#section-3",
 *   "title": "Duplicate Email Address",
 *   "status": 409,
 *   "detail": "A user with email address 'existing@example.com' already exists.",
 *   "instance": "/problems/1733942400000-def456",
 *   "timestamp": "2024-12-11T20:00:00.000Z",
 *   "traceId": "x1y2z3a4-b5c6d7e8",
 *   "code": "DOMAIN_DUPLICATE_EMAIL",
 *   "context": {
 *     "email": "existing@example.com"
 *   }
 * }
 */

/**
 * Example 3: Security Error Response
 *
 * For authentication/authorization errors:
 *
 * GET /api/users/123 (without proper authentication)
 *
 * Response (401 Unauthorized):
 * {
 *   "type": "https://datatracker.ietf.org/doc/html/rfc7807#section-3",
 *   "title": "Unauthorized",
 *   "status": 401,
 *   "detail": "Authentication is required to access this resource.",
 *   "instance": "/problems/1733942400000-ghi789",
 *   "timestamp": "2024-12-11T20:00:00.000Z",
 *   "traceId": "f9g0h1i2-j3k4l5m6",
 *   "code": "SECURITY_UNAUTHORIZED",
 *   "category": "authentication",
 *   "suggestedAction": "Please provide valid authentication credentials."
 * }
 */

/**
 * Example 4: Internal Server Error Response
 *
 * For unexpected database or system errors:
 *
 * Response (500 Internal Server Error):
 * {
 *   "type": "https://datatracker.ietf.org/doc/html/rfc7807#section-3",
 *   "title": "User Creation Failed",
 *   "status": 500,
 *   "detail": "An unexpected error occurred while creating the user. Please try again.",
 *   "instance": "/problems/1733942400000-jkl012",
 *   "timestamp": "2024-12-11T20:00:00.000Z",
 *   "traceId": "n3o4p5q6-r7s8t9u0",
 *   "code": "DOMAIN_USER_CREATION_ERROR",
 *   "context": {
 *     "operation": "createUser",
 *     "userId": null
 *   }
 * }
 */

/**
 * Integration Points
 *
 * 1. **Validation Layer**: ValidationBehavior automatically converts
 *    fluent validation failures to Problem Details format
 *
 * 2. **Command Handlers**: Use ProblemDetailsService to create
 *    domain-specific error responses
 *
 * 3. **Global Exception Filter**: ProblemDetailsExceptionFilter
 *    ensures all Problem Details exceptions are properly formatted
 *
 * 4. **Consistent Structure**: All errors follow the same format
 *    with type, title, status, detail, instance, timestamp, traceId, and code
 *
 * 5. **Client Benefits**:
 *    - Predictable error structure
 *    - Unique tracking IDs for support
 *    - Actionable error messages
 *    - Programmatic error codes
 */

/**
 * Key Components Used
 *
 * - ProblemDetailsService: Creates standardized error responses
 * - ValidationBehavior: Converts validation failures
 * - ProblemDetailsExceptionFilter: Ensures proper HTTP response formatting
 * - Problem Details Types: TypeScript interfaces for type safety
 * - Exception Classes: Specialized exceptions for different error types
 */

export const PROBLEM_DETAILS_EXAMPLES = {
  validation: 'Validation errors are automatically handled',
  domain: 'Business logic errors use createDomainProblem()',
  security: 'Auth errors use createSecurityProblem()',
  system: 'Unexpected errors get proper Problem Details format',
};
