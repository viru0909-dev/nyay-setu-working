#!/bin/bash

# NYAY-SETU Local Setup Script
# This script prepares your local environment for the first run.

echo "🏛️ Setting up NyaySetu Local Environment..."

# 1. Create Backend .env from example if it doesn't exist
echo "📝 Configuring Backend environment..."
if [ ! -f "backend/nyaysetu-backend/.env" ]; then
    cp backend/nyaysetu-backend/.env.example backend/nyaysetu-backend/.env
    # Generate a random JWT secret for local use
    JWT_SECRET=$(openssl rand -base64 32)
    # Update the secret in the .env file (macOS compatible sed)
    sed -i '' "s/your-secure-jwt-secret-key-minimum-256-bits/\"$JWT_SECRET\"/g" backend/nyaysetu-backend/.env
    echo "✅ backend/.env created with a fresh JWT secret."
else
    echo "ℹ️ backend/.env already exists, skipping."
fi

# 2. Create Frontend .env
echo "🌐 Configuring Frontend environment..."
if [ ! -f "frontend/nyaysetu-frontend/.env" ]; then
    echo "VITE_API_URL=http://localhost:8080" > frontend/nyaysetu-frontend/.env
    echo "✅ frontend/.env created."
else
    echo "ℹ️ frontend/.env already exists, skipping."
fi

echo "🚀 Setup Complete!"
echo "Next steps:"
echo "1. Run 'psql -f local_setup.sql' to create your database."
echo "2. Run 'mvn spring-boot:run' in backend/nyaysetu-backend."
echo "3. Run 'npm install && npm run dev' in frontend/nyaysetu-frontend."
