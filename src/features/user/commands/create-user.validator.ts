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
      .withMessage('Email must be a valid email address')
      .mustBe((email) => !email || email.length <= 200)
      .withMessage('Email must not exceed 200 characters');

    // Password validation
    this.ruleFor((x) => x.password)
      .mustBeDefined()
      .withMessage('Password must be defined')
      .notEmpty()
      .withMessage('Password must be a non-empty string')
      .mustBe((password) => !password || password.length >= 6)
      .withMessage('Password must be at least 6 characters long')
      .mustBe((password) => !password || password.length <= 128)
      .withMessage('Password must not exceed 128 characters');

    // firstName validation - optional
    this.ruleFor((x) => x.firstName)
      .mustBe(
        (firstName) =>
          firstName === null ||
          firstName === undefined ||
          (typeof firstName === 'string' && firstName.trim().length > 0 && firstName.length <= 100),
      )
      .withMessage('First name must be null, undefined, or a valid string (max 100 characters)');

    // lastName validation - optional
    this.ruleFor((x) => x.lastName)
      .mustBe(
        (lastName) =>
          lastName === null ||
          lastName === undefined ||
          (typeof lastName === 'string' && lastName.trim().length > 0 && lastName.length <= 100),
      )
      .withMessage('Last name must be null, undefined, or a valid string (max 100 characters)');
  }
}
