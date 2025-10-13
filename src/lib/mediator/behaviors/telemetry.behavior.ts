/* eslint-disable @typescript-eslint/no-unsafe-argument */
/* eslint-disable @typescript-eslint/no-unsafe-return */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */

import { Injectable } from '@nestjs/common';
import { trace } from '@opentelemetry/api';
import { IPipelineBehavior } from '../types/pipeline';

@Injectable()
export class TelemetryBehavior implements IPipelineBehavior<any, any> {
  async handleAsync(request: any, next: () => Promise<any>): Promise<any> {
    const requestName = request.constructor.name;

    const tracer = trace.getTracer('nestjs-mediator');
    return await tracer.startActiveSpan(requestName, async (span) => {
      try {
        const res = await next();
        span.setStatus({ code: 1 });
        return res;
      } catch (err) {
        const exception = err instanceof Error ? err : new Error(String(err));
        span.recordException(exception);
        throw err;
      } finally {
        span.end();
      }
    });
  }
}
