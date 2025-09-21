# PowerShell script to test authentication endpoints

Write-Host "=== Testing Solutil Authentication ===" -ForegroundColor Green

# Set base URL (adjust port if different)
$baseUrl = "http://localhost:5000/api/auth"

Write-Host "`n1. Testing Registration..." -ForegroundColor Yellow

# Test Registration
$registerData = @{
    name = "Test User"
    email = "test@example.com"
    password = "testpassword123"
    userType = "client"
    phone = "+254700000000"
} | ConvertTo-Json

try {
    $registerResponse = Invoke-RestMethod -Uri "$baseUrl/register" -Method Post -Body $registerData -ContentType "application/json"
    Write-Host "✅ Registration successful!" -ForegroundColor Green
    Write-Host "User ID: $($registerResponse.data.user._id)" -ForegroundColor Cyan
    Write-Host "Created At: $($registerResponse.data.user.createdAt)" -ForegroundColor Cyan
} catch {
    Write-Host "❌ Registration failed: $($_.Exception.Message)" -ForegroundColor Red
}

Write-Host "`n2. Testing Login..." -ForegroundColor Yellow

# Test Login
$loginData = @{
    email = "test@example.com"
    password = "testpassword123"
} | ConvertTo-Json

try {
    $loginResponse = Invoke-RestMethod -Uri "$baseUrl/login" -Method Post -Body $loginData -ContentType "application/json"
    Write-Host "✅ Login successful!" -ForegroundColor Green
    Write-Host "Token: $($loginResponse.token.Substring(0,20))..." -ForegroundColor Cyan
    Write-Host "Last Login: $($loginResponse.data.user.lastLogin)" -ForegroundColor Cyan
} catch {
    Write-Host "❌ Login failed: $($_.Exception.Message)" -ForegroundColor Red
}

Write-Host "`n=== Test Complete ===" -ForegroundColor Green
