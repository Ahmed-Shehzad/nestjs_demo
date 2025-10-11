/* eslint-disable @typescript-eslint/no-unsafe-argument */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import { ProblemDetailsExceptionFilter } from '@/problem-details/filters/problem-details-exception.filter';
import { INestApplication, ValidationPipe, VersioningType } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { AppModule } from './app.module';

interface ApiVersion {
  version: string;
  title: string;
  description: string;
  deprecated?: boolean;
}

/**
 * Configuration for version filtering
 */
interface VersionFilterConfig {
  apiPrefix: string; // e.g., '/api'
  versionPrefix: string; // e.g., 'v'
  allVersions: string[];
  defaultVersion: string;
}

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
  const baseUrl = process.env.BASE_URL || `${protocol}://${host}${port !== 80 && port !== 443 ? `:${port}` : ''}`;

  return {
    environment,
    port,
    host,
    protocol,
    baseUrl,
  };
}

/**
 * Determines if a given path should be included in a specific API version documentation
 * @param path - The API path to check
 * @param targetVersion - The version we're generating docs for
 * @param config - Configuration for version filtering
 * @returns boolean indicating if the path should be included
 */
function shouldIncludePathInVersion(path: string, targetVersion: string, config: VersionFilterConfig): boolean {
  const { apiPrefix, versionPrefix, allVersions, defaultVersion } = config;

  // Build the version-specific path pattern
  const versionPattern = `${apiPrefix}/${versionPrefix}${targetVersion}/`;
  const pathIncludesTargetVersion = path.includes(versionPattern);

  // Check if path has any version number in it
  const pathHasAnyVersion = allVersions.some((v) => path.includes(`${apiPrefix}/${versionPrefix}${v}/`));

  // Include path if:
  // 1. Path explicitly includes target version
  // 2. Path has no version and target version is the default version
  return pathIncludesTargetVersion || (!pathHasAnyVersion && targetVersion === defaultVersion);
}

