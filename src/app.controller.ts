import { Controller, Get, Param } from '@nestjs/common';
import { AppService } from './app.service';
import { MediatorService } from './mediator';
import { GetUserByIdQuery } from './mediator/examples/requests';

@Controller()
export class AppController {
  constructor(
    private readonly appService: AppService,
    private readonly mediator: MediatorService,
  ) {}

  @Get()
  getHello() {
    return this.appService.getHello();
  }

  @Get('demo/:message')
  async demoMediator(@Param('message') message: string) {
    // This is a simple demo - you would create proper request/command classes
    const query = await this.mediator.send(new GetUserByIdQuery(1));
    return {
      message: `Mediator is ready! You sent: ${message} ${query.id} ${query.email}`,
      info: 'Create request/command classes and handlers to use the mediator pattern',
    };
  }
}
