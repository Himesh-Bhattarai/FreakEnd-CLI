// templates/node-express/1.0.0/graphql/services/authService.js
const jwt = require('jsonwebtoken');
const { AuthenticationError, UserInputError } = require('apollo-server-express');
const User = require('../../models/User');

class AuthService {
  /**
   * Generate JWT token
   * @param {Object} payload - Token payload
   * @returns {String} JWT token
   */
  generateToken(payload) {
    return jwt.sign(
      payload,
      process.env.JWT_SECRET || 'your-secret-key',
      {
        expiresIn: process.env.JWT_EXPIRES_IN || '7d',
        issuer: process.env.JWT_ISSUER || 'freakend-app',
        audience: process.env.JWT_AUDIENCE || 'freakend-users'
      }
    );
  }

  /**
   * Verify JWT token
   * @param {String} token - JWT token
   * @returns {Object} Decoded token payload
   */
  verifyToken(token) {
    try {
      return jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key');
    } catch (error) {
      throw new AuthenticationError('Invalid or expired token');
    }
  }

  /**
   * Extract token from request headers
   * @param {Object} req - Express request object
   * @returns {String|null} JWT token or null
   */
  extractTokenFromHeader(req) {
    const authHeader = req.headers.authorization;
    
    if (!authHeader) return null;
    
    const parts = authHeader.split(' ');
    if (parts.length !== 2 || parts[0] !== 'Bearer') {
      return null;
    }
    
    return parts[1];
  }

  /**
   * Get current user from request
   * @param {Object} req - Express request object
   * @returns {Object|null} User object or null
   */
  async getCurrentUser(req) {
    try {
      const token = this.extractTokenFromHeader(req);
      
      if (!token) return null;
      
      const decoded = this.verifyToken(token);
      const user = await User.findById(decoded.userId).select('-password');
      
      if (!user || !user.isActive) {
        return null;
      }
      
      return user;
    } catch (error) {
      return null;
    }
  }

  /**
   * Register a new user
   * @param {Object} input - User registration data
   * @returns {Object} Authentication response
   */
  async register(input) {
    try {
      const { username, email, password, firstName, lastName, bio } = input;

      // Check if user already exists
      const existingUser = await User.findOne({
        $or: [{ email }, { username }]
      });

      if (existingUser) {
        if (existingUser.email === email) {
          throw new UserInputError('Email already registered');
        }
        if (existingUser.username === username) {
          throw new UserInputError('Username already taken');
        }
      }

      // Create new user
      const user = new User({
        username,
        email,
        password,
        firstName,
        lastName,
        bio
      });

      await user.save();

      // Generate token
      const token = this.generateToken({
        userId: user._id,
        username: user.username,
        email: user.email,
        role: user.role
      });

      return {
        token,
        user,
        expiresIn: process.env.JWT_EXPIRES_IN || '7d'
      };
    } catch (error) {
      if (error.code === 11000) {
        // Handle duplicate key error
        const field = Object.keys(error.keyPattern)[0];
        throw new UserInputError(`${field.charAt(0).toUpperCase() + field.slice(1)} already exists`);
      }
      throw error;
    }
  }

  /**
   * Login user
   * @param {String} email - User email
   * @param {String} password - User password
   * @returns {Object} Authentication response
   */
  async login(email, password) {
    try {
      if (!email || !password) {
        throw new UserInputError('Email and password are required');
      }

      // Find user by credentials
      const user = await User.findByCredentials(email, password);

      if (!user.isActive) {
        throw new AuthenticationError('Account is deactivated');
      }

      // Generate token
      const token = this.generateToken({
        userId: user._id,
        username: user.username,
        email: user.email,
        role: user.role
      });

      return {
        token,
        user,
        expiresIn: process.env.JWT_EXPIRES_IN || '7d'
      };
    } catch (error) {
      throw new AuthenticationError(error.message || 'Login failed');
    }
  }

  /**
   * Refresh token
   * @param {String} refreshToken - Refresh token
   * @returns {Object} New authentication response
   */
  async refreshToken(refreshToken) {
    try {
      const decoded = this.verifyToken(refreshToken);
      const user = await User.findById(decoded.userId);

      if (!user || !user.isActive) {
        throw new AuthenticationError('Invalid refresh token');
      }

      const token = this.generateToken({
        userId: user._id,
        username: user.username,
        email: user.email,
        role: user.role
      });

      return {
        token,
        user,
        expiresIn: process.env.JWT_EXPIRES_IN || '7d'
      };
    } catch (error) {
      throw new AuthenticationError('Invalid refresh token');
    }
  }

