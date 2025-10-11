// Mock faker for Jest compatibility
const mockFaker = {
  number: {
    int: ({ min = 1, max = 100 } = {}) => Math.floor(Math.random() * (max - min + 1)) + min,
  },
  lorem: {
    sentence: ({ min = 4, max = 8 } = {}) => 'Lorem ipsum dolor sit amet',
    paragraph: ({ min = 1, max = 3 } = {}) => 'Lorem ipsum dolor sit amet, consectetur adipiscing elit.',
    words: (count = 3) => 'Lorem ipsum dolor',
    word: () => 'Lorem',
  },
  internet: {
    url: () => 'https://example.com',
    email: () => 'test@example.com',
    password: ({ length = 8 }) => 'password123',
  },
  person: {
    firstName: () => 'John',
    lastName: () => 'Doe',
  },
  date: {
    past: ({ years = 1 } = {}) => new Date(Date.now() - years * 365 * 24 * 60 * 60 * 1000),
    recent: () => new Date(),
    between: ({ from, to }) => new Date(from.getTime() + Math.random() * (to.getTime() - from.getTime())),
  },
  helpers: {
    arrayElements: (array, { min = 1, max = array.length } = {}) => {
      const count = Math.floor(Math.random() * (max - min + 1)) + min;
      return array.slice(0, count);
    },
    arrayElement: (array) => array[Math.floor(Math.random() * array.length)],
  },
  datatype: {
    boolean: () => Math.random() > 0.5,
  },
  string: {
    alpha: (length) => 'a'.repeat(length),
  },
  seed: (seed) => {
    // Mock seed function
  },
};

export { mockFaker as faker };
