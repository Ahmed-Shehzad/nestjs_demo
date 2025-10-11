import { PrismaService } from '@/core/prisma.service';
import { isProblemDetailsException } from '@/problem-details/exceptions/problem-details.exceptions';
import { ProblemDetailsService } from '@/problem-details/services/problem-details.service';
import { HttpStatus, Injectable } from '@nestjs/common';
import * as bcrypt from 'bcrypt';

/**
 * Enhanced User Service
 *
 * Service layer that demonstrates proper Problem Details integration
 * for common user operations with meaningful error responses.
 */
@Injectable()
export class UserService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly problemDetailsService: ProblemDetailsService,
  ) {
    // Ensure services are properly injected
    if (!this.problemDetailsService) {
      throw new Error('ProblemDetailsService is required');
    }
  }

  /**
   * Check if user exists by email
   * Throws Problem Details exception if user not found
   */
  async getUserByEmail(email: string) {
    try {
      const user = await this.prisma.user.findUnique({
        where: { email },
        select: {
          id: true,
          email: true,
          firstName: true,
          lastName: true,
          createdAt: true,
          updatedAt: true,
        },
      });

      if (!user) {
        throw this.problemDetailsService.createDomainProblem(
          HttpStatus.NOT_FOUND,
          'User Not Found',
          `No user found with email address '${email}'.`,
          'USER_NOT_FOUND',
          {
            searchCriteria: 'email',
            searchValue: email,
          },
        );
      }

      return user;
    } catch (error) {
      // Re-throw Problem Details exceptions
      if (isProblemDetailsException(error)) {
        throw error;
      }

      // Handle database errors with Problem Details
      throw this.problemDetailsService.createDomainProblem(
        HttpStatus.INTERNAL_SERVER_ERROR,
        'Database Error',
        'An error occurred while retrieving user information.',
        'DATABASE_ERROR',
        {
          operation: 'getUserByEmail',
          email,
        },
      );
    }
  }

  /**
   * Get user by ID with enhanced error handling
   */
  async getUserById(id: number) {
    try {
      const user = await this.prisma.user.findUnique({
        where: { id },
        select: {
          id: true,
          email: true,
          firstName: true,
          lastName: true,
          createdAt: true,
          updatedAt: true,
        },
      });

      if (!user) {
        throw this.problemDetailsService.createDomainProblem(
          HttpStatus.NOT_FOUND,
          'User Not Found',
          `No user found with ID ${id}.`,
          'USER_NOT_FOUND',
          {
            searchCriteria: 'id',
            searchValue: id,
          },
        );
      }

      return user;
    } catch (error) {
      // Re-throw Problem Details exceptions
      if (isProblemDetailsException(error)) {
        throw error;
      }

      // Handle database errors
      throw this.problemDetailsService.createDomainProblem(
        HttpStatus.INTERNAL_SERVER_ERROR,
        'Database Error',
        'An error occurred while retrieving user information.',
        'DATABASE_ERROR',
        {
          operation: 'getUserById',
          userId: id,
        },
      );
    }
  }

  /**
   * Validate user credentials with enhanced error responses
   */
  async validateUserCredentials(email: string, password: string) {
    try {
      const user = await this.prisma.user.findUnique({
        where: { email },
        select: {
          id: true,
          email: true,
          hash: true,
          firstName: true,
          lastName: true,
        },
      });

      if (!user) {
        throw this.problemDetailsService.createSecurityProblem(
          HttpStatus.UNAUTHORIZED,
          'Invalid Credentials',
          'authentication',
          'The provided email or password is incorrect.',
          'Please check your credentials and try again.',
        );
      }

      // Compare password with hash
      const isPasswordValid = await bcrypt.compare(password, user.hash);

      if (!isPasswordValid) {
        throw this.problemDetailsService.createSecurityProblem(
          HttpStatus.UNAUTHORIZED,
          'Invalid Credentials',
          'authentication',
          'The provided email or password is incorrect.',
          'Please check your credentials and try again.',
        );
      }

      return {
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
      };
    } catch (error) {
      // Re-throw Problem Details exceptions
      if (isProblemDetailsException(error)) {
        throw error;
      }

      // Handle unexpected errors
      throw this.problemDetailsService.createSecurityProblem(
        HttpStatus.INTERNAL_SERVER_ERROR,
        'Authentication Error',
        'authentication',
        'An error occurred during authentication.',
        'Please try again later or contact support if the problem persists.',
      );
    }
  }

  /**
   * Check if email is already taken
   * Returns Problem Details exception for conflicts
   */
  async checkEmailAvailability(email: string) {
    try {
      const existingUser = await this.prisma.user.findUnique({
        where: { email },
        select: { id: true },
      });

      if (existingUser) {
        throw this.problemDetailsService.createDomainProblem(
          HttpStatus.CONFLICT,
          'Email Already Taken',
          `A user with email address '${email}' already exists.`,
          'EMAIL_CONFLICT',
          {
            email,
            conflictType: 'duplicate_email',
          },
        );
      }

      return { available: true };
    } catch (error) {
      // Re-throw Problem Details exceptions
      if (isProblemDetailsException(error)) {
        throw error;
      }

      // Handle database errors
      throw this.problemDetailsService.createDomainProblem(
        HttpStatus.INTERNAL_SERVER_ERROR,
        'Database Error',
        'An error occurred while checking email availability.',
        'DATABASE_ERROR',
        {
          operation: 'checkEmailAvailability',
          email,
        },
      );
    }
  }
}
