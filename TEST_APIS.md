# Test Your Live Booking System APIs

## Service Discovery APIs (No Auth Required)
curl http://localhost:5000/api/provider-services/public

curl http://localhost:5000/api/provider-services/public/electrical

curl http://localhost:5000/api/provider-services/public/plumbing

## Test Booking Creation (Requires Auth Token)
curl -X POST http://localhost:5000/api/bookings \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -d '{
    "serviceId": "ACTUAL_SERVICE_ID_FROM_YOUR_DB",
    "scheduledDate": "2025-10-05",
    "scheduledTime": "10:00", 
    "location": "Nairobi, Kenya",
    "paymentMethod": "mpesa",
    "specialInstructions": "Test booking from API"
  }'

## Check All Available Services
curl http://localhost:5000/api/provider-services

## Get Specific Service Details  
curl http://localhost:5000/api/provider-services/SERVICE_ID