#!/usr/bin/env node

/**
 * Generator Help Script
 *
 * Shows available generators and usage examples
 */

console.log(`
🎯 NestJS Code Generator - Available Scripts

📋 INTERACTIVE GENERATOR
  npm run generate                     # Interactive CLI with prompts
  npm run generate:interactive         # Same as above
  npm run gen                          # Shorthand for this help

🚀 DIRECT GENERATION SCRIPTS

📊 QUERY COMPONENTS
  npm run generate:query -- --name GetUserById --feature user-management
  npm run gen:q -- --name GetUserById --feature user-management  # Shorthand

  Generates:
  ├── get-user-by-id.query.ts         # Query class with validation
  ├── get-user-by-id.dto.ts           # Response DTO
  ├── get-user-by-id.validator.ts     # Fluent validation rules
  └── get-user-by-id.handler.ts       # Query handler with @RequestHandler

⚡ COMMAND COMPONENTS
  npm run generate:command -- --name CreateUser --feature user-management
  npm run gen:c -- --name CreateUser --feature user-management     # Shorthand

  Generates:
  ├── create-user.command.ts          # Command class with validation
  ├── create-user.validator.ts        # Fluent validation rules
  └── create-user.handler.ts          # Command handler with @RequestHandler

📡 DOMAIN EVENT COMPONENTS
  npm run generate:domain-event -- --name UserRegistered --feature user-management
  npm run gen:de -- --name UserRegistered --feature user-management   # Shorthand

  Generates:
  ├── user-registered.event.ts        # Domain event implementing INotification
  └── user-registered.handler.ts      # Event handler with @NotificationHandler

📝 USAGE EXAMPLES

# Complete feature set
npm run generate:command -- --name RegisterUser --feature auth
npm run generate:domain-event -- --name UserRegistered --feature auth
npm run generate:query -- --name GetRegistrationStatus --feature auth

# E-commerce flow
npm run generate:command -- --name CreateOrder --feature orders
npm run generate:domain-event -- --name OrderCreated --feature orders
npm run generate:query -- --name GetOrderDetails --feature orders

# User management
npm run generate:query -- --name GetUserProfile --feature users
npm run generate:command -- --name UpdateUserProfile --feature users
npm run generate:domain-event -- --name ProfileUpdated --feature users

🔧 PARAMETERS
  --name       Component name (PascalCase: GetUserById, CreateOrder)
  --feature    Feature name (kebab-case: user-management, order-processing)
  --output-dir Optional custom output directory

💡 TIPS
  • Use descriptive names: GetUserById, not GetUser
  • Feature names in kebab-case: user-management, not userManagement
  • All generated files include TODO comments for guidance
  • Review and customize generated code to fit your needs

📁 OUTPUT STRUCTURE
  src/features/{feature}/
  ├── queries/           # GET operations
  ├── commands/          # POST/PUT/DELETE operations
  └── events/
      └── domain/        # Internal business events

📚 For detailed documentation, see: docs/CODE_GENERATION.md
`);
