import { applyDecorators, UsePipes } from '@nestjs/common';
import { FluentValidationPipe } from './validation.pipe';
import { ValidatorConstructor } from './validation.pipe';

/**
 * Global validation decorator that can be applied to any method or class
 * @param validatorClass The validator class to use
 */
export function ValidateWith<T>(validatorClass: ValidatorConstructor<T>) {
  return applyDecorators(UsePipes(new FluentValidationPipe(validatorClass)));
}

/**
 * Factory function for creating validation decorators
 * @param validatorClass The validator class to use
 */
export function CreateValidationDecorator<T>(
  validatorClass: ValidatorConstructor<T>,
) {
  return function (
    target: object,
    propertyKey: string | symbol,
    descriptor: PropertyDescriptor,
  ) {
    UsePipes(new FluentValidationPipe(validatorClass))(
      target,
      propertyKey,
      descriptor,
    );
  };
}
