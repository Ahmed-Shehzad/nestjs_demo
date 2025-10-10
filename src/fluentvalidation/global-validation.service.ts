import { Injectable } from '@nestjs/common';
import { AbstractValidator } from './abstract-validator';
import { ValidationResult } from './validation-result';

export interface ValidatorClass<T = unknown> {
  new (): AbstractValidator<T>;
}

@Injectable()
export class GlobalValidationService {
  /**
   * Validate any object using a specified validator class
   * @param validatorClass The validator class to use
   * @param data The data to validate
   * @returns Promise<ValidationResult>
   */
  async validate<T>(
    validatorClass: ValidatorClass<T>,
    data: T,
  ): Promise<ValidationResult> {
    const validator = new validatorClass();
    return validator.validateAsync(data);
  }

  /**
   * Validate and throw if invalid
   * @param validatorClass The validator class to use
   * @param data The data to validate
   * @throws ValidationError if validation fails
   */
  async validateOrThrow<T>(
    validatorClass: ValidatorClass<T>,
    data: T,
  ): Promise<void> {
    const result = await this.validate(validatorClass, data);
    result.throwIfInvalid();
  }

  /**
   * Check if data is valid without throwing
   * @param validatorClass The validator class to use
   * @param data The data to validate
   * @returns Promise<boolean>
   */
  async isValid<T>(
    validatorClass: ValidatorClass<T>,
    data: T,
  ): Promise<boolean> {
    const result = await this.validate(validatorClass, data);
    return result.isValid;
  }

  /**
   * Get validation errors as an array of strings
   * @param validatorClass The validator class to use
   * @param data The data to validate
   * @returns Promise<string[]>
   */
  async getErrors<T>(
    validatorClass: ValidatorClass<T>,
    data: T,
  ): Promise<string[]> {
    const result = await this.validate(validatorClass, data);
    return result.errorMessages;
  }
}
