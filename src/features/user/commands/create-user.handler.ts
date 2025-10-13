import { FluentResult } from '@/fluent-results/types/fluent-results.types';
import { InjectMediator } from '@/mediator/decorators/inject-mediator.decorator';
import { RequestHandler } from '@/mediator/decorators/request-handler.decorator';
import type { IMediator } from '@/mediator/types/mediator';
import { ICommandHandler } from '@/mediator/types/request';
import { isProblemDetailsException } from '@/problem-details/exceptions/problem-details.exceptions';
import { ProblemDetailsService } from '@/problem-details/services/problem-details.service';
import { Injectable } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { UserCreatedEvent } from '../events/domain/user-created.event';
import { UserRepository } from '../repositories/user.repository';
import { CreateUserCommand } from './create-user.command';

/**
 * CreateUserCommandHandler
 * Handles CreateUserCommand and publishes UserCreatedEvent
 * Following CQRS principles: commands return only ID, not full data
 * Generated on: 2025-10-10T17:23:10.900Z
 * Feature: User
 */
@Injectable()
@RequestHandler(CreateUserCommand)
export class CreateUserCommandHandler implements ICommandHandler<CreateUserCommand, FluentResult<number>> {
  constructor(
    private readonly userRepository: UserRepository,
    @InjectMediator() private readonly mediator: IMediator,
    private readonly problemDetailsService: ProblemDetailsService,
  ) {}

  async handleAsync(command: CreateUserCommand): Promise<FluentResult<number>> {
    const { email, firstName, lastName, password } = command;

    try {
      return await this.userRepository.unitOfWork.executeWithManualTransactionAsync(async () => {
        // Check if user already exists using repository
        const existingUser = await this.userRepository.findByEmailAsync(email);

        if (existingUser) {
          throw this.problemDetailsService.createDuplicateEmail(email);
        }

        // Hash the password
        const saltRounds = 10;
        const hashedPassword = await bcrypt.hash(password, saltRounds);

        // Create the user using repository
        const newUser = await this.userRepository.createAsync({
          email,
          firstName: firstName || null,
          lastName: lastName || null,
          hash: hashedPassword,
        });

        console.log('✅ User created successfully with ID:', newUser.id);

        // Publish domain event
        await this.mediator.publishAsync(
          new UserCreatedEvent(newUser.id, newUser.email, newUser.firstName, newUser.lastName),
        );

        await this.userRepository.unitOfWork.commitAsync();

        // CQRS principle: commands return only ID, not full data
        return FluentResult.success(newUser.id);
      });
    } catch (error) {
      // Re-throw Problem Details exceptions
      if (isProblemDetailsException(error)) {
        throw error;
      }
      return FluentResult.failure<number>('An error occurred while creating the user.', 'USER_CREATION_FAILED', {
        originalError: error instanceof Error ? error.message : String(error),
      });
    }
  }
}
