#!/usr/bin/env ts-node

import { PrismaClient, Prisma } from '@prisma/client';
import { CodeGenerator } from './generator';

interface PrismaModel {
  name: string;
  fields: PrismaField[];
  primaryKey?: string;
  uniqueFields: string[];
  relations: PrismaRelation[];
}

interface PrismaField {
  name: string;
  type: string;
  isOptional: boolean;
  isUnique: boolean;
  isId: boolean;
  isAutoIncrement: boolean;
  hasDefaultValue: boolean;
  relationName?: string;
  relationFromFields?: string[];
  relationToFields?: string[];
}

interface PrismaRelation {
  name: string;
  type: string;
  model: string;
  isArray: boolean;
  isOptional: boolean;
}

class PrismaClientGenerator {
  private prisma: PrismaClient;
  private generator: CodeGenerator;

  constructor() {
    this.prisma = new PrismaClient();
    this.generator = new CodeGenerator();
  }

  async initialize() {
    try {
      await this.prisma.$connect();
      console.log('✅ Connected to database successfully');
    } catch (error) {
      console.error('❌ Failed to connect to database:', error);
      throw error;
    }
  }

  async disconnect() {
    await this.prisma.$disconnect();
  }

  /**
   * Get all models from Prisma DMMF (Data Model Meta Format)
   */
  private getModelsFromDMMF(): PrismaModel[] {
    // Use Prisma.dmmf which is the proper way to access DMMF
    const dmmf = Prisma.dmmf;

    if (!dmmf || !dmmf.datamodel || !dmmf.datamodel.models) {
      throw new Error('Unable to access Prisma DMMF. Make sure Prisma Client is properly generated.');
    }

    return dmmf.datamodel.models.map((model) => {
      const fields: PrismaField[] = model.fields.map((field) => ({
        name: field.name,
        type: this.mapPrismaTypeToTypeScript(field.type),
        isOptional: !field.isRequired,
        isUnique: field.isUnique,
        isId: field.isId,
        // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
        isAutoIncrement: field.hasDefaultValue && (field.default as any)?.name === 'autoincrement',
        hasDefaultValue: field.hasDefaultValue,
        relationName: field.relationName || undefined,
        relationFromFields: field.relationFromFields ? [...field.relationFromFields] : undefined,
        relationToFields: field.relationToFields ? [...field.relationToFields] : undefined,
      }));

      const relations: PrismaRelation[] = model.fields
        .filter((field) => field.kind === 'object')
        .map((field) => ({
          name: field.name,
          type: field.type,
          model: field.type,
          isArray: field.isList,
          isOptional: !field.isRequired,
        }));

      const primaryKey = fields.find((f) => f.isId)?.name || 'id';
      const uniqueFields = fields.filter((f) => f.isUnique).map((f) => f.name);

      return {
        name: model.name,
        fields,
        primaryKey,
        uniqueFields,
        relations,
      };
    });
  }

  /**
   * Map Prisma types to TypeScript types
   */
  private mapPrismaTypeToTypeScript(prismaType: string): string {
    const typeMap: Record<string, string> = {
      String: 'string',
      Int: 'number',
      Float: 'number',
      Boolean: 'boolean',
      DateTime: 'Date',
      Json: 'any',
      Bytes: 'Buffer',
      Decimal: 'number',
      BigInt: 'bigint',
    };

    return typeMap[prismaType] || prismaType;
  }

  /**
   * List all available models
   */
  listModels(): void {
    try {
      const models = this.getModelsFromDMMF();

      console.log('\n📋 Available Prisma Models:');
      console.log('═'.repeat(50));

      models.forEach((model) => {
        console.log(`\n📦 ${model.name}`);
        console.log(`   Fields: ${model.fields.length}`);
        console.log(`   Relations: ${model.relations.length}`);
        console.log(`   Primary Key: ${model.primaryKey}`);

        // Show field details
        const regularFields = model.fields.filter((f) => !model.relations.some((r) => r.name === f.name));
        console.log(`   Schema: {`);
        regularFields.forEach((field) => {
          const optional = field.isOptional ? '?' : '';
          const unique = field.isUnique ? ' @unique' : '';
          const id = field.isId ? ' @id' : '';
          const autoInc = field.isAutoIncrement ? ' @autoincrement' : '';
          console.log(`     ${field.name}${optional}: ${field.type}${id}${autoInc}${unique}`);
        });

        // Show relations
        if (model.relations.length > 0) {
          console.log(`     // Relations:`);
          model.relations.forEach((relation) => {
            const array = relation.isArray ? '[]' : '';
            const optional = relation.isOptional ? '?' : '';
            console.log(`     ${relation.name}${optional}: ${relation.type}${array}`);
          });
        }

        console.log(`   }`);
      });

      console.log('\n💡 Usage:');
      console.log('   npm run gen:prisma-client -- --model ModelName');
      console.log('   npm run gen:prisma-client -- --model User');
    } catch (error) {
      console.error('❌ Error listing models:', error);
      throw error;
    }
  }

