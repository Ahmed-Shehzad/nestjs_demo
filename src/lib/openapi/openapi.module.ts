import { DiscoveryModule } from '@golevelup/nestjs-discovery';
import { DynamicModule, Module, Provider } from '@nestjs/common';
import { MetadataScanner } from '@nestjs/core/metadata-scanner';
import { OpenApiDiscoveryService } from './discovery/openapi-discovery.service';
import { OpenApiConfigService } from './services/openapi-config.service';
import { OpenApiDocumentService } from './services/openapi-document.service';
import { OpenApiService } from './services/openapi.service';
import { OpenApiConfig } from './types/openapi.types';

// Service tokens for dependency injection
export const OPENAPI_SERVICE_TOKEN = 'IOpenApiService';
export const OPENAPI_DISCOVERY_SERVICE_TOKEN = 'IOpenApiDiscoveryService';
export const OPENAPI_DOCUMENT_SERVICE_TOKEN = 'IOpenApiDocumentService';
export const OPENAPI_CONFIG_SERVICE_TOKEN = 'IOpenApiConfigService';

/**
 * OpenAPI Module Options
 */
export interface OpenApiModuleOptions {
  /**
   * OpenAPI configuration
   */
  config?: Partial<OpenApiConfig>;

  /**
   * Whether to register the module globally
   */
  isGlobal?: boolean;

  /**
   * Swagger UI path
   */
  swaggerPath?: string;

  /**
   * Whether to enable auto-discovery of controllers
   */
  enableDiscovery?: boolean;
}

/**
 * OpenAPI Module
 * Main module that provides OpenAPI functionality following the project's architecture patterns
 */
@Module({})
export class OpenApiModule {
  /**
   * Register the OpenAPI module synchronously
   */
  static register(options: OpenApiModuleOptions = {}): DynamicModule {
    const providers: Provider[] = [
      // Core NestJS services
      MetadataScanner,

      // Core services with proper dependency order
      OpenApiConfigService,
      {
        provide: OPENAPI_CONFIG_SERVICE_TOKEN,
        useExisting: OpenApiConfigService,
      },
      OpenApiDiscoveryService,
      {
        provide: OPENAPI_DISCOVERY_SERVICE_TOKEN,
        useExisting: OpenApiDiscoveryService,
      },
      OpenApiDocumentService,
      {
        provide: OPENAPI_DOCUMENT_SERVICE_TOKEN,
        useExisting: OpenApiDocumentService,
      },
      OpenApiService,
      {
        provide: OPENAPI_SERVICE_TOKEN,
        useExisting: OpenApiService,
      },
    ];

    // Add configuration provider if config is provided
    if (options.config) {
      providers.push({
        provide: 'OPENAPI_CONFIG',
        useValue: options.config,
      });
    }

    return {
      module: OpenApiModule,
      imports: [DiscoveryModule],
      providers,
      exports: [
        OPENAPI_SERVICE_TOKEN,
        OPENAPI_DISCOVERY_SERVICE_TOKEN,
        OPENAPI_DOCUMENT_SERVICE_TOKEN,
        OPENAPI_CONFIG_SERVICE_TOKEN,
        OpenApiService,
        OpenApiDiscoveryService,
        OpenApiDocumentService,
        OpenApiConfigService,
      ],
      global: options.isGlobal ?? false,
    };
  }

  /**
   * Register the OpenAPI module asynchronously
   */
  static registerAsync(options: {
    imports?: DynamicModule[];
    inject?: any[];
    useFactory?: (...args: any[]) => OpenApiModuleOptions | Promise<OpenApiModuleOptions>;
    isGlobal?: boolean;
  }): DynamicModule {
    const providers: Provider[] = [
      // Core NestJS services
      MetadataScanner,

      // Core services with proper dependency order
      OpenApiConfigService,
      {
        provide: OPENAPI_CONFIG_SERVICE_TOKEN,
        useExisting: OpenApiConfigService,
      },
      OpenApiDiscoveryService,
      {
        provide: OPENAPI_DISCOVERY_SERVICE_TOKEN,
        useExisting: OpenApiDiscoveryService,
      },
      OpenApiDocumentService,
      {
        provide: OPENAPI_DOCUMENT_SERVICE_TOKEN,
        useExisting: OpenApiDocumentService,
      },
      OpenApiService,
      {
        provide: OPENAPI_SERVICE_TOKEN,
        useExisting: OpenApiService,
      },
    ];

    // Add async configuration provider
    if (options.useFactory) {
      providers.push({
        provide: 'OPENAPI_CONFIG',
        useFactory: options.useFactory,
        inject: options.inject || [],
      });
    }

    return {
      module: OpenApiModule,
      imports: [DiscoveryModule, ...(Array.isArray(options.imports) ? options.imports : [])],
      providers,
      exports: [
        OPENAPI_SERVICE_TOKEN,
        OPENAPI_DISCOVERY_SERVICE_TOKEN,
        OPENAPI_DOCUMENT_SERVICE_TOKEN,
        OPENAPI_CONFIG_SERVICE_TOKEN,
        OpenApiService,
        OpenApiDiscoveryService,
        OpenApiDocumentService,
        OpenApiConfigService,
      ],
      global: options.isGlobal ?? false,
    };
  }
}
