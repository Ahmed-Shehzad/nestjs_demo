# Notification Handling with Decorators

This documentation describes the comprehensive notification handling system implemented in the NestJS CQRS mediator pattern with decorator support.

## Overview

The notification handling system provides a robust way to handle domain events using the decorator pattern. Multiple handlers can be registered for the same notification type, and they execute in parallel with error isolation.

## Key Components

### 1. INotification Interface

```typescript
export type INotification = object;
```

Base interface that all notifications must implement. Keeps it simple and flexible.

### 2. NotificationHandler Decorator

```typescript
@NotificationHandler(NotificationType)
```

Decorator that marks a class as a notification handler for a specific notification type. The decorator:

- Uses metadata reflection to store the notification type
- Enables automatic discovery by the mediator system
- Supports multiple handlers per notification type

### 3. NotificationPublisher Service

The `NotificationPublisher` service is responsible for:

- Publishing notifications to all registered handlers
- Executing handlers in parallel for better performance
- Providing error isolation (one handler failure doesn't stop others)
- Logging execution details and errors

### 4. MediatorDiscoveryService Enhancement

Enhanced to support notification handler discovery:

- Scans for classes decorated with `@NotificationHandler`
- Maintains a map of notification types to their handlers
- Integrates with the existing handler discovery system

## Usage Examples

### 1. Define a Notification

```typescript
export class UserRegisteredEvent implements INotification {
  constructor(
    public readonly userId: string,
    public readonly email: string,
    public readonly registeredAt: Date,
  ) {}
}
```

### 2. Create Notification Handlers

```typescript
@Injectable()
@NotificationHandler(UserRegisteredEvent)
export class SendWelcomeEmailHandler implements INotificationHandler<UserRegisteredEvent> {
  async handleAsync(notification: UserRegisteredEvent): Promise<void> {
    console.log(`Sending welcome email to ${notification.email}`);
    // Email sending logic here
  }
}

@Injectable()
@NotificationHandler(UserRegisteredEvent)
export class TrackUserRegistrationHandler implements INotificationHandler<UserRegisteredEvent> {
  async handleAsync(notification: UserRegisteredEvent): Promise<void> {
    console.log(`Tracking registration for user ${notification.userId}`);
    // Analytics tracking logic here
  }
}
```

### 3. Publish Notifications

```typescript
@Injectable()
export class UserService {
  constructor(private readonly notificationPublisher: NotificationPublisher) {}

  async registerUser(email: string): Promise<string> {
    const userId = `user-${Date.now()}`;

    // Create and publish domain event
    const event = new UserRegisteredEvent(userId, email, new Date());
    await this.notificationPublisher.publish(event);

    return userId;
  }
}
```

## Code Generator Integration

### Domain Event Handler Template

The domain event handler template (`domain-event-handler.template.txt`) includes:

```typescript
import { Injectable } from '@nestjs/common';
import { INotificationHandler, NotificationHandler } from '@/lib/mediator';
import { {{EVENT_NAME}} } from '../events/{{EVENT_FILE_NAME}}';

@Injectable()
@NotificationHandler({{EVENT_NAME}})
export class {{HANDLER_NAME}} implements INotificationHandler<{{EVENT_NAME}}> {
  async handleAsync(event: {{EVENT_NAME}}): Promise<void> {
    // TODO: Implement {{HANDLER_NAME}} logic
    console.log('Handling {{EVENT_NAME}}:', event);
  }
}
```

## Features

### Parallel Execution

All handlers for a notification execute in parallel using `Promise.allSettled()`, ensuring:

- Better performance than sequential execution
- Error isolation between handlers
- All handlers attempt execution even if some fail

### Error Handling

Comprehensive error handling includes:

- Individual handler error logging
- Continuation of other handlers on failure
- Detailed error context and stack traces
- Non-blocking error handling

### Logging

Built-in logging provides:

- Notification publishing start/completion logs
- Handler execution tracking
- Error details with full context
- Debug-level handler completion logs

### Type Safety

Strong TypeScript support with:

- Generic type constraints for notifications
- Type-safe handler interfaces
- Compile-time validation of handler signatures
- IntelliSense support for notification properties

## Integration with Existing Systems

### Mediator Module

The notification system integrates seamlessly with the existing mediator module:

```typescript
@Module({
  providers: [
    MediatorDiscoveryService,
    NotificationPublisher, // ← Added notification support
    // ... other providers
  ],
  exports: [
    MediatorDiscoveryService,
    NotificationPublisher, // ← Export for use in other modules
    // ... other exports
  ],
})
export class MediatorModule {}
```

### Pipeline Behaviors

The notification system works alongside existing pipeline behaviors:

- Logging behavior for request/response tracking
- Telemetry behavior for performance monitoring
- Validation behavior for input validation

### Fluent Validation

Integrates with the fluent validation system for notification validation if needed.

## Best Practices

### 1. Notification Naming

- Use descriptive, past-tense names (e.g., `UserRegisteredEvent`, `OrderCompletedEvent`)
- Include relevant context in the notification data
- Keep notifications immutable

### 2. Handler Design

- Keep handlers focused on a single responsibility
- Make handlers idempotent when possible
- Use dependency injection for required services
- Handle errors gracefully

### 3. Performance Considerations

- Avoid long-running operations in handlers
- Consider using background jobs for heavy processing
- Use appropriate logging levels to avoid performance impact
- Monitor handler execution times

### 4. Error Handling

- Log errors with sufficient context
- Don't let handler errors prevent other handlers from executing
- Consider retry mechanisms for transient failures
- Use circuit breakers for external service calls

## Testing

### Unit Testing Handlers

```typescript
describe('SendWelcomeEmailHandler', () => {
  let handler: SendWelcomeEmailHandler;

  beforeEach(() => {
    handler = new SendWelcomeEmailHandler();
  });

  it('should handle user registration event', async () => {
    const event = new UserRegisteredEvent('user-1', 'test@example.com', new Date());

    await expect(handler.handleAsync(event)).resolves.not.toThrow();
  });
});
```

### Integration Testing

```typescript
describe('NotificationPublisher', () => {
  let publisher: NotificationPublisher;
  let discoveryService: MediatorDiscoveryService;

  beforeEach(async () => {
    const module = await Test.createTestingModule({
      providers: [NotificationPublisher, MediatorDiscoveryService],
    }).compile();

    publisher = module.get<NotificationPublisher>(NotificationPublisher);
  });

  it('should publish notifications to all handlers', async () => {
    const event = new UserRegisteredEvent('user-1', 'test@example.com', new Date());

    await expect(publisher.publish(event)).resolves.not.toThrow();
  });
});
```

## Conclusion

The notification handling system provides a powerful, scalable, and type-safe way to implement domain events in NestJS applications. With decorator-based registration, automatic discovery, parallel execution, and comprehensive error handling, it offers enterprise-grade event handling capabilities while maintaining clean, maintainable code.

The system integrates seamlessly with the existing CQRS mediator pattern and enhances the code generator templates to produce production-ready notification handlers with minimal configuration.
