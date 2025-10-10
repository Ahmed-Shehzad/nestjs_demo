import { Test, TestingModule } from '@nestjs/testing';
import { BadRequestException } from '@nestjs/common';
import { FluentValidationPipe } from './validation.pipe';
import { CreateUserValidator } from './validators';
import { CreateUserDto } from './dto';

describe('FluentValidationPipe', () => {
  let pipe: FluentValidationPipe;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        {
          provide: FluentValidationPipe,
          useValue: new FluentValidationPipe(CreateUserValidator),
        },
      ],
    }).compile();

    pipe = module.get<FluentValidationPipe>(FluentValidationPipe);
  });

  it('should be defined', () => {
    expect(pipe).toBeDefined();
  });

  it('should pass valid data through', async () => {
    const validUser: CreateUserDto = {
      name: 'John Doe',
      email: 'john@example.com',
      age: 25,
      password: 'StrongPass123!',
    };

    const result = await pipe.transform(validUser, {
      type: 'body',
      metatype: CreateUserDto,
      data: '',
    });

    expect(result).toEqual(validUser);
  });

  it('should throw BadRequestException for invalid data', async () => {
    const invalidUser = {
      name: 'J', // Too short
      email: 'invalid-email', // Invalid format
      age: 15, // Too young
      password: 'weak', // Doesn't meet requirements
    };

    await expect(
      pipe.transform(invalidUser, {
        type: 'body',
        metatype: CreateUserDto,
        data: '',
      }),
    ).rejects.toThrow(BadRequestException);
  });

  it('should provide detailed error messages', async () => {
    const invalidUser = {
      name: '', // Empty
      email: 'invalid', // Invalid format
      age: 10, // Too young
      password: '', // Empty
    };

    try {
      await pipe.transform(invalidUser, {
        type: 'body',
        metatype: CreateUserDto,
        data: '',
      });
    } catch (error) {
      expect(error).toBeInstanceOf(BadRequestException);
      const response = (error as BadRequestException).getResponse() as {
        message: string;
        errors: Array<{ property: string; message: string }>;
      };
      expect(response.message).toBe('Validation failed');
      expect(response.errors).toBeDefined();
      expect(response.errors.length).toBeGreaterThan(0);
      expect(response.errors[0]).toHaveProperty('property');
      expect(response.errors[0]).toHaveProperty('message');
    }
  });
});
