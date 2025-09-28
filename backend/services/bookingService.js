// Firestore Booking service to replace Mongoose Booking model
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
  startAfter,
  Timestamp
} = require('firebase/firestore');

class BookingService {
  constructor() {
    this.collectionName = 'bookings';
    this.bookingsRef = collection(db, this.collectionName);
  }

  // Create a new booking
  async create(bookingData) {
    try {
      const bookingDoc = doc(this.bookingsRef);
      const bookingWithId = {
        ...bookingData,
        id: bookingDoc.id,
        status: 'pending',
        createdAt: new Date(),
        updatedAt: new Date(),
        // Convert dates to Firestore Timestamps if needed
        scheduledDate: bookingData.scheduledDate ? new Date(bookingData.scheduledDate) : null,
        completedDate: null,
        cancelledDate: null
      };

      await setDoc(bookingDoc, bookingWithId);
      return bookingWithId;
    } catch (error) {
      throw new Error(`Error creating booking: ${error.message}`);
    }
  }

  // Find booking by ID
  async findById(bookingId) {
    try {
      const bookingDoc = await getDoc(doc(db, this.collectionName, bookingId));
      if (!bookingDoc.exists()) {
        return null;
      }
      return this.formatBookingDates(bookingDoc.data());
    } catch (error) {
      throw new Error(`Error finding booking: ${error.message}`);
    }
  }

  // Find bookings by user (client)
  async findByUser(userId, limitCount = 50, lastDoc = null) {
    try {
      let q = query(
        this.bookingsRef,
        where('user', '==', userId),
        orderBy('createdAt', 'desc'),
        limit(limitCount)
      );

      if (lastDoc) {
        q = query(q, startAfter(lastDoc));
      }

      const querySnapshot = await getDocs(q);
      return querySnapshot.docs.map(doc => this.formatBookingDates(doc.data()));
    } catch (error) {
      throw new Error(`Error finding user bookings: ${error.message}`);
    }
  }

  // Find bookings by provider
  async findByProvider(providerId, limitCount = 50, lastDoc = null) {
    try {
      let q = query(
        this.bookingsRef,
        where('provider', '==', providerId),
        orderBy('createdAt', 'desc'),
        limit(limitCount)
      );

      if (lastDoc) {
        q = query(q, startAfter(lastDoc));
      }

      const querySnapshot = await getDocs(q);
      return querySnapshot.docs.map(doc => this.formatBookingDates(doc.data()));
    } catch (error) {
      throw new Error(`Error finding provider bookings: ${error.message}`);
    }
  }

  // Find bookings by status
  async findByStatus(status, limitCount = 50) {
    try {
      const q = query(
        this.bookingsRef,
        where('status', '==', status),
        orderBy('createdAt', 'desc'),
        limit(limitCount)
      );

      const querySnapshot = await getDocs(q);
      return querySnapshot.docs.map(doc => this.formatBookingDates(doc.data()));
    } catch (error) {
      throw new Error(`Error finding bookings by status: ${error.message}`);
    }
  }

  // Find upcoming bookings for a provider
  async findUpcomingByProvider(providerId) {
    try {
      const now = new Date();
      const q = query(
        this.bookingsRef,
        where('provider', '==', providerId),
        where('status', 'in', ['confirmed', 'pending']),
        where('scheduledDate', '>=', now),
        orderBy('scheduledDate', 'asc')
      );

      const querySnapshot = await getDocs(q);
      return querySnapshot.docs.map(doc => this.formatBookingDates(doc.data()));
    } catch (error) {
      throw new Error(`Error finding upcoming bookings: ${error.message}`);
    }
  }

  // Find all bookings with pagination (admin function)
  async findAll(limitCount = 50, lastDoc = null) {
    try {
      let q = query(
        this.bookingsRef,
        orderBy('createdAt', 'desc'),
        limit(limitCount)
      );

      if (lastDoc) {
        q = query(q, startAfter(lastDoc));
      }

      const querySnapshot = await getDocs(q);
      return querySnapshot.docs.map(doc => this.formatBookingDates(doc.data()));
    } catch (error) {
      throw new Error(`Error finding all bookings: ${error.message}`);
    }
  }

