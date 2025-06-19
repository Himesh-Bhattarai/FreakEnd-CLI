const httpStatus = require('http-status');
const { 
  smsOtpService, 
  emailOtpService,
  totpService
} = require('../services/otp.service');
const { smsService, emailService } = require('../services');
const { User } = require('../models');
const ApiError = require('../utils/ApiError');
const catchAsync = require('../utils/catchAsync');
const logger = require('../utils/logger');

const sendOtp = catchAsync(async (req, res) => {
  const { identifier, type } = req.body;
  
  let otpService;
  switch (type) {
    case 'sms':
      otpService = smsOtpService;
      break;
    case 'email':
      otpService = emailOtpService;
      break;
    default:
      throw new ApiError(httpStatus.BAD_REQUEST, 'Invalid OTP type');
  }

  const { code, expiresAt } = await otpService.generate(identifier, {
    ip: req.ip,
    userAgent: req.headers['user-agent']
  });

  // Send OTP via appropriate channel
  if (type === 'sms') {
    await smsService.sendOtp(identifier, code);
  } else if (type === 'email') {
    await emailService.sendOtp(identifier, code);
  }

  res.status(httpStatus.OK).json({
    success: true,
    expiresAt
  });
});

const verifyOtp = catchAsync(async (req, res) => {
  const { identifier, code, type } = req.body;
  
  let otpService;
  switch (type) {
    case 'sms':
      otpService = smsOtpService;
      break;
    case 'email':
      otpService = emailOtpService;
      break;
    default:
      throw new ApiError(httpStatus.BAD_REQUEST, 'Invalid OTP type');
  }

  await otpService.verify(identifier, code);

  // Find user by identifier
  const user = await User.findOne({
    $or: [
      { email: identifier },
      { phone: identifier }
    ]
  });

  if (!user) {
    throw new ApiError(httpStatus.NOT_FOUND, 'User not found');
  }

  // Generate auth tokens
  const tokens = await tokenService.generateAuthTokens(user);

  res.status(httpStatus.OK).json({
    user,
    tokens
  });
});

const setup2fa = catchAsync(async (req, res) => {
  const { method } = req.body;
  const user = req.user;

  if (user.twoFactorAuth.enabled) {
    throw new ApiError(httpStatus.BAD_REQUEST, '2FA already enabled');
  }

  let secret, qrCode;
  if (method === 'authenticator') {
    const totpSecret = totpService.generateSecret();
    secret = totpSecret.base32;
    qrCode = await totpService.generateQRCode(totpSecret, user.email);
  }

  const backupCodes = totpService.generateBackupCodes();

  res.status(httpStatus.OK).json({
    secret,
    qrCode,
    backupCodes,
    method
  });
});

const enable2fa = catchAsync(async (req, res) => {
  const { code, method, secret, backupCodes } = req.body;
  const user = req.user;

  if (user.twoFactorAuth.enabled) {
    throw new ApiError(httpStatus.BAD_REQUEST, '2FA already enabled');
  }

  if (method === 'authenticator') {
    if (!totpService.verifyToken(secret, code)) {
      throw new ApiError(httpStatus.BAD_REQUEST, 'Invalid verification code');
    }
  } else {
    // Verify SMS or email OTP
    const otpService = method === 'sms' ? smsOtpService : emailOtpService;
    const identifier = method === 'sms' ? user.phone : user.email;
    
    if (!identifier) {
      throw new ApiError(httpStatus.BAD_REQUEST, `User ${method} not set`);
    }

    await otpService.verify(identifier, code);
  }

  // Enable 2FA
  user.twoFactorAuth = {
    enabled: true,
    method,
    secret: method === 'authenticator' ? secret : null,
    backupCodes
  };

  await user.save();

  res.status(httpStatus.OK).json({
    success: true
  });
});

const verify2fa = catchAsync(async (req, res) => {
  const { code } = req.body;
  const user = req.user;

  if (!user.twoFactorAuth.enabled) {
    throw new ApiError(httpStatus.BAD_REQUEST, '2FA not enabled');
  }

  let isValid = false;
  
  // Check backup codes first
  if (user.twoFactorAuth.backupCodes.includes(code)) {
    isValid = true;
    // Remove used backup code
    user.twoFactorAuth.backupCodes = user.twoFactorAuth.backupCodes.filter(c => c !== code);
    await user.save();
  } 
  // Check TOTP if authenticator method
  else if (user.twoFactorAuth.method === 'authenticator') {
    isValid = totpService.verifyToken(user.twoFactorAuth.secret, code);
  }
  // Otherwise verify via SMS/email OTP
  else {
    const otpService = user.twoFactorAuth.method === 'sms' ? smsOtpService : emailOtpService;
    const identifier = user.twoFactorAuth.method === 'sms' ? user.phone : user.email;
    isValid = await otpService.verify(identifier, code);
  }

  if (!isValid) {
    throw new ApiError(httpStatus.BAD_REQUEST, 'Invalid verification code');
  }

  // Generate final auth tokens
  const tokens = await tokenService.generateAuthTokens(user);

  res.status(httpStatus.OK).json({
    user,
    tokens
  });
});

module.exports = {
  sendOtp,
  verifyOtp,
  setup2fa,
  enable2fa,
  verify2fa
};