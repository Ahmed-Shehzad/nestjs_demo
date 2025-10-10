import { NotificationHandlerFactory, NotificationPublisherFactory } from './notification';
import { PipelineBehaviorFactory } from './pipeline';
import { RequestHandlerFactory } from './request';

/**
 * Type alias for concrete class constructors.
 * Represents a class that can be instantiated with the `new` keyword.
 * @template T - The type of instance the constructor creates
 * @since 1.0.0
 */
export type Constructor<T> = new (...args: any[]) => T;

/**
 * Type alias for abstract class constructors.
 * Represents an abstract class that can be extended but not instantiated directly.
 * @template T - The type that the abstract class defines
 * @since 1.0.0
 */
export type AbstractConstructor<T> = abstract new (...args: any[]) => T;

/**
 * Union type for both concrete and abstract class constructors.
 * Used in dependency injection scenarios where either concrete or abstract types are acceptable.
 * @template T - The type represented by the constructor
 * @since 1.0.0
 */
export type HandlerType<T> = Constructor<T> | AbstractConstructor<T>;

/**
 * Factory function type for creating single service instances.
 * Used by dependency injection containers to resolve singleton services.
 * @template T - The type of service to create
 * @param type - The constructor for the service type
 * @returns A single instance of the service
 * @since 1.0.0
 */
export type ServiceFactory = <T>(type: HandlerType<T>) => T;

/**
 * Factory function type for creating multiple service instances.
 * Used when multiple implementations exist for the same interface (e.g., notification handlers).
 * @template T - The type of services to create
 * @param type - The constructor for the service type
 * @returns An array of service instances
 * @since 1.0.0
 */
export type MultiServiceFactory = <T>(type: HandlerType<T>) => T[];

/**
 * Aggregated factory configuration for the mediator system.
 * Contains all factory functions needed to resolve dependencies and create instances
 * for the various components in the CQRS mediator pattern.
 *
 * @example Factory configuration
 * ```typescript
 * const factories: AllFactories = {
 *   serviceFactory: (type) => container.get(type),
 *   multiServiceFactory: (type) => container.getAll(type),
 *   notificationPublisherFactory: () => new NotificationPublisher(),
 *   requestHandlerFactory: (request) => container.get(`Handler:${request.constructor.name}`),
 *   notificationHandlerFactory: (notification) => container.getAll(`Handler:${notification.constructor.name}`),
 *   pipelineBehaviorFactory: (request) => container.getAll('PipelineBehavior')
 * };
 * ```
 *
 * @since 1.0.0
 */
export type AllFactories = {
  /** Factory for creating singleton service instances */
  serviceFactory: ServiceFactory;
  /** Factory for creating multiple service instances */
  multiServiceFactory: MultiServiceFactory;
  /** Factory for creating notification publishers */
  notificationPublisherFactory: NotificationPublisherFactory;
  /** Factory for creating request handlers */
  requestHandlerFactory: RequestHandlerFactory;
  /** Factory for creating notification handlers */
  notificationHandlerFactory: NotificationHandlerFactory;
  /** Factory for creating pipeline behaviors */
  pipelineBehaviorFactory: PipelineBehaviorFactory;
};
