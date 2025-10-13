import { DiscoveryService } from '@golevelup/nestjs-discovery';
import { Injectable, OnModuleInit } from '@nestjs/common';
import { METHOD_METADATA, PATH_METADATA } from '@nestjs/common/constants';
import { ModuleRef } from '@nestjs/core';
import { MetadataScanner } from '@nestjs/core/metadata-scanner';
import { IOpenApiDiscoveryService } from '../interfaces/openapi-service.interface';
import { ClassConstructor, FeatureModuleMetadata, OpenApiEndpointMetadata } from '../types/openapi.types';

/**
 * Service responsible for discovering OpenAPI-enabled controllers and endpoints.
 *
 * This service uses NestJS's DiscoveryService to scan the application at startup and build
 * internal registries of all controllers and their endpoints for OpenAPI documentation.
 * It maintains separate maps for different component types and provides fast lookup methods
 * for the OpenAPI system.
 *
 * The discovery process happens during module initialization and includes:
 * - Controllers with OpenAPI decorators
 * - Endpoints with HTTP method decorators
 * - Feature modules registered for OpenAPI
 * - API tags and metadata
 *
 * @example Controller discovery
 * ```typescript
 * // Controller with OpenAPI metadata
 * @Controller('users')
 * @ApiTags('Users')
 * export class UserController {
 *   @Get()
 *   @ApiOperation({ summary: 'Get all users' })
 *   async getAllUsers(): Promise<UserDto[]> {
 *     // Controller logic
 *   }
 * }
 * ```
 *
 * @see {@link DiscoveryService} - NestJS service for component discovery
 * @see {@link MetadataScanner} - NestJS service for method metadata scanning
 * @since 1.0.0
 */
@Injectable()
export class OpenApiDiscoveryService implements IOpenApiDiscoveryService, OnModuleInit {
  /** Map storing registered feature modules by module constructor */
  private readonly moduleMap = new Map<ClassConstructor, FeatureModuleMetadata>();

  /** Map storing controllers by module */
  private readonly controllersByModule = new Map<ClassConstructor, ClassConstructor[]>();

  /** Map storing endpoints by controller */
  private readonly endpointsByController = new Map<ClassConstructor, OpenApiEndpointMetadata[]>();

  /** Map storing endpoints by tag */
  private readonly endpointsByTag = new Map<string, OpenApiEndpointMetadata[]>();

  /** Set of all registered controllers */
  private readonly registeredControllers = new Set<ClassConstructor>();

  /**
   * Initializes the discovery service with NestJS discovery capabilities.
   *
   * @param discovery - NestJS discovery service for scanning decorated classes
   * @param moduleRef - NestJS module reference for accessing instances
   * @param metadataScanner - NestJS metadata scanner for method inspection
   */
  constructor(
    private readonly discovery: DiscoveryService,
    private readonly moduleRef: ModuleRef,
    private readonly metadataScanner: MetadataScanner,
  ) {}

  /**
   * Module initialization - discovers all controllers and their endpoints
   */
  async onModuleInit(): Promise<void> {
    await this.discoverControllers();
    await this.discoverEndpoints();
  }

  /**
   * Discover all feature modules registered with OpenAPI
   */
  discoverFeatureModules(): Promise<FeatureModuleMetadata[]> {
    return Promise.resolve(Array.from(this.moduleMap.values()));
  }

  /**
   * Discover endpoints from a specific module
   */
  discoverModuleEndpoints(moduleClass: ClassConstructor): Promise<OpenApiEndpointMetadata[]> {
    const controllers = this.controllersByModule.get(moduleClass) || [];
    const endpoints: OpenApiEndpointMetadata[] = [];

    for (const controller of controllers) {
      const controllerEndpoints = this.endpointsByController.get(controller) || [];
      endpoints.push(...controllerEndpoints);
    }

    return Promise.resolve(endpoints);
  }

  /**
   * Get all registered controllers
   */
  getRegisteredControllers(): ClassConstructor[] {
    return Array.from(this.registeredControllers);
  }

  /**
   * Get endpoints by controller
   */
  getEndpointsByController(controllerClass: ClassConstructor): OpenApiEndpointMetadata[] {
    return this.endpointsByController.get(controllerClass) || [];
  }

  /**
   * Get endpoints by tag
   */
  getEndpointsByTag(tag: string): OpenApiEndpointMetadata[] {
    return this.endpointsByTag.get(tag) || [];
  }

  /**
   * Register a feature module for OpenAPI discovery
   */
  registerFeatureModule(moduleClass: ClassConstructor, metadata?: Partial<FeatureModuleMetadata>): void {
    const defaultMetadata: FeatureModuleMetadata = {
      name: moduleClass.name,
      moduleClass,
      controllers: [],
      endpoints: [],
      tags: [],
      enabled: true,
      version: '1.0.0',
      description: `${moduleClass.name} feature module`,
    };

    const fullMetadata = { ...defaultMetadata, ...metadata };
    this.moduleMap.set(moduleClass, fullMetadata);
  }

