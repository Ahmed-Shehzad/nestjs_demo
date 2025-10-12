import { DatabaseProblemDetails } from './../types/problem-details.types';
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import { HttpStatus } from '@nestjs/common';
import {
  PrismaClientInitializationError,
  PrismaClientKnownRequestError,
  PrismaClientRustPanicError,
  PrismaClientUnknownRequestError,
  PrismaClientValidationError,
} from '@prisma/client/runtime/client';
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

export class DatabaseProblemDetailsBuilder extends ProblemDetailsBuilder {
  private meta: Record<string, unknown> | undefined;

  constructor(httpStatus: HttpStatus, title: string) {
    super(httpStatus, title);
  }

  /**
   * Create a new database problem details builder from a Prisma error
   */
  static create(httpStatus: HttpStatus, title: string): DatabaseProblemDetailsBuilder {
    return new DatabaseProblemDetailsBuilder(httpStatus, title);
  }

  /**
   * Create database problem details from any Prisma error
   * This is the main entry point for handling all database errors
   */
  static fromPrismaError(
    error:
      | PrismaClientKnownRequestError
      | PrismaClientUnknownRequestError
      | PrismaClientValidationError
      | PrismaClientInitializationError
      | PrismaClientRustPanicError
      | Error,
  ): DatabaseProblemDetails {
    // Handle different types of Prisma errors
    if (error instanceof PrismaClientKnownRequestError) {
      return this.handlePrismaKnownRequestError(error);
    }

    if (error instanceof PrismaClientUnknownRequestError) {
      return this.handlePrismaUnknownRequestError(error);
    }

    if (error instanceof PrismaClientValidationError) {
      return this.handlePrismaValidationError(error);
    }

    if (error instanceof PrismaClientInitializationError) {
      return this.handlePrismaInitializationError(error);
    }

    if (error instanceof PrismaClientRustPanicError) {
      return this.handlePrismaRustPanicError(error);
    }

    // Fallback for unknown database errors
    return this.handleUnknownDatabaseError(error);
  }

  /**
   * Handle Prisma known request errors (P2xxx codes)
   */
  private static handlePrismaKnownRequestError(error: PrismaClientKnownRequestError): DatabaseProblemDetails {
    const BASE_PROBLEM_TYPE = 'https://datatracker.ietf.org/doc/html/rfc7807#section-3';
    const { code, meta } = error;

    // Comprehensive error mapping with detailed handling
    const errorHandlers: Record<string, () => DatabaseProblemDetails> = {
      // Data constraint violations
      P2000: () => this.createDataConstraintError('VALUE_TOO_LONG', 'Value Too Long for Column', error),
      P2001: () => this.createNotFoundError('RECORD_NOT_FOUND', 'Record Not Found', error),
      P2002: () => this.createUniqueConstraintError(error),
      P2003: () => this.createForeignKeyConstraintError(error),
      P2004: () => this.createDataConstraintError('CONSTRAINT_FAILED', 'Database Constraint Failed', error),

      // Data validation errors
      P2005: () => this.createDataConstraintError('INVALID_COLUMN_VALUE', 'Invalid Stored Value for Field', error),
      P2006: () => this.createDataConstraintError('INVALID_VALUE', 'Provided Value Is Invalid', error),
      P2007: () => this.createDataConstraintError('DATA_VALIDATION', 'Data Validation Error', error),
      P2008: () => this.createQueryError('QUERY_PARSING_ERROR', 'Failed to Parse Query', error),
      P2009: () => this.createQueryError('QUERY_VALIDATION_ERROR', 'Query Validation Error', error),
      P2010: () => this.createServerError('RAW_QUERY_FAILED', 'Raw Query Failed', error),

      // Null/missing value errors
      P2011: () => this.createDataConstraintError('NULL_CONSTRAINT_VIOLATION', 'Null Constraint Violation', error),
      P2012: () => this.createDataConstraintError('MISSING_REQUIRED_VALUE', 'Missing Required Value', error),
      P2013: () => this.createDataConstraintError('MISSING_REQUIRED_ARGUMENT', 'Missing Required Argument', error),

      // Relation errors
      P2014: () => this.createRelationError('RELATION_VIOLATION', 'Relation Constraint Violation', error),
      P2015: () => this.createNotFoundError('RELATED_RECORD_NOT_FOUND', 'Related Record Not Found', error),
      P2016: () => this.createQueryError('INVALID_INTERPRETATION', 'Query Interpretation Error', error),
      P2017: () => this.createRelationError('RECORDS_IN_RELATION', 'Records for Relation Not Connected', error),
      P2018: () => this.createRelationError('INVALID_RELATION_FIELD', 'Invalid Relation Field Reference', error),
      P2019: () => this.createDataConstraintError('INPUT_ERROR', 'Input Error', error),

      // Range and type errors
      P2020: () => this.createDataConstraintError('VALUE_OUT_OF_RANGE', 'Value Out of Range for Field', error),
      P2021: () => this.createQueryError('TABLE_NOT_FOUND', 'Table Not Found', error),
      P2022: () => this.createQueryError('COLUMN_NOT_FOUND', 'Column Not Found', error),
      P2023: () => this.createDataConstraintError('INVALID_JSON', 'Invalid JSON Value', error),

      // Connection and timeout errors
      P2024: () => this.createTimeoutError('DATABASE_TIMEOUT', 'Database Timeout', error),
      P2025: () =>
        this.createNotFoundError('RECORD_NOT_FOUND_FOR_UPDATE', 'Record to Update or Delete Not Found', error),

      // System and unsupported feature errors
      P2026: () => this.createServerError('UNSUPPORTED_FEATURE', 'Unsupported Feature Used', error),
      P2027: () => this.createServerError('TRANSACTION_API_ERROR', 'Transaction API Error', error),
      P2028: () => this.createTimeoutError('OPERATION_TIMEOUT', 'Operation Timeout', error),
      P2029: () => this.createQueryError('QUERY_PARAMETER_LIMIT', 'Query Parameter Limit Exceeded', error),
      P2030: () => this.createServerError('FULLTEXT_INDEX_NOT_FOUND', 'Fulltext Index Not Found', error),
      P2031: () => this.createServerError('MONGODB_REPLICA_SET_REQUIRED', 'MongoDB Replica Set Required', error),
      P2033: () => this.createDataConstraintError('NUMERIC_OVERFLOW', 'Numeric Overflow', error),
      P2034: () => this.createConflictError('TRANSACTION_CONFLICT', 'Transaction Conflict', error),
      P2035: () => this.createDataConstraintError('ASSERTION_VIOLATION', 'Assertion Violation', error),
      P2036: () => this.createServerError('EXTERNAL_CONNECTOR_ERROR', 'External Connector Error', error),
      P2037: () => this.createServerError('TOO_MANY_CONNECTIONS', 'Too Many Database Connections', error),
    };

    const handler = errorHandlers[code];
    if (handler) {
      return handler();
    }

    // Fallback for unknown P2xxx codes
    return this.create(HttpStatus.INTERNAL_SERVER_ERROR, 'Unknown Database Error')
      .withDetail(`Unknown Prisma error code: ${code}. ${error.message}`)
      .withCode(code)
      .withType(`${BASE_PROBLEM_TYPE}/unknown-prisma-error`)
      .withMeta(meta)
      .build();
  }

