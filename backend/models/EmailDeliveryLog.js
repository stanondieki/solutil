const mongoose = require('mongoose');

// Email delivery log schema
const emailDeliveryLogSchema = new mongoose.Schema({
  recipient: {
    type: String,
    required: true,
    index: true
  },
  emailType: {
    type: String,
    required: true,
    enum: ['verification', 'password_reset', 'booking_confirmation', 'welcome', 'test']
  },
  subject: String,
  messageId: String,
  smtpResponse: String,
  deliveryStatus: {
    type: String,
    enum: ['sent', 'delivered', 'bounced', 'complained', 'failed'],
    default: 'sent'
  },
  deliveryAttempts: {
    type: Number,
    default: 1
  },
  lastAttempt: {
    type: Date,
    default: Date.now
  },
  errorMessage: String,
  metadata: {
    userAgent: String,
    ipAddress: String,
    userId: String
  }
}, {
  timestamps: true
});

const EmailDeliveryLog = mongoose.model('EmailDeliveryLog', emailDeliveryLogSchema);

module.exports = EmailDeliveryLog;