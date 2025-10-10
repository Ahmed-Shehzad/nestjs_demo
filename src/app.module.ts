import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { MediatorModule } from '@/mediator/mediator.module';

@Module({
  imports: [
    MediatorModule, // Mediator module (which includes FluentValidationModule)
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
