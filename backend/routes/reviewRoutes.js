const express = require('express');
const reviewController = require('../controllers/reviewController');
const { protect } = require('../middleware/auth');

const router = express.Router();

// Protect all routes after this middleware
router.use(protect);

// Review routes
router.post('/', reviewController.createReview);
router.get('/my-reviews', reviewController.getMyReviews);
router.patch('/:id/helpful', reviewController.updateHelpfulVotes);

// Public routes (no auth required)
router.get('/service/:serviceId', reviewController.getServiceReviews);
router.get('/provider/:providerId', reviewController.getProviderReviews);

module.exports = router;