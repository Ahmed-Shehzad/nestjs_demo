import { Injectable } from '@nestjs/common';
import { ValidatorFor } from '@/mediator/decorators/validator.decorator';
import { AbstractValidator } from '@/fluent-validation/abstract.validator';
import { DeleteUserCommand } from './delete-user.command';

/**
 * DeleteUserCommandValidator
 * Fluent validation for DeleteUserCommand
 * Generated on: 2025-10-10T17:23:10.901Z
 * Feature: User
 */
@Injectable()
@ValidatorFor(DeleteUserCommand)
export class DeleteUserCommandValidator extends AbstractValidator<DeleteUserCommand> {
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
