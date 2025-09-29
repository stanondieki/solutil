# Deployment script for Azure App Service
echo "Starting deployment process..."

# Install dependencies
echo "Installing production dependencies..."
npm ci --only=production

# Create uploads directory if it doesn't exist
mkdir -p uploads/documents

# Set proper permissions
echo "Setting permissions..."
chmod -R 755 uploads/

# Run any migration scripts if needed
if [ -f "scripts/migrate.js" ]; then
  echo "Running database migrations..."
  node scripts/migrate.js
fi

echo "Deployment completed successfully!"