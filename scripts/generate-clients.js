#!/usr/bin/env node

/**
 * OpenAPI Client Generator
 * Alternative to CLI-based generation using Node.js API
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// Configuration
const CONFIG = {
  spec: 'docs/api/openapi.json',
  outputDir: 'generated',
  generators: {
    typescript: {
      name: 'typescript-axios',
      output: 'typescript-client',
      properties: {
        supportsES6: true,
        npmName: 'webapi-client',
        npmVersion: '1.0.0',
        modelPropertyNaming: 'camelCase',
        withInterfaces: true,
      },
    },
    python: {
      name: 'python',
      output: 'python-client',
      properties: {
        packageName: 'webapi_client',
        projectName: 'webapi-client',
        packageVersion: '1.0.0',
      },
    },
    java: {
      name: 'java',
      output: 'java-client',
      properties: {
        groupId: 'com.example',
        artifactId: 'webapi-client',
        library: 'okhttp-gson',
        java8: true,
      },
    },
    csharp: {
      name: 'csharp',
      output: 'csharp-client',
      properties: {
        packageName: 'WebApi.Client',
        targetFramework: 'net6.0',
        library: 'httpclient',
      },
    },
  },
};

// Utility functions
const log = {
  info: (msg) => console.log(`ℹ️  ${msg}`),
  success: (msg) => console.log(`✅ ${msg}`),
  error: (msg) => console.log(`❌ ${msg}`),
  warning: (msg) => console.log(`⚠️  ${msg}`),
};

// Validate OpenAPI spec
function validateSpec() {
  log.info('Validating OpenAPI specification...');

  if (!fs.existsSync(CONFIG.spec)) {
    log.error(`OpenAPI spec not found: ${CONFIG.spec}`);
    process.exit(1);
  }

  try {
    const spec = JSON.parse(fs.readFileSync(CONFIG.spec, 'utf8'));
    if (!spec.openapi || !spec.info || !spec.paths) {
      throw new Error('Invalid OpenAPI structure');
    }
    log.success('OpenAPI specification is valid');
    return true;
  } catch (error) {
    log.error(`OpenAPI validation failed: ${error.message}`);
    process.exit(1);
  }
}

// Generate client using OpenAPI generator
function generateClient(generatorType) {
  const config = CONFIG.generators[generatorType];
  if (!config) {
    log.error(`Unknown generator type: ${generatorType}`);
    return false;
  }

  log.info(`Generating ${generatorType} client...`);

  try {
    // Create output directory
    const outputPath = path.join(CONFIG.outputDir, config.output);
    if (fs.existsSync(outputPath)) {
      fs.rmSync(outputPath, { recursive: true, force: true });
    }
    fs.mkdirSync(outputPath, { recursive: true });

    // Build command
    const properties = Object.entries(config.properties)
      .map(([key, value]) => `${key}=${value}`)
      .join(',');

    const command = [
      'npx @openapitools/openapi-generator-cli generate',
      `-i ${CONFIG.spec}`,
      `-g ${config.name}`,
      `-o ${outputPath}`,
      `--additional-properties=${properties}`,
      '--skip-validate-spec',
    ].join(' ');

    // Execute with environment variable to disable console ninja
    const env = { ...process.env, CONSOLE_NINJA_DISABLE: 'true' };
    execSync(command, {
      env,
      stdio: 'pipe', // Capture output
      cwd: process.cwd(),
    });

    // Check if files were generated
    const generatedFiles = fs.readdirSync(outputPath);
    if (generatedFiles.length > 0) {
      log.success(`${generatorType} client generated successfully`);
      log.info(`  📁 Location: ${outputPath}`);
      log.info(`  📄 Files: ${generatedFiles.length}`);
      return true;
    } else {
      log.error(`${generatorType} client generation failed - no files created`);
      return false;
    }
  } catch (error) {
    log.error(`${generatorType} client generation failed: ${error.message}`);
    return false;
  }
}

// Clean generated files
function cleanGenerated() {
  log.info('Cleaning previous generations...');
  if (fs.existsSync(CONFIG.outputDir)) {
    fs.rmSync(CONFIG.outputDir, { recursive: true, force: true });
  }
  fs.mkdirSync(CONFIG.outputDir, { recursive: true });
  log.success('Previous generations cleaned');
}

// Create usage examples
function createExamples(generatorType) {
  const exampleDir = path.join(CONFIG.outputDir, generatorType + '-client', 'examples');

  if (!fs.existsSync(exampleDir)) {
    fs.mkdirSync(exampleDir, { recursive: true });
  }

  let exampleContent = '';

  switch (generatorType) {
    case 'typescript':
      exampleContent = `// TypeScript/Axios Client Example
import { DefaultApi, Configuration } from '../';

// Configure API client
const config = new Configuration({
  basePath: 'http://localhost:3000/api'
});

const api = new DefaultApi(config);

// Example: Get all users
async function getAllUsers() {
  try {
    const response = await api.getAllUsers(1, 10);
    console.log('Users:', response.data);
    return response.data;
  } catch (error) {
    console.error('Error fetching users:', error);
  }
}

// Example: Create a user
async function createUser() {
  try {
    const response = await api.createUser({
      email: 'test@example.com',
      firstName: 'Test',
      lastName: 'User',
      password: 'password123'
    });
    console.log('Created user ID:', response.data);
    return response.data;
  } catch (error) {
    console.error('Error creating user:', error);
  }
}

export { getAllUsers, createUser };
`;
      break;

    case 'python':
      exampleContent = `# Python Client Example
import webapi_client
from webapi_client.rest import ApiException

# Configure API client
configuration = webapi_client.Configuration(
    host = "http://localhost:3000/api"
)

# Example: Get all users
def get_all_users():
    with webapi_client.ApiClient(configuration) as api_client:
        api_instance = webapi_client.DefaultApi(api_client)

        try:
            api_response = api_instance.get_all_users(page=1, limit=10)
            print("Users:", api_response)
            return api_response
        except ApiException as e:
            print("Exception when calling DefaultApi->get_all_users: %s\\n" % e)

# Example: Create a user
def create_user():
    with webapi_client.ApiClient(configuration) as api_client:
        api_instance = webapi_client.DefaultApi(api_client)

        create_user_request = webapi_client.CreateUserRequest(
            email="test@example.com",
            first_name="Test",
            last_name="User",
            password="password123"
        )

        try:
            api_response = api_instance.create_user(create_user_request)
            print("Created user ID:", api_response)
            return api_response
        except ApiException as e:
            print("Exception when calling DefaultApi->create_user: %s\\n" % e)

if __name__ == "__main__":
    get_all_users()
    create_user()
`;
      break;
  }

  if (exampleContent) {
    const extension = generatorType === 'typescript' ? '.ts' : '.py';
    fs.writeFileSync(path.join(exampleDir, `example${extension}`), exampleContent);
  }
}

// Main function
function main() {
  const args = process.argv.slice(2);
  const command = args[0] || 'help';

  console.log('🚀 OpenAPI Client Generator (Node.js)');
  console.log('====================================\\n');

  switch (command) {
    case 'typescript':
    case 'ts':
      validateSpec();
      if (generateClient('typescript')) {
        createExamples('typescript');
      }
      break;

    case 'python':
    case 'py':
      validateSpec();
      if (generateClient('python')) {
        createExamples('python');
      }
      break;

    case 'java':
      validateSpec();
      generateClient('java');
      break;

    case 'csharp':
    case 'cs':
      validateSpec();
      generateClient('csharp');
      break;

    case 'all':
      validateSpec();
      cleanGenerated();
      const types = ['typescript', 'python', 'java', 'csharp'];
      let successCount = 0;

      types.forEach((type) => {
        if (generateClient(type)) {
          successCount++;
          if (type === 'typescript' || type === 'python') {
            createExamples(type);
          }
        }
      });

      console.log(`\\n📋 Summary: ${successCount}/${types.length} clients generated successfully`);
      break;

    case 'clean':
      cleanGenerated();
      break;

    case 'validate':
      validateSpec();
      break;

    case 'help':
    default:
      console.log('Usage: node scripts/generate-clients.js [command]');
      console.log('');
      console.log('Commands:');
      console.log('  typescript, ts    Generate TypeScript client');
      console.log('  python, py        Generate Python client');
      console.log('  java             Generate Java client');
      console.log('  csharp, cs       Generate C# client');
      console.log('  all              Generate all clients');
      console.log('  clean            Clean generated files');
      console.log('  validate         Validate OpenAPI spec');
      console.log('  help             Show this help');
      break;
  }
}

// Handle errors
process.on('uncaughtException', (error) => {
  log.error(`Uncaught exception: ${error.message}`);
  process.exit(1);
});

process.on('unhandledRejection', (reason, promise) => {
  log.error(`Unhandled rejection at ${promise}: ${reason}`);
  process.exit(1);
});

// Run if called directly
if (require.main === module) {
  main();
}

module.exports = { validateSpec, generateClient, cleanGenerated, CONFIG };
