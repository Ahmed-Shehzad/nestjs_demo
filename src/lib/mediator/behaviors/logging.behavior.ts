/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
import { Injectable, Logger } from '@nestjs/common';
import { IPipelineBehavior } from '../types/pipeline';

@Injectable()
export class LoggingBehavior implements IPipelineBehavior<any, any> {
  private readonly logger = new Logger('Mediator');

  async handleAsync(request: any, next: () => Promise<any>): Promise<any> {
    const name = request.constructor.name;
    console.log(`[Logging] Starting execution of: ${name}`);
    const start = Date.now();
    try {
      const res = await next();
      const duration = Date.now() - start;
      console.log(`[Logging] Completed execution of: ${name} in ${duration}ms`);
      this.logger.log(`${name} executed in ${duration}ms`);
      return res;
    } catch (e) {
      console.log(`[Logging] Failed execution of: ${name} - ${e.message}`);
      this.logger.error(`${name} failed: ${e.message}`);
      throw e;
    }
  }
}
