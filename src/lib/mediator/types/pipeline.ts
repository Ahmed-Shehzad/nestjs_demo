import { IRequest } from './request';
import { HandlerType } from './shared';

export interface IPipelineBehavior<TRequest extends IRequest<TResponse>, TResponse> {
  handleAsync(request: TRequest, next: () => Promise<TResponse>): Promise<TResponse>;
}

export type PipelineBehaviorType<TRequest extends IRequest<TResponse>, TResponse> = HandlerType<
  IPipelineBehavior<TRequest, TResponse>
>;

export type PipelineBehaviorFactory = <TRequest extends IRequest<TResponse>, TResponse>(
  request: TRequest,
) => IPipelineBehavior<TRequest, TResponse>[];
