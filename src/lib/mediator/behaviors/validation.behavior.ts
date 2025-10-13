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

    const validator = this.discovery.getValidator(requestName);
    if (!validator) {
      return next();
    }

    const result = await validator.validateAsync(request);
    if (!result.isValid) {
      // Use the Problem Details Service to create a standardized validation error
      const validationException = this.problemDetailsService.createValidationProblem(result.errors);

      throw validationException;
    }

    return next();
  }
}