  /**
   * Handle unique constraint violations with detailed field information
   */
  private static createUniqueConstraintError(error: PrismaClientKnownRequestError): DatabaseProblemDetails {
    const meta = error.meta as Record<string, unknown>;
    const target = (meta?.target as string[]) || [];
    const modelName = (meta?.modelName as string) || 'record';

    let detail = 'A record with this combination of values already exists.';
    if (target.length > 0) {
      const fields = Array.isArray(target) ? target.join(', ') : String(target);
      detail = `A ${modelName.toLowerCase()} with this ${fields} already exists.`;
    }

    return this.create(HttpStatus.CONFLICT, 'Unique Constraint Violation')
      .withDetail(detail)
      .withCode(error.code)
      .withType('https://datatracker.ietf.org/doc/html/rfc7807#section-3/unique-violation')
      .withMeta({ ...meta, constraintFields: target, model: modelName })
      .build();
  }

  /**
   * Handle foreign key constraint violations
   */
  private static createForeignKeyConstraintError(error: PrismaClientKnownRequestError): DatabaseProblemDetails {
    const meta = error.meta as Record<string, unknown>;
    const fieldName = (meta?.field_name as string) || 'foreign key';

    return this.create(HttpStatus.CONFLICT, 'Foreign Key Constraint Violation')
      .withDetail(
        `The referenced ${fieldName} does not exist or cannot be deleted because it is referenced by other records.`,
      )
      .withCode(error.code)
      .withType('https://datatracker.ietf.org/doc/html/rfc7807#section-3/foreign-key-violation')
      .withMeta({ ...meta, constraintField: fieldName })
      .build();
  }

  /**
   * Create data constraint error
   */
  private static createDataConstraintError(
    code: string,
    title: string,
    error: PrismaClientKnownRequestError,
  ): DatabaseProblemDetails {
    return this.create(HttpStatus.BAD_REQUEST, title)
      .withDetail(error.message)
      .withCode(code)
      .withType('https://datatracker.ietf.org/doc/html/rfc7807#section-3/data-constraint')
      .withMeta(error.meta as Record<string, unknown>)
      .build();
  }

  /**
   * Create not found error
   */
  private static createNotFoundError(
    code: string,
    title: string,
    error: PrismaClientKnownRequestError,
  ): DatabaseProblemDetails {
    return this.create(HttpStatus.NOT_FOUND, title)
      .withDetail(error.message)
      .withCode(code)
      .withType('https://datatracker.ietf.org/doc/html/rfc7807#section-3/not-found')
      .withMeta(error.meta as Record<string, unknown>)
      .build();
  }

  /**
   * Create query error
   */
  private static createQueryError(
    code: string,
    title: string,
    error: PrismaClientKnownRequestError,
  ): DatabaseProblemDetails {
    return this.create(HttpStatus.BAD_REQUEST, title)
      .withDetail(error.message)
      .withCode(code)
      .withType('https://datatracker.ietf.org/doc/html/rfc7807#section-3/query-error')
      .withMeta(error.meta as Record<string, unknown>)
      .build();
  }

