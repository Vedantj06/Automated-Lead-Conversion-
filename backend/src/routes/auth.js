const express = require('express');
const AuthService = require('../services/authService');
const { validate, authSchemas } = require('../middleware/validation');
const { authRateLimiter } = require('../middleware/rateLimiter');
const { authenticateToken, optionalAuth } = require('../middleware/auth');

const router = express.Router();

/**
 * @route   POST /api/auth/send-otp
 * @desc    Send OTP to user's email
 * @access  Public
 */
router.post('/send-otp', 
  authRateLimiter,
  validate(authSchemas.sendOTP),
  async (req, res, next) => {
    try {
      const { email } = req.body;
      
      const result = await AuthService.sendOTP(email);
      
      res.status(200).json(result);
    } catch (error) {
      next(error);
    }
  }
);

/**
 * @route   POST /api/auth/verify-otp
 * @desc    Verify OTP and authenticate user
 * @access  Public
 */
router.post('/verify-otp',
  authRateLimiter,
  validate(authSchemas.verifyOTP),
  async (req, res, next) => {
    try {
      const { email, otp } = req.body;
      
      const result = await AuthService.verifyOTP(email, otp);
      
      res.status(200).json(result);
    } catch (error) {
      next(error);
    }
  }
);

/**
 * @route   POST /api/auth/logout
 * @desc    Logout user
 * @access  Private
 */
router.post('/logout',
  authenticateToken,
  async (req, res, next) => {
    try {
      const result = await AuthService.logout(req.user._uid);
      
      res.status(200).json(result);
    } catch (error) {
      next(error);
    }
  }
);

/**
 * @route   POST /api/auth/refresh
 * @desc    Refresh JWT token
 * @access  Private
 */
router.post('/refresh',
  async (req, res, next) => {
    try {
      const authHeader = req.headers.authorization;
      const token = authHeader && authHeader.split(' ')[1];
      
      if (!token) {
        return res.status(401).json({
          success: false,
          message: 'Refresh token required'
        });
      }
      
      const result = await AuthService.refreshToken(token);
      
      res.status(200).json(result);
    } catch (error) {
      next(error);
    }
  }
);

/**
 * @route   GET /api/auth/profile
 * @desc    Get current user profile
 * @access  Private
 */
router.get('/profile',
  authenticateToken,
  async (req, res, next) => {
    try {
      const result = await AuthService.getUserProfile(req.user._uid);
      
      res.status(200).json(result);
    } catch (error) {
      next(error);
    }
  }
);

/**
 * @route   PUT /api/auth/profile
 * @desc    Update user profile
 * @access  Private
 */
router.put('/profile',
  authenticateToken,
  async (req, res, next) => {
    try {
      const { name, phone, preferences } = req.body;
      
      const updates = {};
      if (name !== undefined) updates.name = name;
      if (phone !== undefined) updates.phone = phone;
      if (preferences !== undefined) updates.preferences = preferences;
      
      const result = await AuthService.updateUserProfile(req.user._uid, updates);
      
      res.status(200).json(result);
    } catch (error) {
      next(error);
    }
  }
);

/**
 * @route   GET /api/auth/users
 * @desc    Get all users (admin only)
 * @access  Private (Admin)
 */
router.get('/users',
  authenticateToken,
  async (req, res, next) => {
    try {
      // Check if user is admin
      if (req.user.role !== 'admin') {
        return res.status(403).json({
          success: false,
          message: 'Admin access required'
        });
      }
      
      const result = await AuthService.getAllUsers();
      
      res.status(200).json(result);
    } catch (error) {
      next(error);
    }
  }
);

/**
 * @route   GET /api/auth/verify-token
 * @desc    Verify if current token is valid
 * @access  Private
 */
router.get('/verify-token',
  authenticateToken,
  async (req, res, next) => {
    try {
      res.status(200).json({
        success: true,
        message: 'Token is valid',
        user: {
          _uid: req.user._uid,
          _id: req.user._id,
          email: req.user.email,
          role: req.user.role
        }
      });
    } catch (error) {
      next(error);
    }
  }
);

module.exports = router;