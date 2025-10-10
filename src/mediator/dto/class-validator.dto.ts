import {
  IsEmail,
  IsNotEmpty,
  IsNumber,
  Min,
  Max,
  MinLength,
  Matches,
  IsOptional,
} from 'class-validator';

export class CreateUserWithClassValidatorDto {
  @IsNotEmpty({ message: 'Name is required' })
  @MinLength(2, { message: 'Name must be at least 2 characters' })
  name: string;

  @IsNotEmpty({ message: 'Email is required' })
  @IsEmail({}, { message: 'Please provide a valid email address' })
  email: string;

  @IsNumber({}, { message: 'Age must be a number' })
  @Min(18, { message: 'You must be at least 18 years old' })
  @Max(120, { message: 'Age must be realistic' })
  age: number;

  @IsNotEmpty({ message: 'Password is required' })
  @MinLength(8, { message: 'Password must be at least 8 characters' })
  @Matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])/, {
    message:
      'Password must contain uppercase, lowercase, number and special character',
  })
  password: string;
}

export class UpdateUserWithClassValidatorDto {
  @IsOptional()
  @MinLength(2, { message: 'Name must be at least 2 characters when provided' })
  name?: string;

  @IsOptional()
  @IsEmail(
    {},
    { message: 'Please provide a valid email address when provided' },
  )
  email?: string;

  @IsOptional()
  @IsNumber({}, { message: 'Age must be a number when provided' })
  @Min(18, { message: 'Age must be at least 18 when provided' })
  @Max(120, { message: 'Age must be realistic when provided' })
  age?: number;
}

export class CreateProductWithClassValidatorDto {
  @IsNotEmpty({ message: 'Product name is required' })
  @MinLength(3, { message: 'Product name must be at least 3 characters' })
  name: string;

  @IsNotEmpty({ message: 'Product description is required' })
  @MinLength(10, { message: 'Description must be at least 10 characters' })
  description: string;

  @IsNumber({}, { message: 'Price must be a number' })
  @Min(0.01, { message: 'Price must be greater than 0' })
  @Max(1000000, { message: 'Price cannot exceed $1,000,000' })
  price: number;

  @IsNotEmpty({ message: 'Category is required' })
  @Matches(/^(electronics|clothing|books|home|sports)$/i, {
    message:
      'Category must be one of: electronics, clothing, books, home, sports',
  })
  category: string;
}
