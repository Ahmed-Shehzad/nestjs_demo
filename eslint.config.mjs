// @ts-check
import eslint from '@eslint/js';
import jestPlugin from 'eslint-plugin-jest';
import eslintPluginPrettierRecommended from 'eslint-plugin-prettier/recommended';
import globals from 'globals';
import tseslint from 'typescript-eslint';

export default tseslint.config(
  {
    ignores: ['eslint.config.mjs'],
  },
  eslint.configs.recommended,
  ...tseslint.configs.recommendedTypeChecked,
  eslintPluginPrettierRecommended,
  {
    languageOptions: {
      globals: {
        ...globals.node,
        ...globals.jest,
      },
      sourceType: 'commonjs',
      parserOptions: {
        projectService: true,
        tsconfigRootDir: import.meta.dirname,
      },
    },
  },
  {
    rules: {
      // TypeScript-specific rules
      '@typescript-eslint/no-explicit-any': 'off',
      '@typescript-eslint/no-floating-promises': 'warn',
      '@typescript-eslint/no-unsafe-argument': 'warn',
      '@typescript-eslint/no-unsafe-assignment': 'warn',
      '@typescript-eslint/no-unsafe-call': 'warn',
      '@typescript-eslint/no-unsafe-member-access': 'warn',
      '@typescript-eslint/no-unsafe-return': 'warn',
      '@typescript-eslint/no-empty-object-type': 'off',
      '@typescript-eslint/no-unused-vars': ['warn', { argsIgnorePattern: '^_' }],
      '@typescript-eslint/require-await': 'warn', // Make this a warning instead of error
      '@typescript-eslint/no-namespace': 'warn', // Allow namespaces with warning

      // Prettier compatibility - disable conflicting rules
      'prettier/prettier': [
        'error',
        {
          singleQuote: true,
          trailingComma: 'all',
          semi: true,
          tabWidth: 2,
          useTabs: false,
          printWidth: 120,
          bracketSpacing: true,
          arrowParens: 'always',
          endOfLine: 'lf',
          quoteProps: 'as-needed',
          bracketSameLine: false,
          proseWrap: 'preserve',
        },
      ],

      // General rules
      'prefer-const': 'warn',
      'no-var': 'error',
      'object-shorthand': 'warn',
      'no-console': 'off', // Allow console in NestJS apps
    },
  },
  // Test file specific rules
  {
    files: ['**/*.spec.ts', '**/*.test.ts', '**/test-setup.ts'],
    plugins: {
      jest: jestPlugin,
    },
    rules: {
      // Relax TypeScript rules for test files
      '@typescript-eslint/no-explicit-any': 'off',
      '@typescript-eslint/no-unsafe-argument': 'off',
      '@typescript-eslint/no-unsafe-assignment': 'off',
      '@typescript-eslint/no-unsafe-call': 'off',
      '@typescript-eslint/no-unsafe-member-access': 'off',
      '@typescript-eslint/no-unsafe-return': 'off',
      '@typescript-eslint/unbound-method': 'off',
      '@typescript-eslint/no-unused-vars': 'off',

      // Jest specific rules
      'jest/expect-expect': 'off',
      'jest/no-disabled-tests': 'warn',
      'jest/no-focused-tests': 'error',
      'jest/no-identical-title': 'error',
      'jest/prefer-to-have-length': 'warn',
      'jest/valid-expect': 'error',

      // Allow non-null assertions in tests
      '@typescript-eslint/no-non-null-assertion': 'off',

      // Allow empty functions in mocks
      '@typescript-eslint/no-empty-function': 'off',

      // Allow magic numbers in tests
      '@typescript-eslint/no-magic-numbers': 'off',
    },
  },
  // Mock files specific rules
  {
    files: ['**/mocks/**/*.ts', '**/*.mock.ts'],
    rules: {
      // Relax all TypeScript safety rules for mock files
      '@typescript-eslint/no-explicit-any': 'off',
      '@typescript-eslint/no-unsafe-argument': 'off',
      '@typescript-eslint/no-unsafe-assignment': 'off',
      '@typescript-eslint/no-unsafe-call': 'off',
      '@typescript-eslint/no-unsafe-member-access': 'off',
      '@typescript-eslint/no-unsafe-return': 'off',
      '@typescript-eslint/no-unused-vars': 'off',
      '@typescript-eslint/require-await': 'off',
    },
  },
);