  /**
   * Generate features for a specific model
   */
  async generateModelFeatures(modelName: string): Promise<void> {
    try {
      const models = this.getModelsFromDMMF();
      const model = models.find((m) => m.name.toLowerCase() === modelName.toLowerCase());

      if (!model) {
        console.error(`❌ Model '${modelName}' not found in Prisma schema.`);
        console.log('\n📋 Available models:');
        models.forEach((m) => console.log(`   - ${m.name}`));
        return;
      }

      console.log(`🚀 Generating features for model: ${model.name}`);
      console.log(
        `📊 Found model: ${model.name} with ${model.fields.length} fields and ${model.relations.length} relations`,
      );

      // Generate CRUD operations
      await this.generateCRUDOperations(model);

      console.log('\n✅ Prisma Client feature generation completed successfully!');
    } catch (error) {
      console.error('❌ Error generating model features:', error);
      throw error;
    }
  }

  /**
   * Generate CRUD operations for a model
   */
  private async generateCRUDOperations(model: PrismaModel): Promise<void> {
    const operations = [
      { type: 'command', name: `Create${model.name}` },
      { type: 'command', name: `Update${model.name}` },
      { type: 'command', name: `Delete${model.name}` },
      { type: 'query', name: `Get${model.name}ById` },
      { type: 'query', name: `GetAll${model.name}s` },
      { type: 'query', name: `Get${model.name}sByFilter` },
      { type: 'domain-event', name: `${model.name}Created` },
      { type: 'domain-event', name: `${model.name}Updated` },
      { type: 'domain-event', name: `${model.name}Deleted` },
    ];

    console.log(`📝 Generating CRUD operations for ${model.name}`);

    for (const operation of operations) {
      try {
        console.log(`🚀 Generating ${operation.type} for: ${operation.name}`);

        const feature = model.name.toLowerCase();
        const name = operation.name;

        await this.generator.generate({
          type: operation.type as 'command' | 'query' | 'domain-event',
          feature,
          name,
        });

        console.log('✅ Generation completed!');
      } catch (error) {
        console.error(`❌ Failed to generate ${operation.type} ${operation.name}:`, error);
      }
    }
  }

  /**
   * Build template context based on Prisma model
   */
  private buildTemplateContext(model: PrismaModel, operation: { type: string; name: string }): any {
    const regularFields = model.fields.filter(
      (f) =>
        !model.relations.some((r) => r.name === f.name) && !f.isId && f.name !== 'createdAt' && f.name !== 'updatedAt',
    );

    const requiredFields = regularFields.filter((f) => !f.isOptional && !f.hasDefaultValue);
    const optionalFields = regularFields.filter((f) => f.isOptional || f.hasDefaultValue);

    // Base context
    const context = {
      model: {
        name: model.name,
        primaryKey: model.primaryKey || 'id',
        fields: model.fields,
        regularFields,
        requiredFields,
        optionalFields,
        relations: model.relations,
      },
      operation,
    };

    // Add operation-specific context
    switch (operation.type) {
      case 'command':
        if (operation.name.startsWith('Create')) {
          context['createFields'] = requiredFields.concat(optionalFields);
        } else if (operation.name.startsWith('Update')) {
          context['updateFields'] = optionalFields.concat(requiredFields.map((f) => ({ ...f, isOptional: true })));
        }
        break;

      case 'query':
        if (operation.name.includes('Filter')) {
          context['filterFields'] = regularFields.filter((f) => ['string', 'number', 'Date'].includes(f.type));
        }
        break;
    }

    return context;
  }

  /**
   * Run the generator based on command line arguments
   */
  async run(): Promise<void> {
    const args = process.argv.slice(2);

    try {
      await this.initialize();

      if (args.includes('--list') || args.includes('-l')) {
        this.listModels();
      } else if (args.includes('--model') || args.includes('-m')) {
        const modelIndex = Math.max(args.indexOf('--model'), args.indexOf('-m'));
        const modelName = args[modelIndex + 1];

        if (!modelName) {
          console.error('❌ Please provide a model name: --model ModelName');
          return;
        }

        await this.generateModelFeatures(modelName);
      } else {
        console.log('🔧 Prisma Client Feature Generator');
        console.log('\nUsage:');
        console.log('  --list, -l           List all available models');
        console.log('  --model, -m <name>   Generate features for specific model');
        console.log('\nExamples:');
        console.log('  npm run gen:prisma-client -- --list');
        console.log('  npm run gen:prisma-client -- --model User');
        console.log('  npm run gen:prisma-client -- --model Bookmark');
      }
    } catch (error) {
      console.error('❌ Generator failed:', error);
      process.exit(1);
    } finally {
      await this.disconnect();
    }
  }
}

// Run if called directly
if (require.main === module) {
  const generator = new PrismaClientGenerator();
  generator.run().catch(console.error);
}

export { PrismaClientGenerator };
