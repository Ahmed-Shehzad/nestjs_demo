#!/bin/bash

# 🚀 Production Deployment Script
# Deploys the NestJS application to production environment

set -euo pipefail

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration
DOCKER_IMAGE="${DOCKER_IMAGE:-ghcr.io/ahmed-shehzad/nestjs_demo:latest}"
ENVIRONMENT="${ENVIRONMENT:-production}"
BACKUP_DIR="${BACKUP_DIR:-./backups}"

# Functions
log() {
    echo -e "${BLUE}[$(date +'%Y-%m-%d %H:%M:%S')]${NC} $1"
}

success() {
    echo -e "${GREEN}✅ $1${NC}"
}

warning() {
    echo -e "${YELLOW}⚠️  $1${NC}"
}

error() {
    echo -e "${RED}❌ $1${NC}"
    exit 1
}

# Check prerequisites
check_prerequisites() {
    log "Checking prerequisites..."

    command -v docker >/dev/null 2>&1 || error "Docker is not installed"
    command -v docker-compose >/dev/null 2>&1 || error "Docker Compose is not installed"

    if [ ! -f ".env.${ENVIRONMENT}" ]; then
        error "Environment file .env.${ENVIRONMENT} not found"
    fi

    success "Prerequisites check passed"
}

# Create backup
create_backup() {
    log "Creating database backup..."

    mkdir -p "${BACKUP_DIR}"
    BACKUP_FILE="${BACKUP_DIR}/backup_$(date +%Y%m%d_%H%M%S).sql"

    if docker-compose ps postgres | grep -q "Up"; then
        docker-compose exec -T postgres pg_dump -U postgres nest > "${BACKUP_FILE}" || warning "Backup failed"
        success "Database backup created: ${BACKUP_FILE}"
    else
        warning "Database container not running, skipping backup"
    fi
}

# Pull latest image
pull_image() {
    log "Pulling latest Docker image: ${DOCKER_IMAGE}"
    docker pull "${DOCKER_IMAGE}" || error "Failed to pull Docker image"
    success "Docker image pulled successfully"
}

# Deploy application
deploy() {
    log "Starting deployment..."

    # Copy environment file
    cp ".env.${ENVIRONMENT}" .env

    # Stop existing containers
    log "Stopping existing containers..."
    docker-compose -f docker-compose.prod.yml down --remove-orphans

    # Start new containers
    log "Starting new containers..."
    docker-compose -f docker-compose.prod.yml up -d --force-recreate

    # Wait for services to be healthy
    log "Waiting for services to be healthy..."
    sleep 30

    # Check health
    if curl -f http://localhost:3000/health >/dev/null 2>&1; then
        success "Application is healthy and ready"
    else
        error "Application health check failed"
    fi
}

# Run database migrations
run_migrations() {
    log "Running database migrations..."

    docker-compose -f docker-compose.prod.yml exec -T app npm run prisma:migrate:deploy || error "Database migration failed"
    success "Database migrations completed"
}

# Cleanup old images
cleanup() {
    log "Cleaning up old Docker images..."
    docker image prune -f --filter "until=24h"
    success "Cleanup completed"
}

# Main deployment flow
main() {
    log "🚀 Starting production deployment..."

    check_prerequisites
    pull_image
    create_backup
    deploy
    run_migrations
    cleanup

    success "🎉 Deployment completed successfully!"
    log "Application is running at: http://localhost:3000"
    log "Health check: http://localhost:3000/health"
}

# Run main function
main "$@"
