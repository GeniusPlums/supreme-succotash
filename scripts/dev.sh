#!/bin/bash

# Contest App Development Setup Script

set -e

echo "🚀 Starting Contest App Development Environment"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Functions
log_info() {
    echo -e "${GREEN}[INFO]${NC} $1"
}

log_warn() {
    echo -e "${YELLOW}[WARN]${NC} $1"
}

log_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Check if .env file exists
if [ ! -f ".env" ]; then
    log_warn ".env file not found. Creating one from .env.example..."
    if [ -f ".env.example" ]; then
        cp .env.example .env
        log_info "Created .env file from .env.example"
        log_warn "Please update the .env file with your actual values"
    else
        log_error "Neither .env nor .env.example found. Please create .env manually."
        exit 1
    fi
fi

# Check if node_modules exists
if [ ! -d "node_modules" ]; then
    log_info "Installing dependencies..."
    npm install
fi

# Start development environment
log_info "Starting development environment with Docker Compose..."
docker-compose up --build

log_info "🎉 Development environment is ready!"
log_info "🌐 Access your application at: http://localhost:5000" 