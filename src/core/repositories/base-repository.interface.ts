/**
 * Base Repository Interface
 *
 * Generic repository interface that provides common CRUD operations
 * for all entities in the system. This follows the Repository pattern
 * to abstract data access logic and improve testability.
 *
 * @template TEntity - The entity type
 * @template TId - The ID type (usually number or string)
 * @template TCreateInput - Input type for creating entities
 * @template TUpdateInput - Input type for updating entities
 * @template TFilterInput - Input type for filtering entities
 */
export interface IBaseRepository<TEntity, TId, TCreateInput, TUpdateInput, TFilterInput = any> {
  /**
   * Find entity by ID
   * @param id - Entity identifier
   * @returns Promise<TEntity | null>
   */
  findByIdAsync(id: TId): Promise<TEntity | null>;

  /**
   * Find all entities with optional filtering and pagination
   * @param filter - Optional filter criteria
   * @param skip - Number of records to skip
   * @param take - Number of records to take
   * @returns Promise<TEntity[]>
   */
  findManyAsync(filter?: TFilterInput, skip?: number, take?: number): Promise<TEntity[]>;

  /**
   * Find first entity matching criteria
   * @param filter - Filter criteria
   * @returns Promise<TEntity | null>
   */
  findFirstAsync(filter: TFilterInput): Promise<TEntity | null>;

  /**
   * Create new entity
   * @param data - Entity creation data
   * @returns Promise<TEntity>
   */
  createAsync(data: TCreateInput): Promise<TEntity>;

  /**
   * Update existing entity
   * @param id - Entity identifier
   * @param data - Update data
   * @returns Promise<TEntity>
   */
  updateAsync(id: TId, data: TUpdateInput): Promise<TEntity>;

  /**
   * Delete entity by ID
   * @param id - Entity identifier
   * @returns Promise<TEntity>
   */
  deleteAsync(id: TId): Promise<TEntity>;

  /**
   * Count entities matching criteria
   * @param filter - Optional filter criteria
   * @returns Promise<number>
   */
  countAsync(filter?: TFilterInput): Promise<number>;

  /**
   * Check if entity exists
   * @param id - Entity identifier
   * @returns Promise<boolean>
   */
  existsAsync(id: TId): Promise<boolean>;

  /**
   * Create multiple entities in batch
   * @param data - Array of entity creation data
   * @returns Promise<number> - Number of created entities
   */
  createManyAsync(data: TCreateInput[]): Promise<number>;

  /**
   * Update multiple entities matching criteria
   * @param filter - Filter criteria
   * @param data - Update data
   * @returns Promise<number> - Number of updated entities
   */
  updateManyAsync(filter: TFilterInput, data: TUpdateInput): Promise<number>;

  /**
   * Delete multiple entities matching criteria
   * @param filter - Filter criteria
   * @returns Promise<number> - Number of deleted entities
   */
  deleteManyAsync(filter: TFilterInput): Promise<number>;
}
