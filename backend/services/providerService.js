// Firestore Provider service to replace Mongoose Provider model
// Note: This handles provider-specific user data and verification status
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

class ProviderService {
  constructor() {
    this.collectionName = 'providers';
    this.providersRef = collection(db, this.collectionName);
  }

  // Create a new provider profile
  async create(providerData) {
    try {
      const providerDoc = doc(this.providersRef);
      const providerWithId = {
        ...providerData,
        id: providerDoc.id,
        verificationStatus: 'pending',
        isApproved: false,
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date(),
        rating: {
          average: 0,
          count: 0
        },
        totalBookings: 0,
        completedBookings: 0,
        earnings: {
          total: 0,
          pending: 0,
          released: 0
        }
      };

      await setDoc(providerDoc, providerWithId);
      return providerWithId;
    } catch (error) {
      throw new Error(`Error creating provider: ${error.message}`);
    }
  }

  // Find provider by ID
  async findById(providerId) {
    try {
      const providerDoc = await getDoc(doc(db, this.collectionName, providerId));
      if (!providerDoc.exists()) {
        return null;
      }
      return this.formatProviderDates(providerDoc.data());
    } catch (error) {
      throw new Error(`Error finding provider: ${error.message}`);
    }
  }

  // Find provider by user ID
  async findByUserId(userId) {
    try {
      const q = query(
        this.providersRef,
        where('userId', '==', userId)
      );

      const querySnapshot = await getDocs(q);
      if (querySnapshot.empty) {
        return null;
      }

      return this.formatProviderDates(querySnapshot.docs[0].data());
    } catch (error) {
      throw new Error(`Error finding provider by user ID: ${error.message}`);
    }
  }

  // Find all providers with pagination
  async findAll(limitCount = 50, lastDoc = null) {
    try {
      let q = query(
        this.providersRef,
        where('isActive', '==', true),
        orderBy('createdAt', 'desc'),
        limit(limitCount)
      );

      if (lastDoc) {
        q = query(q, startAfter(lastDoc));
      }

      const querySnapshot = await getDocs(q);
      return querySnapshot.docs.map(doc => this.formatProviderDates(doc.data()));
    } catch (error) {
      throw new Error(`Error finding providers: ${error.message}`);
    }
  }

  // Find approved providers
  async findApproved(limitCount = 50, lastDoc = null) {
    try {
      let q = query(
        this.providersRef,
        where('isApproved', '==', true),
        where('isActive', '==', true),
        orderBy('rating.average', 'desc'),
        limit(limitCount)
      );

      if (lastDoc) {
        q = query(q, startAfter(lastDoc));
      }

      const querySnapshot = await getDocs(q);
      return querySnapshot.docs.map(doc => this.formatProviderDates(doc.data()));
    } catch (error) {
      throw new Error(`Error finding approved providers: ${error.message}`);
    }
  }

  // Find providers by verification status
  async findByVerificationStatus(status, limitCount = 50) {
    try {
      const q = query(
        this.providersRef,
        where('verificationStatus', '==', status),
        where('isActive', '==', true),
        orderBy('createdAt', 'desc'),
        limit(limitCount)
      );

      const querySnapshot = await getDocs(q);
      return querySnapshot.docs.map(doc => this.formatProviderDates(doc.data()));
    } catch (error) {
      throw new Error(`Error finding providers by verification status: ${error.message}`);
    }
  }

  // Find providers by specialization/category
  async findBySpecialization(specialization, limitCount = 50) {
    try {
      const q = query(
        this.providersRef,
        where('specializations', 'array-contains', specialization),
        where('isApproved', '==', true),
        where('isActive', '==', true),
        orderBy('rating.average', 'desc'),
        limit(limitCount)
      );

      const querySnapshot = await getDocs(q);
      return querySnapshot.docs.map(doc => this.formatProviderDates(doc.data()));
    } catch (error) {
      throw new Error(`Error finding providers by specialization: ${error.message}`);
    }
  }

  // Search providers by location
  async findByLocation(location, radius = 50, limitCount = 50) {
    try {
      // Note: For geo-queries, you might want to use GeoFirestore
      // This is a simple text-based location search
      const q = query(
        this.providersRef,
        where('location.city', '==', location.city),
        where('isApproved', '==', true),
        where('isActive', '==', true),
        orderBy('rating.average', 'desc'),
        limit(limitCount)
      );

      const querySnapshot = await getDocs(q);
      return querySnapshot.docs.map(doc => this.formatProviderDates(doc.data()));
    } catch (error) {
      throw new Error(`Error finding providers by location: ${error.message}`);
    }
  }

  // Update provider
  async updateById(providerId, updateData) {
    try {
      const updatePayload = {
        ...updateData,
        updatedAt: new Date()
      };

      await updateDoc(doc(db, this.collectionName, providerId), updatePayload);
      return await this.findById(providerId);
    } catch (error) {
      throw new Error(`Error updating provider: ${error.message}`);
    }
  }

  // Update verification status
  async updateVerificationStatus(providerId, status, notes = '') {
    try {
      const updateData = {
        verificationStatus: status,
        verificationNotes: notes,
        updatedAt: new Date()
      };

      if (status === 'verified') {
        updateData.isApproved = true;
        updateData.verifiedAt = new Date();
      } else if (status === 'rejected') {
        updateData.isApproved = false;
        updateData.rejectedAt = new Date();
      }

      await updateDoc(doc(db, this.collectionName, providerId), updateData);
      return await this.findById(providerId);
    } catch (error) {
      throw new Error(`Error updating verification status: ${error.message}`);
    }
  }

