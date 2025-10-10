import { Controller, Post, Put, Body, Param, UsePipes } from '@nestjs/common';
import { ValidationPipe } from '../mediator/mediator.pipe';
import {
  CreateUserWithClassValidatorDto,
  UpdateUserWithClassValidatorDto,
  CreateProductWithClassValidatorDto,
} from '../mediator/dto/class-validator.dto';

@Controller('class-validator-demo')
export class ClassValidatorDemoController {
  // Using the mediator ValidationPipe with class-validator
  @Post('users')
  @UsePipes(ValidationPipe)
  createUser(@Body() createUserDto: CreateUserWithClassValidatorDto) {
    return {
      message: 'User created successfully using class-validator!',
      user: {
        id: Math.floor(Math.random() * 1000),
        ...createUserDto,
        createdAt: new Date().toISOString(),
      },
      validationType: 'class-validator with mediator ValidationPipe',
    };
  }

  // Parameter-level validation
  @Put('users/:id')
  updateUser(
    @Param('id') id: string,
    @Body(new ValidationPipe()) updateUserDto: UpdateUserWithClassValidatorDto,
  ) {
    return {
      message: 'User updated successfully using class-validator!',
      user: {
        id: parseInt(id),
        ...updateUserDto,
        updatedAt: new Date().toISOString(),
      },
      validationType: 'class-validator with mediator ValidationPipe',
    };
  }

  @Post('products')
  @UsePipes(ValidationPipe)
  createProduct(@Body() createProductDto: CreateProductWithClassValidatorDto) {
    return {
      message: 'Product created successfully using class-validator!',
      product: {
        id: Math.floor(Math.random() * 1000),
        ...createProductDto,
        slug: createProductDto.name.toLowerCase().replace(/\s+/g, '-'),
        createdAt: new Date().toISOString(),
      },
      validationType: 'class-validator with mediator ValidationPipe',
    };
  }

  // Comparison endpoint showing validation approaches
  @Post('validation-comparison')
  getValidationComparison() {
    return {
      message: 'Validation Approaches Available',
      approaches: {
        fluentValidation: {
          description: 'C# FluentValidation-like API with fluent interface',
          usage: 'POST /demo/* or /global-validation/*',
          decorators: [
            '@ValidateWith(ValidatorClass)',
            '@UsePipes(ValidationPipe(ValidatorClass))',
          ],
          example: {
            validator: 'CreateUserValidator',
            rules: [
              'ruleFor(x => x.name).notEmpty().minLength(2)',
              'ruleFor(x => x.email).email()',
            ],
          },
        },
        classValidator: {
          description: 'Decorator-based validation with class-validator',
          usage: 'POST /class-validator-demo/*',
          decorators: [
            '@UsePipes(ValidationPipe)',
            '@Body(new ValidationPipe())',
          ],
          example: {
            dto: 'CreateUserWithClassValidatorDto',
            decorators: ['@IsNotEmpty()', '@IsEmail()', '@MinLength(2)'],
          },
        },
        comparison: {
          fluentValidationPros: [
            'Fluent interface like C# FluentValidation',
            'Programmatic rule building',
            'Complex conditional validation',
            'Custom error messages per rule',
            'Type-safe property selection',
          ],
          classValidatorPros: [
            'Decorator-based (standard NestJS approach)',
            'Built-in transformations',
            'Wide ecosystem support',
            'Simpler for basic validation',
            'Auto-completion in IDEs',
          ],
        },
      },
    };
  }
}
