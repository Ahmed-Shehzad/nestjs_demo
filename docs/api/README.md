# OpenAPI Client Generation

This project includes OpenAPI client generation using the OpenAPI Generator CLI tool.

## Available Scripts

### Validation

- `npm run openapi:validate` - Validate the OpenAPI specification
- `npm run openapi:help` - Show OpenAPI generator help

### Client Generation

- `npm run openapi:generate:client` - Generate TypeScript/Axios client
- `npm run openapi:generate:python` - Generate Python client
- `npm run openapi:generate:java` - Generate Java client
- `npm run openapi:generate:csharp` - Generate C# client
- `npm run openapi:generate:all` - Generate all clients

## Generated Clients

All generated clients are placed in the `generated/` directory:

```
generated/
├── client/           # TypeScript/Axios client
├── python-client/    # Python client
├── java-client/      # Java client
└── csharp-client/    # C# client
```

## Configuration

- **OpenAPI Spec**: `docs/api/openapi.json`
- **Generator Config**: `openapitools.json`
- **Generator Version**: 7.10.0

## Usage Examples

### TypeScript/Axios Client

```typescript
import { DefaultApi, Configuration } from './generated/client';

const config = new Configuration({
  basePath: 'http://localhost:3000/api',
});

const api = new DefaultApi(config);

// Get all users
const users = await api.getAllUsers(1, 10);
console.log(users.data);

// Create a user
const newUser = await api.createUser({
  email: 'test@example.com',
  firstName: 'Test',
  lastName: 'User',
  password: 'password123',
});
```

### Python Client

```python
import webapi_client
from webapi_client.rest import ApiException

# Configure API client
configuration = webapi_client.Configuration(
    host = "http://localhost:3000/api"
)

# Create API instance
with webapi_client.ApiClient(configuration) as api_client:
    api_instance = webapi_client.DefaultApi(api_client)

    try:
        # Get all users
        api_response = api_instance.get_all_users(page=1, limit=10)
        print(api_response)
    except ApiException as e:
        print("Exception when calling DefaultApi->get_all_users: %s\n" % e)
```

### Java Client

```java
import com.example.webapi.client.ApiClient;
import com.example.webapi.client.ApiException;
import com.example.webapi.api.DefaultApi;
import com.example.webapi.model.*;

public class Example {
    public static void main(String[] args) {
        ApiClient defaultClient = new ApiClient();
        defaultClient.setBasePath("http://localhost:3000/api");

        DefaultApi apiInstance = new DefaultApi(defaultClient);
        Integer page = 1;
        Integer limit = 10;

        try {
            GetAllUsersResponse result = apiInstance.getAllUsers(page, limit);
            System.out.println(result);
        } catch (ApiException e) {
            System.err.println("Exception when calling DefaultApi#getAllUsers");
            e.printStackTrace();
        }
    }
}
```

### C# Client

```csharp
using WebApi.Client.Api;
using WebApi.Client.Client;
using WebApi.Client.Model;

var config = new Configuration();
config.BasePath = "http://localhost:3000/api";

var apiInstance = new DefaultApi(config);
var page = 1;
var limit = 10;

try
{
    GetAllUsersResponse result = apiInstance.GetAllUsers(page, limit);
    Console.WriteLine(result);
}
catch (Exception e)
{
    Console.WriteLine("Exception when calling DefaultApi.GetAllUsers: " + e.Message);
}
```

## Customization

### Adding New Endpoints

1. Update the OpenAPI specification in `docs/api/openapi.json`
2. Validate the spec: `npm run openapi:validate`
3. Regenerate clients: `npm run openapi:generate:all`

### Generator Configuration

Modify `openapitools.json` to customize generation options:

- **Client naming**: Change `npmName`, `packageName`, etc.
- **Output directories**: Modify `output` paths
- **Additional properties**: Add language-specific options

### Supported Languages

The OpenAPI Generator CLI supports 50+ languages and frameworks:

- TypeScript (axios, fetch, node)
- Python (urllib3, requests, aiohttp)
- Java (okhttp, retrofit, native)
- C# (httpclient, restsharp)
- Go, Rust, PHP, Ruby, Swift, Kotlin, and many more

Run `npx @openapitools/openapi-generator-cli list` to see all available generators.

## Development Workflow

1. **Design API**: Update OpenAPI spec in `docs/api/openapi.json`
2. **Validate**: Run `npm run openapi:validate`
3. **Generate Clients**: Run `npm run openapi:generate:all`
4. **Test Integration**: Use generated clients in your applications
5. **Version Control**: Commit spec changes, exclude generated code

## Troubleshooting

### Common Issues

1. **Validation Errors**: Check JSON syntax and OpenAPI 3.0 compliance
2. **Generation Failures**: Verify generator version compatibility
3. **Missing Dependencies**: Ensure all required packages are installed

### Debugging

- Use `--verbose` flag for detailed output
- Check generator logs in the output directories
- Validate specification online: [Swagger Editor](https://editor.swagger.io/)

## Resources

- [OpenAPI Generator Documentation](https://openapi-generator.tech/)
- [OpenAPI 3.0 Specification](https://swagger.io/specification/)
- [Generator CLI GitHub](https://github.com/OpenAPITools/openapi-generator-cli)
