import { Injectable } from '@nestjs/common';
import type { IOpenApiConfigService } from '../interfaces/openapi-service.interface';
import { OpenApiConfig } from '../types/openapi.types';

/**
 * OpenAPI Configuration Service
 * Manages OpenAPI configuration and setup
 */
@Injectable()
export class OpenApiConfigService implements IOpenApiConfigService {
  private config: OpenApiConfig;

  constructor() {
    this.config = this.getDefaultConfig();
  }

  /**
   * Get current configuration
   */
  getConfig(): OpenApiConfig {
    return { ...this.config };
  }

  /**
   * Update configuration
   */
  updateConfig(config: Partial<OpenApiConfig>): void {
    this.config = { ...this.config, ...config };
  }

  /**
   * Merge configurations
   */
  mergeConfigs(baseConfig: OpenApiConfig, overrideConfig: Partial<OpenApiConfig>): OpenApiConfig {
    return { ...baseConfig, ...overrideConfig };
  }

  /**
   * Validate configuration
   */
  validateConfig(config: OpenApiConfig): { isValid: boolean; errors: string[] } {
    const errors: string[] = [];

    if (!config.title || config.title.trim() === '') {
      errors.push('Title is required');
    }

    if (!config.version || config.version.trim() === '') {
      errors.push('Version is required');
    }

    if (!config.description || config.description.trim() === '') {
      errors.push('Description is required');
    }

    return {
      isValid: errors.length === 0,
      errors,
    };
  }

  /**
   * Get environment-specific configuration
   */
  getEnvironmentConfig(environment: string): OpenApiConfig {
    const baseConfig = this.getDefaultConfig();

    switch (environment.toLowerCase()) {
      case 'development':
        return {
          ...baseConfig,
          servers: [{ url: 'http://localhost:3000', description: 'Development server' }],
        };
      case 'staging':
        return {
          ...baseConfig,
          servers: [{ url: 'https://staging-api.example.com', description: 'Staging server' }],
        };
      case 'production':
        return {
          ...baseConfig,
          servers: [{ url: 'https://api.example.com', description: 'Production server' }],
        };
      default:
        return baseConfig;
    }
  }

  /**
   * Reset to default configuration
   */
  resetToDefaults(): void {
    this.config = this.getDefaultConfig();
  }

  /**
   * Get default configuration
   */
  private getDefaultConfig(): OpenApiConfig {
    return {
      title: 'NestJS WebAPI',
      description: 'A comprehensive NestJS API with Clean Architecture, CQRS, and DDD patterns',
      version: '1.0.0',
      contact: {
        name: 'API Support',
        email: 'support@example.com',
      },
      license: {
        name: 'MIT',
        url: 'https://opensource.org/licenses/MIT',
      },
      servers: [
        {
          url: 'http://localhost:3000',
          description: 'Local development server',
        },
      ],
      tags: [
        {
          name: 'Users',
          description: 'User management endpoints',
        },
        {
          name: 'Bookmarks',
          description: 'Bookmark management endpoints',
        },
      ],
    };
  }
}
