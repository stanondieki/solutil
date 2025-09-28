// Firestore Service service to replace Mongoose Service model
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
  endBefore
} = require('firebase/firestore');

class ServiceService {
  constructor() {
    this.collectionName = 'services';
    this.servicesRef = collection(db, this.collectionName);
  }

  // Create a new service
  async create(serviceData) {
    try {
      const serviceDoc = doc(this.servicesRef);
      const serviceWithId = {
        ...serviceData,
        id: serviceDoc.id,
        createdAt: new Date(),
        updatedAt: new Date(),
        isActive: true
      };

      await setDoc(serviceDoc, serviceWithId);
      return serviceWithId;
    } catch (error) {
      throw new Error(`Error creating service: ${error.message}`);
    }
  }

  // Find service by ID
  async findById(serviceId) {
    try {
      const serviceDoc = await getDoc(doc(db, this.collectionName, serviceId));
      if (!serviceDoc.exists()) {
        return null;
      }
      return serviceDoc.data();
    } catch (error) {
      throw new Error(`Error finding service: ${error.message}`);
    }
  }

  // Find all services with pagination
  async findAll(limitCount = 50, lastDoc = null) {
    try {
      let q = query(
        this.servicesRef, 
        where('isActive', '==', true),
        orderBy('createdAt', 'desc'), 
        limit(limitCount)
      );

      if (lastDoc) {
        q = query(q, startAfter(lastDoc));
      }

      const querySnapshot = await getDocs(q);
      return querySnapshot.docs.map(doc => doc.data());
    } catch (error) {
      throw new Error(`Error finding services: ${error.message}`);
    }
  }

  // Find services by category
  async findByCategory(category, limitCount = 50) {
    try {
      const q = query(
        this.servicesRef,
        where('category', '==', category),
        where('isActive', '==', true),
        orderBy('createdAt', 'desc'),
        limit(limitCount)
      );

      const querySnapshot = await getDocs(q);
      return querySnapshot.docs.map(doc => doc.data());
    } catch (error) {
      throw new Error(`Error finding services by category: ${error.message}`);
    }
  }

  // Find services by provider
  async findByProvider(providerId, limitCount = 50) {
    try {
      const q = query(
        this.servicesRef,
        where('provider', '==', providerId),
        where('isActive', '==', true),
        orderBy('createdAt', 'desc'),
        limit(limitCount)
      );

      const querySnapshot = await getDocs(q);
      return querySnapshot.docs.map(doc => doc.data());
    } catch (error) {
      throw new Error(`Error finding services by provider: ${error.message}`);
    }
  }

  // Search services by name or description
  async searchServices(searchTerm, category = null, limitCount = 50) {
    try {
      let q = query(
        this.servicesRef,
        where('isActive', '==', true),
        orderBy('name'),
        limit(limitCount)
      );

      if (category) {
        q = query(
          this.servicesRef,
          where('category', '==', category),
          where('isActive', '==', true),
          orderBy('name'),
          limit(limitCount)
        );
      }

      const querySnapshot = await getDocs(q);
      const services = querySnapshot.docs.map(doc => doc.data());

      // Client-side filtering for text search (Firestore doesn't support full-text search)
      if (searchTerm) {
        const term = searchTerm.toLowerCase();
        return services.filter(service => 
          service.name.toLowerCase().includes(term) ||
          service.description.toLowerCase().includes(term) ||
          (service.subcategory && service.subcategory.toLowerCase().includes(term))
        );
      }

      return services;
    } catch (error) {
      throw new Error(`Error searching services: ${error.message}`);
    }
  }

  // Update service
  async updateById(serviceId, updateData) {
    try {
      updateData.updatedAt = new Date();
      
      const serviceDocRef = doc(db, this.collectionName, serviceId);
      await updateDoc(serviceDocRef, updateData);
      
      return await this.findById(serviceId);
    } catch (error) {
      throw new Error(`Error updating service: ${error.message}`);
    }
  }

  // Soft delete service (mark as inactive)
  async deleteById(serviceId) {
    try {
      await updateDoc(doc(db, this.collectionName, serviceId), {
        isActive: false,
        deletedAt: new Date(),
        updatedAt: new Date()
      });
      return { message: 'Service deleted successfully' };
    } catch (error) {
      throw new Error(`Error deleting service: ${error.message}`);
    }
  }

  // Hard delete service (permanent)
  async permanentDelete(serviceId) {
    try {
      await deleteDoc(doc(db, this.collectionName, serviceId));
      return { message: 'Service permanently deleted' };
    } catch (error) {
      throw new Error(`Error permanently deleting service: ${error.message}`);
    }
  }

  // Update service availability
  async updateAvailability(serviceId, isAvailable) {
    try {
      await updateDoc(doc(db, this.collectionName, serviceId), {
        isAvailable,
        updatedAt: new Date()
      });
      return await this.findById(serviceId);
    } catch (error) {
      throw new Error(`Error updating service availability: ${error.message}`);
    }
  }

  // Get popular services (based on booking count)
  async getPopularServices(limitCount = 10) {
    try {
      const q = query(
        this.servicesRef,
        where('isActive', '==', true),
        orderBy('bookingCount', 'desc'),
        limit(limitCount)
      );

      const querySnapshot = await getDocs(q);
      return querySnapshot.docs.map(doc => doc.data());
    } catch (error) {
      throw new Error(`Error getting popular services: ${error.message}`);
    }
  }

  // Update service rating and review count
  async updateRating(serviceId, newRating, reviewCount) {
    try {
      await updateDoc(doc(db, this.collectionName, serviceId), {
        'rating.average': newRating,
        'rating.count': reviewCount,
        updatedAt: new Date()
      });
      return await this.findById(serviceId);
    } catch (error) {
      throw new Error(`Error updating service rating: ${error.message}`);
    }
  }

  // Increment booking count
  async incrementBookingCount(serviceId) {
    try {
      const service = await this.findById(serviceId);
      if (!service) {
        throw new Error('Service not found');
      }

      const currentCount = service.bookingCount || 0;
      await updateDoc(doc(db, this.collectionName, serviceId), {
        bookingCount: currentCount + 1,
        updatedAt: new Date()
      });

      return await this.findById(serviceId);
    } catch (error) {
      throw new Error(`Error incrementing booking count: ${error.message}`);
    }
  }
}

module.exports = new ServiceService();