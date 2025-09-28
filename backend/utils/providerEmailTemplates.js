// Provider Email Templates
const providerEmailTemplates = {
  welcome: {
    subject: 'Welcome to Solutil - Complete Your Provider Setup',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="text-align: center; margin-bottom: 30px;">
          <h1 style="color: #2563eb;">Welcome to Solutil!</h1>
          <p style="color: #666; font-size: 18px;">You're almost ready to start earning</p>
        </div>
        
        <div style="background-color: #f8fafc; border-radius: 8px; padding: 20px; margin-bottom: 20px;">
          <h2 style="color: #1e40af; margin-top: 0;">Next Steps to Get Approved</h2>
          <ol style="color: #374151; line-height: 1.6;">
            <li><strong>Complete Your Onboarding:</strong> Upload required documents and complete your profile</li>
            <li><strong>Document Review:</strong> Our team will verify your documents (2-3 business days)</li>
            <li><strong>Start Earning:</strong> Once approved, you can receive bookings from customers</li>
          </ol>
        </div>
        
        <div style="text-align: center; margin: 30px 0;">
          <a href="{{completeOnboardingUrl}}" style="background-color: #10b981; color: white; padding: 14px 28px; text-decoration: none; border-radius: 8px; font-weight: bold; display: inline-block;">
            Complete Your Setup
          </a>
        </div>
        
        <div style="background-color: #ecfccb; border-left: 4px solid #65a30d; padding: 15px; margin: 20px 0;">
          <h3 style="color: #365314; margin-top: 0;">Required Documents:</h3>
          <ul style="color: #374151; margin: 0;">
            <li>National ID or Passport</li>
            <li>Business License</li>
            <li>Professional Certificate</li>
            <li>Good Conduct Certificate from DCI</li>
          </ul>
        </div>
        
        <div style="text-align: center; padding-top: 20px; border-top: 1px solid #e5e7eb;">
          <p style="color: #6b7280; font-size: 14px;">
            Need help? Reply to this email or contact us at <a href="mailto:support@solutil.com">support@solutil.com</a>
          </p>
        </div>
      </div>
    `,
    text: `
Welcome to Solutil!

You're almost ready to start earning as a service provider on our platform.

Next Steps:
1. Complete Your Onboarding: Upload required documents and complete your profile
2. Document Review: Our team will verify your documents (2-3 business days)
3. Start Earning: Once approved, you can receive bookings from customers

Required Documents:
- National ID or Passport
- Business License
- Professional Certificate
- Good Conduct Certificate from DCI

Complete your setup: {{completeOnboardingUrl}}

Need help? Contact us at support@solutil.com
    `
  },

  applicationSubmitted: {
    subject: 'Application Submitted - Under Review',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="text-align: center; margin-bottom: 30px;">
          <h1 style="color: #2563eb;">Application Submitted Successfully!</h1>
          <p style="color: #666; font-size: 18px;">We're reviewing your provider application</p>
        </div>
        
        <div style="background-color: #dbeafe; border-radius: 8px; padding: 20px; margin-bottom: 20px;">
          <h2 style="color: #1e40af; margin-top: 0;">What happens next?</h2>
          <div style="color: #374151; line-height: 1.6;">
            <p><strong>Review Process (2-3 business days):</strong></p>
            <ul>
              <li>Our team will verify your documents</li>
              <li>We'll check your professional credentials</li>
              <li>You'll receive an email with the decision</li>
            </ul>
          </div>
        </div>
        
        <div style="background-color: #f0fdf4; border-left: 4px solid #16a34a; padding: 15px; margin: 20px 0;">
          <p style="color: #15803d; margin: 0; font-weight: bold;">
            ✓ Application Status: Under Review
          </p>
        </div>
        
        <div style="text-align: center; padding-top: 20px; border-top: 1px solid #e5e7eb;">
          <p style="color: #6b7280; font-size: 14px;">
            Have questions? Contact us at <a href="mailto:support@solutil.com">support@solutil.com</a>
          </p>
        </div>
      </div>
    `,
    text: `
Application Submitted Successfully!

Your provider application is now under review.

What happens next?
Review Process (2-3 business days):
- Our team will verify your documents
- We'll check your professional credentials  
- You'll receive an email with the decision

Application Status: Under Review

Have questions? Contact us at support@solutil.com
    `
  },

  approved: {
    subject: '🎉 Congratulations! Your Provider Application is Approved',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="text-align: center; margin-bottom: 30px;">
          <h1 style="color: #059669;">🎉 Congratulations!</h1>
          <p style="color: #666; font-size: 18px;">You're now a verified Solutil service provider</p>
        </div>
        
        <div style="background-color: #ecfdf5; border-radius: 8px; padding: 20px; margin-bottom: 20px;">
          <h2 style="color: #047857; margin-top: 0;">You can now:</h2>
          <ul style="color: #374151; line-height: 1.6;">
            <li>Create and manage your services</li>
            <li>Receive booking requests from customers</li>
            <li>Build your reputation with customer reviews</li>
            <li>Earn money for your skills and expertise</li>
          </ul>
        </div>
        
        <div style="text-align: center; margin: 30px 0;">
          <a href="{{dashboardUrl}}" style="background-color: #059669; color: white; padding: 14px 28px; text-decoration: none; border-radius: 8px; font-weight: bold; display: inline-block;">
            Go to Your Dashboard
          </a>
        </div>
        
        <div style="background-color: #fef3c7; border-left: 4px solid #f59e0b; padding: 15px; margin: 20px 0;">
          <h3 style="color: #92400e; margin-top: 0;">Getting Started Tips:</h3>
          <ul style="color: #374151; margin: 0;">
            <li>Set competitive pricing for your services</li>
            <li>Upload high-quality photos of your work</li>
            <li>Respond quickly to booking requests</li>
            <li>Provide excellent customer service</li>
          </ul>
        </div>
        
        <div style="text-align: center; padding-top: 20px; border-top: 1px solid #e5e7eb;">
          <p style="color: #6b7280; font-size: 14px;">
            Welcome to the Solutil family! For support, email us at <a href="mailto:support@solutil.com">support@solutil.com</a>
          </p>
        </div>
      </div>
    `,
    text: `
🎉 Congratulations! Your Provider Application is Approved

You're now a verified Solutil service provider!

You can now:
- Create and manage your services
- Receive booking requests from customers  
- Build your reputation with customer reviews
- Earn money for your skills and expertise

Go to your dashboard: {{dashboardUrl}}

Getting Started Tips:
- Set competitive pricing for your services
- Upload high-quality photos of your work
- Respond quickly to booking requests
- Provide excellent customer service

Welcome to the Solutil family! For support, email us at support@solutil.com
    `
  },

  rejected: {
    subject: 'Provider Application Update - Additional Information Required',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="text-align: center; margin-bottom: 30px;">
          <h1 style="color: #dc2626;">Application Update Required</h1>
          <p style="color: #666; font-size: 18px;">We need additional information to process your application</p>
        </div>
        
        <div style="background-color: #fef2f2; border-radius: 8px; padding: 20px; margin-bottom: 20px;">
          <h2 style="color: #b91c1c; margin-top: 0;">What you need to do:</h2>
          <div style="color: #374151; line-height: 1.6;">
            <p>After reviewing your application, we need you to:</p>
            <ul>
              <li>Review and resubmit clearer document photos</li>
              <li>Ensure all documents are valid and current</li>
              <li>Complete any missing profile information</li>
            </ul>
          </div>
        </div>
        
        <div style="text-align: center; margin: 30px 0;">
          <a href="{{reapplyUrl}}" style="background-color: #dc2626; color: white; padding: 14px 28px; text-decoration: none; border-radius: 8px; font-weight: bold; display: inline-block;">
            Update Application
          </a>
        </div>
        
        <div style="background-color: #f3f4f6; border-left: 4px solid #6b7280; padding: 15px; margin: 20px 0;">
          <p style="color: #374151; margin: 0;">
            <strong>Note:</strong> This is not a permanent rejection. Once you address the requirements above, you can resubmit your application for review.
          </p>
        </div>
        
        <div style="text-align: center; padding-top: 20px; border-top: 1px solid #e5e7eb;">
          <p style="color: #6b7280; font-size: 14px;">
            Questions? We're here to help at <a href="mailto:support@solutil.com">support@solutil.com</a>
          </p>
        </div>
      </div>
    `,
    text: `
Application Update Required

We need additional information to process your provider application.

What you need to do:
- Review and resubmit clearer document photos
- Ensure all documents are valid and current
- Complete any missing profile information

Update your application: {{reapplyUrl}}

Note: This is not a permanent rejection. Once you address the requirements above, you can resubmit your application for review.

Questions? We're here to help at support@solutil.com
    `
  }
}

module.exports = providerEmailTemplates