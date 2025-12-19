# Multi-Provider Booking Support Guide

## Overview
This document describes the multi-provider booking feature that allows a single booking to have multiple service providers assigned (e.g., 4 plumbers for a large job).

## How It Works

### Booking Creation
When creating a booking, clients can now specify `providersNeeded` (defaults to 1). This tells the admin how many providers should be assigned to complete the job.

### Admin Provider Assignment
The admin can assign multiple providers to a booking through the Admin Bookings page:

1. Navigate to **Admin Dashboard → Bookings**
2. Click **"Assign Provider"** on any booking
3. The modal shows:
   - **Assignment Progress**: "X/Y Assigned" badge showing current status
   - **Already Assigned Providers**: List with ability to remove individual providers
   - **Available Providers**: Providers that can still be assigned
   - **Slots Remaining**: How many more providers are needed

4. Keep assigning providers until all slots are filled
5. The booking automatically changes to "confirmed" when fully staffed

## Database Schema

### Booking Model Updates
```javascript
// backend/models/Booking.js

// Number of providers needed for this job
providersNeeded: {
  type: Number,
  default: 1,
  min: 1,
  max: 20
},

// Array of assigned providers (new field)
providers: [{
  provider: { type: ObjectId, ref: 'User' },
  service: { type: ObjectId, ref: 'ProviderService' },
  assignedAt: Date,
  assignedBy: { type: ObjectId, ref: 'User' },
  status: { type: String, enum: ['assigned', 'confirmed', 'completed', 'cancelled'] },
  notes: String
}],

// Legacy single provider field (kept for backward compatibility)
provider: { type: ObjectId, ref: 'User' }
```

## API Endpoints

### GET /api/admin/bookings/:id/available-providers
Returns available providers for assignment, showing:
- `providersNeeded` - Total providers required
- `providersAssigned` - Currently assigned count
- `isFullyAssigned` - Boolean if booking is fully staffed
- `slotsRemaining` - How many more providers needed
- `assignedProviders` - List of currently assigned providers
- `matchingProviders` - Available providers with matching service category
- `otherProviders` - Other available providers

### PUT /api/admin/bookings/:id/assign-provider
Assigns a provider to the booking's `providers` array.

**Request Body:**
```json
{
  "providerId": "provider_object_id",
  "serviceId": "service_object_id (optional)",
  "notes": "Assignment notes (optional)"
}
```

**Response:**
```json
{
  "status": "success",
  "message": "Provider John Doe successfully assigned (2/4 providers)",
  "data": {
    "booking": {
      "id": "booking_id",
      "bookingNumber": "BK123456789",
      "status": "pending",
      "providersNeeded": 4,
      "providersAssigned": 2,
      "isFullyAssigned": false,
      "providers": [
        { "id": "...", "name": "Jane Smith", "assignedAt": "..." },
        { "id": "...", "name": "John Doe", "assignedAt": "..." }
      ]
    }
  }
}
```

### PUT /api/admin/bookings/:id/unassign-provider
Removes a provider from the booking.

**Request Body:**
```json
{
  "providerId": "provider_object_id (optional - if omitted, removes all)",
  "reason": "Reason for removal"
}
```

## Frontend Components

### Admin Bookings Page
`frontend/src/app/admin/bookings/page.tsx`

Features:
- **Multi-provider status in table**: Shows "X/Y Assigned" for multi-provider bookings
- **Assignment modal**: 
  - Shows assigned providers with remove buttons
  - Shows progress badge (e.g., "2/4 Assigned")
  - Hides assignment form when fully staffed
  - Shows success message with remaining slots

## Notifications

When a provider is assigned:
1. **Provider receives email**: Notifying them of the new job assignment
2. **Client receives email**: Only when ALL required providers are assigned (booking is fully staffed)

## Business Logic

### Assignment Rules
1. A provider can only be assigned once per booking
2. Providers already booked at the same time slot on other bookings are marked as unavailable
3. Only approved providers can be assigned
4. The first assigned provider is also set as the legacy `provider` field for backward compatibility

### Status Changes
- **Pending → Pending**: When partial providers are assigned
- **Pending → Confirmed**: When all required providers are assigned
- **Confirmed → Pending**: When a provider is removed and slots become unfilled

## Example Usage

### Scenario: Booking needs 4 plumbers

1. Client creates booking with `providersNeeded: 4`
2. Booking shows as "Pending" with "⚠️ 0/4 Assigned"
3. Admin assigns first plumber → "⚡ 1/4 Assigned"
4. Admin assigns second plumber → "⚡ 2/4 Assigned"
5. Admin assigns third plumber → "⚡ 3/4 Assigned"
6. Admin assigns fourth plumber → "✅ 4/4 Assigned", status changes to "Confirmed"
7. Client receives notification that booking is confirmed with all providers

## Backward Compatibility

The system maintains backward compatibility:
- The legacy `provider` field is still populated with the first assigned provider
- Single-provider bookings work exactly as before
- Existing bookings without `providersNeeded` default to 1
