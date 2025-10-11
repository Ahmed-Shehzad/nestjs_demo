/* eslint-disable @typescript-eslint/no-unsafe-argument */
/* eslint-disable @typescript-eslint/no-unsafe-return */
import { IRuleBuilder, RuleBuilder } from './rule-builder.validator';
import { ValidationFailure, ValidationResult } from './validation-result.validator';

export abstract class AbstractValidator<T> {
  private rules: Array<{
    propertySelector: (obj: T) => unknown;
    propertyName: string;
    ruleBuilder: RuleBuilder<T, unknown>;
  }> = [];

  protected ruleFor<TProperty>(propertySelector: (obj: T) => TProperty): IRuleBuilder<T, TProperty> {
    const propertyName = this.getPropertyName(propertySelector);
    const ruleBuilder = new RuleBuilder<T, TProperty>(propertyName);

    // Store the rule builder itself, not the rules (which aren't configured yet)
    this.rules.push({
      propertySelector: propertySelector as (obj: T) => unknown,
      propertyName,
      ruleBuilder: ruleBuilder as RuleBuilder<T, unknown>,
    });

    return ruleBuilder;
  }

  async validateAsync(instance: T): Promise<ValidationResult> {
    const failures: ValidationFailure[] = [];

    console.log(`🔍 [DEBUG] AbstractValidator.validateAsync called with ${this.rules.length} rules`);

    for (const rule of this.rules) {
      const value: unknown = rule.propertySelector(instance);
      const validators = rule.ruleBuilder.getRules();

      console.log(
        `🔍 [DEBUG] Validating property '${rule.propertyName}' with ${validators.length} validators, value:`,
        value,
      );

      for (const validator of validators) {
        try {
          const failure = await Promise.resolve(validator(value));
          if (failure instanceof ValidationFailure) {
            console.log(`🔍 [DEBUG] Validation failed for '${rule.propertyName}':`, failure.message);
            failures.push(failure);
          } else {
            console.log(`🔍 [DEBUG] Validation passed for '${rule.propertyName}'`);
          }
        } catch (error) {
          console.error(`🔍 [DEBUG] Validation error for '${rule.propertyName}':`, error);
          failures.push(new ValidationFailure(rule.propertyName, `Validation error: ${error}`));
        }
      }
    }

    const uniqueFailures = Array.from(new Set(failures.map((obj) => obj.toString()))).map((str) => JSON.parse(str));
    const result = new ValidationResult(uniqueFailures);
    console.log(`🔍 [DEBUG] Validation result: ${result.isValid ? 'VALID' : 'INVALID'}, errors: ${failures.length}`);

    return result;
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
