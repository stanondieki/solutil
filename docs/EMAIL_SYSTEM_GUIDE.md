# Email System Configuration Guide

## Overview
Your SolUtil platform now has a comprehensive email system integrated with service creation, booking workflows, and user notifications. This guide will help you configure SMTP settings and test the email functionality.

## SMTP Configuration

### Environment Variables
Add the following variables to your `.env` file in both the root directory and the `backend` directory:

```env
# SMTP Configuration
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password
SMTP_FROM=your-email@gmail.com
SMTP_FROM_NAME=SolUtil Team

# Client URL for email links
CLIENT_URL=http://localhost:3000
```

### Supported Email Providers

#### 1. Gmail
```env
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-gmail@gmail.com
SMTP_PASS=your-app-password
```

**Setup Steps:**
1. Enable 2-Factor Authentication in your Google Account
2. Go to Google Account Settings > Security > App passwords
3. Generate an app password for "Mail"
4. Use the generated password (not your regular password)

#### 2. Outlook/Hotmail
```env
SMTP_HOST=smtp-mail.outlook.com
SMTP_PORT=587
SMTP_USER=your-email@outlook.com
SMTP_PASS=your-password
```

#### 3. Yahoo Mail
```env
SMTP_HOST=smtp.mail.yahoo.com
SMTP_PORT=587
SMTP_USER=your-email@yahoo.com
SMTP_PASS=your-app-password
```

#### 4. Custom SMTP Server
```env
SMTP_HOST=your-smtp-server.com
SMTP_PORT=587
SMTP_USER=your-username
SMTP_PASS=your-password
```

## Email Templates Included

### 1. Welcome Email
- Sent when new users register
- Contains platform overview and getting started tips
- Professional branding with your logo

### 2. Service Creation Confirmation
- Sent to providers when they create a new service
- Includes service details and management links
- Confirmation of service status (active/inactive)

### 3. Service Update Notification
- Sent when providers make significant changes to services
- Triggered by price changes, title updates, or status changes
- Includes updated service information

### 4. Booking Confirmation
- Sent to both clients and providers when a booking is created
- Contains booking details, schedule, and contact information
- Different templates for clients vs providers

### 5. Booking Status Updates
- Sent when booking status changes (confirmed, in-progress, completed, etc.)
- Includes status reason and any notes from the other party
- Links to view full booking details

## Testing the Email System

### 1. Run the Email Integration Test
```bash
cd d:\projects\solutil
node test-email-integration.js
```

This will test all email templates with sample data.

### 2. Admin Email Testing Interface
Access the admin panel email testing:
- Navigate to your admin dashboard
- Go to Email Management section
- Test individual email templates
- Configure SMTP settings via web interface

### 3. Manual Testing Through API

#### Test Service Creation Email
```bash
curl -X POST http://localhost:5000/api/admin/email/test-service-created \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_ADMIN_TOKEN" \
  -d '{
    "email": "test@example.com",
    "serviceData": {
      "providerName": "Test Provider",
      "serviceTitle": "Test Service",
      "category": "Cleaning",
      "priceDisplay": "KSh 2,500"
    }
  }'
```

## Integration Points

### Service Management
- **Service Creation**: Email sent when provider creates a service
- **Service Updates**: Email sent for significant changes (price, title, status)
- **Location**: `backend/routes/providerServices.js`

### Booking Workflow
- **Booking Creation**: Confirmation emails to both client and provider
- **Status Updates**: Notifications when booking status changes
- **Location**: `backend/controllers/bookingController.js`

### User Registration
- **Welcome Email**: Sent to new users upon registration
- **Location**: Can be integrated into your auth registration flow

## Troubleshooting

### Common Issues

#### 1. "Invalid login" Error
- **Cause**: Incorrect SMTP credentials
- **Solution**: Verify username/password, enable app passwords for Gmail

#### 2. "Connection timeout" Error
- **Cause**: Incorrect SMTP host or port
- **Solution**: Check provider-specific SMTP settings

#### 3. "Authentication failed" Error
- **Cause**: 2FA enabled but using regular password
- **Solution**: Generate and use app-specific password

#### 4. Emails going to spam
- **Cause**: Sender reputation or missing SPF/DKIM records
- **Solution**: Use a verified business email domain

### Debug Mode
Set `NODE_ENV=development` to see detailed SMTP logs:

```env
NODE_ENV=development
```

## Email Analytics

### Admin Dashboard Features
- View email delivery status
- Track email open rates (if configured with tracking pixels)
- Monitor SMTP connection health
- Test email templates with custom data

### Logging
All email operations are logged to:
- `backend/logs/combined.log` - General email activity
- `backend/logs/error.log` - Email delivery failures

## Security Best Practices

1. **Use App Passwords**: Never use your main email password
2. **Environment Variables**: Never commit SMTP credentials to version control
3. **Rate Limiting**: Implement email rate limiting to prevent spam
4. **Validation**: Validate email addresses before sending
5. **Error Handling**: Graceful handling of email failures (don't break user flows)

## Production Deployment

### Recommended Email Services for Production

1. **SendGrid** - Reliable transactional emails
2. **Mailgun** - Developer-friendly email service
3. **Amazon SES** - Cost-effective for high volume
4. **PostMark** - Focus on deliverability

### Configuration for Production
```env
# Production SMTP (example with SendGrid)
SMTP_HOST=smtp.sendgrid.net
SMTP_PORT=587
SMTP_USER=apikey
SMTP_PASS=your-sendgrid-api-key
SMTP_FROM=noreply@yourdomain.com
SMTP_FROM_NAME=SolUtil
CLIENT_URL=https://yourdomain.com
```

## Support

If you encounter issues with the email system:

1. Check the troubleshooting section above
2. Review logs in `backend/logs/`
3. Test with the provided test script
4. Verify environment variables are correctly set
5. Ensure your email provider allows SMTP access

The email system is designed to fail gracefully - if emails cannot be sent, the core application functionality will continue to work normally.