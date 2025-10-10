export interface IRuleBuilder<T, TProperty> {
  notEmpty(): IRuleBuilder<T, TProperty>;
  notNull(): IRuleBuilder<T, TProperty>;
  minLength(length: number): IRuleBuilder<T, TProperty>;
  maxLength(length: number): IRuleBuilder<T, TProperty>;
  email(): IRuleBuilder<T, TProperty>;
  matches(pattern: RegExp): IRuleBuilder<T, TProperty>;
  must(predicate: (value: TProperty) => boolean): IRuleBuilder<T, TProperty>;
  withMessage(message: string): IRuleBuilder<T, TProperty>;
}

class RuleBuilder<T, TProperty> implements IRuleBuilder<T, TProperty> {
  private validators: Array<(value: TProperty) => ValidationFailure | null> =
    [];
  private customMessage: string | null = null;

  constructor(private propertyName: string) {}

  notEmpty(): IRuleBuilder<T, TProperty> {
    this.validators.push((value: TProperty) => {
      if (value === null || value === undefined || value === '') {
        const message =
          this.customMessage ?? `'${this.propertyName}' must not be empty.`;
        return new ValidationFailure(this.propertyName, message, value);
      }
      return null;
    });
    return this;
  }

  notNull(): IRuleBuilder<T, TProperty> {
    this.validators.push((value: TProperty) => {
      if (value === null || value === undefined) {
        const message =
          this.customMessage ?? `'${this.propertyName}' must not be null.`;
        return new ValidationFailure(this.propertyName, message, value);
      }
      return null;
    });
    return this;
  }

  minLength(length: number): IRuleBuilder<T, TProperty> {
    this.validators.push((value: TProperty) => {
      if (typeof value === 'string' && value.length < length) {
        const message =
          this.customMessage ??
          `'${this.propertyName}' must be at least ${length} characters long.`;
        return new ValidationFailure(this.propertyName, message, value);
      }
      return null;
    });
    return this;
  }

  maxLength(length: number): IRuleBuilder<T, TProperty> {
    this.validators.push((value: TProperty) => {
      if (typeof value === 'string' && value.length > length) {
        const message =
          this.customMessage ??
          `'${this.propertyName}' must not exceed ${length} characters.`;
        return new ValidationFailure(this.propertyName, message, value);
      }
      return null;
    });
    return this;
  }

  email(): IRuleBuilder<T, TProperty> {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    this.validators.push((value: TProperty) => {
      if (typeof value === 'string' && !emailRegex.test(value)) {
        const message =
          this.customMessage ??
          `'${this.propertyName}' is not a valid email address.`;
        return new ValidationFailure(this.propertyName, message, value);
      }
      return null;
    });
    return this;
  }

  matches(pattern: RegExp): IRuleBuilder<T, TProperty> {
    this.validators.push((value: TProperty) => {
      if (typeof value === 'string' && !pattern.test(value)) {
        const message =
          this.customMessage ??
          `'${this.propertyName}' is not in the correct format.`;
        return new ValidationFailure(this.propertyName, message, value);
      }
      return null;
    });
    return this;
  }

  must(predicate: (value: TProperty) => boolean): IRuleBuilder<T, TProperty> {
    this.validators.push((value: TProperty) => {
      if (!predicate(value)) {
        const message =
          this.customMessage ??
          `'${this.propertyName}' does not meet the required condition.`;
        return new ValidationFailure(this.propertyName, message, value);
      }
      return null;
    });
    return this;
  }

  withMessage(message: string): IRuleBuilder<T, TProperty> {
    this.customMessage = message;
    return this;
  }

  getValidators(): Array<(value: TProperty) => ValidationFailure | null> {
    return this.validators;
  }
}

import { ValidationResult, ValidationFailure } from './validation-result';

export abstract class AbstractValidator<T> {
  private rules: Array<{
    propertySelector: (obj: T) => unknown;
    propertyName: string;
    validators: Array<(value: unknown) => ValidationFailure | null>;
  }> = [];

  protected ruleFor<TProperty>(
    propertySelector: (obj: T) => TProperty,
  ): IRuleBuilder<T, TProperty> {
    const propertyName = this.getPropertyName(propertySelector);
    const ruleBuilder = new RuleBuilder<T, TProperty>(propertyName);

    // Store the rule when it's fully configured
    this.rules.push({
      propertySelector: propertySelector as (obj: T) => unknown,
      propertyName,
      validators: ruleBuilder.getValidators() as Array<
        (value: unknown) => ValidationFailure | null
      >,
    });

    return ruleBuilder;
  }

  validate(instance: T): ValidationResult {
    const failures: ValidationFailure[] = [];

    for (const rule of this.rules) {
      const value: unknown = rule.propertySelector(instance);
      for (const validator of rule.validators) {
        const failure = validator(value);
        if (failure) {
          failures.push(failure);
        }
      }
    }

    return new ValidationResult(failures);
  }

  async validateAsync(instance: T): Promise<ValidationResult> {
    // For now, just return the sync version
    // In the future, this could support async validators
    return Promise.resolve(this.validate(instance));
  }

  private getPropertyName<TProperty>(
    propertySelector: (obj: T) => TProperty,
  ): string {
    const fnString = propertySelector.toString();

    // Try to match arrow function patterns like: obj => obj.property
    const arrowMatch = fnString.match(
      /(?:\w+\s*=>\s*\w+\.(\w+))|(?:\(\s*\w+\s*\)\s*=>\s*\w+\.(\w+))/,
    );
    if (arrowMatch) {
      return arrowMatch[1] || arrowMatch[2];
    }

    // Fallback to 'Property' if we can't extract the name
    return 'Property';
  }
}
