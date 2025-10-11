import { faker } from '@faker-js/faker';

/**
 * User Test Data Factory
 * Generates realistic test data for User entities
 */
export class UserFactory {
  /**
   * Create a valid user with all required fields
   */
  static createValid() {
    return {
      id: faker.number.int({ min: 1, max: 999999 }),
      email: faker.internet.email().toLowerCase(),
      password: faker.internet.password({ length: 12 }), // Ensure it meets length requirements
      firstName: faker.person.firstName(),
      lastName: faker.person.lastName(),
      createdAt: faker.date.past(),
      updatedAt: faker.date.recent(),
    };
  }

  /**
   * Create a user with minimal required fields
   */
  static createMinimal() {
    return {
      email: faker.internet.email().toLowerCase(),
      password: faker.internet.password({ length: 8 }), // Minimum valid password
    };
  }

  /**
   * Create a user with only optional fields set to null
   */
  static createWithNullOptionals() {
    return {
      email: faker.internet.email().toLowerCase(),
      password: faker.internet.password({ length: 10 }),
      firstName: null,
      lastName: null,
    };
  }

  /**
   * Create a user with invalid email
   */
  static createWithInvalidEmail() {
    return {
      email: 'invalid-email-format',
      password: faker.internet.password({ length: 8 }),
      firstName: faker.person.firstName(),
      lastName: faker.person.lastName(),
    };
  }

  /**
   * Create a user with short password
   */
  static createWithShortPassword() {
    return {
      email: faker.internet.email().toLowerCase(),
      password: faker.internet.password({ length: 3 }), // Too short
      firstName: faker.person.firstName(),
      lastName: faker.person.lastName(),
    };
  }

  /**
   * Create a user with long password
   */
  static createWithLongPassword() {
    return {
      email: faker.internet.email().toLowerCase(),
      password: faker.internet.password({ length: 129 }), // Too long
      firstName: faker.person.firstName(),
      lastName: faker.person.lastName(),
    };
  }

  /**
   * Create a user with very long names
   */
  static createWithLongNames() {
    return {
      email: faker.internet.email().toLowerCase(),
      password: faker.internet.password({ length: 10 }),
      firstName: faker.string.alpha(101), // Too long (assuming 100 char limit)
      lastName: faker.string.alpha(101), // Too long
    };
  }

  /**
   * Create multiple valid users
   */
  static createMany(count: number) {
    return Array.from({ length: count }, () => this.createValid());
  }

  /**
   * Create a user for pagination testing
   */
  static createForPagination(index: number) {
    return {
      id: index,
      email: `user-${index}@test.com`,
      password: faker.internet.password({ length: 10 }),
      firstName: `User${index}`,
      lastName: `Last${index}`,
      createdAt: faker.date.past({ years: 1 }),
      updatedAt: faker.date.recent(),
    };
  }
}
