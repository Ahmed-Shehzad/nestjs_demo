import { INotification } from './notification';
import { IRequest } from './request';
import { AllFactories } from './shared';

export interface IMediator {
  send<TResponse>(request: IRequest<TResponse>): Promise<TResponse>;
  publish(notification: INotification): Promise<void>;
}

export type MediatorOptions = {
  factories: AllFactories;
};
export type MediatorConfig = {
  mediatorOptions: MediatorOptions;
};
export type CreateMediator = (config: MediatorConfig) => IMediator;
export type CreateMediatorOptions = (options: Partial<MediatorOptions>) => IMediator;
export type CreateMediatorConfig = (config: Partial<MediatorConfig>) => IMediator;
export type CreateDefaultMediator = () => IMediator;
export type CreateDefaultMediatorOptions = () => IMediator;
export type CreateDefaultMediatorConfig = () => IMediator;
export type CreateCustomMediator = (options: Partial<MediatorOptions>) => IMediator;
export type CreateCustomMediatorConfig = (config: Partial<MediatorConfig>) => IMediator;
export type CreateCustomMediatorOptions = (
  options: Partial<MediatorOptions>,
  config: Partial<MediatorConfig>,
) => IMediator;
export type CreateMediatorWithDefaults = (
  options?: Partial<MediatorOptions>,
  config?: Partial<MediatorConfig>,
) => IMediator;
export type CreateMediatorWithOverrides = (
  options?: Partial<MediatorOptions>,
  config?: Partial<MediatorConfig>,
) => IMediator;
