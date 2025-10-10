import { IsEmail, IsNotEmpty, IsNumber, Min, MinLength } from 'class-validator';

export class CreateUserDto {
  @IsNotEmpty({ message: 'Name is required' })
  @MinLength(2, { message: 'Name must be at least 2 characters' })
  name: string;

  @IsNotEmpty({ message: 'Email is required' })
  @IsEmail({}, { message: 'Please provide a valid email address' })
  email: string;

  @IsNumber({}, { message: 'Age must be a number' })
  @Min(18, { message: 'You must be at least 18 years old' })
  age: number;

  @IsNotEmpty({ message: 'Password is required' })
  @MinLength(8, { message: 'Password must be at least 8 characters' })
  password: string;
}

export class UpdateUserDto {
  name?: string;
  email?: string;
  age?: number;
}

export class CreateProductDto {
  name: string;
  description: string;
  price: number;
  category: string;
}
