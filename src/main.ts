import { ProblemDetailsExceptionFilter } from '@/problem-details/filters/problem-details-exception.filter';
import { ValidationPipe, VersioningType } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { OPENAPI_SERVICE_TOKEN, OpenApiService } from './lib/openapi';

/**
 * Environment configuration interface
 */
interface EnvironmentConfig {
  environment: string;
  port: number;
  host: string;
  protocol: string;
  baseUrl: string;
}

/**
 * Get environment-specific configuration
 */
function getEnvironmentConfig(): EnvironmentConfig {
  const environment = process.env.NODE_ENV || 'development';
  const port = parseInt(process.env.PORT || '3000', 10);
  const host = process.env.HOST || 'localhost';
  const protocol = process.env.PROTOCOL || (environment === 'production' ? 'https' : 'http');
  const portSuffix = port !== 80 && port !== 443 ? `:${port}` : '';
  const baseUrl = process.env.BASE_URL || `${protocol}://${host}${portSuffix}`;

  return {
    environment,
    port,
    host,
    protocol,
    baseUrl,
  };
}

/**
 * Application bootstrap function
 */
async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const envConfig = getEnvironmentConfig();

  // Configure application
  app.setGlobalPrefix('api');
  app.enableVersioning({
    type: VersioningType.URI,
    defaultVersion: '2',
  });
  app.useGlobalPipes(new ValidationPipe({ whitelist: true }));
  app.useGlobalFilters(new ProblemDetailsExceptionFilter());

  // Setup OpenAPI/Swagger UI (only in non-production environments)
  if (envConfig.environment !== 'production') {
    try {
      const openApiService = app.get<OpenApiService>(OPENAPI_SERVICE_TOKEN);

      await openApiService.initialize({
        title: 'NestJS WebAPI',
        description: 'A comprehensive NestJS API with Clean Architecture, CQRS, and DDD patterns',
        version: '1.0.0',
        servers: [
          {
            url: envConfig.baseUrl + '/api',
            description: `${envConfig.environment} server`,
          },
        ],
      });

      await openApiService.setupSwaggerUI(app, '/api/docs');
      console.log(`📖 Swagger UI available at: ${envConfig.baseUrl}/api/docs`);
    } catch (error) {
      console.warn('⚠️  OpenAPI setup failed:', error);
    }
  }

  await app.listen(envConfig.port);
  console.log(`🚀 Application is running on: ${envConfig.baseUrl}`);
}

void bootstrap();
