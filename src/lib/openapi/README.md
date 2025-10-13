# OpenAPI Module

A comprehensive OpenAPI/Swagger integration module following Clean Architecture principles for the NestJS CQRS application.

## Overview

The OpenAPI module provides automatic API documentation generation, endpoint discovery, and Swagger UI integration. It follows the same architectural patterns as the mediator module, offering:

- **Automatic Discovery**: Scans controllers and endpoints automatically
- **CQRS Integration**: Works seamlessly with command/query handlers
- **Clean Architecture**: Follows dependency inversion and separation of concerns
- **Type Safety**: Full TypeScript support with strict typing
- **Extensible**: Decorator-based enhancement system
- **Multi-format Support**: JSON and YAML document export

## Architecture

```text
src/lib/openapi/
├── decorators/           # OpenAPI decorators (@OpenApiFeature, @OpenApiEndpoint)
├── discovery/           # Service discovery (OpenApiDiscoveryService)
├── interfaces/          # Service interfaces (IOpenApiService, etc.)
├── services/           # Core services (OpenApiService, OpenApiDocumentService)
├── types/              # TypeScript definitions
├── openapi.module.ts   # Main module registration
└── index.ts           # Public exports
```

## Quick Start

### 1. Install Dependencies

The required dependencies should already be installed:

```bash
npm install @nestjs/swagger swagger-ui-express
npm install -D @types/swagger-ui-express
```

### 2. Register the Module

```typescript
// app.module.ts
import { Module } from '@nestjs/common';
import { OpenApiModule } from '@/lib/openapi';

@Module({
  imports: [
    // Other modules...
    OpenApiModule.register({
      isGlobal: true,
      config: {
        title: 'NestJS WebAPI',
        description: 'Clean Architecture CQRS API',
        version: '1.0.0',
      },
    }),
  ],
})
export class AppModule {}
```

### 3. Setup Swagger UI

```typescript
// main.ts
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { OpenApiService, OPENAPI_SERVICE_TOKEN } from '@/lib/openapi';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  
  // Get OpenAPI service
  const openApiService = app.get<OpenApiService>(OPENAPI_SERVICE_TOKEN);
  
  // Initialize and setup Swagger UI
  await openApiService.initialize({
    title: 'NestJS WebAPI',
    description: 'API Documentation',
    version: '1.0.0',
  });
  
  await openApiService.setupSwaggerUI(app, '/api/docs');
  
  await app.listen(3000);
  console.log('📖 Swagger UI available at: http://localhost:3000/api/docs');
}
bootstrap();
```

### 4. Enhance Controllers with Decorators

```typescript
// user.controller.ts
import { Controller, Get, Post, Body, Query } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { OpenApiFeature, OpenApiEndpoint } from '@/lib/openapi';
import { InjectMediator, IMediator } from '@/lib/mediator';

@Controller('users')
@ApiTags('Users')
@OpenApiFeature({
  name: 'Users',
  description: 'User management endpoints',
  version: '1.0.0',
})
export class UserController {
  constructor(@InjectMediator() private readonly mediator: IMediator) {}

  @Get()
  @ApiOperation({ summary: 'Get all users' })
  @ApiResponse({ status: 200, description: 'Users retrieved successfully' })
  @OpenApiEndpoint({
    summary: 'Get all users with pagination',
    description: 'Retrieve a paginated list of users with HATEOAS links',
    operationId: 'getAllUsers',
  })
  async getAllUsers(@Query() query: GetAllUsersQuery) {
    return await this.mediator.sendAsync(query);
  }

  @Post()
  @ApiOperation({ summary: 'Create user' })
  @ApiResponse({ status: 201, description: 'User created successfully' })
  @OpenApiEndpoint({
    summary: 'Create new user',
    description: 'Create a new user with validation',
    operationId: 'createUser',
  })
  async createUser(@Body() command: CreateUserCommand) {
    return await this.mediator.sendAsync(command);
  }
}
```

## Advanced Configuration

### Async Module Registration

```typescript
// app.module.ts
import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { OpenApiModule } from '@/lib/openapi';

@Module({
  imports: [
    ConfigModule.forRoot(),
    OpenApiModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        isGlobal: true,
        config: {
          title: configService.get('API_TITLE', 'NestJS WebAPI'),
          description: configService.get('API_DESCRIPTION', 'API Documentation'),
          version: configService.get('API_VERSION', '1.0.0'),
          servers: [
            {
              url: configService.get('API_URL', 'http://localhost:3000'),
              description: 'Development server',
            },
          ],
        },
      }),
    }),
  ],
})
export class AppModule {}
```

### Environment-Specific Configuration

```typescript
// main.ts - Production setup
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { OpenApiService, OPENAPI_CONFIG_SERVICE_TOKEN } from '@/lib/openapi';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  
  const configService = app.get(OPENAPI_CONFIG_SERVICE_TOKEN);
  const environment = process.env.NODE_ENV || 'development';
  
  // Get environment-specific configuration
  const config = configService.getEnvironmentConfig(environment);
  
  const openApiService = app.get(OPENAPI_SERVICE_TOKEN);
  await openApiService.initialize(config);
  
  // Only setup Swagger UI in non-production environments
  if (environment !== 'production') {
    await openApiService.setupSwaggerUI(app, '/api/docs');
  }
  
  await app.listen(3000);
}
bootstrap();
```

### Document Export

