#!/bin/bash

# 🔄 Rollback Script
# Rolls back to the previous version in case of deployment issues

set -euo pipefail

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration
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

# Find latest backup
find_latest_backup() {
    if [ ! -d "${BACKUP_DIR}" ]; then
        error "Backup directory ${BACKUP_DIR} not found"
    fi

    LATEST_BACKUP=$(ls -t "${BACKUP_DIR}"/backup_*.sql 2>/dev/null | head -n1)

    if [ -z "${LATEST_BACKUP}" ]; then
        error "No backup files found in ${BACKUP_DIR}"
    fi

    log "Latest backup found: ${LATEST_BACKUP}"
}

# Rollback database
rollback_database() {
    log "Rolling back database..."

    if [ ! -f "${LATEST_BACKUP}" ]; then
        error "Backup file not found: ${LATEST_BACKUP}"
    fi

    # Stop application to prevent connections
    docker-compose -f docker-compose.prod.yml stop app

    # Restore database
    docker-compose -f docker-compose.prod.yml exec -T postgres psql -U postgres -d nest -c "DROP SCHEMA public CASCADE; CREATE SCHEMA public;"
    docker-compose -f docker-compose.prod.yml exec -T postgres psql -U postgres -d nest < "${LATEST_BACKUP}"

    success "Database rollback completed"
}

# Rollback to previous image
rollback_image() {
    log "Rolling back to previous Docker image..."

    # Get previous image from Docker history
    PREVIOUS_IMAGE=$(docker images --format "table {{.Repository}}:{{.Tag}}\t{{.CreatedAt}}" | grep "ghcr.io/ahmed-shehzad/nestjs_demo" | sed -n '2p' | awk '{print $1}')

    if [ -z "${PREVIOUS_IMAGE}" ]; then
        warning "No previous image found, using 'latest' tag"
        PREVIOUS_IMAGE="ghcr.io/ahmed-shehzad/nestjs_demo:latest"
    fi

    log "Rolling back to image: ${PREVIOUS_IMAGE}"

    # Update docker-compose to use previous image
    sed -i.bak "s|image: ghcr.io/ahmed-shehzad/nestjs_demo:.*|image: ${PREVIOUS_IMAGE}|" docker-compose.prod.yml

    success "Image rollback prepared"
}

# Restart services
restart_services() {
    log "Restarting services..."

    docker-compose -f docker-compose.prod.yml down
    docker-compose -f docker-compose.prod.yml up -d

    # Wait for services
    sleep 30

    # Health check
    if curl -f http://localhost:3000/health >/dev/null 2>&1; then
        success "Services restarted successfully"
    else
        error "Health check failed after rollback"
    fi
}

# Main rollback flow
main() {
    log "🔄 Starting rollback process..."

    echo -e "${YELLOW}⚠️  This will rollback the application to the previous version.${NC}"
    echo -e "${YELLOW}⚠️  Database will be restored from the latest backup.${NC}"
    read -p "Are you sure you want to continue? (y/N): " -n 1 -r
    echo

    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        log "Rollback cancelled"
        exit 0
    fi

    find_latest_backup
    rollback_image
    rollback_database
    restart_services

    success "🎉 Rollback completed successfully!"
    log "Application is running at: http://localhost:3000"
}

# Run main function
main "$@"
