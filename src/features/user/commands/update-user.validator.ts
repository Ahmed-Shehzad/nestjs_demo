import { Injectable } from '@nestjs/common';
import { ValidatorFor } from '@/mediator/decorators/validator.decorator';
import { AbstractValidator } from '@/fluent-validation/abstract.validator';
import { UpdateUserCommand } from './update-user.command';

/**
 * UpdateUserCommandValidator
 * Fluent validation for UpdateUserCommand
 * Generated on: 2025-10-10T17:23:10.900Z
 * Feature: User
 */
@Injectable()
@ValidatorFor(UpdateUserCommand)
export class UpdateUserCommandValidator extends AbstractValidator<UpdateUserCommand> {
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
