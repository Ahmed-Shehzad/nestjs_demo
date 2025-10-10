import { Injectable } from '@nestjs/common';
import { ValidatorFor } from '@/mediator/decorators/validator.decorator';
import { AbstractValidator } from '@/fluent-validation/abstract.validator';
import { GetProductDetailsQuery } from './get-product-details.query';

/**
 * GetProductDetailsQueryValidator
 * Fluent validation for GetProductDetailsQuery
 * Generated on: 2025-10-10T17:03:00.140Z
 * Feature: Products
 */
@Injectable()
@ValidatorFor(GetProductDetailsQuery)
export class GetProductDetailsQueryValidator extends AbstractValidator<GetProductDetailsQuery> {
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
