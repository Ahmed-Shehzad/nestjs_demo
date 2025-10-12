import { HttpException, HttpStatus } from '@nestjs/common';
import {
  DatabaseProblemDetails,
  DomainProblemDetails,
  ProblemDetails,
  SecurityProblemDetails,
  ValidationProblemDetails,
} from '../types/problem-details.types';

/**
 * Helper method to check if error is a Problem Details exception
 */
export function isProblemDetailsException(error: unknown): error is { status: number } {
  return (
    error !== null &&
    typeof error === 'object' &&
    'status' in error &&
    typeof (error as { status: unknown }).status === 'number'
  );
}

/**
 * Problem Details Exception
 *
 * Base exception class that carries standardized problem details.
 * Extends NestJS HttpException to integrate with the framework's error handling.
 */
export class ProblemDetailsException extends HttpException {
  constructor(problemDetails: ProblemDetails) {
    super(problemDetails, problemDetails.status);
  }

  /**
   * Get the problem details object
   */
  getProblemDetails(): ProblemDetails {
    return this.getResponse() as ProblemDetails;
  }
}

export class DatabaseProblemDetailsException extends ProblemDetailsException {
  constructor(databaseDetails: DatabaseProblemDetails) {
    super(databaseDetails);
  }

  /**
   * Get the database problem details
   */
  getDatabaseDetails(): DatabaseProblemDetails {
    return this.getResponse() as DatabaseProblemDetails;
  }
}

/**
 * Validation Problem Details Exception
 *
 * Specialized exception for validation errors with detailed field-level information.
 */
export class ValidationProblemDetailsException extends ProblemDetailsException {
  constructor(validationDetails: ValidationProblemDetails) {
    super(validationDetails);
  }

  /**
   * Get the validation problem details
   */
  getValidationDetails(): ValidationProblemDetails {
    return this.getResponse() as ValidationProblemDetails;
  }
}

/**
 * Domain Problem Details Exception
 *
 * Specialized exception for business logic/domain rule violations.
 */
export class DomainProblemDetailsException extends ProblemDetailsException {
  constructor(domainDetails: DomainProblemDetails) {
    super(domainDetails);
  }

  /**
   * Get the domain problem details
   */
  getDomainDetails(): DomainProblemDetails {
    return this.getResponse() as DomainProblemDetails;
  }
}

/**
 * Security Problem Details Exception
 *
 * Specialized exception for security-related errors.
 */
export class SecurityProblemDetailsException extends ProblemDetailsException {
  constructor(securityDetails: SecurityProblemDetails) {
    super(securityDetails);
  }

  /**
   * Get the security problem details
   */
  getSecurityDetails(): SecurityProblemDetails {
    return this.getResponse() as SecurityProblemDetails;
  }
}

/**
 * Common Problem Details Exceptions Factory
 *
 * Factory class for creating common problem details exceptions.
 */
export class ProblemDetailsExceptions {
  /**
   * Generate common problem details fields
   */
  private static generateCommonFields() {
    const timestamp = Date.now();
    const random = Math.random().toString(36).substring(2, 8);
    return {
      instance: `/problems/${timestamp}-${random}`,
      timestamp: new Date().toISOString(),
      traceId: `${timestamp.toString(36)}-${Math.random().toString(36).substring(2, 10)}`,
    };
  }

  /**
   * Create a Bad Request exception with problem details
   */
  static badRequest(title: string, detail?: string): ProblemDetailsException {
    return new ProblemDetailsException({
      type: 'https://httpstatuses.com/400',
      title,
      status: HttpStatus.BAD_REQUEST,
      detail: detail || 'The request could not be processed due to invalid data.',
      code: 'BAD_REQUEST',
      ...this.generateCommonFields(),
    });
  }

