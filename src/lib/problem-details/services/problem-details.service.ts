import { ValidationFailure } from '@/fluent-validation/validation-result.validator';
import { HttpStatus, Injectable } from '@nestjs/common';
import {
  DatabaseProblemDetailsBuilder,
  DomainProblemDetailsBuilder,
  SecurityProblemDetailsBuilder,
  ValidationProblemDetailsBuilder,
} from '../builders/problem-details.builder';
import {
  DatabaseProblemDetailsException,
  DomainProblemDetailsException,
  ProblemDetailsExceptions,
  SecurityProblemDetailsException,
  ValidationProblemDetailsException,
} from '../exceptions/problem-details.exceptions';
import type { DatabaseErrors } from '../types/problem-details.types';

/**
 * Problem Details Service
 *
 * Service for creating standardized problem details responses.
 * Provides convenient methods for common error scenarios.
 */
@Injectable()
export class ProblemDetailsService {
  /**
   * Create a validation problem details exception from validation failures
   */
  createValidationProblem(failures: ValidationFailure[]): ValidationProblemDetailsException {
    const builder = ValidationProblemDetailsBuilder.create();

    failures.forEach((failure) => {
      builder.addViolation(
        failure.propertyName,
        failure.message,
        failure.attemptedValue,
        this.getValidationErrorCode(failure),
      );
    });

    return new ValidationProblemDetailsException(builder.build());
  }

  /**
   * Create a domain problem details exception
   */
  createDomainProblem(
    status: HttpStatus,
    title: string,
    detail?: string,
    errorCode?: string,
    context?: Record<string, any>,
  ): DomainProblemDetailsException {
    const builder = DomainProblemDetailsBuilder.create(status, title)
      .withDetail(detail || '')
      .withCode(errorCode || 'DOMAIN_ERROR');

    if (context) {
      builder.withContext(context);
    }

    return new DomainProblemDetailsException(builder.build());
  }

  /**
   * Create a database problem details exception for Prisma errors
   * Handles all Prisma error types with detailed context and user-friendly messages
   */
  createDatabaseProblem(error: DatabaseErrors): DatabaseProblemDetailsException {
    const problemDetails = DatabaseProblemDetailsBuilder.fromPrismaError(error);
    return new DatabaseProblemDetailsException(problemDetails);
  }

  /**
   * Create a security problem details exception
   */
  createSecurityProblem(
    status: HttpStatus,
    title: string,
    category: 'authentication' | 'authorization' | 'forbidden' | 'rate_limit',
    detail?: string,
    suggestedAction?: string,
  ): SecurityProblemDetailsException {
    const builder = SecurityProblemDetailsBuilder.create(status, title)
      .withCategory(category)
      .withDetail(detail || '')
      .withSuggestedAction(suggestedAction || '');

    return new SecurityProblemDetailsException(builder.build());
  }

  /**
   * Create a user not found problem
   */
  createUserNotFound(userId: string | number): DomainProblemDetailsException {
    return ProblemDetailsExceptions.notFound('user', userId.toString()) as DomainProblemDetailsException;
  }

  /**
   * Create a duplicate email problem
   */
  createDuplicateEmail(email: string): DomainProblemDetailsException {
    return this.createDomainProblem(
      HttpStatus.CONFLICT,
      'Duplicate Email Address',
      `A user with email address '${email}' already exists.`,
      'DUPLICATE_EMAIL',
      { email },
    );
  }

  /**
   * Create an invalid credentials problem
   */
  createInvalidCredentials(): SecurityProblemDetailsException {
    return this.createSecurityProblem(
      HttpStatus.UNAUTHORIZED,
      'Invalid Credentials',
      'authentication',
      'The provided credentials are invalid.',
      'Please check your email and password and try again.',
    );
  }

  /**
   * Create an insufficient permissions problem
   */
  createInsufficientPermissions(action: string, resource?: string): SecurityProblemDetailsException {
    const detail = resource
      ? `You do not have permission to ${action} on ${resource}.`
      : `You do not have permission to ${action}.`;

    return this.createSecurityProblem(
      HttpStatus.FORBIDDEN,
      'Insufficient Permissions',
      'authorization',
      detail,
      'Contact your administrator to request the necessary permissions.',
    );
  }

  /**
   * Create a rate limit exceeded problem
   */
  createRateLimitExceeded(retryAfter?: number): SecurityProblemDetailsException {
    const detail = retryAfter
      ? `Rate limit exceeded. Please try again after ${retryAfter} seconds.`
      : 'Rate limit exceeded. Please try again later.';

    return this.createSecurityProblem(
      HttpStatus.TOO_MANY_REQUESTS,
      'Rate Limit Exceeded',
      'rate_limit',
      detail,
      'Reduce the frequency of your requests.',
    );
  }

  /**
   * Create a business rule violation problem
   */
  createBusinessRuleViolation(
    rule: string,
    detail?: string,
    context?: Record<string, any>,
  ): DomainProblemDetailsException {
    return this.createDomainProblem(
      HttpStatus.UNPROCESSABLE_ENTITY,
      'Business Rule Violation',
      detail || `The operation violates business rule: ${rule}`,
      'BUSINESS_RULE_VIOLATION',
      { rule, ...context },
    );
  }

  /**
   * Create a resource state conflict problem
   */
  createResourceStateConflict(
    resource: string,
    currentState: string,
    expectedState: string,
  ): DomainProblemDetailsException {
    return this.createDomainProblem(
      HttpStatus.CONFLICT,
      'Resource State Conflict',
      `The ${resource} is in '${currentState}' state but operation requires '${expectedState}' state.`,
      'RESOURCE_STATE_CONFLICT',
      { resource, currentState, expectedState },
    );
  }

  /**
   * Get validation error code based on validation failure
   */
  private getValidationErrorCode(failure: ValidationFailure): string {
    const message = failure.message.toLowerCase();

    if (message.includes('required') || message.includes('must be defined')) {
      return 'REQUIRED_FIELD';
    }
    if (message.includes('email')) {
      return 'INVALID_EMAIL';
    }
    if (message.includes('password')) {
      return 'INVALID_PASSWORD';
    }
    if (message.includes('length') || message.includes('characters')) {
      return 'INVALID_LENGTH';
    }
    if (message.includes('format') || message.includes('pattern')) {
      return 'INVALID_FORMAT';
    }

    return 'VALIDATION_ERROR';
  }
}
