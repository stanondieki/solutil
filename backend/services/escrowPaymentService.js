// Firestore EscrowPayment service to replace Mongoose EscrowPayment model
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

class EscrowPaymentService {
  constructor() {
    this.collectionName = 'escrowPayments';
    this.escrowRef = collection(db, this.collectionName);
  }

  // Create a new escrow payment
  async create(escrowData) {
    try {
      const escrowDoc = doc(this.escrowRef);
      const escrowWithId = {
        ...escrowData,
        id: escrowDoc.id,
        status: 'pending',
        createdAt: new Date(),
        updatedAt: new Date(),
        releasedAt: null,
        refundedAt: null,
        disputeStartedAt: null,
        disputeResolvedAt: null
      };

      await setDoc(escrowDoc, escrowWithId);
      return escrowWithId;
    } catch (error) {
      throw new Error(`Error creating escrow payment: ${error.message}`);
    }
  }

  // Find escrow payment by ID
  async findById(escrowId) {
    try {
      const escrowDoc = await getDoc(doc(db, this.collectionName, escrowId));
      if (!escrowDoc.exists()) {
        return null;
      }
      return this.formatEscrowDates(escrowDoc.data());
    } catch (error) {
      throw new Error(`Error finding escrow payment: ${error.message}`);
    }
  }

  // Find escrow payment by booking ID
  async findByBooking(bookingId) {
    try {
      const q = query(
        this.escrowRef,
        where('booking', '==', bookingId)
      );

      const querySnapshot = await getDocs(q);
      if (querySnapshot.empty) {
        return null;
      }

      return this.formatEscrowDates(querySnapshot.docs[0].data());
    } catch (error) {
      throw new Error(`Error finding escrow by booking: ${error.message}`);
    }
  }

  // Find escrow payments by client
  async findByClient(clientId, limitCount = 50, lastDoc = null) {
    try {
      let q = query(
        this.escrowRef,
        where('client', '==', clientId),
        orderBy('createdAt', 'desc'),
        limit(limitCount)
      );

      if (lastDoc) {
        q = query(q, startAfter(lastDoc));
      }

      const querySnapshot = await getDocs(q);
      return querySnapshot.docs.map(doc => this.formatEscrowDates(doc.data()));
    } catch (error) {
      throw new Error(`Error finding escrow payments by client: ${error.message}`);
    }
  }

  // Find escrow payments by provider
  async findByProvider(providerId, limitCount = 50, lastDoc = null) {
    try {
      let q = query(
        this.escrowRef,
        where('provider', '==', providerId),
        orderBy('createdAt', 'desc'),
        limit(limitCount)
      );

      if (lastDoc) {
        q = query(q, startAfter(lastDoc));
      }

      const querySnapshot = await getDocs(q);
      return querySnapshot.docs.map(doc => this.formatEscrowDates(doc.data()));
    } catch (error) {
      throw new Error(`Error finding escrow payments by provider: ${error.message}`);
    }
  }

  // Find escrow payments by status
  async findByStatus(status, limitCount = 50) {
    try {
      const q = query(
        this.escrowRef,
        where('status', '==', status),
        orderBy('createdAt', 'desc'),
        limit(limitCount)
      );

      const querySnapshot = await getDocs(q);
      return querySnapshot.docs.map(doc => this.formatEscrowDates(doc.data()));
    } catch (error) {
      throw new Error(`Error finding escrow payments by status: ${error.message}`);
    }
  }

  // Find all escrow payments with pagination (admin function)
  async findAll(limitCount = 50, lastDoc = null) {
    try {
      let q = query(
        this.escrowRef,
        orderBy('createdAt', 'desc'),
        limit(limitCount)
      );

      if (lastDoc) {
        q = query(q, startAfter(lastDoc));
      }

      const querySnapshot = await getDocs(q);
      return querySnapshot.docs.map(doc => this.formatEscrowDates(doc.data()));
    } catch (error) {
      throw new Error(`Error finding all escrow payments: ${error.message}`);
    }
  }

  // Update escrow payment status
  async updateStatus(escrowId, newStatus, updateData = {}) {
    try {
      const updatePayload = {
        status: newStatus,
        updatedAt: new Date(),
        ...updateData
      };

      // Add specific timestamp fields based on status
      if (newStatus === 'released') {
        updatePayload.releasedAt = new Date();
      } else if (newStatus === 'refunded') {
        updatePayload.refundedAt = new Date();
      } else if (newStatus === 'disputed') {
        updatePayload.disputeStartedAt = new Date();
      } else if (newStatus === 'dispute_resolved') {
        updatePayload.disputeResolvedAt = new Date();
      }

      await updateDoc(doc(db, this.collectionName, escrowId), updatePayload);
      return await this.findById(escrowId);
    } catch (error) {
      throw new Error(`Error updating escrow status: ${error.message}`);
    }
  }

  // Update escrow payment
  async updateById(escrowId, updateData) {
    try {
      const updatePayload = {
        ...updateData,
        updatedAt: new Date()
      };

      await updateDoc(doc(db, this.collectionName, escrowId), updatePayload);
      return await this.findById(escrowId);
    } catch (error) {
      throw new Error(`Error updating escrow payment: ${error.message}`);
    }
  }

  // Release payment to provider
  async releasePayment(escrowId, releaseData = {}) {
    try {
      return this.updateStatus(escrowId, 'released', {
        ...releaseData,
        platformFee: releaseData.platformFee || 0,
        providerAmount: releaseData.providerAmount || 0
      });
    } catch (error) {
      throw new Error(`Error releasing payment: ${error.message}`);
    }
  }

