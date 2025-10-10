import { Injectable } from '@nestjs/common';
import { ValidatorFor } from '@/mediator/decorators/validator.decorator';
import { AbstractValidator } from '@/fluent-validation/abstract.validator';
import { GetOrderStatusQuery } from './get-order-status.query';

/**
 * GetOrderStatusQueryValidator
 * Fluent validation for GetOrderStatusQuery
 * Generated on: 2025-10-10T16:54:28.718Z
 * Feature: Orders
 */
@Injectable()
@ValidatorFor(GetOrderStatusQuery)
export class GetOrderStatusQueryValidator extends AbstractValidator<GetOrderStatusQuery> {
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
