// Firestore Review service to replace Mongoose Review model
const { db } = require('../config/firebase');
const { 
  collection, 
  doc, 
  getDoc, 
  getDocs, 
  setDoc, 
  updateDoc, 
  deleteDoc, 
  query, 
  where, 
  orderBy, 
  limit,
  startAfter
} = require('firebase/firestore');

class ReviewService {
  constructor() {
    this.collectionName = 'reviews';
    this.reviewsRef = collection(db, this.collectionName);
  }

  // Create a new review
  async create(reviewData) {
    try {
      const reviewDoc = doc(this.reviewsRef);
      const reviewWithId = {
        ...reviewData,
        id: reviewDoc.id,
        createdAt: new Date(),
        updatedAt: new Date(),
        isVisible: true,
        helpful: 0,
        reported: false
      };

      await setDoc(reviewDoc, reviewWithId);
      return reviewWithId;
    } catch (error) {
      throw new Error(`Error creating review: ${error.message}`);
    }
  }

  // Find review by ID
  async findById(reviewId) {
    try {
      const reviewDoc = await getDoc(doc(db, this.collectionName, reviewId));
      if (!reviewDoc.exists()) {
        return null;
      }
      return this.formatReviewDates(reviewDoc.data());
    } catch (error) {
      throw new Error(`Error finding review: ${error.message}`);
    }
  }

  // Find reviews by service
  async findByService(serviceId, limitCount = 50, lastDoc = null) {
    try {
      let q = query(
        this.reviewsRef,
        where('service', '==', serviceId),
        where('isVisible', '==', true),
        orderBy('createdAt', 'desc'),
        limit(limitCount)
      );

      if (lastDoc) {
        q = query(q, startAfter(lastDoc));
      }

      const querySnapshot = await getDocs(q);
      return querySnapshot.docs.map(doc => this.formatReviewDates(doc.data()));
    } catch (error) {
      throw new Error(`Error finding reviews by service: ${error.message}`);
    }
  }

  // Find reviews by provider
  async findByProvider(providerId, limitCount = 50, lastDoc = null) {
    try {
      let q = query(
        this.reviewsRef,
        where('provider', '==', providerId),
        where('isVisible', '==', true),
        orderBy('createdAt', 'desc'),
        limit(limitCount)
      );

      if (lastDoc) {
        q = query(q, startAfter(lastDoc));
      }

      const querySnapshot = await getDocs(q);
      return querySnapshot.docs.map(doc => this.formatReviewDates(doc.data()));
    } catch (error) {
      throw new Error(`Error finding reviews by provider: ${error.message}`);
    }
  }

  // Find reviews by user (reviewer)
  async findByUser(userId, limitCount = 50, lastDoc = null) {
    try {
      let q = query(
        this.reviewsRef,
        where('user', '==', userId),
        orderBy('createdAt', 'desc'),
        limit(limitCount)
      );

      if (lastDoc) {
        q = query(q, startAfter(lastDoc));
      }

      const querySnapshot = await getDocs(q);
      return querySnapshot.docs.map(doc => this.formatReviewDates(doc.data()));
    } catch (error) {
      throw new Error(`Error finding reviews by user: ${error.message}`);
    }
  }

  // Find reviews by booking
  async findByBooking(bookingId) {
    try {
      const q = query(
        this.reviewsRef,
        where('booking', '==', bookingId)
      );

      const querySnapshot = await getDocs(q);
      return querySnapshot.docs.map(doc => this.formatReviewDates(doc.data()));
    } catch (error) {
      throw new Error(`Error finding review by booking: ${error.message}`);
    }
  }

  // Find all reviews with pagination (admin function)
  async findAll(limitCount = 50, lastDoc = null) {
    try {
      let q = query(
        this.reviewsRef,
        orderBy('createdAt', 'desc'),
        limit(limitCount)
      );

      if (lastDoc) {
        q = query(q, startAfter(lastDoc));
      }

      const querySnapshot = await getDocs(q);
      return querySnapshot.docs.map(doc => this.formatReviewDates(doc.data()));
    } catch (error) {
      throw new Error(`Error finding all reviews: ${error.message}`);
    }
  }

  // Get average rating for a service
  async getServiceRating(serviceId) {
    try {
      const reviews = await this.findByService(serviceId, 1000); // Get all reviews
      
      if (reviews.length === 0) {
        return { average: 0, count: 0, distribution: {} };
      }

      const ratings = reviews.map(review => review.rating);
      const average = ratings.reduce((sum, rating) => sum + rating, 0) / ratings.length;
      
      // Calculate rating distribution
      const distribution = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
      ratings.forEach(rating => {
        distribution[rating] = (distribution[rating] || 0) + 1;
      });

      return {
        average: Math.round(average * 100) / 100, // Round to 2 decimal places
        count: reviews.length,
        distribution
      };
    } catch (error) {
      throw new Error(`Error calculating service rating: ${error.message}`);
    }
  }

