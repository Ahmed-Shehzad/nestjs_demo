import { Module } from '@nestjs/common';
import { DiscoveryModule } from '@golevelup/nestjs-discovery';
import { FluentValidationModule } from '@/fluent-validation/fluent-validation.module';
import { MediatorDiscoveryService } from './discovery/mediator-discovery.service';
import { NotificationPublisher } from './services/notification-publisher.service';
import { LoggingBehavior } from './behaviors/logging.behavior';
import { TelemetryBehavior } from './behaviors/telemetry.behavior';
import { ValidationBehavior } from './behaviors/validation.behavior';

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
  imports: [
    DiscoveryModule, // For automatic discovery of handlers and validators
    FluentValidationModule, // For validator integration
  ],
  providers: [
    // Core services
    MediatorDiscoveryService,
    NotificationPublisher,

    // Pipeline behaviors
    LoggingBehavior,
    TelemetryBehavior,
    ValidationBehavior,
  ],
  exports: [
    // Export core services for use in other modules
    MediatorDiscoveryService,
    NotificationPublisher,

    // Export behaviors for custom pipeline configurations
    LoggingBehavior,
    TelemetryBehavior,
    ValidationBehavior,
  ],
})
export class MediatorModule {}