```typescript
// Export OpenAPI document
import { OpenApiDocumentService, OPENAPI_DOCUMENT_SERVICE_TOKEN } from '@/lib/openapi';

// In a service or CLI command
export class DocumentExportService {
  constructor(
    @Inject(OPENAPI_DOCUMENT_SERVICE_TOKEN)
    private readonly documentService: OpenApiDocumentService,
  ) {}
  
  async exportDocuments() {
    const document = await this.documentService.generateDocument({
      title: 'API Documentation',
      version: '1.0.0',
      description: 'Exported API documentation',
    });
    
    // Export as JSON
    await this.documentService.exportDocument(
      document,
      './docs/api/openapi.json',
      'json'
    );
    
    // Export as YAML
    await this.documentService.exportDocument(
      document,
      './docs/api/openapi.yaml',
      'yaml'
    );
  }
}
```

## Integration with Existing Features

### CQRS Pattern Integration

The OpenAPI module automatically discovers endpoints that use the CQRS pattern:

```typescript
// Queries and Commands are automatically documented
@Get()
async getAllUsers(@Query('page') page?: string, @Query('limit') limit?: string) {
  const query = new GetAllUsersQuery(
    parseInt(page) || 1,
    parseInt(limit) || 10,
    '/api/users'
  );
  return await this.mediator.sendAsync(query);
}
```

### HATEOAS Support

The module understands and documents HATEOAS responses:

```typescript
// The response DTOs with HATEOAS links are automatically documented
export class GetAllUsersDto {
  data: UserDto[];
  meta: PaginationMeta;
  links: HateoasLinks;
}
```

### Validation Integration

Works with the existing FluentValidation system:

```typescript
// Validation errors are automatically documented in Problem Details format
@Post()
async createUser(@Body() command: CreateUserCommand) {
  // Validation happens in the pipeline
  // OpenAPI documents both success and validation error responses
  return await this.mediator.sendAsync(command);
}
```

## Service Usage

### Discovery Service

```typescript
import { OpenApiDiscoveryService, OPENAPI_DISCOVERY_SERVICE_TOKEN } from '@/lib/openapi';

@Injectable()
export class MyService {
  constructor(
    @Inject(OPENAPI_DISCOVERY_SERVICE_TOKEN)
    private readonly discoveryService: OpenApiDiscoveryService,
  ) {}
  
  async getApiStats() {
    const controllers = this.discoveryService.getRegisteredControllers();
    const userEndpoints = this.discoveryService.getEndpointsByTag('Users');
    return { totalControllers: controllers.length, userEndpoints: userEndpoints.length };
  }
}
```

### Document Service

```typescript
import { OpenApiDocumentService, OPENAPI_DOCUMENT_SERVICE_TOKEN } from '@/lib/openapi';

@Injectable()
export class DocumentationService {
  constructor(
    @Inject(OPENAPI_DOCUMENT_SERVICE_TOKEN)
    private readonly documentService: OpenApiDocumentService,
  ) {}
  
  async generateCustomDocument() {
    const document = await this.documentService.generateDocument({
      title: 'Custom API',
      version: '2.0.0',
      description: 'Custom documentation',
    });
    
    const stats = this.documentService.getDocumentStats(document);
    console.log(`Generated document with ${stats.endpointCount} endpoints`);
    
    return document;
  }
}
```

## Health Monitoring

```typescript
// Built-in health check
const healthStatus = await openApiService.healthCheck();
console.log('OpenAPI Service Health:', healthStatus);

// Service statistics
const stats = await openApiService.getStats();
console.log('API Stats:', stats);
/*
Output:
{
  totalEndpoints: 12,
  totalModules: 3,
  totalControllers: 4,
  documentSize: 45678,
  lastUpdated: '2024-01-15T10:30:00.000Z'
}
*/
```

## Best Practices

### 1. Use Descriptive Operations

```typescript
@OpenApiEndpoint({
  summary: 'Create user account',
  description: 'Creates a new user account with email verification',
  operationId: 'createUserAccount', // Unique across the API
})
```

### 2. Tag Organization

```typescript
@OpenApiFeature({
  name: 'User Management',
  description: 'User account and profile operations',
  tags: ['Users', 'Authentication', 'Profiles'],
})
```

### 3. Version Management

```typescript
// Use semantic versioning
@OpenApiFeature({
  name: 'Users',
  version: '1.2.0', // Update when API changes
})
```

### 4. Environment Configuration

```typescript
// Different configs for different environments
const config = configService.getEnvironmentConfig(process.env.NODE_ENV);
```

## Integration with CI/CD

The module supports automated documentation generation:

```bash
# Generate and export documentation
npm run build
npm run docs:generate

# Generated files:
# - docs/api/openapi.json
# - docs/api/openapi.yaml
```

## Troubleshooting

### Common Issues

1. **Controllers not discovered**: Ensure controllers are properly imported in modules
2. **Swagger UI not loading**: Check the path and port configuration
3. **Missing endpoints**: Verify HTTP method decorators are present
4. **Type errors**: Ensure all required fields are provided in configurations

### Debug Mode

```typescript
// Enable detailed logging
const healthCheck = await openApiService.healthCheck();
console.log('OpenAPI Health:', healthCheck.details);
```

## Contributing

When adding new features to the OpenAPI module:

1. Follow the existing service interface pattern
2. Add comprehensive TypeScript types
3. Include JSDoc documentation
4. Add example usage in comments
5. Update this README with new features

## Related Documentation

- [Mediator Pattern Implementation](../mediator/README.md)
- [CQRS Architecture Guide](../../docs/CQRS.md)
- [Clean Architecture Principles](../../docs/ARCHITECTURE.md)
- [API Client Generation](../../OPENAPI_SETUP.md)
