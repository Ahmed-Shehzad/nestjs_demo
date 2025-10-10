# VS Code Debugging Setup for NestJS

This project is configured for debugging in VS Code with breakpoints and step-through debugging.

## 🚀 Quick Start Debugging

### Method 1: Using VS Code Debug Panel (Recommended)

1. Open VS Code in the project root
2. Open the Debug panel (Ctrl+Shift+D / Cmd+Shift+D)
3. Select "Debug NestJS Application" from the dropdown
4. Click the green play button or press F5
5. The application will start in debug mode

### Method 2: Using Command Palette

1. Press Ctrl+Shift+P (Cmd+Shift+P on Mac)
2. Type "Debug: Start Debugging"
3. Select "Debug NestJS Application"

## 🔍 Testing Breakpoints

### Controller Breakpoints

The `UsersController` has been enhanced with debug points:

- Set breakpoints on lines with 🔍 DEBUG comments
- Try the endpoint: `GET http://localhost:3000/api/users?page=1&limit=5`

### Mediator Pipeline Breakpoints

The `MediatorService` has debug points in the pipeline:

- Set breakpoints in `sendAsync()` method
- Watch the pipeline behaviors execute in order

### Suggested Breakpoint Locations

#### 1. Controller Entry Point

```typescript
// File: src/features/user/user.controller.ts
@Get()
async getAllUsers(@Query('page') page?: string, @Query('limit') limit?: string): Promise<GetAllUsersDto> {
  // 🔍 Set breakpoint here to test controller debugging
  console.log('🔍 [DEBUG] UsersController.getAllUsers called with params:', { page, limit });
  // ...
}
```

#### 2. Mediator Service

```typescript
// File: src/lib/mediator/services/mediator.service.ts
async sendAsync<TResponse>(request: IRequest<TResponse>): Promise<TResponse> {
  // 🔍 Set breakpoint here to test mediator debugging
  console.log('🔍 [DEBUG] MediatorService.sendAsync called for:', requestTypeName);
  // ...
}
```

#### 3. Pipeline Behaviors

```typescript
// File: src/lib/mediator/behaviors/validation.behavior.ts
async handleAsync(request: any, next: () => Promise<any>): Promise<any> {
  // 🔍 Set breakpoint here to test validation behavior
  console.log('[Validation] Processing request:', requestName);
  // ...
}
```

## 🛠️ Debug Configurations Available

### 1. Debug NestJS Application (Default)

- Starts the app with `--debug --watch`
- Auto-restarts on file changes
- Source maps enabled

### 2. Debug NestJS Application (No Watch)

- Starts the app with `--debug` only
- No auto-restart
- Good for stable debugging sessions

### 3. Attach to NestJS Process

- Attaches to an already running debug process
- Useful if you started the app manually with debug flags

### 4. Debug Tests

- Runs Jest tests with debugging enabled
- Set breakpoints in test files

## 🎯 Testing the Setup

1. **Set a breakpoint** in `src/features/user/user.controller.ts` on line with "🔍 DEBUG: Controller entry point"

2. **Start debugging** using F5 or the Debug panel

3. **Make a request** to test the breakpoint:

   ```bash
   curl "http://localhost:3000/api/users?page=1&limit=2"
   ```

4. **Verify debugging works**:
   - Execution should pause at your breakpoint
   - You can inspect variables in the Debug panel
   - Step through code using F10 (step over) or F11 (step into)
   - View call stack and local variables

## 🔧 Troubleshooting

### Breakpoints not hitting?

- Ensure TypeScript is compiled (`npm run build`)
- Check that source maps are enabled in tsconfig.json
- Verify the debug configuration is selected

### Debug port in use?

- Stop any running Node.js processes
- Try the "Attach to NestJS Process" configuration instead

### Source maps not working?

- Check that `"sourceMap": true` is in tsconfig.json
- Ensure the `outFiles` path in launch.json matches your dist folder

## 📝 Debug Features

- **Breakpoints**: Click in the gutter or press F9
- **Conditional breakpoints**: Right-click breakpoint → Edit Breakpoint
- **Logpoints**: Right-click in gutter → Add Logpoint
- **Step controls**: F10 (over), F11 (into), Shift+F11 (out)
- **Variable inspection**: Hover over variables or use Debug panel
- **Call stack**: View in Debug panel
- **Debug console**: Execute expressions during debugging

## 🚀 Advanced Debugging

### Debug with Database

The app connects to PostgreSQL. Ensure your database is running:

```bash
docker compose up dev-db -d
npm run prisma:dev:deploy
```

### Debug Pipeline Behaviors

Set breakpoints in behavior files to watch the CQRS pipeline:

- `src/lib/mediator/behaviors/logging.behavior.ts`
- `src/lib/mediator/behaviors/validation.behavior.ts`
- `src/lib/mediator/behaviors/telemetry.behavior.ts`

### Debug Request Handlers

Set breakpoints in handler files:

- `src/features/user/queries/get-all-users.handler.ts`

Happy debugging! 🐛🔍
