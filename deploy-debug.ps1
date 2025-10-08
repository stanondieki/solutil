# Deploy Backend Debug Version to Azure
Write-Host "🚀 DEPLOYING DEBUG VERSION TO AZURE" -ForegroundColor Cyan

# Create deployment package with debug logs
Write-Host "📦 Creating deployment package..." -ForegroundColor Yellow

$deployDir = "deploy-debug-$(Get-Date -Format 'yyyyMMdd-HHmmss')"
New-Item -ItemType Directory -Path $deployDir -Force

# Copy backend files (excluding logs and node_modules)
Copy-Item -Path "backend/*" -Destination "$deployDir/" -Recurse -Force -Exclude @("logs", "node_modules", "*.zip")

# Create deployment zip
$zipPath = "backend-debug-deploy.zip"
Compress-Archive -Path "$deployDir/*" -DestinationPath $zipPath -Force

# Clean up temp directory
Remove-Item -Path $deployDir -Recurse -Force

Write-Host "✅ Created deployment package: $zipPath" -ForegroundColor Green

# Deploy to Azure (using the known app details)
Write-Host "🚀 Deploying to Azure..." -ForegroundColor Cyan

# Deploy using Azure CLI
az webapp deployment source config-zip --resource-group rg-solutilconnect --name solutilconnect-backend-api --src $zipPath

if ($LASTEXITCODE -eq 0) {
    Write-Host "✅ DEPLOYMENT SUCCESSFUL!" -ForegroundColor Green
    Write-Host "🔍 Debug logs are now active. Check console output during booking attempts." -ForegroundColor Yellow
} else {
    Write-Host "❌ Deployment failed. Exit code: $LASTEXITCODE" -ForegroundColor Red
    Write-Host "📋 Manual deployment command:" -ForegroundColor Yellow
    Write-Host "az webapp deployment source config-zip --resource-group rg-solutilconnect --name solutilconnect-backend-api --src $zipPath" -ForegroundColor White
}
}