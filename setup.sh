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

# 3. Download face-api.js model weights for offline face recognition
echo "📥 Downloading face-api.js model weights..."
MODELS_DIR="frontend/nyaysetu-frontend/public/models"
if [ ! -d "$MODELS_DIR" ] || [ -z "$(ls -A "$MODELS_DIR" 2>/dev/null)" ]; then
    mkdir -p "$MODELS_DIR"
    BASE_URL="https://cdn.jsdelivr.net/gh/justadudewhohacks/face-api.js@0.22.2/weights"
    for file in \
        tiny_face_detector_model-weights_manifest.json \
        tiny_face_detector_model-shard1 \
        face_landmark_68_model-weights_manifest.json \
        face_landmark_68_model-shard1 \
        face_recognition_model-weights_manifest.json \
        face_recognition_model-shard1 \
        face_recognition_model-shard2; do
        echo "  Downloading $file..."
        curl -sL "$BASE_URL/$file" -o "$MODELS_DIR/$file"
    done
    echo "✅ Model weights downloaded to $MODELS_DIR."
else
    echo "ℹ️ Model weights already exist, skipping."
fi

echo "🚀 Setup Complete!"
echo "Next steps:"
echo "1. Run 'psql -f local_setup.sql' to create your database."
echo "2. Run 'mvn spring-boot:run' in backend/nyaysetu-backend."
echo "3. Run 'npm install && npm run dev' in frontend/nyaysetu-frontend."
