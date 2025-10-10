import { Injectable } from '@nestjs/common';
import { ValidatorFor } from '@/mediator/decorators/validator.decorator';
import { AbstractValidator } from '@/fluent-validation/abstract.validator';
import { GetAllBookmarksQuery } from './get-all-bookmarks.query';

/**
 * GetAllBookmarksQueryValidator
 * Fluent validation for GetAllBookmarksQuery
 * Generated on: 2025-10-10T17:23:18.555Z
 * Feature: Bookmark
 */
@Injectable()
@ValidatorFor(GetAllBookmarksQuery)
export class GetAllBookmarksQueryValidator extends AbstractValidator<GetAllBookmarksQuery> {
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
