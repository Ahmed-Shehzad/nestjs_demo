/* eslint-disable @typescript-eslint/no-unsafe-argument */
import 'reflect-metadata';

export const REQUEST_HANDLER_METADATA = Symbol('REQUEST_HANDLER');

export function RequestHandler(requestType: new (...args: any[]) => any) {
  return (target: any) => {
    Reflect.defineMetadata(REQUEST_HANDLER_METADATA, requestType.name, target);
  };
}
