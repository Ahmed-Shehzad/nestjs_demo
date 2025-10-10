import { Injectable } from '@nestjs/common';
import { ValidatorFor } from '@/mediator/decorators/validator.decorator';
import { AbstractValidator } from '@/fluent-validation/abstract.validator';
import { CreateBookmarkCommand } from './create-bookmark.command';

/**
 * CreateBookmarkCommandValidator
 * Fluent validation for CreateBookmarkCommand
 * Generated on: 2025-10-10T17:23:18.551Z
 * Feature: Bookmark
 */
@Injectable()
@ValidatorFor(CreateBookmarkCommand)
export class CreateBookmarkCommandValidator extends AbstractValidator<CreateBookmarkCommand> {
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
