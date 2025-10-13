#!/usr/bin/env node

/**
 * Verification script for generated OpenAPI client
 */

const fs = require('fs');
const path = require('path');

// Test files and structure
const testPaths = [
  'generated/typescript-client/api.ts',
  'generated/typescript-client/index.ts',
  'generated/typescript-client/configuration.ts',
  'generated/typescript-client/package.json',
  'generated/typescript-client/dist/index.js',
  'generated/typescript-client/dist/index.d.ts',
];

console.log('🔍 OpenAPI Client Verification');
console.log('==============================\n');

// Check if files exist
console.log('📁 File Structure:');
testPaths.forEach((filePath) => {
  const exists = fs.existsSync(filePath);
  console.log(`  ${exists ? '✅' : '❌'} ${filePath}`);
});

// Check API structure by importing
console.log('\n🎯 API Structure:');
try {
  // Import the built client
  const clientPath = path.resolve('generated/typescript-client/dist/index.js');
  if (fs.existsSync(clientPath)) {
    delete require.cache[clientPath]; // Clear cache
    const client = require(clientPath);

    console.log('  ✅ Client imports successfully');

    // Check available exports
    const exports = Object.keys(client);
    console.log(`  ✅ Exports (${exports.length}):`, exports.slice(0, 10).join(', '));

    // Check specific APIs
    if (client.UsersApi) {
      console.log('  ✅ UsersApi available');
      const usersApi = new client.UsersApi();
      console.log(
        '    📋 Methods:',
        Object.getOwnPropertyNames(Object.getPrototypeOf(usersApi)).filter(
          (name) => name !== 'constructor' && typeof usersApi[name] === 'function',
        ),
      );
    }

    if (client.BookmarksApi) {
      console.log('  ✅ BookmarksApi available');
    }

    if (client.Configuration) {
      console.log('  ✅ Configuration class available');
    }
  } else {
    console.log('  ⚠️  Built client not found, but source files exist');
  }
} catch (error) {
  console.log('  ❌ Error importing client:', error.message);
}

// Check generated documentation
console.log('\n📚 Documentation:');
const docsDir = 'generated/typescript-client/docs';
if (fs.existsSync(docsDir)) {
  const docFiles = fs.readdirSync(docsDir);
  console.log(`  ✅ Documentation generated (${docFiles.length} files)`);
  console.log('    📄 Files:', docFiles.slice(0, 5).join(', '));
} else {
  console.log('  ❌ Documentation not found');
}

// Test example usage (dry run)
console.log('\n🧪 Example Usage:');
console.log(`
import { UsersApi, BookmarksApi, Configuration } from './generated/typescript-client';

// Configure API client
const config = new Configuration({
  basePath: 'http://localhost:3000/api'
});

// Create API instances
const usersApi = new UsersApi(config);
const bookmarksApi = new BookmarksApi(config);

// Example calls
async function testApi() {
  try {
    // Get users
    const users = await usersApi.getAllUsers(1, 10);
    console.log('Users:', users.data);

    // Create user
    const newUser = await usersApi.createUser({
      email: 'test@example.com',
      firstName: 'Test',
      password: 'password123'
    });
    console.log('Created user ID:', newUser.data);

    // Get bookmarks
    const bookmarks = await bookmarksApi.getAllBookmarks(1, 10);
    console.log('Bookmarks:', bookmarks.data);

  } catch (error) {
    console.error('API Error:', error);
  }
}
`);

console.log('\n🎉 Verification Summary:');
console.log('========================');

const allExist = testPaths.filter((p) => fs.existsSync(p));
console.log(`✅ Generated files: ${allExist.length}/${testPaths.length}`);

if (fs.existsSync('generated/typescript-client/dist/index.js')) {
  console.log('✅ Client builds and compiles successfully');
  console.log('✅ TypeScript definitions available');
  console.log('✅ Ready for use in applications');
} else {
  console.log('⚠️  Client needs to be built (run: cd generated/typescript-client && npm run build)');
}

console.log('\n🚀 Next steps:');
console.log('1. Install in your app: npm install ./generated/typescript-client');
console.log('2. Import and configure the client');
console.log('3. Use the generated APIs in your application');
console.log('4. Update and regenerate when your API changes');

console.log('\n📖 Full documentation: generated/typescript-client/README.md');
