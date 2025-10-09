import 'reflect-metadata';
import { Injectable } from '@nestjs/common';
import {
  IRequest,
  IBaseRequest,
  INotification,
  Constructor,
} from './interfaces';

// Metadata keys for different handler types
export const REQUEST_HANDLER_METADATA = Symbol('REQUEST_HANDLER_METADATA');
export const COMMAND_HANDLER_METADATA = Symbol('COMMAND_HANDLER_METADATA');
export const NOTIFICATION_HANDLER_METADATA = Symbol(
  'NOTIFICATION_HANDLER_METADATA',
);

/**
 * Decorator for request handlers that return a response
 * Usage: @RequestHandler(GetUserQuery)
 */
export function RequestHandler<
  TRequest extends IRequest<TResponse>,
  TResponse = any,
>(requestType: Constructor<TRequest>) {
  return function <T extends new (...args: any[]) => any>(target: T) {
    Injectable()(target);
    Reflect.defineMetadata(REQUEST_HANDLER_METADATA, requestType, target);
    return target;
  };
}

/**
 * Decorator for command handlers that don't return a response
 * Usage: @CommandHandler(CreateUserCommand)
 */
export function CommandHandler<TCommand extends IBaseRequest>(
  commandType: Constructor<TCommand>,
) {
  return function <T extends new (...args: any[]) => any>(target: T) {
    Injectable()(target);
    Reflect.defineMetadata(COMMAND_HANDLER_METADATA, commandType, target);
    return target;
  };
}

/**
 * Decorator for notification handlers
 * Usage: @NotificationHandler(UserCreatedEvent)
 */
export function NotificationHandler<TNotification extends INotification>(
  notificationType: Constructor<TNotification>,
) {
  return function <T extends new (...args: any[]) => any>(target: T) {
    Injectable()(target);
    Reflect.defineMetadata(
      NOTIFICATION_HANDLER_METADATA,
      notificationType,
      target,
    );
    return target;
  };
}

/* eslint-disable @typescript-eslint/no-unsafe-argument */
/* eslint-disable @typescript-eslint/no-unsafe-return */

/**
 * Helper function to check if a class is a request handler
 */
export function isRequestHandler(target: any): boolean {
  return Reflect.hasMetadata(REQUEST_HANDLER_METADATA, target);
}

/**
 * Helper function to check if a class is a command handler
 */
export function isCommandHandler(target: any): boolean {
  return Reflect.hasMetadata(COMMAND_HANDLER_METADATA, target);
}

/**
 * Helper function to check if a class is a notification handler
 */
export function isNotificationHandler(target: any): boolean {
  return Reflect.hasMetadata(NOTIFICATION_HANDLER_METADATA, target);
}

/**
 * Get the request type that a handler handles
 */
export function getRequestType(target: any): Constructor | undefined {
  return (
    Reflect.getMetadata(REQUEST_HANDLER_METADATA, target) ||
    Reflect.getMetadata(COMMAND_HANDLER_METADATA, target) ||
    Reflect.getMetadata(NOTIFICATION_HANDLER_METADATA, target)
  );
}
