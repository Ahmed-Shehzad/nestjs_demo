import { Injectable } from '@nestjs/common';
import { ValidatorFor } from '@/mediator/decorators/validator.decorator';
import { AbstractValidator } from '@/fluent-validation/abstract.validator';
import { GetBookmarkByIdQuery } from './get-bookmark-by-id.query';

/**
 * GetBookmarkByIdQueryValidator
 * Fluent validation for GetBookmarkByIdQuery
 * Generated on: 2025-10-10T17:23:18.554Z
 * Feature: Bookmark
 */
@Injectable()
@ValidatorFor(GetBookmarkByIdQuery)
export class GetBookmarkByIdQueryValidator extends AbstractValidator<GetBookmarkByIdQuery> {
  constructor() {
    super();

    // Add validation rules here
    // Example:
    // this.ruleFor((x) => x.id)
    //   .mustBeDefined()
    //   .mustBe((id) => id > 0)
    //   .withMessage('ID must be greater than 0');
  }
}
