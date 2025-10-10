import { Injectable } from '@nestjs/common';
import { ValidatorFor } from '@/mediator/decorators/validator.decorator';
import { AbstractValidator } from '@/fluent-validation/abstract.validator';
import { GetUserProfileQuery } from './get-user-profile.query';

/**
 * GetUserProfileQueryValidator
 * Fluent validation for GetUserProfileQuery
 * Generated on: 2025-10-10T16:50:36.287Z
 * Feature: UserManagement
 */
@Injectable()
@ValidatorFor(GetUserProfileQuery)
export class GetUserProfileQueryValidator extends AbstractValidator<GetUserProfileQuery> {
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
