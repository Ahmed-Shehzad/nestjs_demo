import { IRequest } from './request';
import { HandlerType } from './shared';

/**
 * Interface for pipeline behaviors in the mediator pattern.
 *
 * Pipeline behaviors implement cross-cutting concerns that are applied to all
 * requests passing through the mediator. They form a chain of responsibility
 * where each behavior can execute logic before and after the next behavior
 * in the pipeline.
 *
 * Common use cases include:
 * - Request validation
 * - Logging and auditing
 * - Performance monitoring
 * - Caching
 * - Authorization
 * - Transaction management
 * - Error handling
 *
 * @template TRequest - The request type processed by this behavior
 * @template TResponse - The response type returned by the pipeline
 *
 * @example Logging behavior
 * ```typescript
 * @Injectable()
 * export class LoggingBehavior implements IPipelineBehavior<any, any> {
 *   private readonly logger = new Logger('Mediator');
 *
 *   async handleAsync(request: any, next: () => Promise<any>): Promise<any> {
 *     const requestName = request.constructor.name;
 *     const start = Date.now();
 *
 *     this.logger.log(`Executing ${requestName}`);
 *
 *     try {
 *       const result = await next();
 *       this.logger.log(`${requestName} completed in ${Date.now() - start}ms`);
 *       return result;
 *     } catch (error) {
 *       this.logger.error(`${requestName} failed: ${error.message}`);
 *       throw error;
 *     }
 *   }
 * }
 * ```
 *
 * @example Validation behavior
 * ```typescript
 * @Injectable()
 * export class ValidationBehavior implements IPipelineBehavior<any, any> {
 *   constructor(private readonly discovery: MediatorDiscoveryService) {}
 *
 *   async handleAsync(request: any, next: () => Promise<any>): Promise<any> {
 *     const validator = this.discovery.getValidator(request.constructor.name);
 *
 *     if (validator) {
 *       const result = await validator.validateAsync(request);
 *       if (!result.isValid) {
 *         throw new ValidationException(result.errors);
 *       }
 *     }
 *
 *     return await next();
 *   }
 * }
 * ```
 *
 * @since 1.0.0
 */
export interface IPipelineBehavior<TRequest extends IRequest<TResponse>, TResponse> {
  /**
   * Executes the behavior logic and calls the next behavior in the pipeline.
   *
   * @param request - The request being processed
   * @param next - Function to call the next behavior or handler in the pipeline
   * @returns A promise that resolves to the response from the pipeline
   * @throws May throw exceptions to short-circuit the pipeline
   */
  handleAsync(request: TRequest, next: () => Promise<TResponse>): Promise<TResponse>;
}

/**
 * Type alias for pipeline behavior class constructors.
 * Used in dependency injection and factory patterns.
 * @template TRequest - The request type processed by the behavior
 * @template TResponse - The response type returned by the behavior
 * @since 1.0.0
 */
export type PipelineBehaviorType<TRequest extends IRequest<TResponse>, TResponse> = HandlerType<
  IPipelineBehavior<TRequest, TResponse>
>;

/**
 * Factory function type for creating pipeline behaviors.
 * Returns an array of behaviors to be executed in order for a specific request.
 * @template TRequest - The request type
 * @template TResponse - The response type
 * @param request - The request instance to get behaviors for
 * @returns Array of behaviors to execute in the pipeline
 * @since 1.0.0
 */
export type PipelineBehaviorFactory = <TRequest extends IRequest<TResponse>, TResponse>(
  request: TRequest,
) => IPipelineBehavior<TRequest, TResponse>[];