  // Get average rating for a provider
  async getProviderRating(providerId) {
    try {
      const reviews = await this.findByProvider(providerId, 1000); // Get all reviews
      
      if (reviews.length === 0) {
        return { average: 0, count: 0, distribution: {} };
      }

      const ratings = reviews.map(review => review.rating);
      const average = ratings.reduce((sum, rating) => sum + rating, 0) / ratings.length;
      
      // Calculate rating distribution
      const distribution = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
      ratings.forEach(rating => {
        distribution[rating] = (distribution[rating] || 0) + 1;
      });

      return {
        average: Math.round(average * 100) / 100,
        count: reviews.length,
        distribution
      };
    } catch (error) {
      throw new Error(`Error calculating provider rating: ${error.message}`);
    }
  }

  // Update review
  async updateById(reviewId, updateData) {
    try {
      const updatePayload = {
        ...updateData,
        updatedAt: new Date()
      };

      await updateDoc(doc(db, this.collectionName, reviewId), updatePayload);
      return await this.findById(reviewId);
    } catch (error) {
      throw new Error(`Error updating review: ${error.message}`);
    }
  }

  // Hide/unhide review
  async toggleVisibility(reviewId, isVisible) {
    try {
      await updateDoc(doc(db, this.collectionName, reviewId), {
        isVisible,
        updatedAt: new Date()
      });
      return await this.findById(reviewId);
    } catch (error) {
      throw new Error(`Error toggling review visibility: ${error.message}`);
    }
  }

  // Report review
  async reportReview(reviewId, reportReason) {
    try {
      await updateDoc(doc(db, this.collectionName, reviewId), {
        reported: true,
        reportReason,
        reportedAt: new Date(),
        updatedAt: new Date()
      });
      return await this.findById(reviewId);
    } catch (error) {
      throw new Error(`Error reporting review: ${error.message}`);
    }
  }

  // Mark review as helpful
  async markHelpful(reviewId) {
    try {
      const review = await this.findById(reviewId);
      if (!review) {
        throw new Error('Review not found');
      }

      const currentHelpful = review.helpful || 0;
      await updateDoc(doc(db, this.collectionName, reviewId), {
        helpful: currentHelpful + 1,
        updatedAt: new Date()
      });

      return await this.findById(reviewId);
    } catch (error) {
      throw new Error(`Error marking review as helpful: ${error.message}`);
    }
  }

  // Delete review (soft delete by hiding)
  async deleteById(reviewId) {
    try {
      await updateDoc(doc(db, this.collectionName, reviewId), {
        isVisible: false,
        deletedAt: new Date(),
        updatedAt: new Date()
      });
      return { message: 'Review deleted successfully' };
    } catch (error) {
      throw new Error(`Error deleting review: ${error.message}`);
    }
  }

  // Hard delete review (permanent)
  async permanentDelete(reviewId) {
    try {
      await deleteDoc(doc(db, this.collectionName, reviewId));
      return { message: 'Review permanently deleted' };
    } catch (error) {
      throw new Error(`Error permanently deleting review: ${error.message}`);
    }
  }

  // Get recent reviews for homepage/dashboard
  async getRecentReviews(limitCount = 10) {
    try {
      const q = query(
        this.reviewsRef,
        where('isVisible', '==', true),
        orderBy('createdAt', 'desc'),
        limit(limitCount)
      );

      const querySnapshot = await getDocs(q);
      return querySnapshot.docs.map(doc => this.formatReviewDates(doc.data()));
    } catch (error) {
      throw new Error(`Error getting recent reviews: ${error.message}`);
    }
  }

  // Get top-rated reviews for a service
  async getTopRatedReviews(serviceId, limitCount = 5) {
    try {
      const q = query(
        this.reviewsRef,
        where('service', '==', serviceId),
        where('isVisible', '==', true),
        where('rating', '>=', 4),
        orderBy('rating', 'desc'),
        orderBy('helpful', 'desc'),
        limit(limitCount)
      );

      const querySnapshot = await getDocs(q);
      return querySnapshot.docs.map(doc => this.formatReviewDates(doc.data()));
    } catch (error) {
      throw new Error(`Error getting top-rated reviews: ${error.message}`);
    }
  }

  // Get reported reviews (admin function)
  async getReportedReviews(limitCount = 50) {
    try {
      const q = query(
        this.reviewsRef,
        where('reported', '==', true),
        orderBy('reportedAt', 'desc'),
        limit(limitCount)
      );

      const querySnapshot = await getDocs(q);
      return querySnapshot.docs.map(doc => this.formatReviewDates(doc.data()));
    } catch (error) {
      throw new Error(`Error getting reported reviews: ${error.message}`);
    }
  }

  // Helper method to format dates from Firestore Timestamps
  formatReviewDates(review) {
    if (!review) return review;

    const formatDate = (date) => {
      if (!date) return null;
      if (date.toDate) return date.toDate(); // Firestore Timestamp
      if (date instanceof Date) return date;
      return new Date(date);
    };

    return {
      ...review,
      createdAt: formatDate(review.createdAt),
      updatedAt: formatDate(review.updatedAt),
      reportedAt: formatDate(review.reportedAt),
      deletedAt: formatDate(review.deletedAt)
    };
  }
}

module.exports = new ReviewService();