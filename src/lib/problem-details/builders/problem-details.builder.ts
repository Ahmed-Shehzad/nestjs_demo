/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import { HttpStatus } from '@nestjs/common';
import {
  DomainProblemDetails,
  ProblemDetails,
  SecurityProblemDetails,
  ValidationProblemDetails,
} from '../types/problem-details.types';

/**
 * Problem Details Builder
 *
 * Fluent builder for creating standardized problem details objects.
 * Follows RFC 7807 specification for consistent error responses.
 */
export class ProblemDetailsBuilder {
  private problem: ProblemDetails;

  constructor(status: HttpStatus, title: string) {
    this.problem = {
      status,
      title,
      type: this.getDefaultType(status),
      detail: '',
      instance: this.generateInstance(),
      timestamp: new Date().toISOString(),
      traceId: this.generateTraceId(),
      code: this.getDefaultCode(status),
    };
  }

  /**
   * Create a new problem details builder
   */
  static create(status: HttpStatus, title: string): ProblemDetailsBuilder {
    return new ProblemDetailsBuilder(status, title);
  }

  /**
   * Set the problem type URI
   */
  withType(type: string): this {
    this.problem.type = type;
    return this;
  }

  /**
   * Set the problem detail message
   */
  withDetail(detail: string): this {
    this.problem.detail = detail;
    return this;
  }

  /**
   * Set the problem instance URI
   */
  withInstance(instance: string): this {
    this.problem.instance = instance;
    return this;
  }

  /**
   * Set the error code
   */
  withCode(code: string): this {
    this.problem.code = code;
    return this;
  }

  /**
   * Add additional properties to the problem details
   */
  withProperty(key: string, value: any): this {
    this.problem[key] = value;
    return this;
  }

  /**
   * Add multiple properties at once
   */
  withProperties(properties: Record<string, any>): this {
    Object.assign(this.problem, properties);
    return this;
  }

  /**
   * Build the final problem details object
   */
  build(): ProblemDetails {
    return { ...this.problem };
  }

  /**
   * Get default type URI based on HTTP status code
   */
  private getDefaultType(status: HttpStatus): string {
    const baseUri = 'https://httpstatuses.com';
    return `${baseUri}/${status}`;
  }

  /**
   * Generate a unique instance URI for this problem occurrence
   */
  private generateInstance(): string {
    const timestamp = Date.now();
    const random = Math.random().toString(36).substring(2, 8);
    return `/problems/${timestamp}-${random}`;
  }

  /**
   * Generate a unique trace ID for this problem occurrence
   */
  private generateTraceId(): string {
    const timestamp = Date.now().toString(36);
    const random = Math.random().toString(36).substring(2, 10);
    return `${timestamp}-${random}`;
  }

  /**
   * Get default error code based on HTTP status
   */
  private getDefaultCode(status: HttpStatus): string {
    const codeMap: Record<number, string> = {
      400: 'BAD_REQUEST',
      401: 'UNAUTHORIZED',
      403: 'FORBIDDEN',
      404: 'NOT_FOUND',
      409: 'CONFLICT',
      422: 'UNPROCESSABLE_ENTITY',
      500: 'INTERNAL_SERVER_ERROR',
    };
    return codeMap[status] || `HTTP_${status}`;
  }
}

/**
 * Validation Problem Details Builder
 *
 * Specialized builder for validation error responses.
 */
export class ValidationProblemDetailsBuilder extends ProblemDetailsBuilder {
  private violations: Array<{
    field: string;
    message: string;
    rejectedValue?: any;
    code: string;
  }> = [];

  constructor() {
    super(HttpStatus.BAD_REQUEST, 'Validation Failed');
    this.withType('https://datatracker.ietf.org/doc/html/rfc7807#section-3');
  }

  /**
   * Create a new validation problem details builder
   */
  static create(): ValidationProblemDetailsBuilder {
    return new ValidationProblemDetailsBuilder();
  }

