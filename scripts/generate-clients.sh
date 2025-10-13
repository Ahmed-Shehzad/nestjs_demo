#!/bin/bash

# OpenAPI Client Generation Script
# Generates clients in multiple languages from OpenAPI specification

set -e

echo "🚀 OpenAPI Client Generation"
echo "=============================="

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration
OPENAPI_SPEC="docs/api/openapi.json"
OUTPUT_DIR="generated"
GENERATOR_VERSION="7.10.0"

# Functions
print_status() {
    echo -e "${BLUE}ℹ️  $1${NC}"
}

print_success() {
    echo -e "${GREEN}✅ $1${NC}"
}

print_error() {
    echo -e "${RED}❌ $1${NC}"
}

print_warning() {
    echo -e "${YELLOW}⚠️  $1${NC}"
}

# Validation
validate_spec() {
    print_status "Validating OpenAPI specification..."

    if [ ! -f "$OPENAPI_SPEC" ]; then
        print_error "OpenAPI spec not found: $OPENAPI_SPEC"
        exit 1
    fi

    # Disable console ninja and validate
    CONSOLE_NINJA_DISABLE=true npx @openapitools/openapi-generator-cli validate -i "$OPENAPI_SPEC" > /dev/null 2>&1

    if [ $? -eq 0 ]; then
        print_success "OpenAPI specification is valid"
    else
        print_error "OpenAPI specification validation failed"
        exit 1
    fi
}

# Generate TypeScript client
generate_typescript() {
    print_status "Generating TypeScript/Axios client..."

    CONSOLE_NINJA_DISABLE=true npx @openapitools/openapi-generator-cli generate \
        -i "$OPENAPI_SPEC" \
        -g typescript-axios \
        -o "$OUTPUT_DIR/typescript-client" \
        --additional-properties=supportsES6=true,npmName=webapi-client,npmVersion=1.0.0,modelPropertyNaming=camelCase \
        > /dev/null 2>&1

    if [ -d "$OUTPUT_DIR/typescript-client" ]; then
        print_success "TypeScript client generated successfully"
        echo "    📁 Location: $OUTPUT_DIR/typescript-client"
        echo "    📦 Package: webapi-client"
    else
        print_error "TypeScript client generation failed"
    fi
}

# Generate Python client
generate_python() {
    print_status "Generating Python client..."

    CONSOLE_NINJA_DISABLE=true npx @openapitools/openapi-generator-cli generate \
        -i "$OPENAPI_SPEC" \
        -g python \
        -o "$OUTPUT_DIR/python-client" \
        --additional-properties=packageName=webapi_client,projectName=webapi-client \
        > /dev/null 2>&1

    if [ -d "$OUTPUT_DIR/python-client" ]; then
        print_success "Python client generated successfully"
        echo "    📁 Location: $OUTPUT_DIR/python-client"
        echo "    🐍 Package: webapi_client"
    else
        print_error "Python client generation failed"
    fi
}

# Generate Java client
generate_java() {
    print_status "Generating Java client..."

    CONSOLE_NINJA_DISABLE=true npx @openapitools/openapi-generator-cli generate \
        -i "$OPENAPI_SPEC" \
        -g java \
        -o "$OUTPUT_DIR/java-client" \
        --additional-properties=groupId=com.example,artifactId=webapi-client,library=okhttp-gson \
        > /dev/null 2>&1

    if [ -d "$OUTPUT_DIR/java-client" ]; then
        print_success "Java client generated successfully"
        echo "    📁 Location: $OUTPUT_DIR/java-client"
        echo "    ☕ Package: com.example.webapi-client"
    else
        print_error "Java client generation failed"
    fi
}

# Generate C# client
generate_csharp() {
    print_status "Generating C# client..."

    CONSOLE_NINJA_DISABLE=true npx @openapitools/openapi-generator-cli generate \
        -i "$OPENAPI_SPEC" \
        -g csharp \
        -o "$OUTPUT_DIR/csharp-client" \
        --additional-properties=packageName=WebApi.Client,targetFramework=net6.0 \
        > /dev/null 2>&1

    if [ -d "$OUTPUT_DIR/csharp-client" ]; then
        print_success "C# client generated successfully"
        echo "    📁 Location: $OUTPUT_DIR/csharp-client"
        echo "    🔷 Namespace: WebApi.Client"
    else
        print_error "C# client generation failed"
    fi
}

# Clean previous generations
clean_generated() {
    if [ -d "$OUTPUT_DIR" ]; then
        print_status "Cleaning previous generations..."
        rm -rf "$OUTPUT_DIR"/*
        print_success "Previous generations cleaned"
    fi
}

# Show summary
show_summary() {
    echo ""
    echo "📋 Generation Summary"
    echo "===================="

    if [ -d "$OUTPUT_DIR" ]; then
        echo "Generated clients:"
        for client in "$OUTPUT_DIR"/*; do
            if [ -d "$client" ]; then
                client_name=$(basename "$client")
                file_count=$(find "$client" -type f | wc -l)
                echo "  • $client_name ($file_count files)"
            fi
        done

        echo ""
        echo "📖 Usage examples available in: docs/api/README.md"
        echo "🔧 Next steps:"
        echo "   1. Install dependencies in generated clients"
        echo "   2. Import and use in your applications"
        echo "   3. Update clients when API changes"
    else
        print_warning "No clients were generated"
    fi
}

# Main execution
main() {
    # Create output directory
    mkdir -p "$OUTPUT_DIR"

    # Parse arguments
    case "${1:-all}" in
        "typescript"|"ts")
            validate_spec
            generate_typescript
            ;;
        "python"|"py")
            validate_spec
            generate_python
            ;;
        "java")
            validate_spec
            generate_java
            ;;
        "csharp"|"cs")
            validate_spec
            generate_csharp
            ;;
        "clean")
            clean_generated
            ;;
        "all"|"")
            validate_spec
            clean_generated
            generate_typescript
            generate_python
            generate_java
            generate_csharp
            ;;
        "help"|"-h"|"--help")
            echo "Usage: $0 [typescript|python|java|csharp|clean|all]"
            echo ""
            echo "Commands:"
            echo "  typescript, ts    Generate TypeScript client only"
            echo "  python, py        Generate Python client only"
            echo "  java             Generate Java client only"
            echo "  csharp, cs       Generate C# client only"
            echo "  clean            Clean generated clients"
            echo "  all              Generate all clients (default)"
            echo "  help             Show this help"
            exit 0
            ;;
        *)
            print_error "Unknown command: $1"
            echo "Use '$0 help' for usage information"
            exit 1
            ;;
    esac

    show_summary
}

# Run main function with all arguments
main "$@"
