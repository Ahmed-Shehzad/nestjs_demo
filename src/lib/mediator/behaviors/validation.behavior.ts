/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import { MediatorDiscoveryService } from '@/mediator/discovery/mediator-discovery.service';
import { IPipelineBehavior } from '@/mediator/types/pipeline';
import { ProblemDetailsService } from '@/problem-details/services/problem-details.service';
import { Injectable } from '@nestjs/common';

@Injectable()
export class ValidationBehavior implements IPipelineBehavior<any, any> {
  constructor(
    private readonly discovery: MediatorDiscoveryService,
    private readonly problemDetailsService: ProblemDetailsService,
  ) {}

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
      console.log(`[Validation] Validation failed for ${requestName}:`, result.errors);

      // Use the Problem Details Service to create a standardized validation error
      const validationException = this.problemDetailsService.createValidationProblem(result.errors);

      throw validationException;
    }

    return next();
  }
}
