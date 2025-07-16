#!/bin/bash

# Docker entrypoint script for Freakend CLI applications
# This script runs before the main application starts

set -e

# Function to wait for MongoDB to be ready
wait_for_mongodb() {
  echo "Waiting for MongoDB to be ready..."
  
  # Extract host and port from MONGODB_URI
  MONGO_HOST=$(echo $MONGODB_URI | sed 's/.*:\/\/\([^:]*\):.*/\1/')
  MONGO_PORT=$(echo $MONGODB_URI | sed 's/.*:\([0-9]*\)\/.*/\1/')
  
  until nc -z "$MONGO_HOST" "$MONGO_PORT"; do
    echo "MongoDB is unavailable - sleeping"
    sleep 2
  done
  
  echo "MongoDB is ready!"
}

# Function to wait for Redis (if used)
wait_for_redis() {
  if [ ! -z "$REDIS_URI" ]; then
    echo "Waiting for Redis to be ready..."
    
    REDIS_HOST=$(echo $REDIS_URI | sed 's/.*:\/\/\([^:]*\):.*/\1/')
    REDIS_PORT=$(echo $REDIS_URI | sed 's/.*:\([0-9]*\)$/\1/')
    
    until nc -z "$REDIS_HOST" "$REDIS_PORT"; do
      echo "Redis is unavailable - sleeping"
      sleep 2
    done
    
    echo "Redis is ready!"
  fi
}

# Function to run database migrations (if any)
run_migrations() {
  echo "Running database migrations..."
  
  # Check if migrations directory exists
  if [ -d "./migrations" ]; then
    echo "Found migrations directory"
    # Add your migration logic here
    # Example: npm run migrate
  else
    echo "No migrations directory found, skipping..."
  fi
}

# Function to create necessary directories
create_directories() {
  echo "Creating necessary directories..."
  
  # Create uploads directory if it doesn't exist
  mkdir -p /usr/src/app/uploads
  
  # Create logs directory if it doesn't exist
  mkdir -p /usr/src/app/logs
  
  # Set proper permissions
  chown -R nodeuser:nodejs /usr/src/app/uploads
  chown -R nodeuser:nodejs /usr/src/app/logs
  
  echo "Directories created successfully"
}

# Function to validate environment variables
validate_env() {
  echo "Validating environment variables..."
  
  # Check required environment variables
  required_vars=("MONGODB_URI" "JWT_SECRET")
  
  for var in "${required_vars[@]}"; do
    if [ -z "${!var}" ]; then
      echo "Error: Required environment variable $var is not set"
      exit 1
    fi
  done
  
  echo "Environment variables validation passed"
}

# Function to setup logging
setup_logging() {
  echo "Setting up logging..."
  
  # Create log files
  touch /usr/src/app/logs/app.log
  touch /usr/src/app/logs/error.log
  
  # Set proper permissions
  chown nodeuser:nodejs /usr/src/app/logs/*.log
  
  echo "Logging setup completed"
}

# Main execution
main() {
  echo "Starting Freakend application initialization..."
  
  # Validate environment
  validate_env
  
  # Create directories
  create_directories
  
  # Setup logging
  setup_logging
  
  # Wait for external services
  wait_for_mongodb
  wait_for_redis
  
  # Run migrations
  run_migrations
  
  echo "Initialization completed successfully!"
  echo "Starting application..."
  
  # Execute the main command
  exec "$@"
}

# Run main function with all arguments
main "$@"