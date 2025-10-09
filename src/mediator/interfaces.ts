/**
 * Marker interface for all requests that expect a response
 * This is intentionally minimal to act as a marker interface like in C# MediatR
 */
export interface IRequest<TResponse = void> {
  readonly _requestResponseType?: TResponse;
}

/**
 * Marker interface for all requests that don't expect a response (commands)
 * This is intentionally minimal to act as a marker interface like in C# MediatR
 */
export interface IBaseRequest {
  readonly _isCommand?: true;
}

/**
 * Marker interface for notifications that can be sent to multiple handlers
 * This is intentionally minimal to act as a marker interface like in C# MediatR
 */
export interface INotification {
  readonly _isNotification?: true;
}

/**
 * Handler for requests that return a response
 */
export interface IRequestHandler<
  TRequest extends IRequest<TResponse>,
  TResponse = any,
> {
  handle(request: TRequest): Promise<TResponse>;
}

/**
 * Handler for commands that don't return a response
 */
export interface ICommandHandler<TCommand extends IBaseRequest> {
  handle(command: TCommand): Promise<void>;
}

/**
 * Handler for notifications
 */
export interface INotificationHandler<TNotification extends INotification> {
  handle(notification: TNotification): Promise<void>;
}

/**
 * Main mediator interface
 */
export interface IMediator {
  /**
   * Send a request and get a response
   */
  send<TResponse>(request: IRequest<TResponse>): Promise<TResponse>;

  /**
   * Send a command without expecting a response
   */
  send(command: IBaseRequest): Promise<void>;

  /**
   * Publish a notification to all registered handlers
   */
  publish(notification: INotification): Promise<void>;
}

/**
 * Type helper for any handler type
 */
export type AnyHandler =
  | IRequestHandler<any, any>
  | ICommandHandler<any>
  | INotificationHandler<any>;

/**
 * Constructor type for requests/commands/notifications
 */
export type Constructor<T = object> = new (...args: any[]) => T;
