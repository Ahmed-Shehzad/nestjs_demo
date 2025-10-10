import { Module } from '@nestjs/common';
import { MediatorModule } from '@/mediator/mediator.module';

// Query Handlers
import { GetAllUsersQueryHandler } from './queries/get-all-users.handler';
import { GetUserByIdQueryHandler } from './queries/get-user-by-id.handler';
import { GetUsersByFilterQueryHandler } from './queries/get-users-by-filter.handler';

// Command Handlers
import { CreateUserCommandHandler } from './commands/create-user.handler';
import { UpdateUserCommandHandler } from './commands/update-user.handler';
import { DeleteUserCommandHandler } from './commands/delete-user.handler';

// Domain Event Handlers
import { UserCreatedEventHandler } from './events/domain/user-created.handler';
import { UserUpdatedEventHandler } from './events/domain/user-updated.handler';
import { UserDeletedEventHandler } from './events/domain/user-deleted.handler';

// Validators
import { GetAllUsersQueryValidator } from './queries/get-all-users.validator';
import { GetUserByIdQueryValidator } from './queries/get-user-by-id.validator';
import { GetUsersByFilterQueryValidator } from './queries/get-users-by-filter.validator';
import { CreateUserCommandValidator } from './commands/create-user.validator';
import { UpdateUserCommandValidator } from './commands/update-user.validator';
import { DeleteUserCommandValidator } from './commands/delete-user.validator';

// Controllers
import { UsersController } from './user.controller';

/**
 * User Feature Module
 *
 * Contains all user-related functionality including:
 * - Query handlers for retrieving user data
 * - Command handlers for user operations
 * - Domain event handlers for user lifecycle events
 * - Validators for input validation
 * - Controllers for HTTP endpoints
 */
@Module({
  imports: [MediatorModule],
  controllers: [UsersController],
  providers: [
    // Query Handlers
    GetAllUsersQueryHandler,
    GetUserByIdQueryHandler,
    GetUsersByFilterQueryHandler,

    // Command Handlers
    CreateUserCommandHandler,
    UpdateUserCommandHandler,
    DeleteUserCommandHandler,

    // Domain Event Handlers
    UserCreatedEventHandler,
    UserUpdatedEventHandler,
    UserDeletedEventHandler,

    // Validators
    GetAllUsersQueryValidator,
    GetUserByIdQueryValidator,
    GetUsersByFilterQueryValidator,
    CreateUserCommandValidator,
    UpdateUserCommandValidator,
    DeleteUserCommandValidator,
  ],
  exports: [
    // Export handlers so they can be used by other modules if needed
    GetAllUsersQueryHandler,
    GetUserByIdQueryHandler,
    GetUsersByFilterQueryHandler,
    CreateUserCommandHandler,
    UpdateUserCommandHandler,
    DeleteUserCommandHandler,
  ],
})
export class UserModule {}
