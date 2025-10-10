import { Injectable } from '@nestjs/common';
import { ValidatorFor } from '@/mediator/decorators/validator.decorator';
import { AbstractValidator } from '@/fluent-validation/abstract.validator';
import { CreateOrderCommand } from './create-order.command';

/**
 * CreateOrderCommandValidator
 * Fluent validation for CreateOrderCommand
 * Generated on: 2025-10-10T16:53:01.699Z
 * Feature: Orders
 */
@Injectable()
@ValidatorFor(CreateOrderCommand)
export class CreateOrderCommandValidator extends AbstractValidator<CreateOrderCommand> {
  constructor() {
    super();

    // Add validation rules here
    // Example:
    // this.ruleFor((x) => x.name)
    //   .notEmpty()
    //   .withMessage('Name is required');
    //
    // this.ruleFor((x) => x.email)
    //   .notEmpty()
    //   .email()
    //   .withMessage('Valid email is required');
  }
}
