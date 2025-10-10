import { Module } from '@nestjs/common';

/**
 * Fluent Validation Module
 *
 * Provides the fluent validation system for the application.
 * This module exports the AbstractValidator base class for creating
 * custom validators using the fluent API.
 */
@Module({
  providers: [
    // Note: AbstractValidator is abstract, so we don't register it as a provider
    // Concrete validators will be registered in their respective modules
  ],
  exports: [
    // Export types and classes that other modules might need
  ],
})
export class FluentValidationModule {}
