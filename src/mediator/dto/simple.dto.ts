// Simple DTOs without decorators for basic validation pipe testing
export class SimpleCreateUserDto {
  name: string;
  email: string;
  age: number;
  password: string;
}

export class SimpleUpdateUserDto {
  name?: string;
  email?: string;
  age?: number;
}

export class SimpleCreateProductDto {
  name: string;
  description: string;
  price: number;
  category: string;
}
