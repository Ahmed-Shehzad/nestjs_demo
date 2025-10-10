# Code Generator Scripts

This project includes powerful code generation scripts to quickly scaffold CQRS components with proper structure and templates.

## Available Scripts

### Interactive Generator

```bash
npm run generate
# or
npm run generate:interactive
```

Launches an interactive CLI that prompts you for all required information.

### Direct Generation Scripts

#### Generate Query Components

```bash
npm run generate:query -- --name GetUserById --feature user-management
```

Generates:

- `src/features/user-management/queries/get-user-by-id.query.ts`
- `src/features/user-management/queries/get-user-by-id.dto.ts`
- `src/features/user-management/queries/get-user-by-id.validator.ts`
- `src/features/user-management/queries/get-user-by-id.handler.ts`

#### Generate Command Components

```bash
npm run generate:command -- --name CreateUser --feature user-management
```

Generates:

- `src/features/user-management/commands/create-user.command.ts`
- `src/features/user-management/commands/create-user.validator.ts`
- `src/features/user-management/commands/create-user.handler.ts`

#### Generate Domain Event Components

```bash
npm run generate:domain-event -- --name UserRegistered --feature user-management
```

Generates:

- `src/features/user-management/events/domain/user-registered.event.ts`
- `src/features/user-management/events/domain/user-registered.handler.ts`

## Parameters

### Required Parameters

- `--name`: Component name (PascalCase recommended, e.g., GetUserById, CreateUser)
- `--feature`: Feature name (kebab-case recommended, e.g., user-management, order-processing)

### Optional Parameters

- `--output-dir`: Custom output directory (overrides default feature-based structure)

## Examples

### User Management Feature

```bash
# Create a query to get user profile
npm run generate:query -- --name GetUserProfile --feature user-management

# Create a command to update user profile
npm run generate:command -- --name UpdateUserProfile --feature user-management

# Create a domain event for user registration
npm run generate:domain-event -- --name UserRegistered --feature user-management
```

### Order Processing Feature

```bash
# Create a query to get order details
npm run generate:query -- --name GetOrderDetails --feature order-processing

# Create a command to create an order
npm run generate:command -- --name CreateOrder --feature order-processing

# Create a domain event for order creation
npm run generate:domain-event -- --name OrderCreated --feature order-processing
```

## Generated File Structure

The generator creates files following this structure:

```
src/
└── features/
    └── {feature-name}/
        ├── queries/           # Query components
        │   ├── {name}.query.ts
        │   ├── {name}.dto.ts
        │   ├── {name}.validator.ts
        │   └── {name}.handler.ts
        ├── commands/          # Command components
        │   ├── {name}.command.ts
        │   ├── {name}.validator.ts
        │   └── {name}.handler.ts
        └── events/
            └── domain/        # Domain event components
                ├── {name}.event.ts
                └── {name}.handler.ts
```

## Template Features

### Query Templates

- **Query Class**: Request definition with validation attributes
- **DTO Class**: Response data transfer object
- **Validator**: Fluent validation rules
- **Handler**: Query processing logic with @RequestHandler decorator

### Command Templates

- **Command Class**: Command definition with validation attributes
- **Validator**: Fluent validation rules
- **Handler**: Command processing logic with @RequestHandler decorator

### Domain Event Templates

- **Event Class**: Domain event implementing INotification
- **Handler**: Event handler with @NotificationHandler decorator

## Token Replacement

All templates support these tokens that get automatically replaced:

- `{{NAME_PASCAL}}`: PascalCase version of the name
- `{{NAME_CAMEL}}`: camelCase version of the name
- `{{NAME_KEBAB}}`: kebab-case version of the name
- `{{FEATURE_PASCAL}}`: PascalCase version of the feature
- `{{FEATURE_CAMEL}}`: camelCase version of the feature
- `{{FEATURE_KEBAB}}`: kebab-case version of the feature
- `{{TIMESTAMP}}`: ISO timestamp of generation

## Quick Start

1. **Generate a complete feature set:**

```bash
# Create all components for user registration
npm run generate:command -- --name RegisterUser --feature user-management
npm run generate:domain-event -- --name UserRegistered --feature user-management
npm run generate:query -- --name GetUserRegistrationStatus --feature user-management
```

2. **Use the interactive generator for guided creation:**

```bash
npm run generate
```

3. **Customize templates** by editing files in `scripts/generators/templates/`

## Tips

- Use descriptive names that clearly indicate the operation (e.g., `GetUserById`, `CreateOrder`)
- Follow consistent naming conventions across your project
- Use kebab-case for feature names to maintain clean directory structure
- Review generated files and customize them to fit your specific requirements
- The generated code includes TODO comments to guide implementation
