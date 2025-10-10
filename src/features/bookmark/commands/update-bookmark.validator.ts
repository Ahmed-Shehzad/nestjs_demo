import { Injectable } from '@nestjs/common';
import { ValidatorFor } from '@/mediator/decorators/validator.decorator';
import { AbstractValidator } from '@/fluent-validation/abstract.validator';
import { UpdateBookmarkCommand } from './update-bookmark.command';

/**
 * UpdateBookmarkCommandValidator
 * Fluent validation for UpdateBookmarkCommand
 * Generated on: 2025-10-10T17:23:18.552Z
 * Feature: Bookmark
 */
@Injectable()
@ValidatorFor(UpdateBookmarkCommand)
export class UpdateBookmarkCommandValidator extends AbstractValidator<UpdateBookmarkCommand> {
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
