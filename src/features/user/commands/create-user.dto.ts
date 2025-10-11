import { ApiProperty } from '@nestjs/swagger';
import { IsOptional, IsString } from 'class-validator';

/**
 * CreateUserRequest
 * Data Transfer Object for creating a new user
 *
 * Note: Minimal class-validator decorators are used only for property mapping.
 * All validation logic is handled by CreateUserRequestValidator using fluent validation.
 */
export class CreateUserRequest {
  @ApiProperty({
    description: 'User email address (must be unique)',
    example: 'john.doe@example.com',
    format: 'email',
    maxLength: 255,
  })
  @IsOptional()
  @IsString()
  email: string;

  @ApiProperty({
    description: 'User first name',
    example: 'John',
    required: false,
    maxLength: 100,
  })
  @IsOptional()
  @IsString()
  firstName?: string;

  @ApiProperty({
    description: 'User last name',
    example: 'Doe',
    required: false,
    maxLength: 100,
  })
  @IsOptional()
  @IsString()
  lastName?: string;

  @ApiProperty({
    description: 'User password (must be secure)',
    example: 'SecurePassword123!',
    format: 'password',
    minLength: 8,
    maxLength: 128,
  })
  @IsOptional()
  @IsString()
  password: string;
}

/**
 * CreateUserResponseDto
 * Response DTO for successful user creation
 */
export class CreateUserResponseDto {
  @ApiProperty({
    description: 'Unique user identifier',
    example: 123,
    type: 'integer',
  })
  public readonly id: number;

  @ApiProperty({
    description: 'User email address',
    example: 'john.doe@example.com',
    format: 'email',
  })
  public readonly email: string;

  @ApiProperty({
    description: 'User first name',
    example: 'John',
    nullable: true,
  })
  public readonly firstName: string | null;

  @ApiProperty({
    description: 'User last name',
    example: 'Doe',
    nullable: true,
  })
  public readonly lastName: string | null;

  @ApiProperty({
    description: 'Account creation timestamp',
    example: '2025-10-11T14:30:00.000Z',
    type: 'string',
    format: 'date-time',
  })
  public readonly createdAt: Date;

  constructor(id: number, email: string, firstName: string | null, lastName: string | null, createdAt: Date) {
    this.id = id;
    this.email = email;
    this.firstName = firstName;
    this.lastName = lastName;
    this.createdAt = createdAt;
  }

  static create(user: {
    id: number;
    email: string;
    firstName: string | null;
    lastName: string | null;
    createdAt: Date;
  }): CreateUserResponseDto {
    return new CreateUserResponseDto(user.id, user.email, user.firstName, user.lastName, user.createdAt);
  }
}
