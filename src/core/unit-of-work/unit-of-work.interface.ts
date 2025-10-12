/**
 * Unit of Work Interface
 *
 * The Unit of Work pattern maintains a list of objects affected by a business transaction
 * and coordinates writing out changes and resolving concurrency problems.
 *
 * This interface provides atomic transaction support with the ability to:
 * - Begin transactions
 * - Commit changes (make them permanent)
 * - Rollback changes (cancel all operations)
 * - Access repositories within the transaction context
 */
export interface IUnitOfWork {
  /**
   * Begin a new transaction
   * @returns Promise<void>
   */
  beginTransactionAsync(): Promise<void>;

  /**
   * Commit the current transaction
   * All changes made within the transaction will be persisted
   * @returns Promise<void>
   */
  commitAsync(): Promise<void>;

  /**
   * Rollback the current transaction
   * All changes made within the transaction will be discarded
   * @returns Promise<void>
   */
  rollbackAsync(): Promise<void>;

  /**
   * Execute a function within a transaction context (AUTOMATIC mode)
   * The transaction will be automatically committed if successful,
   * or rolled back if an error occurs
   *
   * @template T - Return type of the operation
   * @param operation - Function to execute within transaction
   * @returns Promise<T>
   */
  executeInTransactionAsync<T>(operation: (uow: IUnitOfWork) => Promise<T>): Promise<T>;

  /**
   * Execute operations within a manual transaction context
   * You must explicitly call commitAsync() to save changes to the database
   * or rollbackAsync() to discard changes
   *
   * @template T - Return type of the operation
   * @param operation - Function to execute within transaction
   * @returns Promise<T> - Returns result but does NOT commit automatically
   */
  executeWithManualTransactionAsync<T>(operation: () => Promise<T>): Promise<T>;

  /**
   * Check if currently within a transaction
   * @returns boolean
   */
  isInTransaction(): boolean;

  /**
   * Get the current transaction context (Prisma transaction client)
   * This allows repositories to use the transactional client
   * @returns any - Prisma transaction client or null
   */
  getTransactionContext(): any;
}
