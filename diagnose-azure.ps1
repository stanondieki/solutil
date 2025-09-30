# Azure App Service Diagnostic Tool
Write-Host "Diagnosing Azure Backend Status..." -ForegroundColor Cyan
Write-Host ""

$url = "https://solutilconnect-backend-api-g6g4hhb2eeh7hjep.southafricanorth-01.azurewebsites.net"

# Test 1: Quick ping test
Write-Host "1. Quick connectivity test (5 seconds)..." -ForegroundColor Yellow
try {
    $response = Invoke-WebRequest -Uri $url -TimeoutSec 5 -UseBasicParsing
    Write-Host "   SUCCESS: Backend is reachable - HTTP $($response.StatusCode)" -ForegroundColor Green
} catch {
    Write-Host "   FAILED: Backend not reachable: $($_.Exception.Message)" -ForegroundColor Red
}

Write-Host ""

# Test 2: Extended timeout for cold start
Write-Host "2. Cold start test (90 seconds)..." -ForegroundColor Yellow
Write-Host "   Please wait - Azure free tier apps can take 60+ seconds to wake up..." -ForegroundColor Gray

try {
    $response = Invoke-WebRequest -Uri $url -TimeoutSec 90 -UseBasicParsing
    Write-Host "   SUCCESS: Backend responded after cold start - HTTP $($response.StatusCode)" -ForegroundColor Green
    Write-Host "   INFO: Your app was sleeping and is now awake" -ForegroundColor Yellow
} catch {
    Write-Host "   FAILED: No response after 90 seconds" -ForegroundColor Red
    Write-Host "   INFO: App is likely crashed or stopped" -ForegroundColor Yellow
}

Write-Host ""

# Test 3: DNS check
Write-Host "3. DNS resolution test..." -ForegroundColor Yellow
try {
    $dns = Resolve-DnsName -Name "solutilconnect-backend-api-g6g4hhb2eeh7hjep.southafricanorth-01.azurewebsites.net"
    Write-Host "   ✅ DNS OK - Points to: $($dns[0].IPAddress)" -ForegroundColor Green
} catch {
    Write-Host "   ❌ DNS failed: $($_.Exception.Message)" -ForegroundColor Red
}

Write-Host ""
Write-Host "🎯 NEXT STEPS:" -ForegroundColor Cyan
Write-Host "===============" -ForegroundColor Cyan
Write-Host ""

Write-Host "Go to Azure Portal and check:" -ForegroundColor White
Write-Host "1. 🔍 Search: 'App Services'" -ForegroundColor Yellow
Write-Host "2. 🎯 Click: 'solutilconnect-backend-api-g6g4hhb2eeh7hjep'" -ForegroundColor Yellow
Write-Host "3. 📊 Check: Overview page shows 'Status: Running'" -ForegroundColor Yellow
Write-Host "4. 📝 If stopped: Click 'Start' button" -ForegroundColor Yellow
Write-Host "5. 🔧 If running but failing: Go to 'Configuration' → Set environment variables" -ForegroundColor Yellow
Write-Host "6. 📋 If crashing: Go to Log stream to see error messages" -ForegroundColor Yellow
Write-Host ""
Write-Host "Environment variables needed:" -ForegroundColor White
Write-Host "- JWT_SECRET (for authentication)" -ForegroundColor Gray
Write-Host "- MONGODB_URI (for database)" -ForegroundColor Gray
Write-Host "- NODE_ENV=production" -ForegroundColor Gray
Write-Host ""
Write-Host "📖 See AZURE_ENVIRONMENT_SETUP.md for detailed instructions" -ForegroundColor Cyan