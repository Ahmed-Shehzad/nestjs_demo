# Get All Users API with HATEOAS Pagination

## Overview

The `GET /api/users` endpoint returns a paginated list of users with HATEOAS (Hypermedia as the Engine of Application State) links for navigation and actions.

## Features

- **Prisma Client Integration**: Direct database access with optimized queries
- **Pagination**: Configurable page size with reasonable limits
- **HATEOAS Links**: Navigation and action links following REST principles
- **Security**: Excludes sensitive data (passwords) from responses
- **Performance**: Parallel queries for data and count, optimized field selection

## API Endpoint

```
GET /api/users?page=1&limit=10
```

### Query Parameters

| Parameter | Type   | Default | Min | Max  | Description              |
| --------- | ------ | ------- | --- | ---- | ------------------------ |
| page      | number | 1       | 1   | 1000 | Page number to retrieve  |
| limit     | number | 10      | 1   | 100  | Number of items per page |

## Response Structure

```json
{
  "data": [
    {
      "id": 1,
      "email": "john@example.com",
      "firstName": "John",
      "lastName": "Doe",
      "createdAt": "2025-10-10T12:00:00.000Z",
      "updatedAt": "2025-10-10T12:00:00.000Z",
      "bookmarksCount": 5
    }
  ],
  "meta": {
    "currentPage": 1,
    "totalPages": 10,
    "totalItems": 95,
    "itemsPerPage": 10,
    "hasNextPage": true,
    "hasPreviousPage": false
  },
  "links": [
    {
      "href": "/api/users?page=1&limit=10",
      "method": "GET",
      "rel": "self"
    },
    {
      "href": "/api/users?page=2&limit=10",
      "method": "GET",
      "rel": "next"
    },
    {
      "href": "/api/users?page=10&limit=10",
      "method": "GET",
      "rel": "last"
    },
    {
      "href": "/api/users/1",
      "method": "GET",
      "rel": "user"
    },
    {
      "href": "/api/users",
      "method": "POST",
      "rel": "create"
    }
  ]
}
```

## Implementation Details

### Database Optimization

- **Parallel Queries**: User data and count fetched simultaneously
- **Field Selection**: Only necessary fields retrieved (excludes `hash`)
- **Computed Fields**: Bookmark count added via `_count`
- **Ordering**: Consistent sorting by `createdAt DESC, id DESC`

### HATEOAS Links

The API includes comprehensive navigation links:

- **self**: Current page link
- **first**: First page (when not on page 1)
- **prev**: Previous page (when available)
- **next**: Next page (when available)
- **last**: Last page (when not on last page)
- **user**: Individual user resource links
- **create**: Link to create new user

### Security Features

- Password hash field excluded from all responses
- Input validation with reasonable limits
- SQL injection protection via Prisma ORM

### Error Handling

- Graceful degradation on database errors
- Input validation with detailed error messages
- Pagination boundary checks

## Usage Examples

### Get first page (default)

```bash
curl "http://localhost:3000/api/users"
```

### Get specific page with custom limit

```bash
curl "http://localhost:3000/api/users?page=2&limit=5"
```

### Navigate using HATEOAS links

```bash
# Use the "next" link from the previous response
curl "http://localhost:3000/api/users?page=3&limit=5"
```

## Architecture Benefits

1. **Maintainable**: Clean separation of concerns with CQRS pattern
2. **Testable**: Handler can be easily unit tested
3. **Scalable**: Efficient database queries with pagination
4. **Discoverable**: HATEOAS links provide API navigation
5. **Type Safe**: Full TypeScript support with Prisma types
