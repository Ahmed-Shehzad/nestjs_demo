import { Injectable, OnModuleInit } from '@nestjs/common';
import { DiscoveryService } from '@golevelup/nestjs-discovery';
import { REQUEST_HANDLER_METADATA } from '../decorators/request-handler.decorator';
import { VALIDATOR_FOR_METADATA } from '../decorators/validator.decorator';
import { NOTIFICATION_HANDLER_METADATA } from '../decorators/notification-handler.decorator';
import { AbstractValidator } from '@/lib/fluent-validation/abstract.validator';
import { INotificationHandler } from '../types/notification';

@Injectable()
export class MediatorDiscoveryService implements OnModuleInit {
  private handlerMap = new Map<unknown, any>();
  private validatorMap = new Map<unknown, AbstractValidator<any>>();
  private notificationHandlerMap = new Map<unknown, INotificationHandler<any>[]>();

  constructor(private readonly discovery: DiscoveryService) {}

  async onModuleInit() {
    const handlers = await this.discovery.providersWithMetaAtKey(REQUEST_HANDLER_METADATA);
    const validators = await this.discovery.providersWithMetaAtKey(VALIDATOR_FOR_METADATA);
    const notificationHandlers = await this.discovery.providersWithMetaAtKey(NOTIFICATION_HANDLER_METADATA);

    handlers.forEach(({ meta, discoveredClass }) => {
      this.handlerMap.set(meta, discoveredClass.instance);
    });

    validators.forEach(({ meta, discoveredClass }) => {
      this.validatorMap.set(meta, discoveredClass.instance as AbstractValidator<any>);
    });

    // Group notification handlers by notification type (multiple handlers per notification)
    notificationHandlers.forEach(({ meta, discoveredClass }) => {
      const existingHandlers = this.notificationHandlerMap.get(meta) || [];
      existingHandlers.push(discoveredClass.instance as INotificationHandler<any>);
      this.notificationHandlerMap.set(meta, existingHandlers);
    });
  }

  getHandler(requestName: unknown): any {
    return this.handlerMap.get(requestName);
  }

  getValidator(requestName: unknown): AbstractValidator<any> | undefined {
    return this.validatorMap.get(requestName);
  }

  getNotificationHandlers(notificationName: unknown): INotificationHandler<any>[] {
    return this.notificationHandlerMap.get(notificationName) || [];
  }
}
