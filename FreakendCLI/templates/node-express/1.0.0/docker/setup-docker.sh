#!/bin/bash

# Freakend CLI - Docker Setup Script
# This script automates the Docker setup process for your Node.js application

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Function to check if command exists
command_exists() {
    command -v "$1" >/dev/null 2>&1
}

# Function to generate random string
generate_random_string() {
    local length=${1:-32}
    openssl rand -base64 $length | tr -d "=+/" | cut -c1-$length
}

# Function to check prerequisites
check_prerequisites() {
    print_status "Checking prerequisites..."
    
    if ! command_exists docker; then
        print_error "Docker is not installed. Please install Docker first."
        exit 1
    fi
    
    if ! command_exists docker-compose; then
        print_error "Docker Compose is not installed. Please install Docker Compose first."
        exit 1
    fi
    
    # Check if Docker is running
    if ! docker info >/dev/null 2>&1; then
        print_error "Docker is not running. Please start Docker first."
        exit 1
    fi
    
    print_success "Prerequisites check passed"
}

# Function to setup environment file
setup_environment() {
    print_status "Setting up environment file..."
    
    if [ ! -f ".env" ]; then
        if [ -f ".env.example" ]; then
            cp .env.example .env
            print_success "Created .env file from .env.example"
        else
            print_error ".env.example file not found"
            exit 1
        fi
    else
        print_warning ".env file already exists, skipping creation"
    fi
    
    # Generate secure JWT secret if not set
    if grep -q "JWT_SECRET=your-super-secret-jwt-key" .env; then
        local jwt_secret=$(generate_random_string 64)
        if command_exists sed; then
            sed -i.bak "s/JWT_SECRET=your-super-secret-jwt-key.*/JWT_SECRET=$jwt_secret/" .env
            print_success "Generated secure JWT secret"
        else
            print_warning "Please manually update JWT_SECRET in .env file"
        fi
    fi
    
    # Generate secure session secret if not set
    if grep -q "SESSION_SECRET=your-session-secret-key" .env; then
        local session_secret=$(generate_random_string 32)
        if command_exists sed; then
            sed -i.bak "s/SESSION_SECRET=your-session-secret-key.*/SESSION_SECRET=$session_secret/" .env
            print_success "Generated secure session secret"
        fi
    fi
    
    # Generate secure encryption key if not set
    if grep -q "ENCRYPTION_KEY=your-32-character-encryption-key" .env; then
        local encryption_key=$(generate_random_string 32)
        if command_exists sed; then
            sed -i.bak "s/ENCRYPTION_KEY=your-32-character-encryption-key.*/ENCRYPTION_KEY=$encryption_key/" .env
            print_success "Generated secure encryption key"
        fi
    fi
    
    print_success "Environment setup completed"
}

# Function to make scripts executable
setup_permissions() {
    print_status "Setting up file permissions..."
    
    if [ -f "docker-entrypoint.sh" ]; then
        chmod +x docker-entrypoint.sh
        print_success "Made docker-entrypoint.sh executable"
    fi
    
    if [ -f "healthcheck.js" ]; then
        chmod +x healthcheck.js
        print_success "Made healthcheck.js executable"
    fi
    
    # Create necessary directories
    mkdir -p uploads logs
    print_success "Created uploads and logs directories"
}

# Function to validate Docker configuration
validate_docker_config() {
    print_status "Validating Docker configuration..."
    
    # Check if Dockerfile exists
    if [ ! -f "Dockerfile" ]; then
        print_error "Dockerfile not found"
        exit 1
    fi
    
    # Check if docker-compose.yml exists
    if [ ! -f "docker-compose.yml" ]; then
        print_error "docker-compose.yml not found"
        exit 1
    fi
    
    # Validate docker-compose.yml syntax
    if ! docker-compose config >/dev/null 2>&1; then
        print_error "docker-compose.yml has syntax errors"
        exit 1
    fi
    
    print_success "Docker configuration validation passed"
}

# Function to build and start containers
build_and_start() {
    print_status "Building and starting containers..."
    
    # Build images
    print_status "Building Docker images..."
    docker-compose build
    
    # Start services
    print_status "Starting services..."
    docker-compose up -d
    
    print_success "Containers started successfully"
}

