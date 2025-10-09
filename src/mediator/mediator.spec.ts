import { Test, TestingModule } from '@nestjs/testing';
import { MediatorService } from './mediator.service';
import { MediatorModule } from './mediator.module';
import {
  RequestHandler,
  CommandHandler,
  NotificationHandler,
} from './decorators';
import {
  IRequest,
  IBaseRequest,
  INotification,
  IRequestHandler,
  ICommandHandler,
  INotificationHandler,
} from './interfaces';

// Test request
class TestQuery implements IRequest<string> {
  readonly _requestResponseType?: string;
  constructor(public readonly value: string) {}
}

// Test command
class TestCommand implements IBaseRequest {
  readonly _isCommand?: true;
  constructor(public readonly value: string) {}
}

// Test notification
class TestEvent implements INotification {
  readonly _isNotification?: true;
  constructor(public readonly value: string) {}
}

// Test handlers
@RequestHandler(TestQuery)
export class TestQueryHandler implements IRequestHandler<TestQuery, string> {
  handle(query: TestQuery): Promise<string> {
    return Promise.resolve(`Handled: ${query.value}`);
  }
}

@CommandHandler(TestCommand)
export class TestCommandHandler implements ICommandHandler<TestCommand> {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  handle(_command: TestCommand): Promise<void> {
    // Command handled
    return Promise.resolve();
  }
}

@NotificationHandler(TestEvent)
export class TestEventHandler implements INotificationHandler<TestEvent> {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  handle(_event: TestEvent): Promise<void> {
    // Event handled
    return Promise.resolve();
  }
}

describe('MediatorService', () => {
  let mediator: MediatorService;
  let module: TestingModule;

  beforeEach(async () => {
    module = await Test.createTestingModule({
      imports: [MediatorModule],
      providers: [TestQueryHandler, TestCommandHandler, TestEventHandler],
    }).compile();

    await module.init();
    mediator = module.get<MediatorService>(MediatorService);
  });

  afterEach(async () => {
    await module.close();
  });

  it('should be defined', () => {
    expect(mediator).toBeDefined();
  });

  it('should handle requests', async () => {
    const query = new TestQuery('test');
    const result = await mediator.send(query);
    expect(result).toBe('Handled: test');
  });

  it('should handle commands', async () => {
    const command = new TestCommand('test');
    await expect(mediator.send(command)).resolves.toBeUndefined();
  });

  it('should publish notifications', async () => {
    const event = new TestEvent('test');
    await expect(mediator.publish(event)).resolves.toBeUndefined();
  });

  it('should throw error for unregistered request', async () => {
    class UnregisteredQuery implements IRequest<string> {
      readonly _requestResponseType?: string;
      constructor(public readonly value: string) {}
    }

    const query = new UnregisteredQuery('test');
    await expect(mediator.send(query)).rejects.toThrow('No handler registered');
  });
});
