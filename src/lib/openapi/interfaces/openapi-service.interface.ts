import { OpenAPIObject } from '@nestjs/swagger/dist/interfaces/open-api-spec.interface';
import {
  FeatureModuleMetadata,
  OpenApiConfig,
  OpenApiDocumentOptions,
  OpenApiEndpointMetadata,
} from '../types/openapi.types';

/**
 * Type for NestJS module or controller classes
 */
type ClassConstructor = new (...args: any[]) => any;

/**
 * OpenAPI Discovery Service Interface
 * Handles discovery of endpoints and modules for OpenAPI documentation
 */
export interface IOpenApiDiscoveryService {
  /**
   * Discover all feature modules registered with OpenAPI
   */
  discoverFeatureModules(): Promise<FeatureModuleMetadata[]>;

  /**
   * Discover endpoints from a specific module
   */
  discoverModuleEndpoints(moduleClass: ClassConstructor): Promise<OpenApiEndpointMetadata[]>;

  /**
   * Get all registered controllers
   */
  getRegisteredControllers(): ClassConstructor[];

  /**
   * Get endpoints by controller
   */
  getEndpointsByController(controllerClass: ClassConstructor): OpenApiEndpointMetadata[];

  /**
   * Get endpoints by tag
   */
  getEndpointsByTag(tag: string): OpenApiEndpointMetadata[];

  /**
   * Register a feature module for OpenAPI discovery
   */
  registerFeatureModule(moduleClass: ClassConstructor, metadata?: Partial<FeatureModuleMetadata>): void;

  /**
   * Check if a module is registered
   */
  isModuleRegistered(moduleClass: ClassConstructor): boolean;
}

/**
 * OpenAPI Document Service Interface
 * Handles generation and management of OpenAPI documents
 */
export interface IOpenApiDocumentService {
  /**
   * Generate OpenAPI document
   */
  generateDocument(config: OpenApiConfig, options?: OpenApiDocumentOptions): Promise<OpenAPIObject>;

  /**
   * Generate document for specific modules
   */
  generateModuleDocument(modules: ClassConstructor[], config: OpenApiConfig): Promise<OpenAPIObject>;

  /**
   * Update existing document with new endpoints
   */
  updateDocument(document: OpenAPIObject, endpoints: OpenApiEndpointMetadata[]): Promise<OpenAPIObject>;

  /**
   * Validate OpenAPI document
   */
  validateDocument(document: OpenAPIObject): Promise<{ isValid: boolean; errors: string[] }>;

  /**
   * Export document to file
   */
  exportDocument(document: OpenAPIObject, filePath: string, format: 'json' | 'yaml'): Promise<void>;

  /**
   * Get document statistics
   */
  getDocumentStats(document: OpenAPIObject): {
    endpointCount: number;
    schemaCount: number;
    tagCount: number;
    moduleCount: number;
  };
}

/**
 * OpenAPI Configuration Service Interface
 * Manages OpenAPI configuration and setup
 */
export interface IOpenApiConfigService {
  /**
   * Get current configuration
   */
  getConfig(): OpenApiConfig;

  /**
   * Update configuration
   */
  updateConfig(config: Partial<OpenApiConfig>): void;

  /**
   * Merge configurations
   */
  mergeConfigs(baseConfig: OpenApiConfig, overrideConfig: Partial<OpenApiConfig>): OpenApiConfig;

  /**
   * Validate configuration
   */
  validateConfig(config: OpenApiConfig): { isValid: boolean; errors: string[] };

  /**
   * Get environment-specific configuration
   */
  getEnvironmentConfig(environment: string): OpenApiConfig;

  /**
   * Reset to default configuration
   */
  resetToDefaults(): void;
}

/**
 * OpenAPI Service Interface
 * Main service that orchestrates OpenAPI functionality
 */
export interface IOpenApiService {
  /**
   * Initialize OpenAPI with configuration
   */
  initialize(config: OpenApiConfig): Promise<void>;

  /**
   * Setup Swagger UI
   */
  setupSwaggerUI(app: any, path?: string): Promise<void>;

  /**
   * Get current OpenAPI document
   */
  getDocument(): Promise<OpenAPIObject>;

  /**
   * Refresh OpenAPI document
   */
  refreshDocument(): Promise<OpenAPIObject>;

  /**
   * Register feature module
   */
  registerModule(moduleClass: ClassConstructor, metadata?: Partial<FeatureModuleMetadata>): void;

  /**
   * Get module endpoints
   */
  getModuleEndpoints(moduleClass: ClassConstructor): Promise<OpenApiEndpointMetadata[]>;

  /**
   * Health check for OpenAPI service
   */
  healthCheck(): Promise<{ status: 'healthy' | 'unhealthy'; details: any }>;

  /**
   * Get service statistics
   */
  getStats(): Promise<{
    totalEndpoints: number;
    totalModules: number;
    totalControllers: number;
    documentSize: number;
    lastUpdated: Date;
  }>;
}
