#!/bin/bash

# Azure deployment script for Solutil Backend
echo "🚀 Starting Solutil Backend deployment..."

# Change to the correct directory
cd /home/site/wwwroot

# Ensure we have the right Node.js version
echo "📋 Node.js version: $(node --version)"
echo "📋 NPM version: $(npm --version)"

# Install dependencies
echo "📦 Installing Node.js dependencies..."
npm ci --production

# Check if installation was successful
if [ $? -eq 0 ]; then
    echo "✅ Dependencies installed successfully"
else
    echo "❌ Failed to install dependencies"
    exit 1
fi

# List installed packages (for debugging)
echo "📋 Installed packages:"
ls -la node_modules/ | head -10

echo "🎯 Starting server..."
exec node server.js