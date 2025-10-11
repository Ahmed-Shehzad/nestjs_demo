import { ArgumentsHost, Catch, ExceptionFilter, HttpException } from '@nestjs/common';
import { Response } from 'express';
import { ProblemDetailsException } from '../exceptions/problem-details.exceptions';

/**
 * Problem Details Exception Filter
 *
 * Global exception filter that ensures Problem Details exceptions are properly
 * formatted in HTTP responses according to RFC 7807 standards.
 */
@Catch(ProblemDetailsException, HttpException)
export class ProblemDetailsExceptionFilter implements ExceptionFilter {
  catch(exception: ProblemDetailsException | HttpException, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();

    // Handle Problem Details exceptions
    if (exception instanceof ProblemDetailsException) {
      const problemDetails = exception.getProblemDetails();

      response.status(problemDetails.status).json(problemDetails);
      return;
    }

    // Handle other HttpExceptions by converting them to Problem Details format
    if (exception instanceof HttpException) {
      const status = exception.getStatus();
      const message = exception.message;
      const exceptionResponse = exception.getResponse();

      // Create a basic Problem Details response for non-Problem Details exceptions
      const problemDetails = {
        type: `https://httpstatuses.com/${status}`,
        title: this.getHttpStatusTitle(status),
        status,
        detail: typeof exceptionResponse === 'string' ? exceptionResponse : message,
        instance: `/problems/${Date.now()}-${Math.random().toString(36).substring(2, 8)}`,
        timestamp: new Date().toISOString(),
        traceId: `${Date.now().toString(36)}-${Math.random().toString(36).substring(2, 10)}`,
        code: this.getDefaultErrorCode(status),
      };

      response.status(status).json(problemDetails);
      return;
    }

    // Fallback for any other exceptions (should not happen in normal flow)
    const problemDetails = {
      type: 'https://httpstatuses.com/500',
      title: 'Internal Server Error',
      status: 500,
      detail: 'An unexpected error occurred. Please try again later.',
      instance: `/problems/${Date.now()}-${Math.random().toString(36).substring(2, 8)}`,
      timestamp: new Date().toISOString(),
      traceId: `${Date.now().toString(36)}-${Math.random().toString(36).substring(2, 10)}`,
      code: 'INTERNAL_SERVER_ERROR',
    };

    response.status(500).json(problemDetails);
  }

  /**
   * Get human-readable title for HTTP status codes
   */
  private getHttpStatusTitle(status: number): string {
    const titles: Record<number, string> = {
      400: 'Bad Request',
      401: 'Unauthorized',
      403: 'Forbidden',
      404: 'Not Found',
      409: 'Conflict',
      422: 'Unprocessable Entity',
      429: 'Too Many Requests',
      500: 'Internal Server Error',
      502: 'Bad Gateway',
      503: 'Service Unavailable',
    };
    return titles[status] || `HTTP ${status}`;
  }

  /**
   * Get default error code for HTTP status
   */
  private getDefaultErrorCode(status: number): string {
    const codes: Record<number, string> = {
      400: 'BAD_REQUEST',
      401: 'UNAUTHORIZED',
      403: 'FORBIDDEN',
      404: 'NOT_FOUND',
      409: 'CONFLICT',
      422: 'UNPROCESSABLE_ENTITY',
      429: 'TOO_MANY_REQUESTS',
      500: 'INTERNAL_SERVER_ERROR',
      502: 'BAD_GATEWAY',
      503: 'SERVICE_UNAVAILABLE',
    };
    return codes[status] || `HTTP_${status}`;
  }
}
