/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
import { Injectable, Logger } from '@nestjs/common';
import { IPipelineBehavior } from '../types/pipeline';

@Injectable()
export class LoggingBehavior implements IPipelineBehavior<any, any> {
  private readonly logger = new Logger('Mediator');

  async handleAsync(request: any, next: () => Promise<any>): Promise<any> {
    const name = request.constructor.name;
    const start = Date.now();
    try {
      const res = await next();
      this.logger.log(`${name} executed in ${Date.now() - start}ms`);
      return res;
    } catch (e) {
      this.logger.error(`${name} failed: ${e.message}`);
      throw e;
    }
  }
}
