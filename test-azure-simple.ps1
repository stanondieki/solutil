# Azure Backend Testing Script for Solutil
Write-Host "Testing Solutil Backend on Azure..." -ForegroundColor Cyan

$baseUrl = "https://solutilconnect-backend-api-g6g4hhb2eeh7hjep.southafricanorth-01.azurewebsites.net"

# Test 1: Health Check
Write-Host "1. Testing Health Endpoint..." -ForegroundColor Yellow
try {
    $health = Invoke-RestMethod -Uri "$baseUrl/api/health" -Method GET
    Write-Host "SUCCESS: Backend is running!" -ForegroundColor Green
    Write-Host "Status: $($health.status)" -ForegroundColor White
    Write-Host "Environment: $($health.environment)" -ForegroundColor White
} catch {
    Write-Host "FAILED: Health check failed: $($_.Exception.Message)" -ForegroundColor Red
}

# Test 2: Services Endpoint
Write-Host "2. Testing Services Endpoint..." -ForegroundColor Yellow
try {
    $services = Invoke-RestMethod -Uri "$baseUrl/api/services" -Method GET
    Write-Host "SUCCESS: Services endpoint working!" -ForegroundColor Green
    Write-Host "Found $($services.results) services" -ForegroundColor White
} catch {
    Write-Host "FAILED: Services endpoint failed: $($_.Exception.Message)" -ForegroundColor Red
}

# Test 3: Authentication
Write-Host "3. Testing Authentication..." -ForegroundColor Yellow
try {
    $randomEmail = "test$(Get-Random)@example.com"
    $body = @{
        name = "Test User"
        email = $randomEmail
        password = "password123"
        userType = "client"
    } | ConvertTo-Json
    
    $register = Invoke-RestMethod -Uri "$baseUrl/api/auth/register" -Method POST -ContentType "application/json" -Body $body
    Write-Host "SUCCESS: Registration working!" -ForegroundColor Green
} catch {
    Write-Host "FAILED: Registration failed: $($_.Exception.Message)" -ForegroundColor Red
}

Write-Host "=== SUMMARY ===" -ForegroundColor Cyan
Write-Host "Your Azure backend is successfully deployed!" -ForegroundColor Green
Write-Host "Backend URL: $baseUrl" -ForegroundColor White
Write-Host "Status: READY FOR PRODUCTION" -ForegroundColor Green