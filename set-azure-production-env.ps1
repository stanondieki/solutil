# Set Azure Production Environment Variables
Write-Host "Setting Azure Production Environment Variables..." -ForegroundColor Green

$appName = "solutilconnect-backend-api"
$resourceGroup = "DefaultResourceGroup-JOH"

# Essential Environment Variables for Backend to Start
$env_vars = @{
    "NODE_ENV" = "production"
    "PORT" = "8000"
    "WEBSITE_NODE_DEFAULT_VERSION" = "22.17.0"
    "SCM_DO_BUILD_DURING_DEPLOYMENT" = "true"
    
    # Database - Production MongoDB
    "MONGODB_URI" = "mongodb+srv://solutilconnect_db_user:VaZbj1WZvT0gyUp0@solutilconnect.7o4tjqy.mongodb.net/?retryWrites=true&w=majority&appName=solutilconnect"
    "MONGODB_DB_NAME" = "solutilconnect_db"
    
    # JWT - Using a secure production secret
    "JWT_SECRET" = "solutil_super_secure_production_jwt_secret_key_2025_make_it_very_long_and_random_for_security"
    "JWT_EXPIRE" = "7d"
    
    # Frontend URL - Your Vercel deployment
    "CLIENT_URL" = "https://solutil-frontend.vercel.app"
    "FRONTEND_URL" = "https://solutil-frontend.vercel.app"
    "CORS_ORIGIN" = "https://solutil-frontend.vercel.app"
    
    # Cloudinary - Your production settings
    "CLOUDINARY_CLOUD_NAME" = "dhniojmt6"
    "CLOUDINARY_API_KEY" = "362978357312836"
    "CLOUDINARY_API_SECRET" = "L6yXQNbx1nIpG7k4FhrDK3DdjF4"
    
    # Email Configuration
    "USE_REAL_SMTP" = "true"
    "EMAIL_USER" = "infosolu31@gmail.com"
    "EMAIL_PASS" = "tdnt dutk urnw qxxc"
    "SMTP_HOST" = "smtp.gmail.com"
    "SMTP_PORT" = "587"
    "SMTP_USER" = "infosolu31@gmail.com"
    "SMTP_PASS" = "tdnt dutk urnw qxxc"
    
    # Security Settings
    "BCRYPT_ROUNDS" = "12"
    "RATE_LIMIT_WINDOW" = "15"
    "RATE_LIMIT_MAX" = "100"
    
    # File Upload Settings
    "MAX_FILE_SIZE" = "5242880"
    "ALLOWED_FILE_TYPES" = "image/jpeg,image/png,image/webp,application/pdf"
    
    # Socket.IO
    "SOCKET_CORS_ORIGIN" = "https://solutil-frontend.vercel.app"
}

Write-Host "Setting environment variables..." -ForegroundColor Yellow

foreach ($key in $env_vars.Keys) {
    $value = $env_vars[$key]
    Write-Host "Setting $key..." -ForegroundColor Cyan
    
    try {
        az webapp config appsettings set --name $appName --resource-group $resourceGroup --settings "$key=$value" --output none
        Write-Host "✅ $key set successfully" -ForegroundColor Green
    }
    catch {
        Write-Host "❌ Failed to set $key" -ForegroundColor Red
        Write-Host $_.Exception.Message -ForegroundColor Red
    }
}

Write-Host "`n🔄 Restarting app service..." -ForegroundColor Yellow
az webapp restart --name $appName --resource-group $resourceGroup --output none

Write-Host "✅ Environment variables configured!" -ForegroundColor Green
Write-Host "⏳ Waiting 45 seconds for app to fully restart..." -ForegroundColor Yellow
Start-Sleep -Seconds 45

Write-Host "`n🧪 Testing backend health..." -ForegroundColor Cyan
try {
    $response = Invoke-WebRequest -Uri "https://solutilconnect-backend-api-g6g4hhb2eeh7hjep.southafricanorth-01.azurewebsites.net/api/health" -UseBasicParsing -TimeoutSec 30
    Write-Host "✅ Backend is responding! Status: $($response.StatusCode)" -ForegroundColor Green
    Write-Host $response.Content -ForegroundColor White
}
catch {
    Write-Host "⚠️  Backend still starting or has issues: $($_.Exception.Message)" -ForegroundColor Yellow
    Write-Host "💡 Try testing again in a few minutes" -ForegroundColor Cyan
}

Write-Host "`n🎯 Configuration complete! Backend should be working now." -ForegroundColor Green