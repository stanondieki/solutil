const Notification = require('../models/Notification');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/appError');

// Get all notifications for current user
exports.getNotifications = catchAsync(async (req, res, next) => {
  const { limit = 50, skip = 0, unreadOnly } = req.query;
  
  const notifications = await Notification.getUserNotifications(req.user._id, {
    limit: parseInt(limit),
    skip: parseInt(skip),
    unreadOnly: unreadOnly === 'true'
  });
  
  const unreadCount = await Notification.getUnreadCount(req.user._id);
  
  res.status(200).json({
    success: true,
    notifications,
    unreadCount,
    total: notifications.length
  });
});

// Get unread count
exports.getUnreadCount = catchAsync(async (req, res, next) => {
  const count = await Notification.getUnreadCount(req.user._id);
  
  res.status(200).json({
    success: true,
    unreadCount: count
  });
});

// Mark notification as read
exports.markAsRead = catchAsync(async (req, res, next) => {
  const { id } = req.params;
  
  const notification = await Notification.markAsRead(id, req.user._id);
  
  if (!notification) {
    return next(new AppError('Notification not found', 404));
  }
  
  res.status(200).json({
    success: true,
    message: 'Notification marked as read',
    notification
  });
});

// Mark all notifications as read
exports.markAllAsRead = catchAsync(async (req, res, next) => {
  await Notification.markAllAsRead(req.user._id);
  
  res.status(200).json({
    success: true,
    message: 'All notifications marked as read'
  });
});

// Delete a notification
exports.deleteNotification = catchAsync(async (req, res, next) => {
  const { id } = req.params;
  
  const notification = await Notification.deleteNotification(id, req.user._id);
  
  if (!notification) {
    return next(new AppError('Notification not found', 404));
  }
  
  res.status(200).json({
    success: true,
    message: 'Notification deleted'
  });
});

// Clear all notifications
exports.clearAll = catchAsync(async (req, res, next) => {
  await Notification.clearAll(req.user._id);
  
  res.status(200).json({
    success: true,
    message: 'All notifications cleared'
  });
});

// Create notification (internal use / admin)
exports.createNotification = catchAsync(async (req, res, next) => {
  const { userId, title, message, type, actionUrl, actionText, metadata, priority } = req.body;
  
  if (!userId || !title || !message) {
    return next(new AppError('userId, title, and message are required', 400));
  }
  
  const notification = await Notification.createNotification({
    userId,
    title,
    message,
    type: type || 'system',
    actionUrl,
    actionText,
    metadata,
    priority: priority || 'normal'
  });
  
  res.status(201).json({
    success: true,
    message: 'Notification created',
    notification
  });
});

// Helper function to send notification (for use in other controllers)
exports.sendNotification = async (userId, data) => {
  try {
    const notification = await Notification.createNotification({
      userId,
      title: data.title,
      message: data.message,
      type: data.type || 'system',
      actionUrl: data.actionUrl,
      actionText: data.actionText,
      metadata: data.metadata,
      priority: data.priority || 'normal'
    });
    return notification;
  } catch (error) {
    console.error('Error sending notification:', error);
    return null;
  }
};
