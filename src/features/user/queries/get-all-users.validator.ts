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

    // Add validation rules here
    // Example:
    // this.ruleFor((x) => x.id)
    //   .mustBeDefined()
    //   .mustBe((id) => id > 0)
    //   .withMessage('ID must be greater than 0');
  }
}
