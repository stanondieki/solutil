const express = require('express');
const { protect } = require('../middleware/auth');

const router = express.Router();

// Placeholder routes - to be implemented
router.get('/', protect, (req, res) => {
  res.json({ message: 'Users route - Coming soon' });
});

router.get('/providers', protect, (req, res) => {
  res.json({ message: 'Providers route - Coming soon' });
});

router.get('/reviews', protect, (req, res) => {
  res.json({ message: 'Reviews route - Coming soon' });
});

router.get('/payments', protect, (req, res) => {
  res.json({ message: 'Payments route - Coming soon' });
});

router.get('/upload', protect, (req, res) => {
  res.json({ message: 'Upload route - Coming soon' });
});

module.exports = router;
