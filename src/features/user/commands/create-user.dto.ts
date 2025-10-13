import { IsOptional, IsString } from 'class-validator';

/**
 * CreateUserRequest
 * Data Transfer Object for creating a new user
 *
 * Note: Minimal class-validator decorators are used only for property mapping.
 * All validation logic is handled by CreateUserRequestValidator using fluent validation.
 */
export class CreateUserRequest {
  @IsOptional()
  @IsString()
  email!: string;

  @IsOptional()
  @IsString()
  firstName?: string;

  @IsOptional()
  @IsString()
  lastName?: string;

  @IsOptional()
  @IsString()
  password!: string;
}

/**
 * CreateUserResponseDto
 * Response DTO for successful user creation
 */
export class CreateUserResponseDto {
  public readonly id: number;

  public readonly email: string;

  public readonly firstName: string | null;

  public readonly lastName: string | null;

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
