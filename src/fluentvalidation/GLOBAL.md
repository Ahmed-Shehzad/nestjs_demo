# 🌍 Global FluentValidation for NestJS

The FluentValidation library is now configured as a **Global Module**, making it available throughout your entire NestJS application without needing to import it in every module.

## 🚀 Global Configuration

### Module Setup

The `FluentValidationModule` is marked with `@Global()` decorator and exported in your `app.module.ts`:

```typescript
// app.module.ts
@Module({
  imports: [FluentValidationModule], // Only import once in root module
  // ... other config
})
export class AppModule {}
```

### What's Available Globally

✅ **FluentValidationPipe** - Direct pipe usage  
✅ **GlobalValidationService** - Injectable validation service  
✅ **@ValidateWith()** - Global validation decorator  
✅ **All Validators & DTOs** - Pre-built validation classes

## 📋 Usage Patterns

### 1. Global Validation Decorator

Use `@ValidateWith()` decorator anywhere in your application:

```typescript
import { Controller, Post, Body } from '@nestjs/common';
import {
  ValidateWith,
  CreateUserValidator,
  CreateUserDto,
} from '../fluentvalidation';

@Controller('anywhere')
export class AnyController {
  @Post('users')
  @ValidateWith(CreateUserValidator) // 🌍 Available globally
  createUser(@Body() userData: CreateUserDto) {
    // userData is guaranteed valid
    return { success: true, user: userData };
  }
}
```

### 2. Global Validation Service

Inject the `GlobalValidationService` in any service or controller:

```typescript
import { Injectable, Inject } from '@nestjs/common';
import {
  GlobalValidationService,
  CreateUserValidator,
} from '../fluentvalidation';

@Injectable()
export class AnyService {
  constructor(
    @Inject(GlobalValidationService) // 🌍 Available globally
    private readonly validator: GlobalValidationService,
  ) {}

  async processUser(userData: CreateUserDto) {
    // Validate and throw if invalid
    await this.validator.validateOrThrow(CreateUserValidator, userData);

    // Continue processing...
    return { processed: true };
  }

  async checkUserData(userData: CreateUserDto) {
    // Just check validity
    const isValid = await this.validator.isValid(CreateUserValidator, userData);

    if (!isValid) {
      const errors = await this.validator.getErrors(
        CreateUserValidator,
        userData,
      );
      return { valid: false, errors };
    }

    return { valid: true };
  }
}
```

### 3. Direct Pipe Usage

Use pipes directly without importing:

```typescript
import { Controller, Put, Body, Param } from '@nestjs/common';
import { FluentValidationPipe, UpdateUserValidator } from '../fluentvalidation';

@Controller('users')
export class UsersController {
  @Put(':id')
  updateUser(
    @Param('id') id: string,
    @Body(new FluentValidationPipe(UpdateUserValidator)) // 🌍 Available globally
    updateData: UpdateUserDto,
  ) {
    return { updated: true, id: parseInt(id), data: updateData };
  }
}
```

## 🎯 Complete Usage Examples

### Example Controller Using All Patterns

```typescript
// controllers/user-management.controller.ts
import {
  Controller,
  Post,
  Put,
  Get,
  Body,
  Param,
  Inject,
} from '@nestjs/common';
import {
  ValidateWith,
  GlobalValidationService,
  FluentValidationPipe,
  CreateUserValidator,
  UpdateUserValidator,
  CreateUserDto,
  UpdateUserDto,
} from '../fluentvalidation';

@Controller('user-management')
export class UserManagementController {
  constructor(
    @Inject(GlobalValidationService)
    private readonly validator: GlobalValidationService,
  ) {}

  // Method 1: Using global decorator
  @Post('create-with-decorator')
  @ValidateWith(CreateUserValidator)
  createWithDecorator(@Body() userData: CreateUserDto) {
    return {
      method: 'Global Decorator',
      user: userData,
      validated: true,
    };
  }

  // Method 2: Using direct pipe
  @Put('update-with-pipe/:id')
  updateWithPipe(
    @Param('id') id: string,
    @Body(new FluentValidationPipe(UpdateUserValidator))
    userData: UpdateUserDto,
  ) {
    return {
      method: 'Direct Pipe',
      userId: parseInt(id),
      updates: userData,
      validated: true,
    };
  }

  // Method 3: Using validation service
  @Post('create-with-service')
  async createWithService(@Body() userData: CreateUserDto) {
    await this.validator.validateOrThrow(CreateUserValidator, userData);

    return {
      method: 'Validation Service',
      user: userData,
      validated: true,
    };
  }

  // Method 4: Manual validation check
  @Post('validate-only')
  async validateOnly(@Body() userData: CreateUserDto) {
    const result = await this.validator.validate(CreateUserValidator, userData);

    return {
      method: 'Manual Validation',
      isValid: result.isValid,
      errors: result.errors.map((e) => ({
        field: e.propertyName,
        message: e.errorMessage,
      })),
    };
  }

  // Method 5: Quick validity check
  @Post('quick-check')
  async quickCheck(@Body() userData: CreateUserDto) {
    const isValid = await this.validator.isValid(CreateUserValidator, userData);

    if (isValid) {
      return { message: 'Data is valid!', data: userData };
    }

    const errors = await this.validator.getErrors(
      CreateUserValidator,
      userData,
    );
    return { message: 'Data is invalid', errors };
  }
}
```

