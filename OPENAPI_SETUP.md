# OpenAPI Integration Guide

## 🚀 Complete OpenAPI Setup

Your NestJS project is now configured with comprehensive OpenAPI client generation capabilities. Here's what's available and how to use it:

## 📦 What's Installed

- ✅ **@openapitools/openapi-generator-cli** - Multi-language client generator
- ✅ **OpenAPI 3.0 Specification** - Complete API documentation
- ✅ **Generation Scripts** - Automated client creation
- ✅ **Multiple Language Support** - TypeScript, Python, Java, C#

## 🎯 Available Commands

### Quick Commands

```bash
# Generate TypeScript client
npm run openapi:generate:client

# Generate Python client
npm run openapi:generate:python

# Generate all clients
npm run openapi:generate:all

# Validate specification
npm run openapi:validate

# Clean generated files
npm run openapi:clean
```

### Advanced Usage

```bash
# Use Node.js generator directly
node scripts/generate-clients.js typescript
node scripts/generate-clients.js python
node scripts/generate-clients.js all

# Use shell script (alternative)
./scripts/generate-clients.sh typescript
./scripts/generate-clients.sh all
```

## 📁 Project Structure

```
webapi/
├── docs/api/
│   ├── openapi.json          # OpenAPI 3.0 specification
│   └── README.md             # Detailed documentation
├── generated/                # Generated clients (gitignored)
│   ├── typescript-client/    # TypeScript/Axios client
│   ├── python-client/        # Python client
│   ├── java-client/          # Java client
│   └── csharp-client/        # C# client
├── scripts/
│   ├── generate-clients.js   # Node.js generator
│   └── generate-clients.sh   # Shell script generator
└── openapitools.json         # Generator configuration
```

## 🔧 Alternative Generation Methods

If the CLI approach has issues, here are alternative methods:

### Method 1: Docker-based Generation

```bash
# Pull the OpenAPI generator Docker image
docker pull openapitools/openapi-generator-cli:latest

# Generate TypeScript client
docker run --rm -v "${PWD}:/local" openapitools/openapi-generator-cli generate \
  -i /local/docs/api/openapi.json \
  -g typescript-axios \
  -o /local/generated/typescript-client \
  --additional-properties=supportsES6=true,npmName=webapi-client

# Generate Python client
docker run --rm -v "${PWD}:/local" openapitools/openapi-generator-cli generate \
  -i /local/docs/api/openapi.json \
  -g python \
  -o /local/generated/python-client \
  --additional-properties=packageName=webapi_client
```

### Method 2: Online Generator

1. Go to https://generator3.swagger.io/
2. Upload your `docs/api/openapi.json`
3. Select target language and options
4. Download generated client

### Method 3: Swagger Codegen

```bash
# Alternative tool: Swagger Codegen
npm install -g @apidevtools/swagger-cli

# Generate client
swagger-codegen generate -i docs/api/openapi.json -l typescript-axios -o generated/typescript-client
```

## 📋 Current API Endpoints

Your OpenAPI specification includes:

### Users API (`/v2/users`)

- `GET /v2/users` - Get paginated users with HATEOAS
- `POST /v2/users` - Create new user

### Bookmarks API (`/v2/bookmarks`)

- `GET /v2/bookmarks` - Get paginated bookmarks
- `GET /v2/bookmarks/{id}` - Get bookmark by ID

### Key Features

- **HATEOAS Links** - Hypermedia navigation
- **Pagination** - Page/limit parameters
- **Problem Details** - RFC 7807 error format
- **Type Safety** - Full schema definitions
- **Validation** - Request/response validation

## 🎨 Usage Examples

### TypeScript Client

```typescript
import { DefaultApi, Configuration } from './generated/typescript-client';

const config = new Configuration({
  basePath: 'http://localhost:3000/api',
});

const api = new DefaultApi(config);

// Get users
const users = await api.getAllUsers(1, 10);
console.log(users.data);

// Create user
const newUser = await api.createUser({
  email: 'test@example.com',
  firstName: 'Test',
  password: 'password123',
});
```

### Python Client

```python
import webapi_client

configuration = webapi_client.Configuration(
    host = "http://localhost:3000/api"
)

with webapi_client.ApiClient(configuration) as api_client:
    api = webapi_client.DefaultApi(api_client)

    # Get users
    users = api.get_all_users(page=1, limit=10)
    print(users)

    # Create user
    user_data = webapi_client.CreateUserRequest(
        email="test@example.com",
        password="password123"
    )
    new_user = api.create_user(user_data)
```

