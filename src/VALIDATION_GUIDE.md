# 🔄 Dual Validation System: FluentValidation + Mediator ValidationPipe

Your NestJS application now has **two powerful validation approaches** working together:

1. **FluentValidation** - C# FluentValidation-like programmatic API
2. **Mediator ValidationPipe** - Decorator-based validation using class-validator

## 🚀 Quick Comparison

| Feature               | FluentValidation                    | Mediator ValidationPipe         |
| --------------------- | ----------------------------------- | ------------------------------- |
| **API Style**         | Programmatic, Fluent                | Decorator-based                 |
| **Inspiration**       | C# FluentValidation                 | NestJS Standard                 |
| **Rule Definition**   | `ruleFor(x => x.name).notEmpty()`   | `@IsNotEmpty()`                 |
| **Error Messages**    | `.withMessage("Custom message")`    | `{ message: "Custom message" }` |
| **Conditional Logic** | Complex conditionals with `.must()` | Custom validators               |
| **Type Safety**       | Full TypeScript generics            | Class-based validation          |
| **Performance**       | Manual instantiation                | Auto-transformation             |

## 📋 Usage Examples

### 1. FluentValidation Approach

```typescript
// Validator Class
export class CreateUserValidator extends AbstractValidator<CreateUserDto> {
  constructor() {
    super();

    this.ruleFor(user => user.name)
      .notEmpty()
      .minLength(2)
      .withMessage('Name must be at least 2 characters');

    this.ruleFor(user => user.email)
      .notEmpty()
      .email()
      .withMessage('Please provide a valid email');
  }
}

// Controller Usage
@Post('users')
@ValidateWith(CreateUserValidator) // Global decorator
createUser(@Body() userData: CreateUserDto) {
  return { success: true, user: userData };
}
```

### 2. Mediator ValidationPipe Approach

```typescript
// DTO with Decorators
export class CreateUserWithValidationDto {
  @IsNotEmpty({ message: 'Name is required' })
  @MinLength(2, { message: 'Name must be at least 2 characters' })
  name: string;

  @IsEmail({}, { message: 'Please provide a valid email' })
  email: string;
}

// Controller Usage
@Post('users')
@UsePipes(ValidationPipe) // From mediator module
createUser(@Body() userData: CreateUserWithValidationDto) {
  return { success: true, user: userData };
}
```

## 🎯 When to Use Which Approach

### Use FluentValidation When:

- ✅ Coming from C# background and prefer fluent APIs
- ✅ Need complex conditional validation logic
- ✅ Want programmatic rule building
- ✅ Require dynamic validation based on context
- ✅ Need detailed control over error messages
- ✅ Building validation rules from external configuration

### Use Mediator ValidationPipe When:

- ✅ Following standard NestJS patterns
- ✅ Need simple, straightforward validation
- ✅ Want automatic transformation (class-transformer)
- ✅ Using existing class-validator ecosystem
- ✅ Prefer decorator-based approach
- ✅ Need built-in transformation features

## 🔧 Configuration

Both validation systems are configured globally:

```typescript
// app.module.ts
@Module({
  imports: [
    MediatorModule, // Provides ValidationPipe globally
    FluentValidationModule, // Provides FluentValidation globally
  ],
})
export class AppModule {}
```

## 📊 Available Endpoints

### FluentValidation Endpoints:

- `POST /demo/users` - Demo FluentValidation
- `POST /global-validation/users-with-decorator` - Global decorator
- `POST /global-validation/users-with-service` - Global service

### Mediator ValidationPipe Endpoints:

- `POST /mediator-validation/users` - Basic validation
- `POST /mediator-validation/products` - Product validation
- `POST /mediator-validation/info` - Pipe information

## 🧪 Testing Both Approaches

### FluentValidation Test:

```bash
curl -X POST http://localhost:3000/global-validation/users-with-decorator \
  -H "Content-Type: application/json" \
  -d '{
    "name": "John Doe",
    "email": "john@example.com",
    "age": 25,
    "password": "StrongPass123!"
  }'
```

### Mediator ValidationPipe Test:

```bash
curl -X POST http://localhost:3000/mediator-validation/users \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Jane Doe",
    "email": "jane@example.com",
    "age": 30,
    "password": "SecurePass456!"
  }'
```

## 🔄 Mixing Both Approaches

You can even use both in the same application:

```typescript
@Controller('hybrid')
export class HybridController {
  // FluentValidation for complex business rules
  @Post('complex-users')
  @ValidateWith(ComplexUserValidator)
  createComplexUser(@Body() userData: CreateUserDto) {
    return { approach: 'FluentValidation', user: userData };
  }

  // Mediator ValidationPipe for simple validation
  @Post('simple-users')
  @UsePipes(ValidationPipe)
  createSimpleUser(@Body() userData: SimpleUserDto) {
    return { approach: 'class-validator', user: userData };
  }
}
```

## ✅ Best Practices

### FluentValidation Best Practices:

1. **One validator per DTO** - Keep validators focused
2. **Use meaningful error messages** - Always use `.withMessage()`
3. **Leverage type safety** - Use TypeScript generics properly
4. **Extract common rules** - Create reusable validation methods

### Mediator ValidationPipe Best Practices:

1. **Use validation groups** - For different scenarios
2. **Transform data types** - Leverage class-transformer
3. **Custom validators** - For complex business logic
4. **Error handling** - Use validation exception filters

## 🚀 Performance Considerations

- **FluentValidation**: Manual instantiation, more control over when validation runs
- **Mediator ValidationPipe**: Automatic transformation and validation, slightly more overhead

## 📈 Migration Path

If you want to migrate from one approach to another:

### From class-validator to FluentValidation:

```typescript
// Before (class-validator)
export class UserDto {
  @IsNotEmpty()
  @MinLength(2)
  name: string;
}

// After (FluentValidation)
export class UserValidator extends AbstractValidator<UserDto> {
  constructor() {
    super();
    this.ruleFor((x) => x.name)
      .notEmpty()
      .minLength(2);
  }
}
```

Your application now provides **maximum flexibility** with both validation approaches available globally! Choose the one that best fits your team's preferences and project requirements. 🎯
