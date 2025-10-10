import { IRuleBuilder, RuleBuilder, AsyncValidationRule } from './rule-builder.validator';
import { ValidationFailure, ValidationResult } from './validation-result.validator';

export abstract class AbstractValidator<T> {
  private rules: Array<{
    propertySelector: (obj: T) => unknown;
    propertyName: string;
    validators: Array<AsyncValidationRule<unknown>>;
  }> = [];

  protected ruleFor<TProperty>(propertySelector: (obj: T) => TProperty): IRuleBuilder<T, TProperty> {
    const propertyName = this.getPropertyName(propertySelector);
    const ruleBuilder = new RuleBuilder<T, TProperty>(propertyName);

    // Store the rule when it's fully configured
    this.rules.push({
      propertySelector: propertySelector as (obj: T) => unknown,
      propertyName,
      validators: ruleBuilder.getRules(),
    });

    return ruleBuilder;
  }

  async validateAsync(instance: T): Promise<ValidationResult> {
    const failures: ValidationFailure[] = [];

    for (const rule of this.rules) {
      const value: unknown = rule.propertySelector(instance);
      for (const validator of rule.validators) {
        const failure = await Promise.resolve(validator(value));
        if (failure) {
          failures.push(failure);
        }
      }
    }

    return new ValidationResult(failures);
  }

  private getPropertyName<TProperty>(propertySelector: (obj: T) => TProperty): string {
    const fnString = propertySelector.toString();

    // Try to match arrow function patterns like: obj => obj.property
    const arrowMatch = fnString.match(/(?:\w+\s*=>\s*\w+\.(\w+))|(?:\(\s*\w+\s*\)\s*=>\s*\w+\.(\w+))/);
    if (arrowMatch) {
      return arrowMatch[1] || arrowMatch[2];
    }

    // Fallback to 'Property' if we can't extract the name
    return 'Property';
  }
}
