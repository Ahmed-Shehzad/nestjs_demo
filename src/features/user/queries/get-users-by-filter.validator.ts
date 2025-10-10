import { Injectable } from '@nestjs/common';
import { ValidatorFor } from '@/mediator/decorators/validator.decorator';
import { AbstractValidator } from '@/fluent-validation/abstract.validator';
import { GetUsersByFilterQuery } from './get-users-by-filter.query';

/**
 * GetUsersByFilterQueryValidator
 * Fluent validation for GetUsersByFilterQuery
 * Generated on: 2025-10-10T17:23:10.905Z
 * Feature: User
 */
@Injectable()
@ValidatorFor(GetUsersByFilterQuery)
export class GetUsersByFilterQueryValidator extends AbstractValidator<GetUsersByFilterQuery> {
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
