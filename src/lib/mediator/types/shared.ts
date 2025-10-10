import { NotificationHandlerFactory, NotificationPublisherFactory } from './notification';
import { PipelineBehaviorFactory } from './pipeline';
import { RequestHandlerFactory } from './request';

export type Constructor<T> = new (...args: any[]) => T;

export type AbstractConstructor<T> = abstract new (...args: any[]) => T;

export type HandlerType<T> = Constructor<T> | AbstractConstructor<T>;

export type ServiceFactory = <T>(type: HandlerType<T>) => T;
export type MultiServiceFactory = <T>(type: HandlerType<T>) => T[];

export type AllFactories = {
  serviceFactory: ServiceFactory;
  multiServiceFactory: MultiServiceFactory;
  notificationPublisherFactory: NotificationPublisherFactory;
  requestHandlerFactory: RequestHandlerFactory;
  notificationHandlerFactory: NotificationHandlerFactory;
  pipelineBehaviorFactory: PipelineBehaviorFactory;
};
