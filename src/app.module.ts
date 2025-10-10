import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { MediatorModule } from './mediator';
import { GetUserByIdHandler } from './mediator/examples/handlers';
import { FluentValidationModule } from './fluentvalidation/fluent-validation.module';
import { GlobalValidationController } from './controllers/global-validation.controller';
import { ClassValidatorDemoController } from './controllers/class-validator-demo.controller';
import { MediatorValidationController } from './controllers/mediator-validation.controller';
import { HybridValidationController } from './controllers/hybrid-validation.controller';
import { UserService } from './services/user.service';

@Module({
  imports: [MediatorModule, FluentValidationModule],
  controllers: [
    AppController,
    GlobalValidationController,
    ClassValidatorDemoController,
    MediatorValidationController,
    HybridValidationController,
  ],
  providers: [AppService, GetUserByIdHandler, UserService],
})
export class AppModule {}
