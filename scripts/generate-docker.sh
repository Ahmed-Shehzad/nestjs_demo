#!/bin/bash

# Docker-based OpenAPI Client Generator
# Alternative solution when CLI has issues

echo "🐳 Docker-based OpenAPI Client Generation"
echo "========================================="

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
BLUE='\033[0;34m'
NC='\033[0m'

# Configuration
SPEC_FILE="docs/api/openapi.json"
OUTPUT_DIR="generated"
DOCKER_IMAGE="openapitools/openapi-generator-cli:latest"

print_status() { echo -e "${BLUE}ℹ️  $1${NC}"; }
print_success() { echo -e "${GREEN}✅ $1${NC}"; }
print_error() { echo -e "${RED}❌ $1${NC}"; }

# Check if Docker is available
check_docker() {
    if ! command -v docker &> /dev/null; then
        print_error "Docker is not installed. Please install Docker first."
        echo "Visit: https://docs.docker.com/get-docker/"
        exit 1
    fi

    if ! docker info &> /dev/null; then
        print_error "Docker is not running. Please start Docker."
        exit 1
    fi

    print_success "Docker is available"
}

# Pull Docker image
pull_image() {
    print_status "Pulling OpenAPI Generator Docker image..."
    docker pull $DOCKER_IMAGE
    print_success "Docker image ready"
}

# Generate TypeScript client
generate_typescript() {
    print_status "Generating TypeScript client with Docker..."

    docker run --rm -v "${PWD}:/local" $DOCKER_IMAGE generate \
        -i /local/$SPEC_FILE \
        -g typescript-axios \
        -o /local/$OUTPUT_DIR/typescript-client \
        --additional-properties=supportsES6=true,npmName=webapi-client,npmVersion=1.0.0

    if [ -d "$OUTPUT_DIR/typescript-client" ]; then
        print_success "TypeScript client generated"
        echo "  📁 Location: $OUTPUT_DIR/typescript-client"

        # Create package.json if needed
        if [ ! -f "$OUTPUT_DIR/typescript-client/package.json" ]; then
            cat > "$OUTPUT_DIR/typescript-client/package.json" << EOF
{
  "name": "webapi-client",
  "version": "1.0.0",
  "description": "Generated TypeScript client for WebAPI",
  "main": "index.ts",
  "dependencies": {
    "axios": "^1.6.0"
  },
  "devDependencies": {
    "typescript": "^5.0.0",
    "@types/node": "^20.0.0"
  }
}
EOF
        fi
    else
        print_error "TypeScript client generation failed"
    fi
}

# Generate Python client
generate_python() {
    print_status "Generating Python client with Docker..."

    docker run --rm -v "${PWD}:/local" $DOCKER_IMAGE generate \
        -i /local/$SPEC_FILE \
        -g python \
        -o /local/$OUTPUT_DIR/python-client \
        --additional-properties=packageName=webapi_client,projectName=webapi-client

    if [ -d "$OUTPUT_DIR/python-client" ]; then
        print_success "Python client generated"
        echo "  📁 Location: $OUTPUT_DIR/python-client"
        echo "  🐍 Install: cd $OUTPUT_DIR/python-client && pip install ."
    else
        print_error "Python client generation failed"
    fi
}

# Generate Java client
generate_java() {
    print_status "Generating Java client with Docker..."

    docker run --rm -v "${PWD}:/local" $DOCKER_IMAGE generate \
        -i /local/$SPEC_FILE \
        -g java \
        -o /local/$OUTPUT_DIR/java-client \
        --additional-properties=groupId=com.example,artifactId=webapi-client,library=okhttp-gson

    if [ -d "$OUTPUT_DIR/java-client" ]; then
        print_success "Java client generated"
        echo "  📁 Location: $OUTPUT_DIR/java-client"
        echo "  ☕ Build: cd $OUTPUT_DIR/java-client && mvn install"
    else
        print_error "Java client generation failed"
    fi
}

# Generate C# client
generate_csharp() {
    print_status "Generating C# client with Docker..."

    docker run --rm -v "${PWD}:/local" $DOCKER_IMAGE generate \
        -i /local/$SPEC_FILE \
        -g csharp \
        -o /local/$OUTPUT_DIR/csharp-client \
        --additional-properties=packageName=WebApi.Client,targetFramework=net6.0

    if [ -d "$OUTPUT_DIR/csharp-client" ]; then
        print_success "C# client generated"
        echo "  📁 Location: $OUTPUT_DIR/csharp-client"
        echo "  🔷 Build: cd $OUTPUT_DIR/csharp-client && dotnet build"
    else
        print_error "C# client generation failed"
    fi
}

# Clean generated files
clean_generated() {
    print_status "Cleaning generated files..."
    rm -rf $OUTPUT_DIR/*
    print_success "Generated files cleaned"
}

# Validate specification
validate_spec() {
    print_status "Validating OpenAPI specification with Docker..."

    docker run --rm -v "${PWD}:/local" $DOCKER_IMAGE validate \
        -i /local/$SPEC_FILE

    print_success "OpenAPI specification is valid"
}

# Show help
show_help() {
    echo "Usage: $0 [command]"
    echo ""
    echo "Commands:"
    echo "  typescript, ts    Generate TypeScript client"
    echo "  python, py        Generate Python client"
    echo "  java             Generate Java client"
    echo "  csharp, cs       Generate C# client"
    echo "  all              Generate all clients"
    echo "  clean            Clean generated files"
    echo "  validate         Validate OpenAPI spec"
    echo "  help             Show this help"
    echo ""
    echo "Prerequisites:"
    echo "  - Docker must be installed and running"
    echo "  - OpenAPI spec must exist at: $SPEC_FILE"
}

# Main execution
main() {
    case "${1:-help}" in
        "typescript"|"ts")
            check_docker
            pull_image
            validate_spec
            generate_typescript
            ;;
        "python"|"py")
            check_docker
            pull_image
            validate_spec
            generate_python
            ;;
        "java")
            check_docker
            pull_image
            validate_spec
            generate_java
            ;;
        "csharp"|"cs")
            check_docker
            pull_image
            validate_spec
            generate_csharp
            ;;
        "all")
            check_docker
            pull_image
            validate_spec
            clean_generated
            generate_typescript
            generate_python
            generate_java
            generate_csharp
            ;;
        "clean")
            clean_generated
            ;;
        "validate")
            check_docker
            pull_image
            validate_spec
            ;;
        "help"|"-h"|"--help")
            show_help
            ;;
        *)
            print_error "Unknown command: $1"
            show_help
            exit 1
            ;;
    esac
}

main "$@"
