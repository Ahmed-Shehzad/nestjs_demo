import {
  Controller,
  Post,
  Put,
  Body,
  Param,
  Get,
  UsePipes,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { FluentValidationPipe, ValidationPipe } from './validation.pipe';
import { CreateUserDto, UpdateUserDto, CreateProductDto } from './dto';
import {
  CreateUserValidator,
  UpdateUserValidator,
  CreateProductValidator,
} from './validators';

@Controller('demo')
export class DemoController {
  // Using the factory function approach
  @Post('users')
  @HttpCode(HttpStatus.CREATED)
  @UsePipes(ValidationPipe(CreateUserValidator))
  createUser(@Body() createUserDto: CreateUserDto) {
    // At this point, createUserDto is guaranteed to be valid
    return {
      message: 'User created successfully!',
      user: {
        id: Math.floor(Math.random() * 1000),
        name: createUserDto.name,
        email: createUserDto.email,
        age: createUserDto.age,
        createdAt: new Date().toISOString(),
      },
    };
  }

  // Using direct pipe instantiation
  @Put('users/:id')
  updateUser(
    @Param('id') id: string,
    @Body(new FluentValidationPipe(UpdateUserValidator))
    updateUserDto: UpdateUserDto,
  ) {
    // At this point, updateUserDto is guaranteed to be valid
    return {
      message: 'User updated successfully!',
      user: {
        id: parseInt(id),
        ...updateUserDto,
        updatedAt: new Date().toISOString(),
      },
    };
  }

  // Product creation with validation
  @Post('products')
  @HttpCode(HttpStatus.CREATED)
  @UsePipes(ValidationPipe(CreateProductValidator))
  createProduct(@Body() createProductDto: CreateProductDto) {
    return {
      message: 'Product created successfully!',
      product: {
        id: Math.floor(Math.random() * 1000),
        ...createProductDto,
        slug: createProductDto.name.toLowerCase().replace(/\s+/g, '-'),
        createdAt: new Date().toISOString(),
      },
    };
  }

  // Example of multiple validation approaches in one endpoint
  @Post('users/:id/products')
  createUserProduct(
    @Param('id') id: string,
    @Body(ValidationPipe(CreateProductValidator))
    createProductDto: CreateProductDto,
  ) {
    return {
      message: 'Product created for user successfully!',
      userId: parseInt(id),
      product: {
        id: Math.floor(Math.random() * 1000),
        ...createProductDto,
        ownerId: parseInt(id),
        createdAt: new Date().toISOString(),
      },
    };
  }

  // Test endpoint to see validation errors
  @Get('validation-example')
  getValidationExample() {
    return {
      message: 'FluentValidation NestJS Integration Examples',
      examples: {
        createUser: {
          url: 'POST /demo/users',
          validPayload: {
            name: 'John Doe',
            email: 'john@example.com',
            age: 25,
            password: 'StrongPass123!',
          },
          invalidPayload: {
            name: 'J', // Too short
            email: 'invalid-email', // Invalid format
            age: 15, // Too young
            password: 'weak', // Doesn't meet requirements
          },
        },
        updateUser: {
          url: 'PUT /demo/users/1',
          validPayload: {
            name: 'Jane Doe',
            email: 'jane@example.com',
          },
          invalidPayload: {
            name: 'J', // Too short when provided
            email: 'invalid', // Invalid format when provided
          },
        },
        createProduct: {
          url: 'POST /demo/products',
          validPayload: {
            name: 'Amazing Product',
            description: 'This is an amazing product with great features.',
            price: 99.99,
            category: 'electronics',
          },
          invalidPayload: {
            name: 'AB', // Too short
            description: 'Short', // Too short
            price: -10, // Negative price
            category: 'invalid-category', // Not in allowed list
          },
        },
      },
    };
  }
}
