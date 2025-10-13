#!/bin/bash

echo "🔧 Testing OpenAPI Client Generation"
echo "====================================="

echo "1. Validating OpenAPI spec..."
npx @openapitools/openapi-generator-cli validate -i docs/api/openapi.json

echo ""
echo "2. Generating TypeScript client..."
npx @openapitools/openapi-generator-cli generate \
  -i docs/api/openapi.json \
  -g typescript-axios \
  -o generated/client \
  --additional-properties=supportsES6=true,npmName=webapi-client,npmVersion=1.0.0

echo ""
echo "3. Checking generated files..."
if [ -d "generated/client" ]; then
  echo "✅ Client generated successfully!"
  echo "Generated files:"
  find generated/client -name "*.ts" | head -5
else
  echo "❌ Client generation failed!"
fi

echo ""
echo "4. Available generators:"
npx @openapitools/openapi-generator-cli list | grep -E "(typescript|python|java|csharp)" | head -10
