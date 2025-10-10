import { Injectable } from '@nestjs/common';
import { GlobalValidationService } from '../fluentvalidation/global-validation.service';
import {
  CreateUserValidator,
  UpdateUserValidator,
} from '../fluentvalidation/validators';
import { CreateUserDto, UpdateUserDto } from '../fluentvalidation/dto';

@Injectable()
export class UserService {
  constructor(private readonly validationService: GlobalValidationService) {}

  async createUser(userData: CreateUserDto) {
    // Validate using the global validation service
    await this.validationService.validateOrThrow(CreateUserValidator, userData);

    // At this point, userData is guaranteed to be valid
    return {
      id: Math.floor(Math.random() * 1000),
      ...userData,
      createdAt: new Date().toISOString(),
    };
  }

  async updateUser(id: number, userData: UpdateUserDto) {
    // Check validation without throwing
    const isValid = await this.validationService.isValid(
      UpdateUserValidator,
      userData,
    );

    if (!isValid) {
      const errors = await this.validationService.getErrors(
        UpdateUserValidator,
        userData,
      );
      throw new Error(`Validation failed: ${errors.join(', ')}`);
    }

    return {
      id,
      ...userData,
      updatedAt: new Date().toISOString(),
    };
  }

  async validateUserData(userData: CreateUserDto) {
    // Get detailed validation results
    const result = await this.validationService.validate(
      CreateUserValidator,
      userData,
    );

    return {
      isValid: result.isValid,
      errors: result.errors.map((error) => ({
        field: error.propertyName,
        message: error.errorMessage,
        value: error.attemptedValue,
      })),
      errorCount: result.errors.length,
    };
  }
}