  /**
   * Check if a module is registered
   */
  isModuleRegistered(moduleClass: ClassConstructor): boolean {
    return this.moduleMap.has(moduleClass);
  }

  /**
   * Discover all controllers in the application
   */
  private async discoverControllers(): Promise<void> {
    // Use providersWithMetaAtKey to find all classes with Controller metadata
    const controllerProviders = await this.discovery.providersWithMetaAtKey(PATH_METADATA);

    for (const { discoveredClass } of controllerProviders) {
      // Check if the class is actually a controller
      if (this.isController(discoveredClass.instance?.constructor || discoveredClass.injectType)) {
        const controllerClass = discoveredClass.instance?.constructor || discoveredClass.injectType;
        if (controllerClass) {
          this.registeredControllers.add(controllerClass as ClassConstructor);
        }
      }
    }
  }

  /**
   * Check if a class is a controller
   */
  private isController(target: any): boolean {
    if (!target) return false;
    // Check if the class has PATH_METADATA (indicating it's a controller)
    return Reflect.hasMetadata(PATH_METADATA, target);
  }

  /**
   * Discover all endpoints for registered controllers
   */
  private async discoverEndpoints(): Promise<void> {
    for (const controllerClass of this.registeredControllers) {
      const endpoints = this.scanControllerEndpoints(controllerClass);
      this.endpointsByController.set(controllerClass, endpoints);

      // Group endpoints by tags
      for (const endpoint of endpoints) {
        for (const tag of endpoint.tags || []) {
          const existingEndpoints = this.endpointsByTag.get(tag) || [];
          existingEndpoints.push(endpoint);
          this.endpointsByTag.set(tag, existingEndpoints);
        }
      }
    }
  }

  /**
   * Scan a controller for its endpoints
   */
  private scanControllerEndpoints(controllerClass: ClassConstructor): OpenApiEndpointMetadata[] {
    const endpoints: OpenApiEndpointMetadata[] = [];
    const controllerPath = Reflect.getMetadata(PATH_METADATA, controllerClass) || '';
    const controllerTags = this.getApiTags(controllerClass);

    const methodNames = Object.getOwnPropertyNames(controllerClass.prototype).filter((methodName) => {
      const descriptor = Object.getOwnPropertyDescriptor(controllerClass.prototype, methodName);
      return descriptor && typeof descriptor.value === 'function' && methodName !== 'constructor';
    });

    for (const methodName of methodNames) {
      const method = controllerClass.prototype[methodName];
      if (typeof method !== 'function') continue;

      const httpMethod = this.getHttpMethod(method);
      const methodPath = Reflect.getMetadata(PATH_METADATA, method) || '';

      if (httpMethod) {
        const endpoint: OpenApiEndpointMetadata = {
          controller: controllerClass.name,
          method: methodName,
          httpMethod,
          path: this.combinePaths(controllerPath, methodPath),
          tags: controllerTags,
          operationId: `${controllerClass.name}_${methodName}`,
          summary: this.getOperationSummary(method),
          description: this.getOperationDescription(method),
          controllerClass: controllerClass.name,
          methodName: methodName,
        };

        endpoints.push(endpoint);
      }
    }

    return endpoints;
  }

  /**
   * Get API tags from controller
   */
  private getApiTags(controllerClass: ClassConstructor): string[] {
    const apiTags = Reflect.getMetadata('swagger/apiUseTags', controllerClass);
    return apiTags ? [apiTags] : [controllerClass.name.replace('Controller', '')];
  }

  /**
   * Get HTTP method from method metadata
   */
  private getHttpMethod(method: any): string | undefined {
    const methodMetadata = Reflect.getMetadata(METHOD_METADATA, method);
    return methodMetadata;
  }

  /**
   * Get operation summary from method metadata
   */
  private getOperationSummary(method: any): string | undefined {
    return Reflect.getMetadata('swagger/apiOperation', method)?.summary;
  }

  /**
   * Get operation description from method metadata
   */
  private getOperationDescription(method: any): string | undefined {
    return Reflect.getMetadata('swagger/apiOperation', method)?.description;
  }

  /**
   * Combine controller and method paths
   */
  private combinePaths(controllerPath: string, methodPath: string): string {
    const controller = controllerPath.startsWith('/') ? controllerPath : `/${controllerPath}`;
    const method = methodPath.startsWith('/') ? methodPath : `/${methodPath}`;

    if (method === '/') {
      return controller;
    }

    return `${controller}${method}`.replace(/\/+/g, '/');
  }
}
