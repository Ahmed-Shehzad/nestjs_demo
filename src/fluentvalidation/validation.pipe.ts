import {
  PipeTransform,
  Injectable,
  ArgumentMetadata,
  BadRequestException,
} from '@nestjs/common';
import { AbstractValidator } from './abstract-validator';

export interface ValidatorConstructor<T = unknown> {
  new (): AbstractValidator<T>;
}

@Injectable()
export class FluentValidationPipe implements PipeTransform {
  constructor(private validatorClass: ValidatorConstructor) {}

  async transform(
    value: unknown,
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    _metadata: ArgumentMetadata,
  ): Promise<unknown> {
    if (!this.validatorClass) {
      return value;
    }

    const validator = new this.validatorClass();
    const result = await validator.validateAsync(value);

    if (!result.isValid) {
      // Transform validation errors into a structured format for NestJS
      const errors = result.errors.map((error) => ({
        property: error.propertyName,
        message: error.errorMessage,
        value: error.attemptedValue,
      }));

      throw new BadRequestException({
        message: 'Validation failed',
        errors: errors,
        statusCode: 400,
      });
    }

    return value;
  }
}

// Factory function for easier use with decorators
export function ValidationPipe<T>(
  validatorClass: ValidatorConstructor<T>,
): typeof FluentValidationPipe {
  @Injectable()
  class MixinValidationPipe extends FluentValidationPipe {
    constructor() {
      super(validatorClass);
    }
  }
  return MixinValidationPipe;
}
