import { IRequest, IBaseRequest, INotification } from '../interfaces';

// Example Request (Query) - expects a response
export class GetUserByIdQuery implements IRequest<UserDto> {
  readonly _requestResponseType?: UserDto;

  constructor(public readonly userId: number) {}
}

export interface UserDto {
  id: number;
  email: string;
  firstName?: string;
  lastName?: string;
}

// Example Command - doesn't expect a response
export class CreateUserCommand implements IBaseRequest {
  readonly _isCommand?: true;

  constructor(
    public readonly email: string,
    public readonly firstName?: string,
    public readonly lastName?: string,
  ) {}
}

// Example Notification - can have multiple handlers
export class UserCreatedEvent implements INotification {
  readonly _isNotification?: true;

  constructor(
    public readonly userId: number,
    public readonly email: string,
    public readonly createdAt: Date,
  ) {}
}
