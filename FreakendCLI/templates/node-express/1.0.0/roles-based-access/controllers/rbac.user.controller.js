const User = require('../models/User.model');
const AppError = require('../utils/errorHandler');
const { generateToken } = require('../config/auth.config');
const { ROLES } = require('../config/roles.config');

// Example controller methods with RBAC checks
exports.getUserProfile = async (req, res, next) => {
  try {
    let user;
    
    // Admins can view any profile, users can only view their own
    if (req.user.role === ROLES.ADMIN || req.user.role === ROLES.SUPER_ADMIN) {
      user = await User.findById(req.params.id);
    } else {
      user = await User.findById(req.user.id);
    }

    if (!user) {
      return next(new AppError('No user found with that ID', 404));
    }

    res.status(200).json({
      status: 'success',
      data: {
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          role: user.role
        }
      }
    });
  } catch (error) {
    next(error);
  }
};

exports.updateUserProfile = async (req, res, next) => {
  try {
    // Users can only update their own profile unless they're admin
    if (req.user.role !== ROLES.ADMIN && req.user.role !== ROLES.SUPER_ADMIN && req.user.id !== req.params.id) {
      return next(new AppError('You can only update your own profile', 403));
    }

    const updatedUser = await User.findByIdAndUpdate(
      req.params.id,
      req.body,
      {
        new: true,
        runValidators: true
      }
    );

    if (!updatedUser) {
      return next(new AppError('No user found with that ID', 404));
    }

    res.status(200).json({
      status: 'success',
      data: {
        user: updatedUser
      }
    });
  } catch (error) {
    next(error);
  }
};

// Admin-only methods would be in admin.controller.js