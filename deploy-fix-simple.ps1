# Deploy Auto-Activation Fix to Azure
Write-Host "🚀 DEPLOYING AUTO-ACTIVATION FIX TO AZURE" -ForegroundColor Cyan

# Create deployment package
Write-Host "📦 Creating deployment package..." -ForegroundColor Yellow

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
Write-Host ""
Write-Host "🚀 To deploy to Azure, run:" -ForegroundColor Cyan
Write-Host "az webapp deployment source config-zip --resource-group YOUR_RESOURCE_GROUP --name YOUR_APP_NAME --src $zipPath" -ForegroundColor White
Write-Host ""
Write-Host "✅ The updated system will auto-create services when providers are approved!" -ForegroundColor Green