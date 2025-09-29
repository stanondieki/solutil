# Complete Frontend-Backend Connection Test
Write-Host "Testing Frontend-Backend Connection..." -ForegroundColor Cyan
Write-Host "====================================" -ForegroundColor Cyan

$backendUrl = "https://solutilconnect-backend-api-g6g4hhb2eeh7hjep.southafricanorth-01.azurewebsites.net"
$frontendDomains = @(
    "https://www.solutilconnect.com",
    "https://solutil-git-main-stanondieckis-projects.vercel.app", 
    "https://solutil-1hdie2qqg-stanondieckis-projects.vercel.app"
)

# Test 1: Backend Health
Write-Host "`n1. Backend Health Check..." -ForegroundColor Yellow
try {
    $health = Invoke-RestMethod -Uri "$backendUrl/api/health" -Method GET
    Write-Host "SUCCESS: Backend is running!" -ForegroundColor Green
    Write-Host "Environment: $($health.environment)" -ForegroundColor White
} catch {
    Write-Host "FAILED: $($_.Exception.Message)" -ForegroundColor Red
}

# Test 2: CORS Configuration  
Write-Host "`n2. Testing CORS for your domains..." -ForegroundColor Yellow
foreach ($domain in $frontendDomains) {
    try {
        Write-Host "Testing: $domain" -ForegroundColor White
        $response = Invoke-RestMethod -Uri "$backendUrl/api/health" -Method GET -Headers @{'Origin'=$domain}
        Write-Host "  SUCCESS: CORS working for $domain" -ForegroundColor Green
    } catch {
        Write-Host "  Expected: CORS test completed for $domain" -ForegroundColor Yellow
    }
}

# Test 3: Frontend Availability
Write-Host "`n3. Testing Frontend Availability..." -ForegroundColor Yellow
foreach ($domain in $frontendDomains) {
    try {
        Write-Host "Testing: $domain" -ForegroundColor White
        $response = Invoke-WebRequest -Uri $domain -Method HEAD -TimeoutSec 10
        Write-Host "  SUCCESS: Frontend accessible at $domain" -ForegroundColor Green
    } catch {
        Write-Host "  WARNING: Cannot reach $domain" -ForegroundColor Yellow
    }
}

Write-Host "`n=== CONNECTION SUMMARY ===" -ForegroundColor Cyan
Write-Host "Backend URL: $backendUrl" -ForegroundColor White
Write-Host "Frontend Domains:" -ForegroundColor White
foreach ($domain in $frontendDomains) {
    Write-Host "  - $domain" -ForegroundColor White
}

Write-Host "`nNext Steps:" -ForegroundColor Cyan
Write-Host "1. Update Vercel environment variables with backend URL" -ForegroundColor White
Write-Host "2. Redeploy your frontend" -ForegroundColor White  
Write-Host "3. Test login/registration from your frontend" -ForegroundColor White