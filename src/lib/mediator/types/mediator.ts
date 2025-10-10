import { INotification } from './notification';
import { IRequest } from './request';
import { AllFactories } from './shared';

/**
 * Core mediator interface that provides the main entry points for CQRS operations.
 *
 * The mediator pattern decouples request/response and publish/subscribe communications
 * between objects, promoting loose coupling and enabling a clean separation of concerns
 * in CQRS architectures.
 *
 * @example Basic usage
 * ```typescript
 * @Injectable()
 * export class UserService {
 *   constructor(private readonly mediator: IMediator) {}
 *
 *   async getUser(id: string): Promise<UserDto> {
 *     const query = new GetUserByIdQuery(id);
 *     return await this.mediator.sendAsync(query);
 *   }
 *
 *   async createUser(userData: CreateUserDto): Promise<void> {
 *     const command = new CreateUserCommand(userData);
 *     await this.mediator.sendAsync(command);
 *
 *     const notification = new UserCreatedEvent(userData.email);
 *     await this.mediator.publishAsync(notification);
 *   }
 * }
 * ```
 *
 * @since 1.0.0
 */
export interface IMediator {
  /**
   * Sends a request (query or command) and returns the response.
   *
   * This method routes the request to the appropriate handler through the pipeline,
   * which may include validation, logging, telemetry, and other behaviors.
   *
   * @template TResponse - The type of response expected from the request handler
   * @param request - The request object (query, command, or any IRequest implementation)
   * @returns A promise that resolves to the handler's response
   * @throws {NotFoundException} When no handler is registered for the request type
   * @throws {ValidationException} When request validation fails
   *
   * @example Sending a query
   * ```typescript
   * const query = new GetAllUsersQuery(page, limit);
   * const users = await mediator.sendAsync<GetAllUsersDto>(query);
   * ```
   *
   * @example Sending a command
   * ```typescript
   * const command = new CreateUserCommand(email, firstName, lastName);
   * const userId = await mediator.sendAsync<string>(command);
   * ```
   */
  sendAsync<TResponse>(request: IRequest<TResponse>): Promise<TResponse>;

  /**
   * Publishes a notification to all registered handlers.
   *
   * Unlike requests, notifications can have multiple handlers and are processed
   * asynchronously. All handlers for the notification type will be invoked.
   *
   * @param notification - The notification object to publish
   * @returns A promise that resolves when all handlers have completed
   *
   * @example Publishing an event
   * ```typescript
   * const event = new UserCreatedEvent(userId, email, createdAt);
   * await mediator.publishAsync(event);
   * ```
   */
  publishAsync(notification: INotification): Promise<void>;
}

/**
 * Configuration options for mediator behavior and factory registration.
 * @since 1.0.0
 */
export type MediatorOptions = {
  /** Factory functions for creating handlers, validators, and other components */
  factories: AllFactories;
};

/**
 * Top-level configuration object for mediator setup.
 * @since 1.0.0
 */
export type MediatorConfig = {
  /** Core mediator configuration options */
  mediatorOptions: MediatorOptions;
};

/**
 * Factory function type for creating a mediator with full configuration.
 * @param config - Complete mediator configuration
 * @returns Configured mediator instance
 * @since 1.0.0
 */
export type CreateMediator = (config: MediatorConfig) => IMediator;

/**
 * Factory function type for creating a mediator with partial options.
 * @param options - Partial mediator options
 * @returns Configured mediator instance
 * @since 1.0.0
 */
export type CreateMediatorOptions = (options: Partial<MediatorOptions>) => IMediator;

/**
 * Factory function type for creating a mediator with partial configuration.
 * @param config - Partial mediator configuration
 * @returns Configured mediator instance
 * @since 1.0.0
 */
export type CreateMediatorConfig = (config: Partial<MediatorConfig>) => IMediator;

/**
 * Factory function type for creating a mediator with default settings.
 * @returns Mediator instance with default configuration
 * @since 1.0.0
 */
export type CreateDefaultMediator = () => IMediator;

/**
 * Factory function type for creating a mediator with default options.
 * @returns Mediator instance with default options
 * @since 1.0.0
 */
export type CreateDefaultMediatorOptions = () => IMediator;

/**
 * Factory function type for creating a mediator with default config.
 * @returns Mediator instance with default configuration
 * @since 1.0.0
 */
export type CreateDefaultMediatorConfig = () => IMediator;

/**
 * Factory function type for creating a custom mediator with partial options.
 * @param options - Partial mediator options for customization
 * @returns Customized mediator instance
 * @since 1.0.0
 */
export type CreateCustomMediator = (options: Partial<MediatorOptions>) => IMediator;

/**
 * Factory function type for creating a custom mediator with partial config.
 * @param config - Partial mediator configuration for customization
 * @returns Customized mediator instance
 * @since 1.0.0
 */
export type CreateCustomMediatorConfig = (config: Partial<MediatorConfig>) => IMediator;

/**
 * Factory function type for creating a custom mediator with both options and config.
 * @param options - Partial mediator options
 * @param config - Partial mediator configuration
 * @returns Customized mediator instance
 * @since 1.0.0
 */
export type CreateCustomMediatorOptions = (
  options: Partial<MediatorOptions>,
  config: Partial<MediatorConfig>,
) => IMediator;

/**
 * Factory function type for creating a mediator with default fallbacks.
 * @param options - Optional partial mediator options (defaults used if not provided)
 * @param config - Optional partial mediator configuration (defaults used if not provided)
 * @returns Mediator instance with specified or default settings
 * @since 1.0.0
 */
export type CreateMediatorWithDefaults = (
  options?: Partial<MediatorOptions>,
  config?: Partial<MediatorConfig>,
) => IMediator;

/**
 * Factory function type for creating a mediator with override capabilities.
 * @param options - Optional partial mediator options to override defaults
 * @param config - Optional partial mediator configuration to override defaults
 * @returns Mediator instance with overridden settings
 * @since 1.0.0
 */
export type CreateMediatorWithOverrides = (
  options?: Partial<MediatorOptions>,
  config?: Partial<MediatorConfig>,
) => IMediator;
