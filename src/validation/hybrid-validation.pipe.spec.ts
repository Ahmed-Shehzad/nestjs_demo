import { Test } from '@nestjs/testing';
import { BadRequestException } from '@nestjs/common';
import { ArgumentMetadata } from '@nestjs/common';
import {
  HybridValidationPipe,
  CombinedValidation,
  FluentPriority,
  ClassValidatorPriority,
  FluentValidationOnly,
  ClassValidatorOnly,
} from './hybrid-validation.pipe';
import { CreateUserValidator } from '../fluentvalidation/validators';
import { CreateUserDto } from '../fluentvalidation/dto';

describe('HybridValidationPipe', () => {
  let pipe: HybridValidationPipe;
  const mockMetadata: ArgumentMetadata = {
    type: 'body' as const,
    metatype: CreateUserDto,
  };

  beforeEach(async () => {
    await Test.createTestingModule({
      providers: [],
    }).compile();
  });

  describe('HybridValidationPipe Configuration', () => {
    it('should create pipe with default options', () => {
      pipe = new HybridValidationPipe({
        fluentValidator: CreateUserValidator,
      });

      expect(pipe).toBeDefined();
    });

    it('should create pipe with custom options', () => {
      pipe = new HybridValidationPipe({
        useFluentValidation: true,
        useClassValidator: false,
        fluentValidator: CreateUserValidator,
        combineErrors: false,
        priority: 'fluent',
      });

      expect(pipe).toBeDefined();
    });
  });

  describe('Factory Functions', () => {
    it('should create CombinedValidation pipe class', () => {
      const PipeClass = CombinedValidation(CreateUserValidator);
      const pipeInstance = new PipeClass();
      expect(pipeInstance).toBeInstanceOf(HybridValidationPipe);
    });

    it('should create FluentPriority pipe class', () => {
      const PipeClass = FluentPriority(CreateUserValidator);
      const pipeInstance = new PipeClass();
      expect(pipeInstance).toBeInstanceOf(HybridValidationPipe);
    });

    it('should create ClassValidatorPriority pipe class', () => {
      const PipeClass = ClassValidatorPriority(CreateUserValidator);
      const pipeInstance = new PipeClass();
      expect(pipeInstance).toBeInstanceOf(HybridValidationPipe);
    });

    it('should create FluentValidationOnly pipe class', () => {
      const PipeClass = FluentValidationOnly(CreateUserValidator);
      const pipeInstance = new PipeClass();
      expect(pipeInstance).toBeInstanceOf(HybridValidationPipe);
    });

    it('should create ClassValidatorOnly pipe class', () => {
      const PipeClass = ClassValidatorOnly();
      const pipeInstance = new PipeClass();
      expect(pipeInstance).toBeInstanceOf(HybridValidationPipe);
    });
  });

  describe('Validation Logic', () => {
    const validData = {
      name: 'John Doe',
      email: 'john.doe@example.com',
      age: 25,
      password: 'SecurePass123!',
    };

    const invalidData = {
      name: '',
      email: 'invalid-email',
      age: 15,
      password: '123',
    };

    describe('Combined Validation', () => {
      beforeEach(() => {
        const PipeClass = CombinedValidation(CreateUserValidator);
        pipe = new PipeClass();
      });

      it('should pass when data is valid for both validators', async () => {
        const result = await pipe.transform(validData, mockMetadata);
        expect(result).toEqual(validData);
      });

      it('should throw when data is invalid', async () => {
        await expect(pipe.transform(invalidData, mockMetadata)).rejects.toThrow(
          BadRequestException,
        );
      });
    });

    describe('FluentValidation Priority', () => {
      beforeEach(() => {
        const PipeClass = FluentPriority(CreateUserValidator);
        pipe = new PipeClass();
      });

      it('should pass when FluentValidation passes', async () => {
        const result = await pipe.transform(validData, mockMetadata);
        expect(result).toEqual(validData);
      });

      it('should throw FluentValidation errors first', async () => {
        await expect(pipe.transform(invalidData, mockMetadata)).rejects.toThrow(
          BadRequestException,
        );
      });
    });

    describe('ClassValidator Priority', () => {
      beforeEach(() => {
        const PipeClass = ClassValidatorPriority(CreateUserValidator);
        pipe = new PipeClass();
      });

      it('should pass when class-validator passes', async () => {
        const result = await pipe.transform(validData, mockMetadata);
        expect(result).toEqual(validData);
      });

      it('should throw class-validator errors first', async () => {
        await expect(pipe.transform(invalidData, mockMetadata)).rejects.toThrow(
          BadRequestException,
        );
      });
    });

    describe('FluentValidation Only', () => {
      beforeEach(() => {
        const PipeClass = FluentValidationOnly(CreateUserValidator);
        pipe = new PipeClass();
      });

      it('should only use FluentValidation', async () => {
        const result = await pipe.transform(validData, mockMetadata);
        expect(result).toEqual(validData);
      });

      it('should throw only FluentValidation errors', async () => {
        await expect(pipe.transform(invalidData, mockMetadata)).rejects.toThrow(
          BadRequestException,
        );
      });
    });

    describe('ClassValidator Only', () => {
      beforeEach(() => {
        const PipeClass = ClassValidatorOnly();
        pipe = new PipeClass();
      });

      it('should only use class-validator', async () => {
        const result = await pipe.transform(validData, mockMetadata);
        expect(result).toEqual(validData);
      });

      it('should throw only class-validator errors', async () => {
        await expect(pipe.transform(invalidData, mockMetadata)).rejects.toThrow(
          BadRequestException,
        );
      });
    });
  });

  describe('Error Handling', () => {
    it('should combine errors from both validators when combineErrors is true', async () => {
      pipe = new HybridValidationPipe({
        useFluentValidation: true,
        useClassValidator: true,
        fluentValidator: CreateUserValidator,
        combineErrors: true,
        priority: 'both',
      });

      try {
        await pipe.transform(
          {
            name: '',
            email: 'invalid',
            age: 15,
            password: '123',
          },
          mockMetadata,
        );
        fail('Should have thrown an error');
      } catch (error) {
        expect(error).toBeInstanceOf(BadRequestException);
        const response = (error as BadRequestException).getResponse() as {
          message: unknown;
        };
        expect(response).toHaveProperty('message');
        expect(Array.isArray(response.message)).toBe(true);
      }
    });

    it('should handle validation when one validator is disabled', async () => {
      pipe = new HybridValidationPipe({
        useFluentValidation: false,
        useClassValidator: true,
        fluentValidator: CreateUserValidator,
        combineErrors: false,
        priority: 'both',
      });

      const result = await pipe.transform(
        {
          name: 'Test',
          email: 'test@example.com',
          age: 25,
          password: 'SecurePass123!',
        },
        mockMetadata,
      );

      expect(result).toBeDefined();
    });
  });

  describe('Edge Cases', () => {
    it('should handle null/undefined data', async () => {
      const PipeClass = CombinedValidation(CreateUserValidator);
      pipe = new PipeClass();

      // Null/undefined should be returned as-is for non-validatable types
      const nullResult = await pipe.transform(null, mockMetadata);
      expect(nullResult).toBeNull();

      const undefinedResult = await pipe.transform(undefined, mockMetadata);
      expect(undefinedResult).toBeUndefined();
    });

    it('should handle empty object', async () => {
      const PipeClass = CombinedValidation(CreateUserValidator);
      pipe = new PipeClass();

      await expect(pipe.transform({}, mockMetadata)).rejects.toThrow(
        BadRequestException,
      );
    });

    it('should work with different data types', async () => {
      const PipeClass = ClassValidatorOnly();
      pipe = new PipeClass();

      // Should handle primitives gracefully
      const primitiveResult = await pipe.transform('test', {
        type: 'body' as const,
        metatype: String,
      });
      expect(primitiveResult).toBe('test');
    });
  });

  describe('Configuration Validation', () => {
    it('should work when both validators are enabled', () => {
      expect(() => {
        new HybridValidationPipe({
          useFluentValidation: true,
          useClassValidator: true,
          fluentValidator: CreateUserValidator,
        });
      }).not.toThrow();
    });

    it('should work when FluentValidation is enabled with validator', () => {
      expect(() => {
        new HybridValidationPipe({
          useFluentValidation: true,
          useClassValidator: false,
          fluentValidator: CreateUserValidator,
        });
      }).not.toThrow();
    });
  });

  describe('Performance Considerations', () => {
    it('should complete validation quickly', async () => {
      const fluentOnlyPipe = new HybridValidationPipe({
        useFluentValidation: true,
        useClassValidator: false,
        fluentValidator: CreateUserValidator,
      });

      const start = Date.now();
      await fluentOnlyPipe.transform(
        {
          name: 'Test',
          email: 'test@example.com',
          age: 25,
          password: 'SecurePass123!',
        },
        mockMetadata,
      );
      const duration = Date.now() - start;

      expect(duration).toBeLessThan(1000); // Should complete within 1 second
    });
  });
});
