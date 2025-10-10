/* eslint-disable @typescript-eslint/no-unsafe-argument */
import 'reflect-metadata';

/**
 * Metadata key symbol for validator registration
 * Used by the mediator discovery service to identify request validators
 * @internal
 */
export const VALIDATOR_FOR_METADATA = Symbol('VALIDATOR_FOR');

/**
 * Decorator that marks a class as a validator for a specific request type.
 *
 * This decorator registers the class with the mediator discovery service, enabling automatic
 * validation execution through the validation behavior pipeline. Validators are executed
 * before request handlers to ensure data integrity and business rules.
 *
 * @param requestType - The request/query/command class constructor that this validator validates
 * @returns A class decorator function that registers the validator
 *
 * @example Query Validator
 * ```typescript
 * @Injectable()
 * @ValidatorFor(GetUserByIdQuery)
 * export class GetUserByIdQueryValidator extends AbstractValidator<GetUserByIdQuery> {
 *   constructor() {
 *     super();
 *     this.ruleFor(x => x.userId)
 *       .notEmpty()
 *       .withMessage('User ID is required')
 *       .matches(/^[0-9a-f-]{36}$/i)
 *       .withMessage('User ID must be a valid GUID');
 *   }
 * }
 * ```
 *
 * @example Command Validator
 * ```typescript
 * @Injectable()
 * @ValidatorFor(CreateUserCommand)
 * export class CreateUserCommandValidator extends AbstractValidator<CreateUserCommand> {
 *   constructor() {
 *     super();
 *     this.ruleFor(x => x.email)
 *       .notEmpty()
 *       .emailAddress()
 *       .withMessage('Valid email address is required');
 *
 *     this.ruleFor(x => x.firstName)
 *       .notEmpty()
 *       .length(1, 50)
 *       .withMessage('First name must be between 1 and 50 characters');
 *   }
 * }
 * ```
 *
 * @see {@link AbstractValidator} - Base class that validators extend
 * @see {@link ValidationBehavior} - Pipeline behavior that executes validators
 * @see {@link MediatorDiscoveryService} - Service that discovers and manages validators
 * @since 1.0.0
 */
export function ValidatorFor(requestType: new (...args: any[]) => any) {
  /**
   * The actual decorator function that applies metadata to the target class
   * @param target - The validator class being decorated
   * @internal
   */
  return (target: any) => {
    Reflect.defineMetadata(VALIDATOR_FOR_METADATA, requestType.name, target);
  };
}
