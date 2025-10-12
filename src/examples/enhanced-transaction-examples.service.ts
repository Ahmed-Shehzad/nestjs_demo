import { UnitOfWork } from '@/core/unit-of-work/unit-of-work.service';
import { UserRepository } from '@/features/user/repositories/user.repository';
import { DatabaseProblemDetailsException } from '@/problem-details/exceptions/problem-details.exceptions';
import { Injectable, Logger } from '@nestjs/common';

/**
 * Example service demonstrating enhanced database error handling with UnitOfWork
 */
@Injectable()
export class TransactionExampleService {
  private readonly logger = new Logger(TransactionExampleService.name);

  constructor(
    private readonly unitOfWork: UnitOfWork,
    private readonly userRepository: UserRepository,
  ) {}

  /**
   * Example: Creating a user with automatic database error handling
   * Any database errors will be automatically converted to DatabaseProblemDetailsException
   */
  async createUserWithEnhancedErrorHandling(email: string, firstName: string): Promise<any> {
    try {
      return await this.unitOfWork.executeInTransactionAsync(async () => {
        // This operation might throw Prisma errors (P2002 for unique constraint, etc.)
        const user = await this.userRepository.createAsync({
          email,
          firstName,
          lastName: 'Example',
          hash: 'temp-hash',
        });

        this.logger.log(`Created user with ID: ${user.id}`);
        return user;
      });
    } catch (error) {
      // Database errors are automatically converted to DatabaseProblemDetailsException
      if (error instanceof DatabaseProblemDetailsException) {
        const problemDetails = error.getProblemDetails();
        this.logger.error(`Database error creating user: ${problemDetails.title}`, {
          code: problemDetails.code,
          detail: problemDetails.detail,
          traceId: problemDetails.traceId,
        });

        // You can now handle specific database error types
        if (problemDetails.code === 'P2002') {
          this.logger.warn(`Duplicate email attempted: ${email}`);
        }
      }

      throw error; // Re-throw for upstream handling
    }
  }

  /**
   * Example: Manual transaction with rollback and database error handling
   */
  async createUserWithManualTransaction(email: string): Promise<any> {
    try {
      const result = await this.unitOfWork.executeWithManualTransactionAsync(async () => {
        // Create user within transaction
        const user = await this.userRepository.createAsync({
          email,
          firstName: 'Manual',
          lastName: 'Transaction',
          hash: 'temp-hash',
        });

        // Simulate some validation that might fail
        if (email.includes('invalid')) {
          throw new Error('Invalid email pattern');
        }

        return user;
      });

      // Explicitly commit the transaction to save changes
      await this.unitOfWork.commitAsync();
      this.logger.log('User created and committed successfully');

      return result;
    } catch (error) {
      // If this is a database error, it's already been converted to DatabaseProblemDetailsException
      if (error instanceof DatabaseProblemDetailsException) {
        const problemDetails = error.getProblemDetails();
        this.logger.error(`Database error during manual transaction: ${problemDetails.title}`);

        // Handle specific database error scenarios
        switch (problemDetails.code) {
          case 'P2002':
            this.logger.warn('Unique constraint violation during user creation');
            break;
          case 'P2024':
            this.logger.error('Database timeout during transaction');
            break;
          default:
            this.logger.error(`Unexpected database error: ${problemDetails.code}`);
        }
      }

      throw error;
    }
  }
}
