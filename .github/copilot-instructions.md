# 🧑‍💻 Copilot Instructions for AI Agents

## Big Picture Architecture

- **Clean Architecture + CQRS + DDD**: The codebase is structured into clear layers: HTTP (controllers), Application (commands, queries, events), Domain (entities, validators, services), and Infrastructure (Prisma/PostgreSQL).
- **Mediator Pattern**: All requests flow through a mediator pipeline (`lib/mediator/`), supporting logging, validation, and telemetry behaviors before reaching handlers.
- **Custom Libraries**: Validation (`lib/fluent-validation/`), HATEOAS (`lib/hateoas/`), Problem Details error format (`lib/problem-details/`), and Fluent Results (`lib/fluent-results/`) are used throughout.

## Developer Workflows

- **Build**: `npm run build` or VS Code "Build TypeScript" task.
- **Development Server**: `npm run start:dev` or "Start Development Server" task (hot reload).
- **Debugging**: `npm run start:debug` or "Start Debug Mode" task.
- **Testing**: `npm run test` (unit), `npm run test:e2e` (end-to-end), `npm run test:cov` (coverage).
- **Code Generation**: Use `npm run gen:*` scripts to scaffold CQRS components with consistent structure:
  - `npm run gen:q` - Generate query + handler + validator + DTO
  - `npm run gen:c` - Generate command + handler + validator
  - `npm run gen:de` - Generate domain event + handler
  - `npm run gen` - Show generator help
- **Database**: Managed via Docker (`npm run db:dev:up`) and Prisma migrations (`npm run prisma:dev:deploy`).
- **CI/CD**: GitHub Actions workflows for automated testing, building, and deployment.
- **Deployment**: Production deployment via Docker containers with automated scripts.

## Project-Specific Conventions

- **CQRS Structure**: Each feature (e.g., `features/user/`) contains `commands/`, `queries/`, `events/`, and `services/` folders. Handlers and validators are named after their request type (e.g., `get-all-users.handler.ts`).
- **Handler Registration**: Use `@RequestHandler(QueryClass)` decorator and implement `IQueryHandler<TQuery, TResult>` or `ICommandHandler`.
- **Validation**: Validators extend `AbstractValidator` with `@ValidatorFor(QueryClass)` decorator and use fluent chaining (`.mustBeDefined()`, `.mustBe()`, `.withMessage()`).
- **Dependency Injection**: Controllers inject `@InjectMediator()` and call `this.mediator.sendAsync(query)`.
- **Results Pattern**: All handlers return `FluentResult<T>` for consistent error handling and success states.
- **Error Handling**: Use RFC 7807 Problem Details format with builders in `lib/problem-details/`.
- **HATEOAS**: API responses include hypermedia links with pagination metadata.
- **Test Factories**: Use `test/factories/` for generating realistic test data with Faker.js.
- **Code Style**: TypeScript strict mode, ESLint + Prettier, conventional commits required.

## Integration Points

- **Prisma ORM**: Database access via `core/prisma.service.ts` and `prisma/schema.prisma`.
- **Docker**: PostgreSQL managed via Docker Compose (`docker-compose.yml`).
- **OpenTelemetry**: Distributed tracing integrated in pipeline behaviors.
- **CI/CD Pipeline**: GitHub Actions in `.github/workflows/` for automated testing, security scanning, and deployment.
- **Container Registry**: Images pushed to GitHub Container Registry (ghcr.io).
- **Production Stack**: Nginx reverse proxy, PostgreSQL database, Redis cache, and application containers.

## Examples & Key Files

- **CQRS Example**: See `README.md` for a full query/handler/validator/controller flow.
- **Complete Implementation**: `src/features/user/queries/get-all-users.*` shows the full pattern.
- **Feature Structure**: `src/features/user/` and `src/features/bookmark/`.
- **Custom Libraries**: `src/lib/` for mediator, validation, HATEOAS, error handling.
- **Code Generation**: `scripts/generators/` with templates for consistent scaffolding.
- **Test Factories**: `test/factories/user.factory.ts` for generating test data.
- **Testing**: `test/` and `*.spec.ts` files in features using NestJS testing utilities.

## Key Implementation Patterns

### CQRS Flow Example

```typescript
// 1. Query with constructor defaults
export class GetAllUsersQuery implements IQuery<FluentResult<GetAllUsersDto>> {
  constructor(
    public readonly page: number = 1,
    public readonly limit: number = 10,
    public readonly baseUrl: string = '/api/users',
  ) {}
}

// 2. Handler with @RequestHandler decorator
@Injectable()
@RequestHandler(GetAllUsersQuery)
export class GetAllUsersQueryHandler implements IQueryHandler<GetAllUsersQuery, FluentResult<GetAllUsersDto>> {
  constructor(private readonly prisma: PrismaService) {}

  async handleAsync(query: GetAllUsersQuery): Promise<FluentResult<GetAllUsersDto>> {
    // Implementation returns FluentResult.success(dto) or FluentResult.failure()
  }
}

// 3. Validator with fluent chaining
@Injectable()
@ValidatorFor(GetAllUsersQuery)
export class GetAllUsersQueryValidator extends AbstractValidator<GetAllUsersQuery> {
  constructor() {
    super();
    this.ruleFor(x => x.page)
      .mustBeDefined()
      .mustBe(page => page >= 1)
      .withMessage('Page number must be greater than or equal to 1');
  }
}

// 4. Controller usage
@Get()
async getAllUsers(@Query('page') page?: string): Promise<FluentResult<GetAllUsersDto>> {
  const query = new GetAllUsersQuery(parseInt(page) || 1);
  return await this.mediator.sendAsync<FluentResult<GetAllUsersDto>>(query);
}
```

### Debugging Patterns

- Controllers include `console.log('🔍 [DEBUG] ...')` statements for debugging
- Use VS Code debug tasks or add breakpoints at key points
- Debug comments indicate where to set breakpoints (e.g., "set breakpoint here to test debugging")

---

**For new agents:**

- Always follow the CQRS and Clean Architecture conventions.
- Use code generators for new components.
- Validate all inputs and use Problem Details for errors.
- Reference the README for workflow and API examples.

---

_If any section is unclear or missing, please request clarification or provide feedback for improvement._
