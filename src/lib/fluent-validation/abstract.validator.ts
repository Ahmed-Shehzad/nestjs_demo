/* eslint-disable @typescript-eslint/no-unsafe-argument */
/* eslint-disable @typescript-eslint/no-unsafe-return */
import { IRuleBuilder, RuleBuilder } from './rule-builder.validator';
import { ValidationFailure, ValidationResult } from './validation-result.validator';

export abstract class AbstractValidator<T> {
  private readonly rules: Array<{
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

    for (const rule of this.rules) {
      const value: unknown = rule.propertySelector(instance);
      const validators = rule.ruleBuilder.getRules();

      for (const validator of validators) {
        try {
          const failure = await Promise.resolve(validator(value));
          if (failure instanceof ValidationFailure) {
            failures.push(failure);
          }
        } catch (error) {
          const errorMessage = error instanceof Error ? error.message : String(error);
          failures.push(new ValidationFailure(rule.propertyName, `Validation error: ${errorMessage}`));
        }
      }
    }

    const uniqueFailures = Array.from(new Set(failures.map((obj) => obj.toString()))).map((str) => JSON.parse(str));
    const result = new ValidationResult(uniqueFailures);

    return result;
  }

  private getPropertyName<TProperty>(propertySelector: (obj: T) => TProperty): string {
    const fnString = propertySelector.toString();

    // Try to match simple arrow function pattern: obj => obj.property
    const simpleArrowRegex = /\w+\s*=>\s*\w+\.(\w+)/;
    const simpleMatch = simpleArrowRegex.exec(fnString);
    if (simpleMatch) {
      return simpleMatch[1];
    }

    // Try to match parenthesized arrow function: (obj) => obj.property
    const parenArrowRegex = /\(\s*\w+\s*\)\s*=>\s*\w+\.(\w+)/;
    const parenMatch = parenArrowRegex.exec(fnString);
    if (parenMatch) {
      return parenMatch[1];
    }

    // Fallback to 'Property' if we can't extract the name
    return 'Property';
  }
}
