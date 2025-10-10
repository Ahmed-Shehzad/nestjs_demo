import { AbstractValidator } from '@/fluent-validation/abstract.validator';
import { ValidatorFor } from '@/mediator/decorators/validator.decorator';
import { Injectable } from '@nestjs/common';
import { CreateUserCommand } from './create-user.command';

/**
 * CreateUserCommandValidator
 * Fluent validation for CreateUserCommand
 * Generated on: 2025-10-10T17:23:10.899Z
 * Feature: User
 */
@Injectable()
@ValidatorFor(CreateUserCommand)
export class CreateUserCommandValidator extends AbstractValidator<CreateUserCommand> {
  constructor() {
    super();

    this.ruleFor((x) => x.email)
      .mustBeDefined()
      .withMessage('Email is required')
      .mustBe((email) => /\S+@\S+\.\S+/.test(email))
      .withMessage('Email must be a valid email address');

    this.ruleFor((x) => x.password)
      .mustBeDefined()
      .withMessage('Password is required')
      .mustBe((password) => password.length >= 6)
      .withMessage('Password must be at least 6 characters long');

    this.ruleFor((x) => x.firstName)
      .mustBe((firstName) => !firstName || firstName.length > 0)
      .withMessage('First name cannot be empty string');

    this.ruleFor((x) => x.lastName)
      .mustBe((lastName) => !lastName || lastName.length > 0)
      .withMessage('Last name cannot be empty string');
  }
}
