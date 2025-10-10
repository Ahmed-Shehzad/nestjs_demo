#!/usr/bin/env node

/**
 * CLI Wrapper for Code Generator
 *
 * Usage:
 * npm run generate:query -- --name GetUserById --feature user-management
 * npm run generate:command -- --name CreateUser --feature user-management
 * npm run generate:domain-event -- --name UserRegistered --feature user-management
 */

import { CodeGenerator, GeneratorOptions } from './generator';

function parseArgs(): GeneratorOptions {
  const args = process.argv.slice(2);
  const options: Partial<GeneratorOptions> = {};

  for (let i = 0; i < args.length; i += 2) {
    const key = args[i];
    const value = args[i + 1];

    switch (key) {
      case '--name':
        options.name = value;
        break;
      case '--feature':
        options.feature = value;
        break;
      case '--type':
        options.type = value as GeneratorOptions['type'];
        break;
      case '--output-dir':
        options.outputDir = value;
        break;
      default:
        console.warn(`Unknown argument: ${key}`);
    }
  }

  // Validate required options
  if (!options.name) {
    throw new Error('--name is required');
  }
  if (!options.feature) {
    throw new Error('--feature is required');
  }
  if (!options.type) {
    throw new Error('--type is required');
  }

  return options as GeneratorOptions;
}

function showUsage(): void {
  console.log(`
🎯 NestJS Code Generator CLI

Usage:
  node cli.js --type <type> --name <name> --feature <feature> [--output-dir <dir>]

Options:
  --type      Generator type (query|command|domain-event)
  --name      Component name (e.g., GetUserById, CreateUser)
  --feature   Feature name (e.g., user-management, orders)
  --output-dir Optional output directory override

Examples:
  node cli.js --type query --name GetUserById --feature user-management
  node cli.js --type command --name CreateUser --feature user-management
  node cli.js --type domain-event --name UserRegistered --feature user-management
`);
}

async function main(): Promise<void> {
  try {
    // Check for help flag
    if (process.argv.includes('--help') || process.argv.includes('-h')) {
      showUsage();
      return;
    }

    const options = parseArgs();
    const generator = new CodeGenerator();

    console.log(`🚀 Generating ${options.type}: ${options.name}`);
    console.log(`📁 Feature: ${options.feature}`);
    console.log('');

    await generator.generate(options);

    console.log('');
    console.log('✅ Code generation completed successfully!');
  } catch (error) {
    console.error('❌ Generation failed:', error instanceof Error ? error.message : String(error));
    console.log('');
    showUsage();
    process.exit(1);
  }
}

// Run if called directly
if (require.main === module) {
  void main();
}
