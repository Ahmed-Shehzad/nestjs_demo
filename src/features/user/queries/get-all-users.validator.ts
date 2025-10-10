import { Injectable } from '@nestjs/common';
import { ValidatorFor } from '@/mediator/decorators/validator.decorator';
import { AbstractValidator } from '@/fluent-validation/abstract.validator';
import { GetAllUsersQuery } from './get-all-users.query';

/**
 * GetAllUsersQueryValidator
 * Fluent validation for GetAllUsersQuery
 * Generated on: 2025-10-10T17:23:10.903Z
 * Feature: User
 */
@Injectable()
@ValidatorFor(GetAllUsersQuery)
export class GetAllUsersQueryValidator extends AbstractValidator<GetAllUsersQuery> {
  constructor() {
    super();

    // Validation rules for pagination parameters
    this.ruleFor((x) => x.page)
      .mustBeDefined()
      .withMessage('Page number is required')
      .mustBe((page) => page >= 1)
      .withMessage('Page number must be greater than or equal to 1')
      .mustBe((page) => page <= 1000)
      .withMessage('Page number must not exceed 1000');

    this.ruleFor((x) => x.limit)
      .mustBeDefined()
      .withMessage('Limit is required')
      .mustBe((limit) => limit >= 1)
      .withMessage('Limit must be greater than or equal to 1')
      .mustBe((limit) => limit <= 100)
      .withMessage('Limit must not exceed 100 items per page');

    this.ruleFor((x) => x.baseUrl)
      .mustBeDefined()
      .withMessage('Base URL is required')
      .mustBe((url) => url.trim().length > 0)
      .withMessage('Base URL cannot be empty');
  }
}
