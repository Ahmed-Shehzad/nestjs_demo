/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
import { Injectable } from '@nestjs/common';
import { MediatorDiscoveryService } from '../discovery/mediator-discovery.service';
import { IPipelineBehavior } from '../types/pipeline';

@Injectable()
export class ValidationBehavior implements IPipelineBehavior<any, any> {
  constructor(private readonly discovery: MediatorDiscoveryService) {}

  async handleAsync(request: any, next: () => Promise<any>): Promise<any> {
    const requestName = request.constructor.name;
    console.log(`[Validation] Processing request: ${requestName}`);

    const validator = this.discovery.getValidator(requestName);
    if (!validator) {
      console.log(`[Validation] No validator found for: ${requestName}`);
      return next();
    }

    const result = await validator.validateAsync(request);
    if (!result.isValid) {
      const err = new Error('Validation failed');
      (err as any).validation = result.errors;
      throw err;
    }

    return next();
  }
}
