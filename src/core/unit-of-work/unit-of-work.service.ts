import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma.service';
import { IUnitOfWork } from './unit-of-work.interface';

/**
 * Unit of Work Implementation using Prisma
 *
 * This implementation provides atomic transaction support with explicit commit/rollback control.
 * Changes are only persisted when commitAsync() is explicitly called.
 *
 * Features:
 * - Manual transaction control (begin/commit/rollback)
 * - Automatic transaction management via executeInTransactionAsync
 * - Nested transaction support
 * - Transaction timeout configuration
 * - Logging for debugging and monitoring
 */
@Injectable()
export class UnitOfWork implements IUnitOfWork {
  private readonly logger = new Logger(UnitOfWork.name);
  private transactionContext: any = null;
  private isTransactionActive = false;
  private transactionPromise: Promise<any> | null = null;
  private commitResolve: ((value?: any) => void) | null = null;
  private rollbackReject: ((reason?: any) => void) | null = null;

  constructor(private readonly prisma: PrismaService) {}

  async beginTransactionAsync(): Promise<void> {
    if (this.isTransactionActive) {
      this.logger.warn('Transaction is already active. Nested transactions are handled by Prisma automatically.');
      return;
    }

    this.logger.debug('Beginning new transaction');
    this.isTransactionActive = true;

    // Start the transaction but don't auto-commit
    this.transactionPromise = new Promise((resolve, reject) => {
      this.commitResolve = resolve;
      this.rollbackReject = reject;
    });

    // Initialize the transaction context
    await this.initializeTransactionContext();
  }

  async commitAsync(): Promise<void> {
    if (!this.isTransactionActive) {
      this.logger.warn('No active transaction to commit');
      return;
    }

    this.logger.debug('Committing transaction');

    if (this.commitResolve) {
      this.commitResolve();
      await this.transactionPromise;
    }

    this.cleanup();
  }

  async rollbackAsync(): Promise<void> {
    if (!this.isTransactionActive) {
      this.logger.warn('No active transaction to rollback');
      return;
    }

    this.logger.debug('Rolling back transaction');

    if (this.rollbackReject) {
      this.rollbackReject(new Error('Transaction rolled back explicitly'));
    }

    await Promise.resolve(); // Make async meaningful
    this.cleanup();
  }

  private async initializeTransactionContext(): Promise<void> {
    // Start a Prisma transaction that waits for explicit commit/rollback
    await this.prisma
      .$transaction(
        async (tx) => {
          this.transactionContext = tx;
          this.logger.debug('Transaction context initialized');

          // Wait for explicit commit or rollback
          await this.transactionPromise;
        },
        {
          maxWait: 5000,
          timeout: 30000,
          isolationLevel: 'ReadCommitted',
        },
      )
      .catch((error: any) => {
        this.logger.debug('Transaction ended:', (error as Error)?.message || 'Rolled back');
        this.cleanup();
      });
  }

  private cleanup(): void {
    this.isTransactionActive = false;
    this.transactionContext = null;
    this.transactionPromise = null;
    this.commitResolve = null;
    this.rollbackReject = null;
  }

  async executeInTransactionAsync<T>(operation: (uow: IUnitOfWork) => Promise<T>): Promise<T> {
    const startTime = Date.now();
    this.logger.debug('Starting transaction execution');

    try {
      const result = await this.prisma.$transaction(
        async (tx) => {
          // Set the transaction context for repositories to use
          // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
          const previousContext: any = this.transactionContext;
          const wasActive = this.isTransactionActive;

          this.transactionContext = tx;
          this.isTransactionActive = true;

          try {
            const operationResult = await operation(this);
            this.logger.debug(`Transaction completed successfully in ${Date.now() - startTime}ms`);
            return operationResult;
          } finally {
            // Restore previous state for nested transactions
            // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
            this.transactionContext = previousContext;
            this.isTransactionActive = wasActive;
          }
        },
        {
          maxWait: 5000, // 5 seconds max wait time
          timeout: 30000, // 30 seconds timeout
          isolationLevel: 'ReadCommitted', // Default isolation level
        },
      );

      return result;
    } catch (error) {
      const duration = Date.now() - startTime;
      this.logger.error(`Transaction failed after ${duration}ms:`, error);

      // Ensure state is cleaned up on error
      this.isTransactionActive = false;
      this.transactionContext = null;

      throw error;
    }
  }

  async executeWithManualTransactionAsync<T>(operation: () => Promise<T>): Promise<T> {
    if (this.isTransactionActive) {
      // If already in a transaction, just execute the operation
      return await operation();
    }

    // Begin a new manual transaction
    await this.beginTransactionAsync();

    try {
      const result = await operation();

      // Note: Changes are NOT automatically committed!
      // Caller must explicitly call commitAsync() to save changes
      this.logger.debug('Manual transaction operation completed. Call commitAsync() to save changes.');

      return result;
    } catch (error) {
      // Auto-rollback on error
      await this.rollbackAsync();
      throw error;
    }
  }

  isInTransaction(): boolean {
    return this.isTransactionActive;
  }

  getTransactionContext(): any {
    return this.transactionContext || this.prisma;
  }
}
