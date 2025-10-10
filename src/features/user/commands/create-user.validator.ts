import { Injectable } from '@nestjs/common';
import { ValidatorFor } from '@/mediator/decorators/validator.decorator';
import { AbstractValidator } from '@/fluent-validation/abstract.validator';
import { CreateUserCommand } from './create-user.command';

/**
 * CreateUserCommandValidator
 * Fluent validation for CreateUserCommand
 * Generated on: 2025-10-10T17:23:10.899Z
 * Feature: User
 */
@Injectable()
@ValidatorFor(CreateUserCommand)
export class CreateUserCommandValidator extends AbstractValidator<CreateUserCommand> {
  constructor() {
    super();

    // Add validation rules here
    // Example:
    // this.ruleFor((x) => x.name)
    //   .notEmpty()
    //   .withMessage('Name is required');
    //
    // this.ruleFor((x) => x.email)
    //   .notEmpty()
    //   .email()
    //   .withMessage('Valid email is required');
  }
}
