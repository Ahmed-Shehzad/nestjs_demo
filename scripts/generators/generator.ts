#!/usr/bin/env node

/**
 * Code Generator CLI
 *
 * Generates code structures for:
 * - Queries (with DTOs, validators, handlers)
 * - Commands (with validators, handlers)
 * - Domain Events (with handlers, notifications)
 */

import * as fs from 'fs';
import * as path from 'path';
import * as readline from 'readline';

interface GeneratorOptions {
  type: 'query' | 'command' | 'domain-event';
  name: string;
  feature: string;
  outputDir?: string;
}

class CodeGenerator {
  private readonly templatesDir = path.join(__dirname, 'templates');
  private readonly srcDir = path.join(process.cwd(), 'src');

  async generate(options: GeneratorOptions): Promise<void> {
    console.log(`🚀 Generating ${options.type} for: ${options.name}`);
    console.log(`📁 Feature: ${options.feature}`);

    switch (options.type) {
      case 'query':
        await this.generateQuery(options);
        break;
      case 'command':
        await this.generateCommand(options);
        break;
      case 'domain-event':
        await this.generateDomainEvent(options);
        break;
      default:
        throw new Error('Unknown generator type');
    }

    console.log('✅ Generation completed!');
  }

  private async generateQuery(options: GeneratorOptions): Promise<void> {
    const templates = [
      'query.template.txt',
      'query-dto.template.txt',
      'query-validator.template.txt',
      'query-handler.template.txt',
    ];

    await this.processTemplates(templates, options, 'queries');
  }

  private async generateCommand(options: GeneratorOptions): Promise<void> {
    const templates = ['command.template.txt', 'command-validator.template.txt', 'command-handler.template.txt'];

    await this.processTemplates(templates, options, 'commands');
  }

  private async generateDomainEvent(options: GeneratorOptions): Promise<void> {
    const templates = ['domain-event.template.txt', 'domain-event-handler.template.txt'];

    await this.processTemplates(templates, options, 'events/domain');
  }

  private async processTemplates(templates: string[], options: GeneratorOptions, subDir: string): Promise<void> {
    const outputDir = path.join(this.srcDir, 'features', options.feature, subDir);

    // Ensure output directory exists
    this.ensureDirectoryExists(outputDir);

    for (const template of templates) {
      const templatePath = path.join(this.templatesDir, template);
      const outputFileName = this.getOutputFileName(template, options.name);
      const outputPath = path.join(outputDir, outputFileName);

      await this.processTemplate(templatePath, outputPath, options);
    }
  }

  private processTemplate(templatePath: string, outputPath: string, options: GeneratorOptions): Promise<void> {
    return new Promise((resolve, reject) => {
      fs.readFile(templatePath, 'utf8', (err, content) => {
        if (err) return reject(err);

        const processedContent = this.replaceTokens(content, options);

        fs.writeFile(outputPath, processedContent, 'utf8', (writeErr) => {
          if (writeErr) return reject(writeErr);
          console.log(`📄 Created: ${outputPath}`);
          resolve();
        });
      });
    });
  }

  private replaceTokens(content: string, options: GeneratorOptions): string {
    const tokens = this.generateTokens(options);

    let result = content;
    for (const [token, value] of Object.entries(tokens)) {
      const regex = new RegExp(`{{${token}}}`, 'g');
      result = result.replace(regex, value);
    }

    return result;
  }

  private generateTokens(options: GeneratorOptions): Record<string, string> {
    const pascalName = this.toPascalCase(options.name);
    const camelName = this.toCamelCase(options.name);
    const kebabName = this.toKebabCase(options.name);

    return {
      NAME_PASCAL: pascalName,
      NAME_CAMEL: camelName,
      NAME_KEBAB: kebabName,
      FEATURE_PASCAL: this.toPascalCase(options.feature),
      FEATURE_CAMEL: this.toCamelCase(options.feature),
      FEATURE_KEBAB: this.toKebabCase(options.feature),
      TIMESTAMP: new Date().toISOString(),
    };
  }

  private getOutputFileName(template: string, name: string): string {
    const kebabName = this.toKebabCase(name);
    const mapping: Record<string, string> = {
      'query.template.txt': `${kebabName}.query.ts`,
      'query-dto.template.txt': `${kebabName}.dto.ts`,
      'query-validator.template.txt': `${kebabName}.validator.ts`,
      'query-handler.template.txt': `${kebabName}.handler.ts`,
      'command.template.txt': `${kebabName}.command.ts`,
      'command-validator.template.txt': `${kebabName}.validator.ts`,
      'command-handler.template.txt': `${kebabName}.handler.ts`,
      'domain-event.template.txt': `${kebabName}.event.ts`,
      'domain-event-handler.template.txt': `${kebabName}.handler.ts`,
    };

    return mapping[template] || template;
  }

  private toPascalCase(str: string): string {
    return str
      .replace(/([a-z])([A-Z])/g, '$1 $2') // Split camelCase
      .split(/[-_\s]+/) // Split on delimiters
      .filter((word) => word.length > 0) // Remove empty strings
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
      .join('');
  }

  private toCamelCase(str: string): string {
    const pascal = this.toPascalCase(str);
    return pascal.charAt(0).toLowerCase() + pascal.slice(1);
  }

  private toKebabCase(str: string): string {
    return str
      .replace(/([a-z])([A-Z])/g, '$1-$2')
      .replace(/[\s_]+/g, '-')
      .toLowerCase();
  }

  private ensureDirectoryExists(dirPath: string): void {
    if (!fs.existsSync(dirPath)) {
      fs.mkdirSync(dirPath, { recursive: true });
      console.log(`📁 Created directory: ${dirPath}`);
    }
  }
}

// CLI Interface
async function promptUser(): Promise<GeneratorOptions> {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });

  const question = (prompt: string): Promise<string> => {
    return new Promise((resolve) => {
      rl.question(prompt, resolve);
    });
  };

  console.log('🎯 NestJS Code Generator');
  console.log('========================');

  const type = await question('📋 Select type:\n1) Query\n2) Command\n3) Domain Event\nEnter choice (1-3): ');

  const typeMap: Record<string, GeneratorOptions['type']> = {
    '1': 'query',
    '2': 'command',
    '3': 'domain-event',
  };

  const selectedType = typeMap[type];
  if (!selectedType) {
    rl.close();
    throw new Error('Invalid selection');
  }

  const name = await question('📝 Enter name (e.g., GetUserById, CreateUser): ');
  const feature = await question('📂 Enter feature name (e.g., user-management, orders): ');

  rl.close();

  return {
    type: selectedType,
    name: name.trim(),
    feature: feature.trim(),
  };
}

// Main execution
async function main(): Promise<void> {
  try {
    const generator = new CodeGenerator();
    const options = await promptUser();
    await generator.generate(options);
  } catch (error) {
    console.error('❌ Generator failed:', error instanceof Error ? error.message : String(error));
    process.exit(1);
  }
}

// Run if called directly
if (require.main === module) {
  void main();
}

export { CodeGenerator };
export type { GeneratorOptions };
