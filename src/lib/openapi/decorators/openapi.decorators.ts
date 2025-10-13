import { SetMetadata } from '@nestjs/common';

/**
 * Metadata key for OpenAPI feature modules
 */
export const OPENAPI_FEATURE_METADATA = 'openapi:feature';

/**
 * Decorator to mark a module as an OpenAPI feature module
 * This follows the same pattern as the mediator decorators
 * @param metadata - Feature metadata for OpenAPI documentation
 * @example
 * ```typescript
 * @OpenApiFeature({
 *   name: 'Users',
 *   description: 'User management endpoints',
 *   version: '1.0.0'
 * })
 * @Module({
 *   controllers: [UserController],
 *   providers: [UserService]
 * })
 * export class UserModule {}
 * ```
 */
export function OpenApiFeature(metadata: { name: string; description?: string; version?: string; tags?: string[] }) {
  return SetMetadata(OPENAPI_FEATURE_METADATA, metadata);
}

/**
 * Metadata key for OpenAPI endpoint configuration
 */
export const OPENAPI_ENDPOINT_METADATA = 'openapi:endpoint';

/**
 * Decorator to add enhanced OpenAPI metadata to controller methods
 * Complements @nestjs/swagger decorators with additional functionality
 * @param metadata - Enhanced endpoint metadata
 * @example
 * ```typescript
 * @Get()
 * @OpenApiEndpoint({
 *   summary: 'Get all users',
 *   description: 'Retrieve a paginated list of users',
 *   tags: ['Users'],
 *   operationId: 'getAllUsers'
 * })
 * async getAllUsers(@Query() query: GetUsersQuery) {
 *   return this.mediator.sendAsync(query);
 * }
 * ```
 */
export function OpenApiEndpoint(metadata: {
  summary?: string;
  description?: string;
  tags?: string[];
  operationId?: string;
  deprecated?: boolean;
}) {
  return SetMetadata(OPENAPI_ENDPOINT_METADATA, metadata);
}