  /**
   * Create relation error
   */
  private static createRelationError(
    code: string,
    title: string,
    error: PrismaClientKnownRequestError,
  ): DatabaseProblemDetails {
    return this.create(HttpStatus.BAD_REQUEST, title)
      .withDetail(error.message)
      .withCode(code)
      .withType('https://datatracker.ietf.org/doc/html/rfc7807#section-3/relation-error')
      .withMeta(error.meta as Record<string, unknown>)
      .build();
  }

  /**
   * Create timeout error
   */
  private static createTimeoutError(
    code: string,
    title: string,
    error: PrismaClientKnownRequestError,
  ): DatabaseProblemDetails {
    return this.create(HttpStatus.REQUEST_TIMEOUT, title)
      .withDetail(error.message)
      .withCode(code)
      .withType('https://datatracker.ietf.org/doc/html/rfc7807#section-3/timeout')
      .withMeta(error.meta as Record<string, unknown>)
      .build();
  }

  /**
   * Create conflict error
   */
  private static createConflictError(
    code: string,
    title: string,
    error: PrismaClientKnownRequestError,
  ): DatabaseProblemDetails {
    return this.create(HttpStatus.CONFLICT, title)
      .withDetail(error.message)
      .withCode(code)
      .withType('https://datatracker.ietf.org/doc/html/rfc7807#section-3/conflict')
      .withMeta(error.meta as Record<string, unknown>)
      .build();
  }

  /**
   * Create server error
   */
  private static createServerError(
    code: string,
    title: string,
    error: PrismaClientKnownRequestError,
  ): DatabaseProblemDetails {
    return this.create(HttpStatus.INTERNAL_SERVER_ERROR, title)
      .withDetail(error.message)
      .withCode(code)
      .withType('https://datatracker.ietf.org/doc/html/rfc7807#section-3/server-error')
      .withMeta(error.meta as Record<string, unknown>)
      .build();
  }

  /**
   * Handle Prisma unknown request errors
   */
  private static handlePrismaUnknownRequestError(error: PrismaClientUnknownRequestError): DatabaseProblemDetails {
    return this.create(HttpStatus.INTERNAL_SERVER_ERROR, 'Unknown Database Error')
      .withDetail(error.message)
      .withCode('UNKNOWN_REQUEST_ERROR')
      .withType('https://datatracker.ietf.org/doc/html/rfc7807#section-3/unknown-request')
      .build();
  }

  /**
   * Handle Prisma validation errors
   */
  private static handlePrismaValidationError(error: PrismaClientValidationError): DatabaseProblemDetails {
    return this.create(HttpStatus.BAD_REQUEST, 'Database Query Validation Error')
      .withDetail('The provided query parameters are invalid or malformed.')
      .withCode('VALIDATION_ERROR')
      .withType('https://datatracker.ietf.org/doc/html/rfc7807#section-3/validation-error')
      .withMeta({ originalMessage: error.message })
      .build();
  }

  /**
   * Handle Prisma initialization errors
   */
  private static handlePrismaInitializationError(error: PrismaClientInitializationError): DatabaseProblemDetails {
    return this.create(HttpStatus.SERVICE_UNAVAILABLE, 'Database Connection Error')
      .withDetail('Unable to connect to the database. Please try again later.')
      .withCode('CONNECTION_ERROR')
      .withType('https://datatracker.ietf.org/doc/html/rfc7807#section-3/connection-error')
      .withMeta({ errorCode: error.errorCode })
      .build();
  }

  /**
   * Handle Prisma Rust panic errors
   */
  private static handlePrismaRustPanicError(_error: PrismaClientRustPanicError): DatabaseProblemDetails {
    return this.create(HttpStatus.INTERNAL_SERVER_ERROR, 'Database Engine Error')
      .withDetail('An internal database engine error occurred. Please contact support.')
      .withCode('ENGINE_PANIC')
      .withType('https://datatracker.ietf.org/doc/html/rfc7807#section-3/engine-error')
      .build();
  }

  /**
   * Handle unknown database errors
   */
  private static handleUnknownDatabaseError(error: Error): DatabaseProblemDetails {
    return this.create(HttpStatus.INTERNAL_SERVER_ERROR, 'Unexpected Database Error')
      .withDetail('An unexpected database error occurred.')
      .withCode('UNKNOWN_DATABASE_ERROR')
      .withType('https://datatracker.ietf.org/doc/html/rfc7807#section-3/unknown-error')
      .withMeta({ errorType: error.constructor.name, message: error.message })
      .build();
  }

  /**
   * Set additional metadata about the database error
   */
  withMeta(meta?: Record<string, unknown>): this {
    if (meta) {
      this.meta = meta;
      this.withProperty('meta', meta);
    }
    return this;
  }

  /**
   * Build the database problem details
   */
  build(): DatabaseProblemDetails {
    const baseProblem = super.build();
    return {
      ...baseProblem,
      meta: this.meta,
    };
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
