// Add to existing User model
userSchema.add({
  twoFactorAuth: {
    enabled: {
      type: Boolean,
      default: false
    },
    method: {
      type: String,
      enum: ['sms', 'email', 'authenticator'],
      default: 'sms'
    },
    secret: {
      type: String,
      private: true
    },
    backupCodes: {
      type: [String],
      private: true
    }
  },
  phone: {
    type: String,
    validate: {
      validator: function(v) {
        return /\+\d{1,3}\d{6,14}/.test(v);
      },
      message: props => `${props.value} is not a valid phone number!`
    }
  }
});