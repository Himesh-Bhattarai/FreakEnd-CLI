const mongoose = require('mongoose');
const { toJSON } = require('./plugins');

const userSchema = mongoose.Schema(
  {
    email: {
      type: String,
      unique: true,
      trim: true,
      lowercase: true,
      validate: {
        validator: function (email) {
          const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
          return emailRegex.test(email);
        },
        message: 'Invalid email format'
      }
    },
    isEmailVerified: {
      type: Boolean,
      default: false
    },
    password: {
      type: String,
      private: true,
      minlength: 8,
      validate: {
        validator: function (password) {
          return /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/.test(password);
        },
        message: 'Password must contain at least one uppercase, one lowercase, one number and one special character'
      }
    }
  },
  {
    timestamps: true,
    discriminatorKey: 'userType'
  }
);

userSchema.plugin(toJSON);

const User = mongoose.model('User', userSchema);

module.exports = User;