function setupMultiVersionSwagger(app: INestApplication): void {
  // Get environment-specific configuration
  const envConfig = getEnvironmentConfig();

  // Define servers based on environment
  const getServersConfig = () => {
    const servers = [
      {
        url: envConfig.baseUrl,
        description: `${envConfig.environment.charAt(0).toUpperCase() + envConfig.environment.slice(1)} Server`,
      },
    ];

    // Add additional servers based on environment
    if (envConfig.environment === 'development') {
      // Add staging server if available
      if (process.env.STAGING_URL) {
        servers.push({
          url: process.env.STAGING_URL,
          description: 'Staging Server',
        });
      }
      // Add production server if available
      if (process.env.PRODUCTION_URL) {
        servers.push({
          url: process.env.PRODUCTION_URL,
          description: 'Production Server',
        });
      }
    }

    return servers;
  };

  const baseConfig = {
    title: 'NestJS WebAPI',
    description: 'A NestJS Web API built with Clean Architecture + CQRS + DDD',
    contact: {
      name: 'API Support',
      email: 'support@example.com',
    },
    license: {
      name: 'MIT',
      url: 'https://opensource.org/licenses/MIT',
    },
  };

  // Define API versions dynamically
  const apiVersions: ApiVersion[] = [
    {
      version: '1',
      title: `${baseConfig.title} v1.0`,
      description: `${baseConfig.description}\n\n**Version 1.0** - Legacy version with basic functionality.`,
      deprecated: true,
    },
    {
      version: '2',
      title: `${baseConfig.title} v2.0`,
      description: `${baseConfig.description}\n\n**Version 2.0** - Current stable version with enhanced features.`,
    },
    {
      version: '3',
      title: `${baseConfig.title} v3.0`,
      description: `${baseConfig.description}\n\n**Version 3.0** - Latest version with cutting-edge features.`,
    },
  ];

  // Create documents for each version
  const versionDocuments = new Map<string, any>();

  apiVersions.forEach((apiVersion) => {
    // Start building the configuration
    let configBuilder = new DocumentBuilder()
      .setTitle(apiVersion.title)
      .setDescription(apiVersion.description)
      .setVersion(`${apiVersion.version}.0`)
      .addBearerAuth()
      .setContact(baseConfig.contact.name, '', baseConfig.contact.email)
      .setLicense(baseConfig.license.name, baseConfig.license.url);

    // Dynamically add servers based on environment
    const servers = getServersConfig();
    servers.forEach((server) => {
      configBuilder = configBuilder.addServer(server.url, `${server.description} v${apiVersion.version}`);
    });

    const config = configBuilder.build();

    // Create version-specific document using NestJS version filtering
    const document = SwaggerModule.createDocument(app, config, {
      operationIdFactory: (controllerKey: string, methodKey: string) => methodKey,
      deepScanRoutes: true,
      // This is the key - specify which version this document should include
      extraModels: [],
      ignoreGlobalPrefix: false,
    });

    // Apply version-specific filtering to the document paths
    const filteredPaths: Record<string, any> = {};

    // Get all available version numbers for dynamic filtering
    const allVersionNumbers = apiVersions.map((v) => v.version);
    const defaultVersion = apiVersions.find((v) => !v.deprecated)?.version || apiVersions[0].version;

    // Create version filter configuration
    const filterConfig: VersionFilterConfig = {
      apiPrefix: '/api',
      versionPrefix: 'v',
      allVersions: allVersionNumbers,
      defaultVersion,
    };

    Object.entries(document.paths).forEach(([path, pathItem]) => {
      // Use the utility function to determine if this path should be included
      const shouldInclude = shouldIncludePathInVersion(path, apiVersion.version, filterConfig);

      if (shouldInclude) {
        filteredPaths[path] = pathItem;
      }
    });

    const filteredDocument = {
      ...document,
      paths: filteredPaths,
    };

    versionDocuments.set(apiVersion.version, filteredDocument);
  });

  // Default to the current version (v2)
  const defaultVersion = apiVersions.find((v) => v.version === '2') || apiVersions[0];
  const defaultDocument = versionDocuments.get(defaultVersion.version);

  // Dynamic Swagger options with version selector dropdown
  const swaggerOptions = {
    explorer: true,
    swaggerOptions: {
      urls: apiVersions.map((version) => ({
        url: `/api/v${version.version}/docs-json`,
        name: `v${version.version}.0 - ${version.title.split(' v')[0]} ${version.deprecated ? '(Deprecated)' : ''}`.trim(),
      })),
    },
    customSiteTitle: 'API Documentation - Multi Version',
  };

  // Setup individual version endpoints for API specs
  apiVersions.forEach((apiVersion) => {
    const document = versionDocuments.get(apiVersion.version);
    SwaggerModule.setup(`api/v${apiVersion.version}/docs`, app, document);
  });

  // Setup main documentation page with version selector
  SwaggerModule.setup('api/docs', app, defaultDocument, swaggerOptions);

  console.log('📚 Multi-version Swagger documentation setup complete!');
  console.log(`🔗 Main documentation: ${envConfig.baseUrl}/api/docs`);
  console.log(`🌍 Environment: ${envConfig.environment.toUpperCase()}`);
  console.log('📋 Available versions via dropdown:');
  apiVersions.forEach((version) => {
    const status = version.deprecated ? '⚠️ DEPRECATED' : '✅ ACTIVE';
    const directLink = `${envConfig.baseUrl}/api/v${version.version}/docs`;
    console.log(`   - v${version.version}: ${status} - ${directLink}`);
  });
}

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const envConfig = getEnvironmentConfig();

  app.setGlobalPrefix('api');
  app.enableVersioning({
    type: VersioningType.URI,
    defaultVersion: '2',
  });
  app.useGlobalPipes(new ValidationPipe({ whitelist: true }));
  app.useGlobalFilters(new ProblemDetailsExceptionFilter());

  // Dynamic Multi-Version Swagger/OpenAPI Documentation Setup
  setupMultiVersionSwagger(app);

  await app.listen(envConfig.port);
  console.log(`🚀 Application is running on: ${envConfig.baseUrl}`);
}
void bootstrap();
