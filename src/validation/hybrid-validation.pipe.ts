import {
  PipeTransform,
  Injectable,
  ArgumentMetadata,
  BadRequestException,
  Type,
} from '@nestjs/common';
import { validate } from 'class-validator';
import { plainToInstance } from 'class-transformer';
import { AbstractValidator } from '../fluentvalidation/abstract-validator';
import { ValidationFailure } from '../fluentvalidation/validation-result';

export interface ValidatorConstructor<T = unknown> {
  new (): AbstractValidator<T>;
}

export interface HybridValidationOptions {
  useFluentValidation?: boolean;
  useClassValidator?: boolean;
  fluentValidator?: ValidatorConstructor;
  combineErrors?: boolean;
  priority?: 'fluent' | 'class-validator' | 'both';
}

@Injectable()
export class HybridValidationPipe implements PipeTransform {
  private options: HybridValidationOptions;

  constructor(options: HybridValidationOptions = {}) {
    this.options = {
      useFluentValidation: true,
      useClassValidator: true,
      combineErrors: true,
      priority: 'both',
      ...options,
    };
  }

  async transform(
    value: unknown,
    { metatype }: ArgumentMetadata,
  ): Promise<unknown> {
    // Skip validation for primitive types, null/undefined, or non-validatable metatypes
    if (
      value === null ||
      value === undefined ||
      !metatype ||
      !this.toValidate(metatype)
    ) {
      return value;
    }

    const errors: Array<{
      property: string;
      message: string;
      value?: unknown;
      source: 'fluent' | 'class-validator';
    }> = [];

    // Step 1: FluentValidation (if enabled and validator provided)
    if (this.options.useFluentValidation && this.options.fluentValidator) {
      const fluentErrors = await this.runFluentValidation(value);
      if (fluentErrors.length > 0) {
        if (this.options.priority === 'fluent') {
          // Stop here and throw only fluent errors
          throw new BadRequestException({
            message: 'FluentValidation failed',
            errors: fluentErrors.map((error) => ({
              property: error.property,
              message: error.message,
              value: error.value,
            })),
            statusCode: 400,
          });
        }
        errors.push(...fluentErrors);
      }
    }

    // Step 2: Class-validator (if enabled and metatype exists)
    if (
      this.options.useClassValidator &&
      metatype &&
      this.toValidate(metatype)
    ) {
      const classValidatorErrors = await this.runClassValidation(
        value,
        metatype,
      );
      if (classValidatorErrors.length > 0) {
        if (this.options.priority === 'class-validator') {
          // Stop here and throw only class-validator errors
          throw new BadRequestException({
            message: 'Class-validator validation failed',
            errors: classValidatorErrors.map((error) => ({
              property: error.property,
              message: error.message,
              value: error.value,
            })),
            statusCode: 400,
          });
        }
        errors.push(...classValidatorErrors);
      }
    }

    // Step 3: Handle combined errors
    if (errors.length > 0) {
      this.throwCombinedErrors(errors);
    }

    return value;
  }

  private async runFluentValidation(value: unknown): Promise<
    Array<{
      property: string;
      message: string;
      value?: unknown;
      source: 'fluent';
    }>
  > {
    if (!this.options.fluentValidator) return [];

    const validator = new this.options.fluentValidator();
    const result = await validator.validateAsync(value);

    if (!result.isValid) {
      return result.errors.map((error: ValidationFailure) => ({
        property: error.propertyName,
        message: error.errorMessage,
        value: error.attemptedValue,
        source: 'fluent' as const,
      }));
    }

    return [];
  }

  private async runClassValidation(
    value: unknown,
    metatype: Type<unknown>,
  ): Promise<
    Array<{
      property: string;
      message: string;
      value?: unknown;
      source: 'class-validator';
    }>
  > {
    const object = plainToInstance(metatype, value);
    const validationErrors = await validate(object as object);

    if (validationErrors.length > 0) {
      const errors: Array<{
        property: string;
        message: string;
        value?: unknown;
        source: 'class-validator';
      }> = [];

      validationErrors.forEach((error) => {
        if (error.constraints) {
          Object.values(error.constraints).forEach((message) => {
            errors.push({
              property: error.property,
              message: message,
              value: error.value,
              source: 'class-validator',
            });
          });
        }
      });

      return errors;
    }

    return [];
  }

