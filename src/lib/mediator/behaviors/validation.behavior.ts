/* eslint-disable @typescript-eslint/no-unsafe-member-access */
import { Injectable } from '@nestjs/common';
import { MediatorDiscoveryService } from '../discovery/mediator-discovery.service';
import { IPipelineBehavior } from '../types/pipeline';

@Injectable()
export class ValidationBehavior implements IPipelineBehavior<any, any> {
  constructor(private readonly discovery: MediatorDiscoveryService) {}

  async handleAsync(request: any, next: () => Promise<any>): Promise<any> {
    const validator = this.discovery.getValidator(request.constructor.name);
    if (!validator) return next();

    const result = await validator.validateAsync(request);
    if (!result.isValid) {
      const err = new Error('Validation failed');
      (err as any).validation = result.errors;
      throw err;
    }

    return next();
  }
}
