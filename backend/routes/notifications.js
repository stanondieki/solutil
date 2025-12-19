const express = require('express');
const {
  getNotifications,
  getUnreadCount,
  markAsRead,
  markAllAsRead,
  deleteNotification,
  clearAll,
  createNotification
} = require('../controllers/notificationController');
const { protect, restrictTo } = require('../middleware/auth');

const router = express.Router();

// All routes require authentication
router.use(protect);

// Get notifications for current user
router.get('/', getNotifications);

// Get unread count
router.get('/unread-count', getUnreadCount);

// Mark all as read
router.patch('/read-all', markAllAsRead);

// Clear all notifications
router.delete('/clear-all', clearAll);

// Mark single notification as read
router.patch('/:id/read', markAsRead);

// Delete single notification
router.delete('/:id', deleteNotification);

// Admin: Create notification for a user
router.post('/', restrictTo('admin'), createNotification);

module.exports = router;
