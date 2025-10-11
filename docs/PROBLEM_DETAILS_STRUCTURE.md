# Problem Details Response Structure

## Overview

The Problem Details library has been updated to provide a **consistent and meaningful structure** for all error responses. This follows RFC 7807 standards while adding application-specific enhancements for better client-side handling.

## Base Problem Details Structure

All problem details responses now include these **consistent base properties**:

```typescript
interface ProblemDetails {
  type: string; // RFC 7807 compliant URI identifying the problem type
  title: string; // Human-readable summary (doesn't change per occurrence)
  status: number; // HTTP status code
  detail: string; // Human-readable explanation for this specific occurrence
  instance: string; // Unique URI for this specific problem occurrence
  timestamp: string; // ISO 8601 timestamp when the problem occurred
  traceId: string; // Unique identifier for tracking/correlation
  code: string; // Application-specific error code for programmatic handling
}
```

## Response Examples

### 1. Validation Error Response

```json
{
  "type": "https://datatracker.ietf.org/doc/html/rfc7807#section-3",
  "title": "Validation Failed",
  "status": 400,
  "detail": "2 validation errors occurred.",
  "instance": "/problems/1733942400000-abc123",
  "timestamp": "2024-12-11T20:00:00.000Z",
  "traceId": "k7m8n9p0-q1r2s3t4",
  "code": "VALIDATION_FAILED",
  "errorCount": 2,
  "violations": [
    {
      "field": "email",
      "message": "Email is required",
      "rejectedValue": null,
      "code": "REQUIRED_FIELD"
    },
    {
      "field": "age",
      "message": "Age must be between 18 and 120",
      "rejectedValue": 150,
      "code": "RANGE_VALIDATION"
    }
  ]
}
```

### 2. Domain Error Response

```json
{
  "type": "https://datatracker.ietf.org/doc/html/rfc7807#section-3",
  "title": "User Not Found",
  "status": 404,
  "detail": "User with ID '12345' was not found in the system.",
  "instance": "/problems/1733942400000-def456",
  "timestamp": "2024-12-11T20:00:00.000Z",
  "traceId": "x1y2z3a4-b5c6d7e8",
  "code": "DOMAIN_USER_NOT_FOUND",
  "context": {
    "userId": "12345",
    "searchCriteria": "id",
    "requestedBy": "system"
  },
  "entity": {
    "type": "User",
    "id": "12345"
  }
}
```

### 3. Security Error Response

```json
{
  "type": "https://datatracker.ietf.org/doc/html/rfc7807#section-3",
  "title": "Access Denied",
  "status": 403,
  "detail": "Insufficient permissions to access this resource.",
  "instance": "/problems/1733942400000-ghi789",
  "timestamp": "2024-12-11T20:00:00.000Z",
  "traceId": "f9g0h1i2-j3k4l5m6",
  "code": "SECURITY_FORBIDDEN",
  "category": "authorization",
  "suggestedAction": "Contact your administrator to request the necessary permissions",
  "securityContext": {
    "userId": "67890",
    "permissions": ["read:profile"],
    "tokenType": "Bearer",
    "expiresAt": "2024-12-11T21:00:00.000Z"
  }
}
```

## Key Improvements

### 1. **Consistent Structure**

- All responses include the same base fields (`type`, `title`, `status`, `detail`, `instance`, `timestamp`, `traceId`, `code`)
- Predictable property names across all error types
- Always present required fields (no optional base properties)

### 2. **Meaningful Information**

- **`traceId`**: Unique identifier for request correlation and debugging
- **`timestamp`**: Exact time when the error occurred for audit trails
- **`instance`**: Unique URI for this specific error occurrence
- **`code`**: Application-specific error codes for programmatic handling

### 3. **Enhanced Validation Errors**

- **`errorCount`**: Total number of validation errors
- **`violations`**: Detailed field-level validation failures
- **`field`**: Clear field name (instead of generic "property")
- **`rejectedValue`**: The actual value that failed validation
- **`code`**: Specific validation error codes

### 4. **Improved Domain Errors**

- **`context`**: Business-specific context information
- **`entity`**: Related entity information with type and ID
- Automatic code prefixing with "DOMAIN\_"

### 5. **Enhanced Security Errors**

- **`category`**: Extended security categories including `token_expired`, `insufficient_permissions`
- **`securityContext`**: Authentication/authorization context with user info, permissions, token details
- **`suggestedAction`**: Always present actionable guidance
- Automatic code prefixing with "SECURITY\_"

## Client Benefits

### 1. **Predictable Structure**

Clients can rely on consistent base properties being present in all error responses.

### 2. **Better Error Handling**

- Use `code` field for programmatic error handling
- Use `traceId` for support requests and debugging
- Use `timestamp` for audit logs and error tracking

### 3. **Enhanced User Experience**

- Clear, actionable error messages
- Detailed validation feedback with specific field errors
- Suggested actions for security-related errors

### 4. **Debugging & Monitoring**

- Unique `traceId` for request correlation
- Timestamps for timeline analysis
- Structured context information for better error investigation

## Usage in Code

```typescript
// Validation errors
const validationProblem = this.problemDetailsService.createValidationProblem(failures);

// Domain errors
const domainProblem = this.problemDetailsService.createDomainProblem(
  HttpStatus.NOT_FOUND,
  'User Not Found',
  'User with the specified ID was not found',
  'USER_NOT_FOUND',
  { userId: '12345', searchCriteria: 'id' },
);

// Security errors
const securityProblem = this.problemDetailsService.createSecurityProblem(
  HttpStatus.FORBIDDEN,
  'Access Denied',
  'authorization',
  'Insufficient permissions to access this resource',
  'Contact your administrator to request the necessary permissions',
);
```

This structure ensures that all error responses are **consistent**, **meaningful**, and **actionable** for client applications while maintaining full RFC 7807 compliance.
