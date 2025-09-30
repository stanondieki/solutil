# Set all essential Azure App Service environment variables
Write-Host "Setting essential environment variables for Azure App Service..."

# Set JWT_SECRET
az webapp config appsettings set --name solutilconnect-backend-api --resource-group solutil-rg --settings "JWT_SECRET=your_super_secret_jwt_key_here_make_it_very_long_and_secure_production_key_123456789"

# Set MongoDB configuration
az webapp config appsettings set --name solutilconnect-backend-api --resource-group solutil-rg --settings "MONGODB_URI=mongodb+srv://solutilconnect_db_user:VaZbj1WZvT0gyUp0@solutilconnect.7o4tjqy.mongodb.net/solutilconnect_db?retryWrites=true&w=majority"

az webapp config appsettings set --name solutilconnect-backend-api --resource-group solutil-rg --settings "MONGODB_DB_NAME=solutilconnect_db"

# Set basic configuration
az webapp config appsettings set --name solutilconnect-backend-api --resource-group solutil-rg --settings "NODE_ENV=production"
az webapp config appsettings set --name solutilconnect-backend-api --resource-group solutil-rg --settings "PORT=8000"
az webapp config appsettings set --name solutilconnect-backend-api --resource-group solutil-rg --settings "JWT_EXPIRE=7d"

# Set email configuration
az webapp config appsettings set --name solutilconnect-backend-api --resource-group solutil-rg --settings "USE_REAL_SMTP=true"
az webapp config appsettings set --name solutilconnect-backend-api --resource-group solutil-rg --settings "EMAIL_USER=infosolu31@gmail.com"
az webapp config appsettings set --name solutilconnect-backend-api --resource-group solutil-rg --settings "EMAIL_PASS=tdnt dutk urnw qxxc"
az webapp config appsettings set --name solutilconnect-backend-api --resource-group solutil-rg --settings "SMTP_HOST=smtp.gmail.com"
az webapp config appsettings set --name solutilconnect-backend-api --resource-group solutil-rg --settings "SMTP_PORT=587"
az webapp config appsettings set --name solutilconnect-backend-api --resource-group solutil-rg --settings "SMTP_USER=infosolu31@gmail.com"
az webapp config appsettings set --name solutilconnect-backend-api --resource-group solutil-rg --settings "SMTP_PASS=tdnt dutk urnw qxxc"

Write-Host "Environment variables set. Restarting app service..."

# Restart the app service
az webapp restart --name solutilconnect-backend-api --resource-group solutil-rg

Write-Host "App service restarted. Waiting 30 seconds for full startup..."
Start-Sleep 30

Write-Host "Configuration complete!"