## 🔄 Development Workflow

1. **Update API** - Modify your NestJS controllers
2. **Update Spec** - Edit `docs/api/openapi.json`
3. **Validate** - Run `npm run openapi:validate`
4. **Generate** - Run `npm run openapi:generate:all`
5. **Integrate** - Use generated clients in applications

## 🛠️ Customization

### Adding New Endpoints

Edit `docs/api/openapi.json`:

```json
{
  "paths": {
    "/v2/new-endpoint": {
      "get": {
        "tags": ["NewFeature"],
        "summary": "Description",
        "operationId": "newOperation",
        "responses": {
          "200": {
            "description": "Success",
            "content": {
              "application/json": {
                "schema": { "$ref": "#/components/schemas/NewResponse" }
              }
            }
          }
        }
      }
    }
  }
}
```

### Generator Configuration

Modify `openapitools.json` for custom settings:

```json
{
  "generator-cli": {
    "generators": {
      "typescript-axios": {
        "additionalProperties": {
          "npmName": "my-custom-client",
          "modelPropertyNaming": "camelCase",
          "supportsES6": true
        }
      }
    }
  }
}
```

## 🏗️ Integration Examples

### React/Next.js Integration

```typescript
// hooks/useApi.ts
import { DefaultApi, Configuration } from '../generated/typescript-client';

const useApi = () => {
  const config = new Configuration({
    basePath: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000/api'
  });

  return new DefaultApi(config);
};

// components/UserList.tsx
const UserList = () => {
  const api = useApi();
  const [users, setUsers] = useState([]);

  useEffect(() => {
    api.getAllUsers(1, 10)
      .then(response => setUsers(response.data))
      .catch(console.error);
  }, []);

  return <div>{/* Render users */}</div>;
};
```

### Node.js Backend Integration

```typescript
// services/apiClient.ts
import { DefaultApi, Configuration } from '../generated/typescript-client';

export class ApiClient {
  private api: DefaultApi;

  constructor(baseUrl: string) {
    const config = new Configuration({ basePath: baseUrl });
    this.api = new DefaultApi(config);
  }

  async getUsers(page = 1, limit = 10) {
    return this.api.getAllUsers(page, limit);
  }

  async createUser(userData: CreateUserRequest) {
    return this.api.createUser(userData);
  }
}
```

## 🧪 Testing Generated Clients

```typescript
// test/api-client.test.ts
import { ApiClient } from '../services/apiClient';

describe('API Client', () => {
  const client = new ApiClient('http://localhost:3000/api');

  test('should fetch users', async () => {
    const users = await client.getUsers(1, 5);
    expect(users.data).toBeDefined();
    expect(Array.isArray(users.data)).toBe(true);
  });

  test('should create user', async () => {
    const userData = {
      email: 'test@example.com',
      password: 'password123',
    };

    const result = await client.createUser(userData);
    expect(result.data).toBeDefined();
    expect(typeof result.data).toBe('number'); // User ID
  });
});
```

## 🔍 Troubleshooting

### Common Issues

1. **Generation Fails Silently**
   - Try Docker method: `docker run --rm -v "${PWD}:/local" openapitools/openapi-generator-cli`
   - Use online generator: https://generator3.swagger.io/

2. **Invalid Specification**
   - Validate at: https://editor.swagger.io/
   - Run: `npm run openapi:validate`

3. **Missing Dependencies**
   - Install in generated client: `cd generated/typescript-client && npm install`
   - Check requirements in generated README files

### Debug Commands

```bash
# Check generator version
npx @openapitools/openapi-generator-cli version

# List available generators
npx @openapitools/openapi-generator-cli list

# Generate with debug output
CONSOLE_NINJA_DISABLE=true npx @openapitools/openapi-generator-cli generate \
  -i docs/api/openapi.json -g typescript-axios -o test-output --verbose
```

## 📚 Resources

- [OpenAPI Generator Documentation](https://openapi-generator.tech/)
- [OpenAPI 3.0 Specification](https://swagger.io/specification/)
- [TypeScript Axios Generator](https://openapi-generator.tech/docs/generators/typescript-axios/)
- [Swagger Editor](https://editor.swagger.io/)
- [API Design Best Practices](https://swagger.io/resources/articles/best-practices-in-api-design/)

---

Your OpenAPI setup is now complete and ready for production use! 🎉