  private throwCombinedErrors(
    errors: Array<{
      property: string;
      message: string;
      value?: unknown;
      source: 'fluent' | 'class-validator';
    }>,
  ): never {
    if (!this.options.combineErrors) {
      // Throw only the first error source based on priority
      const fluentErrors = errors.filter((e) => e.source === 'fluent');
      const classValidatorErrors = errors.filter(
        (e) => e.source === 'class-validator',
      );

      if (this.options.priority === 'fluent' && fluentErrors.length > 0) {
        throw new BadRequestException({
          message: 'FluentValidation failed',
          errors: fluentErrors.map((error) => ({
            property: error.property,
            message: error.message,
            value: error.value,
          })),
          statusCode: 400,
        });
      }

      if (
        this.options.priority === 'class-validator' &&
        classValidatorErrors.length > 0
      ) {
        throw new BadRequestException({
          message: 'Class-validator validation failed',
          errors: classValidatorErrors.map((error) => ({
            property: error.property,
            message: error.message,
            value: error.value,
          })),
          statusCode: 400,
        });
      }
    }

    // Combine all errors
    const groupedErrors = {
      fluent: errors.filter((e) => e.source === 'fluent'),
      classValidator: errors.filter((e) => e.source === 'class-validator'),
    };

    throw new BadRequestException({
      message: errors.map((error) => ({
        property: error.property,
        message: error.message,
        value: error.value,
      })),
      validationSources: {
        fluent: groupedErrors.fluent.length,
        classValidator: groupedErrors.classValidator.length,
      },
      statusCode: 400,
    });
  }

  private toValidate(metatype: Type<unknown>): boolean {
    const types: Type<unknown>[] = [String, Boolean, Number, Array, Object];
    return !types.includes(metatype);
  }
}

// Factory functions for common use cases

/**
 * Creates a hybrid pipe with FluentValidation only
 */
export function FluentValidationOnly<T>(
  validatorClass: ValidatorConstructor<T>,
): typeof HybridValidationPipe {
  @Injectable()
  class FluentOnlyPipe extends HybridValidationPipe {
    constructor() {
      super({
        useFluentValidation: true,
        useClassValidator: false,
        fluentValidator: validatorClass,
      });
    }
  }
  return FluentOnlyPipe;
}

/**
 * Creates a hybrid pipe with class-validator only
 */
export function ClassValidatorOnly(): typeof HybridValidationPipe {
  @Injectable()
  class ClassValidatorOnlyPipe extends HybridValidationPipe {
    constructor() {
      super({
        useFluentValidation: false,
        useClassValidator: true,
      });
    }
  }
  return ClassValidatorOnlyPipe;
}

/**
 * Creates a hybrid pipe that combines both validation approaches
 */
export function CombinedValidation<T>(
  fluentValidator: ValidatorConstructor<T>,
  options: Partial<HybridValidationOptions> = {},
): typeof HybridValidationPipe {
  @Injectable()
  class CombinedValidationPipe extends HybridValidationPipe {
    constructor() {
      super({
        useFluentValidation: true,
        useClassValidator: true,
        fluentValidator,
        combineErrors: true,
        priority: 'both',
        ...options,
      });
    }
  }
  return CombinedValidationPipe;
}

/**
 * Creates a hybrid pipe with fluent validation taking priority
 */
export function FluentPriority<T>(
  fluentValidator: ValidatorConstructor<T>,
): typeof HybridValidationPipe {
  @Injectable()
  class FluentPriorityPipe extends HybridValidationPipe {
    constructor() {
      super({
        useFluentValidation: true,
        useClassValidator: true,
        fluentValidator,
        priority: 'fluent',
        combineErrors: false,
      });
    }
  }
  return FluentPriorityPipe;
}

/**
 * Creates a hybrid pipe with class-validator taking priority
 */
export function ClassValidatorPriority<T>(
  fluentValidator?: ValidatorConstructor<T>,
): typeof HybridValidationPipe {
  @Injectable()
  class ClassValidatorPriorityPipe extends HybridValidationPipe {
    constructor() {
      super({
        useFluentValidation: !!fluentValidator,
        useClassValidator: true,
        fluentValidator,
        priority: 'class-validator',
        combineErrors: false,
      });
    }
  }
  return ClassValidatorPriorityPipe;
}
