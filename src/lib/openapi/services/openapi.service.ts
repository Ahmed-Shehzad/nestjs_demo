import { Injectable } from '@nestjs/common';
import { INestApplication } from '@nestjs/common/interfaces';
import { OpenAPIObject, SwaggerModule } from '@nestjs/swagger';
import { OpenApiDiscoveryService } from '../discovery/openapi-discovery.service';
import type { IOpenApiService } from '../interfaces/openapi-service.interface';
import {
  ClassConstructor,
  FeatureModuleMetadata,
  OpenApiConfig,
  OpenApiEndpointMetadata,
} from '../types/openapi.types';
import { OpenApiConfigService } from './openapi-config.service';
import { OpenApiDocumentService } from './openapi-document.service';

/**
 * Main OpenAPI Service
 * Orchestrates OpenAPI functionality including document generation and Swagger UI setup
 */
@Injectable()
export class OpenApiService implements IOpenApiService {
  private app?: INestApplication;
  private document?: OpenAPIObject;
  private lastUpdated?: Date;

  constructor(
    private readonly discoveryService: OpenApiDiscoveryService,
    private readonly documentService: OpenApiDocumentService,
    private readonly configService: OpenApiConfigService,
  ) {}

  /**
   * Initialize OpenAPI with configuration
   */
  async initialize(config: OpenApiConfig): Promise<void> {
    this.configService.updateConfig(config);
    await this.refreshDocument();
  }

  /**
   * Setup Swagger UI
   */
  async setupSwaggerUI(app: INestApplication, path = '/api/docs'): Promise<void> {
    this.app = app;

    if (!this.document) {
      await this.refreshDocument();
    }

    if (this.document) {
      SwaggerModule.setup(path, app, this.document, {
        explorer: true,
        swaggerOptions: {
          persistAuthorization: true,
          displayRequestDuration: true,
        },
        customSiteTitle: 'API Documentation',
        customfavIcon: '/favicon.ico',
      });
    }
  }

  /**
   * Get current OpenAPI document
   */
  async getDocument(): Promise<OpenAPIObject> {
    if (!this.document) {
      await this.refreshDocument();
    }
    return this.document!;
  }

  /**
   * Refresh OpenAPI document
   */
  async refreshDocument(): Promise<OpenAPIObject> {
    const config = this.configService.getConfig();
    this.document = await this.documentService.generateDocument(config);
    this.lastUpdated = new Date();
    return this.document;
  }

  /**
   * Register feature module
   */
  registerModule(moduleClass: ClassConstructor, metadata?: Partial<FeatureModuleMetadata>): void {
    this.discoveryService.registerFeatureModule(moduleClass, metadata);
  }

  /**
   * Get module endpoints
   */
  async getModuleEndpoints(moduleClass: ClassConstructor): Promise<OpenApiEndpointMetadata[]> {
    return await this.discoveryService.discoverModuleEndpoints(moduleClass);
  }

  /**
   * Health check for OpenAPI service
   */
  async healthCheck(): Promise<{ status: 'healthy' | 'unhealthy'; details: any }> {
    try {
      const stats = await this.getStats();

      return {
        status: 'healthy',
        details: {
          ...stats,
          documentExists: !!this.document,
          swaggerSetup: !!this.app,
          lastHealthCheck: new Date().toISOString(),
        },
      };
    } catch (error) {
      return {
        status: 'unhealthy',
        details: {
          error: error instanceof Error ? error.message : 'Unknown error',
          lastHealthCheck: new Date().toISOString(),
        },
      };
    }
  }

  /**
   * Get service statistics
   */
  async getStats(): Promise<{
    totalEndpoints: number;
    totalModules: number;
    totalControllers: number;
    documentSize: number;
    lastUpdated: Date;
  }> {
    const modules = await this.discoveryService.discoverFeatureModules();
    const controllers = this.discoveryService.getRegisteredControllers();

    let totalEndpoints = 0;
    for (const controller of controllers) {
      const endpoints = this.discoveryService.getEndpointsByController(controller);
      totalEndpoints += endpoints.length;
    }

    const documentSize = this.document ? JSON.stringify(this.document).length : 0;

    return {
      totalEndpoints,
      totalModules: modules.length,
      totalControllers: controllers.length,
      documentSize,
      lastUpdated: this.lastUpdated || new Date(),
    };
  }
}
