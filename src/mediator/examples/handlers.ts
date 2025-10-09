import { Logger } from '@nestjs/common';
import {
  RequestHandler,
  CommandHandler,
  NotificationHandler,
} from '../decorators';
import {
  IRequestHandler,
  ICommandHandler,
  INotificationHandler,
} from '../interfaces';
import {
  GetUserByIdQuery,
  UserDto,
  CreateUserCommand,
  UserCreatedEvent,
} from './requests';

// Example Request Handler
@RequestHandler(GetUserByIdQuery)
export class GetUserByIdHandler
  implements IRequestHandler<GetUserByIdQuery, UserDto>
{
  private readonly logger = new Logger(GetUserByIdHandler.name);

  handle(query: GetUserByIdQuery): Promise<UserDto> {
    this.logger.log(`Handling GetUserByIdQuery for user ID: ${query.userId}`);

    // This is where you'd typically call your repository/service
    // For now, return mock data
    return Promise.resolve({
      id: query.userId,
      email: `user${query.userId}@example.com`,
      firstName: 'John',
      lastName: 'Doe',
    });
  }
}

// Example Command Handler
@CommandHandler(CreateUserCommand)
export class CreateUserHandler implements ICommandHandler<CreateUserCommand> {
  private readonly logger = new Logger(CreateUserHandler.name);

  handle(command: CreateUserCommand): Promise<void> {
    this.logger.log(`Handling CreateUserCommand for email: ${command.email}`);

    // This is where you'd typically save to database
    // For now, just log the action
    this.logger.log('User created successfully');
    return Promise.resolve();
  }
}

// Example Notification Handler 1
@NotificationHandler(UserCreatedEvent)
export class SendWelcomeEmailHandler
  implements INotificationHandler<UserCreatedEvent>
{
  private readonly logger = new Logger(SendWelcomeEmailHandler.name);

  handle(event: UserCreatedEvent): Promise<void> {
    this.logger.log(`Sending welcome email to user: ${event.email}`);

    // This is where you'd typically send an email
    // For now, just log the action
    this.logger.log(`Welcome email sent to ${event.email}`);
    return Promise.resolve();
  }
}

// Example Notification Handler 2
@NotificationHandler(UserCreatedEvent)
export class CreateUserProfileHandler
  implements INotificationHandler<UserCreatedEvent>
{
  private readonly logger = new Logger(CreateUserProfileHandler.name);

  handle(event: UserCreatedEvent): Promise<void> {
    this.logger.log(`Creating user profile for user ID: ${event.userId}`);

    // This is where you'd typically create additional user data
    // For now, just log the action
    this.logger.log(`User profile created for user ID: ${event.userId}`);
    return Promise.resolve();
  }
}
