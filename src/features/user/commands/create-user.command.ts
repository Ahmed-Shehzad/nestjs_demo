import { FluentResult } from '@/fluent-results/types/fluent-results.types';
import { ICommand } from '@/mediator/types/request';

/**
 * CreateUserCommand
 * Command to create a new user in the system
 * In CQRS, commands should return void or at most an ID
 * Generated on: 2025-10-10T17:23:10.898Z
 * Feature: User
 */
export class CreateUserCommand implements ICommand<FluentResult<number>> {
  constructor(
    public readonly email: string,
    public readonly firstName: string | null,
    public readonly lastName: string | null,
    public readonly password: string,
  ) {}
}
