#!/bin/bash

# Azure Deployment script for Solutil Backend
echo "🚀 Starting Azure deployment process..."

# Ensure we're in the right directory
DEPLOYMENT_SOURCE=${DEPLOYMENT_SOURCE:-$PWD}
DEPLOYMENT_TARGET=${DEPLOYMENT_TARGET:-/home/site/wwwroot}

echo "📂 Deployment Source: $DEPLOYMENT_SOURCE"
echo "📂 Deployment Target: $DEPLOYMENT_TARGET"

# Copy files to deployment target
echo "📋 Copying files..."
cp -R $DEPLOYMENT_SOURCE/* $DEPLOYMENT_TARGET/

# Navigate to deployment target
cd $DEPLOYMENT_TARGET

# Install Node.js dependencies
echo "📦 Installing production dependencies..."
npm ci --production --silent

if [ $? -ne 0 ]; then
  echo "❌ npm install failed"
  exit 1
fi

# Create necessary directories
echo "📁 Creating required directories..."
mkdir -p uploads/documents
mkdir -p logs

# Set proper permissions
echo "🔒 Setting permissions..."
chmod -R 755 uploads/
chmod +x server.js

# Verify installation
echo "✅ Verifying installation..."
echo "Node version: $(node --version)"
echo "NPM version: $(npm --version)"
ls -la node_modules/express > /dev/null && echo "✅ Express found" || echo "❌ Express not found"

echo "🎉 Deployment completed successfully!"