  // Update provider rating
  async updateRating(providerId, newRating, reviewCount) {
    try {
      await updateDoc(doc(db, this.collectionName, providerId), {
        'rating.average': newRating,
        'rating.count': reviewCount,
        updatedAt: new Date()
      });
      return await this.findById(providerId);
    } catch (error) {
      throw new Error(`Error updating provider rating: ${error.message}`);
    }
  }

  // Update booking statistics
  async updateBookingStats(providerId, totalBookings, completedBookings) {
    try {
      await updateDoc(doc(db, this.collectionName, providerId), {
        totalBookings,
        completedBookings,
        updatedAt: new Date()
      });
      return await this.findById(providerId);
    } catch (error) {
      throw new Error(`Error updating booking stats: ${error.message}`);
    }
  }

  // Update earnings
  async updateEarnings(providerId, earningsData) {
    try {
      await updateDoc(doc(db, this.collectionName, providerId), {
        'earnings.total': earningsData.total || 0,
        'earnings.pending': earningsData.pending || 0,
        'earnings.released': earningsData.released || 0,
        updatedAt: new Date()
      });
      return await this.findById(providerId);
    } catch (error) {
      throw new Error(`Error updating earnings: ${error.message}`);
    }
  }

  // Approve provider
  async approveProvider(providerId, approvalNotes = '') {
    return this.updateVerificationStatus(providerId, 'verified', approvalNotes);
  }

  // Reject provider
  async rejectProvider(providerId, rejectionReason) {
    return this.updateVerificationStatus(providerId, 'rejected', rejectionReason);
  }

  // Suspend provider
  async suspendProvider(providerId, suspensionReason) {
    try {
      await updateDoc(doc(db, this.collectionName, providerId), {
        isActive: false,
        suspensionReason,
        suspendedAt: new Date(),
        updatedAt: new Date()
      });
      return await this.findById(providerId);
    } catch (error) {
      throw new Error(`Error suspending provider: ${error.message}`);
    }
  }

  // Reactivate provider
  async reactivateProvider(providerId) {
    try {
      await updateDoc(doc(db, this.collectionName, providerId), {
        isActive: true,
        suspensionReason: null,
        suspendedAt: null,
        reactivatedAt: new Date(),
        updatedAt: new Date()
      });
      return await this.findById(providerId);
    } catch (error) {
      throw new Error(`Error reactivating provider: ${error.message}`);
    }
  }

  // Get top-rated providers
  async getTopRated(limitCount = 10) {
    try {
      const q = query(
        this.providersRef,
        where('isApproved', '==', true),
        where('isActive', '==', true),
        where('rating.count', '>=', 5), // Minimum 5 reviews
        orderBy('rating.average', 'desc'),
        limit(limitCount)
      );

      const querySnapshot = await getDocs(q);
      return querySnapshot.docs.map(doc => this.formatProviderDates(doc.data()));
    } catch (error) {
      throw new Error(`Error getting top-rated providers: ${error.message}`);
    }
  }

  // Get pending verification providers (admin function)
  async getPendingVerification(limitCount = 50) {
    return this.findByVerificationStatus('pending', limitCount);
  }

  // Add specialization to provider
  async addSpecialization(providerId, specialization) {
    try {
      const provider = await this.findById(providerId);
      if (!provider) {
        throw new Error('Provider not found');
      }

      const currentSpecs = provider.specializations || [];
      if (!currentSpecs.includes(specialization)) {
        currentSpecs.push(specialization);
        
        await updateDoc(doc(db, this.collectionName, providerId), {
          specializations: currentSpecs,
          updatedAt: new Date()
        });
      }

      return await this.findById(providerId);
    } catch (error) {
      throw new Error(`Error adding specialization: ${error.message}`);
    }
  }

  // Remove specialization from provider
  async removeSpecialization(providerId, specialization) {
    try {
      const provider = await this.findById(providerId);
      if (!provider) {
        throw new Error('Provider not found');
      }

      const currentSpecs = provider.specializations || [];
      const updatedSpecs = currentSpecs.filter(spec => spec !== specialization);
      
      await updateDoc(doc(db, this.collectionName, providerId), {
        specializations: updatedSpecs,
        updatedAt: new Date()
      });

      return await this.findById(providerId);
    } catch (error) {
      throw new Error(`Error removing specialization: ${error.message}`);
    }
  }

  // Delete provider (soft delete)
  async deleteById(providerId) {
    try {
      await updateDoc(doc(db, this.collectionName, providerId), {
        isActive: false,
        deletedAt: new Date(),
        updatedAt: new Date()
      });
      return { message: 'Provider deleted successfully' };
    } catch (error) {
      throw new Error(`Error deleting provider: ${error.message}`);
    }
  }

  // Hard delete provider (permanent)
  async permanentDelete(providerId) {
    try {
      await deleteDoc(doc(db, this.collectionName, providerId));
      return { message: 'Provider permanently deleted' };
    } catch (error) {
      throw new Error(`Error permanently deleting provider: ${error.message}`);
    }
  }

  // Helper method to format dates from Firestore Timestamps
  formatProviderDates(provider) {
    if (!provider) return provider;

    const formatDate = (date) => {
      if (!date) return null;
      if (date.toDate) return date.toDate(); // Firestore Timestamp
      if (date instanceof Date) return date;
      return new Date(date);
    };

    return {
      ...provider,
      createdAt: formatDate(provider.createdAt),
      updatedAt: formatDate(provider.updatedAt),
      verifiedAt: formatDate(provider.verifiedAt),
      rejectedAt: formatDate(provider.rejectedAt),
      suspendedAt: formatDate(provider.suspendedAt),
      reactivatedAt: formatDate(provider.reactivatedAt),
      deletedAt: formatDate(provider.deletedAt)
    };
  }
}

module.exports = new ProviderService();