  /**
   * Create an Unauthorized exception with problem details
   */
  static unauthorized(detail?: string): SecurityProblemDetailsException {
    return new SecurityProblemDetailsException({
      type: 'https://httpstatuses.com/401',
      title: 'Unauthorized',
      status: HttpStatus.UNAUTHORIZED,
      detail: detail || 'Authentication is required to access this resource.',
      code: 'SECURITY_UNAUTHORIZED',
      category: 'authentication',
      suggestedAction: 'Please provide valid authentication credentials.',
      ...this.generateCommonFields(),
    });
  }

  /**
   * Create a Forbidden exception with problem details
   */
  static forbidden(detail?: string): SecurityProblemDetailsException {
    return new SecurityProblemDetailsException({
      type: 'https://httpstatuses.com/403',
      title: 'Forbidden',
      status: HttpStatus.FORBIDDEN,
      detail: detail || 'You do not have permission to access this resource.',
      code: 'SECURITY_FORBIDDEN',
      category: 'authorization',
      suggestedAction: 'Contact your administrator to request access.',
      ...this.generateCommonFields(),
    });
  }

  /**
   * Create a Not Found exception with problem details
   */
  static notFound(resource: string, identifier?: string): ProblemDetailsException {
    const detail = identifier
      ? `The ${resource} with identifier '${identifier}' was not found.`
      : `The requested ${resource} was not found.`;

    return new ProblemDetailsException({
      type: 'https://httpstatuses.com/404',
      title: 'Resource Not Found',
      status: HttpStatus.NOT_FOUND,
      detail,
      code: 'NOT_FOUND',
      resource,
      identifier,
      ...this.generateCommonFields(),
    });
  }

  /**
   * Create a Conflict exception with problem details
   */
  static conflict(resource: string, reason?: string): DomainProblemDetailsException {
    const detail = reason
      ? `A conflict occurred with the ${resource}: ${reason}`
      : `A conflict occurred with the ${resource}.`;

    return new DomainProblemDetailsException({
      type: 'https://httpstatuses.com/409',
      title: 'Resource Conflict',
      status: HttpStatus.CONFLICT,
      detail,
      code: 'DOMAIN_RESOURCE_CONFLICT',
      context: { resource, reason },
      ...this.generateCommonFields(),
    });
  }

  /**
   * Create an Unprocessable Entity exception with problem details
   */
  static unprocessableEntity(title: string, detail?: string, errorCode?: string): DomainProblemDetailsException {
    return new DomainProblemDetailsException({
      type: 'https://httpstatuses.com/422',
      title,
      status: HttpStatus.UNPROCESSABLE_ENTITY,
      detail: detail || 'The request was well-formed but contains semantic errors.',
      code: errorCode || 'DOMAIN_UNPROCESSABLE_ENTITY',
      context: {},
      ...this.generateCommonFields(),
    });
  }

  /**
   * Create a Too Many Requests exception with problem details
   */
  static tooManyRequests(retryAfter?: number): SecurityProblemDetailsException {
    const detail = retryAfter
      ? `Too many requests. Please try again after ${retryAfter} seconds.`
      : 'Too many requests. Please try again later.';

    return new SecurityProblemDetailsException({
      type: 'https://httpstatuses.com/429',
      title: 'Rate Limit Exceeded',
      status: HttpStatus.TOO_MANY_REQUESTS,
      detail,
      code: 'SECURITY_RATE_LIMIT_EXCEEDED',
      category: 'rate_limit',
      suggestedAction: 'Reduce the frequency of your requests.',
      retryAfter,
      ...this.generateCommonFields(),
    });
  }

  /**
   * Create an Internal Server Error exception with problem details
   */
  static internalServerError(detail?: string): ProblemDetailsException {
    return new ProblemDetailsException({
      type: 'https://httpstatuses.com/500',
      title: 'Internal Server Error',
      status: HttpStatus.INTERNAL_SERVER_ERROR,
      detail: detail || 'An unexpected error occurred. Please try again later.',
      code: 'INTERNAL_SERVER_ERROR',
      ...this.generateCommonFields(),
    });
  }
}
