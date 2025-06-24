#!/bin/bash

# Contest App Production Deployment Script

set -e

echo "🚀 Starting Contest App Production Deployment"

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

# Check if required files exist
if [ ! -f ".env" ]; then
    log_error ".env file not found. Please create one with your DATABASE_URL and other required variables."
    exit 1
fi

if [ ! -f "package.json" ]; then
    log_error "package.json not found. Please run this script from the project root."
    exit 1
fi

# Check if Docker is installed
if ! command -v docker &> /dev/null; then
    log_error "Docker is not installed. Please install Docker and try again."
    exit 1
fi

# Check if Docker Compose is installed
if ! command -v docker-compose &> /dev/null; then
    log_error "Docker Compose is not installed. Please install Docker Compose and try again."
    exit 1
fi

# Load environment variables from .env file
set -a
source .env
set +a

# Validate required environment variables
if [ -z "$DATABASE_URL" ]; then
    log_error "DATABASE_URL is not set in .env file"
    exit 1
fi

if [ -z "$SESSION_SECRET" ]; then
    log_warn "SESSION_SECRET is not set. Using default (not recommended for production)"
    export SESSION_SECRET="default-session-secret-change-me"
fi

log_info "Building Docker image..."
docker build -t contest-app:latest .

log_info "Running database migrations..."
npm run db:push

log_info "Starting production containers..."
docker-compose -f docker-compose.prod.yml up -d

log_info "Waiting for services to be healthy..."
sleep 10

# Check if the application is running
if curl -f -s http://localhost:5000/api/health > /dev/null; then
    log_info "✅ Application is running successfully!"
    log_info "🌐 Access your application at: http://localhost:5000"
    log_info "📊 Health check endpoint: http://localhost:5000/api/health"
else
    log_error "❌ Application failed to start properly"
    log_error "Check logs with: docker-compose -f docker-compose.prod.yml logs"
    exit 1
fi

log_info "🎉 Deployment completed successfully!" 