// Firestore User service to replace Mongoose User model
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
  limit 
} = require('firebase/firestore');
const bcrypt = require('bcryptjs');
const crypto = require('crypto');

class UserService {
  constructor() {
    this.collectionName = 'users';
    this.usersRef = collection(db, this.collectionName);
  }

  // Create a new user
  async create(userData) {
    try {
      // Hash password before saving (only if not already hashed)
      if (userData.password && !userData.password.startsWith('$2a$')) {
        const salt = await bcrypt.genSalt(12);
        userData.password = await bcrypt.hash(userData.password, salt);
      }

      // Use provided ID or generate new one
      const userDoc = userData.id ? doc(db, this.collectionName, userData.id) : doc(this.usersRef);
      const userWithId = {
        ...userData,
        id: userData.id || userDoc.id,
        createdAt: new Date(),
        updatedAt: new Date()
      };

      await setDoc(userDoc, userWithId);
      
      // Return user without password
      const { password, ...userWithoutPassword } = userWithId;
      return userWithoutPassword;
    } catch (error) {
      throw new Error(`Error creating user: ${error.message}`);
    }
  }

  // Find user by ID
  async findById(userId) {
    try {
      const userDoc = await getDoc(doc(db, this.collectionName, userId));
      if (!userDoc.exists()) {
        return null;
      }
      const userData = userDoc.data();
      const { password, ...userWithoutPassword } = userData;
      return userWithoutPassword;
    } catch (error) {
      throw new Error(`Error finding user: ${error.message}`);
    }
  }

  // Find user by email
  async findByEmail(email) {
    try {
      const q = query(this.usersRef, where('email', '==', email.toLowerCase()));
      const querySnapshot = await getDocs(q);
      
      if (querySnapshot.empty) {
        return null;
      }
      
      return querySnapshot.docs[0].data();
    } catch (error) {
      throw new Error(`Error finding user by email: ${error.message}`);
    }
  }

  // Find user by email with password (for authentication)
  async findByEmailWithPassword(email) {
    try {
      const q = query(this.usersRef, where('email', '==', email.toLowerCase()));
      const querySnapshot = await getDocs(q);
      
      if (querySnapshot.empty) {
        return null;
      }
      
      return querySnapshot.docs[0].data();
    } catch (error) {
      throw new Error(`Error finding user by email: ${error.message}`);
    }
  }

  // Update user
  async updateById(userId, updateData) {
    try {
      // Hash password if being updated
      if (updateData.password) {
        const salt = await bcrypt.genSalt(12);
        updateData.password = await bcrypt.hash(updateData.password, salt);
      }

      updateData.updatedAt = new Date();
      
      const userDocRef = doc(db, this.collectionName, userId);
      await updateDoc(userDocRef, updateData);
      
      // Return updated user without password
      const updatedUser = await this.findById(userId);
      return updatedUser;
    } catch (error) {
      throw new Error(`Error updating user: ${error.message}`);
    }
  }

  // Delete user
  async deleteById(userId) {
    try {
      await deleteDoc(doc(db, this.collectionName, userId));
      return { message: 'User deleted successfully' };
    } catch (error) {
      throw new Error(`Error deleting user: ${error.message}`);
    }
  }

  // Find all users with pagination
  async findAll(limitCount = 50) {
    try {
      const q = query(this.usersRef, orderBy('createdAt', 'desc'), limit(limitCount));
      const querySnapshot = await getDocs(q);
      
      return querySnapshot.docs.map(doc => {
        const userData = doc.data();
        const { password, ...userWithoutPassword } = userData;
        return userWithoutPassword;
      });
    } catch (error) {
      throw new Error(`Error finding users: ${error.message}`);
    }
  }

  // Find users by type
  async findByUserType(userType, limitCount = 50) {
    try {
      const q = query(
        this.usersRef, 
        where('userType', '==', userType),
        orderBy('createdAt', 'desc'),
        limit(limitCount)
      );
      const querySnapshot = await getDocs(q);
      
      return querySnapshot.docs.map(doc => {
        const userData = doc.data();
        const { password, ...userWithoutPassword } = userData;
        return userWithoutPassword;
      });
    } catch (error) {
      throw new Error(`Error finding users by type: ${error.message}`);
    }
  }

  // Compare password for authentication
  async comparePassword(plainPassword, hashedPassword) {
    return await bcrypt.compare(plainPassword, hashedPassword);
  }

  // Update verification status
  async updateVerificationStatus(userId, isVerified, verificationToken = null) {
    try {
      const updateData = {
        isEmailVerified: isVerified,
        updatedAt: new Date()
      };

      if (verificationToken === null) {
        updateData.emailVerificationToken = null;
        updateData.emailVerificationExpires = null;
      }

      await updateDoc(doc(db, this.collectionName, userId), updateData);
      return await this.findById(userId);
    } catch (error) {
      throw new Error(`Error updating verification status: ${error.message}`);
    }
  }

