# Reusable HATEOAS API Response Structure

This document explains how to use the new reusable HATEOAS API response structure that was created to make pagination and hypermedia links independent from specific query requests.

## Overview

The new system consists of several components:

1. **`PaginatedResponse<T>`** - Generic paginated response class
2. **`HateoasLinkBuilder`** - Service for building hypermedia links
3. **`PaginationUtils`** - Utility functions for pagination
4. **Type interfaces** - TypeScript interfaces for configuration

## Quick Start

### 1. Basic Usage

```typescript
import { PaginatedResponse } from '@/hateoas';

// In your handler
const response = new PaginatedResponse(
  data,
  totalItems,
  { currentPage: 1, itemsPerPage: 10, totalItems },
  { baseUrl: '/api/users' },
);
```

### 2. Using Utility Functions

```typescript
import { PaginationUtils } from '@/hateoas';

// Simple creation
const response = PaginationUtils.createSimple(users, totalCount, page, limit, '/api/users');

// Validate pagination parameters
const { page, limit } = PaginationUtils.validatePaginationParams(pageParam, limitParam);
```

### 3. Extending for Custom DTOs

```typescript
export class GetAllUsersDto extends PaginatedResponse<UserResponse> {
  constructor(users: UserResponse[], totalItems: number, currentPage: number, itemsPerPage: number, baseUrl: string) {
    super(
      users,
      totalItems,
      { currentPage, itemsPerPage, totalItems },
      {
        baseUrl,
        includeResourceLinks: true,
        includeCreateLink: true,
        resourceIdSelector: (user: UserResponse) => user.id,
      },
    );
  }
}
```

## Configuration Options

### HateoasLinkConfig

```typescript
interface HateoasLinkConfig {
  baseUrl: string; // Base URL for the resource
  includeResourceLinks?: boolean; // Include individual item links
  includeCreateLink?: boolean; // Include create new item link
  customLinks?: HateoasLink[]; // Additional custom links
  resourceIdSelector?: (item: any) => string | number; // How to get item ID
}
```

### Custom Links Example

```typescript
const config: HateoasLinkConfig = {
  baseUrl: '/api/bookmarks',
  customLinks: [
    {
      href: '/api/bookmarks/export',
      method: 'GET',
      rel: 'export',
      title: 'Export bookmarks',
    },
  ],
};
```

## Migration Guide

### Before (Old GetAllUsersDto)

```typescript
export class GetAllUsersDto {
  public readonly data: UserResponse[];
  public readonly meta: PaginationMeta;
  public readonly links: HateoasLink[];

  constructor(users: UserResponse[], totalItems: number, currentPage: number, itemsPerPage: number, baseUrl: string) {
    // ... 100+ lines of custom pagination and HATEOAS logic
  }
}
```

### After (New GetAllUsersDto)

```typescript
export class GetAllUsersDto extends PaginatedResponse<UserResponse> {
  constructor(users: UserResponse[], totalItems: number, currentPage: number, itemsPerPage: number, baseUrl: string) {
    super(
      users,
      totalItems,
      { currentPage, itemsPerPage, totalItems },
      {
        baseUrl,
        resourceIdSelector: (user: UserResponse) => user.id,
      },
    );
  }
}
```

## Benefits

1. **Consistency** - All paginated APIs have the same structure
2. **Reusability** - No need to rewrite pagination logic for each feature
3. **Maintainability** - Single place to update pagination behavior
4. **Flexibility** - Easy to customize links and behavior per feature
5. **Type Safety** - Full TypeScript support with generics

## Available Methods

### PaginatedResponse Methods

- `getPaginationLinks()` - Get only pagination links
- `getResourceLinks()` - Get only resource-specific links
- `hasData()` - Check if there are any results
- `getTotalPages()` - Get total number of pages
- `isFirstPage()` - Check if this is the first page
- `isLastPage()` - Check if this is the last page

### PaginationUtils Methods

- `createSimple()` - Create response with minimal config
- `createWithConfig()` - Create response with custom config
- `validatePaginationParams()` - Validate and sanitize page/limit
- `calculateOffset()` - Calculate database offset
- `calculateTotalPages()` - Calculate total pages

## File Structure

```
src/lib/hateoas/
├── types/
│   └── hateoas.types.ts       # Type definitions
├── services/
│   └── hateoas-link-builder.service.ts  # Link building logic
├── responses/
│   └── paginated.response.ts  # Main response class
├── utils/
│   └── pagination.utils.ts    # Utility functions
└── index.ts                   # Main exports
```

## Next Steps

1. Update existing DTOs to extend `PaginatedResponse`
2. Use `PaginationUtils` in handlers for parameter validation
3. Customize HATEOAS links based on feature requirements
4. Consider adding new utility methods as needed
