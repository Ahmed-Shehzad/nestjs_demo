# 🚀 NestJS WebAPI with Clean Architecture

A production-ready NestJS Web API built with Clean Architecture, CQRS, and Domain-Driven Design patterns.

## ✨ Features

- **🏗️ Clean Architecture**: Separation of concerns with clear layers
- **📋 CQRS Pattern**: Command Query Responsibility Segregation
- **🔄 Domain Events**: Event-driven architecture
- **🔗 HATEOAS**: Hypermedia as the Engine of Application State
- **📄 RFC 7807**: Problem Details for HTTP APIs
- **� OpenAPI/Swagger**: Automatic API documentation with endpoint discovery
- **�🔍 OpenTelemetry**: Distributed tracing and observability
- **🐳 Docker**: Containerized deployment
- **🚀 CI/CD**: Automated testing, documentation generation, and deployment

### Quick Access

- **Interactive Docs**: http://localhost:3000/api/docs
- **Version Selector**: Multi-version support with dropdown
- **Generated Specs**: Available in JSON and YAML formats

### API Management Integration

- **✅ Insomnia**: Direct specification import

## 🚀 Quick Start

### Prerequisites

- Node.js 18+
- Docker & Docker Compose
- npm or yarn

### Installation

```bash
# Clone the repository
git clone <repository-url>
cd nestjs-webapi

# Install dependencies
npm install

# Setup environment
cp .env.example .env

# Start database
npm run db:dev:up

# Run database migrations
npm run prisma:dev:deploy

# Start development server
npm run start:dev
```

### Access Documentation

```bash
# Main documentation (with version selector)
open http://localhost:3000/api/docs

# Version-specific documentation
open http://localhost:3000/api/v2/docs  # Current version
open http://localhost:3000/api/v1/docs  # Legacy version
open http://localhost:3000/api/v3/docs  # Beta version
```

## 📋 Available Scripts

### Development

```bash
npm run start:dev      # Start in watch mode
npm run start:debug    # Start with debugging
npm run build          # Build the application
```

```bash
npm run docs:build              # Build complete documentation
```

### Testing

```bash
npm run test           # Unit tests
npm run test:e2e       # End-to-end tests
npm run test:cov       # Test coverage
npm run test:watch     # Tests in watch mode
```

### Database

```bash
npm run db:dev:up           # Start development database
npm run db:dev:restart      # Restart database with fresh data
npm run prisma:dev:deploy   # Run database migrations
```

### Code Generation (CQRS)

```bash
npm run gen              # Show generator help
npm run gen:q            # Generate query + handler + validator + DTO
npm run gen:c            # Generate command + handler + validator
npm run gen:de           # Generate domain event + handler
```

## 📁 Project Structure

```
src/
├── app.module.ts                    # Root application module
├── core/                            # Core services (database, etc.)
├── features/                        # Feature modules (users, bookmarks)
│   ├── user/
│   │   ├── commands/               # Create, update, delete operations
│   │   ├── queries/                # Read operations with DTOs
│   │   ├── events/                 # Domain events
│   │   ├── services/               # Business logic
│   │   └── user.controller.ts      # REST endpoints
│   └── bookmark/                    # Similar structure
├── lib/                            # Reusable libraries
│   ├── fluent-results/             # Result pattern implementation
│   ├── fluent-validation/          # Validation pipeline
│   ├── hateoas/                    # Hypermedia support
│   ├── mediator/                   # CQRS mediator pattern
│   ├── problem-details/            # RFC 7807 error handling
└── examples/                       # Usage examples
```

### Generate Documentation

```bash

# Generated files in docs/api/
docs/api/
```

3. Use the web interface or API import feature

### Automated Sync (CI/CD)

The GitHub Actions workflow automatically:

- ✅ Validates specification compliance
- ✅ Deploys documentation to GitHub Pages

## 🏗️ Architecture Patterns

### CQRS Implementation

```typescript
// Query Example
export class GetAllUsersQuery implements IQuery<FluentResult<GetAllUsersDto>> {
  constructor(
    public readonly page: number = 1,
    public readonly limit: number = 10,
    public readonly baseUrl: string = '/api/users',
  ) {}
}

// Handler Example
@RequestHandler(GetAllUsersQuery)
export class GetAllUsersQueryHandler implements IQueryHandler<GetAllUsersQuery, FluentResult<GetAllUsersDto>> {
  async handleAsync(query: GetAllUsersQuery): Promise<FluentResult<GetAllUsersDto>> {
    // Implementation
  }
}
```

```typescript
@Controller('users')
export class UsersController {
  @Get()
  @Version(['1', '2'])
  async getAllUsers(@Query('page') page?: string): Promise<FluentResult<GetAllUsersDto>> {
    const query = new GetAllUsersQuery(parseInt(page) || 1);
    return await this.mediator.sendAsync<FluentResult<GetAllUsersDto>>(query);
  }
}
```

## 🔍 Testing

### Unit Tests

```bash
# Run all unit tests
npm run test

# Run specific test
npm run test -- user.controller.spec.ts

# Watch mode
npm run test:watch
```

### End-to-End Tests

```bash
# Setup test database
npm run db:test:restart

# Run E2E tests
npm run test:e2e
```

### Test Coverage

```bash
# Generate coverage report
npm run test:cov

# View coverage in browser
open coverage/lcov-report/index.html
```

## 🐳 Docker Deployment

### Development

```bash
# Start all services
docker compose up -d

# View logs
docker compose logs -f app
```

### Production

```bash
# Build and deploy
docker compose -f docker-compose.prod.yml up -d

# Scale the application
docker compose -f docker-compose.prod.yml up -d --scale app=3
```

## 📊 Monitoring & Health Checks

### Health Check Endpoint

- **URL**: GET `/health`
- **Response**: System health status including database connectivity

### OpenTelemetry

Distributed tracing is configured and ready for integration with monitoring platforms.

## 🔐 Security

- **JWT Authentication**: Bearer token authentication
- **Input Validation**: Comprehensive request validation
- **Error Handling**: RFC 7807 Problem Details format
- **CORS**: Configurable cross-origin resource sharing
- **Rate Limiting**: Available for production environments

## 🚀 Production Deployment

### Environment Variables

```bash
# Application
NODE_ENV=production
PORT=3000
BASE_URL=https://api.yourdomain.com

# Database
DATABASE_URL=postgresql://user:pass@host:5432/db

```

### CI/CD Pipeline

The GitHub Actions workflow provides:

- ✅ Automated testing on PR/push
- ✅ Docker image building
- ✅ API documentation deployment

## 📖 Documentation

- **[CI/CD Guide](docs/CI-CD.md)**: Complete deployment pipeline documentation
- **API Documentation**: Available at `/api/docs` when running

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/amazing-feature`
3. Make your changes following the established patterns
4. Add tests for new functionality
5. Commit your changes: `git commit -m 'Add amazing feature'`
6. Push to the branch: `git push origin feature/amazing-feature`
7. Open a Pull Request

### Development Workflow

- Follow CQRS patterns for new features
- Use the code generators: `npm run gen:q`, `npm run gen:c`, `npm run gen:de`
- Add comprehensive tests

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

## 🙏 Acknowledgments

- **NestJS**: The progressive Node.js framework
- **Community Contributors**: Thank you for your contributions!

---

**🚀 Ready to build amazing APIs!** Start by exploring the interactive documentation at `/api/docs` and integrating with your favorite API management platform.