  /**
   * Logout user (invalidate token)
   * Note: For stateless JWT, we can't truly invalidate tokens
   * This is a placeholder for token blacklisting if implemented
   * @param {String} token - JWT token to invalidate
   * @returns {Boolean} Success status
   */
  async logout(token) {
    // In a production app, you might want to:
    // 1. Add token to a blacklist stored in Redis
    // 2. Use shorter token expiry times
    // 3. Implement token rotation
    
    // For now, just return success
    // The client should delete the token from storage
    return { success: true, message: 'Logged out successfully' };
  }

  /**
   * Change user password
   * @param {String} userId - User ID
   * @param {String} currentPassword - Current password
   * @param {String} newPassword - New password
   * @returns {Boolean} Success status
   */
  async changePassword(userId, currentPassword, newPassword) {
    try {
      const user = await User.findById(userId).select('+password');
      
      if (!user) {
        throw new UserInputError('User not found');
      }

      // Verify current password
      const isCurrentPasswordValid = await user.comparePassword(currentPassword);
      if (!isCurrentPasswordValid) {
        throw new AuthenticationError('Current password is incorrect');
      }

      // Validate new password
      if (newPassword.length < 6) {
        throw new UserInputError('New password must be at least 6 characters long');
      }

      // Update password
      user.password = newPassword;
      await user.save();

      return { success: true, message: 'Password changed successfully' };
    } catch (error) {
      throw error;
    }
  }

  /**
   * Request password reset
   * @param {String} email - User email
   * @returns {Boolean} Success status
   */
  async requestPasswordReset(email) {
    try {
      const user = await User.findOne({ email });
      
      if (!user) {
        // Don't reveal if email exists for security
        return { success: true, message: 'If the email exists, a reset link has been sent' };
      }

      // Generate reset token (in production, send via email)
      const resetToken = this.generateToken(
        { userId: user._id, type: 'password-reset' },
        '1h' // 1 hour expiry
      );

      user.passwordResetToken = resetToken;
      user.passwordResetExpires = new Date(Date.now() + 60 * 60 * 1000); // 1 hour
      await user.save();

      // In production, send email with reset link
      console.log(`Password reset token for ${email}: ${resetToken}`);

      return { success: true, message: 'Password reset instructions sent to email' };
    } catch (error) {
      throw error;
    }
  }

  /**
   * Reset password with token
   * @param {String} resetToken - Password reset token
   * @param {String} newPassword - New password
   * @returns {Boolean} Success status
   */
  async resetPassword(resetToken, newPassword) {
    try {
      const decoded = this.verifyToken(resetToken);
      
      if (decoded.type !== 'password-reset') {
        throw new AuthenticationError('Invalid reset token');
      }

      const user = await User.findOne({
        _id: decoded.userId,
        passwordResetToken: resetToken,
        passwordResetExpires: { $gt: new Date() }
      });

      if (!user) {
        throw new AuthenticationError('Invalid or expired reset token');
      }

      // Validate new password
      if (newPassword.length < 6) {
        throw new UserInputError('Password must be at least 6 characters long');
      }

      // Update password and clear reset token
      user.password = newPassword;
      user.passwordResetToken = undefined;
      user.passwordResetExpires = undefined;
      await user.save();

      return { success: true, message: 'Password reset successfully' };
    } catch (error) {
      throw error;
    }
  }

  /**
   * Verify user account with email token
   * @param {String} verificationToken - Email verification token
   * @returns {Boolean} Success status
   */
  async verifyEmail(verificationToken) {
    try {
      const decoded = this.verifyToken(verificationToken);
      
      if (decoded.type !== 'email-verification') {
        throw new AuthenticationError('Invalid verification token');
      }

      const user = await User.findOne({
        _id: decoded.userId,
        emailVerificationToken: verificationToken
      });

      if (!user) {
        throw new AuthenticationError('Invalid verification token');
      }

      user.isEmailVerified = true;
      user.emailVerificationToken = undefined;
      await user.save();

      return { success: true, message: 'Email verified successfully' };
    } catch (error) {
      throw error;
    }
  }
}

module.exports = new AuthService();