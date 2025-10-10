import { Controller, Post, Body, UsePipes } from '@nestjs/common';
import {
  HybridValidationPipe,
  CombinedValidation,
  FluentPriority,
  ClassValidatorPriority,
  FluentValidationOnly,
  ClassValidatorOnly,
} from '../validation/hybrid-validation.pipe';
import { CreateUserValidator } from '../fluentvalidation/validators';
import { CreateUserDto } from '../fluentvalidation/dto';

@Controller('hybrid-validation')
export class HybridValidationController {
  // Combined validation - both FluentValidation and class-validator
  @Post('combined')
  @UsePipes(CombinedValidation(CreateUserValidator))
  createWithCombined(@Body() userData: CreateUserDto) {
    return {
      message: 'Success! Passed both FluentValidation and class-validator',
      approach: 'Combined Validation (both systems)',
      user: userData,
    };
  }

  // FluentValidation takes priority
  @Post('fluent-priority')
  @UsePipes(FluentPriority(CreateUserValidator))
  createWithFluentPriority(@Body() userData: CreateUserDto) {
    return {
      message: 'Success! FluentValidation took priority',
      approach: 'FluentValidation Priority',
      user: userData,
    };
  }

  // Class-validator takes priority
  @Post('class-validator-priority')
  @UsePipes(ClassValidatorPriority(CreateUserValidator))
  createWithClassValidatorPriority(@Body() userData: CreateUserDto) {
    return {
      message: 'Success! class-validator took priority',
      approach: 'class-validator Priority',
      user: userData,
    };
  }

  // FluentValidation only
  @Post('fluent-only')
  @UsePipes(FluentValidationOnly(CreateUserValidator))
  createWithFluentOnly(@Body() userData: CreateUserDto) {
    return {
      message: 'Success! Using FluentValidation only',
      approach: 'FluentValidation Only',
      user: userData,
    };
  }

  // Class-validator only
  @Post('class-validator-only')
  @UsePipes(ClassValidatorOnly())
  createWithClassValidatorOnly(@Body() userData: CreateUserDto) {
    return {
      message: 'Success! Using class-validator only',
      approach: 'class-validator Only',
      user: userData,
    };
  }

  // Custom hybrid configuration
  @Post('custom-hybrid')
  createWithCustomHybrid(
    @Body(
      new HybridValidationPipe({
        useFluentValidation: true,
        useClassValidator: true,
        fluentValidator: CreateUserValidator,
        combineErrors: true,
        priority: 'both',
      }),
    )
    userData: CreateUserDto,
  ) {
    return {
      message: 'Success! Custom hybrid validation configuration',
      approach: 'Custom Hybrid Configuration',
      user: userData,
    };
  }

  // Info endpoint
  @Post('info')
  getHybridValidationInfo() {
    return {
      title: 'Hybrid Validation System',
      description:
        'Combines the power of FluentValidation and class-validator in one pipe',
      features: [
        'Run both validation systems simultaneously',
        'Choose priority (fluent, class-validator, or both)',
        'Combine errors from both systems',
        'Factory functions for common use cases',
        'Flexible configuration options',
      ],
      endpoints: {
        '/hybrid-validation/combined': 'Both validations run, errors combined',
        '/hybrid-validation/fluent-priority':
          'FluentValidation runs first, stops on error',
        '/hybrid-validation/class-validator-priority':
          'class-validator runs first, stops on error',
        '/hybrid-validation/fluent-only': 'Only FluentValidation runs',
        '/hybrid-validation/class-validator-only': 'Only class-validator runs',
        '/hybrid-validation/custom-hybrid': 'Custom configuration example',
      },
      configuration: {
        useFluentValidation: 'Enable/disable FluentValidation',
        useClassValidator: 'Enable/disable class-validator',
        fluentValidator: 'FluentValidation validator class',
        combineErrors: 'Combine errors from both systems',
        priority: "Priority: 'fluent', 'class-validator', or 'both'",
      },
      benefits: [
        'Best of both worlds - programmatic + decorator validation',
        'Gradual migration between validation systems',
        'Validation redundancy for critical data',
        'Flexible error handling strategies',
        'Maintain compatibility with existing code',
      ],
    };
  }
}
