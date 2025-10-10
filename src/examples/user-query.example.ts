import { Injectable } from '@nestjs/common';
import { IQuery, IQueryHandler } from '../lib/mediator/types/request';
import { AbstractValidator } from '../lib/fluent-validation/abstract.validator';
import { RequestHandler } from '../lib/mediator/decorators/request-handler.decorator';
import { ValidatorFor } from '../lib/mediator/decorators/validator.decorator';

// Example Response DTO
export class UserDto {
  constructor(
    public readonly id: number,
    public readonly name: string,
    public readonly email: string,
  ) {}
}

// Example Query
export class GetUserByIdQuery implements IQuery<UserDto> {
  constructor(public readonly userId: number) {}
}

// Example Validator using Fluent Validation
@Injectable()
@ValidatorFor(GetUserByIdQuery)
export class GetUserByIdQueryValidator extends AbstractValidator<GetUserByIdQuery> {
  constructor() {
    super();
    this.ruleFor((x) => x.userId)
      .mustBeDefined()
      .mustBe((id) => id > 0)
      .withMessage('User ID must be greater than 0');
  }
}

// Example Query Handler
@Injectable()
@RequestHandler(GetUserByIdQuery)
export class GetUserByIdQueryHandler implements IQueryHandler<GetUserByIdQuery, UserDto> {
  async handleAsync(query: GetUserByIdQuery): Promise<UserDto> {
    // Simulate database call
    console.log(`Fetching user with ID: ${query.userId}`);
    await new Promise((resolve) => setTimeout(resolve, 10));

    return new UserDto(query.userId, `User ${query.userId}`, `user${query.userId}@example.com`);
  }
}
