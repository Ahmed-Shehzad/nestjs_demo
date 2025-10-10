import { IsEmail, IsNotEmpty, IsOptional, IsString, MinLength } from 'class-validator';

/**
 * CreateUserRequestDto
 * Data Transfer Object for creating a new user
 */
export class CreateUserRequestDto {
  @IsEmail({}, { message: 'Email must be a valid email address' })
  @IsNotEmpty({ message: 'Email is required' })
  email: string;

  @IsOptional()
  @IsString({ message: 'First name must be a string' })
  firstName?: string;

  @IsOptional()
  @IsString({ message: 'Last name must be a string' })
  lastName?: string;

  @IsNotEmpty({ message: 'Password is required' })
  @MinLength(6, { message: 'Password must be at least 6 characters long' })
  password: string;
}

/**
 * CreateUserResponseDto
 * Response DTO for successful user creation
 */
export class CreateUserResponseDto {
  constructor(
    public readonly id: number,
    public readonly email: string,
    public readonly firstName: string | null,
    public readonly lastName: string | null,
    public readonly createdAt: Date,
  ) {}

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
