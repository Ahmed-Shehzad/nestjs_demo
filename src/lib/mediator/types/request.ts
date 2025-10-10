/* eslint-disable @typescript-eslint/no-unused-vars */
import { HandlerType } from './shared';

export interface IRequest<TResponse = void> {}

export interface IRequestHandler<TRequest extends IRequest<TResponse>, TResponse> {
  handleAsync(request: TRequest): Promise<TResponse> | TResponse;
}

export type RequestHandlerType<TRequest extends IRequest<TResponse>, TResponse> = HandlerType<
  IRequestHandler<TRequest, TResponse>
>;

export type RequestHandlerFactory = <TRequest extends IRequest<TResponse>, TResponse>(
  request: TRequest,
) => IRequestHandler<TRequest, TResponse> | null;

export interface IQuery<TResponse> extends IRequest<TResponse> {}
export interface ICommand<TResponse = void> extends IRequest<TResponse> {}

export interface ICommandHandler<TCommand extends ICommand<TResponse>, TResponse>
  extends IRequestHandler<TCommand, TResponse> {}

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
