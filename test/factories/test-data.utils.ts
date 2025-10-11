import { faker } from '@faker-js/faker';

/**
 * Common Test Data Utilities
 * Shared utilities for generating test data across different features
 */
export class TestDataUtils {
  /**
   * Generate pagination test data
   */
  static createPaginationParams(overrides?: Partial<{ page: number; limit: number }>) {
    return {
      page: overrides?.page ?? faker.number.int({ min: 1, max: 10 }),
      limit: overrides?.limit ?? faker.number.int({ min: 5, max: 50 }),
    };
  }

  /**
   * Generate invalid pagination parameters for error testing
   */
  static createInvalidPaginationParams() {
    return faker.helpers.arrayElement([
      { page: 0, limit: 10 }, // Page too low
      { page: -1, limit: 10 }, // Negative page
      { page: 1, limit: 0 }, // Limit too low
      { page: 1, limit: -5 }, // Negative limit
      { page: 1, limit: 101 }, // Limit too high
    ]);
  }

  /**
   * Generate realistic timestamps
   */
  static createTimestamps() {
    const createdAt = faker.date.past({ years: 2 });
    const updatedAt = faker.date.between({ from: createdAt, to: new Date() });

    return {
      createdAt,
      updatedAt,
    };
  }

  /**
   * Generate mock database IDs
   */
  static createId() {
    return faker.number.int({ min: 1, max: 999999 });
  }

  /**
   * Generate array of IDs
   */
  static createIds(count: number) {
    return Array.from({ length: count }, () => this.createId());
  }

  /**
   * Generate mock API response metadata
   */
  static createApiResponseMeta(page: number = 1, limit: number = 10, total: number = 100) {
    const totalPages = Math.ceil(total / limit);

    return {
      page,
      limit,
      total,
      totalPages,
      hasNext: page < totalPages,
      hasPrev: page > 1,
    };
  }

  /**
   * Generate HATEOAS links for testing
   */
  static createHateoasLinks(baseUrl: string, resourceId?: number) {
    const links = [
      {
        rel: 'self',
        href: resourceId ? `${baseUrl}/${resourceId}` : baseUrl,
        method: 'GET',
      },
    ];

    if (resourceId) {
      links.push(
        {
          rel: 'update',
          href: `${baseUrl}/${resourceId}`,
          method: 'PUT',
        },
        {
          rel: 'delete',
          href: `${baseUrl}/${resourceId}`,
          method: 'DELETE',
        },
      );
    } else {
      links.push({
        rel: 'create',
        href: baseUrl,
        method: 'POST',
      });
    }

    return links;
  }

  /**
   * Generate validation error structure for testing
   */
  static createValidationError(propertyName: string, message: string, errorCode?: string) {
    return {
      propertyName,
      message,
      errorCode: errorCode ?? 'ValidationError',
      attemptedValue: faker.lorem.word(),
    };
  }

  /**
   * Generate multiple validation errors
   */
  static createValidationErrors(count: number) {
    return Array.from({ length: count }, (_, index) =>
      this.createValidationError(faker.lorem.word(), faker.lorem.sentence(), `ValidationError${index + 1}`),
    );
  }

  /**
   * Generate problem details response for testing
   */
  static createProblemDetails(type: string = 'ValidationError') {
    return {
      type: `https://example.com/problems/${type}`,
      title: faker.lorem.sentence(),
      status: faker.helpers.arrayElement([400, 404, 422, 500]),
      detail: faker.lorem.paragraph(),
      instance: faker.internet.url(),
      timestamp: faker.date.recent().toISOString(),
      errors: this.createValidationErrors(faker.number.int({ min: 1, max: 3 })),
    };
  }

  /**
   * Generate mock mediator response
   */
  static createMediatorResponse<T>(data: T, isSuccess: boolean = true) {
    return {
      isSuccess,
      isFailure: !isSuccess,
      value: isSuccess ? data : undefined,
      error: !isSuccess ? faker.lorem.sentence() : undefined,
      errors: !isSuccess ? this.createValidationErrors(2) : [],
    };
  }

  /**
   * Seed faker for consistent test data
   */
  static seedFaker(seed: number = 12345) {
    faker.seed(seed);
  }

  /**
   * Reset faker seed for random data
   */
  static resetFaker() {
    faker.seed();
  }
}
