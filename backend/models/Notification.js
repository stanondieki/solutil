const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  title: {
    type: String,
    required: true,
    trim: true
  },
  message: {
    type: String,
    required: true
  },
  type: {
    type: String,
    enum: ['booking', 'payment', 'service', 'system', 'promotion', 'provider', 'review'],
    default: 'system'
  },
  read: {
    type: Boolean,
    default: false
  },
  readAt: {
    type: Date,
    default: null
  },
  actionUrl: {
    type: String,
    default: null
  },
  actionText: {
    type: String,
    default: null
  },
  metadata: {
    bookingId: { type: mongoose.Schema.Types.ObjectId, ref: 'Booking' },
    serviceId: { type: mongoose.Schema.Types.ObjectId, ref: 'Service' },
    providerId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    amount: Number,
    extra: mongoose.Schema.Types.Mixed
  },
  priority: {
    type: String,
    enum: ['low', 'normal', 'high', 'urgent'],
    default: 'normal'
  },
  expiresAt: {
    type: Date,
    default: null
  }
}, {
  timestamps: true,
  toJSON: {
    transform: function(doc, ret) {
      ret.id = ret._id;
      delete ret._id;
      delete ret.__v;
      return ret;
    }
  },
  toObject: {
    transform: function(doc, ret) {
      ret.id = ret._id;
      delete ret._id;
      delete ret.__v;
      return ret;
    }
  }
});

// Index for efficient queries
notificationSchema.index({ userId: 1, read: 1, createdAt: -1 });
notificationSchema.index({ userId: 1, createdAt: -1 });
notificationSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 }); // TTL index

// Static method to create a notification
notificationSchema.statics.createNotification = async function(data) {
  const notification = await this.create(data);
  return notification;
};

// Static method to get user notifications
notificationSchema.statics.getUserNotifications = async function(userId, options = {}) {
  const { limit = 50, skip = 0, unreadOnly = false } = options;
  
  const query = { userId };
  if (unreadOnly) {
    query.read = false;
  }
  
  const notifications = await this.find(query)
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limit)
    .lean();
  
  // Transform _id to id for frontend compatibility
  return notifications.map(n => ({
    ...n,
    id: n._id.toString(),
    _id: undefined
  }));
};

// Static method to get unread count
notificationSchema.statics.getUnreadCount = async function(userId) {
  return this.countDocuments({ userId, read: false });
};

// Static method to mark as read
notificationSchema.statics.markAsRead = async function(notificationId, userId) {
  return this.findOneAndUpdate(
    { _id: notificationId, userId },
    { read: true, readAt: new Date() },
    { new: true }
  );
};

// Static method to mark all as read
notificationSchema.statics.markAllAsRead = async function(userId) {
  return this.updateMany(
    { userId, read: false },
    { read: true, readAt: new Date() }
  );
};

// Static method to delete notification
notificationSchema.statics.deleteNotification = async function(notificationId, userId) {
  return this.findOneAndDelete({ _id: notificationId, userId });
};

// Static method to clear all notifications for a user
notificationSchema.statics.clearAll = async function(userId) {
  return this.deleteMany({ userId });
};

module.exports = mongoose.model('Notification', notificationSchema);
