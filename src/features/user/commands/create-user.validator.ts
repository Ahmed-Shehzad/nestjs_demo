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

    // Email validation
    this.ruleFor((x) => x.email)
      .mustBeDefined()
      .withMessage('Email must be defined')
      .notEmpty()
      .withMessage('Email must be a non-empty string')
      .email()
      .withMessage('Email must be a valid email address');

    // Password validation
    this.ruleFor((x) => x.password)
      .mustBeDefined()
      .withMessage('Password must be defined')
      .notEmpty()
      .withMessage('Password must be a non-empty string')
      .mustBe((password) => !password || password.length >= 6)
      .withMessage('Password must be at least 6 characters long');

    this.ruleFor((x) => x.firstName)
      .mustBeDefined()
      .withMessage('First name must be defined')
      .notEmpty()
      .withMessage('First name must be a non-empty string')
      .mustBe((firstName) => !firstName || firstName.trim().length > 0)
      .withMessage('First name must be a valid name');

    this.ruleFor((x) => x.lastName)
      .mustBeDefined()
      .withMessage('Last name must be defined')
      .notEmpty()
      .withMessage('Last name must be a non-empty string')
      .mustBe((lastName) => !lastName || lastName.trim().length > 0)
      .withMessage('Last name must be a valid name');
  }
}
