import { Injectable } from '@nestjs/common';
import { ValidatorFor } from '@/mediator/decorators/validator.decorator';
import { AbstractValidator } from '@/fluent-validation/abstract.validator';
import { GetUserByIdQuery } from './get-user-by-id.query';

/**
 * GetUserByIdQueryValidator
 * Fluent validation for GetUserByIdQuery
 * Generated on: 2025-10-10T17:23:10.902Z
 * Feature: User
 */
@Injectable()
@ValidatorFor(GetUserByIdQuery)
export class GetUserByIdQueryValidator extends AbstractValidator<GetUserByIdQuery> {
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
