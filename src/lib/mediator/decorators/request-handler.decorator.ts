/* eslint-disable @typescript-eslint/no-unsafe-argument */
import 'reflect-metadata';

/**
 * Metadata key symbol for request handler registration
 * Used by the mediator discovery service to identify request/query/command handlers
 * @internal
 */
export const REQUEST_HANDLER_METADATA = Symbol('REQUEST_HANDLER');

/**
 * Decorator that marks a class as a request handler for a specific request type.
 *
 * This decorator registers the class with the mediator discovery service, enabling automatic
 * handler resolution for CQRS queries and commands. Each request type should have exactly
 * one handler registered.
 *
 * @param requestType - The request/query/command class constructor that this handler processes
 * @returns A class decorator function that registers the handler
 *
 * @example Query Handler
 * ```typescript
 * @Injectable()
 * @RequestHandler(GetUserByIdQuery)
 * export class GetUserByIdQueryHandler implements IQueryHandler<GetUserByIdQuery, UserDto> {
 *   async handleAsync(query: GetUserByIdQuery): Promise<UserDto> {
 *     return await this.userService.findById(query.userId);
 *   }
 * }
 * ```
 *
 * @example Command Handler
 * ```typescript
 * @Injectable()
 * @RequestHandler(CreateUserCommand)
 * export class CreateUserCommandHandler implements ICommandHandler<CreateUserCommand, string> {
 *   async handleAsync(command: CreateUserCommand): Promise<string> {
 *     const user = await this.userService.create(command.userData);
 *     return user.id;
 *   }
 * }
 * ```
 *
 * @see {@link IQueryHandler} - Interface for query handlers
 * @see {@link ICommandHandler} - Interface for command handlers
 * @see {@link MediatorDiscoveryService} - Service that discovers and manages handlers
 * @since 1.0.0
 */
export function RequestHandler(requestType: new (...args: any[]) => any) {
  /**
   * The actual decorator function that applies metadata to the target class
   * @param target - The class being decorated
   * @internal
   */
  return (target: any) => {
    Reflect.defineMetadata(REQUEST_HANDLER_METADATA, requestType.name, target);
  };
}
