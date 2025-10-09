# NestJS MediatR-like Implementation

A TypeScript implementation of the MediatR pattern for NestJS, inspired by the popular C# library.

## Features

- **Request/Response pattern**: Send requests and get responses back
- **Command pattern**: Send commands without expecting responses
- **Notification pattern**: Publish notifications to multiple handlers
- **Automatic handler discovery**: Handlers are automatically registered using decorators
- **Type safety**: Full TypeScript support with generic types
- **Dependency injection**: Integrates seamlessly with NestJS DI container

## Installation

1. Copy the `mediator` folder to your `src` directory
2. Import `MediatorModule` in your `AppModule`:

```typescript
import { Module } from '@nestjs/common';
import { MediatorModule } from './mediator';

@Module({
  imports: [MediatorModule],
  // ... other module configuration
})
export class AppModule {}
```

## Usage

### 1. Requests (Queries)

Requests expect a response back:

```typescript
// Define your request
export class GetUserByIdQuery implements IRequest<UserDto> {
  readonly _requestResponseType?: UserDto;

  constructor(public readonly userId: number) {}
}

// Define your handler
@RequestHandler(GetUserByIdQuery)
export class GetUserByIdHandler
  implements IRequestHandler<GetUserByIdQuery, UserDto>
{
  async handle(query: GetUserByIdQuery): Promise<UserDto> {
    // Your business logic here
    return await this.userRepository.findById(query.userId);
  }
}

// Use in your controller/service
@Controller('users')
export class UsersController {
  constructor(private readonly mediator: MediatorService) {}

  @Get(':id')
  async getUser(@Param('id') id: number): Promise<UserDto> {
    const query = new GetUserByIdQuery(id);
    return await this.mediator.send(query);
  }
}
```

### 2. Commands

Commands don't expect a response:

```typescript
// Define your command
export class CreateUserCommand implements IBaseRequest {
  readonly _isCommand?: true;

  constructor(
    public readonly email: string,
    public readonly firstName?: string,
    public readonly lastName?: string,
  ) {}
}

// Define your handler
@CommandHandler(CreateUserCommand)
export class CreateUserHandler implements ICommandHandler<CreateUserCommand> {
  async handle(command: CreateUserCommand): Promise<void> {
    // Your business logic here
    await this.userRepository.create(command);
  }
}

// Use in your controller/service
@Post()
async createUser(@Body() dto: CreateUserDto): Promise<void> {
  const command = new CreateUserCommand(dto.email, dto.firstName, dto.lastName);
  await this.mediator.send(command);
}
```

### 3. Notifications (Events)

Notifications can have multiple handlers:

```typescript
// Define your notification
export class UserCreatedEvent implements INotification {
  readonly _isNotification?: true;

  constructor(
    public readonly userId: number,
    public readonly email: string,
    public readonly createdAt: Date,
  ) {}
}

// Define multiple handlers
@NotificationHandler(UserCreatedEvent)
export class SendWelcomeEmailHandler
  implements INotificationHandler<UserCreatedEvent>
{
  async handle(event: UserCreatedEvent): Promise<void> {
    await this.emailService.sendWelcomeEmail(event.email);
  }
}

@NotificationHandler(UserCreatedEvent)
export class CreateUserProfileHandler
  implements INotificationHandler<UserCreatedEvent>
{
  async handle(event: UserCreatedEvent): Promise<void> {
    await this.profileService.createProfile(event.userId);
  }
}

// Publish the notification
const event = new UserCreatedEvent(user.id, user.email, new Date());
await this.mediator.publish(event);
```

## Handler Registration

Handlers are automatically discovered and registered when the application starts. Make sure your handler classes are:

1. Decorated with the appropriate decorator (`@RequestHandler`, `@CommandHandler`, `@NotificationHandler`)
2. Included in a module's `providers` array or globally available
3. Implement the correct interface (`IRequestHandler`, `ICommandHandler`, `INotificationHandler`)

## Benefits

- **Separation of concerns**: Business logic is separated from controllers
- **Single responsibility**: Each handler has one specific responsibility
- **Testability**: Easy to unit test individual handlers
- **Loose coupling**: Controllers don't need to know about specific services
- **Cross-cutting concerns**: Easy to add logging, validation, caching, etc.

## Advanced Usage

### Pipeline Behaviors (Future Enhancement)

You can extend this implementation to add pipeline behaviors for cross-cutting concerns:

- Logging
- Validation
- Caching
- Authorization
- Performance monitoring
- Exception handling

### Custom Error Handling

Add try-catch blocks in your handlers to handle specific business errors:

```typescript
@RequestHandler(GetUserByIdQuery)
export class GetUserByIdHandler
  implements IRequestHandler<GetUserByIdQuery, UserDto>
{
  async handle(query: GetUserByIdQuery): Promise<UserDto> {
    const user = await this.userRepository.findById(query.userId);

    if (!user) {
      throw new NotFoundException(`User with ID ${query.userId} not found`);
    }

    return user;
  }
}
```

## Comparison with C# MediatR

This implementation follows the same patterns as C# MediatR:

| Feature              | C# MediatR             | This Implementation    |
| -------------------- | ---------------------- | ---------------------- |
| Request/Response     | `IRequest<T>`          | `IRequest<T>`          |
| Commands             | `IRequest`             | `IBaseRequest`         |
| Notifications        | `INotification`        | `INotification`        |
| Handler Registration | `IRequestHandler<T,R>` | `IRequestHandler<T,R>` |
| Dependency Injection | Built-in               | NestJS DI              |
| Pipeline Behaviors   | ✅                     | 🔄 (Future)            |
| Async/Await          | ✅                     | ✅                     |

## Examples

See the `examples` folder for complete usage examples including:

- Query handlers
- Command handlers
- Notification handlers
- Integration with controllers
