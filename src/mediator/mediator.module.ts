import { Global, Module } from '@nestjs/common';
import { DiscoveryModule } from '@nestjs/core';
import { MediatorService } from './mediator.service';
import { ValidationPipe } from './mediator.pipe';

/**
 * Mediator module that provides a MediatR-like pattern for NestJS
 *
 * This module is marked as Global so it can be used throughout the application
 * without needing to import it in every module that uses it.
 *
 * Usage:
 * 1. Import MediatorModule in your AppModule
 * 2. Create request/command/notification classes implementing the appropriate interfaces
 * 3. Create handler classes decorated with @RequestHandler, @CommandHandler, or @NotificationHandler
 * 4. Inject MediatorService and use send() or publish() methods
 */
@Global()
@Module({
  imports: [DiscoveryModule],
  providers: [MediatorService, ValidationPipe],
  exports: [MediatorService, ValidationPipe],
})
export class MediatorModule {}
