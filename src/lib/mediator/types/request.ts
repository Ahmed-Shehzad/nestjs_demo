/* eslint-disable @typescript-eslint/no-unused-vars */
import { HandlerType } from './shared';

/**
 * Base interface for all requests in the CQRS mediator pattern.
 *
 * This marker interface enables type-safe routing of requests to their handlers.
 * All queries and commands should implement this interface, either directly or
 * through the more specific IQuery and ICommand interfaces.
 *
 * @template TResponse - The type of response that handlers for this request will return
 *
 * @example Basic request
 * ```typescript
 * export class GetUserByIdQuery implements IRequest<UserDto> {
 *   constructor(public readonly userId: string) {}
 * }
 * ```
 *
 * @since 1.0.0
 */

export interface IRequest<TResponse = void> {}

/**
 * Interface for request handlers in the CQRS mediator pattern.
 *
 * Request handlers process specific request types and return responses. Each request
 * type should have exactly one handler registered with the mediator system.
 *
 * @template TRequest - The specific request type this handler processes
 * @template TResponse - The type of response this handler returns
 *
 * @example Query handler implementation
 * ```typescript
 * @Injectable()
 * @RequestHandler(GetUserByIdQuery)
 * export class GetUserByIdQueryHandler implements IRequestHandler<GetUserByIdQuery, UserDto> {
 *   constructor(private readonly userService: UserService) {}
 *
 *   async handleAsync(query: GetUserByIdQuery): Promise<UserDto> {
 *     const user = await this.userService.findById(query.userId);
 *     if (!user) {
 *       throw new NotFoundException('User not found');
 *     }
 *     return this.mapToDto(user);
 *   }
 * }
 * ```
 *
 * @since 1.0.0
 */
export interface IRequestHandler<TRequest extends IRequest<TResponse>, TResponse> {
  /**
   * Processes the request and returns a response.
   *
   * @param request - The request object to process
   * @returns A promise resolving to the response, or the response directly
   * @throws May throw domain-specific exceptions based on business logic
   */
  handleAsync(request: TRequest): Promise<TResponse> | TResponse;
}

export type RequestHandlerType<TRequest extends IRequest<TResponse>, TResponse> = HandlerType<
  IRequestHandler<TRequest, TResponse>
>;

export type RequestHandlerFactory = <TRequest extends IRequest<TResponse>, TResponse>(
  request: TRequest,
) => IRequestHandler<TRequest, TResponse> | null;

/**
 * Marker interface for queries in the CQRS pattern.
 *
 * Queries are read-only operations that return data without side effects.
 * They should not modify system state and are safe to cache or retry.
 *
 * @template TResponse - The type of data returned by this query
 *
 * @example Read-only query
 * ```typescript
 * export class GetAllUsersQuery implements IQuery<GetAllUsersDto> {
 *   constructor(
 *     public readonly page: number,
 *     public readonly limit: number,
 *     public readonly baseUrl: string
 *   ) {}
 * }
 * ```
 *
 * @since 1.0.0
 */
export interface IQuery<TResponse> extends IRequest<TResponse> {}

/**
 * Marker interface for commands in the CQRS pattern.
 *
 * Commands are write operations that modify system state. They represent
 * business operations and may have side effects like database changes,
 * sending emails, or publishing events.
 *
 * @template TResponse - The type of response returned by this command (default: void)
 *
 * @example State-changing command
 * ```typescript
 * export class CreateUserCommand implements ICommand<string> {
 *   constructor(
 *     public readonly email: string,
 *     public readonly firstName: string,
 *     public readonly lastName: string
 *   ) {}
 * }
 * ```
 *
 * @since 1.0.0
 */
export interface ICommand<TResponse = void> extends IRequest<TResponse> {}

/**
 * Interface for command handlers in the CQRS pattern.
 *
 * Command handlers process business operations that modify system state.
 * They encapsulate business logic and coordinate with domain services,
 * repositories, and other infrastructure components.
 *
 * @template TCommand - The specific command type this handler processes
 * @template TResponse - The type of response this handler returns
 *
 * @example Command handler for user creation
 * ```typescript
 * @Injectable()
 * @RequestHandler(CreateUserCommand)
 * export class CreateUserCommandHandler implements ICommandHandler<CreateUserCommand, string> {
 *   constructor(
 *     private readonly userRepository: UserRepository,
 *     private readonly emailService: EmailService,
 *     private readonly mediator: IMediator
 *   ) {}
 *
 *   async handleAsync(command: CreateUserCommand): Promise<string> {
 *     const user = User.create(command.email, command.firstName, command.lastName);
 *     await this.userRepository.save(user);
 *
 *     const event = new UserCreatedEvent(user.id, user.email);
 *     await this.mediator.publishAsync(event);
 *
 *     return user.id;
 *   }
 * }
 * ```
 *
 * @since 1.0.0
 */
export interface ICommandHandler<TCommand extends ICommand<TResponse>, TResponse>
  extends IRequestHandler<TCommand, TResponse> {}

/**
 * Interface for query handlers in the CQRS pattern.
 *
 * Query handlers process read-only operations that return data without
 * side effects. They should be optimized for performance and can use
 * read-optimized data stores, caching, or projections.
 *
 * @template TQuery - The specific query type this handler processes
 * @template TResponse - The type of data this handler returns
 *
 * @example Query handler for user retrieval
 * ```typescript
 * @Injectable()
 * @RequestHandler(GetUserByIdQuery)
 * export class GetUserByIdQueryHandler implements IQueryHandler<GetUserByIdQuery, UserDto> {
 *   constructor(
 *     private readonly userRepository: UserRepository,
 *     private readonly cacheService: CacheService
 *   ) {}
 *
 *   async handleAsync(query: GetUserByIdQuery): Promise<UserDto> {
 *     const cached = await this.cacheService.get(`user:${query.userId}`);
 *     if (cached) return cached;
 *
 *     const user = await this.userRepository.findById(query.userId);
 *     if (!user) throw new NotFoundException('User not found');
 *
 *     const dto = UserDto.fromEntity(user);
 *     await this.cacheService.set(`user:${query.userId}`, dto, 300);
 *
 *     return dto;
 *   }
 * }
 * ```
 *
 * @since 1.0.0
 */
export interface IQueryHandler<TQuery extends IQuery<TResponse>, TResponse>
  extends IRequestHandler<TQuery, TResponse> {}

export type CommandHandlerType<TCommand extends ICommand<TResponse>, TResponse> = HandlerType<
  ICommandHandler<TCommand, TResponse>
>;

export type CommandHandlerFactory = <TCommand extends ICommand<TResponse>, TResponse>(
  command: TCommand,
) => ICommandHandler<TCommand, TResponse> | null;

export type QueryHandlerType<TQuery extends IQuery<TResponse>, TResponse> = HandlerType<
  IQueryHandler<TQuery, TResponse>
>;

export type QueryHandlerFactory = <TQuery extends IQuery<TResponse>, TResponse>(
  query: TQuery,
) => IQueryHandler<TQuery, TResponse> | null;
