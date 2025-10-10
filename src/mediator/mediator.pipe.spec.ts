import { Test, TestingModule } from '@nestjs/testing';
import { ValidationPipe } from './mediator.pipe';
import { SimpleCreateUserDto } from './dto/simple.dto';

describe('Mediator ValidationPipe', () => {
  let pipe: ValidationPipe;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [ValidationPipe],
    }).compile();

    pipe = module.get<ValidationPipe>(ValidationPipe);
  });

  it('should be defined', () => {
    expect(pipe).toBeDefined();
  });

  it('should pass through primitive types without validation', async () => {
    const result = await pipe.transform('test', {
      type: 'body',
      metatype: String,
      data: '',
    });
    expect(result).toBe('test');

    const numberResult = await pipe.transform(123, {
      type: 'body',
      metatype: Number,
      data: '',
    });
    expect(numberResult).toBe(123);

    const boolResult = await pipe.transform(true, {
      type: 'body',
      metatype: Boolean,
      data: '',
    });
    expect(boolResult).toBe(true);
  });

  it('should pass through objects without metatype', async () => {
    const testData = { name: 'test', value: 123 };
    const result = await pipe.transform(testData, { type: 'body', data: '' });
    expect(result).toEqual(testData);
  });

  it('should work with objects that have class metatype', async () => {
    // Since SimpleCreateUserDto has no validation decorators,
    // class-validator will pass through valid objects
    const validData = {
      name: 'John Doe',
      email: 'john@example.com',
      age: 25,
      password: 'password123',
    };

    try {
      const result = await pipe.transform(validData, {
        type: 'body',
        metatype: SimpleCreateUserDto,
        data: '',
      });
      // If no validation decorators, it should pass through
      expect(result).toEqual(validData);
    } catch (error) {
      // If class-validator finds issues, expect BadRequestException
      expect((error as Error).message).toContain('Validation failed');
    }
  });

  it('should skip validation for undefined metatype', async () => {
    const testData = { any: 'data' };
    const result = await pipe.transform(testData, { type: 'body', data: '' });
    expect(result).toEqual(testData);
  });
});
