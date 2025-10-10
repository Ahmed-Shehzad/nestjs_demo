import { HandlerType } from './shared';

export type INotification = object;

export interface INotificationHandler<TNotification extends INotification> {
  handleAsync(notification: TNotification): Promise<void> | void;
}

export interface INotificationPublisher {
  publishAsync<TNotification extends INotification>(notification: TNotification): Promise<void>;
}

export type NotificationHandlerType<TNotification extends INotification> = HandlerType<
  INotificationHandler<TNotification>
>;

export type NotificationPublisherFactory = () => INotificationPublisher;

export type NotificationHandlerFactory = <TNotification extends INotification>(
  notification: TNotification,
) => INotificationHandler<TNotification>[];