  /**
   * Add a validation violation
   */
  addViolation(field: string, message: string, rejectedValue?: any, code?: string): this {
    this.violations.push({
      field,
      message,
      rejectedValue,
      code: code || 'VALIDATION_ERROR',
    });
    return this;
  }

  /**
   * Add multiple validation violations at once
   */
  addViolations(
    violations: Array<{
      field: string;
      message: string;
      rejectedValue?: any;
      code?: string;
    }>,
  ): this {
    this.violations.push(
      ...violations.map((v) => ({
        ...v,
        code: v.code || 'VALIDATION_ERROR',
      })),
    );
    return this;
  }

  /**
   * Build the validation problem details
   */
  build(): ValidationProblemDetails {
    const totalErrors = this.violations.length;
    const baseProblem = super.build();

    return {
      ...baseProblem,
      detail: baseProblem.detail || `${totalErrors} validation error${totalErrors !== 1 ? 's' : ''} occurred.`,
      code: 'VALIDATION_FAILED',
      errorCount: totalErrors,
      violations: this.violations,
    };
  }
}

/**
 * Domain Problem Details Builder
 *
 * Specialized builder for domain/business logic error responses.
 */
export class DomainProblemDetailsBuilder extends ProblemDetailsBuilder {
  private context: Record<string, any> = {};
  private entity?: { type: string; id: string };

  constructor(status: HttpStatus, title: string) {
    super(status, title);
    this.withType('https://datatracker.ietf.org/doc/html/rfc7807#section-3');
  }

  /**
   * Create a new domain problem details builder
   */
  static create(status: HttpStatus, title: string): DomainProblemDetailsBuilder {
    return new DomainProblemDetailsBuilder(status, title);
  }

  /**
   * Set the business context
   */
  withContext(context: Record<string, any>): this {
    this.context = { ...this.context, ...context };
    return this;
  }

  /**
   * Set the related entity information
   */
  withEntity(type: string, id: string): this {
    this.entity = { type, id };
    return this;
  }

  /**
   * Build the domain problem details
   */
  build(): DomainProblemDetails {
    const baseProblem = super.build();
    return {
      ...baseProblem,
      code: baseProblem.code.startsWith('DOMAIN_') ? baseProblem.code : `DOMAIN_${baseProblem.code}`,
      context: this.context,
      entity: this.entity,
    };
  }
}

/**
 * Security Problem Details Builder
 *
 * Specialized builder for security-related error responses.
 */
export class SecurityProblemDetailsBuilder extends ProblemDetailsBuilder {
  private category: SecurityProblemDetails['category'] = 'authentication';
  private suggestedAction: string = 'Please check your credentials and try again';
  private securityContext?: SecurityProblemDetails['securityContext'];

  constructor(status: HttpStatus, title: string) {
    super(status, title);
    this.withType('https://datatracker.ietf.org/doc/html/rfc7807#section-3');
  }

  /**
   * Create a new security problem details builder
   */
  static create(status: HttpStatus, title: string): SecurityProblemDetailsBuilder {
    return new SecurityProblemDetailsBuilder(status, title);
  }

  /**
   * Set the security error category
   */
  withCategory(category: SecurityProblemDetails['category']): this {
    this.category = category;
    return this;
  }

  /**
   * Set the suggested action for the client
   */
  withSuggestedAction(action: string): this {
    this.suggestedAction = action;
    return this;
  }

  /**
   * Set the security context
   */
  withSecurityContext(context: SecurityProblemDetails['securityContext']): this {
    this.securityContext = context;
    return this;
  }

  /**
   * Build the security problem details
   */
  build(): SecurityProblemDetails {
    const baseProblem = super.build();
    return {
      ...baseProblem,
      code: baseProblem.code.startsWith('SECURITY_') ? baseProblem.code : `SECURITY_${baseProblem.code}`,
      category: this.category,
      suggestedAction: this.suggestedAction,
      securityContext: this.securityContext,
    };
  }
}
