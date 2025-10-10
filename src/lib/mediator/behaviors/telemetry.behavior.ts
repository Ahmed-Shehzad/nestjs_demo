/* eslint-disable @typescript-eslint/no-unsafe-return */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */

import { Injectable } from '@nestjs/common';
import { trace } from '@opentelemetry/api';
import { IPipelineBehavior } from '../types/pipeline';

@Injectable()
export class TelemetryBehavior implements IPipelineBehavior<any, any> {
  async handleAsync(request: any, next: () => Promise<any>): Promise<any> {
    const tracer = trace.getTracer('nestjs-mediator');
    return await tracer.startActiveSpan(request.constructor.name, async (span) => {
      try {
        const res = await next();
        span.setStatus({ code: 1 });
        return res;
      } catch (err) {
        span.recordException(err);
        throw err;
      } finally {
        span.end();
      }
    });
  }
}
