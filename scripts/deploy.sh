#!/bin/bash

# Marketing Automation Platform Deployment Script
# Usage: ./scripts/deploy.sh [environment]

set -e

ENVIRONMENT=${1:-production}
PROJECT_NAME="marketing-automation"
VERSION=$(date +%Y%m%d-%H%M%S)

echo "🚀 Deploying Marketing Automation Platform"
echo "Environment: $ENVIRONMENT"
echo "Version: $VERSION"

# Load environment variables
if [ -f ".env.${ENVIRONMENT}" ]; then
    echo "📝 Loading environment variables from .env.${ENVIRONMENT}"
    export $(cat .env.${ENVIRONMENT} | xargs)
elif [ -f ".env" ]; then
    echo "📝 Loading environment variables from .env"
    export $(cat .env | xargs)
else
    echo "⚠️  No environment file found. Using defaults."
fi

# Validate required environment variables
if [ -z "$VITE_API_URL" ]; then
    echo "❌ VITE_API_URL is required"
    exit 1
fi

echo "🏗️  Building Docker image..."
docker build \
    --build-arg VITE_API_URL="$VITE_API_URL" \
    --build-arg VITE_AUTH_ENDPOINT="$VITE_AUTH_ENDPOINT" \
    --build-arg VITE_LEADS_ENDPOINT="$VITE_LEADS_ENDPOINT" \
    --build-arg VITE_CAMPAIGNS_ENDPOINT="$VITE_CAMPAIGNS_ENDPOINT" \
    --build-arg VITE_EMAIL_ENDPOINT="$VITE_EMAIL_ENDPOINT" \
    --build-arg VITE_SEARCH_ENDPOINT="$VITE_SEARCH_ENDPOINT" \
    --build-arg VITE_WEB_READER_ENDPOINT="$VITE_WEB_READER_ENDPOINT" \
    --build-arg VITE_APP_NAME="$VITE_APP_NAME" \
    --build-arg VITE_APP_VERSION="$VITE_APP_VERSION" \
    -t "${PROJECT_NAME}:${VERSION}" \
    -t "${PROJECT_NAME}:latest" \
    .

echo "🧪 Testing Docker image..."
docker run --rm -d --name "${PROJECT_NAME}-test" -p 8080:80 "${PROJECT_NAME}:latest"

# Wait for container to start
sleep 5

# Health check
if curl -f http://localhost:8080/health > /dev/null 2>&1; then
    echo "✅ Health check passed"
else
    echo "❌ Health check failed"
    docker logs "${PROJECT_NAME}-test"
    docker stop "${PROJECT_NAME}-test" || true
    exit 1
fi

# Stop test container
docker stop "${PROJECT_NAME}-test"

echo "📦 Deploying with Docker Compose..."
if [ "$ENVIRONMENT" = "production" ]; then
    docker-compose -f docker-compose.yml -f docker-compose.prod.yml up -d
else
    docker-compose up -d
fi

echo "🔍 Checking deployment status..."
sleep 10

# Check if containers are running
if docker-compose ps | grep -q "Up"; then
    echo "✅ Deployment successful!"
    echo "📱 Application URL: http://localhost:3000"
    
    if [ "$ENVIRONMENT" = "production" ]; then
        echo "🏷️  Image tagged as: ${PROJECT_NAME}:${VERSION}"
        echo "🚀 Production deployment complete"
    fi
else
    echo "❌ Deployment failed"
    docker-compose logs
    exit 1
fi

# Cleanup old images (keep last 5)
echo "🧹 Cleaning up old images..."
docker images "${PROJECT_NAME}" --format "table {{.Tag}}\t{{.ID}}" | \
    grep -v latest | tail -n +6 | awk '{print $2}' | \
    xargs -r docker rmi || true

echo "✨ Deployment complete!"