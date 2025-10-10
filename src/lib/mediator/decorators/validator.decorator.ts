/* eslint-disable @typescript-eslint/no-unsafe-argument */
import 'reflect-metadata';

export const VALIDATOR_FOR_METADATA = Symbol('VALIDATOR_FOR');

export function ValidatorFor(requestType: new (...args: any[]) => any) {
  return (target: any) => {
    Reflect.defineMetadata(VALIDATOR_FOR_METADATA, requestType.name, target);
  };
}
