# Deploy Auto-Activation Fix to Azure
# This script deploys the updated ProviderServiceManager that handles the correct data structure

Write-Host "🚀 DEPLOYING AUTO-ACTIVATION FIX TO AZURE" -ForegroundColor Cyan

# 1. Prepare deployment files
Write-Host "`n📦 Preparing deployment files..." -ForegroundColor Yellow
$deployFiles = @(
    "backend/utils/providerServiceManager.js",
    "backend/routes/admin/providers.js"
)

foreach ($file in $deployFiles) {
    if (Test-Path $file) {
        Write-Host "✅ Found: $file" -ForegroundColor Green
    } else {
        Write-Host "❌ Missing: $file" -ForegroundColor Red
        exit 1
    }
}

# 2. Check if we have Azure CLI
try {
    az --version | Out-Null
    Write-Host "✅ Azure CLI is available" -ForegroundColor Green
} catch {
    Write-Host "❌ Azure CLI not found. Please install Azure CLI first." -ForegroundColor Red
    exit 1
}

# 3. Deploy using zip deployment
Write-Host "`n🔄 Creating deployment package..." -ForegroundColor Yellow

# Create a temporary deployment directory
$deployDir = "deploy-temp-$(Get-Date -Format 'yyyyMMdd-HHmmss')"
New-Item -ItemType Directory -Path $deployDir -Force

# Copy backend files
Copy-Item -Path "backend/*" -Destination "$deployDir/" -Recurse -Force

# Create deployment zip
$zipPath = "auto-activation-fix-deploy.zip"
Compress-Archive -Path "$deployDir/*" -DestinationPath $zipPath -Force

# Clean up temp directory
Remove-Item -Path $deployDir -Recurse -Force

Write-Host "✅ Created deployment package: $zipPath" -ForegroundColor Green

# 4. Deploy to Azure
Write-Host "`n🚀 Deploying to Azure App Service..." -ForegroundColor Yellow
Write-Host "Please run this command to deploy:" -ForegroundColor Cyan
Write-Host "az webapp deployment source config-zip --resource-group YOUR_RESOURCE_GROUP --name YOUR_APP_NAME --src $zipPath" -ForegroundColor White

# 5. Post-deployment verification command
Write-Host "`n🧪 After deployment, test with a new provider approval:" -ForegroundColor Yellow
Write-Host "The auto-activation should now work for newly approved providers!" -ForegroundColor Green

Write-Host "`n✅ DEPLOYMENT PACKAGE READY" -ForegroundColor Cyan
Write-Host "The updated ProviderServiceManager will now:" -ForegroundColor White
Write-Host "  - Handle providerProfile.skills and providerProfile.services" -ForegroundColor White
Write-Host "  - Create services automatically when admin approves providers" -ForegroundColor White
Write-Host "  - Work with both new and legacy data structures" -ForegroundColor White