  // Update provider status
  async updateProviderStatus(userId, status) {
    try {
      await updateDoc(doc(db, this.collectionName, userId), {
        providerStatus: status,
        updatedAt: new Date()
      });
      return await this.findById(userId);
    } catch (error) {
      throw new Error(`Error updating provider status: ${error.message}`);
    }
  }

  // Generate email verification token
  async generateEmailVerificationToken(userId) {
    try {
      const resetToken = crypto.randomBytes(32).toString('hex');
      
      // Hash token and save to database
      const hashedToken = crypto
        .createHash('sha256')
        .update(resetToken)
        .digest('hex');

      const expireTime = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours

      await updateDoc(doc(db, this.collectionName, userId), {
        emailVerificationToken: hashedToken,
        emailVerificationExpires: expireTime,
        updatedAt: new Date()
      });

      // Return unhashed token to send via email
      return resetToken;
    } catch (error) {
      throw new Error(`Error generating email verification token: ${error.message}`);
    }
  }

  // Generate password reset token
  async generatePasswordResetToken(userId) {
    try {
      const resetToken = crypto.randomBytes(32).toString('hex');
      
      // Hash token and save to database
      const hashedToken = crypto
        .createHash('sha256')
        .update(resetToken)
        .digest('hex');

      const expireTime = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

      await updateDoc(doc(db, this.collectionName, userId), {
        passwordResetToken: hashedToken,
        passwordResetExpires: expireTime,
        updatedAt: new Date()
      });

      // Return unhashed token to send via email
      return resetToken;
    } catch (error) {
      throw new Error(`Error generating password reset token: ${error.message}`);
    }
  }

  // Verify email using token
  async verifyEmail(token) {
    try {
      // Hash the token to compare with stored version
      const hashedToken = crypto
        .createHash('sha256')
        .update(token)
        .digest('hex');

      // Find user with matching token (single field query to avoid index requirement)
      const q = query(
        this.usersRef,
        where('emailVerificationToken', '==', hashedToken)
      );
      const querySnapshot = await getDocs(q);

      if (querySnapshot.empty) {
        return null; // Invalid token
      }

      const userDoc = querySnapshot.docs[0];
      const userData = userDoc.data();
      
      // Check if token has expired (client-side check)
      if (userData.emailVerificationExpires && userData.emailVerificationExpires.toDate() < new Date()) {
        return null; // Expired token
      }

      const userId = userDoc.id;

      // Update user verification status
      await updateDoc(doc(db, this.collectionName, userId), {
        isEmailVerified: true,
        emailVerificationToken: null,
        emailVerificationExpires: null,
        updatedAt: new Date()
      });

      return await this.findById(userId);
    } catch (error) {
      throw new Error(`Error verifying email: ${error.message}`);
    }
  }

  // Reset password using token
  async resetPassword(token, newPassword) {
    try {
      // Hash the token to compare with stored version
      const hashedToken = crypto
        .createHash('sha256')
        .update(token)
        .digest('hex');

      // Find user with matching token that hasn't expired
      const q = query(
        this.usersRef,
        where('passwordResetToken', '==', hashedToken),
        where('passwordResetExpires', '>', new Date())
      );
      const querySnapshot = await getDocs(q);

      if (querySnapshot.empty) {
        return null; // Invalid or expired token
      }

      const userDoc = querySnapshot.docs[0];
      const userId = userDoc.id;

      // Hash new password
      const salt = await bcrypt.genSalt(12);
      const hashedPassword = await bcrypt.hash(newPassword, salt);

      // Update user password and clear reset token
      await updateDoc(doc(db, this.collectionName, userId), {
        password: hashedPassword,
        passwordResetToken: null,
        passwordResetExpires: null,
        updatedAt: new Date()
      });

      return await this.findById(userId);
    } catch (error) {
      throw new Error(`Error resetting password: ${error.message}`);
    }
  }

  // Update password (for authenticated users)
  async updatePassword(userId, newPassword) {
    try {
      const salt = await bcrypt.genSalt(12);
      const hashedPassword = await bcrypt.hash(newPassword, salt);

      await updateDoc(doc(db, this.collectionName, userId), {
        password: hashedPassword,
        updatedAt: new Date()
      });

      return await this.findById(userId);
    } catch (error) {
      throw new Error(`Error updating password: ${error.message}`);
    }
  }

  // Find users by role (replaces findByUserType for Firebase compatibility)
  async findByRole(role, limitCount = 50) {
    try {
      const q = query(
        this.usersRef, 
        where('role', '==', role),
        orderBy('createdAt', 'desc'),
        limit(limitCount)
      );
      const querySnapshot = await getDocs(q);
      
      return querySnapshot.docs.map(doc => {
        const userData = doc.data();
        const { password, ...userWithoutPassword } = userData;
        return userWithoutPassword;
      });
    } catch (error) {
      throw new Error(`Error finding users by role: ${error.message}`);
    }
  }
}

module.exports = new UserService();