// Main OpenAPI Module
export {
  OPENAPI_CONFIG_SERVICE_TOKEN,
  OPENAPI_DISCOVERY_SERVICE_TOKEN,
  OPENAPI_DOCUMENT_SERVICE_TOKEN,
  OPENAPI_SERVICE_TOKEN,
  OpenApiModule,
} from './openapi.module';

// Services
export { OpenApiDiscoveryService } from './discovery/openapi-discovery.service';
export { OpenApiConfigService } from './services/openapi-config.service';
export { OpenApiDocumentService } from './services/openapi-document.service';
export { OpenApiService } from './services/openapi.service';

// Interfaces
export type {
  IOpenApiConfigService,
  IOpenApiDiscoveryService,
  IOpenApiDocumentService,
  IOpenApiService,
} from './interfaces/openapi-service.interface';

// Types
export type {
  ClassConstructor,
  FeatureModuleMetadata,
  OpenApiConfig,
  OpenApiDocumentOptions,
  OpenApiEndpointMetadata,
  SwaggerUIConfig,
} from './types/openapi.types';
import type { OpenApiConfig } from './types/openapi.types';

// Decorators
export * from './decorators';

// Configuration helpers
export const createOpenApiConfig = (config: Partial<OpenApiConfig>): OpenApiConfig => {
  return {
    title: 'API Documentation',
    description: 'API Documentation',
    version: '1.0.0',
    ...config,
  };
};