  // Refund payment to client
  async refundPayment(escrowId, refundReason = '') {
    try {
      return this.updateStatus(escrowId, 'refunded', {
        refundReason
      });
    } catch (error) {
      throw new Error(`Error refunding payment: ${error.message}`);
    }
  }

  // Start dispute
  async startDispute(escrowId, disputeData) {
    try {
      return this.updateStatus(escrowId, 'disputed', {
        disputeReason: disputeData.reason,
        disputeInitiator: disputeData.initiator, // 'client' or 'provider'
        disputeDescription: disputeData.description,
        disputeEvidence: disputeData.evidence || []
      });
    } catch (error) {
      throw new Error(`Error starting dispute: ${error.message}`);
    }
  }

  // Resolve dispute
  async resolveDispute(escrowId, resolutionData) {
    try {
      return this.updateStatus(escrowId, 'dispute_resolved', {
        resolutionDecision: resolutionData.decision, // 'release' or 'refund'
        resolutionReason: resolutionData.reason,
        resolvedBy: resolutionData.resolvedBy, // admin ID
        resolutionNotes: resolutionData.notes
      });
    } catch (error) {
      throw new Error(`Error resolving dispute: ${error.message}`);
    }
  }

  // Get payment statistics for provider
  async getProviderPaymentStats(providerId) {
    try {
      const payments = await this.findByProvider(providerId, 1000);
      
      const stats = {
        total: payments.length,
        pending: 0,
        released: 0,
        disputed: 0,
        refunded: 0,
        totalAmount: 0,
        releasedAmount: 0,
        pendingAmount: 0
      };

      payments.forEach(payment => {
        stats[payment.status] = (stats[payment.status] || 0) + 1;
        stats.totalAmount += payment.amount || 0;
        
        if (payment.status === 'released') {
          stats.releasedAmount += payment.providerAmount || payment.amount || 0;
        } else if (payment.status === 'pending') {
          stats.pendingAmount += payment.amount || 0;
        }
      });

      return stats;
    } catch (error) {
      throw new Error(`Error getting provider payment stats: ${error.message}`);
    }
  }

  // Get payment statistics for client
  async getClientPaymentStats(clientId) {
    try {
      const payments = await this.findByClient(clientId, 1000);
      
      const stats = {
        total: payments.length,
        pending: 0,
        released: 0,
        disputed: 0,
        refunded: 0,
        totalSpent: 0,
        totalRefunded: 0
      };

      payments.forEach(payment => {
        stats[payment.status] = (stats[payment.status] || 0) + 1;
        
        if (payment.status === 'released') {
          stats.totalSpent += payment.amount || 0;
        } else if (payment.status === 'refunded') {
          stats.totalRefunded += payment.amount || 0;
        }
      });

      return stats;
    } catch (error) {
      throw new Error(`Error getting client payment stats: ${error.message}`);
    }
  }

  // Get pending payments requiring action
  async getPendingPayments(limitCount = 50) {
    try {
      return this.findByStatus('pending', limitCount);
    } catch (error) {
      throw new Error(`Error getting pending payments: ${error.message}`);
    }
  }

  // Get disputed payments (admin function)
  async getDisputedPayments(limitCount = 50) {
    try {
      return this.findByStatus('disputed', limitCount);
    } catch (error) {
      throw new Error(`Error getting disputed payments: ${error.message}`);
    }
  }

  // Add payment evidence/notes
  async addEvidence(escrowId, evidence) {
    try {
      const escrow = await this.findById(escrowId);
      if (!escrow) {
        throw new Error('Escrow payment not found');
      }

      const currentEvidence = escrow.disputeEvidence || [];
      const updatedEvidence = [...currentEvidence, {
        ...evidence,
        addedAt: new Date(),
        id: Date.now().toString()
      }];

      await updateDoc(doc(db, this.collectionName, escrowId), {
        disputeEvidence: updatedEvidence,
        updatedAt: new Date()
      });

      return await this.findById(escrowId);
    } catch (error) {
      throw new Error(`Error adding evidence: ${error.message}`);
    }
  }

  // Delete escrow payment (admin only - soft delete)
  async deleteById(escrowId) {
    try {
      await updateDoc(doc(db, this.collectionName, escrowId), {
        status: 'deleted',
        deletedAt: new Date(),
        updatedAt: new Date()
      });
      return { message: 'Escrow payment deleted successfully' };
    } catch (error) {
      throw new Error(`Error deleting escrow payment: ${error.message}`);
    }
  }

  // Helper method to format dates from Firestore Timestamps
  formatEscrowDates(escrow) {
    if (!escrow) return escrow;

    const formatDate = (date) => {
      if (!date) return null;
      if (date.toDate) return date.toDate(); // Firestore Timestamp
      if (date instanceof Date) return date;
      return new Date(date);
    };

    return {
      ...escrow,
      createdAt: formatDate(escrow.createdAt),
      updatedAt: formatDate(escrow.updatedAt),
      releasedAt: formatDate(escrow.releasedAt),
      refundedAt: formatDate(escrow.refundedAt),
      disputeStartedAt: formatDate(escrow.disputeStartedAt),
      disputeResolvedAt: formatDate(escrow.disputeResolvedAt),
      deletedAt: formatDate(escrow.deletedAt),
      // Format evidence dates
      disputeEvidence: escrow.disputeEvidence?.map(evidence => ({
        ...evidence,
        addedAt: formatDate(evidence.addedAt)
      })) || []
    };
  }
}

module.exports = new EscrowPaymentService();