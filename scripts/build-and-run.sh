#!/bin/bash
# NyaySetu ARM64 Docker Build & Run Script
# This script automates the build and deployment process

set -e  # Exit on error

echo "🚀 NyaySetu ARM64 Docker Build & Run Script"
echo "============================================"
echo ""

# Step 1: Clean Docker environment
echo "Step 1: Cleaning Docker environment..."
read -p "Do you want to prune Docker system? This will remove all unused containers/images (y/n): " -n 1 -r
echo ""
if [[ $REPLY =~ ^[Yy]$ ]]; then
    docker system prune -af || true
    docker-compose down -v || true
    echo "✅ Docker environment cleaned"
else
    echo "⏭️  Skipped pruning"
fi
echo ""

# Step 2: Set platform
echo "Step 2: Setting platform to ARM64..."
export DOCKER_DEFAULT_PLATFORM=linux/arm64
echo "✅ DOCKER_DEFAULT_PLATFORM=linux/arm64"
echo ""

# Step 3: Make init script executable
echo "Step 3: Making database init script executable..."
chmod +x scripts/init-databases.sh
echo "✅ scripts/init-databases.sh is now executable"
echo ""

# Step 4: Build all services
echo "Step 4: Building all Docker images..."
read -p "Use --no-cache for clean build? (Recommended for first build) (y/n): " -n 1 -r
echo ""
if [[ $REPLY =~ ^[Yy]$ ]]; then
    docker-compose build --no-cache
else
    docker-compose build
fi
echo "✅ All images built successfully"
echo ""

# Step 5: Start all services
echo "Step 5: Starting all services..."
docker-compose up -d
echo "✅ All services started in detached mode"
echo ""

# Step 6: Wait for services to initialize
echo "Step 6: Waiting for services to initialize (60 seconds)..."
for i in {1..60}; do
    echo -n "."
    sleep 1
done
echo ""
echo "✅ Initialization period complete"
echo ""

# Step 7: Check service status
echo "Step 7: Checking service status..."
echo ""
docker-compose ps
echo ""

# Step 8: Verification checks
echo "============================================"
echo "📋 Quick Verification Checklist"
echo "============================================"
echo ""

echo "1. PostgreSQL Database Creation:"
echo "   Run: docker-compose logs postgres | grep 'Creating database'"
echo ""

echo "2. Eureka Dashboard:"
echo "   Open: http://localhost:8761"
echo ""

echo "3. Gateway Health:"
echo "   Run: curl http://localhost:9000/actuator/health"
echo ""

echo "4. Frontend:"
echo "   Open: http://localhost"
echo ""

echo "5. View all logs:"
echo "   Run: docker-compose logs -f"
echo ""

echo "============================================"
echo "✅ Build and deployment complete!"
echo "============================================"
echo ""
echo "Next steps:"
echo "1. Fill in missing environment variables in .env (AI_API_KEY, SMTP_*)"
echo "2. Test authentication endpoints (see walkthrough.md)"
echo "3. Verify all services are registered in Eureka"
echo ""