  // Update booking status
  async updateStatus(bookingId, newStatus, updateData = {}) {
    try {
      const updatePayload = {
        status: newStatus,
        updatedAt: new Date(),
        ...updateData
      };

      // Add specific date fields based on status
      if (newStatus === 'completed') {
        updatePayload.completedDate = new Date();
      } else if (newStatus === 'cancelled') {
        updatePayload.cancelledDate = new Date();
      }

      await updateDoc(doc(db, this.collectionName, bookingId), updatePayload);
      return await this.findById(bookingId);
    } catch (error) {
      throw new Error(`Error updating booking status: ${error.message}`);
    }
  }

  // Update booking
  async updateById(bookingId, updateData) {
    try {
      const updatePayload = {
        ...updateData,
        updatedAt: new Date()
      };

      // Convert date fields if they exist
      if (updateData.scheduledDate) {
        updatePayload.scheduledDate = new Date(updateData.scheduledDate);
      }

      await updateDoc(doc(db, this.collectionName, bookingId), updatePayload);
      return await this.findById(bookingId);
    } catch (error) {
      throw new Error(`Error updating booking: ${error.message}`);
    }
  }

  // Delete booking (soft delete by setting status to 'deleted')
  async deleteById(bookingId) {
    try {
      await updateDoc(doc(db, this.collectionName, bookingId), {
        status: 'deleted',
        deletedAt: new Date(),
        updatedAt: new Date()
      });
      return { message: 'Booking deleted successfully' };
    } catch (error) {
      throw new Error(`Error deleting booking: ${error.message}`);
    }
  }

  // Hard delete booking (permanent)
  async permanentDelete(bookingId) {
    try {
      await deleteDoc(doc(db, this.collectionName, bookingId));
      return { message: 'Booking permanently deleted' };
    } catch (error) {
      throw new Error(`Error permanently deleting booking: ${error.message}`);
    }
  }

  // Get booking statistics for provider
  async getProviderStats(providerId) {
    try {
      // Get all bookings for the provider
      const allBookings = await this.findByProvider(providerId, 1000);
      
      const stats = {
        total: allBookings.length,
        pending: 0,
        confirmed: 0,
        completed: 0,
        cancelled: 0,
        totalRevenue: 0,
        averageRating: 0
      };

      allBookings.forEach(booking => {
        stats[booking.status] = (stats[booking.status] || 0) + 1;
        if (booking.status === 'completed' && booking.amount) {
          stats.totalRevenue += booking.amount;
        }
      });

      return stats;
    } catch (error) {
      throw new Error(`Error getting provider stats: ${error.message}`);
    }
  }

  // Get bookings for a specific date range
  async findByDateRange(startDate, endDate, providerId = null) {
    try {
      let q = query(
        this.bookingsRef,
        where('scheduledDate', '>=', new Date(startDate)),
        where('scheduledDate', '<=', new Date(endDate)),
        orderBy('scheduledDate', 'asc')
      );

      if (providerId) {
        q = query(
          this.bookingsRef,
          where('provider', '==', providerId),
          where('scheduledDate', '>=', new Date(startDate)),
          where('scheduledDate', '<=', new Date(endDate)),
          orderBy('scheduledDate', 'asc')
        );
      }

      const querySnapshot = await getDocs(q);
      return querySnapshot.docs.map(doc => this.formatBookingDates(doc.data()));
    } catch (error) {
      throw new Error(`Error finding bookings by date range: ${error.message}`);
    }
  }

  // Confirm booking
  async confirmBooking(bookingId) {
    return this.updateStatus(bookingId, 'confirmed', {
      confirmedDate: new Date()
    });
  }

  // Complete booking
  async completeBooking(bookingId, completionData = {}) {
    return this.updateStatus(bookingId, 'completed', completionData);
  }

  // Cancel booking
  async cancelBooking(bookingId, cancellationReason = '') {
    return this.updateStatus(bookingId, 'cancelled', {
      cancellationReason
    });
  }

  // Helper method to format dates from Firestore Timestamps
  formatBookingDates(booking) {
    if (!booking) return booking;

    const formatDate = (date) => {
      if (!date) return null;
      if (date.toDate) return date.toDate(); // Firestore Timestamp
      if (date instanceof Date) return date;
      return new Date(date);
    };

    return {
      ...booking,
      createdAt: formatDate(booking.createdAt),
      updatedAt: formatDate(booking.updatedAt),
      scheduledDate: formatDate(booking.scheduledDate),
      completedDate: formatDate(booking.completedDate),
      cancelledDate: formatDate(booking.cancelledDate),
      confirmedDate: formatDate(booking.confirmedDate),
      deletedAt: formatDate(booking.deletedAt)
    };
  }
}

module.exports = new BookingService();