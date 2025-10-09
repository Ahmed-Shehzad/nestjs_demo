import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { MediatorModule } from './mediator';
import { GetUserByIdHandler } from './mediator/examples/handlers';

@Module({
  imports: [MediatorModule],
  controllers: [AppController],
  providers: [AppService, GetUserByIdHandler],
})
export class AppModule {}
