import { Controller, Post, Put, Body, Param, UsePipes } from '@nestjs/common';
import { ValidationPipe } from '../mediator/mediator.pipe';
import {
  SimpleCreateUserDto,
  SimpleUpdateUserDto,
  SimpleCreateProductDto,
} from '../mediator/dto/simple.dto';

@Controller('mediator-validation')
export class MediatorValidationController {
  // Using the mediator ValidationPipe
  @Post('users')
  @UsePipes(ValidationPipe)
  createUser(@Body() createUserDto: SimpleCreateUserDto) {
    return {
      message: 'User created successfully using mediator ValidationPipe!',
      user: {
        id: Math.floor(Math.random() * 1000),
        ...createUserDto,
        createdAt: new Date().toISOString(),
      },
      validationType: 'Mediator ValidationPipe (class-validator based)',
    };
  }

  // Parameter-level validation
  @Put('users/:id')
  updateUser(
    @Param('id') id: string,
    @Body(new ValidationPipe()) updateUserDto: SimpleUpdateUserDto,
  ) {
    return {
      message: 'User updated successfully using mediator ValidationPipe!',
      user: {
        id: parseInt(id),
        ...updateUserDto,
        updatedAt: new Date().toISOString(),
      },
      validationType: 'Mediator ValidationPipe (class-validator based)',
    };
  }

  @Post('products')
  @UsePipes(ValidationPipe)
  createProduct(@Body() createProductDto: SimpleCreateProductDto) {
    return {
      message: 'Product created successfully using mediator ValidationPipe!',
      product: {
        id: Math.floor(Math.random() * 1000),
        ...createProductDto,
        slug: createProductDto.name.toLowerCase().replace(/\s+/g, '-'),
        createdAt: new Date().toISOString(),
      },
      validationType: 'Mediator ValidationPipe (class-validator based)',
    };
  }

  // Info endpoint
  @Post('info')
  getInfo() {
    return {
      message: 'Mediator ValidationPipe Information',
      description:
        'This controller uses the ValidationPipe from the mediator module',
      features: [
        'Uses class-validator under the hood',
        'Transforms plain objects to class instances',
        'Validates using class-validator decorators',
        'Throws BadRequestException on validation failure',
        'Available globally through MediatorModule',
      ],
      usage: {
        classLevel: '@UsePipes(ValidationPipe)',
        methodLevel: '@Body(new ValidationPipe())',
        global: 'app.useGlobalPipes(new ValidationPipe())',
      },
      comparison: {
        fluentValidation: 'Programmatic, fluent API like C# FluentValidation',
        mediatorValidation: 'Decorator-based using class-validator library',
      },
    };
  }
}
