import { OperationObject } from '@nestjs/swagger/dist/interfaces/open-api-spec.interface';

/**
 * OpenAPI configuration options
 */
export interface OpenApiConfig {
  /**
   * API title
   */
  title: string;

  /**
   * API description
   */
  description: string;

  /**
   * API version
   */
  version: string;

  /**
   * Contact information
   */
  contact?: {
    name?: string;
    email?: string;
    url?: string;
  };

  /**
   * License information
   */
  license?: {
    name: string;
    url?: string;
  };

  /**
   * Server URLs
   */
  servers?: Array<{
    url: string;
    description?: string;
  }>;

  /**
   * Tags for grouping operations
   */
  tags?: Array<{
    name: string;
    description?: string;
    externalDocs?: {
      description?: string;
      url: string;
    };
  }>;

  /**
   * Security schemes
   */
  security?: Array<{
    name: string;
    type: 'apiKey' | 'http' | 'oauth2' | 'openIdConnect';
    description?: string;
    scheme?: string;
    bearerFormat?: string;
    in?: 'query' | 'header' | 'cookie';
  }>;

  /**
   * External documentation
   */
  externalDocs?: {
    description?: string;
    url: string;
  };
}

/**
 * Swagger UI configuration options
 */
export interface SwaggerUIConfig {
  /**
   * Path for Swagger UI
   */
  path: string;

  /**
   * Custom CSS for Swagger UI
   */
  customCss?: string;

  /**
   * Custom CSS URL
   */
  customCssUrl?: string;

  /**
   * Custom JS files
   */
  customJs?: string | string[];

  /**
   * Custom favicon
   */
  customfavIcon?: string;

  /**
   * Custom site title
   */
  customSiteTitle?: string;

  /**
   * Explorer enabled
   */
  explorer?: boolean;

  /**
   * Swagger options
   */
  swaggerOptions?: Record<string, any>;

  /**
   * Custom Swagger UI URL
   */
  swaggerUrl?: string;
}

/**
 * Type for NestJS module or controller classes
 */
export type ClassConstructor = new (...args: any[]) => any;

/**
 * OpenAPI endpoint metadata
 */
export interface OpenApiEndpointMetadata {
  /**
   * Controller name
   */
  controller?: string;

  /**
   * HTTP method
   */
  method: string;

  /**
   * HTTP method (alias for method)
   */
  httpMethod?: string;

  /**
   * Endpoint path
   */
  path: string;

  /**
   * Operation ID
   */
  operationId?: string;

  /**
   * Summary
   */
  summary?: string;

  /**
   * Description
   */
  description?: string;

  /**
   * Tags
   */
  tags?: string[];

  /**
   * Deprecated flag
   */
  deprecated?: boolean;

  /**
   * Controller class name
   */
  controllerClass: string;

  /**
   * Handler method name
   */
  methodName: string;

  /**
   * Parameters metadata
   */
  parameters?: Array<{
    name: string;
    in: 'query' | 'header' | 'path' | 'cookie';
    type: any;
    required?: boolean;
    description?: string;
  }>;

  /**
   * Request body metadata
   */
  requestBody?: {
    type: any;
    required?: boolean;
    description?: string;
  };

  /**
   * Response metadata
   */
  responses?: Record<
    string,
    {
      type: any;
      description?: string;
    }
  >;
}

/**
 * Feature module metadata for OpenAPI
 */
export interface FeatureModuleMetadata {
  /**
   * Module name
   */
  name: string;

  /**
   * Module class
   */
  moduleClass: ClassConstructor;

  /**
   * Controllers in this module
   */
  controllers: ClassConstructor[];

  /**
   * Endpoints discovered from this module
   */
  endpoints: OpenApiEndpointMetadata[];

  /**
   * Module-specific tags
   */
  tags?: string[];

  /**
   * Whether the module is enabled for OpenAPI
   */
  enabled?: boolean;

  /**
   * Module version
   */
  version?: string;

  /**
   * Module description
   */
  description?: string;
}

/**
 * OpenAPI document generation options
 */
export interface OpenApiDocumentOptions {
  /**
   * Include only specified modules
   */
  includeModules?: string[];

  /**
   * Exclude specified modules
   */
  excludeModules?: string[];

  /**
   * Include only specified controllers
   */
  includeControllers?: ClassConstructor[];

  /**
   * Exclude specified controllers
   */
  excludeControllers?: ClassConstructor[];

  /**
   * Include only specified tags
   */
  includeTags?: string[];

  /**
   * Exclude specified tags
   */
  excludeTags?: string[];

  /**
   * Custom transformations
   */
  transformations?: Array<{
    matcher: (endpoint: OpenApiEndpointMetadata) => boolean;
    transformer: (endpoint: OpenApiEndpointMetadata, operation: OperationObject) => OperationObject;
  }>;
}
