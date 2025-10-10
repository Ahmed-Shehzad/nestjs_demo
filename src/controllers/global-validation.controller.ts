import { Controller, Post, Put, Body, Param, Inject } from '@nestjs/common';
import { ValidateWith } from '../fluentvalidation/decorators';
import { GlobalValidationService } from '../fluentvalidation/global-validation.service';
import {
  CreateUserValidator,
  UpdateUserValidator,
} from '../fluentvalidation/validators';
import { CreateUserDto, UpdateUserDto } from '../fluentvalidation/dto';
import { UserService } from '../services/user.service';

@Controller('global-validation')
export class GlobalValidationController {
  constructor(
    @Inject(GlobalValidationService)
    private readonly validationService: GlobalValidationService,
    private readonly userService: UserService,
  ) {}

  // Using global validation decorator
  @Post('users-with-decorator')
  @ValidateWith(CreateUserValidator)
  createUserWithDecorator(@Body() createUserDto: CreateUserDto) {
    return {
      message: 'User created successfully using global decorator!',
      user: createUserDto,
      method: 'Global Decorator (@ValidateWith)',
    };
  }

  // Using validation service in the method
  @Post('users-with-service')
  async createUserWithService(@Body() createUserDto: CreateUserDto) {
    // Manual validation using the global service
    await this.validationService.validateOrThrow(
      CreateUserValidator,
      createUserDto,
    );

    return {
      message: 'User created successfully using validation service!',
      user: createUserDto,
      method: 'Global Validation Service',
    };
  }

  // Using injected business service
  @Post('users-with-business-service')
  async createUserWithBusinessService(@Body() createUserDto: CreateUserDto) {
    const user = await this.userService.createUser(createUserDto);

    return {
      message: 'User created successfully using business service!',
      user,
      method: 'Business Service (with internal validation)',
    };
  }

  // Validation check endpoint
  @Post('validate-user')
  async validateUser(@Body() createUserDto: CreateUserDto) {
    const validationResult =
      await this.userService.validateUserData(createUserDto);

    return {
      message: 'Validation completed',
      result: validationResult,
      method: 'Validation Check Only',
    };
  }

  // Update with global decorator
  @Put('users/:id')
  @ValidateWith(UpdateUserValidator)
  updateUser(@Param('id') id: string, @Body() updateUserDto: UpdateUserDto) {
    return {
      message: 'User updated successfully using global decorator!',
      userId: parseInt(id),
      updates: updateUserDto,
      method: 'Global Decorator (@ValidateWith)',
    };
  }

  // Manual validation check
  @Post('check-validation')
  async checkValidation(@Body() createUserDto: CreateUserDto) {
    const isValid = await this.validationService.isValid(
      CreateUserValidator,
      createUserDto,
    );

    if (isValid) {
      return {
        message: 'Data is valid!',
        data: createUserDto,
        isValid: true,
      };
    } else {
      const errors = await this.validationService.getErrors(
        CreateUserValidator,
        createUserDto,
      );

      return {
        message: 'Data is invalid',
        isValid: false,
        errors: errors,
      };
    }
  }
}