### Example Service with Global Validation

```typescript
// services/business-logic.service.ts
import { Injectable, Inject } from '@nestjs/common';
import {
  GlobalValidationService,
  CreateUserValidator,
  CreateProductValidator,
  CreateUserDto,
  CreateProductDto,
} from '../fluentvalidation';

@Injectable()
export class BusinessLogicService {
  constructor(
    @Inject(GlobalValidationService)
    private readonly validator: GlobalValidationService,
  ) {}

  async registerUserWithProducts(
    userData: CreateUserDto,
    products: CreateProductDto[],
  ) {
    // Validate user data
    await this.validator.validateOrThrow(CreateUserValidator, userData);

    // Validate all products
    for (const product of products) {
      await this.validator.validateOrThrow(CreateProductValidator, product);
    }

    // Business logic continues...
    return {
      user: { ...userData, id: Math.random() },
      products: products.map((p) => ({ ...p, id: Math.random() })),
      registeredAt: new Date(),
    };
  }

  async validateBulkData(items: CreateUserDto[]) {
    const results = [];

    for (const item of items) {
      const result = await this.validator.validate(CreateUserValidator, item);
      results.push({
        data: item,
        valid: result.isValid,
        errors: result.errorMessages,
      });
    }

    return results;
  }
}
```

## 🧪 Testing Global Validation

Since the module is global, testing is straightforward:

```typescript
// any.service.spec.ts
import { Test } from '@nestjs/testing';
import { GlobalValidationService } from '../fluentvalidation';
import { YourService } from './your.service';

describe('YourService', () => {
  let service: YourService;
  let validator: GlobalValidationService;

  beforeEach(async () => {
    const module = await Test.createTestingModule({
      providers: [
        YourService,
        GlobalValidationService, // Available everywhere
      ],
    }).compile();

    service = module.get<YourService>(YourService);
    validator = module.get<GlobalValidationService>(GlobalValidationService);
  });

  // Tests here...
});
```

## 📊 Available Global Services

| Service/Feature                             | Usage                  | Description                 |
| ------------------------------------------- | ---------------------- | --------------------------- |
| `@ValidateWith(ValidatorClass)`             | Method/Class Decorator | Auto-validates request body |
| `GlobalValidationService.validate()`        | Manual validation      | Returns ValidationResult    |
| `GlobalValidationService.validateOrThrow()` | Validation with throw  | Throws if invalid           |
| `GlobalValidationService.isValid()`         | Quick check            | Returns boolean             |
| `GlobalValidationService.getErrors()`       | Error messages         | Returns string array        |
| `FluentValidationPipe`                      | Direct pipe usage      | Parameter-level validation  |

## 🎯 Demo Endpoints

Test all global patterns at these endpoints:

- `POST /global-validation/users-with-decorator` - Using `@ValidateWith`
- `POST /global-validation/users-with-service` - Using `GlobalValidationService`
- `POST /global-validation/users-with-business-service` - Using business service
- `POST /global-validation/validate-user` - Validation check only
- `POST /global-validation/check-validation` - Manual validation

## ✅ Benefits of Global Configuration

1. **No Imports Needed** - Available in any module automatically
2. **Consistent Validation** - Same validation logic everywhere
3. **Multiple Usage Patterns** - Choose the best approach for each case
4. **Type Safety** - Full TypeScript support throughout
5. **Easy Testing** - Simple to mock and test
6. **Performance** - Single instance across the entire application

Your FluentValidation library is now globally accessible throughout your NestJS application! 🌍🚀
