const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const { v4: uuidv4 } = require('uuid');
const emailService = require('../utils/emailService');
const { ApiError } = require('../utils/ApiError');

/**
 * In-memory storage for OTP codes and users
 * In production, use Redis or database
 */
const otpStorage = new Map();
const userStorage = new Map();

/**
 * Authentication service
 */
class AuthService {
  /**
   * Generate and send OTP to email
   */
  static async sendOTP(email) {
    try {
      // Generate 6-digit OTP
      const otp = Math.floor(100000 + Math.random() * 900000).toString();
      
      // Store OTP with expiration (10 minutes)
      const otpData = {
        otp,
        email,
        createdAt: new Date(),
        expiresAt: new Date(Date.now() + 10 * 60 * 1000), // 10 minutes
        attempts: 0
      };
      
      otpStorage.set(email, otpData);
      
      // Get existing user name if available
      const existingUser = userStorage.get(email);
      const name = existingUser ? existingUser.name : null;
      
      // Send OTP email
      await emailService.sendOTPEmail(email, otp, name);
      
      console.log(`📧 OTP sent to ${email}: ${otp} (Dev mode)`);
      
      return {
        success: true,
        message: 'Verification code sent to your email'
      };
    } catch (error) {
      console.error('Send OTP error:', error);
      throw new ApiError(500, 'Failed to send verification code. Please try again.');
    }
  }

  /**
   * Verify OTP and authenticate user
   */
  static async verifyOTP(email, otp) {
    try {
      const otpData = otpStorage.get(email);
      
      if (!otpData) {
        throw new ApiError(400, 'No verification code found. Please request a new one.');
      }
      
      // Check if OTP has expired
      if (new Date() > otpData.expiresAt) {
        otpStorage.delete(email);
        throw new ApiError(400, 'Verification code has expired. Please request a new one.');
      }
      
      // Check attempts limit
      if (otpData.attempts >= 3) {
        otpStorage.delete(email);
        throw new ApiError(400, 'Too many invalid attempts. Please request a new verification code.');
      }
      
      // Verify OTP
      if (otpData.otp !== otp) {
        otpData.attempts += 1;
        otpStorage.set(email, otpData);
        throw new ApiError(400, `Invalid verification code. ${3 - otpData.attempts} attempts remaining.`);
      }
      
      // OTP is valid, create/update user
      let user = userStorage.get(email);
      
      if (!user) {
        // Create new user
        user = {
          _uid: uuidv4(),
          _id: `user_${Date.now()}`,
          email,
          name: email.split('@')[0], // Default name from email
          role: 'user',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        };
        userStorage.set(email, user);
      } else {
        // Update existing user
        user.updatedAt = new Date().toISOString();
        userStorage.set(email, user);
      }
      
      // Clean up OTP
      otpStorage.delete(email);
      
      // Generate JWT token
      const token = jwt.sign(
        {
          _uid: user._uid,
          _id: user._id,
          email: user.email,
          role: user.role
        },
        process.env.JWT_SECRET,
        { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
      );
      
      console.log(`✅ User authenticated: ${email}`);
      
      return {
        success: true,
        message: 'Authentication successful',
        token,
        user
      };
    } catch (error) {
      if (error instanceof ApiError) {
        throw error;
      }
      console.error('Verify OTP error:', error);
      throw new ApiError(500, 'Authentication failed. Please try again.');
    }
  }

  /**
   * Logout user (invalidate token)
   */
  static async logout(userId) {
    try {
      // In production, you'd invalidate the token in a blacklist or database
      console.log(`👋 User logged out: ${userId}`);
      
      return {
        success: true,
        message: 'Logged out successfully'
      };
    } catch (error) {
      console.error('Logout error:', error);
      throw new ApiError(500, 'Logout failed. Please try again.');
    }
  }

  /**
   * Get user profile
   */
  static async getUserProfile(userId) {
    try {
      // Find user by ID
      const user = Array.from(userStorage.values()).find(u => u._uid === userId);
      
      if (!user) {
        throw new ApiError(404, 'User not found');
      }
      
      return {
        success: true,
        user
      };
    } catch (error) {
      if (error instanceof ApiError) {
        throw error;
      }
      console.error('Get user profile error:', error);
      throw new ApiError(500, 'Failed to retrieve user profile');
    }
  }

  /**
   * Update user profile
   */
  static async updateUserProfile(userId, updates) {
    try {
      // Find user by ID
      const userEntry = Array.from(userStorage.entries()).find(([email, user]) => user._uid === userId);
      
      if (!userEntry) {
        throw new ApiError(404, 'User not found');
      }
      
      const [email, user] = userEntry;
      
      // Update user data
      const updatedUser = {
        ...user,
        ...updates,
        updatedAt: new Date().toISOString()
      };
      
      userStorage.set(email, updatedUser);
      
      return {
        success: true,
        user: updatedUser,
        message: 'Profile updated successfully'
      };
    } catch (error) {
      if (error instanceof ApiError) {
        throw error;
      }
      console.error('Update user profile error:', error);
      throw new ApiError(500, 'Failed to update user profile');
    }
  }

  /**
   * Refresh JWT token
   */
  static async refreshToken(currentToken) {
    try {
      // Verify current token
      const decoded = jwt.verify(currentToken, process.env.JWT_SECRET);
      
      // Find user
      const user = Array.from(userStorage.values()).find(u => u._uid === decoded._uid);
      
      if (!user) {
        throw new ApiError(404, 'User not found');
      }
      
      // Generate new token
      const token = jwt.sign(
        {
          _uid: user._uid,
          _id: user._id,
          email: user.email,
          role: user.role
        },
        process.env.JWT_SECRET,
        { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
      );
      
      return {
        success: true,
        token,
        user
      };
    } catch (error) {
      if (error.name === 'JsonWebTokenError' || error.name === 'TokenExpiredError') {
        throw new ApiError(401, 'Invalid or expired token');
      }
      console.error('Refresh token error:', error);
      throw new ApiError(500, 'Token refresh failed');
    }
  }

  /**
   * Get all users (admin only)
   */
  static async getAllUsers() {
    try {
      const users = Array.from(userStorage.values());
      
      return {
        success: true,
        users,
        count: users.length
      };
    } catch (error) {
      console.error('Get all users error:', error);
      throw new ApiError(500, 'Failed to retrieve users');
    }
  }

  /**
   * Clear expired OTPs (cleanup function)
   */
  static cleanupExpiredOTPs() {
    const now = new Date();
    for (const [email, otpData] of otpStorage.entries()) {
      if (now > otpData.expiresAt) {
        otpStorage.delete(email);
        console.log(`🧹 Cleaned up expired OTP for ${email}`);
      }
    }
  }
}

// Run cleanup every 5 minutes
setInterval(() => {
  AuthService.cleanupExpiredOTPs();
}, 5 * 60 * 1000);

module.exports = AuthService;