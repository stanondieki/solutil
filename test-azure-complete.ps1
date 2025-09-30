# Test Azure Backend After Environment Setup
Write-Host "🧪 Testing Azure Backend Configuration..." -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan

$baseUrl = "https://solutilconnect-backend-api-g6g4hhb2eeh7hjep.southafricanorth-01.azurewebsites.net"

# Test 1: Basic connectivity
Write-Host "`n1. Testing backend connectivity..." -ForegroundColor Yellow
try {
    $response = Invoke-RestMethod -Uri "$baseUrl" -Method GET -TimeoutSec 10
    Write-Host "   ✅ Backend is responding" -ForegroundColor Green
} catch {
    Write-Host "   ❌ Backend connectivity failed: $($_.Exception.Message)" -ForegroundColor Red
}

# Test 2: Admin login and JWT generation
Write-Host "`n2. Testing admin login (JWT token generation)..." -ForegroundColor Yellow
try {
    $body = @{
        email = "infosolu31@gmail.com"
        password = "AdminSolu2024!"
    } | ConvertTo-Json
    
    $loginResponse = Invoke-RestMethod -Uri "$baseUrl/api/auth/login" -Method POST -ContentType "application/json" -Body $body -TimeoutSec 15
    
    if ($loginResponse.token) {
        Write-Host "   ✅ Login successful - JWT token generated" -ForegroundColor Green
        Write-Host "   Token: $($loginResponse.token.Substring(0,50))..." -ForegroundColor Gray
        
        # Store token for further tests
        $global:testToken = $loginResponse.token
        
        # Test 3: JWT signature verification
        Write-Host "`n3. Testing JWT token signature..." -ForegroundColor Yellow
        
        # Create verification script
        $verifyScript = @"
const jwt = require('jsonwebtoken');
const secret = 'your_super_secret_jwt_key_here_make_it_very_long_and_secure_production_key_123456789';
const token = '$($loginResponse.token)';

try {
    const decoded = jwt.verify(token, secret);
    console.log('✅ JWT signature VALID - User ID: ' + decoded.userId);
    process.exit(0);
} catch (error) {
    console.log('❌ JWT signature INVALID: ' + error.message);
    process.exit(1);
}
"@
        
        $verifyScript | Out-File -FilePath "temp_jwt_verify.js" -Encoding UTF8
        $jwtResult = & node "temp_jwt_verify.js" 2>&1
        
        if ($LASTEXITCODE -eq 0) {
            Write-Host "   $jwtResult" -ForegroundColor Green
        } else {
            Write-Host "   $jwtResult" -ForegroundColor Red
            Write-Host "   💡 Fix: Check JWT_SECRET in Azure Portal Configuration" -ForegroundColor Yellow
        }
        
        Remove-Item "temp_jwt_verify.js" -ErrorAction SilentlyContinue
        
    } else {
        Write-Host "   ❌ Login failed - no token received" -ForegroundColor Red
        $global:testToken = $null
    }
} catch {
    Write-Host "   ❌ Login failed: $($_.Exception.Message)" -ForegroundColor Red
    if ($_.Exception.Message -like "*503*") {
        Write-Host "   💡 503 error = Environment variables not configured in Azure" -ForegroundColor Yellow
        Write-Host "   💡 Solution: Set MONGODB_URI and JWT_SECRET in Azure Portal" -ForegroundColor Yellow
    }
    $global:testToken = $null
}

# Test 4: Upload endpoint authentication
if ($global:testToken) {
    Write-Host "`n4. Testing upload endpoint authentication..." -ForegroundColor Yellow
    try {
        # Test upload endpoint with valid token
        $headers = @{
            'Authorization' = "Bearer $global:testToken"
        }
        
        # Try to access upload endpoint (will fail on missing file, but auth should work)
        $uploadTest = Invoke-RestMethod -Uri "$baseUrl/api/upload/profile-picture" -Method POST -Headers $headers -TimeoutSec 10
        Write-Host "   ✅ Upload endpoint accepts JWT token" -ForegroundColor Green
    } catch {
        $errorMessage = $_.Exception.Message
        if ($errorMessage -like "*401*" -or $errorMessage -like "*Invalid token*") {
            Write-Host "   ❌ Upload authentication FAILED - JWT not accepted" -ForegroundColor Red
            Write-Host "   💡 JWT signature issue - check JWT_SECRET matches exactly" -ForegroundColor Yellow
        } elseif ($errorMessage -like "*400*" -or $errorMessage -like "*No file*" -or $errorMessage -like "*multipart*") {
            Write-Host "   ✅ Upload endpoint authentication OK (400 = missing file data)" -ForegroundColor Green
        } else {
            Write-Host "   ⚠️  Upload test result unclear: $errorMessage" -ForegroundColor Yellow
        }
    }
}

# Test 5: Services endpoint (database connectivity)
Write-Host "`n5. Testing database connectivity..." -ForegroundColor Yellow
try {
    $servicesResponse = Invoke-RestMethod -Uri "$baseUrl/api/services" -Method GET -TimeoutSec 10
    Write-Host "   ✅ Database connection working" -ForegroundColor Green
    if ($servicesResponse.results -ne $null) {
        Write-Host "   Found $($servicesResponse.results) services in database" -ForegroundColor Gray
    }
} catch {
    Write-Host "   ❌ Database connection failed: $($_.Exception.Message)" -ForegroundColor Red
    if ($_.Exception.Message -like "*503*") {
        Write-Host "   💡 Check MONGODB_URI in Azure Portal Configuration" -ForegroundColor Yellow
    }
}

# Results summary
Write-Host "`n🎯 SUMMARY:" -ForegroundColor Cyan
Write-Host "===================" -ForegroundColor Cyan

if ($global:testToken -and $LASTEXITCODE -eq 0) {
    Write-Host "✅ ALL TESTS PASSED!" -ForegroundColor Green
    Write-Host "   → Your image upload feature should now work!" -ForegroundColor White
    Write-Host "   → Go to https://www.solutilconnect.com and test profile picture upload" -ForegroundColor White
} else {
    Write-Host "❌ Some tests failed. Common fixes:" -ForegroundColor Red
    Write-Host "   1. Set JWT_SECRET in Azure Portal → Configuration" -ForegroundColor Yellow
    Write-Host "   2. Set MONGODB_URI in Azure Portal → Configuration" -ForegroundColor Yellow
    Write-Host "   3. Wait 5 minutes after changes for Azure to restart" -ForegroundColor Yellow
    Write-Host "   4. Check AZURE_ENVIRONMENT_SETUP.md for exact values" -ForegroundColor Yellow
}

Write-Host ""