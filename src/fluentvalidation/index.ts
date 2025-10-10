// FluentValidation for TypeScript/NestJS
// Inspired by C# FluentValidation library

export * from './validation-result';
export * from './abstract-validator';

// Re-export main classes for convenience
export { AbstractValidator } from './abstract-validator';
export {
  ValidationResult,
  ValidationError,
  ValidationFailure,
} from './validation-result';
export { FluentValidationPipe, ValidationPipe } from './validation.pipe';
export { GlobalValidationService } from './global-validation.service';
export { ValidateWith, CreateValidationDecorator } from './decorators';
export { FluentValidationModule } from './fluent-validation.module';
export * from './dto';
export * from './validators';
