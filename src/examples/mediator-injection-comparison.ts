/**
 * COMPARISON: String Token vs Proper Type-Safe Token
 *
 * This file demonstrates the difference between using string tokens
 * and proper type-safe dependency injection tokens.
 */

import { InjectMediator, MEDIATOR_TOKEN } from '@/mediator/mediator.module';
import type { IMediator } from '@/mediator/types/mediator';
import { Inject, Injectable } from '@nestjs/common';

// ❌ OLD APPROACH: Using String Token (Anti-pattern)
@Injectable()
export class UserServiceOldWay {
  constructor(
    @Inject('IMediator') private readonly mediator: IMediator, // ❌ String token
  ) {}

  // Problems with this approach:
  // 1. No compile-time type checking for the token
  // 2. IDE cannot provide proper autocomplete/refactoring
  // 3. Typos in string tokens only surface at runtime
  // 4. Hard to find all usages across the codebase
  // 5. No type safety - you could inject anything with this token
}

// ✅ BETTER APPROACH: Using Symbol Token
@Injectable()
export class UserServiceBetterWay {
  constructor(
    @Inject(MEDIATOR_TOKEN) private readonly mediator: IMediator, // ✅ Symbol token
  ) {}

  // Benefits:
  // 1. Compile-time type checking
  // 2. Unique symbol prevents accidental collisions
  // 3. Better IDE support for refactoring
  // 4. More explicit and searchable
}

// ✅ BEST APPROACH: Using Custom Decorator
@Injectable()
export class UserServiceBestWay {
  constructor(
    @InjectMediator() private readonly mediator: IMediator, // ✅ Custom decorator
  ) {}

  // Additional Benefits:
  // 1. Clean, readable code
  // 2. Consistent injection pattern across the codebase
  // 3. Easy to change underlying token implementation
  // 4. Self-documenting code
  // 5. Type safety built into the decorator
}

/**
 * MIGRATION STRATEGY
 *
 * To migrate from string tokens to the new approach:
 *
 * 1. Search and replace across your codebase:
 *    - Find: @Inject('IMediator')
 *    - Replace: @InjectMediator()
 *
 * 2. Update imports to include the new decorator:
 *    - Add: import { InjectMediator } from '@/mediator/mediator.module';
 *
 * 3. Keep the IMediator type import for type annotations:
 *    - Keep: import type { IMediator } from '@/mediator/types/mediator';
 */

// Example of migrated controller:
import { Controller, Get } from '@nestjs/common';

@Controller('example')
export class ExampleController {
  constructor(
    @InjectMediator() private readonly mediator: IMediator, // ✅ New approach
  ) {}

  @Get()
  async getExample() {
    // The mediator instance is properly typed and injected
    // with full IDE support and compile-time type checking
    return { message: 'Mediator injected successfully!' };
  }
}
