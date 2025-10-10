# Database Connection Pool Optimization Guide

## Issue Identified

The application was creating **29 database connections** on startup, which is excessive for a development environment and can lead to:

- Connection pool exhaustion
- Increased memory usage
- Poor performance
- Potential connection limit violations

## Solutions Implemented

### 1. Connection Pool Configuration in DATABASE_URL

**Before:**

```
DATABASE_URL="postgresql://postgres:123@localhost:5434/nest?schema=public"
```

**After:**

```
DATABASE_URL="postgresql://postgres:123@localhost:5434/nest?schema=public&connection_limit=5&pool_timeout=20&connect_timeout=60"
```

**Parameters Explained:**

- `connection_limit=5`: Maximum 5 connections for development (3 for test)
- `pool_timeout=20`: Wait max 20 seconds for an available connection
- `connect_timeout=60`: Connection establishment timeout of 60 seconds

### 2. Optimized PrismaService Implementation

Created `src/core/prisma.service.ts` with:

- **Singleton Pattern**: Prevents multiple PrismaClient instances
- **Proper Lifecycle Management**: Connect on module init, disconnect on destroy
- **Optimized Logging**: Reduced log verbosity for better performance
- **Health Check Methods**: Monitor database connectivity

### 3. Updated Core Module

Modified `src/core/core.module.ts` to:

- Use the new `PrismaService` instead of factory pattern
- Maintain backward compatibility with `PrismaClient` injection
- Ensure singleton instance across the application

## Connection Pool Limits by Environment

| Environment | Max Connections | Reasoning                              |
| ----------- | --------------- | -------------------------------------- |
| Development | 5               | Low concurrent usage, debugging needs  |
| Test        | 3               | Minimal connections for test isolation |
| Production  | 10-20           | Higher throughput, can be configured   |

## PostgreSQL Connection Limits

**Default PostgreSQL Settings:**

- `max_connections = 100` (default)
- Recommended app pool size: 20-30% of max_connections
- Leave headroom for admin connections and monitoring

## Monitoring Connection Usage

### Check Current Connections

```sql
SELECT
  count(*) as total_connections,
  count(*) FILTER (WHERE state = 'active') as active,
  count(*) FILTER (WHERE state = 'idle') as idle
FROM pg_stat_activity
WHERE datname = current_database();
```

### Check Connection Pool Status

The `PrismaService` provides a `healthCheck()` method for monitoring.

## Best Practices Applied

1. **Single PrismaClient Instance**: Prevents connection multiplication
2. **Connection Pool Limits**: Explicit limits in connection string
3. **Proper Lifecycle Management**: Connect/disconnect with application lifecycle
4. **Error Handling**: Graceful handling of connection failures
5. **Monitoring**: Health check methods for observability

## Expected Results

- **Before**: ~29 connections on startup
- **After**: ≤5 connections maximum
- **Benefits**:
  - Reduced memory footprint
  - Better connection management
  - Improved application startup time
  - Prevention of connection exhaustion

## Testing the Optimization

1. Start the application: `npm run start:dev`
2. Check the logs for: `"Successfully connected to PostgreSQL database with optimized connection pool"`
3. Monitor PostgreSQL connections using the SQL query above
4. Verify connection count stays within configured limits

## Environment Variables

Create or update your `.env` files:

```bash
# Development (.env)
DATABASE_URL="postgresql://postgres:123@localhost:5434/nest?schema=public&connection_limit=5&pool_timeout=20&connect_timeout=60"

# Test (.env.test)
DATABASE_URL="postgresql://postgres:123@localhost:5435/nest?schema=public&connection_limit=3&pool_timeout=20&connect_timeout=60"
```

## Troubleshooting

### If connections still exceed limits:

1. Check for multiple PrismaClient instantiations
2. Verify singleton pattern is working
3. Check for connection leaks (unclosed connections)
4. Review PostgreSQL logs for connection patterns

### If connection errors occur:

1. Increase `pool_timeout` or `connection_limit`
2. Check PostgreSQL `max_connections` setting
3. Monitor connection usage patterns
4. Consider implementing connection retry logic

This optimization ensures efficient database connection management while maintaining application performance and reliability.
