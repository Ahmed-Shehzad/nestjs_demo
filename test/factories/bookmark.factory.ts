import { faker } from '@faker-js/faker';

/**
 * Bookmark Test Data Factory
 * Generates realistic test data for Bookmark entities
 */
export class BookmarkFactory {
  /**
   * Create a valid bookmark with all fields
   */
  static createValid() {
    return {
      id: faker.number.int({ min: 1, max: 999999 }),
      title: faker.lorem.sentence({ min: 3, max: 8 }),
      url: faker.internet.url(),
      description: faker.lorem.paragraph({ min: 1, max: 3 }),
      tags: faker.helpers.arrayElements(
        ['web', 'development', 'javascript', 'typescript', 'react', 'nodejs', 'tutorial', 'documentation'],
        { min: 1, max: 4 },
      ),
      category: faker.helpers.arrayElement(['Development', 'Design', 'Business', 'Personal', 'Education']),
      userId: faker.number.int({ min: 1, max: 1000 }),
      isPublic: faker.datatype.boolean(),
      createdAt: faker.date.past(),
      updatedAt: faker.date.recent(),
    };
  }

  /**
   * Create a bookmark with minimal required fields
   */
  static createMinimal() {
    return {
      title: faker.lorem.words(3),
      url: faker.internet.url(),
      userId: faker.number.int({ min: 1, max: 1000 }),
    };
  }

  /**
   * Create a bookmark with invalid URL
   */
  static createWithInvalidUrl() {
    return {
      title: faker.lorem.sentence(),
      url: 'not-a-valid-url',
      description: faker.lorem.paragraph(),
      userId: faker.number.int({ min: 1, max: 1000 }),
    };
  }

  /**
   * Create a bookmark with empty title
   */
  static createWithEmptyTitle() {
    return {
      title: '',
      url: faker.internet.url(),
      description: faker.lorem.paragraph(),
      userId: faker.number.int({ min: 1, max: 1000 }),
    };
  }

  /**
   * Create a bookmark with very long title
   */
  static createWithLongTitle() {
    return {
      title: faker.string.alpha(501), // Assuming 500 char limit
      url: faker.internet.url(),
      description: faker.lorem.paragraph(),
      userId: faker.number.int({ min: 1, max: 1000 }),
    };
  }

  /**
   * Create multiple valid bookmarks
   */
  static createMany(count: number) {
    return Array.from({ length: count }, () => this.createValid());
  }

  /**
   * Create bookmarks for specific user
   */
  static createForUser(userId: number, count: number = 3) {
    return Array.from({ length: count }, () => ({
      ...this.createValid(),
      userId,
    }));
  }

  /**
   * Create bookmarks for pagination testing
   */
  static createForPagination(index: number) {
    return {
      id: index,
      title: `Bookmark ${index}`,
      url: `https://example${index}.com`,
      description: `Description for bookmark ${index}`,
      tags: [`tag${index}`, 'test'],
      category: 'Test',
      userId: faker.number.int({ min: 1, max: 10 }),
      isPublic: index % 2 === 0, // Alternate public/private
      createdAt: faker.date.past({ years: 1 }),
      updatedAt: faker.date.recent(),
    };
  }

  /**
   * Create public bookmarks
   */
  static createPublic() {
    return {
      ...this.createValid(),
      isPublic: true,
    };
  }

  /**
   * Create private bookmarks
   */
  static createPrivate() {
    return {
      ...this.createValid(),
      isPublic: false,
    };
  }

  /**
   * Create bookmark with specific category
   */
  static createWithCategory(category: string) {
    return {
      ...this.createValid(),
      category,
    };
  }

  /**
   * Create bookmark with specific tags
   */
  static createWithTags(tags: string[]) {
    return {
      ...this.createValid(),
      tags,
    };
  }
}
