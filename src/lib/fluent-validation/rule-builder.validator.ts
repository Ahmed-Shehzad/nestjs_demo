import { ValidationFailure } from './validation-result.validator';

export type AsyncValidationRule<TProperty> = (
  value: TProperty,
) => Promise<ValidationFailure | null> | ValidationFailure | null;

export interface IRuleBuilder<T, TProperty> {
  notEmpty(): IRuleBuilder<T, TProperty>;
  email(): IRuleBuilder<T, TProperty>;
  mustBeDefined(): IRuleBuilder<T, TProperty>;
  mustBe(predicate: (value: TProperty) => boolean): IRuleBuilder<T, TProperty>;
  mustBeAsync(predicate: (value: TProperty) => Promise<boolean> | boolean): IRuleBuilder<T, TProperty>;
  mustExistIn(asyncCheck: (value: TProperty) => Promise<boolean>, entityName?: string): IRuleBuilder<T, TProperty>;
  mustBeUnique(asyncCheck: (value: TProperty) => Promise<boolean>, entityName?: string): IRuleBuilder<T, TProperty>;
  withMessage(message: string): IRuleBuilder<T, TProperty>;
}

export class RuleBuilder<T, TProperty> implements IRuleBuilder<T, TProperty> {
  private rules: Array<AsyncValidationRule<TProperty>> = [];
  private customMessage: string | null = null;

  constructor(private propertyName: string) {}

  notEmpty(): IRuleBuilder<T, TProperty> {
    this.rules.push((value: TProperty) => {
      if (!value && typeof value === 'string' && value.trim() === '') {
        const message = this.customMessage ?? `'${this.propertyName}' must not be empty.`;
        return new ValidationFailure(this.propertyName, message);
      }
      return null;
    });
    return this;
  }

  email(): IRuleBuilder<T, TProperty> {
    this.rules.push((value: TProperty) => {
      const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
      if (typeof value === 'string' && !emailRegex.test(value)) {
        const message = this.customMessage ?? `'${this.propertyName}' must be a valid email address.`;
        return new ValidationFailure(this.propertyName, message);
      }
      return null;
    });
    return this;
  }

  mustBeDefined(): IRuleBuilder<T, TProperty> {
    this.rules.push((value: TProperty) => {
      if (value === null || value === undefined) {
        const message = this.customMessage ?? `'${this.propertyName}' must be defined.`;
        return new ValidationFailure(this.propertyName, message);
      }
      return null;
    });
    return this;
  }
  mustBe(predicate: (value: TProperty) => boolean): IRuleBuilder<T, TProperty> {
    this.rules.push((value: TProperty) => {
      if (!predicate(value)) {
        const message = this.customMessage ?? `'${this.propertyName}' does not meet the required condition.`;
        return new ValidationFailure(this.propertyName, message, value);
      }
      return null;
    });
    return this;
  }

  mustBeAsync(predicate: (value: TProperty) => Promise<boolean> | boolean): IRuleBuilder<T, TProperty> {
    this.rules.push(async (value: TProperty) => {
      const isValid = await Promise.resolve(predicate(value));
      if (!isValid) {
        const message = this.customMessage ?? `'${this.propertyName}' does not meet the required async condition.`;
        return new ValidationFailure(this.propertyName, message, value);
      }
      return null;
    });
    return this;
  }

  mustExistIn(asyncCheck: (value: TProperty) => Promise<boolean>, entityName?: string): IRuleBuilder<T, TProperty> {
    this.rules.push(async (value: TProperty) => {
      const exists = await asyncCheck(value);
      if (!exists) {
        const message = this.customMessage ?? `'${this.propertyName}' must exist in ${entityName || 'the system'}.`;
        return new ValidationFailure(this.propertyName, message, value);
      }
      return null;
    });
    return this;
  }

  mustBeUnique(asyncCheck: (value: TProperty) => Promise<boolean>, entityName?: string): IRuleBuilder<T, TProperty> {
    this.rules.push(async (value: TProperty) => {
      const isUnique = await asyncCheck(value);
      if (!isUnique) {
        const message =
          this.customMessage ?? `'${this.propertyName}' must be unique${entityName ? ` in ${entityName}` : ''}.`;
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

  getRules(): Array<AsyncValidationRule<TProperty>> {
    return this.rules;
  }
}
