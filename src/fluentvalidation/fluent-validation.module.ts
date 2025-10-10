import { Global, Module } from '@nestjs/common';
import { DemoController } from './demo.controller';
import { FluentValidationPipe } from './validation.pipe';
import { GlobalValidationService } from './global-validation.service';

@Global()
@Module({
  controllers: [DemoController],
  providers: [FluentValidationPipe, GlobalValidationService],
  exports: [FluentValidationPipe, GlobalValidationService],
})
export class FluentValidationModule {}
