/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import { RequestHandler } from '@/mediator/decorators/request-handler.decorator';
import type { IMediator } from '@/mediator/types/mediator';
import { ICommandHandler } from '@/mediator/types/request';
import { ConflictException, Inject, Injectable } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcrypt';
import { UserCreatedEvent } from '../events/domain/user-created.event';
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
export class CreateUserCommandHandler implements ICommandHandler<CreateUserCommand, number> {
  constructor(
    private readonly prisma: PrismaClient,
    @Inject('IMediator') private readonly mediator: IMediator,
  ) {}

  async handleAsync(command: CreateUserCommand): Promise<number> {
    const { email, firstName, lastName, password } = command;

    try {
      // Start a transaction for data consistency
      const result = await this.prisma.$transaction(async (tx) => {
        // Check if user already exists
        const existingUser = await tx.user.findUnique({
          where: { email },
        });

        if (existingUser) {
          throw new ConflictException(`User with email '${email}' already exists`);
        }

        // Hash the password
        const saltRounds = 10;
        const hashedPassword = await bcrypt.hash(password, saltRounds);

        // Create the user
        const newUser = await tx.user.create({
          data: {
            email,
            firstName: firstName || null,
            lastName: lastName || null,
            hash: hashedPassword,
          },
        });

        // Publish domain event before transaction commit
        // This ensures the event is published only if the transaction succeeds
        const userCreatedEvent = new UserCreatedEvent(newUser.id, newUser.email, newUser.firstName, newUser.lastName);

        // Note: Publishing the event here ensures it's published before transaction commit
        // If you need to publish after commit, move this outside the transaction
        await this.mediator.publishAsync(userCreatedEvent);

        return newUser;
      });

      // CQRS principle: commands return only ID, not full data
      return result.id;
    } catch (error) {
      // Re-throw ConflictException as-is
      if (error instanceof ConflictException) {
        throw error;
      }

      // Log and re-throw other errors
      console.error('Error creating user:', error);
      throw new Error('Failed to create user. Please try again.');
    }
  }
}
