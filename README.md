# 🚀 NestJS Enterprise CQRS API

A production-ready NestJS application implementing **Clean Architecture**, **CQRS**, and **Domain-Driven Design** patterns with custom libraries for enterprise-grade development.

## 📋 Table of Contents

- [Features](#-features)
- [Architecture](#-architecture)
- [Quick Start](#-quick-start)
- [Project Structure](#-project-structure)
- [API Documentation](#-api-documentation)
- [Development](#-development)
- [Testing](#-testing)
- [Deployment](#-deployment)
- [Contributing](#-contributing)

## ✨ Features

### 🏗️ **Architecture & Patterns**

- **CQRS (Command Query Responsibility Segregation)** - Complete separation of read/write operations
- **Mediator Pattern** - Decoupled request/response handling with pipeline behaviors
- **Clean Architecture** - Domain-driven design with clear layer separation
- **Repository Pattern** - Data access abstraction via Prisma ORM

### 🔧 **Custom Libraries**

- **Fluent Validation** - Type-safe, chainable validation rules
- **HATEOAS Support** - RFC-compliant hypermedia APIs
- **Problem Details** - RFC 7807 standardized error responses
- **Fluent Results** - Railway-oriented programming for error handling
- **Pipeline Behaviors** - Logging, validation, and telemetry

### 🛠️ **Developer Experience**

- **Code Generators** - Automated CQRS component generation
- **TypeScript** - Full type safety throughout the application
- **Hot Reload** - Development server with watch mode
- **Debug Support** - VS Code debugging configuration
- **Docker Integration** - Containerized PostgreSQL databases

### 🔒 **Production Ready**

- **Global Exception Handling** - Consistent error responses
- **Connection Pooling** - Optimized database connections
- **Health Checks** - Application and database monitoring
- **Structured Logging** - Request/response logging with timing
- **OpenTelemetry** - Distributed tracing support

## 🏛️ Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                    HTTP Layer (Controllers)                 │
├─────────────────────────────────────────────────────────────┤
│                     Application Layer                       │
│  ┌─────────────┐    ┌─────────────┐    ┌─────────────┐     │
│  │   Commands  │    │   Queries   │    │   Events    │     │
│  └─────────────┘    └─────────────┘    └─────────────┘     │
├─────────────────────────────────────────────────────────────┤
│                    Mediator Pipeline                        │
│     Logging → Validation → Telemetry → Handler             │
├─────────────────────────────────────────────────────────────┤
│                     Domain Layer                            │
│  ┌─────────────┐    ┌─────────────┐    ┌─────────────┐     │
│  │  Entities   │    │ Validators  │    │  Services   │     │
│  └─────────────┘    └─────────────┘    └─────────────┘     │
├─────────────────────────────────────────────────────────────┤
│                 Infrastructure Layer                        │
│           Prisma ORM → PostgreSQL Database                  │
└─────────────────────────────────────────────────────────────┘
```

### Pipeline Behaviors

```
Request → Logging → Validation → Telemetry → Handler → Response
    ↓         ↓           ↓           ↓         ↓
  Start    Validate   Performance  Business   Result
  Timer    Input      Tracking     Logic     Logging
```

## 🚀 Quick Start

### Prerequisites

- **Node.js** 18+
- **Docker** & Docker Compose
- **PostgreSQL** (via Docker)

### Installation

1. **Clone the repository**

   ```bash
   git clone https://github.com/Ahmed-Shehzad/nestjs_demo.git
   cd nestjs_demo
   ```

2. **Install dependencies**

   ```bash
   npm install
   ```

3. **Setup environment**

   ```bash
   # Copy environment template
   cp .env.example .env

   # Configure DATABASE_URL in .env
   DATABASE_URL="postgresql://postgres:123@localhost:5434/nest"
   ```

4. **Start databases**

   ```bash
   # Start development database
   npm run db:dev:up

   # Run migrations
   npm run prisma:dev:deploy
   ```

5. **Start development server**
   ```bash
   npm run start:dev
   ```

The API will be available at `http://localhost:3000`

## 📁 Project Structure

```
src/
├── core/                          # 🌍 Global infrastructure
│   ├── core.module.ts            # Global module registration
│   └── prisma.service.ts         # Database service
├── features/                      # 🎯 Domain features
│   ├── user/                     # User domain
│   │   ├── commands/             # Write operations
│   │   │   ├── create-user.command.ts
│   │   │   ├── create-user.handler.ts
│   │   │   └── create-user.validator.ts
│   │   ├── queries/              # Read operations
│   │   │   ├── get-all-users.query.ts
│   │   │   ├── get-all-users.handler.ts
│   │   │   ├── get-all-users.dto.ts
│   │   │   └── get-all-users.validator.ts
│   │   ├── events/               # Domain events
│   │   ├── services/             # Domain services
│   │   ├── user.controller.ts    # HTTP endpoints
│   │   └── user.module.ts        # Feature module
│   └── bookmark/                 # Bookmark domain
├── lib/                          # 📚 Custom libraries
│   ├── mediator/                 # CQRS mediator
│   │   ├── services/
│   │   ├── behaviors/            # Pipeline behaviors
│   │   ├── decorators/           # Handler decorators
│   │   └── types/               # Type definitions
│   ├── fluent-validation/        # Validation system
│   ├── hateoas/                  # Hypermedia APIs
│   ├── problem-details/          # Error handling
│   └── fluent-results/           # Result patterns
├── examples/                     # 📖 Usage examples
├── app.module.ts                 # Root module
└── main.ts                      # Application bootstrap

scripts/generators/               # 🔧 Code generators
├── templates/                   # Code templates
├── generator.ts                 # Main generator
└── cli.ts                      # CLI interface

prisma/
├── schema.prisma               # Database schema
└── migrations/                 # Migration history
```

## 📖 API Documentation

### User Endpoints

#### Get All Users (Paginated)

```http
GET /api/users?page=1&limit=10
```

**Response:**

```json
{
  "data": [
    {
      "id": 1,
      "email": "user@example.com",
      "firstName": "John",
      "lastName": "Doe",
      "createdAt": "2025-10-11T...",
      "updatedAt": "2025-10-11T...",
      "bookmarksCount": 5
    }
  ],
  "meta": {
    "currentPage": 1,
    "totalPages": 3,
    "totalItems": 25,
    "itemsPerPage": 10,
    "hasNextPage": true,
    "hasPreviousPage": false
  },
  "links": [
    { "href": "/api/users?page=1&limit=10", "rel": "self", "method": "GET" },
    { "href": "/api/users?page=2&limit=10", "rel": "next", "method": "GET" },
    { "href": "/api/users?page=3&limit=10", "rel": "last", "method": "GET" },
    { "href": "/api/users", "rel": "create", "method": "POST" }
  ]
}
```

#### Create User

```http
POST /api/users
Content-Type: application/json

{
  "email": "user@example.com",
  "firstName": "John",
  "lastName": "Doe",
  "password": "securepassword123"
}
```

**Response:**

```json
{
  "id": 1,
  "success": true,
  "message": "User created successfully",
  "createdAt": "2025-10-11T..."
}
```

### Error Responses (RFC 7807)

```json
{
  "type": "https://example.com/problems/validation-error",
  "title": "Validation Error",
  "status": 400,
  "detail": "The request contains invalid data",
  "instance": "/api/users",
  "timestamp": "2025-10-11T...",
  "traceId": "req_123456789",
  "errors": [
    {
      "field": "email",
      "message": "Email must be a valid email address"
    }
  ]
}
```

## 🛠️ Development

### Available Scripts

```bash
# Development
npm run start:dev          # Start with hot reload
npm run start:debug        # Start in debug mode

# Database
npm run db:dev:up          # Start dev database
npm run db:dev:restart     # Restart dev database
npm run prisma:dev:deploy  # Run migrations

# Code Generation
npm run gen                # Show generator help
npm run gen:q              # Generate query + handler + validator + DTO
npm run gen:c              # Generate command + handler + validator
npm run gen:de             # Generate domain event + handler

# Testing
npm run test               # Unit tests
npm run test:e2e          # End-to-end tests
npm run test:cov          # Test coverage

# Production
npm run build             # Build for production
npm run start:prod        # Start production server
```

### Code Generation

Generate complete CQRS components automatically:

```bash
# Generate a new query
npm run gen:q
? Enter the name: GetUserProfile
? Enter the feature name: User

# Creates:
# - get-user-profile.query.ts
# - get-user-profile.handler.ts
# - get-user-profile.validator.ts
# - get-user-profile.dto.ts
```

### CQRS Pattern Usage

#### Creating a Query

```typescript
// 1. Define Query
export class GetUserByIdQuery implements IQuery<UserDto> {
  constructor(public readonly userId: string) {}
}

// 2. Create Handler
@Injectable()
@RequestHandler(GetUserByIdQuery)
export class GetUserByIdHandler implements IQueryHandler<GetUserByIdQuery, UserDto> {
  constructor(private readonly prisma: PrismaClient) {}

  async handleAsync(query: GetUserByIdQuery): Promise<UserDto> {
    const user = await this.prisma.user.findUnique({
      where: { id: parseInt(query.userId) }
    });
    return new UserDto(user);
  }
}

// 3. Add Validation
@Injectable()
@ValidatorFor(GetUserByIdQuery)
export class GetUserByIdValidator extends AbstractValidator<GetUserByIdQuery> {
  constructor() {
    super();
    this.ruleFor(x => x.userId)
      .mustBeDefined()
      .mustBe(id => !isNaN(parseInt(id)))
      .withMessage('User ID must be a valid number');
  }
}

// 4. Use in Controller
@Get(':id')
async getUser(@Param('id') id: string): Promise<UserDto> {
  const query = new GetUserByIdQuery(id);
  return await this.mediator.sendAsync(query);
}
```

### Environment Configuration

Create `.env` file:

```bash
# Database
DATABASE_URL="postgresql://postgres:123@localhost:5434/nest?schema=public&connection_limit=10&pool_timeout=20&connect_timeout=60"

# Application
PORT=3000
NODE_ENV=development

# Test Database
TEST_DATABASE_URL="postgresql://postgres:123@localhost:5435/nest"
```

## 🧪 Testing

### Unit Tests

```bash
npm run test
npm run test:watch
npm run test:cov
```

### E2E Tests

```bash
npm run test:e2e
```

### Test Structure

```typescript
describe('GetAllUsersHandler', () => {
  let handler: GetAllUsersHandler;
  let prisma: PrismaClient;

  beforeEach(async () => {
    const module = await Test.createTestingModule({
      providers: [GetAllUsersHandler, PrismaService],
    }).compile();

    handler = module.get(GetAllUsersHandler);
    prisma = module.get(PrismaClient);
  });

  it('should return paginated users', async () => {
    const query = new GetAllUsersQuery(1, 10, '/api/users');
    const result = await handler.handleAsync(query);

    expect(result).toBeInstanceOf(GetAllUsersDto);
    expect(result.data).toBeDefined();
    expect(result.meta.currentPage).toBe(1);
  });
});
```

## 🐳 Deployment

### Docker Production Build

```dockerfile
FROM node:18-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production

FROM node:18-alpine AS production
WORKDIR /app
COPY --from=builder /app/node_modules ./node_modules
COPY . .
RUN npm run build
EXPOSE 3000
CMD ["npm", "run", "start:prod"]
```

### Environment Variables

```bash
# Production environment
NODE_ENV=production
DATABASE_URL="postgresql://user:pass@host:5432/db"
PORT=3000
```

## 🤝 Contributing

### Development Workflow

1. **Fork the repository**
2. **Create feature branch**: `git checkout -b feature/amazing-feature`
3. **Generate code**: Use `npm run gen:*` for consistent structure
4. **Write tests**: Follow existing test patterns
5. **Commit changes**: Use conventional commits
6. **Push to branch**: `git push origin feature/amazing-feature`
7. **Open Pull Request**

### Code Standards

- **TypeScript**: Strict mode enabled
- **ESLint**: Configured with Prettier
- **Conventional Commits**: Required for releases
- **Tests**: Minimum 80% coverage
- **Documentation**: JSDoc for public APIs

### Architecture Guidelines

- **CQRS**: Separate read/write operations
- **Single Responsibility**: One handler per request type
- **Dependency Injection**: Use NestJS DI container
- **Type Safety**: Leverage TypeScript fully
- **Error Handling**: Use Problem Details format

## 📚 Additional Resources

- [NestJS Documentation](https://docs.nestjs.com/)
- [Prisma Documentation](https://www.prisma.io/docs/)
- [CQRS Pattern](https://docs.microsoft.com/en-us/azure/architecture/patterns/cqrs)
- [Clean Architecture](https://blog.cleancoder.com/uncle-bob/2012/08/13/the-clean-architecture.html)
- [RFC 7807 - Problem Details](https://tools.ietf.org/html/rfc7807)

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

**Built with ❤️ using NestJS, TypeScript, and Clean Architecture principles**
