# Fix Azure Backend Configuration for Full Functionality
Write-Host "🔧 Fixing Azure Backend Configuration..." -ForegroundColor Green

$appName = "solutilconnect-backend-api"
$resourceGroup = "solutil-rg"

# Essential environment variables - set one by one to avoid CLI issues
Write-Host "Setting critical environment variables..." -ForegroundColor Yellow

# Set NODE_ENV
az webapp config appsettings set --name $appName --resource-group $resourceGroup --settings NODE_ENV=production --output none
Write-Host "✅ NODE_ENV set to production" -ForegroundColor Green

# Set MONGODB_URI (simplified without problematic characters)
az webapp config appsettings set --name $appName --resource-group $resourceGroup --settings "MONGODB_URI=mongodb+srv://solutilconnect_db_user:VaZbj1WZvT0gyUp0@solutilconnect.7o4tjqy.mongodb.net/solutilconnect_db" --output none
Write-Host "✅ MONGODB_URI set" -ForegroundColor Green

# Set JWT_SECRET
az webapp config appsettings set --name $appName --resource-group $resourceGroup --settings "JWT_SECRET=solutil_production_jwt_secret_2025_very_long_secure_key_for_authentication" --output none
Write-Host "✅ JWT_SECRET set" -ForegroundColor Green

# Set CLIENT_URL for CORS
az webapp config appsettings set --name $appName --resource-group $resourceGroup --settings "CLIENT_URL=https://solutil-frontend.vercel.app" --output none
Write-Host "✅ CLIENT_URL set" -ForegroundColor Green

# Set additional CORS origins
az webapp config appsettings set --name $appName --resource-group $resourceGroup --settings "CORS_ORIGIN=https://solutil-frontend.vercel.app" --output none
Write-Host "✅ CORS_ORIGIN set" -ForegroundColor Green

# Set Cloudinary settings
az webapp config appsettings set --name $appName --resource-group $resourceGroup --settings "CLOUDINARY_CLOUD_NAME=dhniojmt6" --output none
az webapp config appsettings set --name $appName --resource-group $resourceGroup --settings "CLOUDINARY_API_KEY=362978357312836" --output none  
az webapp config appsettings set --name $appName --resource-group $resourceGroup --settings "CLOUDINARY_API_SECRET=L6yXQNbx1nIpG7k4FhrDK3DdjF4" --output none
Write-Host "✅ Cloudinary settings configured" -ForegroundColor Green

# Set additional required variables
az webapp config appsettings set --name $appName --resource-group $resourceGroup --settings "JWT_EXPIRE=7d" --output none
az webapp config appsettings set --name $appName --resource-group $resourceGroup --settings "PORT=8000" --output none
Write-Host "✅ Additional settings configured" -ForegroundColor Green

Write-Host "`n🔄 Restarting application..." -ForegroundColor Yellow
az webapp restart --name $appName --resource-group $resourceGroup --output none

Write-Host "⏳ Waiting 60 seconds for full restart..." -ForegroundColor Cyan
Start-Sleep -Seconds 60

Write-Host "`n🧪 Testing backend health..." -ForegroundColor Magenta
try {
    $response = Invoke-WebRequest -Uri "https://solutilconnect-backend-api-g6g4hhb2eeh7hjep.southafricanorth-01.azurewebsites.net/api/health" -UseBasicParsing -TimeoutSec 30
    Write-Host "🎉 SUCCESS! Backend is responding!" -ForegroundColor Green
    Write-Host "Status: $($response.StatusCode)" -ForegroundColor White
    Write-Host "Response: $($response.Content)" -ForegroundColor White
} catch {
    Write-Host "❌ Still not responding: $($_.Exception.Message)" -ForegroundColor Red
    Write-Host "💡 Let's check logs..." -ForegroundColor Yellow
}

Write-Host "`n🎯 Configuration complete! Test login/register now." -ForegroundColor Green