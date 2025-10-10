import { Injectable } from '@nestjs/common';
import { ValidatorFor } from '@/mediator/decorators/validator.decorator';
import { AbstractValidator } from '@/fluent-validation/abstract.validator';
import { GetBookmarksByFilterQuery } from './get-bookmarks-by-filter.query';

/**
 * GetBookmarksByFilterQueryValidator
 * Fluent validation for GetBookmarksByFilterQuery
 * Generated on: 2025-10-10T17:23:18.556Z
 * Feature: Bookmark
 */
@Injectable()
@ValidatorFor(GetBookmarksByFilterQuery)
export class GetBookmarksByFilterQueryValidator extends AbstractValidator<GetBookmarksByFilterQuery> {
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
