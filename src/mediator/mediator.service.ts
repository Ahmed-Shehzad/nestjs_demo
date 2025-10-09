import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { ModuleRef } from '@nestjs/core';
import { DiscoveryService } from '@nestjs/core';
import {
  IMediator,
  IRequest,
  IBaseRequest,
  INotification,
  Constructor,
} from './interfaces';
import {
  REQUEST_HANDLER_METADATA,
  COMMAND_HANDLER_METADATA,
  NOTIFICATION_HANDLER_METADATA,
} from './decorators';

@Injectable()
export class MediatorService implements IMediator, OnModuleInit {
  private readonly logger = new Logger(MediatorService.name);
  private readonly requestHandlers = new Map<Constructor, unknown>();
  private readonly commandHandlers = new Map<Constructor, unknown>();
  private readonly notificationHandlers = new Map<Constructor, unknown[]>();

  constructor(
    private readonly moduleRef: ModuleRef,
    private readonly discoveryService: DiscoveryService,
  ) {}

  onModuleInit(): void {
    this.discoverHandlers();
  }

  async send<TResponse>(request: IRequest<TResponse>): Promise<TResponse>;
  async send(command: IBaseRequest): Promise<void>;
  async send<TResponse>(
    request: IRequest<TResponse> | IBaseRequest,
  ): Promise<TResponse | void> {
    const requestType = request.constructor as Constructor;

    const requestHandler = this.requestHandlers.get(requestType);
    if (requestHandler && this.hasHandleMethod(requestHandler)) {
      this.logger.debug(`Handling request: ${requestType.name}`);
      // eslint-disable-next-line @typescript-eslint/no-unsafe-return
      return await requestHandler.handle(request);
    }

    const commandHandler = this.commandHandlers.get(requestType);
    if (commandHandler && this.hasHandleMethod(commandHandler)) {
      this.logger.debug(`Handling command: ${requestType.name}`);
      await commandHandler.handle(request);
      return;
    }

    throw new Error(`No handler registered for ${requestType.name}`);
  }

  async publish(notification: INotification): Promise<void> {
    const notificationType = notification.constructor as Constructor;
    const handlers = this.notificationHandlers.get(notificationType) || [];

    if (handlers.length === 0) {
      this.logger.warn(
        `No handlers for notification: ${notificationType.name}`,
      );
      return;
    }

    const promises = handlers
      .filter((handler) => this.hasHandleMethod(handler))
      // eslint-disable-next-line @typescript-eslint/no-unsafe-return
      .map((handler) => handler.handle(notification));

    await Promise.all(promises);
  }

  private hasHandleMethod(obj: unknown): obj is { handle: (req: any) => any } {
    return (
      typeof obj === 'object' &&
      obj !== null &&
      'handle' in obj &&
      // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
      typeof (obj as any).handle === 'function'
    );
  }

  private discoverHandlers(): void {
    const providers = this.discoveryService.getProviders();

    for (const provider of providers) {
      if (!provider.instance || !provider.metatype) {
        continue;
      }

      this.registerIfRequestHandler(provider.instance, provider.metatype);
      this.registerIfCommandHandler(provider.instance, provider.metatype);
      this.registerIfNotificationHandler(provider.instance, provider.metatype);
    }

    this.logRegisteredHandlers();
  }

  private registerIfRequestHandler(instance: unknown, metatype: unknown): void {
    if (typeof metatype !== 'function') return;

    const requestType = Reflect.getMetadata(
      REQUEST_HANDLER_METADATA,
      metatype,
    ) as Constructor;
    if (requestType) {
      if (this.requestHandlers.has(requestType)) {
        throw new Error(`Duplicate request handler for ${requestType.name}`);
      }
      this.requestHandlers.set(requestType, instance);
    }
  }

  private registerIfCommandHandler(instance: unknown, metatype: unknown): void {
    if (typeof metatype !== 'function') return;

    const commandType = Reflect.getMetadata(
      COMMAND_HANDLER_METADATA,
      metatype,
    ) as Constructor;
    if (commandType) {
      if (this.commandHandlers.has(commandType)) {
        throw new Error(`Duplicate command handler for ${commandType.name}`);
      }
      this.commandHandlers.set(commandType, instance);
    }
  }

  private registerIfNotificationHandler(
    instance: unknown,
    metatype: unknown,
  ): void {
    if (typeof metatype !== 'function') return;

    const notificationType = Reflect.getMetadata(
      NOTIFICATION_HANDLER_METADATA,
      metatype,
    ) as Constructor;
    if (notificationType) {
      const existingHandlers =
        this.notificationHandlers.get(notificationType) || [];
      existingHandlers.push(instance);
      this.notificationHandlers.set(notificationType, existingHandlers);
    }
  }

  private logRegisteredHandlers(): void {
    this.logger.log(
      `Registered ${this.requestHandlers.size} request handler(s)`,
    );
    this.logger.log(
      `Registered ${this.commandHandlers.size} command handler(s)`,
    );
    this.logger.log(
      `Registered ${this.notificationHandlers.size} notification type(s)`,
    );
  }
}