# Function to wait for services to be ready
wait_for_services() {
    print_status "Waiting for services to be ready..."
    
    local max_attempts=30
    local attempt=1
    
    while [ $attempt -le $max_attempts ]; do
        if curl -s http://localhost:3000/health >/dev/null 2>&1; then
            print_success "Application is ready!"
            break
        fi
        
        print_status "Attempt $attempt/$max_attempts - Waiting for application to start..."
        sleep 2
        ((attempt++))
    done
    
    if [ $attempt -gt $max_attempts ]; then
        print_error "Application failed to start within expected time"
        print_status "Checking logs..."
        docker-compose logs app
        exit 1
    fi
}

# Function to run health checks
run_health_checks() {
    print_status "Running health checks..."
    
    # Check application health
    if curl -s http://localhost:3000/health | grep -q "ok"; then
        print_success "Application health check passed"
    else
        print_error "Application health check failed"
        return 1
    fi
    
    # Check MongoDB health
    if docker-compose exec -T mongodb mongosh --eval "db.runCommand('ping')" >/dev/null 2>&1; then
        print_success "MongoDB health check passed"
    else
        print_error "MongoDB health check failed"
        return 1
    fi
    
    # Check Redis health (if enabled)
    if docker-compose exec -T redis redis-cli ping >/dev/null 2>&1; then
        print_success "Redis health check passed"
    else
        print_warning "Redis health check failed (Redis might be disabled)"
    fi
}

# Function to display final information
display_final_info() {
    print_success "Docker setup completed successfully!"
    echo
    echo "🚀 Your application is now running:"
    echo "   Application: http://localhost:3000"
    echo "   Health Check: http://localhost:3000/health"
    echo
    echo "📊 Container Status:"
    docker-compose ps
    echo
    echo "🔧 Useful Commands:"
    echo "   View logs: docker-compose logs -f"
    echo "   Stop containers: docker-compose down"
    echo "   Restart containers: docker-compose restart"
    echo "   Enter app container: docker-compose exec app /bin/sh"
    echo
    echo "📚 Check the README.md file for more detailed instructions"
    echo
    print_success "Happy coding! 🎉"
}

# Function to cleanup on failure
cleanup_on_failure() {
    print_error "Setup failed. Cleaning up..."
    docker-compose down >/dev/null 2>&1 || true
    exit 1
}

# Function to display help
show_help() {
    echo "Freakend CLI - Docker Setup Script"
    echo
    echo "Usage: $0 [OPTIONS]"
    echo
    echo "Options:"
    echo "  -h, --help          Show this help message"
    echo "  -p, --production    Setup for production environment"
    echo "  -d, --development   Setup for development environment (default)"
    echo "  --no-start          Setup files but don't start containers"
    echo "  --force             Force setup even if files exist"
    echo
    echo "Examples:"
    echo "  $0                  # Setup for development"
    echo "  $0 --production     # Setup for production"
    echo "  $0 --no-start       # Setup files only"
}

# Main function
main() {
    local production=false
    local no_start=false
    local force=false
    
    # Parse command line arguments
    while [[ $# -gt 0 ]]; do
        case $1 in
            -h|--help)
                show_help
                exit 0
                ;;
            -p|--production)
                production=true
                shift
                ;;
            -d|--development)
                production=false
                shift
                ;;
            --no-start)
                no_start=true
                shift
                ;;
            --force)
                force=true
                shift
                ;;
            *)
                print_error "Unknown option: $1"
                show_help
                exit 1
                ;;
        esac
    done
    
    # Set trap for cleanup on failure
    trap cleanup_on_failure ERR
    
    echo "🐳 Freakend CLI - Docker Setup"
    echo "================================"
    
    # Run setup steps
    check_prerequisites
    setup_environment
    setup_permissions
    validate_docker_config
    
    if [ "$no_start" = false ]; then
        build_and_start
        wait_for_services
        run_health_checks
        display_final_info
    else
        print_success "Setup completed. Run 'docker-compose up' to start containers."
    fi
}

# Run main function with all arguments
main "$@"
exec "$@"
}
