# Modular NestJS Architecture

## Overview

The application has been refactored into a clean, modular architecture where each feature is organized as a separate NestJS module. This approach provides better separation of concerns, easier testing, and improved maintainability.

## Architecture Structure

```
src/
├── core/                    # Core infrastructure module
│   └── core.module.ts      # Global shared services (PrismaClient)
├── features/               # Feature modules
│   ├── user/              # User feature module
│   │   ├── commands/      # User command handlers
│   │   ├── queries/       # User query handlers
│   │   ├── events/        # User domain events
│   │   ├── user.controller.ts  # User REST endpoints
│   │   └── user.module.ts      # User module definition
│   └── bookmark/          # Bookmark feature module
│       ├── commands/      # Bookmark command handlers
│       ├── queries/       # Bookmark query handlers
│       ├── events/        # Bookmark domain events
│       ├── bookmark.controller.ts  # Bookmark REST endpoints
│       └── bookmark.module.ts      # Bookmark module definition
├── mediator/              # CQRS mediator infrastructure
└── app.module.ts          # Main application module
```

## Module Responsibilities

### Core Module (`@Global()`)

- **Purpose**: Provides shared infrastructure services
- **Services**: PrismaClient database connection
- **Scope**: Global - automatically available to all modules
- **Benefits**: Single database connection instance, centralized configuration

### Feature Modules (User, Bookmark)

- **Purpose**: Encapsulate domain-specific functionality
- **Components**: Controllers, Handlers, Validators, Events
- **Isolation**: Self-contained with clear boundaries
- **Benefits**: Independent deployment, focused testing, team ownership

### Mediator Module

- **Purpose**: CQRS infrastructure and validation
- **Services**: Request/response mediation, FluentValidation
- **Scope**: Imported by features that need CQRS
- **Benefits**: Decoupled command/query handling

## Module Registration

All feature modules are registered in the main `AppModule`:

```typescript
@Module({
  imports: [
    CoreModule, // Global infrastructure
    MediatorModule, // CQRS infrastructure
    UserModule, // User feature
    BookmarkModule, // Bookmark feature
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
```

## Feature Module Structure

Each feature module follows a consistent structure:

```typescript
@Module({
  controllers: [FeatureController],
  providers: [
    // Query Handlers
    GetAllItemsQueryHandler,
    GetItemByIdQueryHandler,

    // Command Handlers
    CreateItemCommandHandler,
    UpdateItemCommandHandler,
    DeleteItemCommandHandler,

    // Domain Event Handlers
    ItemCreatedEventHandler,
    ItemUpdatedEventHandler,

    // Validators
    GetAllItemsQueryValidator,
    CreateItemCommandValidator,
    // ... other validators
  ],
  exports: [
    // Export handlers for cross-module usage
  ],
})
export class FeatureModule {}
```

## Benefits of This Architecture

### 1. **Separation of Concerns**

- Each module has a single responsibility
- Clear boundaries between features
- Reduced coupling between components

### 2. **Scalability**

- Features can be developed independently
- Teams can own specific modules
- Easy to add new features without affecting existing ones

### 3. **Testability**

- Modules can be tested in isolation
- Easy to mock dependencies
- Unit tests are more focused

### 4. **Maintainability**

- Changes are localized to specific modules
- Easier to understand and navigate codebase
- Consistent structure across features

### 5. **Deployment Flexibility**

- Potential for micro-service extraction
- Selective feature deployment
- Better CI/CD pipelines

## API Endpoints

### User Endpoints

- `GET /api/users` - Get all users (paginated with HATEOAS)
- `GET /api/users/:id` - Get user by ID
- Additional CRUD endpoints (TODO)

### Bookmark Endpoints

- `GET /api/bookmarks` - Get all bookmarks (paginated)
- `GET /api/bookmarks/:id` - Get bookmark by ID
- Additional CRUD endpoints (TODO)

## Database Access

- **Global PrismaClient**: Single instance shared across all modules
- **Type Safety**: Full TypeScript support with Prisma types
- **Query Optimization**: Parallel queries, field selection
- **Connection Management**: Automatic connection pooling

## Next Steps

1. **Complete CRUD Operations**: Implement POST, PUT, DELETE endpoints
2. **Authentication**: Add JWT authentication module
3. **Authorization**: Implement role-based access control
4. **Caching**: Add Redis caching module
5. **Logging**: Structured logging module
6. **Health Checks**: Application health monitoring
7. **API Documentation**: OpenAPI/Swagger integration

This modular architecture provides a solid foundation for scaling the application while maintaining code quality and developer productivity.
