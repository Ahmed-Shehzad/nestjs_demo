import { FluentValidationModule } from '@/fluent-validation/fluent-validation.module';
import { DiscoveryModule } from '@golevelup/nestjs-discovery';
import { Module } from '@nestjs/common';
import { LoggingBehavior } from './behaviors/logging.behavior';
import { TelemetryBehavior } from './behaviors/telemetry.behavior';
import { ValidationBehavior } from './behaviors/validation.behavior';
import { MediatorDiscoveryService } from './discovery/mediator-discovery.service';
import { MediatorService } from './services/mediator.service';
import { NotificationPublisher } from './services/notification-publisher.service';

/**
 * Injection token for the IMediator interface.
 * This provides type safety and proper dependency injection.
 */
export const MEDIATOR_TOKEN = Symbol('IMediator');

// Re-export the injection decorator and types for convenience
export { InjectMediator } from './decorators/inject-mediator.decorator';
export type { IMediator } from './types/mediator';

/**
 * Mediator Module
 *
 * Provides the CQRS mediator pattern implementation with pipeline behaviors.
 * This module includes:
 * - Request/Command/Query handling
 * - Pipeline behaviors (logging, telemetry, validation)
 * - Automatic discovery of handlers and validators
 * - Integration with fluent validation system
 */
@Module({
  imports: [DiscoveryModule, FluentValidationModule],
  providers: [
    MediatorDiscoveryService,
    NotificationPublisher,
    MediatorService,
    {
      provide: MEDIATOR_TOKEN,
      useClass: MediatorService,
    },
    LoggingBehavior,
    TelemetryBehavior,
    ValidationBehavior,
  ],
  exports: [
    MediatorDiscoveryService,
    NotificationPublisher,
    MEDIATOR_TOKEN,
    LoggingBehavior,
    TelemetryBehavior,
    ValidationBehavior,
  ],
})
export class MediatorModule {}
