import { Injectable } from '@nestjs/common';
import { DocumentBuilder, OpenAPIObject } from '@nestjs/swagger';
import { writeFile } from 'fs/promises';
import { dump as yamlDump } from 'js-yaml';
import { OpenApiDiscoveryService } from '../discovery/openapi-discovery.service';
import type { IOpenApiDocumentService } from '../interfaces/openapi-service.interface';
import {
  ClassConstructor,
  OpenApiConfig,
  OpenApiDocumentOptions,
  OpenApiEndpointMetadata,
} from '../types/openapi.types';

/**
 * OpenAPI Document Service
 * Handles generation and management of OpenAPI documents
 */
@Injectable()
export class OpenApiDocumentService implements IOpenApiDocumentService {
  constructor(private readonly discoveryService: OpenApiDiscoveryService) {}

  /**
   * Generate OpenAPI document
   */
  async generateDocument(config: OpenApiConfig, _options?: OpenApiDocumentOptions): Promise<OpenAPIObject> {
    const documentBuilder = new DocumentBuilder()
      .setTitle(config.title)
      .setDescription(config.description)
      .setVersion(config.version);

    // Add contact information
    if (config.contact) {
      documentBuilder.setContact(config.contact.name || '', config.contact.url || '', config.contact.email || '');
    }

    // Add license information
    if (config.license) {
      documentBuilder.setLicense(config.license.name || '', config.license.url || '');
    }

    // Add servers
    if (config.servers) {
      config.servers.forEach((server) => {
        documentBuilder.addServer(server.url, server.description);
      });
    }

    // Add tags
    if (config.tags) {
      config.tags.forEach((tag) => {
        documentBuilder.addTag(tag.name, tag.description);
      });
    }

    const documentConfig = documentBuilder.build();

    // For now, return the base document
    // In a real implementation, you would use SwaggerModule.createDocument
    // with the actual NestJS application instance
    return Promise.resolve({
      ...documentConfig,
      paths: {},
      components: {
        schemas: {},
      },
    } as OpenAPIObject);
  }

  /**
   * Generate document for specific modules
   */
  async generateModuleDocument(modules: ClassConstructor[], config: OpenApiConfig): Promise<OpenAPIObject> {
    // Filter endpoints to only include those from specified modules
    const moduleEndpoints: OpenApiEndpointMetadata[] = [];

    for (const moduleClass of modules) {
      const endpoints = await this.discoveryService.discoverModuleEndpoints(moduleClass);
      moduleEndpoints.push(...endpoints);
    }

    // Generate base document
    const baseDocument = await this.generateDocument(config);

    // Update with module-specific endpoints
    return await this.updateDocument(baseDocument, moduleEndpoints);
  }

  /**
   * Update existing document with new endpoints
   */
  async updateDocument(document: OpenAPIObject, endpoints: OpenApiEndpointMetadata[]): Promise<OpenAPIObject> {
    // Create a copy of the document
    const updatedDocument = { ...document };

    // Add new paths for endpoints
    // This is a simplified implementation
    endpoints.forEach((endpoint) => {
      const path = endpoint.path;
      const method = endpoint.method?.toLowerCase() || endpoint.httpMethod?.toLowerCase() || 'get';

      if (!updatedDocument.paths) {
        updatedDocument.paths = {};
      }

      if (!updatedDocument.paths[path]) {
        updatedDocument.paths[path] = {};
      }

      updatedDocument.paths[path][method] = {
        operationId: endpoint.operationId,
        summary: endpoint.summary,
        description: endpoint.description,
        tags: endpoint.tags,
        deprecated: endpoint.deprecated,
        responses: {
          '200': {
            description: 'Success',
          },
        },
      };
    });

    return Promise.resolve(updatedDocument);
  }

  /**
   * Validate OpenAPI document
   */
  async validateDocument(document: OpenAPIObject): Promise<{ isValid: boolean; errors: string[] }> {
    const errors: string[] = [];

    // Basic validation
    if (!document.openapi) {
      errors.push('Missing OpenAPI version');
    }

    if (!document.info?.title) {
      errors.push('Missing document title');
    }

    if (!document.info?.version) {
      errors.push('Missing document version');
    }

    return Promise.resolve({
      isValid: errors.length === 0,
      errors,
    });
  }

  /**
   * Export document to file
   */
  async exportDocument(document: OpenAPIObject, filePath: string, format: 'json' | 'yaml'): Promise<void> {
    let content: string;

    if (format === 'yaml') {
      content = yamlDump(document, { indent: 2, lineWidth: -1 });
    } else {
      content = JSON.stringify(document, null, 2);
    }

    await writeFile(filePath, content, 'utf8');
  }

  /**
   * Get document statistics
   */
  getDocumentStats(document: OpenAPIObject): {
    endpointCount: number;
    schemaCount: number;
    tagCount: number;
    moduleCount: number;
  } {
    const paths = document.paths || {};
    let endpointCount = 0;

    // Count endpoints
    Object.values(paths).forEach((pathItem: Record<string, any>) => {
      const methods = ['get', 'post', 'put', 'patch', 'delete', 'options', 'head'];
      methods.forEach((method) => {
        if (pathItem && typeof pathItem === 'object' && method in pathItem && pathItem[method]) {
          endpointCount++;
        }
      });
    });

    const schemaCount = Object.keys(document.components?.schemas || {}).length;
    const tagCount = (document.tags || []).length;

    // Module count is estimated from unique tag prefixes
    const uniqueTags = new Set(
      (document.tags || []).map((tag: { name?: string }) => tag?.name || 'unknown').filter(Boolean),
    );
    const moduleCount = uniqueTags.size;

    return {
      endpointCount,
      schemaCount,
      tagCount,
      moduleCount,
    };
  }
}
